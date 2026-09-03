# Publishes a machine-readable Markdown twin of every doc page into the
# generated site (mirroring the page's repo-relative path), e.g.
#
#   programming/cplusplus/xxx.md  ->  <dest>/programming/cplusplus/xxx.md
#
# The twin is meant for LLMs / AI crawlers that follow links, so instead of a
# plain `cp` the copy is processed:
#
#   1. Front matter is dropped and Liquid is expanded, exactly like the HTML
#      build does ({{ site.dcvb_cpp_api }}, {% include %}, ...). Otherwise the
#      published .md would still contain un-resolved {{ site.xxx }} tokens and
#      AIs could not resolve such links at all.
#
#   2. Internal links are rewritten to absolute URLs that point to the .md
#      twin of the target page instead of the .html page:
#
#        [CaptureState]({{ site.dcvb_cpp_api }}capture-vision-router/enum-capture-state.html?src=cpp&&lang=cpp)
#          -> [CaptureState](https://www.dynamsoft.com/capture-vision/docs/server/.../enum-capture-state.md)
#
#      Relative links (./x.md#anchor, ../x.html, ../../assets/... ) are
#      resolved against the directory where the .md twin is published
#      (i.e. the repo-relative directory below the docs root). A directory
#      link /.../dir/ is pointed to /.../dir/index.md when an index.md twin
#      exists. `?src=cpp&&lang=cpp` style query strings are dropped because
#      they only make sense for the interactive HTML pages.
#
#   3. Links inside fenced code blocks or inline code spans are left
#      untouched, as are anchors (#...), external hosts and non-doc URLs
#      (e.g. https://www.dynamsoft.com/blog/....html stays .html).
#
#   4. When a same-site target has no .md twin (e.g. the page is not part of
#      the published tree), the original HTML link is kept and a warning is
#      logged during the build so broken rewrites are visible.
#
# Behavior can be tuned per content repo via `copy_markdown:` in _config.yml:
#
#   copy_markdown:
#     enabled: true                      # master switch (default: true)
#     rewrite_links: true                # rewrite internal links (default: true)
#     strip_query: true                  # drop ?src=cpp&&lang=cpp params (default: true)
#     folder_to_index: true              # /dir/ -> /dir/index.md when a twin exists
#     rewrite_domains: [dynamsoft.com]   # hosts treated as internal docs
#     domain: https://www.dynamsoft.com  # prefix used to absolutize links
#
# A single page can opt out of publishing its .md twin with
# `copy_markdown: false` in its front matter.
require "set"
require "uri"

module Jekyll
  module CopyMarkdownFiles
    DEFAULT_CONFIG = {
      "enabled"         => true,
      "rewrite_links"   => true,
      "strip_query"     => true,
      "folder_to_index" => true,
      "rewrite_domains" => ["dynamsoft.com"],
      "domain"          => nil,
    }.freeze

    # Inline markdown link / image: ![alt](url "title")  or  [text](url).
    # URL may optionally be wrapped in angle brackets.
    INLINE_LINK_RE = /(!?\[[^\]\r\n]*\])\s*\(\s*(?:<([^>\r\n]*)>|([^\s()<>]+))((?:\s+["'][^"\r\n]*["'])?)\s*\)/

    # Reference-style definition:  [id]: <url> "title"
    REF_DEF_RE = /\A(\s{0,3}\[[^\]]+\]:\s*)(<[^>\s]+>|[^\s]+)(.*?)[\r\n]*\z/

    FENCE_RE = /\A(\s*)(`{3,}|~{3,})/

    YAML_FRONT_MATTER_RE = /\A(---\s*\r?\n)(.*?)^(---|\.\.\.)\s*\r?\n/m

    class Processor
      attr_reader :site, :cfg, :domain, :baseurl, :md_set, :html_to_md
      attr_accessor :rewritten

      def initialize(site)
        @site = site
        @cfg = DEFAULT_CONFIG.merge(site.config["copy_markdown"] || {})
        @domain = (@cfg["domain"] || site.config["url"] || "https://www.dynamsoft.com").to_s.sub(%r{/+\z}, "")
        @baseurl = (site.config["baseurl"] || "").to_s
        @baseurl = "" if @baseurl == "/"
        @rewrite_domains = Array(@cfg["rewrite_domains"])
        @page_map = {}
        @md_set = Set.new
        @html_to_md = {}
        @rewritten = 0
        @warn_counts = Hash.new(0)
        @warn_first = {}
      end

      # -- main ---------------------------------------------------------------

      def run
        return unless @cfg["enabled"]

        build_page_map
        rels = candidate_files
        return if rels.empty?

        build_indexes(rels)
        rels.each { |rel| process_file(rel) }
        log_summary(rels.size)
      end

      # Collect every .md file in the tree (same policy as the previous
      # implementation): files inside folders or a root index.md, excluding
      # anything under directories/files starting with "_".

      def candidate_files
        source_root = site.source
        prefix = source_root.sub(%r{[\\/]+\z}, "") + File::SEPARATOR

        Dir.glob(File.join(source_root, "**", "*.md")).filter_map do |source_path|
          rel = posix(source_path.delete_prefix(prefix))
          parts = rel.split("/")
          name = parts.pop.to_s
          next if parts.any? { |p| p.start_with?("_") } || name.start_with?("_")
          next unless parts.any? || name == "index.md"

          page = @page_map[rel]
          next if page && page.data["copy_markdown"] == false

          rel
        end
      end

      def build_page_map
        site.pages.each do |page|
          next unless page.extname == ".md" || page.extname == ".markdown"

          @page_map[posix(page.relative_path)] = page
        end
      end

      def build_indexes(rels)
        rels.each do |rel|
          @md_set << rel
          page = @page_map[rel]
          next unless page

          url = page.url.to_s
          if url.end_with?("/")
            @html_to_md["#{@baseurl}#{url}"] = rel
            @html_to_md["#{@baseurl}#{url}index.html"] = rel
          else
            @html_to_md["#{@baseurl}#{url}"] = rel
          end
        end
      end

      def process_file(rel)
        source_path = site.in_source_dir(rel)
        raw = File.read(source_path, encoding: "UTF-8")
        body = strip_front_matter(raw)

        page = @page_map[rel]
        body = render_liquid(body, rel, page) if needs_liquid?(body, page)
        body = Rewriter.new(self, rel).rewrite(body) if @cfg["rewrite_links"]

        dest_path = File.join(site.dest, rel)
        FileUtils.mkdir_p(File.dirname(dest_path))
        File.write(dest_path, body)
      rescue StandardError => e
        warn_for(rel, "failed to process #{rel}: #{e.message}")
        dest_path = File.join(site.dest, rel)
        FileUtils.mkdir_p(File.dirname(dest_path))
        FileUtils.cp(source_path, dest_path)
      end

      # -- Liquid ---------------------------------------------------------------

      def needs_liquid?(body, page)
        return false if page && page.data["render_with_liquid"] == false
        return true if page && page.data["render_with_liquid"] == true

        body.include?("{{") || body.include?("{%")
      end

      def render_liquid(body, rel, page)
        payload = site.site_payload
        if page
          page_data = page.to_liquid
        else
          page_data = { "path" => rel }
        end

        if payload.respond_to?(:page=)
          payload.page = page_data
        elsif payload.respond_to?(:[]=)
          payload["page"] = page_data
        end

        liquid_opts = site.config["liquid"] || {}
        info = {
          :registers        => { :site => site, :page => page_data },
          :strict_filters   => liquid_opts["strict_filters"],
          :strict_variables => liquid_opts["strict_variables"],
        }

        template = site.liquid_renderer.file(rel).parse(body)
        template.render!(payload, info)
      rescue StandardError => e
        warn_for(rel, "Liquid render failed for #{rel}, published raw instead: #{e.message}")
        body
      end

      # -- helpers used by the rewriter -----------------------------------------

      def strip_front_matter(text)
        m = YAML_FRONT_MATTER_RE.match(text)
        m ? m.post_match : text
      end

      def posix(path)
        path.to_s.tr("\\", "/")
      end

      def baseurl_prefix
        "#{@baseurl}/"
      end

      def under_base?(path)
        path == @baseurl || (!@baseurl.empty? && path.start_with?(baseurl_prefix))
      end

      def rel_under_base(path)
        if @baseurl.empty?
          path.sub(%r{\A/}, "")
        else
          path.delete_prefix(@baseurl).sub(%r{\A/}, "")
        end
      end

      def abs_path_for_rel(rel)
        "#{baseurl_prefix}#{rel}"
      end

      def internal_host?(host)
        host == URI.parse(@domain).host || @rewrite_domains.any? do |d|
          host == d || host.end_with?(".#{d}")
        end
      end

      def docs_like?(path)
        path.split("/").any? { |seg| seg.start_with?("docs") }
      end

      def warn_for(rel, message)
        @warn_counts[message] += 1
        @warn_first[message] ||= rel
      end

      def log_summary(total)
        msg = +"Published .md twins: #{total} file(s), rewritten links: #{@rewritten}"
        Jekyll.logger.info("Copy Markdown:", msg) if total.positive?

        @warn_counts.each do |message, count|
          next unless count.positive?

          first = @warn_first[message]
          Jekyll.logger.warn("Copy Markdown:", "(#{count}x, e.g. #{first}) #{message}")
        end
      end

      # Per-file rewriting context (stateless).
      class Rewriter
        def initialize(processor, rel)
          @p = processor
          @rel = rel
          # The md twin is published below the docs root (baseurl), so the
          # resolution base is baseurl + the file's own directory.
          @dir_parts = (@p.baseurl.split("/") + rel.split("/")[0...-1]).reject(&:empty?)
        end

        def rewrite(text)
          out = +""
          fence_char = nil
          text.each_line do |line|
            if fence_char
              out << line
              fence_char = nil if line =~ FENCE_RE && Regexp.last_match(2).start_with?(fence_char)
              next
            end

            m = FENCE_RE.match(line)
            if m
              out << line
              fence_char = m[2][0]
              next
            end

            newline = line[/\r?\n\z/] || ""
            out << rewrite_line(line.chomp) << newline
          end
          out
        end

        private

        # Rewrite links of one line while protecting inline code spans.
        def rewrite_line(line)
          out = +""
          in_code = false
          seg_start = 0

          line.to_enum(:scan, /(`+)/).each do
            m = Regexp.last_match
            seg = line[seg_start...m.begin(0)]
            out << (in_code ? seg : rewrite_plain(seg))
            out << m[0]
            in_code = !in_code
            seg_start = m.end(0)
          end

          tail = line[seg_start..] || ""
          out << (in_code ? tail : rewrite_plain(tail))
          out
        end

        def rewrite_plain(seg)
          seg = seg.gsub(INLINE_LINK_RE) do
            m = Regexp.last_match
            url = m[2] || m[3]
            if url && !url.start_with?("#")
              new_url = rewrite_url(url)
              if new_url
                @p.rewritten += 1 if new_url != url
                "#{m[1]}(#{new_url}#{m[4]})"
              else
                m[0]
              end
            else
              m[0]
            end
          end

          if (m = REF_DEF_RE.match(seg))
            url = m[2].delete_prefix("<").delete_suffix(">")
            new_url = url.start_with?("#") ? nil : rewrite_url(url)
            if new_url
              "#{m[1]}#{new_url}#{m[3]}"
            else
              seg
            end
          else
            seg
          end
        end

        # Returns the rewritten absolute URL, or nil to keep the original.
        def rewrite_url(raw)
          return nil if raw.empty?
          return nil if raw.start_with?("#", "mailto:", "tel:", "javascript:", "data:")

          origin = @p.domain
          path = nil

          if raw.start_with?("//")
            rest = raw.sub(%r{\A//}, "")
            host, _, tail = rest.partition("/")
            return nil unless @p.internal_host?(host)

            origin = "https://#{host}"
            path = "/#{tail}"
          elsif raw =~ %r{\A([a-z][a-z0-9+.\-]*)://([^/]+)(/.*)?\z}i
            return nil unless Regexp.last_match(1) == "http" || Regexp.last_match(1) == "https"
            return nil unless @p.internal_host?(Regexp.last_match(2))

            origin = "#{Regexp.last_match(1)}://#{Regexp.last_match(2)}"
            path = Regexp.last_match(3) || "/"
          elsif raw.start_with?("/")
            path = raw
          else
            path = resolve_relative(raw)
          end

          path, query, fragment = split_url(path)
          handle(path, query, fragment, origin)
        end

        def split_url(path)
          path, fragment = path.split("#", 2)
          path, query = path.split("?", 2)
          [path, query, fragment]
        end

        def resolve_relative(ref)
          parts = @dir_parts.dup
          ref.split("/").each do |seg|
            next if seg.empty? || seg == "."

            if seg == ".."
              parts.pop unless parts.empty?
            else
              parts << seg
            end
          end
          parts.empty? ? "/" : "/#{parts.join('/')}"
        end

        # Decide what to do with an internal absolute path (no host).
        def handle(path, query, fragment, origin)
          base = origin || @p.domain
          path = "/" if path.nil? || path.empty?

          if path.end_with?("/")
            handle_folder(path, query, fragment, base)
          elsif path.end_with?(".md", ".markdown")
            handle_md(path, query, fragment, base)
          elsif path.end_with?(".html", ".htm")
            handle_html(path, query, fragment, base)
          else
            assemble(base, path, true, query, fragment)
          end
        end

        def handle_folder(path, query, fragment, base)
          if @p.cfg["folder_to_index"]
            if @p.under_base?(path)
              rel = "#{@p.rel_under_base(path)}index.md"
              if @p.md_set.include?(rel)
                return assemble(base, @p.abs_path_for_rel(rel), false, nil, fragment)
              end
              warn("folder link has no published index.md twin: #{path}")
            elsif @p.docs_like?(path)
              return assemble(base, "#{path}index.md", false, nil, fragment)
            end
          end
          assemble(base, path, true, query, fragment)
        end

        def handle_md(path, query, fragment, base)
          if @p.under_base?(path) && !@p.md_set.include?(@p.rel_under_base(path))
            warn("link target has no published .md twin: #{path}")
          end
          strip = @p.cfg["strip_query"]
          assemble(base, path, !strip, query, fragment)
        end

        def handle_html(path, query, fragment, base)
          md_candidate = path.sub(/\.html?\z/, ".md")
          same_repo = @p.under_base?(path)

          if same_repo
            rel = @p.rel_under_base(md_candidate)
            if @p.md_set.include?(rel)
              return assemble(base, md_candidate, false, nil, fragment)
            end

            if (hit = @p.html_to_md[path])
              return assemble(base, @p.abs_path_for_rel(hit), false, nil, fragment)
            end

            warn("link target has no published .md twin (keeping .html): #{path}")
            return assemble(base, path, true, query, fragment)
          end

          if @p.docs_like?(path)
            assemble(base, md_candidate, false, nil, fragment)
          else
            assemble(base, path, true, query, fragment)
          end
        end

        def assemble(base, path, keep_query, query, fragment)
          suffix = +""
          suffix << "?#{query}" if keep_query && query
          suffix << "##{fragment}" if fragment
          "#{base}#{path}#{suffix}"
        end

        def warn(message)
          @p.warn_for(@rel, message)
        end
      end
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll::CopyMarkdownFiles::Processor.new(site).run
end
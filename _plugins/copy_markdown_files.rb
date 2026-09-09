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
#     link_check: true                   # run the .md link checker after build
#     orphan_check: true                 # report pages no other .md links to
#     orphan_entries: [index.md]         # entry pages ignored by orphan report
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
      "link_check"      => true,
      "orphan_check"    => true,
      "orphan_entries"  => ["index.md"],
    }.freeze

    # Inline markdown link / image: ![alt](url "title")  or  [text](url).
    # URL may optionally be wrapped in angle brackets.
    INLINE_LINK_RE = /(!?\[[^\]\r\n]*\])\s*\(\s*(?:<([^>\r\n]*)>|([^\s()<>]+))((?:\s+["'][^"\r\n]*["'])?)\s*\)/

    # Reference-style definition:  [id]: <url> "title"
    REF_DEF_RE = /\A(\s{0,3}\[[^\]]+\]:\s*)(<[^>\s]+>|[^\s]+)(.*?)[\r\n]*\z/

    FENCE_RE = /\A(\s*)(`{3,}|~{3,})/

    # Alternation used by Rewriter#rewrite_line: a whole markdown link/image
    # (whose label may itself contain backticks, e.g. [`setMaxFrames`](url))
    # wins over a backtick run, so code spans are only toggled outside links.
    LINK_OR_TICK_RE = /#{INLINE_LINK_RE.source}|(`+)/

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
        LinkChecker.new(self).run if @cfg["link_check"]
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
        # Tokens are scanned left to right: a complete markdown link/image is
        # handled as one unit (its label may contain backticks, e.g.
        # [`method`](page.html#anchor)); backtick runs only toggle code-span
        # state when they occur outside of such a link.
        def rewrite_line(line)
          out = +""
          in_code = false
          seg_start = 0

          line.to_enum(:scan, LINK_OR_TICK_RE).each do
            m = Regexp.last_match

            seg = line[seg_start...m.begin(0)]
            out << (in_code ? seg : rewrite_plain(seg))

            if m[1]
              # Whole link/image token; rewrite its URL unless we are inside a
              # code span or the URL is an anchor-only fragment.
              url = m[2] || m[3]
              if in_code || url.nil? || url.start_with?("#")
                out << m[0]
              else
                new_url = rewrite_url(url)
                if new_url
                  @p.rewritten += 1 if new_url != url
                  out << "#{m[1]}(#{new_url}#{m[4]})"
                else
                  out << m[0]
                end
              end
            else
              # Backtick run outside a link: toggle code-span state.
              out << m[0]
              in_code = !in_code
            end

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

      # ---------------------------------------------------------------------
      # Link checker
      # ---------------------------------------------------------------------
      # Walks every published .md twin after it is written and reports link
      # problems between them - the Markdown equivalent of an HTML link
      # checker (e.g. html-proofer):
      #
      #   ERROR : a linked .md page was not published (no twin), or a
      #           same-site .html / folder / asset target does not exist in
      #           the generated output at all.
      #   WARN  : a same-site link still points to an .html page - either the
      #           page has a .md twin (the link should point to it) or it has
      #           no twin at all (the AI will receive HTML instead of md).
      #   INFO  : pages that no other published .md links to (orphans) - they
      #           are unreachable through the Markdown web. Entry pages listed
      #           in `orphan_entries` are ignored.
      #
      # Links to external hosts are skipped; links that leave the current
      # docs root (other products on the same domain, e.g. /capture-vision/..
      # from a barcode-reader page) cannot be verified inside this repo's
      # build and are counted only. Fenced code blocks / inline code and
      # anchor-only (#...) links are ignored. Anchor (heading) existence is
      # not checked yet.
      class LinkChecker
        def initialize(processor)
          @p = processor
          @errors = [] # [source_rel, target]
          @warns = []  # [source_rel, target, detail]
          @inbound = Hash.new(0)
          @total = 0
          @cross = 0
          @external = 0
        end

        def run
          @p.md_set.to_a.sort.each { |rel| check_file(rel) }
          report
        end

        private

        def check_file(rel)
          dest = File.join(@p.site.dest, *rel.split("/"))
          return unless File.file?(dest)

          fence = nil
          File.foreach(dest, encoding: "UTF-8") do |line|
            if fence
              fence = nil if line =~ FENCE_RE && Regexp.last_match(2).start_with?(fence)
              next
            end

            if (m = FENCE_RE.match(line))
              fence = m[2][0]
              next
            end

            check_line(rel, line)
          end
        end

        def check_line(src, line)
          in_code = false
          line.to_enum(:scan, LINK_OR_TICK_RE).each do
            m = Regexp.last_match
            if m[1]
              check_url(src, m[2] || m[3]) unless in_code
            else
              in_code = !in_code
            end
          end
          return if in_code

          ref = REF_DEF_RE.match(line)
          check_url(src, ref[2].delete_prefix("<").delete_suffix(">")) if ref
        end

        def check_url(src, raw)
          url = raw.to_s.strip
          return if url.empty? || url.start_with?("#")
          return if url.start_with?("mailto:", "tel:", "javascript:", "data:")
          # Leftover Liquid from a page that failed to render.
          return if url.include?("{{") || url.include?("{%")

          @total += 1
          path = nil

          if url.start_with?("//")
            host, _, tail = url.sub(%r{\A//}, "").partition("/")
            unless @p.internal_host?(host)
              @external += 1
              return
            end
            path = "/#{tail}"
          elsif (m = %r{\A([a-z][a-z0-9+.\-]*)://([^/]+)(/.*)?\z}i.match(url))
            unless %w[http https].include?(m[1].downcase)
              @external += 1
              return
            end
            unless @p.internal_host?(m[2])
              @external += 1
              return
            end
            path = m[3] || "/"
          elsif url.start_with?("/")
            path = url
          else
            path = resolve_relative(src, url)
          end

          path, = split_pqf(path)
          verify_target(src, path)
        end

        # [path, query, fragment]
        def split_pqf(path)
          path, fragment = path.split("#", 2)
          path, query = path.split("?", 2)
          [path, query, fragment]
        end

        def resolve_relative(src, ref)
          parts = (@p.baseurl.split("/") + src.split("/")[0...-1]).reject(&:empty?)
          rel_path, = split_pqf(ref)
          rel_path.split("/").each do |seg|
            next if seg.empty? || seg == "."

            if seg == ".."
              parts.pop unless parts.empty?
            else
              parts << seg
            end
          end
          parts.empty? ? "/" : "/#{parts.join('/')}"
        end

        def verify_target(src, path)
          unless @p.under_base?(path)
            @cross += 1
            return
          end

          rel = @p.rel_under_base(path)
          if path.end_with?("/") || rel.empty?
            verify_folder(src, rel)
          elsif rel.end_with?(".md", ".markdown")
            verify_md(src, rel)
          elsif rel.end_with?(".html", ".htm")
            verify_html(src, rel)
          else
            verify_other(src, rel)
          end
        end

        def verify_md(src, rel)
          if @p.md_set.include?(rel)
            @inbound[rel] += 1
            return
          end

          @errors << [src, @p.abs_path_for_rel(rel), "linked .md page has no published twin"]
        end

        def verify_html(src, rel)
          md_rel = rel.sub(/\.html?\z/, ".md")
          if @p.md_set.include?(md_rel)
            @warns << [src, @p.abs_path_for_rel(rel), ".html target has a .md twin; link should point to the twin"]
            return
          end

          if dest_file?(rel)
            @warns << [src, @p.abs_path_for_rel(rel), ".html target has no .md twin (AI will get HTML)"]
          else
            @errors << [src, @p.abs_path_for_rel(rel), ".html target not found in output"]
          end
        end

        def verify_folder(src, rel_dir)
          candidate = "#{rel_dir}index.md"
          if @p.md_set.include?(candidate)
            @inbound[candidate] += 1
            return
          end

          html = "#{rel_dir}index.html"
          if dest_file?(html)
            @warns << [src, @p.abs_path_for_rel(html), "folder link has no .md index twin (AI will get HTML)"]
          else
            @errors << [src, @p.abs_path_for_rel(html), "folder link target not found in output"]
          end
        end

        def verify_other(src, rel)
          # Direct file/asset that exists in the output.
          return if dest_file?(rel)

          # Pretty page URL without extension: /a/b -> /a/b.html.
          if dest_file?("#{rel}.html")
            md_rel = "#{rel}.md"
            if @p.md_set.include?(md_rel)
              @warns << [src, @p.abs_path_for_rel(rel), "extensionless target has a .md twin; link should point to the twin"]
            else
              @warns << [src, @p.abs_path_for_rel(rel), "extensionless target has no .md twin (AI will get HTML)"]
            end
            return
          end

          # Directory link without trailing slash.
          if dest_dir?(rel)
            verify_folder(src, "#{rel}/")
            return
          end

          @errors << [src, @p.abs_path_for_rel(rel), "linked file not found in output"]
        end

        def dest_file?(rel)
          File.file?(File.join(@p.site.dest, *rel.split("/")))
        end

        def dest_dir?(rel)
          File.directory?(File.join(@p.site.dest, *rel.split("/")))
        end

        def report
          @errors.each do |src, target, why|
            Jekyll.logger.error("MD Link Check:", "broken link #{target} (#{why}) -- referenced from #{src}")
          end
          @warns.each do |src, target, why|
            Jekyll.logger.warn("MD Link Check:", "#{target} (#{why}) -- referenced from #{src}")
          end

          if @p.cfg["orphan_check"]
            excluded = Array(@p.cfg["orphan_entries"])
            orphans = @p.md_set.to_a.reject { |rel| @inbound.key?(rel) || excluded.include?(rel) }.sort
            if orphans.any?
              list = orphans.size > 25 ? "#{orphans.first(25).join(', ')}, ... (#{orphans.size - 25} more)" : orphans.join(", ")
              Jekyll.logger.info("MD Link Check:", "#{orphans.size} page(s) are not linked by any other published Markdown: #{list}")
            end
          end

          msg = +"checked #{@total} internal link(s) across #{@p.md_set.size} .md file(s): " \
                 "#{@errors.size} broken, #{@warns.size} warnings, #{@external} external skipped, " \
                 "#{@cross} cross-repo unverifiable"
          Jekyll.logger.info("MD Link Check:", msg)
        end
      end
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll::CopyMarkdownFiles::Processor.new(site).run
end
module Jekyll
  Jekyll::Hooks.register [:pages, :posts, :documents], :post_render do |doc|
    next unless doc.output && doc.path&.end_with?(".md")
    next unless doc.output.include?("[!")

    doc.output.gsub!(%r{<blockquote>(.*?)</blockquote>}mi) do |match|
      inner = $1.dup

      unless inner =~ /\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i
        next match
      end

      type = $1.downcase

      inner.sub!(/\s*\[!(?:NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '')

      inner.gsub!(%r{<p>\s*</p>}mi, '')

      %(<blockquote class="blockquote-#{type}">#{inner}</blockquote>)
    end
  end
end
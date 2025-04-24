module Jekyll
  Jekyll::Hooks.register [:pages, :posts, :documents], :post_render do |doc|
    next unless doc.output && !doc.output.nil?  
    next unless doc.path.end_with?(".md")
    next unless doc.output.include?("[!")

    doc.output.gsub!(/<blockquote>.*?\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*?)<\/blockquote>/mi) do
      type = $1.downcase
      text = $2.strip

      <<~HTML
      <blockquote class="blockquote-#{type}">#{text}</blockquote>
      HTML
    end
  end
end
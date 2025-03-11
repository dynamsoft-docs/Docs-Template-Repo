module Jekyll
  class AlertsConverter < Converter

    def matches(ext)
      ext =~ /^\.md|\.markdown$/i
    end

    def output_ext(ext)
      ".html"
    end

    def convert(content)
      content.gsub(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)/i) do
        type = $1.downcase
        text = $2.strip.gsub(/^>\s*/, "")
        <<~HTML
        <div class="blockquote-#{type}"></div>
        <blockquote>#{text}</blockquote>
        HTML
      end
    end
  end
end
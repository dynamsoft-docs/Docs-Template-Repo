Jekyll::Hooks.register :site, :post_write do |site|
  site.collections.each do |label, collection|
    next unless label == 'articles'
    collection.docs.each do |doc|
      source_path = File.join(site.source, doc.relative_path)
      next unless File.exist?(source_path)

      dest_path = doc.destination(site.dest).sub(/\.html$/, '.md')
      dest_dir = File.dirname(dest_path)
      FileUtils.mkdir_p(dest_dir)
      FileUtils.cp(source_path, dest_path)
    end
  end
end
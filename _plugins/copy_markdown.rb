Jekyll::Hooks.register :site, :post_write do |site|
  source_root = site.source
  source_prefix = "#{source_root}#{File::SEPARATOR}"

  Dir.glob(File.join(source_root, '**', '*.md')).each do |source_path|
    relative_path = source_path.delete_prefix(source_prefix)
    path_parts = relative_path.split(File::SEPARATOR)
    file_name = path_parts.pop

    next unless path_parts.any? || file_name == 'index.md'
    next if path_parts.any? { |part| part.start_with?('_') }

    dest_path = File.join(site.dest, relative_path)
    FileUtils.mkdir_p(File.dirname(dest_path))
    FileUtils.cp(source_path, dest_path)
  end
end
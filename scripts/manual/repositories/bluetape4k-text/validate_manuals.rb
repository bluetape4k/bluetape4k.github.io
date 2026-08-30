#!/usr/bin/env ruby

require_relative "manual_contract"

root = File.expand_path("../../../..", __dir__)
code_root = root
manual_root = File.join(root, "docs/manual/bluetape4k-text")
manifest = nil
source_root = nil

arguments = ARGV.dup
while (index = arguments.index { |argument| argument.start_with?("--") })
  option = arguments.delete_at(index)
  value = arguments.delete_at(index)
  case option
  when "--root", "--code-root" then code_root = value
  when "--manual-root" then manual_root = value
  when "--manifest" then manifest = value
  when "--source-root" then source_root = value
  else abort "unknown option: #{option}"
  end
end
manifest ||= File.join(manual_root, "manifest.yaml")
ManualContract.new(root: code_root, manifest: manifest, manual_root: manual_root, source_root: source_root).validate!
puts "Text manual contract validated"

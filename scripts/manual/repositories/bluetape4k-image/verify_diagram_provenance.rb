#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"
require "yaml"
require_relative "diagram_provenance"

root = DiagramProvenance::ROOT
manual_root = File.join(root, "docs/manual/bluetape4k-image")
manifest_path = File.join(manual_root, "diagram-provenance.yaml")
options = { render: true, write: false }

OptionParser.new do |parser|
  parser.banner = "Usage: verify_diagram_provenance.rb [options]"
  parser.on("--root PATH", "site checkout root") { |value| root = File.expand_path(value) }
  parser.on("--manual-root PATH", "central manual root") { |value| manual_root = File.expand_path(value) }
  parser.on("--manifest PATH", "provenance manifest path") { |value| manifest_path = File.expand_path(value, root) }
  parser.on("--no-render", "validate tracked assets without rendering twice") { options[:render] = false }
  parser.on("--write-manifest", "write a new baseline from the tracked SVG/PNG set") { options[:write] = true }
end.parse!

begin
  if options[:write]
    data = DiagramProvenance::Verifier.build_manifest(
      root: root,
      manual_root: manual_root,
      renderer_command: ENV.fetch("DIAGRAM_RENDERER", "rsvg-convert"),
      font_families: DiagramProvenance::DEFAULT_FONT_FAMILIES,
    )
    File.write(manifest_path, YAML.dump(data))
    puts "diagram provenance baseline written: #{manifest_path} assets=#{data.fetch("assets").length}"
  else
    result = DiagramProvenance::Verifier.new(
      root: root,
      manifest_path: manifest_path,
      render_script: File.join(root, "scripts/manual/repositories/bluetape4k-image/render_image_diagrams.rb"),
      assets_root: File.join(manual_root, "assets"),
    ).verify!(render: options[:render])
    puts "diagram provenance passed: assets=#{result.fetch("assets")} renderer=#{result.fetch("renderer")}"
    result.fetch("warnings").each { |warning| puts "diagram provenance note: #{warning}" }
  end
rescue DiagramProvenance::ContractError => error
  warn "diagram provenance failed: #{error.message}"
  exit 1
end

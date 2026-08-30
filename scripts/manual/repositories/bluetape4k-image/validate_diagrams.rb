#!/usr/bin/env ruby

require "rexml/document"
require "optparse"
require_relative "diagram_provenance"

site_root = File.expand_path("../../../..", __dir__)
manual_root = File.join(site_root, "docs/manual/bluetape4k-image")
OptionParser.new do |parser|
  parser.on("--root PATH", "site or source checkout root") { |value| site_root = File.expand_path(value) }
  parser.on("--code-root PATH", "alias for --root") { |value| site_root = File.expand_path(value) }
  parser.on("--manual-root PATH", "central manual root") { |value| manual_root = File.expand_path(value) }
end.parse!
assets = Dir[File.join(manual_root, "assets/**/*.svg")].sort
errors = []

errors << "expected 5 SVG diagrams, found #{assets.length}" unless assets.length == 5
assets.each do |svg_path|
  relative = svg_path.delete_prefix("#{manual_root}/")
  manual_relative = relative.delete_prefix("docs/manual/")
  png_path = svg_path.sub(/\.svg\z/, ".png")
  errors << "#{relative}: paired PNG missing" unless File.file?(png_path)
  %w[en ko].each do |locale|
    referenced = Dir[File.join(manual_root, "#{locale}/**/*.md")].any? do |manual_path|
      File.read(manual_path).include?(manual_relative)
    end
    errors << "#{relative}: not referenced by #{locale} manual" unless referenced
  end
  document = REXML::Document.new(File.read(svg_path))
  svg = document.root
  errors << "#{relative}: expected 1600x1040 SVG" unless svg.attributes["width"] == "1600" && svg.attributes["height"] == "1040"
  errors << "#{relative}: accessible title missing" unless REXML::XPath.first(document, "/svg/title")
  errors << "#{relative}: accessible description missing" unless REXML::XPath.first(document, "/svg/desc")
  paths = REXML::XPath.match(document, "//path[@marker-end]")
  errors << "#{relative}: no directed connectors" if paths.empty?
  paths.each do |path|
    errors << "#{relative}: connector #{path.attributes['id']} is thinner than 4" if path.attributes["stroke-width"].to_f < 4
  end
  markers = REXML::XPath.match(document, "//marker")
  markers.each do |marker|
    width = marker.attributes["markerWidth"].to_f
    height = marker.attributes["markerHeight"].to_f
    errors << "#{relative}: marker #{marker.attributes['id']} is smaller than 14x14" if width < 14 || height < 14
  end
end

begin
  DiagramProvenance::Verifier.new(
    root: site_root,
    manifest_path: File.join(manual_root, "diagram-provenance.yaml"),
    render_script: File.join(site_root, "scripts/manual/repositories/bluetape4k-image/render_image_diagrams.rb"),
    assets_root: File.join(manual_root, "assets"),
  ).verify!(render: false)
rescue DiagramProvenance::ContractError => error
  errors.concat(error.message.lines.map { |line| "diagram provenance: #{line.strip}" })
end

abort(errors.join("\n")) unless errors.empty?
puts "Image diagram contract passed: #{assets.length} SVG/PNG pairs, provenance, accessible labels, directed connectors, and 14x14 arrowheads."

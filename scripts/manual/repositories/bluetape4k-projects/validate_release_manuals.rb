#!/usr/bin/env ruby

require "yaml"
require_relative "release_contract"

central = ARGV.any? { |argument| argument.start_with?("--code-root", "--root", "--manual-root", "--source-root", "--tag", "--sha", "--inventory") }

if central
  require_relative "../../lib/central_release_support"
  require_relative "manual_contract"

  begin
    options = CentralReleaseSupport.parse(ARGV, slug: "projects", inventory_name: "module-inventory.json")
    # Validate the complete current inventory against the central manifest. The
    # release contract below independently checks the selected stable tag, so
    # filtering this inventory to the tag would reject legitimate snapshot-only
    # modules that are intentionally documented in the central site.
    inventory = CentralReleaseSupport.ensure_inventory(options, slug: "projects", release_filter: false)
    expected = { "ref" => options.tag, "commit" => options.sha }
    errors = ManualDocs::ReleaseContract.new(
      repository_root: options.code_root, manual_root: options.manual_root,
      tag: options.tag, expected_sha: options.sha,
    ).errors
    errors.concat(ManualDocs::Validator.new(
      inventory: inventory, manifest_path: options.manifest, repository_root: options.code_root,
      manual_root: options.manual_root,
    ).errors)
    abort(errors.sort.join("\n")) unless errors.empty?
    puts "Release manuals are compatible with #{options.tag} (#{options.sha}): #{inventory.length} modules, 0 missing."
  rescue ArgumentError => error
    warn error.message
    exit 1
  end
else
  usage = "usage: ruby scripts/manual/validate_release_manuals.rb --manifest PATH [TAG EXPECTED_SHA] | TAG EXPECTED_SHA"
  repository_root = File.expand_path("../..", __dir__)

  begin
    arguments = ARGV.dup
    manifest_path = nil
    if arguments.first == "--manifest"
      arguments.shift
      manifest_path = arguments.shift
      abort(usage) unless manifest_path && !manifest_path.empty?
    end

    if arguments.empty? && manifest_path
      path = File.expand_path(manifest_path, repository_root)
      manifest = YAML.safe_load(File.read(path))
      tag, expected_sha = manifest.values_at("releaseRef", "releaseCommit")
    elsif arguments.length == 2
      tag, expected_sha = arguments
      if manifest_path
        path = File.expand_path(manifest_path, repository_root)
        manifest = YAML.safe_load(File.read(path))
        unless tag == manifest["releaseRef"] && expected_sha.casecmp?(manifest["releaseCommit"])
          abort("manual manifest release provenance mismatch")
        end
      end
    else
      abort(usage)
    end

    result = ManualDocs::ReleaseContract.new(
      repository_root: repository_root, tag: tag, expected_sha: expected_sha,
    ).validate
  rescue ArgumentError => error
    warn error.message
    exit 1
  end

  abort(result.errors.join("\n")) unless result.errors.empty?
  summary = "Release manuals are compatible with #{tag} (#{expected_sha}): #{result.checked_count} checked, 0 missing."
  summary += " #{result.skipped_manual_count} snapshot-only manuals skipped." if result.skipped_manual_count.positive?
  puts summary
end

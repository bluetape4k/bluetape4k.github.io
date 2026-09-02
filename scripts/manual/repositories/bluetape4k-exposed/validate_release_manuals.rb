#!/usr/bin/env ruby

require_relative "release_contract"

central = ARGV.any? { |argument| argument.start_with?("--code-root", "--root", "--manual-root", "--source-root", "--manifest", "--tag", "--sha", "--inventory") }
if central
  require_relative "../../lib/central_release_support"
  require_relative "manual_contract"
  begin
    options = CentralReleaseSupport.parse(ARGV, slug: "exposed", expected_tag: "2.0.0", expected_sha: "d632a0bc0662ae616b786f552150a7fabd1cee3e")
    inventory = CentralReleaseSupport.ensure_inventory(options, slug: "exposed")
    errors = ManualDocs::ReleaseContract.new(
      repository_root: options.code_root, manual_root: options.manual_root,
      tag: options.tag, expected_sha: options.sha,
    ).errors
    errors.concat(ManualDocs::Validator.new(
      inventory: inventory, manifest_path: options.manifest, repository_root: options.code_root,
      expected_release: { "ref" => options.tag, "commit" => options.sha }, manual_root: options.manual_root,
    ).errors)
    abort(errors.sort.join("\n")) unless errors.empty?
    puts "Release manuals are compatible with #{options.tag} (#{options.sha}): #{inventory.length} modules, 0 missing."
  rescue ArgumentError => error
    warn error.message
    exit 1
  end
else
  tag, expected_sha = ARGV
  abort("usage: ruby scripts/manual/validate_release_manuals.rb TAG EXPECTED_SHA") unless ARGV.length == 2
  result = ManualDocs::ReleaseContract.new(
    repository_root: File.expand_path("../..", __dir__), tag: tag, expected_sha: expected_sha,
  ).validate
  abort(result.errors.join("\n")) unless result.errors.empty?
  puts "Release manuals are compatible with #{tag} (#{expected_sha}): #{result.checked_count} checked, 0 missing."
end

#!/usr/bin/env bash
set -euo pipefail

latest_release_tag="$(git tag --list 'v*' --sort=-version:refname | head -n 1)"

if [ -z "$latest_release_tag" ]; then
  echo "v0.1.0"
  exit 0
fi

merged_pull_request_numbers="$(
  git log --merges --format='%s' "${latest_release_tag}..HEAD" |
    sed -n 's/^Merge pull request #\([0-9][0-9]*\).*/\1/p'
)"

release_labels=""
for pull_request_number in $merged_pull_request_numbers; do
  release_labels="$release_labels $(gh pr view "$pull_request_number" --json labels --jq '.labels[].name' | tr '\n' ' ')"
done

version_without_prefix="${latest_release_tag#v}"
major_version="${version_without_prefix%%.*}"
remaining_version="${version_without_prefix#*.}"
minor_version="${remaining_version%%.*}"
patch_version="${remaining_version#*.}"

if [[ " $release_labels " == *" breaking "* ]]; then
  echo "v$((major_version + 1)).0.0"
elif [[ " $release_labels " == *" feature "* ]]; then
  echo "v${major_version}.$((minor_version + 1)).0"
else
  echo "v${major_version}.${minor_version}.$((patch_version + 1))"
fi

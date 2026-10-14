#!/bin/sh
# Stage sources into a DSH checkout, freeze missing suites through the Learn
# content spec (full validation in the isolated runner), and copy the frozen
# suites back. Usage: authoring/freeze.sh <dsh-checkout>
set -e
root=$(cd "$(dirname "$0")/.." && pwd)
dsh=${1:?usage: authoring/freeze.sh <dsh-checkout>}
node "$root/scripts/build.mjs" "$dsh" --stage-only
(cd "$dsh" && LEARN_FREEZE_SUITES=1 npx vitest run packages/experimental/learn/tests/content.spec.ts) || status=$?
cd "$dsh/packages/experimental/learn/content"
for file in problems/*/suite.v*.json variants/*/suite.v*.json; do
  [ -f "$root/content/$file" ] || { cp "$file" "$root/content/$file"; echo "collected $file"; }
done
exit ${status:-0}

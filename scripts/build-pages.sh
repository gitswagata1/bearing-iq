#!/usr/bin/env bash
# Build the hosted demo (static, sample data, no backend) into docs/ for GitHub Pages.
# GitHub: Settings -> Pages -> Deploy from a branch -> main, /docs
set -euo pipefail
cd "$(dirname "$0")/../frontend"
rm -rf out
STATIC_EXPORT=1 NEXT_PUBLIC_STATIC_DEMO=1 npx next build
cd ..
find docs -mindepth 1 -maxdepth 1 ! -name screenshots -exec rm -rf {} +
cp -r frontend/out/. docs/
touch docs/.nojekyll
echo "docs/ ready: https://gitswagata1.github.io/bearing-iq/"

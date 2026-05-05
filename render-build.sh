#!/usr/bin/env bash

set -euo pipefail

rm -rf dist
mkdir -p dist/assets

cp index.html dist/index.html
cp product.html dist/product.html
cp assets/mourao-home.css dist/assets/mourao-home.css
cp assets/mourao-logo.png dist/assets/mourao-logo.png

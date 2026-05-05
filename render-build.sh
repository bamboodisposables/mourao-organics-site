#!/usr/bin/env bash

set -euo pipefail

rm -rf dist
mkdir -p dist/assets

cp ./*.html dist/
cp assets/* dist/assets/

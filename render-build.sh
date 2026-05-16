#!/usr/bin/env bash

set -euo pipefail

rm -rf dist
mkdir -p dist/assets

cp ./*.html dist/
cp favicon.ico dist/
cp -r assets/. dist/assets/

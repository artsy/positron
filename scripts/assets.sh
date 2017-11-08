# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

rm -rf client/public/assets
mkdir client/public/assets

NODE_ENV=production webpack
stylus \
  $(find client/assets -name '*.styl') \
  --compress \
  -o client/public/assets

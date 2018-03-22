# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

rm -rf public/client/assets
mkdir public/client/assets

NODE_ENV=production webpack
stylus \
  $(find src/client/assets -name '*.styl') \
  --compress \
  -o public/client/assets

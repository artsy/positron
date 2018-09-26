# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

rm -rf public
mkdir public
mkdir public/assets

NODE_ENV=production node_modules/.bin/webpack
stylus \
  $(find src/client/assets -name '*.styl') \
  --compress \
  -o public/assets

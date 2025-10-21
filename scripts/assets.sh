# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

yarn clean

NODE_ENV=production node --max_old_space_size=256 node_modules/.bin/webpack --config ./webpack
stylus \
  $(find src/client/assets -name '*.styl') \
  --compress \
  -o public/assets

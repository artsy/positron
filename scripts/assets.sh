# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

yarn clean

NODE_ENV=production yarn webpack
stylus \
  $(find src/client/assets -name '*.styl') \
  --compress \
  -o public/assets

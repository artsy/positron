# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

NODE_ENV=production
rm -rf client/public
mkdir client/public
mkdir client/public/assets
ezel-assets client/assets/ client/public/assets/

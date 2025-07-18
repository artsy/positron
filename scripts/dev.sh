# !/usr/bin/bash

set -e -x

NODE_OPTIONS="--openssl-legacy-provider --no-experimental-fetch" DEBUG=app,client,api node --inspect ./src/index.js
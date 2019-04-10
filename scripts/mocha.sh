#!/bin/sh

set -e -x

trap "exit" INT

nyc --extension .coffee mocha \
  --require test.config.js \
  --timeout 10000 \
   $@ \

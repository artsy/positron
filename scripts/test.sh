# !/usr/bin/bash

set -e -x

yarn mocha $(find src -name '*.test.coffee')
yarn mocha $(find src -name '*.spec.js')
yarn jest
if [ "$CI" = "true" ]; then
  yarn report-coverage
fi
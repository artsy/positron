# !/usr/bin/bash

set -e -x

yarn mocha --runInBand $(find src -name '*.test.coffee')
yarn mocha --runInBand $(find src -name '*.spec.*')
yarn jest --runInBand

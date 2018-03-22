# !/usr/bin/bash

set -e -x

yarn assets
yarn mocha $(find src/api -name '*.test.coffee')
yarn mocha $(find src/api -name '*.test.js')
yarn mocha $(find src/client -name '*.test.coffee')
yarn jest --runInBand --forceExit

# !/usr/bin/bash

set -e -x

yarn assets
yarn mocha $(find api -name '*.test.coffee')
yarn mocha $(find api -name '*.test.js')
yarn mocha $(find client -name '*.test.coffee')
yarn jest -- --runInBand $(find client -name '*.test.js') --forceExit
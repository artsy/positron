# !/usr/bin/bash

set -e -x

yarn mocha $(find src/api -name '*.test.coffee')
yarn mocha $(find src/api -name '*.spec.js')
yarn mocha $(find src/client -name '*.test.coffee')
yarn nyc jest --maxWorkers=2 --detectOpenHandles --forceExit --collectCoverageFrom=src/**/*.js --collectCoverageFrom=!src/client/collections

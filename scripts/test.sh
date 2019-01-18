# !/usr/bin/bash

set -e -x

yarn mocha $(find src/api -name '*.test.coffee')
yarn mocha $(find src/api -name '*.spec.js')
yarn mocha $(find src/client -name '*.test.coffee')
yarn jest --maxWorkers=2 --detectOpenHandles --forceExit \
  --coverage --coverageDirectory .nyc_output --coverageReporters json

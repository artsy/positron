#!/bin/sh

set -e -x

trap "exit" INT

jest \
  $@ \
  --maxWorkers=2 --detectOpenHandles --forceExit \
  --coverage --coverageDirectory .nyc_output --coverageReporters json

#!/bin/sh

set -e -x

trap "exit" INT

jest \
  $@ \
  --runInBand --detectOpenHandles --forceExit

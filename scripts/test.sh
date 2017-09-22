# !/usr/bin/bash

set -e -x

trap "exit" INT

run () {
  case $CIRCLE_NODE_INDEX in
  0)
    yarn assets
    ;;
  1)
    yarn mocha $(find api -name '*.test.coffee')
    yarn mocha $(find api -name '*.test.js')
    ;;
  2)
    yarn mocha $(find client -name '*.test.coffee')
    yarn jest $(find client -name '*.test.js')
    ;;
  esac
}

if [ -z "$CIRCLE_NODE_INDEX" ]; then
  CIRCLE_NODE_INDEX=0 run
  CIRCLE_NODE_INDEX=1 run
  CIRCLE_NODE_INDEX=2 run
else
  run
fi
set -e -x

trap "exit" INT

nyc mocha \
  --require test.config.js \
  --timeout 10000 \
   $@ \

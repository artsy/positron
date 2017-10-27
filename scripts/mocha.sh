set -e -x

trap "exit" INT

mocha \
  --require should \
  --ui bdd \
  --timeout 10000 \
  --require test/config.js \
  --compilers js:babel-core/register,coffee:coffee-script/register \
   $@ \

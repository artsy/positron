set -e -x

trap "exit" INT

mocha \
  --require should \
  --ui bdd \
  --timeout 10000 \
  --compilers js:babel-core/register,coffee:coffee-script/register \
  --require dotenv/config \
   $@ \
   dotenv_config_path=.env.test

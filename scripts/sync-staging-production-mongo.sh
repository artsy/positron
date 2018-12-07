# !/usr/bin/bash

set -ex

export PRODUCTION_MONGOHQ_URL=$(hokusai production env get MONGOHQ_URL | sed -e "s/MONGOHQ_URL=//")
mongodump --uri="$PRODUCTION_MONGOHQ_URL"

find ./dump -type f -name "*.metadata.json" -exec sed -i '' -e 's/,"safe":true//g' {} \;

export STAGING_MONGOHQ_URL=$(hokusai staging env get MONGOHQ_URL | sed -e "s/MONGOHQ_URL=//")
mongorestore --uri="$STAGING_MONGOHQ_URL" --dir=./dump/ --drop --stopOnError

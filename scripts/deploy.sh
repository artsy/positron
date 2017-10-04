# !/usr/bin/bash

# -e: stop script if an error occurs
# -x: log commands
set -e -x

yarn assets
bucket-assets -b positron-$DEPLOY_ENV
heroku config:set ASSET_MANIFEST=$(cat manifest.json) --app=positron-$DEPLOY_ENV
if [ -z "$CIRCLE_SHA1" ]; then
  git push --force git@heroku.com:positron-$DEPLOY_ENV.git master
else
  git push --force git@heroku.com:positron-$DEPLOY_ENV.git $CIRCLE_SHA1:refs/heads/master
fi
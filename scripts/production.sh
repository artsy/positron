# !/usr/bin/bash

set -e -x

if [ -z "$CDN_URL" ]
  then
    echo "Required environment variable CDN_URL is unset"
    exit 1
fi

export COMMIT_HASH=`cat COMMIT_HASH.txt`
export ASSET_MANIFEST=$(curl --silent $CDN_URL/manifest-$COMMIT_HASH.json)

node ./src --colors

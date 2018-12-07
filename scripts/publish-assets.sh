# !/usr/bin/bash

set -e -x

if [ -z "$S3_BUCKET" ]
  then
    echo "Required environment variable S3_BUCKET is unset"
    exit 1
fi

export COMMIT_HASH=`cat COMMIT_HASH.txt`

yarn assets && yarn bucket-assets -b $S3_BUCKET

# !/usr/bin/bash

set -e -x

if [ -z "$S3_BUCKET" ]
  then
    echo "No bucket supplied"
    exit 1
fi

export COMMIT_HASH=`cat COMMIT_HASH.txt`

yarn assets && yarn bucket-assets -b $S3_BUCKET

# !/usr/bin/bash

set -e -x

export COMMIT_HASH=`cat COMMIT_HASH.txt`

node --max_old_space_size=1024 ./src --colors

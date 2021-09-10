# !/usr/bin/bash

set -e -x

if [ ! -f "./.env" ]; then
  echo -e "\033[1;31m WARNING: Missing .env file. \033[0m"
fi

export $(cat .env | grep NODE_ENV | xargs)

if [ "$NODE_ENV" = "development" ]; then
  node --max_old_space_size=1024 ./src/index.js
else
  forever -c 'node --max_old_space_size=1024' ./src/index.js --colors
fi

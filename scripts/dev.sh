# !/usr/bin/bash

set -e -x

DEBUG=app,client,api node --inspect ./src/index.js

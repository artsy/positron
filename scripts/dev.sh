# !/usr/bin/bash

set -e -x

DEBUG=app,client,api node -r dotenv/config --inspect ./index.js
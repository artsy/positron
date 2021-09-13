#!/bin/sh

# This assumes you have general prerequisites installed as by:
# https://github.com/artsy/potential/blob/master/scripts/setup

# Exit if any subcommand fails
set -e

GREEN='\033[0;32m'
NO_COLOR='\033[0m'

echo "Installing project dependencies from Brewfile..."
brew bundle

if [ ! -z $NVM_DIR ]; then # skip if nvm is not available
  echo "Installing Node..."
  source ~/.nvm/nvm.sh
  nvm install
fi

echo "Installing dependencies..."
yarn install || (npm install --global yarn@latest && yarn install)

echo "Download .env.shared (for common local dev config)..."
if ! aws s3 cp s3://artsy-citadel/dev/.env.positron .env.shared; then
  echo "Unable to download shared config from s3. Using .env.oss!"
  echo "This is expected for open source contributors."
  echo "If you work at Artsy, please check your s3 access."
  cp .env.oss .env.shared
fi

if [ ! -e ".env" ]; then # skip if .env exists
  echo "Initialize .env from from .env.example (for any custom configuration)..."
  cat .env.example > .env
fi

echo "
${GREEN}Setup complete!
To run the project execute: nvm use && yarn start${NO_COLOR}"

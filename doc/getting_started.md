# Getting Started with Positron

*Positron* is the Artsy Writer app used to create editorial on Artsy. It's version 2 of the articleing tool powered by [Ezel](http://ezeljs.com/) and a [standalone Mongo + Express API](https://github.com/artsy/positron/blob/master/doc/api.md). This doc will assume you've set up XCode and common development tools.

## Install Mongodb

The easiest way is through [Homebrew](http://brew.sh/). For other installation options check out [the docs](http://www.mongodb.org/downloads).

````
brew install mongodb
````

## Install Node.js

It is recommended to use the [nvm](https://github.com/creationix/nvm) tool to manage node versions and install node.

First install NVM

````
curl https://raw.githubusercontent.com/creationix/nvm/v0.15.0/install.sh | bash
````

Then install the latest node

````
nvm install 0.10
````

Then tell nvm to use the latest version of node by default and to update your PATH

````
nvm alias default 0.10
````

## Install Node Modules

````
npm install
````

Although not necessary, it's recommended to install mocha and coffeescript globally for debugging.

````
npm install mocha -g
npm install coffee-script -g
````

## Add an private config variables

First copy the `.env.example` file to a `.env` file

````
cp .env.example .env
````

then copy env variables that say REPLACE from staging into the new .env file.

````
heroku config --app=positron-staging
````

or ask someone in slack for the private config variables.

## Run the Server

Make sure Mongo is running

````
mongod
````

then start the server.

````
make s
````

Client-side code and templates will automatically reload on page refresh, but server-side code will not automatically reload without restarting the server. If you would like to watch for file changes and restart the server [forever](https://github.com/nodejitsu/forever) is a popular tool.
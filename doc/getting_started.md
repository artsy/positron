# Getting Started with Positron

*Positron* is the Artsy Writer front-end app used to create editorial on Artsy. It's version 2 of the posting tool powered by [Spooky](https://github.com/artsy/spooky) for a back-end. This doc will assume you've set up XCode and common development tools.

## Ezel

Read up on [Ezel](http://ezeljs.com/) and familarize yourself with Positron concepts by understanding the foundation it was built on.

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

## Add a Spooky Auth Token

Copy your .env.example to an .env file and set `SPOOKY_TOKEN`. Use a remote Spooky by pulling from `heroku config --app=positron-staging` or [set up Spooky locally](https://github.com/artsy/spooky#set-up) and create a new key in the Spooky rails console via `ApiKey.create.token`.

## Run the Server

Client-side code and templates will automatically reload on page refresh, but server-side code will not automatically reload without restarting the server. If you would like to watch for file changes and restart the server [forever](https://github.com/nodejitsu/forever) is a popular tool.
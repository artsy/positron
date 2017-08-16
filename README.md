Positron
===

[Positron](https://github.com/artsy/positron) is Artsy Writer or the editorial tool for Artsy.

![ArtsyWriter](/doc/images/ArtsyWriter.png)

Meta
---

* __State:__ production
* __Production:__ [https://www.artsy.net/](https://www.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/positron-production/resources)
* __Staging:__ [https://staging.artsy.net/](https://staging.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/positron-staging/resources)
* __Github:__ [https://github.com/artsy/positron/](https://github.com/artsy/positron/)
* __CI:__ [CircleCI](https://circleci.com/gh/artsy/positron); merged PRs to artsy/positron#master are automatically deployed to staging. PRs from `staging` to `release` are automatically deployed to production. [Start a deploy...](https://github.com/artsy/positron/compare/release...staging?expand=1)
* __Point People:__ [@craigspaeth](https://github.com/craigspaeth), [@kanaabe](https://github.com/kanaabe)

[![Build Status](https://circleci.com/gh/artsy/positron/tree/master.svg?style=svg)](https://circleci.com/gh/artsy/positron/tree/master)

Set-Up
---

- Copy `.env.example` to `.env` in the root of the project and edit all `REPLACE` values with sensitive configuration obtained from `positron-staging`. This should help.

```
heroku config --app=positron-staging | grep -E `cat .env.example | grep REPLACE | cut -f1 -d= | xargs | tr ' ' \|` | sed -e 's/:\ /=/g' | sed -e 's/ //g'
```

### Via Docker Compose
- Install [Docker for Mac](https://docs.docker.com/docker-for-mac/install/)
- git clone git@github.com:<your username>/positron.git && cd positron
- `docker-compose up`

This starts a new self-contained Docker instance that boots MongoDB, ElasticSearch and Node. Changes made to source-code located in `api` and `client` is [automatically reloaded](https://github.com/artsy/positron/blob/master/lib/reloadable.js) on browser-refresh; no need to restart the process.

To shut down the process, press `ctrl+c` or execute `docker-compose down`.

### Manually

- Install [NVM](https://github.com/creationix/nvm)
- Install Node 6

```
nvm install 6
nvm alias default 6
```

- Fork Positron to your Github account in the Github UI.
- Clone your repo locally (substitute your Github username).

```
git clone git@github.com:craigspaeth/positron.git && cd positron
```

- Install node modules

```
yarn install
```

- Positron uses MongoDB as a database. To install MongoDB using homebrew do the following, if you would prefer to install manually check the documentation at [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)

```
brew install mongodb
```

- Start the MongoDB database

```
mongod
```

- Install and run elasticsearch

```
brew install elasticsearch
brew services start elasticsearch
```

- Start the server

```
make s
```
- Positron should now be running at [http://localhost:3005/](http://localhost:3005/), open a browser and navigate to it. That will redirect you to staging, login as an Artsy administrator and it will redirect you to `http://localhost:3005` logged into Writer with the default partner gallery channel (David Zwirner).

Additional docs
---

You can find additional documentation about Positron in [doc](/doc).

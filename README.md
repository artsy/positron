# Positron

[Positron](https://github.com/artsy/positron) is Artsy Writer or the editorial tool for Artsy.

[![codecov](https://codecov.io/gh/artsy/positron/branch/master/graph/badge.svg)](https://codecov.io/gh/artsy/positron)
![ArtsyWriter](/doc/images/ArtsyWriter.png)

## Meta

- **State:** production
- **Production:** [https://writer.artsy.net/](https://writer.artsy.net/) | [Kubernetes](https://kubernetes.artsy.net/#!/deployment/default/positron-web?namespace=default)
- **Staging:** [http://stagingwriter.artsy.net/](http://stagingwriter.artsy.net//) | [Kubernetes](https://kubernetes-staging.artsy.net/#!/deployment/default/positron-web?namespace=default)
- **Logs:**
    * [Production](https://papertrailapp.com/groups/3675843/events?q=host%3Apositron-web)
    * [Staging](https://papertrailapp.com/groups/3674473/events?q=host%3Apositron-web)
- **Monitoring:**
    * [Production](https://app.datadoghq.com/apm/service/positron/express.request?end=1545136847351&env=production&paused=false&start=1545133247351)
    * [Staging](https://app.datadoghq.com/apm/service/positron/express.request?end=1545136799180&env=staging&paused=false&start=1545133199180)
- **MongoDB:** [Atlas](https://cloud.mongodb.com/v2/5be44a7aff7a254a8327cd3a#clusters)
- **Github:** [https://github.com/artsy/positron/](https://github.com/artsy/positron/)
- **CI:** [CircleCI](https://circleci.com/gh/artsy/positron); merged PRs to artsy/positron#master are automatically deployed to staging. PRs from `staging` to `release` are automatically deployed to production. [Start a deploy...](https://github.com/artsy/positron/compare/release...staging?expand=1)
- **Point Person:**  [@eessex](https://github.com/eessex)

[![Build Status](https://circleci.com/gh/artsy/positron/tree/master.svg?style=svg)](https://circleci.com/gh/artsy/positron/tree/master)

## Set-Up

### Via Hokusai

- Set up [Hokusai](https://github.com/artsy/README/blob/master/playbooks/hokusai.md#quickstart)
- `git clone git@github.com:<your username>/positron.git && cd positron`
- `COMMIT_HASH=$(git rev-parse --short HEAD) hokusai dev start`

This starts a new Docker Compose stack that boots MongoDB, ElasticSearch and Positron. Changes made to source-code are _not_ automatically reloaded. To shut down, press `ctrl+c` or execute `hokusai dev stop`.

### Manually

- Install [NVM](https://github.com/creationix/nvm)
- Install Node 10

```
nvm install 10
nvm alias default 10
```

- Fork Positron to your Github account in the Github UI.
- Clone your repo locally (substitute your Github username).

```
git clone git@github.com:craigspaeth/positron.git && cd positron
```

- Copy `.env.example` to `.env` in the root of the project and edit all `REPLACE` values with sensitive configuration obtained from `positron-staging`. Use the following command:

```
hokusai staging env get | grep -E `cat .env.example | grep REPLACE | cut -f1 -d= | xargs | tr ' ' \|` | sed -e 's/:\ /=/g' | sed -e 's/ //g'
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

- Create a dummy channel
  In order to write articles, you will need to be a member of a channel. If you are an Artsy dev, it might be easier to point your MONGOHQ_URL to the staging database. Otherwise, here are the steps to backfill some required data:

1. Create a collection called `channels` in a `positron` db in your mongo database (You can use the mongo shell or a simple UI like Robomongo.)
2. Add a document with the following fields:

```
{
  name: "Test Channel",
  type: "team", // this can be either editorial, team, support, or partner
  user_ids: [ObjectId("<your_user_id>")]
}
```

- Start the server

```
yarn start
```

- Positron should now be running at [http://localhost:3005/](http://localhost:3005/), open a browser and navigate to it. That will redirect you to staging, login as an Artsy administrator and it will redirect you to `http://localhost:3005` logged into Writer. If you are an Artsy Admin pointed to the staging database, you should see the default partner gallery channel (David Zwirner).

If you aren't an artsy admin you'll possibly get an Unauthorized page. You need to do one more mongo operation: edit the `users` collection and set your user's `channel_ids` to `[ ObjectId("<your_above_channel_id>") ]`. Once that's done you should be able to see the main writer interface.

- Run tests

```
yarn test
```

- Make sure you have mongo running in the background or most tests will not work.

## Debugging

### Server side

Start the server using

```
yarn dev
```

This will start the server on port `3005` with `inspect` option.

- In your Chrome go to: [Chrome Inspect](chrome://inspect)
- Under Remote Target now you should see `./index.js`, click on `inspect` link below it which will open a Chrome developer tools.

Now anywhere in your server side code you can put `debugger` and you should be able to debug.

## Running tasks

Use the `task` command to run scripts written in ES6 or Coffeescript. This is helpful for running backfills.

```
yarn task scripts/backfill.js
```

## Additional docs

You can find additional documentation about Positron in [doc](/doc).

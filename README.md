# Positron

[Positron](https://github.com/artsy/positron) is Artsy Writer or the editorial tool for Artsy.

![ArtsyWriter](/doc/images/ArtsyWriter.png)

## Meta

- **State:** production
- **Production:** [https://writer.artsy.net/](https://writer.artsy.net/) | [Kubernetes](https://kubernetes.prd.artsy.systems/#!/deployment/default/positron-web?namespace=default)
- **Staging:** [https://stagingwriter.artsy.net/](https://stagingwriter.artsy.net/) | [Kubernetes](https://kubernetes.stg.artsy.systems/#!/deployment/default/positron-web?namespace=default)
- **Logs:**
  - [Production](https://papertrailapp.com/groups/3675843/events?q=host%3Apositron-web)
  - [Staging](https://papertrailapp.com/groups/3674473/events?q=host%3Apositron-web)
- **Monitoring:**
  - [Production](https://app.datadoghq.com/apm/service/positron/express.request?end=1545136847351&env=production&paused=false&start=1545133247351)
  - [Staging](https://app.datadoghq.com/apm/service/positron/express.request?end=1545136799180&env=staging&paused=false&start=1545133199180)
- **MongoDB:** [Atlas](https://cloud.mongodb.com/v2/5be44a7aff7a254a8327cd3a#clusters)
- **Github:** [https://github.com/artsy/positron/](https://github.com/artsy/positron/)
- **CI:** [CircleCI](https://circleci.com/gh/artsy/positron); merged PRs to artsy/positron#main are automatically deployed to staging. PRs from `staging` to `release` are automatically deployed to production. [Start a deploy...](https://github.com/artsy/positron/compare/release...staging?expand=1)
- **Point Person:** [@mc-jones](https://github.com/mc-jones), [@dzucconi](https://github.com/dzucconi)

[![Build Status](https://circleci.com/gh/artsy/positron/tree/main.svg?style=svg)](https://circleci.com/gh/artsy/positron/tree/main) [![codecov](https://codecov.io/gh/artsy/positron/branch/main/graph/badge.svg)](https://codecov.io/gh/artsy/positron)

## Setup

Clone the project:

```
git clone git@github.com:artsy/positron.git && cd positron
```

Run the setup script:

```
scripts/setup.sh
```

> NOTE: for nvm users, after setup finishes: nvm use

Start the server:

```
yarn start
```

### Prepare database

#### Using staging database

In order to write articles, you will need to be a member of a channel. If you are an Artsy dev, you can point MONGOHQ_URL env to the staging database. Connecting to staging database requires VPN, please see details on [setting up a VPN connection here](https://github.com/artsy/infrastructure/blob/master/README.md#vpn).

#### Using a local database

With MongoDB running locally, follow these steps to create a dummy channel:

1. Create a collection called `channels` in a `positron` db in your mongo database (You can use the mongo shell or a simple UI like Robomongo.)
2. Add a document with the following fields:

```
{
  name: "Test Channel",
  type: "team", // this can be either editorial, team, support, or partner
  user_ids: [new ObjectId("<your_user_id>")]
}
```

If you are using Hokusai dev, edit the database as mentioned in this step, then restart the stack.

#### Start the server using Hokusai Dev

`COMMIT_HASH=$(git rev-parse --short HEAD) hokusai dev start`

This starts a new Docker Compose stack that boots MongoDB, search and Positron. Changes made to source-code are _not_ automatically reloaded. To shut down, press `ctrl+c` or execute `hokusai dev stop`.

Positron should now be running at [http://localhost:3005/](http://localhost:3005/), open a browser and navigate to it. That will redirect you to staging, login as an Artsy administrator and it will redirect you to `http://localhost:3005` logged into Writer.

If you are an Artsy Admin, you should see the default partner gallery channel (David Zwirner). If you aren't an artsy admin you'll possibly get an Unauthorized page. You need to do one more mongo operation: edit the `users` collection and set your user's `channel_ids` to `[ new ObjectId("<your_above_channel_id>") ]`. Once that's done you should be able to see the main writer interface.

## Run tests

### Using Yarn

> Mongo must be running in the background for tests to work.

```
yarn test
```

### Using Hokusai

```
hokusai test
```

## Debugging

### Server side

Start the server using

```
yarn dev
```

This will start the server on port `3005` with `inspect` option.

- In Chrome navigate to: [chrome://inspect](chrome://inspect)
- Under Remote Target you should see `./index.js`. Clicking on `inspect` link (below "Target") will open Chrome developer tools.

Now anywhere in your server side code you can put `debugger` and you should be able to debug!

## Running tasks

Use the `task` command to run scripts written in ES6 or Coffeescript. This is helpful for running backfills.

```
yarn task scripts/backfill.js
```

## Additional docs

You can find additional documentation about Positron in [doc](/doc).

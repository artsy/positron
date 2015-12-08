Positron
===

[Positron](https://github.com/artsy/positron) is Artsy Writer or the editorial tool for Artsy.

Meta
---

* __State:__ production
* __Production:__ [https://www.artsy.net/](https://www.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/positron-production/resources)
* __Staging:__ [https://staging.artsy.net/](https://staging.artsy.net/) | [Heroku](https://dashboard.heroku.com/apps/positron-staging/resources)
* __Github:__ [https://github.com/artsy/positron/](https://github.com/artsy/positron/)
* __CI:__ [Semaphore](https://semaphoreapp.com/artsy/positron/); merged PRs to artsy/positron#master are automatically deployed to staging; production is manually deployed from semaphore
* __Point People:__ [@craigspaeth](https://github.com/craigspaeth), [@kanaabe](https://github.com/kanaabe)

[![Build Status](https://semaphoreapp.com/api/v1/projects/f6c57bfa-d60c-476d-b7cf-5f3954b69495/253300/badge.png)](https://semaphoreapp.com/artsy/positron)

Set-Up
---

- Install [NVM](https://github.com/creationix/nvm)
- Install Node 5
```
nvm install 5
nvm alias default 5
```
- Fork Positron to your Github account in the Github UI.
- Clone your repo locally (substitute your Github username).
```
git clone git@github.com:craigspaeth/positron.git && cd positron
```
- Install node modules
```
npm install
```
- Create a .env file in the root of the project and paste in sensitive configuration. You can copy the .env.example and fill in the sensitive config with the config vars from staging `heroku config --app=positron-staging`.

  ( note: Leave non-sensitive configuration as it appears in the .env.example rather than copying over the config vars from `heroku config --app=positron-staging`. )
- Positron uses MongoDB as a database. To install MongoDB using homebrew do the following, if you would prefer to install manually check the documentation at [MongoDB](http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/)
```
brew install mongodb
```
- Start the MongoDB database
```
mongod
```
- Start the server
```
make s
```
- Positron should now be running at [http://localhost:3005/](http://localhost:3005/)

Additional docs
---

You can find additional documentation about Positron (deployments etc) in this repository's /doc directory.

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
* __Point People:__ [@craigspaeth](https://github.com/craigspaeth), [@dzucconi](https://github.com/dzucconi), [@broskoski](https://github.com/broskoski), [@kanaabe](https://github.com/kanaabe)

[![Build Status](https://semaphoreapp.com/api/v1/projects/f6c57bfa-d60c-476d-b7cf-5f3954b69495/253300/badge.png)](https://semaphoreapp.com/artsy/positron)

Set-Up
---

- Install [NVM](https://github.com/creationix/nvm)
- Install Node 0.12
```
nvm install 0.12
nvm alias default 0.12
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
- Start the server
```
make s
```
- Positron should now be running at [http://localhost:3005/](http://localhost:3005/)

Additional docs
---

You can find additional documentation about Positron (deployments etc) in this repository's /doc directory.

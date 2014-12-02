# Positron's Private API

Positron uses MongoDB + Express to serve a private JSON API which the /client app consumes. The app serving this API can be found under /api. This will serve as the poor man's app & API documentation.

## Architecture

Positron's API architecture is very thin. Endpoints are split into sub-express apps under /api/apps. These apps represent a resouce and contain routes (like Rails controllers) that do auth/session/routing/etc. for a resource. Apps also contain a model that handles validation/persistence/busines logics/etc. of a resource. Unlike typical ActiveRecord/object-oriented models, these models are just libraries of database transcations that operate on vanilla data objects (using [mongojs](https://github.com/mafintosh/mongojs))—otherwise known as the [Transcation Script pattern](http://martinfowler.com/eaaCatalog/transactionScript.html). As the model logic grows it's encouraged to break apart the library into it's individual parts (e.g. model/domain.coffee, model/validation, model/persistence etc.). A root `index.coffee` app glues together the sub apps & api-wide middleware found under `/lib`.

## Authentication

Positron uses Gravity to do authentication so all endpoints require a valid Artsy `X-Access-Token` header. Positron will use this to flatten, merge, and cache user data from Arty's API for easy client consumption. Use `DELETE /users/me` to remove this cached data when the user logs out.

## The `me` param

You may pass `me` in place of your user id, e.g. `/articles?author_id=me` to get your own articles. Positron reserves `me` as a keyword to look up your user based on the `X-Access-Token` header.

## Endpoints

Positron's API is a boring ol' [pragmatic REST API](https://blog.apigee.com/detail/api_design_a_new_model_for_pragmatic_rest). It speaks only JSON, and uses plural resources with POST/GET/PUT/DELETE verbs for CRUD. Accepted endpoints include:

GET /articles?author_id=
GET /articles/:id
POST /articles
PUT /articles/:id
DELETE /articles/:id

GET /sync_to_post?article_id=

GET /users?q=
GET /users/:id
PUT /users/:id
POST /users

GET /artworks?ids[]=warhol-skull&ids[]=54276766fd4f50996aeca2b8
GET /artworks?q=Skull

GET /artists?ids[]=warhol-skull&ids[]=54276766fd4f50996aeca2b8
GET /artists?q=Skull
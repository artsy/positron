# Positron's Private API

Positron uses MongoDB + Express to serve a private JSON API which the /client app consumes. The app serving this API can be found under /api. This will serve as the poor man's app & API documentation.

## Architecture

Positron's API architecture is very thin. Endpoints are split into sub-express apps under /api/apps. These apps represent a resouce and contain routes (like Rails controllers) that do auth/session/routing/etc. for a resource. Apps also contain a model that handles validation/persistence/busines logic/etc. of a resource. Unlike typical ActiveRecord/object-oriented models, these models are just libraries of database transcations that operate on vanilla data objects (using [mongodb](https://github.com/mongodb/node-mongodb-native))—otherwise known as the [Transcation Script pattern](http://martinfowler.com/eaaCatalog/transactionScript.html). As the model logic grows it's encouraged to break apart the library into it's individual parts (e.g. model/domain.coffee, model/validation.coffee, model/persistence.coffee etc.). A root `index.coffee` app glues together the sub apps & api-wide middleware found under `/lib`.

## Authentication

Positron uses Gravity to do authentication so all endpoints require a valid Artsy `X-Access-Token` header. Positron will use this to flatten, merge, and cache user data from Arty's API for easy client consumption.

## The `me` param

You may pass `me` in place of your user id, e.g. `/articles?author_id=me` to get your own articles. Positron reserves `me` as a keyword to look up your user based on the `X-Access-Token` header.

## Endpoints

Positron's API is a [pragmatic REST API](https://blog.apigee.com/detail/api_design_a_new_model_for_pragmatic_rest). It speaks only JSON, and uses plural resources with POST/GET/PUT/DELETE verbs for CRUD. Endpoints that don't map so easily to CRUD on a resource are designed as root-level GET requests such as /sync_to_post?article_id=. Accepted endpoints include:

### Articles

GET /articles

**params:**

- published: Always pass `true` for logged out users
- author_id: Query articles by their author
- artist_id: Query articles by an artist they're featured to
- artwork_id: Query articles by an artwork they're featured to
- section_id: Query articles by their section
- fair_id: Query articles by a fair they're featured to
- fair_ids: Query articles by multiple fairs
- show_id: Query articles by a show they're featured to
- partner_id: Query articles by the partner profile they're featured on
- auction_id: Query articles by an auction they're featured to
- tier: Query articles by their tier
- featured: Query articles by if they're featured to Magazine
- exclude_google_news: Query articles that shouldn't appear in Google News
- super_article_for: Find parent super articles for a given article
- all_by_author: Query articles that have an author or contributing author by a user id
- tags: Query articles by multiple tags
- is_super_article: Query articles that are super articles
- biography_for_artist_id: Query articles by their artist biography
- layout: Query articles by their layout type
- has_video: Query articles that contain a video section
- channel_id: Query articles by a channel id
- partner_channel_id: Query articles by a partner channel id

GET /articles/:id
POST /articles
PUT /articles/:id
DELETE /articles/:id
GET /sync_to_post?article_id=

#### A note on `gravity_id`

Before articles existed in Positron, they lived in Gravity's API. All articles have now been moved to Positron's database, but there are a number of legacy articles ported from Gravity that do not belong to a channel, and are therefore not editable via Writer, and sometimes not searchable via the `id` param. If you are looking for a published article that does not return when searching for the `id`, try searching for it using the `gravity_id`.

### Users

**params:**

- access_token: Gravity access token for auth

GET /users/me

### Sections

GET /sections

**params:**

- featured: Query sections by featured

POST /sections
GET /sections/:id
PUT /sections/:id
DELETE /sections/:id

### Channels

GET /channels

**params:**

- user_id: Query channels that a user belongs to

POST /channels
GET /channels/:id
PUT /channels/:id
DELETE /channels/:id

### Curations

GET /curations
POST /curations
GET /curations/:id
PUT /curations/:id
DELETE /curations/:id

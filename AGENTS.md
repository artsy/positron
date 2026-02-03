# AGENTS.md

This file provides guidance to agents when working with code in this repository.

The information here is generated with Claude's `/init` command. It smells right but is not _fully_ vetted, so caveat lector.

## Overview

Positron is Artsy's editorial CMS (internally called "Writer"). It's a full-stack Node.js application combining an Express API with a client-side editorial interface. The application manages articles, authors, channels, curations, and other editorial content that gets distributed to Artsy.net, Google AMP, RSS feeds, and Google News.

## Commands

### Development

```bash
# Start the development server (runs on port 3005 with hot-reload)
yarn start

# Start with debugging enabled (port 3005 with inspect mode)
yarn dev
```

### Testing

```bash
# Run all tests (mocha + jest)
yarn test

# Run only jest tests
yarn jest

# Run jest tests in watch mode
yarn test:watch

# Run only mocha tests
yarn mocha <path>

# Run single test file
yarn mocha src/api/apps/articles/test/model.test.coffee
yarn jest src/client/components/article_list/test/ArticleList.test.tsx
```

### Code Quality

```bash
# Run linter
yarn lint

# Run linter with auto-fix
yarn lint --fix

# Run type checking
yarn type-check

# Format code with Prettier
yarn prettier-project
```

### Docker/Hokusai

```bash
# Start with Hokusai Dev (includes MongoDB, OpenSearch, and Positron)
COMMIT_HASH=$(git rev-parse --short HEAD) hokusai dev start

# Run tests with Hokusai
hokusai test
```

## Architecture

### High-Level Structure

Positron is organized as two separate Express applications that are combined at boot time:

- **API** (`src/api/`): Private JSON REST API + GraphQL endpoint
- **Client** (`src/client/`): Server-rendered editorial interface (the "Writer" app)

Both apps are mounted in `src/boot.js`, which is loaded by `src/index.js`.

### API Architecture (`src/api/`)

The API follows a **Transaction Script pattern** rather than traditional OOP models:

- **Apps** (`src/api/apps/`): Sub-Express apps representing resources (articles, authors, channels, etc.)
  - Each app contains:
    - `index.coffee` or `index.js`: App setup and middleware
    - `routes.coffee` or `routes.js`: Route handlers (like Rails controllers)
    - `model/`: Database transaction functions (NOT ActiveRecord-style objects)
      - `index.js`: Main model logic
      - `schema.coffee`: Joi validation schemas
      - `retrieve.js`: Query building and retrieval
      - `save.coffee`: Persistence logic
      - Other domain-specific modules as needed
- **Models as Libraries**: Models are collections of functions that operate on plain data objects using MongoDB (via mongojs), not ORM instances
- **Validation**: Uses Joi for schema validation (`src/api/lib/joi.coffee`)
- **Authentication**: All endpoints require Artsy `X-Access-Token` header; uses Gravity for auth
- **Special param**: `me` can be used in place of user IDs (e.g., `/articles?author_id=me`)

### Client Architecture (`src/client/`)

The client is a server-rendered application using a mix of React, Backbone, and legacy code:

- **Apps** (`src/client/apps/`): Feature-specific sub-applications
  - `edit/`: Article editing interface
  - `articles_list/`: Browse/manage articles
  - `settings/`: Configuration and admin
  - `queue/`: Article publishing queue
  - Each app has its own routes, components, and client-side entry point
- **Components** (`src/client/components/`): Reusable UI components (mix of React and Backbone)
- **Mix of Technologies**:
  - React (modern components)
  - Backbone (legacy components)
  - Draft.js (rich text editing)
  - Redux (state management in some areas)
  - Styled Components (styling)

### Key Concepts

**Channels**: Groups of users with specific permissions. Articles belong to channels, which determine available layouts and features. Essential for multi-team editorial management.

**Article Layouts**: Different visual presentations (standard, feature, series, news, video, etc.). Layout determines available editing features in Writer.

**Custom Editorial Features**: Special one-off articles with unique layouts/experiences. Implemented via `EditorialFeature` component in the Reaction library (see `doc/editorial-features.md`).

**SuperArticles** (legacy): Articles with `is_super_article: true`. Can have related articles and sponsor fields. Being deprecated in favor of more flexible approach.

**Curations**: Schema-less content model for highly custom content that doesn't fit article structure. Requires custom edit UI and rendering.

### Distribution

When articles are published, content is distributed to:

- Artsy.net (via Metaphysics and Force)
- Google AMP (`/amp` endpoint)
- RSS feeds
- Google News (via sitemaps)

See `doc/distribution.md` for details.

### GraphQL API

Positron exposes a GraphQL endpoint at `/api/graphql`:

- Built with joiql (Joi + GraphQL)
- Queries for articles, authors, channels, curations, tags
- GraphiQL interface available in development
- See `src/api/apps/graphql/index.js`

### Database

- **MongoDB**: Main database (accessed via `mongojs` wrapper)
- **OpenSearch/Elasticsearch**: Search functionality (see `src/api/apps/search/`)
- Connection configured via `MONGOHQ_URL` environment variable
- No ORM - uses direct MongoDB queries with vanilla JS objects

## Code Patterns

### Language Mix

The codebase contains multiple languages and should be maintained consistently:

- **CoffeeScript**: Legacy code, primarily in API routes and older models
- **JavaScript (ES6+)**: Newer API code and utilities
- **TypeScript**: React components and modern client code
- **Stylus**: Styling (legacy)
- **Styled Components**: Modern component styling

When editing existing files, maintain the file's current language. For new files, prefer TypeScript/JavaScript over CoffeeScript.

### Test Files

Tests use two patterns:

- `*.test.coffee` or `*.test.js` / `*.test.tsx`: Mocha tests (legacy)
- `*.spec.ts` / `*.spec.tsx`: Jest tests (modern)

## Environment Setup

1. Copy `.env.example` to `.env`
2. Key environment variables:
   - `MONGOHQ_URL`: MongoDB connection string
   - `ARTSY_URL`, `ARTSY_ID`, `ARTSY_SECRET`: Artsy API credentials
   - `NODE_ENV`: development/staging/production
   - `PORT`: Default 3005
3. For Artsy devs: Can point to staging database (requires VPN)
4. For local MongoDB: Must create `channels` collection and add user

## TypeScript Configuration

- Base path: `./src` (allows absolute imports from src)
- JSX: React
- Strict null checks enabled
- Module resolution: node
- Type checking: `yarn type-check`

## Deployment

- **CI**: CircleCI
- **Staging**: Auto-deploys from `main` branch
- **Production**: Deploy by creating PR from `staging` to `release` branch
- Kubernetes deployment (see README for links)
- Docker-based via Artsy's Hokusai tool

## Related Repositories

- **Force**: Artsy.net frontend - renders published articles
- **Reaction**: Component library - contains article display components
- **Metaphysics**: GraphQL gateway - may query Positron data
- **Gravity**: Artsy's main API - handles authentication

## Debugging

Server-side debugging:

1. Run `yarn dev` (starts with `--inspect`)
2. Navigate to `chrome://inspect`
3. Click "inspect" under Remote Target
4. Use `debugger` statements in code

## Common Gotchas

- MongoDB must be running locally for tests (unless using Hokusai)
- Changes to server code in development mode are hot-reloaded via `@artsy/express-reloadable`
- Webpack dev middleware provides client-side hot reloading
- Socket.io used for real-time features (article locking, etc.)
- `me` is a reserved keyword - don't use as an ID
- Article distribution (to Force, AMP, etc.) happens on publish, not on save

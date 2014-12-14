#
# Make -- the OG build tool.
# Add any build tasks here and abstract complex build scripts into `lib` that
# can be run in a Makefile task like `coffee lib/build_script`.
#
# Remember to set your text editor to use 4 size non-soft tabs.
#

BIN = node_modules/.bin

# Start the server
s:
	$(BIN)/coffee index.coffee

# Runs a migration script to pull in old posts from gravity
migrate:
	$(BIN)/coffee api/lib/migrate.coffee

# Runs a migration script to pull in old posts from gravity
sync-users:
	$(BIN)/coffee api/lib/sync_users.coffee

# Run all of the project-level tests, followed by app-level tests
test: assets
	$(BIN)/mocha $(shell find api/test -name '*.coffee' -not -path 'test/helpers/*')
	$(BIN)/mocha $(shell find api/apps/*/test -name '*.coffee' -not -path 'test/helpers/*')
	$(BIN)/mocha $(shell find client/test -name '*.coffee' -not -path 'test/helpers/*')
	$(BIN)/mocha $(shell find client/apps/*/test -name '*.coffee' -not -path 'test/helpers/*')
	$(BIN)/mocha $(shell find client/apps/*/**/*/test -name '*.coffee' -not -path 'test/helpers/*')

# Run app in test mode
test-s:
	$(BIN)/coffee test/helpers/integration.coffee

# Generate minified assets from the /assets folder and output it to /public.
assets:
	mkdir -p client/public/assets
	$(BIN)/ezel-assets client/assets/ client/public/assets/

# Deploys to Heroku. Run with `make deploy env=staging` or `make deploy env=production`.
deploy:
	git push git@heroku.com:positron-$(env).git master

.PHONY: test assets

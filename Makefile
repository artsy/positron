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

# Start the server using forever
sf:
	$(BIN)/forever $(BIN)/coffee index.coffee

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

# Find unlinked artists
unlinked:
	$(BIN)/coffee scripts/unlinked_artists.coffee

publish-scheduled:
	$(BIN)/coffee scripts/scheduled_posts.coffee

link-artists:
	rm scripts/tmp/artist_names.txt
	$(BIN)/coffee scripts/get_artist_names.coffee
	$(BIN)/coffee scripts/link_artists.coffee


# Deploys to Heroku. Run with `make deploy env=staging` or `make deploy env=production`.
deploy: assets
	$(BIN)/bucket-assets -b positron-$(env)
	heroku config:set COMMIT_HASH=$(shell git rev-parse --short HEAD) --app=positron-$(env)
	git push --force git@heroku.com:positron-$(env).git master

.PHONY: test assets

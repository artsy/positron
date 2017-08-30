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
	DEBUG=app,client,api node ./index.js

# Start the server using forever
sf:
	$(BIN)/forever ./index.js --max-old-space-size=512

# Run all of the project-level tests, followed by app-level tests
test: assets
	$(BIN)/mocha $(shell find api -name '*.test.coffee')
	$(BIN)/mocha $(shell find api -name '*.test.js')
	$(BIN)/mocha $(shell find client -name '*.test.coffee')
	$(BIN)/jest $(shell find client -name '*.test.js')

# Run app in test mode
test-s:
	$(BIN)/coffee test/helpers/integration.coffee

# Generate minified assets from the /assets folder and output it to /public.
assets:
	mkdir -p client/public/assets
	NODE_ENV=production $(BIN)/ezel-assets client/assets/ client/public/assets/

# Find unlinked artists
unlinked:
	$(BIN)/coffee scripts/unlinked_artists.coffee

publish-scheduled:
	$(BIN)/coffee scripts/scheduled_posts.coffee

link-artists:
	rm scripts/tmp/artist_names.txt
	$(BIN)/coffee scripts/get_artist_names.coffee
	$(BIN)/coffee scripts/link_artists.coffee

.PHONY: test assets

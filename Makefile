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

# Run all of the project-level tests, followed by app-level tests
test: assets
	$(BIN)/mocha $(shell find test -name '*.coffee' -not -path 'test/helpers/*')
	$(BIN)/mocha $(shell find apps/*/test -name '*.coffee' -not -path 'test/helpers/*')

# Generate minified assets from the /assets folder and output it to /public.
assets:
	mkdir -p public/assets
	$(BIN)/ezel-assets assets/ public/assets/

# Deploys to Heroku. Run with `make deploy env=staging` or `make deploy env=production`.
deploy:
	git push git@heroku.com:positron-$(env).git master

.PHONY: test assets

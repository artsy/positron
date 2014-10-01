#
# Integration test helper that makes it easy to write fast integration tests.
# One of the ways it does this is by providing the methods `startServer` and
# `closeServer` that will spawn a child process of this project. This means
# a version of this project server will run on localhost:5000 using a fake
# API server exposed below as `api`.
#
spawn = require("child_process").spawn
express = require "express"
fixtures = require './fixtures'
antigravity = require 'antigravity'

# Stubbed API servers
@gravity = antigravity.server
@spooky = express()
@spooky.get "/", (req, res) -> res.send
  _links:
    articles:
      href: "http://localhost:5000/__spooky/api/articles"
@spooky.get "/api/articles", (req, res) -> res.send
  _embedded:
    articles: [fixtures.article]

# Spawns a child process with test .env.test variables
@startServer = (callback) =>
  return callback() if @child?
  @child = spawn "make", ["test-s"],
    customFds: [0, 1, 2]
    stdio: ["ipc"]
  @child.on "message", -> callback()
  @child.stdout.pipe process.stdout

# Closes the server child process, used in an `after` hook and on
# `process.exit` in case the test suite is interupted.
@closeServer = =>
  @child?.kill()
  @child = null

process.on "exit", @closeServer
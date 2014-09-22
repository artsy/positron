_ = require 'underscore'
jade = require 'jade'
moment = require 'moment'
fs = require 'fs'
Backbone = require 'backbone'
Articles = require '../../../collections/articles'
fixtures = require '../../../test/helpers/fixtures'
{ resolve } = require 'path'

render = (locals) ->
  filename = resolve __dirname, "../index.jade"
  jade.compile(
    fs.readFileSync(filename),
    { filename: filename }
  ) _.extend locals, fixtures.locals

describe 'article list template', ->

  it 'renders an article title', ->
    articles = new Articles([fixtures.article])
    articles.first().set title: 'Hello Blue World'
    render(articles: articles.models).should.containEql 'Hello Blue World'
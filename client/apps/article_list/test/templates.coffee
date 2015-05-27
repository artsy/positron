_ = require 'underscore'
jade = require 'jade'
moment = require 'moment'
fs = require 'fs'
Backbone = require 'backbone'
Articles = require '../../../collections/articles'
fixtures = require '../../../../test/helpers/fixtures'
{ resolve } = require 'path'

render = (locals) ->
  filename = resolve __dirname, "../index.jade"
  jade.compile(
    fs.readFileSync(filename),
    { filename: filename }
  ) _.extend locals, fixtures().locals

describe 'article list template', ->

  it 'renders an article thumbnail_title', ->
    articles = new Articles [fixtures().articles]
    articles.first().set thumbnail_title: 'Hello Blue World'
    render(articles: articles).should.containEql 'Hello Blue World'
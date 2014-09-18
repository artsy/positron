Backbone = require 'backbone'
SpookyModel = require '../../models/spooky'
fixtures = require '../helpers/fixtures'

class Article extends SpookyModel
  modelName: 'article'

describe 'SpookyModel', ->
  describe '#initialize', ->
    it 'throws an error unless there is a modelName', ->
      (-> new SpookyModel).should.throw 'Please define a modelName'

    it 'otherwise works as expected', ->
      model = new Article foo: 'bar'
      model.get('foo').should.equal 'bar'

  describe '#parse', ->
    it 'correctly parses the Spooky responses', ->
      article = new Article fixtures.model, parse: true
      article.id.should.equal 2
      article.get('title').should.equal 'The art in Copenhagen is soo over'
      article.has('_links').should.be.false
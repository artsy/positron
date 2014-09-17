Backbone = require 'backbone'
SpookyModel = require '../../models/spooky'
SpookyCollection = require '../../collections/spooky'
fixtures = require '../helpers/fixtures'

class Article extends SpookyModel
  modelName: 'article'
class Articles extends SpookyCollection
  model: Article
  modelName: 'article'

describe 'SpookyCollection', ->
  describe '#initialize', ->
    it 'throws an error unless there is a modelName', ->
      (-> new SpookyCollection).should.throw 'Please define a modelName'

    it 'otherwise works as expected', ->
      collection = new Articles [id: 'foobar']
      collection.first().id.should.equal 'foobar'

  describe '#parse', ->
    it 'correctly parses the Spooky responses', ->
      articles = new Articles fixtures.collection, parse: true
      articles.length.should.equal 2
      article = articles.first()
      article.id.should.equal 2
      article.get('title').should.equal 'The art in Copenhagen is soo over'
      article.has('_links').should.be.false
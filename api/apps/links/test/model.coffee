_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
LinkSet = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Link Set', ->

  beforeEach (done) ->
    empty ->
      fabricate 'links', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all link sets along with total and counts', (done) ->
      LinkSet.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].slug.should.equal 'homepage:articles'
        done()

  describe '#find', ->

    it 'finds a link set by an id string', (done) ->
      fabricate 'links', { _id: ObjectId('5086df098523e60002000018') }, ->
        LinkSet.find '5086df098523e60002000018', (err, linkSet) ->
          linkSet._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid link set input data', (done) ->
      LinkSet.save {
        title: 'The General Title'
        slug: 'homepage:articles'
        featured_links: [
          { url: 'https://artsy.net', thumbnail_url: 'https://artsy.net/img.jpg', title: 'Homepage Link' }
          { url: 'https://artsy.net/articles', thumbnail_url: 'https://artsy.net/articles/img.jpg', title: 'Article Link' }
        ]
      }, (err, linkSet) ->
        linkSet.title.should.equal 'The General Title'
        linkSet.slug.should.equal 'homepage:articles'
        linkSet.featured_links[0].url.should.equal 'https://artsy.net'
        linkSet.featured_links[0].thumbnail_url.should.equal 'https://artsy.net/img.jpg'
        linkSet.featured_links[0].title.should.equal 'Homepage Link'
        db.links.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.links.findOne (err, linkSet) ->
        data = LinkSet.present linkSet
        (typeof data.id).should.equal 'string'
        done()

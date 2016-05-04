_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Curations = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Curations', ->

  beforeEach (done) ->
    empty ->
      fabricate 'curations', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all curations along with total and counts', (done) ->
      Curations.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Featured Articles'
        done()

  describe '#find', ->

    it 'finds a curation by an id string', (done) ->
      fabricate 'curations', { _id: ObjectId('5086df098523e60002000018') }, ->
        Curations.find '5086df098523e60002000018', (err, curation) ->
          curation._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid curation input data', (done) ->
      Curations.save {
        name: 'The General Title'
      }, (err, curation) ->
        curation.name.should.equal 'The General Title'
        db.curations.count (err, count) ->
          count.should.equal 11
          done()

    it 'saves valid curation input data with additional fields', (done) ->
      Curations.save {
        name: 'The General Title'
        type: 'email-signup'
        links: [
          { url: 'https://artsy.net', thumbnail_url: 'https://artsy.net/img.jpg', title: 'Homepage Link' }
          { url: 'https://artsy.net/articles', thumbnail_url: 'https://artsy.net/articles/img.jpg', title: 'Article Link' }
        ]
      }, (err, curation) ->
        curation.name.should.equal 'The General Title'
        curation.type.should.equal 'email-signup'
        curation.links[0].url.should.equal 'https://artsy.net'
        curation.links[0].thumbnail_url.should.equal 'https://artsy.net/img.jpg'
        curation.links[0].title.should.equal 'Homepage Link'
        db.curations.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.curations.findOne (err, curation) ->
        data = Curations.present curation
        (typeof data.id).should.equal 'string'
        done()

_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Author = require '../model'
{ ObjectId } = require 'mongodb'

describe 'Author', ->

  beforeEach (done) ->
    empty ->
      fabricate 'authors', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all authors along with total and counts', (done) ->
      Author.where { count: true }, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Halley Johnson'
        done()

    it 'can return authors by multiple ids', (done) ->
      fabricate 'authors', [
        { _id: ObjectId('5086df098523e60002000018'), name: "Eve" },
        { _id: ObjectId('55356a9deca560a0137bb4a7'), name: "Kana" }
      ], ->
          Author.where {
            count: true
            ids: ['5086df098523e60002000018', '55356a9deca560a0137bb4a7']
          }, (err, res) ->
            { total, count, results } = res
            total.should.equal 12
            count.should.equal 2
            results[0].name.should.equal 'Kana'
            results[1].name.should.equal 'Eve'
            done()

  describe '#find', ->

    it 'finds an author by an id string', (done) ->
      fabricate 'authors', { _id: ObjectId('5086df098523e60002000018') }, ->
        Author.find '5086df098523e60002000018', (err, author) ->
          author._id.toString().should.equal '5086df098523e60002000018'
          done()

    it 'finds the author by name', (done) ->
      fabricate 'authors', { name: 'Kana Abe' }, ->
        Author.find 'Kana Abe', (err, author) ->
          author.name.should.equal 'Kana Abe'
          done()

  describe '#save', ->

    it 'saves valid author input data', (done) ->
      Author.save {
        name: 'Owen Dodd'
        image_url: 'https://artsy-media/owen.jpg'
        twitter_handle: '@owendodd'
        bio: 'Designer based in NYC'
      }, (err, author) ->
        author.name.should.equal 'Owen Dodd'
        author.image_url.should.equal 'https://artsy-media/owen.jpg'
        author.twitter_handle.should.equal '@owendodd'
        author.bio.should.equal 'Designer based in NYC'
        db.authors.count (err, count) ->
          count.should.equal 11
          done()

    it 'can return a validation error', (done) ->
      Author.save {
        name: 500
        id: '5936f5530fae440cda9ae052'
      }, (err, author) ->
        err.details[0].message.should.containEql '"name" must be a string'
        done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.authors.findOne (err, author) ->
        data = Author.present author
        (typeof data.id).should.equal 'string'
        done()

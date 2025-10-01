_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Author = require '../model'
{ ObjectId } = require 'mongodb-legacy'

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
        { _id: new ObjectId('5086df098523e60002000018'), name: "Eve" },
        { _id: new ObjectId('55356a9deca560a0137bb4a7'), name: "Kana" }
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
      fabricate 'authors', { _id: new ObjectId('5086df098523e60002000018') }, ->
        Author.find '5086df098523e60002000018', (err, author) ->
          author._id.toString().should.equal '5086df098523e60002000018'
          done()

    it 'finds the author by slug', (done) ->
      fabricate 'authors', { name: 'Kana Abe', slug: 'kana-abe' }, ->
        Author.find 'kana-abe', (err, author) ->
          author.name.should.equal 'Kana Abe'
          author.slug.should.equal 'kana-abe'
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
        Author.save { id: author._id.toString(), name: 'Jane Doe'}, (err, updatedAuthor) ->
          updatedAuthor._id.toString().should.equal author._id.toString()
          updatedAuthor.name.should.equal 'Jane Doe'
        db.collection('authors').count (err, count) ->
          count.should.equal 11
          done()

    it 'automatically generates slug from name', (done) ->
      Author.save {
        name: 'Jane Doe'
      }, (err, author) ->
        author.slug.should.equal 'jane-doe'
        done()

    it 'ensures slug uniqueness by adding counter suffix', (done) ->
      Author.save { name: 'John Smith' }, (err, author1) ->
        author1.slug.should.equal 'john-smith'
        Author.save { name: 'John Smith' }, (err, author2) ->
          author2.slug.should.equal 'john-smith-1'
          Author.save { name: 'John Smith' }, (err, author3) ->
            author3.slug.should.equal 'john-smith-2'
            done()

    it 'preserves custom slug if provided', (done) ->
      Author.save {
        name: 'Custom Author'
        slug: 'my-custom-slug'
      }, (err, author) ->
        author.slug.should.equal 'my-custom-slug'
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
      db.collection('authors').findOne (err, author) ->
        data = Author.present author
        (typeof data.id).should.equal 'string'
        done()

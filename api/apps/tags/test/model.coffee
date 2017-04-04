_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Tag = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Tag', ->

  beforeEach (done) ->
    empty ->
      fabricate 'tags', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all tags along with total and counts', (done) ->
      Tag.where { count: true }, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Show Reviews'
        results[0].public.should.be.true()
        done()

  describe '#find', ->

    it 'finds a tag by an id string', (done) ->
      fabricate 'tags', { _id: ObjectId('5086df098523e60002000018') }, ->
        Tag.find '5086df098523e60002000018', (err, tag) ->
          tag._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid tag input data', (done) ->
      Tag.save {
        name: 'Berlin'
        public: true
      }, (err, tag) ->
        tag.name.should.equal 'Berlin'
        tag.public.should.be.true()
        db.tags.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.tags.findOne (err, tag) ->
        data = Tag.present tag
        (typeof data.id).should.equal 'string'
        done()

_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Vertical = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Vertical', ->

  beforeEach (done) ->
    empty ->
      fabricate 'verticals', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all verticals along with total and counts', (done) ->
      Vertical.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].title.should.equal 'Vennice Biennalez'
        done()

  describe '#find', ->

    it 'finds an vertical by an id string', (done) ->
      fabricate 'verticals', { _id: ObjectId('5086df098523e60002000018') }, ->
        Vertical.find '5086df098523e60002000018', (err, vertical) ->
          vertical._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid vertical input data', (done) ->
      Vertical.save {
        title: 'Top Ten Shows'
        description: 'Hello World'
      }, (err, vertical) ->
        vertical.title.should.equal 'Top Ten Shows'
        vertical.description.should.equal 'Hello World'
        db.verticals.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.verticals.findOne (err, vertical) ->
        data = Vertical.present vertical
        (typeof data.id).should.equal 'string'
        done()

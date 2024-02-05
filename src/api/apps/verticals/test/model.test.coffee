_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Vertical = require '../model'
{ ObjectId } = require 'mongodb'

describe 'Vertical', ->

  beforeEach (done) ->
    empty ->
      fabricate 'verticals', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all verticals along with total and counts', (done) ->
      Vertical.where { count: true }, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Culture'
        done()

  describe '#find', ->

    it 'finds a vertical by an id string', (done) ->
      fabricate 'verticals', { _id: new ObjectId('5086df098523e60002000018') }, ->
        Vertical.find '5086df098523e60002000018', (err, vertical) ->
          vertical._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid vertical input data', (done) ->
      Vertical.save {
        name: 'Art Market'
      }, (err, vertical) ->
        vertical.name.should.equal 'Art Market'
        Vertical.save {id: vertical._id.toString(), name: 'Art Market Updated'}, (err, updatedVertical) ->
          updatedVertical._id.toString().should.equal vertical.id.toString()
          updatedVertical.name.should.equal 'Art Market Updated'
        db.collection('verticals').count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.collection('verticals').findOne (err, vertical) ->
        data = Vertical.present vertical
        (typeof data.id).should.equal 'string'
        done()

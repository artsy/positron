_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Channel = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Channel', ->

  beforeEach (done) ->
    empty ->
      fabricate 'channels', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all channels along with total and counts', (done) ->
      Channel.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Editorial'
        done()

  describe '#find', ->

    it 'finds a channel by an id string', (done) ->
      fabricate 'channels', { _id: ObjectId('5086df098523e60002000018') }, ->
        Channel.find '5086df098523e60002000018', (err, channel) ->
          channel._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid channel input data', (done) ->
      Channel.save {
        name: 'Editorial'
        user_ids: ['5086df098523e60002000015', '5086df098523e60002000014']
      }, (err, channel) ->
        channel.user_ids[0].toString().should.equal '5086df098523e60002000015'
        channel.user_ids[1].toString().should.equal '5086df098523e60002000014'
        db.channels.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.channels.findOne (err, channel) ->
        data = Channel.present channel
        (typeof data.id).should.equal 'string'
        done()

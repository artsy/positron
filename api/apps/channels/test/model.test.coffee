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

    it 'finds channels by a user_id', (done) ->
      Channel.save {
        name: 'Channel'
        user_ids: ['5086df098523e60002000015', '5086df098523e60002000014']
        type: 'editorial'
      }, (err, channel) ->
        Channel.where
          user_id: '5086df098523e60002000015'
        , (err, res) ->
          { total, count, results } = res
          total.should.equal 11
          count.should.equal 1
          results[0].name.should.equal 'Channel'
          done()

    it 'can sort channels', (done) ->
      Channel.save {
        name: 'Apple'
      }, (err, channel) ->
        Channel.save {
          name: 'Banana'
        }, (err, channel) ->
          Channel.where
            sort: 'name'
          , (err, res) ->
            { total, count, results } = res
            results[0].name.should.equal 'Apple'
            results[1].name.should.equal 'Banana'
            results[2].name.should.equal 'Editorial'
            done()

  describe '#find', ->

    it 'finds a channel by an id string', (done) ->
      fabricate 'channels', { _id: ObjectId('5086df098523e60002000018') }, ->
        Channel.find '5086df098523e60002000018', (err, channel) ->
          channel._id.toString().should.equal '5086df098523e60002000018'
          done()

    it 'finds a channel by a slug', (done) ->
      fabricate 'channels', { slug: 'life-at-artsy' }, ->
        Channel.find 'life-at-artsy', (err, channel) ->
          channel.slug.should.equal 'life-at-artsy'
          done()

  describe '#save', ->

    it 'saves valid channel input data', (done) ->
      Channel.save {
        name: 'Editorial'
        user_ids: ['5086df098523e60002000015', '5086df098523e60002000014']
        type: 'editorial'
      }, (err, channel) ->
        channel.user_ids[0].toString().should.equal '5086df098523e60002000015'
        channel.user_ids[1].toString().should.equal '5086df098523e60002000014'
        channel.type.should.equal 'editorial'
        db.channels.count (err, count) ->
          count.should.equal 11
          done()

    it 'saves valid channel metadata', (done) ->
      Channel.save {
        name: 'Editorial'
        links: [
          { url: 'artsy.net/galleries', text: 'Galleries' }
          { url: 'artsy.net/institutions', text: 'Institutions' }
          { url: 'artsy.net/shows', text: 'Shows' }
        ]
        tagline: 'A bunch of cool stuff at Artsy'
        image_url: 'artsy.net/image.jpg'
        slug: 'editorial'
        pinned_articles: [
          {
            id: '5086df098523e60002000015'
            index: 0
          },
          {
            id: '5086df098523e60002000011'
            index: 1
          }
        ]
      }, (err, channel) ->
        channel.links.length.should.equal 3
        channel.links[0].url.should.equal 'artsy.net/galleries'
        channel.links[1].text.should.equal 'Institutions'
        channel.links[2].url.should.equal 'artsy.net/shows'
        channel.tagline.should.equal 'A bunch of cool stuff at Artsy'
        channel.image_url.should.equal 'artsy.net/image.jpg'
        channel.slug.should.equal 'editorial'
        channel.pinned_articles[0].id.toString().should.equal '5086df098523e60002000015'
        channel.pinned_articles[1].id.toString().should.equal '5086df098523e60002000011'
        done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.channels.findOne (err, channel) ->
        data = Channel.present channel
        (typeof data.id).should.equal 'string'
        done()

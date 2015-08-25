_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
BrandPartner = require '../model'
{ ObjectId } = require 'mongojs'

describe 'BrandPartner', ->

  beforeEach (done) ->
    empty ->
      fabricate 'brandPartners', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all brand partners along with total and counts', (done) ->
      BrandPartner.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].partner_id.should.equal '559ff9706b69f6a086a65632'
        done()

    it 'finds a brand partner by partner_id', (done) ->
      fabricate 'brandPartners', { partner_id: ObjectId('5086df098523e60002000018') }, ->
        BrandPartner.where { partner_id: '5086df098523e60002000018' } , (err, res) ->
          res.results[0].partner_id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#find', ->

    it 'finds a brand partner by an id string', (done) ->
      fabricate 'brandPartners', { _id: ObjectId('5086df098523e60002000018') }, ->
        BrandPartner.find '5086df098523e60002000018', (err, brandPartner) ->
          brandPartner._id.toString().should.equal '5086df098523e60002000018'
          done()


  describe '#save', ->

    it 'saves valid brand partner input data', (done) ->
      BrandPartner.save {
        partner_id: '5086df098523e60002000018'
        featured_links: [
          {
            thumbnail_url: 'http://goo.com/img.jpg'
            url: 'http://google'
            headline: 'Fascinating Article'
            subheadline: 'Featured Artist'
            description: 'Hello World'
          }
        ]
      }, (err, brandPartner) ->
        brandPartner.partner_id.toString().should.equal '5086df098523e60002000018'
        brandPartner.featured_links[0].description.should.equal 'Hello World'
        brandPartner.featured_links[0].headline.should.equal 'Fascinating Article'
        brandPartner.featured_links[0].subheadline.should.equal 'Featured Artist'
        brandPartner.featured_links[0].thumbnail_url.should.equal 'http://goo.com/img.jpg'
        brandPartner.featured_links[0].url.should.equal 'http://google'
        db.brandPartners.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.brandPartners.findOne (err, brandPartner) ->
        data = BrandPartner.present brandPartner
        (typeof data.id).should.equal 'string'
        done()

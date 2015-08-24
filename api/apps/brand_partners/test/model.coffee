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
        results[0].slug.should.equal 'VersaceVersace'
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
        slug: 'Royce'
        featured_links: [
          {
            thumbnail_url: 'http://goo.com/img.jpg'
            headline: 'Fascinating Article'
            subheadline: 'Featured Artist'
            description: 'Hello World'
          }
        ]
      }, (err, brandPartner) ->
        brandPartner.slug.should.equal 'Royce'
        brandPartner.featured_links[0].description.should.equal 'Hello World'
        brandPartner.featured_links[0].headline.should.equal 'Fascinating Article'
        brandPartner.featured_links[0].subheadline.should.equal 'Featured Artist'
        brandPartner.featured_links[0].thumbnail_url.should.equal 'http://goo.com/img.jpg'
        db.brandPartners.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.brandPartners.findOne (err, brandPartner) ->
        data = BrandPartner.present brandPartner
        (typeof data.id).should.equal 'string'
        done()

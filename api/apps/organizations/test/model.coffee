_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Organization = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Organization', ->

  beforeEach (done) ->
    empty ->
      fabricate 'organizations', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all organizations along with total and counts', (done) ->
      Organization.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].name.should.equal 'Artsy Editorial'
        done()

  describe '#find', ->

    it 'finds an organization by an id string', (done) ->
      fabricate 'organizations', { _id: ObjectId('5086df098523e60002000018') }, ->
        Organization.find '5086df098523e60002000018', (err, organization) ->
          organization._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid organization input data', (done) ->
      Organization.save {
        name: 'Artsy Editorial'
      }, (err, organization) ->
        organization.name.should.equal 'Artsy Editorial'
        db.organizations.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.organizations.findOne (err, organization) ->
        data = Organization.present organization
        (typeof data.id).should.equal 'string'
        done()

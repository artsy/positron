_ = require 'underscore'
moment = require 'moment'
{ db, fabricate, empty, fixtures } = require '../../../test/helpers/db'
Section = require '../model'
{ ObjectId } = require 'mongojs'

describe 'Section', ->

  beforeEach (done) ->
    empty ->
      fabricate 'sections', _.times(10, -> {}), ->
        done()

  describe '#where', ->

    it 'can return all sections along with total and counts', (done) ->
      Section.where {}, (err, res) ->
        { total, count, results } = res
        total.should.equal 10
        count.should.equal 10
        results[0].title.should.equal 'Vennice Biennalez'
        done()

  describe '#find', ->

    it 'finds an section by an id string', (done) ->
      fabricate 'sections', { _id: ObjectId('5086df098523e60002000018') }, ->
        Section.find '5086df098523e60002000018', (err, section) ->
          section._id.toString().should.equal '5086df098523e60002000018'
          done()

  describe '#save', ->

    it 'saves valid section input data', (done) ->
      Section.save {
        title: 'Top Ten Shows'
        description: 'Hello World'
      }, (err, section) ->
        section.title.should.equal 'Top Ten Shows'
        section.description.should.equal 'Hello World'
        db.sections.count (err, count) ->
          count.should.equal 11
          done()

  describe '#present', ->

    it 'converts _id to id', (done) ->
      db.sections.findOne (err, section) ->
        data = Section.present section
        (typeof data.id).should.equal 'string'
        done()

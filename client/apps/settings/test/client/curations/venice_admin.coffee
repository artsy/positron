benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
moment = require 'moment'
Curation = require '../../../../../models/curation.coffee'
Backbone = require 'backbone'

r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate
  findTag: ReactTestUtils.scryRenderedDOMComponentsWithTag

describe 'VeniceAdmin', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
        _: benv.require 'underscore'
      sinon.stub Backbone, 'sync'
      $.fn.typeahead = sinon.stub()
      window.jQuery = $
      VeniceAdmin = benv.require resolve __dirname, '../../../client/curations/venice_admin.coffee'
      Autocomplete = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      dropdownHeader = benv.requireWithJadeify(
        resolve(__dirname, '../../../../edit/components/admin/components/dropdown_header.coffee'), ['icons']
      )
      VeniceAdmin.__set__ 'dropdownHeader', React.createFactory dropdownHeader
      VeniceAdmin.__set__ 'sd', {
        ARTSY_URL: 'http://localhost:3005'
        USER: access_token: ''
      }
      Autocomplete.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: { id: '123', name: 'An Artist'})
      VeniceAdmin.__set__ 'AutocompleteList', React.createFactory Autocomplete

      @curation = new Curation sections: [{title: 'Searching For Venice'}, {title: 'Dawn Kasper'}]
      props = curation: @curation
      @component = ReactDOM.render React.createElement(VeniceAdmin, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()
    Backbone.sync.restore()

  it 'Renders the content', ->
    $(ReactDOM.findDOMNode(@component)).find('button').length.should.eql 1
    $(ReactDOM.findDOMNode(@component)).find('section').length.should.eql 2
    $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 1
    $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 1

  it '#revealSection triggers a dropdown', ->
    r.simulate.click r.find(@component, 'dropdown-header')[0]
    $(ReactDOM.findDOMNode(@component)).find('.venice-admin__fields.active').length.should.eql 1

  it '#onDescriptionChange sets the description state and shows a save warning', ->
    input = r.findTag(@component, 'textarea')[0]
    input.value = 'New Description'
    r.simulate.change input
    @component.state.curation.get('description').should.eql 'New Description'
    @component.state.isChanged.should.eql true
    $(ReactDOM.findDOMNode(@component)).find('button').hasClass('attention').should.eql true

  it '#onChangeSection updates state.curation and shows a save warning', ->
    @component.onChangeSection {title: 'Dawn Kasper', published: true}, 1
    @component.state.curation.get('sections')[1].published.should.eql true
    @component.state.isChanged.should.eql true
    $(ReactDOM.findDOMNode(@component)).find('button').hasClass('attention').should.eql true

  it 'Clicking save button saves the curation and removes warnings from save button', ->
    r.simulate.click r.findTag(@component, 'button')[0]
    @component.state.isSaving.should.eql true
    Backbone.sync.args[0][0].should.equal 'create'
    Backbone.sync.args[0][2].success()
    @component.state.isSaving.should.eql false
    @component.state.isChanged.should.eql false

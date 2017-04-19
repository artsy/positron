benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
moment = require 'moment'
r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  simulate: ReactTestUtils.Simulate

describe 'VeniceSection', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      $.fn.typeahead = sinon.stub()
      window.jQuery = $
      VeniceSection = benv.require resolve __dirname, '../../../client/curations/venice_section.coffee'
      VeniceSection.__set__ 'sd', {
        ARTSY_URL: 'http://localhost:3005'
        USER: access_token: ''
      }
      Autocomplete = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      VeniceSection.__set__ 'AutocompleteList', React.createFactory Autocomplete
      Autocomplete.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: { id: '123', name: 'An Artist'})
      props = {
        section: {
          title: 'The Title'
          subtitle: 'The Subtitle'
          description: 'Cool description'
          video_url: 'http://artsy.net/360.mp4'
          video_length: '11:22'
          artist_ids: ['123']
          cover_image: 'http://artsy.net/cover.jpg'
          release_date: moment().toISOString()
          published: false
        }
        id: 1
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(VeniceSection, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()

  describe 'Render', ->
    it 'Renders the input fields', ->
      $(ReactDOM.findDOMNode(@component)).find('label').length.should.eql 10
      $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 10
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=checkbox]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').length.should.eql 1

    it 'Populates inputs with saved data', ->
      @component.setState slug: 'dawn-kasper'
      $(ReactDOM.findDOMNode(@component)).find('input[name=title]').val().should.eql 'The Title'
      $(ReactDOM.findDOMNode(@component)).find('input[name=slug]').val().should.eql 'dawn-kasper'
      $(ReactDOM.findDOMNode(@component)).find('input[name=video_url]').val().should.eql 'http://artsy.net/360.mp4'
      $(ReactDOM.findDOMNode(@component)).find('input[name=video_length]').val().should.eql '11:22'
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').val().should.eql moment().format('YYYY-MM-DD')
      $(ReactDOM.findDOMNode(@component)).find('textarea').val().should.eql 'Cool description'
      $(ReactDOM.findDOMNode(@component)).find('input[type=checkbox]').val().should.eql 'false'
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-select-selected').text().should.eql 'An Artist'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'background-image: url(http://artsy.net/cover.jpg)'
      $(ReactDOM.findDOMNode(@component)).find('input[name=subtitle]').val().should.eql 'The Subtitle'

  describe 'Slugs', ->
    it 'If slug is undefined, autofills a slug based on a saved section title', ->
      $(ReactDOM.findDOMNode(@component)).find('input[name=slug]').val().should.eql 'the-title'

    it 'Disables the slug field on published sections', ->
      @component.setState published: true
      $(ReactDOM.findDOMNode(@component)).find('input[name=slug]').prop('disabled').should.eql true

  describe '#onChange', ->

    it 'Calls onChange with user input', ->
      input = r.find(@component, 'bordered-input')[0]
      input.value = 'New Title'
      r.simulate.change input
      @component.props.onChange.args[0][0].title.should.eql 'New Title'

    it '#onCheckbox change toggles published', ->
      r.simulate.click r.find(@component, 'flat-checkbox')[0]
      @component.props.onChange.args[0][0].published.should.eql true

    it '#onDateChange can change the date', ->
      input = r.find(@component, 'bordered-input')[3]
      input.value = '2018-01-01'
      r.simulate.change input
      @component.props.onChange.args[0][0].release_date.should.eql moment('2018-01-01').toISOString()

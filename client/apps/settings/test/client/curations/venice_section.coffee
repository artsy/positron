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
        _: benv.require 'underscore'
      $.fn.typeahead = sinon.stub()
      window.jQuery = $
      VeniceSection = benv.require resolve __dirname, '../../../client/curations/venice_section.coffee'
      VeniceSection.__set__ 'sd', {
        ARTSY_URL: 'http://localhost:3005'
        USER: access_token: ''
      }
      DragContainer = benv.require resolve __dirname, '../../../../../components/drag_drop/index.coffee'
      Autocomplete = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      DragContainer.__set__ 'DragTarget', sinon.stub()
      DragContainer.__set__ 'DragSource', sinon.stub()
      Autocomplete.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: { id: 'an-artist', name: 'An Artist', _id: '123'})
      Autocomplete.__set__ 'sd', {}
      Autocomplete.__set__ 'DragContainer', React.createFactory DragContainer
      VeniceSection.__set__ 'AutocompleteList', React.createFactory Autocomplete
      props = {
        section: {
          title: 'The Title'
          description: 'Cool description'
          video_url: 'http://artsy.net/360.mp4'
          video_url_medium: 'http://artsy.net/360_med.mp4'
          video_url_adaptive: 'http://artsy.net/360.mpd'
          video_url_external: 'http://youtube.com/video'
          video_length: '11:22'
          artist_ids: ['123']
          cover_image: 'http://artsy.net/cover.jpg'
          release_date: moment().toISOString()
          published: false
          social_description: 'Click to view this cool 360 video'
          social_image: 'http://artsy.net/social-cover.jpg'
          social_title: '[Video] Here is a Social Title'
          seo_description: 'SEO Description'
          email_title: 'Email Title'
          email_image: 'https://artsy.net/email_image.jpg'
          email_author: 'Artsy Editorial'
        }
        id: 1
        onChange: sinon.stub()
        }
      @component = ReactDOM.render React.createElement(VeniceSection, props),
        (@$el = $ "<div></div>")[0], ->
          setTimeout ->
            done()

  afterEach ->
    benv.teardown()

  describe 'Render', ->
    it 'Renders the input fields', ->
      $(ReactDOM.findDOMNode(@component)).find('label').length.should.eql 19
      $(ReactDOM.findDOMNode(@component)).find('input').length.should.eql 17
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=checkbox]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('textarea').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').length.should.eql 1

    it 'Populates inputs with saved data', ->
      @component.setState slug: 'dawn-kasper'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=title]')
        .val().should.eql 'The Title'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=slug]')
        .val().should.eql 'dawn-kasper'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=video_url]')
        .val().should.eql 'http://artsy.net/360.mp4'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=video_url_medium]')
        .val().should.eql 'http://artsy.net/360_med.mp4'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=video_url_adaptive]')
        .val().should.eql 'http://artsy.net/360.mpd'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=video_url_external]')
        .val().should.eql 'http://youtube.com/video'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=video_length]')
        .val().should.eql '11:22'
      $(ReactDOM.findDOMNode(@component))
        .find('input[type=date]')
        .val().should.eql moment().format('YYYY-MM-DD')
      $(ReactDOM.findDOMNode(@component))
        .find('textarea[name=description]')
        .val().should.eql 'Cool description'
      $(ReactDOM.findDOMNode(@component))
        .find('input[type=checkbox]')
        .val().should.eql 'false'
      $(ReactDOM.findDOMNode(@component))
        .html()
        .should.containEql 'background-image: url(http://artsy.net/cover.jpg)'
      $(ReactDOM.findDOMNode(@component))
        .html()
        .should.containEql 'background-image: url(http://artsy.net/social-cover.jpg)'
      $(ReactDOM.findDOMNode(@component))
        .find('textarea[name=social_description]')
        .val().should.eql 'Click to view this cool 360 video'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=social_title]')
        .val().should.eql '[Video] Here is a Social Title'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=seo_description]')
        .val().should.eql 'SEO Description'
      $(ReactDOM.findDOMNode(@component))
        .html()
        .should.containEql 'background-image: url(https://artsy.net/email_image.jpg)'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=email_title]')
        .val().should.eql 'Email Title'
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=email_author]')
        .val().should.eql 'Artsy Editorial'

  describe 'Slugs', ->
    it 'If slug is undefined, autofills a slug based on a saved section title', ->
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=slug]')
        .val().should.eql 'the-title'

    it 'Disables the slug field on published sections', ->
      @component.setState published: true
      $(ReactDOM.findDOMNode(@component))
        .find('input[name=slug]').prop('disabled').should.eql true

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
      input = r.find(@component, 'bordered-input')[2]
      input.value = '2018-01-01'
      r.simulate.change input
      @component.props.onChange.args[0][0].release_date
        .should.eql moment('2018-01-01').toISOString()
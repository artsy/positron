benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-dom/test-utils'
_ = require 'underscore'
fixtures = require '../../../../../../test/helpers/fixtures.coffee'
Article = require '../../../../../models/article.coffee'
Backbone = require 'backbone'
moment = require 'moment'

r =
  find: ReactTestUtils.scryRenderedDOMComponentsWithClass
  findTag: ReactTestUtils.scryRenderedDOMComponentsWithTag
  simulate: ReactTestUtils.Simulate

describe 'AdminArticle', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        Bloodhound: (Bloodhound = sinon.stub()).returns(
          initialize: ->
          ttAdapter: ->
        )
      window.matchMedia = sinon.stub().returns({
        matches: sinon.stub()
      })
      $.fn.typeahead = sinon.stub()
      global.confirm = @confirm = sinon.stub()
      AdminArticle = benv.require resolve __dirname, '../article/index.coffee'
      @channel = { type: 'partner', id: '123' }
      AdminArticle.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: @channel
        USER: access_token: ''
      }
      DragContainer = benv.require resolve __dirname, '../../../../../components/drag_drop/index.coffee'
      AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      AdminArticle.__set__ 'AutocompleteList', React.createFactory AutocompleteList
      AutocompleteList.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: { id: '123', name: 'Molly Gottschalk'})
      @article = new Article _.extend {},
        author: {name: 'Artsy Editorial', id: '123'}
        contributing_authors: [{name: 'Molly Gottschalk', id: '123'}]
        indexable: true
        layout: 'standard'
      props = {
        article: @article
        onChange: sinon.stub()
        channel: @channel
        }
      @component = ReactDOM.render React.createElement(AdminArticle, props), (@$el = $ "<div></div>")[0], =>
        setTimeout =>
          done()

  afterEach ->
    benv.teardown()


  describe 'Display', ->

    it 'Renders the primary author field', ->
      $(ReactDOM.findDOMNode(@component)).find('input').first().val().should.eql 'Artsy Editorial'
      $(ReactDOM.findDOMNode(@component)).find('input').first().attr('placeholder').should.eql 'Change Primary Author name'

    it 'Renders the contributing author field', ->
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-input').first().attr('placeholder').should.eql 'Search by user name or email...'
      $(ReactDOM.findDOMNode(@component)).text().should.containEql 'Contributing Author'
      $(ReactDOM.findDOMNode(@component)).find('.autocomplete-select-selected').text().should.containEql 'Molly Gottschalk'

    it 'Renders tier and magazine buttons', ->
      $(ReactDOM.findDOMNode(@component)).find('.button-group').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('.button-group button').length.should.eql 4

    it 'Sets default values for tier and magazine', ->
      @component.state.tier.should.eql 2
      @component.state.featured.should.eql false
      $(ReactDOM.findDOMNode(@component)).find('button.active').first().attr('name').should.eql '2'
      $(ReactDOM.findDOMNode(@component)).find('button.active').last().text().should.eql 'No'

    it 'Renders indexable checkbox', ->
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').length.should.eql 2
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').first().attr('name').should.eql 'indexable'
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox input').first().prop('checked').should.eql true

    it 'Renders google news checkbox', ->
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').last().attr('name').should.eql 'exclude_google_news'
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox input').last().prop('checked').should.eql false

    it 'Renders date and time field', ->
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').val().should.eql moment().format('YYYY-MM-DD')
      $(ReactDOM.findDOMNode(@component)).find('input[type=time]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=time]').val().should.containEql moment().format('HH:')

    it '#showActive returns a correct class', ->
      @component.showActive('tier', 2).should.eql ' active'
      @component.showActive('featured', true).should.eql ''

  describe 'Display: Editorial features', ->

    it 'Renders the layout buttons', ->
      @channel.type = 'editorial'
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).find('.article-layout .button-group').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('.article-layout .button-group button').length.should.eql 2

    it 'Renders the related article autocomplete', ->
      @channel.type = 'editorial'
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).text().should.containEql 'Related Articles'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'placeholder="Search articles by title..."'

    it 'Renders the author_ids autocomplete', ->
      @channel.type = 'editorial'
      @component.forceUpdate()
      $(ReactDOM.findDOMNode(@component)).text().should.containEql 'Authors'
      $(ReactDOM.findDOMNode(@component)).html().should.containEql 'placeholder="Search by author name..."'

  describe 'Publish and scheduled date', ->

    it '#setupPublishDate returns current date and time if unpublished', ->
      @component.setState = sinon.stub()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().local().format('YYYY-MM-DD')
      @component.setState.args[0][0].publish_time.should.containEql moment().local().format('HH:')

    it '#setupPublishDate returns saved date and time if published', ->
      @component.setState = sinon.stub()
      @component.props.article.set 'published_at', moment().subtract(1, 'years').local().toISOString()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().subtract(1, 'years').local().format('YYYY-MM-DD')

    it '#setupPublishDate returns a scheduled date and time if provided', ->
      @component.setState = sinon.stub()
      @component.props.article.set 'scheduled_publish_at', moment().add(1, 'years').local().toISOString()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().add(1, 'years').local().format('YYYY-MM-DD')

    it '#onPublishDateChange updates the state to input value', ->
      @component.setState = sinon.stub()
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().add(1, 'years').local().format('YYYY-MM-DD')
      r.simulate.change input
      @component.setState.args[0][0].publish_date.should.eql moment().add(1, 'years').local().format('YYYY-MM-DD')


  describe 'Publish and scheduled date button', ->

    it 'Can schedule a draft on click', ->
      @component.setState = sinon.stub()
      @component.onChange = sinon.stub()
      @component.props.article.set('published', false)
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().add(1, 'years').local().format('YYYY-MM-DD')
      r.simulate.change input
      $(ReactDOM.findDOMNode(@component)).find('button.date').text().should.eql 'Schedule'
      r.simulate.click r.find(@component, 'date')[0]
      @component.onChange.args[0].should.eql ['published_at', null]
      moment(@component.onChange.args[1][1]).local().format('YYYY-MM-DD').should.eql moment().add(1, 'years').format('YYYY-MM-DD')
      @component.onChange.args[1][0].should.eql 'scheduled_publish_at'

    it 'Can unschedule a draft on click', ->
      @component.props.article.set('published', false)
      @component.props.article.set('scheduled_publish_at', moment().toISOString())
      @component.forceUpdate()
      @component.onChange = sinon.stub()
      $(ReactDOM.findDOMNode(@component)).find('button.date').text().should.eql 'Unschedule'
      r.simulate.click r.find(@component, 'date')[0]
      @component.onChange.args[0].should.eql ['published_at', null]
      @component.onChange.args[1].should.eql ['scheduled_publish_at', null]

    it 'Can update published_at date for published articles on click', ->
      @component.setState = sinon.stub()
      @component.onChange = sinon.stub()
      @component.props.article.set('published', true)
      @component.forceUpdate()
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().subtract(1, 'years').local().format('YYYY-MM-DD')
      r.simulate.change input
      $(ReactDOM.findDOMNode(@component)).find('button.date').text().should.eql 'Update'
      r.simulate.click r.find(@component, 'date')[0]

      # FIXME TEST: Fragile date
      # @component.setState.args[0][0].publish_date.should.eql moment().local().subtract(1, 'years').format('YYYY-MM-DD')
      # @component.onChange.args[0][0].should.eql 'published_at'
      # @component.onChange.args[0][1].should.containEql moment().local().subtract(1, 'years').format('YYYY-MM-DD')

  describe 'onChange', ->

    it '#onChange sends values to parent and forces re-render', ->
      @component.forceUpdate = sinon.stub()
      @component.onChange 'tier', 2
      @component.props.onChange.args[0][0].should.eql 'tier', 2
      @component.forceUpdate.called.should.eql true

    it '#onPrimaryAuthorChange updates the primary author name', ->
      @component.onChange = sinon.stub()
      input = r.find(@component, 'bordered-input')[0]
      input.value = 'A new author'
      r.simulate.change input
      @component.onChange.args[0][1].name.should.eql 'A new author'

    it '#onTierChange updates the tier', ->
      @component.onChange = sinon.stub()
      r.simulate.click r.findTag(@component, 'button')[2]
      @component.onChange.args[0][0].should.eql 'tier'
      @component.onChange.args[0][1].should.eql 2

    it '#onMagazineChange toggles featured', ->
      @component.onChange = sinon.stub()
      r.simulate.click r.findTag(@component, 'button')[4]
      @component.onChange.args[0][0].should.eql 'featured'
      @component.onChange.args[0][1].should.eql false

    it '#onLayoutChange updates the layout', ->
      @component.onChange = sinon.stub()
      @channel.type = 'editorial'
      @component.forceUpdate()
      r.simulate.click r.findTag(@component, 'button')[6]
      @component.onChange.args[0][0].should.eql 'layout'
      @component.onChange.args[0][1].should.eql 'feature'

    it '#onLayoutChange warns a user if data will be lost', ->
      @component.onChange = sinon.stub()
      @channel.type = 'editorial'
      @component.props.article.set('layout', 'feature')
      @component.forceUpdate()
      r.simulate.click r.findTag(@component, 'button')[5]
      @confirm.called.should.eql true

    it '#onCheckboxChange toggles indexable', ->
      @component.onChange = sinon.stub()
      r.simulate.click r.find(@component, 'flat-checkbox')[0]
      @component.onChange.args[0][0].should.eql 'indexable'
      @component.onChange.args[0][1].should.eql false

    it '#onCheckboxChange toggles exclude_google_news', ->
      @component.onChange = sinon.stub()
      r.simulate.click r.find(@component, 'flat-checkbox')[1]
      @component.onChange.args[0][0].should.eql 'exclude_google_news'
      @component.onChange.args[0][1].should.eql true

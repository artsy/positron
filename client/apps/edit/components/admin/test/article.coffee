benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
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
      $.fn.typeahead = sinon.stub()
      AdminArticle = benv.require resolve __dirname, '../article/index.coffee'
      AdminArticle.__set__ 'sd', {
        API_URL: 'http://localhost:3005/api'
        CURRENT_CHANNEL: id: '123'
        USER: access_token: ''
      }
      AutocompleteList = benv.require resolve __dirname, '../../../../../components/autocomplete_list/index.coffee'
      AdminArticle.__set__ 'AutocompleteList', React.createFactory AutocompleteList
      AutocompleteList.__set__ 'request', get: sinon.stub().returns
        set: sinon.stub().returns
          end: sinon.stub().yields(null, body: { id: '123', name: 'Molly Gottschalk'})
      @article = new Article
      @article.attributes = fixtures().articles
      @article.set('author', {name: 'Artsy Editorial', id: '123'})
      @article.set('contributing_authors', [{name: 'Molly Gottschalk', id: '123'}])
      @article.set('featured', true)
      props = {
        article: @article
        onChange: sinon.stub()
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
      $(ReactDOM.findDOMNode(@component)).find('button.active').first().attr('name').should.eql '1'
      $(ReactDOM.findDOMNode(@component)).find('button.active').last().attr('name').should.eql 'true'

    it 'Renders google news checkbox', ->
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('.flat-checkbox input').prop('checked').should.eql false

    it 'Renders date and time field', ->
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=date]').val().should.eql moment().format('YYYY-MM-DD')
      $(ReactDOM.findDOMNode(@component)).find('input[type=time]').length.should.eql 1
      $(ReactDOM.findDOMNode(@component)).find('input[type=time]').val().should.containEql moment().format('HH:')

    it '#showActive returns a correct class', ->
      @component.showActive('tier', 1).should.eql ' active'
      @component.showActive('featured', false).should.eql ''


  describe 'Publish and scheduled date', ->

    it '#setupPublishDate returns current date and time if unpublished', ->
      @component.setState = sinon.stub()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().format('YYYY-MM-DD')
      @component.setState.args[0][0].publish_time.should.containEql moment().format('HH:')

    it '#setupPublishDate returns saved date and time if published', ->
      @component.setState = sinon.stub()
      @component.props.article.set 'published_at', moment().subtract(1, 'years').toISOString()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().subtract(1, 'years').format('YYYY-MM-DD')

    it '#setupPublishDate returns a scheduled date and time if provided', ->
      @component.setState = sinon.stub()
      @component.props.article.set 'scheduled_publish_at', moment().add(1, 'years').toISOString()
      @component.setupPublishDate()
      @component.setState.args[0][0].publish_date.should.eql moment().add(1, 'years').format('YYYY-MM-DD')

    it '#onPublishDateChange updates the state to input value', ->
      @component.setState = sinon.stub()
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().add(1, 'years').format('YYYY-MM-DD')
      r.simulate.change input
      @component.setState.args[0][0].publish_date.should.eql moment().add(1, 'years').format('YYYY-MM-DD')

    it '#onPublishDateChange sets scheduled date if article is draft', ->
      @component.setState = sinon.stub()
      @component.onChange = sinon.stub()
      @component.props.article.set('published', false)
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().add(1, 'years').format('YYYY-MM-DD')
      r.simulate.change input
      moment(@component.onChange.args[0][1]).format('YYYY-MM-DD').should.eql moment().add(1, 'years').format('YYYY-MM-DD')
      @component.onChange.args[0][0].should.eql 'scheduled_publish_at'

    it '#onPublishDateChange published_at is null if input date has passed and article is draft', ->
      @component.setState = sinon.stub()
      @component.onChange = sinon.stub()
      @component.props.article.set('published', false)
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().subtract(1, 'years').format('YYYY-MM-DD')
      r.simulate.change input
      @component.setState.args[0][0].publish_date.should.eql moment().subtract(1, 'years').format('YYYY-MM-DD')
      @component.onChange.args[0].should.eql [ 'published_at', null ]

    it '#onPublishDateChange saves a changed published_at date on published article', ->
      @component.setState = sinon.stub()
      @component.onChange = sinon.stub()
      input = ReactDOM.findDOMNode(@component.refs.publish_date)
      input.value = moment().subtract(1, 'years').format('YYYY-MM-DD')
      r.simulate.change input
      @component.setState.args[0][0].publish_date.should.eql moment().subtract(1, 'years').format('YYYY-MM-DD')
      @component.onChange.args[0][0].should.eql 'published_at'
      @component.onChange.args[0][1].should.containEql moment().subtract(1, 'years').format('YYYY-MM-DD')


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

    it '#onCheckboxChange toggles exclude_google_news', ->
      @component.onChange = sinon.stub()
      r.simulate.click r.find(@component, 'flat-checkbox')[0]
      @component.onChange.args[0][0].should.eql 'exclude_google_news'
      @component.onChange.args[0][1].should.eql true

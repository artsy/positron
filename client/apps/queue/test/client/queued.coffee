benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'QueuedArticles', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      QueuedArticles = benv.requireWithJadeify(
        resolve(__dirname, '../../client/queued')
        ['icons']
      )
      QueuedArticles.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      @component = React.render QueuedArticles(
        {
          articles: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          unselected: sinon.stub()
          headerText: 'Queued'
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of articles', ->
    $(@component.getDOMNode()).html().should.containEql 'Game of Thrones'
    $(@component.getDOMNode()).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'renders a header', ->
    $(@component.getDOMNode()).html().should.containEql 'Queued'

  it 'selects the article when clicking the check button', ->
    r.simulate.click r.find @component, 'filter-search__checkcircle'
    @component.props.unselected.args[0][0].id.should.containEql '123'
    @component.props.unselected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.unselected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

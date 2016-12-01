benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
require 'react/addons'
r =
  find: React.addons.TestUtils.findRenderedDOMComponentWithClass
  simulate: React.addons.TestUtils.Simulate

describe 'ArticleList', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose $: benv.require 'jquery'
      window.jQuery = $
      ArticleList = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      ArticleList.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      @component = React.render ArticleList(
        {
          articles: [{id: '123', thumbnail_title: 'Game of Thrones', slug: 'artsy-editorial-game-of-thrones'}]
          selected: sinon.stub()
          checkable: true
        }
      ), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of articles', ->
    $(@component.getDOMNode()).html().should.containEql 'Game of Thrones'
    $(@component.getDOMNode()).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'selects the article when clicking the check button', ->
    r.simulate.click r.find @component, 'article-list__checkcircle'
    @component.props.selected.args[0][0].id.should.containEql '123'
    @component.props.selected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.selected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

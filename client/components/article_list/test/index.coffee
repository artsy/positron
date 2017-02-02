benv = require 'benv'
sinon = require 'sinon'
{ resolve } = require 'path'
React = require 'react'
ReactDOM = require 'react-dom'
ReactTestUtils = require 'react-addons-test-utils'
ReactDOMServer = require 'react-dom/server'

r =
  find: ReactTestUtils.findRenderedDOMComponentWithClass
  simulate: ReactTestUtils.Simulate

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
      props = {
          articles: [
            {
              id: '123'
              thumbnail_title: 'Game of Thrones'
              thumbnail_image: 'http://artsy.net/thumbnail_image.jpg'
              slug: 'artsy-editorial-game-of-thrones'
            },
            {
              id: '124'
              thumbnail_title: 'Email Game of Thrones'
              thumbnail_image: 'http://artsy.net/thumbnail_image2.jpg'
              email_metadata: {headline: 'Email of Thrones', image_url: 'http://artsy.net/image_url.jpg'}
              slug: 'artsy-editorial-email-of-thrones'
            }
          ]
          selected: sinon.stub()
          checkable: true
          display: 'email'
        }
      @rendered = ReactDOMServer.renderToString React.createElement(ArticleList, props)
      @component = ReactDOM.render React.createElement(ArticleList, props), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of articles', ->
    $(@rendered).html().should.containEql 'Game of Thrones'
    $(@rendered).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'selects the article when clicking the check button', ->
    r.simulate.click @component.refs['123']
    @component.props.selected.args[0][0].id.should.containEql '123'
    @component.props.selected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.selected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

  it 'can render email headlines and images', ->
    $(@rendered).html().should.containEql 'Email of Thrones'
    $(@rendered).html().should.containEql 'image_url.jpg'

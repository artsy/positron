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
      @ArticleList = benv.requireWithJadeify(
        resolve(__dirname, '../index')
        ['icons']
      )
      @ArticleList.__set__ 'sd', { FORCE_URL: 'http://artsy.net' }
      @props = {
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
            },
            {
              id: '125'
              thumbnail_title: '[Draft] Draft Title'
              slug: 'artsy-editorial-email-of-thrones'
            }
          ]
          selected: sinon.stub()
          checkable: true
          display: 'email'
        }
      @component = ReactDOM.render React.createElement(@ArticleList, @props), (@$el = $ "<div></div>")[0], => setTimeout =>
        sinon.stub @component, 'setState'
        done()

  afterEach ->
    benv.teardown()

  it 'renders an initial set of articles', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Game of Thrones'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'http://artsy.net/article/artsy-editorial-game-of-thrones'

  it 'renders a link to /edit if not props.isEditorial', ->
    rendered = ReactDOMServer.renderToString React.createElement(@ArticleList, @props)
    $(rendered).html().should.containEql 'href="/articles/125/edit"'

  it 'renders a link to /edit2 if props.isEditorial', ->
    @props.isEditorial = true
    rendered = ReactDOMServer.renderToString React.createElement(@ArticleList, @props)
    $(rendered).html().should.containEql 'href="/articles/125/edit2"'

  it 'selects the article when clicking the check button', ->
    r.simulate.click @component.refs['123']
    @component.props.selected.args[0][0].id.should.containEql '123'
    @component.props.selected.args[0][0].thumbnail_title.should.containEql 'Game of Thrones'
    @component.props.selected.args[0][0].slug.should.containEql 'artsy-editorial-game-of-thrones'

  it 'can render email headlines and images', ->
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'Email of Thrones'
    $(ReactDOM.findDOMNode(@component)).html().should.containEql 'image_url.jpg'

  it 'sets the background of the thumbnail image', ->
    $(ReactDOM.findDOMNode(@component)).find('.article-list__image:eq(1)').css('background-image').should.equal 'url(http://artsy.net/image_url.jpg)'

  it 'thumbnail image defaults to not setting background when there is no image', ->
    $(ReactDOM.findDOMNode(@component)).find('.article-list__image:eq(2)').css('background-image').length.should.equal 0

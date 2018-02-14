_ = require 'underscore'
path = require 'path'
jade = require 'jade'
fs = require 'fs'
moment = require 'moment'
Article = require '../../../../../models/article.coffee'
{ fixtures } = require '../../../../../test/helpers/db'
particle = require 'particle'
_s = require 'underscore.string'

render = (templateName) ->
  filename = path.resolve __dirname, "../#{templateName}.jade"
  jade.compile(
    fs.readFileSync(filename),
    { filename: filename }
  )

describe 'instant article template', ->

  beforeEach ->
    @article = new Article(_.extend {},
      fixtures().articles,
      authors: ['Artsy Editors']
    )

  it 'renders main instant article', ->
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: ->
    html.should.containEql '<address>Artsy Editors</address>'
    html.should.containEql 'fb:article_style'
    html.should.containEql 'analytics.track(\'time on page more than 15 seconds'

  it 'renders sections', ->
    html = render('index')
      article: @article
      authors: []
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<figure><img src="http://gemini.herokuapp.com/123/miaart-banner.jpg"/><figcaption>This is a terrible caption</figcaption></figure>'
    html.should.containEql 'The Four Hedgehogs, 1956.'
    html.should.containEql 'Van Gogh and Van Dogh'
    html.should.containEql '<figure class="op-slideshow"><figure><img src="https://artsy.net/artwork2.jpg"/>'

  it 'renders a video hero section with deck', ->
    @article.set 'hero_section',
      type: 'fullscreen'
      url: 'http://video.mp4'
      deck: 'Introduction to the feature'
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<video loop="loop"><source src="http://video.mp4" type="video/mp4"/></video>'

  it 'renders an image hero section with deck', ->
    @article.set 'hero_section',
      type: 'split'
      url: 'https://img.jpg'
      deck: 'Introduction to the feature'
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<figure><img src="https://img.jpg"/></figure>'

  it 'renders a lead paragraph', ->
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<h2><i>Just before the lines start forming...</i></h2>'

  it 'renders a postscript', ->
    @article.set 'postscript', '<i>A postscript is here to provide more information</i>'
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<i>A postscript is here to provide more information</i>'

  it 'renders a basic hero section', ->
    @article.set 'hero_section',
      type: 'basic'
      url: 'https://www.youtube.com/watch?v=vq9pQi-SD1k'
    html = render('index')
      article: @article
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<figure class="op-interactive"><iframe src="http://www.youtube.com/embed/vq9pQi-SD1k?title=0&portrait=0&badge=0&byline=0&showinfo=0&rel=0&controls=2&modestbranding=1&iv_load_policy=3&color=E5E5E5" frameborder="0" allowfullscreen class="no-margin column-width"></iframe></figure>'

  it 'renders a display unit', ->
    @article.set 'hero_section',
      type: 'basic'
      url: 'https://www.youtube.com/watch?v=vq9pQi-SD1k'
    html = render('index')
      article: @article
      forceUrl: ''
      displayUrl: 'writer.artsy.net/display'
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<figure class="op-ad"><iframe src="writer.artsy.net/display" height="320" width="350"></iframe></figure>'

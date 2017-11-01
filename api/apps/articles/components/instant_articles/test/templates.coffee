_ = require 'underscore'
path = require 'path'
jade = require 'jade'
fs = require 'fs'
moment = require 'moment'
Article = require '../../../../../models/article'
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

  it 'renders main instant article boilerplate', ->
    html = render('index')
      article: new Article sections: []
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: ->
    html.should.containEql 'fb:article_style'
    html.should.containEql 'analytics.track(\'time on page more than 15 seconds'
    html.should.containEql '<iframe src="https://link.artsy.net/join/sign-up-editorial-facebook" height="250" class="no-margin">'

  it 'renders sections', ->
    html = render('index')
      article: new Article fixtures().articles
      forceUrl: ''
      _: _
      moment: moment
      particle: particle
      toSentence: _s.toSentence
    html.should.containEql '<figure><img src="http://gemini.herokuapp.com/123/miaart-banner.jpg"/><figcaption>This is a terrible caption</figcaption></figure>'
    html.should.containEql 'The Four Hedgehogs, 1956.'
    html.should.containEql 'Van Gogh and Van Dogh'
    html.should.containEql '<figure class="op-slideshow"><figure><img src="https://artsy.net/artwork2.jpg"/>'
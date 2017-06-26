benv = require 'benv'
{ resolve } = require 'path'
sinon = require 'sinon'

describe 'FillWidth', ->

  beforeEach (done) ->
    benv.setup =>
      benv.expose
        $: benv.require 'jquery'
        _: benv.require 'underscore'
      window.jQuery = $
      fillWidth = benv.require resolve(__dirname, '../index.coffee')
      @fillWidth = fillWidth.fillWidth
      @images = [
        {
          url: "https://artsy-media-uploads.s3.amazonaws.com/SSgJx0IZ8mzQJ9hWtyxoSg%2Feoy-cover-placeholder.png",
          type: "image",
          width: 1918,
          height: 1079,
          caption: "<p>An uploaded image</p>"
        },
        {
          url: "https://artsy-media-uploads.s3.amazonaws.com/j-KlQK_oTfnzYc6XSZFURQ%2Feoy-gg-poster.png",
          type: "image",
          width: 1589,
          height: 894,
          caption: "<p>Another uploaded image</p>"
        },
        {
          type: "artwork",
          id: "588622e18b3b814248004850",
          slug: "paul-emile-rioux-landcuts-ville-4-unt-1",
          date: "",
          title: "Landcuts Ville 4 Unt 1",
          image: "https://d32dm0rphc51dk.cloudfront.net/rKuVMAi4qwx4W6PIr10mxg/larger.jpg",
          width: 864,
          height: 864
        }
      ]
      done()

  afterEach ->
    benv.teardown()

  describe '#FillWidth', ->

    it 'returns and array of image sizes with margins if overflow_fillwidth', ->
      dimensions = @fillWidth(@images, 400, 860, 'overflow_fillwidth', 50)
      dimensions.should.eql [
        { id: 0, width: 296.85449490268763, height: 167 },
        { id: 1, width: 296.8266219239375, height: 167 },
        { id: 2, width: 167, height: 167 }
      ]

    it 'defaults margin to 30 if no margin arg', ->
      dimensions = @fillWidth(@images, 400, 860, 'overflow_fillwidth')
      dimensions.should.eql [
        { id: 0, width: 312.852641334569, height: 176 },
        { id: 1, width: 312.82326621923954, height: 176 },
        { id: 2, width: 176, height: 176 }
      ]

    it 'returns widths matching container size without margins if column_width', ->
      dimensions = @fillWidth(@images, 400, 580, 'column_width', 50)
      dimensions.should.eql [
        { id: 0, width: 580, height: 326.2877997914494 },
        { id: 1, width: 580, height: 326.3184392699811 },
        { id: 2, width: 580, height: 580 }
      ]




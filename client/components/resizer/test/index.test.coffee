{ extend } = require 'underscore'
sinon = require 'sinon'
rewire = require 'rewire'
resizer = rewire '../index'

describe 'resizer', ->

  before ->
    @src = 'https://d32dm0rphc51dk.cloudfront.net/RhCPuRWITO6WFW2Zu_u3EQ/large.jpg'
    resizer.__set__ 'endpoint', 'https://d7hftxdivxxvm.cloudfront.net'

  describe 'using the gemini proxy', ->

    describe '#resize', ->
      it 'returns the appropriate URL when no width is specified', ->
        resizer.resize @src, height: 300
          .should.equal 'https://d7hftxdivxxvm.cloudfront.net?resize_to=height&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRhCPuRWITO6WFW2Zu_u3EQ%2Flarge.jpg&height=300&quality=95'

      it 'returns the appropriate URL when no height is specified', ->
        resizer.resize @src, width: 300
          .should.equal 'https://d7hftxdivxxvm.cloudfront.net?resize_to=width&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRhCPuRWITO6WFW2Zu_u3EQ%2Flarge.jpg&width=300&quality=95'

      it 'returns the appropriate URL when both a height and width are specified', ->
        resizer.resize @src, width: 300, height: 200
          .should.equal 'https://d7hftxdivxxvm.cloudfront.net?resize_to=fit&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRhCPuRWITO6WFW2Zu_u3EQ%2Flarge.jpg&width=300&height=200&quality=95'

    describe '#crop', ->
      it 'returns the appropriate URL', ->
        resizer.crop @src, width: 32, height: 32
          .should.equal 'https://d7hftxdivxxvm.cloudfront.net?resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRhCPuRWITO6WFW2Zu_u3EQ%2Flarge.jpg&width=32&height=32&quality=95'

    describe '#fill', ->
      it 'is not really supported and falls back to crop', ->
        resizer.fill @src, width: 32, height: 32
          .should.equal 'https://d7hftxdivxxvm.cloudfront.net?resize_to=fill&src=https%3A%2F%2Fd32dm0rphc51dk.cloudfront.net%2FRhCPuRWITO6WFW2Zu_u3EQ%2Flarge.jpg&width=32&height=32&quality=95'

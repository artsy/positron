import _ from 'underscore'
import rewire from 'rewire'
import sinon from 'sinon'
const app = require('api/index.coffee')
const { fixtures, fabricate, empty } = require('api/test/helpers/db.coffee')
const resolvers = rewire('../resolvers.js')

describe('resolvers', () => {
  let article, server
  const req = { user: { channel_ids: ['456'] } }

  before((done) => {
    empty(() => {
      fabricate('users', { channel_ids: ['456'] }, (err, user) => {
        if (err) {
          done(err)
        }
        server = app.listen(5000, () => done())
      })
    })
  })

  beforeEach(() => {
    const articles = {
      total: 20,
      count: 1,
      results: [
        _.extend(fixtures().articles, {
          slugs: ['slug-1'],
          tags: ['dog'],
          vertical: { id: '54276766fd4f50996aeca2b3' }
        })
      ]
    }
    article = _.extend({}, fixtures().articles, {
      slugs: ['slug-2'],
      channel_id: '456'
    })
    const authors = { total: 20, count: 1, results: [fixtures().authors] }
    const channels = { total: 20, count: 1, results: [fixtures().channels] }
    const curations = { total: 20, count: 1, results: [fixtures().curations] }
    const tags = { total: 20, count: 1, results: [fixtures().tags] }
    resolvers.__set__('mongoFetch', sinon.stub().yields(null, articles))
    resolvers.__set__('Author', { mongoFetch: (sinon.stub().yields(null, authors)) })
    resolvers.__set__('Channel', { mongoFetch: (sinon.stub().yields(null, channels)) })
    resolvers.__set__('Curation', { mongoFetch: (sinon.stub().yields(null, curations)) })
    resolvers.__set__('Tag', { mongoFetch: (sinon.stub().yields(null, tags)) })
  })

  afterEach(() => {
    server.close()
  })

  describe('articles', () => {
    it('returns throws error when trying to view a draft without channel_id', () => {
      const args = { published: false }
      resolvers.articles.bind({}, args, {}, {}).should.throw()
    })

    it('returns throws an error when trying to view an unauthorized draft', () => {
      const args = { published: false, channel_id: '123' }
      resolvers.articles.bind({}, args, {}, {}).should.throw()
    })

    it('can view drafts', async () => {
      const args = { published: false, channel_id: '456' }
      const results = await resolvers.articles({}, args, req, {})
      results.length.should.equal(1)
      results[0].slug.should.equal('slug-1')
    })

    it('can view published articles', async () => {
      const args = { published: true }
      const results = await resolvers.articles({}, args, req, {})
      results.length.should.equal(1)
      results[0].slug.should.equal('slug-1')
    })
  })

  describe('article', () => {
    it('rejects with an error when no article is found', async () => {
      const args = { id: '123' }
      resolvers.__set__('find', (sinon.stub().yields(null, null)))
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql('Article not found.')
      }
    })

    it('rejects with an error when trying to view an unauthorized draft', async () => {
      const args = { id: '123' }
      const newArticle = _.extend({}, article, { channel_id: '000', published: false })
      resolvers.__set__('find', (sinon.stub().yields(null, newArticle)))
      try {
        await resolvers.article({}, args, {}, {})
      } catch (err) {
        err.toString().should.containEql('Must be a member of the channel')
      }
    })

    it('can view drafts', async () => {
      const args = { id: '123' }
      const newArticle = _.extend({}, article, { published: false })
      resolvers.__set__('find', (sinon.stub().yields(null, newArticle)))
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal('slug-2')
    })

    it('can view published articles', async () => {
      const args = { id: '123' }
      resolvers.__set__('find', (sinon.stub().yields(null, article)))
      const results = await resolvers.article({}, args, req, {})
      results.slug.should.equal('slug-2')
    })
  })

  describe('authors', () => {
    it('can find authors', async () => {
      const results = await resolvers.authors({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal('Halley Johnson')
      results[0].bio.should.equal('Writer based in NYC')
      results[0].twitter_handle.should.equal('kanaabe')
      results[0].image_url.should.equal('https://artsy-media.net/halley.jpg')
    })
  })

  describe('channels', () => {
    it('can find channels', async () => {
      const results = await resolvers.channels({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal('Editorial')
      results[0].type.should.equal('editorial')
    })
  })

  describe('curations', () => {
    it('can find curations', async () => {
      const results = await resolvers.curations({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal('Featured Articles')
    })
  })

  describe('display', () => {
    it('can fetch campaign data', async () => {
      const display = {
        total: 20,
        count: 1,
        results: [{ campaigns: [fixtures().display] }]
      }
      resolvers.__set__('Curation', { mongoFetch: (sinon.stub().yields(null, display)) })

      const result = await resolvers.display({}, {}, req, {})
      result.name.should.equal('Sample Campaign')
      result.canvas.headline.should.containEql('Sample copy')
      result.panel.headline.should.containEql('Euismod Inceptos Quam')
    })
  })

  describe('relatedArticlesCanvas', () => {
    it('can find related articles for the canvas', async () => {
      const results = await resolvers.relatedArticlesCanvas({
        id: '54276766fd4f50996aeca2b8',
        vertical: { id: '54276766fd4f50996aeca2b3' }
      })
      results.length.should.equal(1)
      results[0].vertical.id.should.equal('54276766fd4f50996aeca2b3')
    })
  })

  describe('relatedArticlesPanel', () => {
    it('can find related articles for the panel', async () => {
      const results = await resolvers.relatedArticlesPanel({
        id: '54276766fd4f50996aeca2b8',
        tags: ['dog', 'cat']
      })
      results.length.should.equal(1)
      results[0].tags[0].should.equal('dog')
    })
  })

  describe('tags', () => {
    it('can find tags', async () => {
      const results = await resolvers.tags({}, {}, req, {})
      results.length.should.equal(1)
      results[0].name.should.equal('Show Reviews')
    })
  })
})

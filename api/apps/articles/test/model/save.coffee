_ = require 'underscore'
rewire = require 'rewire'
{ fabricate, empty } = require '../../../../test/helpers/db'
Save = rewire '../../model/save'
Article = require '../../model/index'
express = require 'express'
gravity = require('antigravity').server
app = require('express')()
sinon = require 'sinon'

describe 'Save', ->

  before (done) ->
    app.use '/__gravity', gravity
    @server = app.listen 5000, ->
      done()

  after ->
    @server.close()

  beforeEach (done) ->
    @sailthru = Save.__get__ 'sailthru'
    @removeStopWords = Save.__get__ 'removeStopWords'
    @sailthru.apiPost = sinon.stub().yields()
    @sailthru.apiDelete = sinon.stub().yields()
    Save.__set__ 'sailthru', @sailthru
    Save.__set__ 'artsyXapp', { token: 'foo' }
    empty ->
      fabricate 'articles', _.times(10, -> {}), ->
        done()

  describe '#sendArticleToSailthru', ->

    it 'concats the article tag for a normal article', (done) ->
      Save.sendArticleToSailthru {
        author_id: '5086df098523e60002000018'
        published: true
      }, (err, article) =>
        @sailthru.apiPost.calledOnce.should.be.true()
        @sailthru.apiPost.args[0][1].tags.should.containEql 'article'
        @sailthru.apiPost.args[0][1].tags.should.not.containEql 'artsy-editorial'
        done()

    it 'concats the artsy-editorial and magazine tags for specialized articles', (done) ->
      Save.sendArticleToSailthru {
        author_id: '5086df098523e60002000018'
        published: true
        featured: true
      }, (err, article) =>
        @sailthru.apiPost.calledOnce.should.be.true()
        @sailthru.apiPost.args[0][1].tags.should.containEql 'article'
        @sailthru.apiPost.args[0][1].tags.should.containEql 'magazine'
        done()

    it 'concats the keywords at the end', (done) ->
      Save.sendArticleToSailthru {
        author_id: '5086df098523e60002000018'
        published: true
        featured: true
        keywords: ['sofa', 'midcentury', 'knoll']
      }, (err, article) =>
        @sailthru.apiPost.calledOnce.should.be.true()
        @sailthru.apiPost.args[0][1].tags[0].should.equal 'article'
        @sailthru.apiPost.args[0][1].tags[1].should.equal 'magazine'
        @sailthru.apiPost.args[0][1].tags[2].should.equal 'sofa'
        @sailthru.apiPost.args[0][1].tags[3].should.equal 'midcentury'
        @sailthru.apiPost.args[0][1].tags[4].should.equal 'knoll'
        done()

    it 'uses email_metadata vars if provided', (done) ->
      Save.sendArticleToSailthru {
        author_id: '5086df098523e60002000018'
        published: true
        email_metadata:
          credit_url: 'artsy.net'
          credit_line: 'Artsy Credit'
          headline: 'Article Email Title'
          author: 'Kana Abe'
          image_url: 'imageurl.com/image.jpg'
      }, (err, article) =>
        @sailthru.apiPost.args[0][1].title.should.containEql 'Article Email Title'
        @sailthru.apiPost.args[0][1].vars.credit_line.should.containEql 'Artsy Credit'
        @sailthru.apiPost.args[0][1].vars.credit_url.should.containEql 'artsy.net'
        @sailthru.apiPost.args[0][1].author.should.containEql 'Kana Abe'
        @sailthru.apiPost.args[0][1].images.full.url.should.containEql '&width=1200&height=706&quality=95&src=imageurl.com%2Fimage.jpg'
        @sailthru.apiPost.args[0][1].images.thumb.url.should.containEql '&width=900&height=530&quality=95&src=imageurl.com%2Fimage.jpg'
        done()

    it 'sends the article text body', (done) ->
      Save.sendArticleToSailthru {
        author_id: '5086df098523e60002000018'
        published: true
        send_body: true
        sections: [
          {
            type: 'text'
            body: '<html>BODY OF TEXT</html>'
          }
          {
            type: 'image'
            caption: 'This Caption'
            url: 'URL'
          }
        ]
      }, (err, article) =>
        @sailthru.apiPost.args[0][1].vars.html.should.containEql '<html>BODY OF TEXT</html>'
        @sailthru.apiPost.args[0][1].vars.html.should.not.containEql 'This Caption'
        done()

  describe '#deleteArticleFromSailthru', ->

    it 'deletes the article from sailthru', (done) ->
      Save.deleteArticleFromSailthru {
        slugs: ['artsy-editorial-delete-me']
        author_id: '5086df098523e60002000018'
      }, (err, article) =>
        @sailthru.apiDelete.args[0][1].url.should.containEql 'artsy-editorial-delete-me'
        done()

  describe '#removeStopWords', ->

    it 'removes stop words from a string', (done) ->
      @removeStopWords("I'll be there").should.containEql ''
      @removeStopWords('Why the Internet Is Obsessed with These Videos of People Making Things').should.containEql 'Why Internet Is Obsessed These Videos People Making Things'
      @removeStopWords('Heirs of Major Jewish Art Dealer Sue Bavaria over $20 Million of Nazi-Looted Art').should.containEql 'Heirs Major Jewish Art Dealer Sue Bavaria  20 Million Nazi-Looted Art'
      @removeStopWords('Helen Marten Wins UK’s Biggest Art Prize—and the 9 Other Biggest News Stories This Week').should.containEql 'Helen Marten Wins UK Biggest Art Prize 9 Other Biggest News Stories This Week'
      done()

  describe '#onUnpublish', ->

    it 'generates slugs and deletes article from sailthru', (done) ->
      Save.onUnpublish {
        thumbnail_title: 'delete me a title'
        author_id: '5086df098523e60002000018'
        author: {
          name: 'artsy editorial'
        }
      }, (err, article) =>
        article.slugs.length.should.equal 1
        @sailthru.apiDelete.args[0][1].url.should.containEql 'artsy-editorial-delete-title'
        done()

    it 'Regenerates the slug with stop words removed', (done) ->
      Save.onUnpublish {
        thumbnail_title: 'One New York Building Changed the Way Art Is Made, Seen, and Sold'
        author_id: '5086df098523e60002000018'
        author: {
          name: 'artsy editorial'
        }
      }, (err, article) =>
        article.slugs.length.should.equal 1
        @sailthru.apiDelete.args[0][1].url.should.containEql 'artsy-editorial-one-new-york-building-changed-way-art-is-made-seen-sold'
        done()


  describe '#sanitizeAndSave', ->

    it 'skips sanitizing links that do not have an href', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].body.should.containEql '<a></a>'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: false
        _id: '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<a>'
          }
        ]
      })

    it 'can save jump links (whitelist name and value)', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].body.should.containEql '<a name="andy" class="is-jump-link">Andy</a>'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: false
        _id: '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<a name="andy" class="is-jump-link">Andy</a>'
          }
        ]
      })

    it 'can save follow artist links (whitelist data-id)', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.sections[0].body.should.containEql '<a data-id="andy-warhol"></a>'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: false
        _id: '5086df098523e60002000011'
        sections: [
          {
            type: 'text'
            body: '<a data-id="andy-warhol"></a>'
          }
        ]
      })

    it 'saves email metadata', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.email_metadata.image_url.should.containEql 'foo.png'
          article.email_metadata.author.should.containEql 'Kana'
          article.email_metadata.headline.should.containEql 'Thumbnail Title'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: false
        _id: '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        thumbnail_image: 'foo.png'
        scheduled_publish_at: '123'
        author: name: 'Kana'
      })

    it 'does not override email metadata', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.email_metadata.image_url.should.containEql 'bar.png'
          article.email_metadata.author.should.containEql 'Artsy Editorial'
          article.email_metadata.headline.should.containEql 'Custom Headline'
          article.email_metadata.credit_url.should.containEql 'https://guggenheim.org'
          article.email_metadata.credit_line.should.containEql 'Guggenheim'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: false
        _id: '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        thumbnail_image: 'foo.png'
        email_metadata:
          image_url: 'bar.png'
          author: 'Artsy Editorial'
          headline: 'Custom Headline'
          credit_line: 'Guggenheim'
          credit_url: 'https://guggenheim.org'
        scheduled_publish_at: '123'
      })

    it 'saves generated descriptions', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.description.should.containEql 'Testing 123'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: true
        _id: '5086df098523e60002000011'
        sections: [
          { type: 'text', body: '<p>Testing 123</p>' }
        ]
        author: name: 'Kana'
      })

    it 'does not override description', (done) ->
      Save.sanitizeAndSave( ->
        Article.find '5086df098523e60002000011', (err, article) =>
          article.description.should.containEql 'Do not override me'
          done()
      )(null, {
        author_id: '5086df098523e60002000018'
        published: true
        _id: '5086df098523e60002000011'
        thumbnail_title: 'Thumbnail Title'
        sections: [
          { type: 'text', body: '<p>Testing 123</p>' }
        ]
        description: 'Do not override me'
      })

  describe '#generateArtworks', ->

    it 'denormalizes artworks and adds them as an array to the section', (done) ->
      Save.generateArtworks {
        sections: [
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['564be09ab202a319e90000e2']
            artworks: []
          }
        ]
      }, {}, (err, article) =>
        article.sections[0].artworks.length.should.equal 1
        article.sections[0].artworks[0].title.should.equal 'Main artwork!'
        article.sections[0].artworks[0].artists[0].name.should.equal 'Andy Warhol'
        done()

    it 'adds an array of artists to the artwork', (done) ->
      Save.generateArtworks {
        sections: [
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['564be09ab202a319e90000e2']
            artworks: []
          }
        ]
      }, {}, (err, article) =>
        article.sections[0].artworks[0].artists.length.should.equal 1
        article.sections[0].artworks[0].title.should.equal 'Main artwork!'
        article.sections[0].artworks[0].artists[0].name.should.equal 'Andy Warhol'
        done()

    it 'does not save artworks that are not available', (done) ->
      Save.generateArtworks {
        sections: [
          {
            type: 'text'
            body: 'fmodfmsdomf'
          }
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['123', '564be09ab202a319e90000e2']
            artworks: []
          }
        ]
      }, {}, (err, article) =>
        article.sections.length.should.equal 2
        article.sections[1].artworks[0].title.should.equal 'Main artwork!'
        article.sections[1].artworks.length.should.equal 1
        done()

    it 'removes an entire section if there are no available artworks', (done) ->
      Save.generateArtworks {
        sections: [
          {
            type: 'text'
            body: 'fmodfmsdomf'
          }
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['123']
            artworks: []
          }
        ]
      }, {}, (err, article) =>
        article.sections.length.should.equal 1
        done()

    it 'handles artworks that are removed', (done) ->
      Save.generateArtworks {
        sections: [
          {
            type: 'text'
            body: 'fmodfmsdomf'
          },
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['564be09ab202a319e90000e2']
            artworks: [{title: 'title'}, {title: 'second title'}]
          }
        ]
      },
      {
        sections: [
          {
            type: 'text'
            body: 'fmodfmsdomf'
          },
          {
            type: 'artworks'
            layout: 'overflow'
            ids: ['564be09ab202a319e90000e2', '456']
            artworks: [{title: 'title'}, {title: 'second title'}]
          }
        ]
      }, (err, article) =>
        article.sections.length.should.equal 2
        article.sections[1].artworks.length.should.equal 1
        article.sections[1].artworks[0].title.should.equal 'Main artwork!'
        done()

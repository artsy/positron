{
  APP_URL
  EDITORIAL_CHANNEL
  FORCE_URL
  FB_PAGE_ID
  GEMINI_CLOUDFRONT_URL
  NODE_ENV
  SEGMENT_WRITE_KEY_FORCE
} = process.env
_ = require 'underscore'
Backbone = require 'backbone'
search = require '../../../lib/elasticsearch'
async = require 'async'
debug = require('debug') 'api'
request = require 'superagent'
jade = require 'jade'
Article = require '../../../models/article.coffee'
moment = require 'moment'
{ cloneDeep } = require 'lodash'

@getArticleUrl = (article, slug) ->
  switch article.layout
    when 'classic', 'feature', 'standard'
      layout = 'article'
    else
      layout = article.layout
  articleSlug = if slug then slug else _.last(article.slugs)
  return "#{FORCE_URL}/#{layout}/#{articleSlug}"

#
# Search
#
@indexForSearch = (article, cb) ->
  if article.sections
    sections = for section in article.sections
      section.body
  tags = article.tags
  tags = tags.concat article.vertical.name if article.vertical
  search.client.index(
    index: search.index,
    type: '_doc',
    id: article.id?.toString(),
    body:
      slug: article.slug
      name: article.title
      description: article.description
      published: article.published
      published_at: article.published_at
      scheduled_publish_at: article.scheduled_publish_at
      visible_to_public: new Article(cloneDeep article).isVisibleToPublic()
      author: article.author and article.author.name or ''
      featured: article.featured
      tags: tags
      body: sections and stripHtmlTags(sections.join(' ')) or ''
      image_url: crop(article.thumbnail_image, { width: 70, height: 70 })
      search_boost: new Article(cloneDeep article).searchBoost()
      type: 'article'
    , (error, response) ->
      console.log('ElasticsearchIndexingError: Article ' + article.id + ' : ' + error) if error
      cb()
  )

@removeFromSearch = (id) ->
  deleteParams =
    index: search.index
    id: id

  # Only include type parameter for Elasticsearch
  deleteParams.type = if search.isOpenSearch then '_doc' else 'article'
  console.log('Deleting from search index:', deleteParams)

  search.client.delete(deleteParams, (error, response) ->
    console.log(error) if error
  )

stripHtmlTags = (str) ->
  if (str == null)
    return ''
  else
    String(str).replace /<\/?[^>]+>/g, ''

crop = (url, options = {}) ->
  { width, height } = options
  "#{GEMINI_CLOUDFRONT_URL}/?resize_to=fill&width=#{width}&height=#{height}&quality=95&src=#{encodeURIComponent(url)}"

getTextSections = (article) ->
  condensedHTML = article.lead_paragraph or ''
  _.map article.sections, (section) ->
    condensedHTML = condensedHTML.concat section.body if section.type is 'text'
  condensedHTML

_ = require 'underscore'
moment = require 'moment'

@toQuery = (input, callback) ->
  { limit, offset, sort, count } = input
  query = _.omit input,
    'limit'
    'offset'
    'sort'
    'count'
    'fair_id'
    'fair_programming_id'
    'fair_artsy_id'
    'fair_about_id'
    'partner_id'
    'show_id'
    'auction_id'
    'section_id'
    'ids'
    'artwork_id'
    'tags'
    'tracking_tags'
    'super_article_for'
    'channel_id'
    'all_by_author'
    'artist_id'
    'has_video'
    'fair_ids'
    'vertical'
    'q'
    'scheduled'
    'access_token'
  query.fair_ids = input.fair_id if input.fair_id
  if input.fair_programming_id
    query.fair_programming_ids = input.fair_programming_id
  query.fair_artsy_ids = input.fair_artsy_id if input.fair_artsy_id
  query.fair_about_ids = input.fair_about_id if input.fair_about_id
  query.partner_ids = input.partner_id if input.partner_id
  query.show_ids = input.show_id if input.show_id
  query.auction_ids = input.auction_id if input.auction_id
  query.section_ids = input.section_id if input.section_id
  query._id = { $in: input.ids } if input.ids
  query.featured_artwork_ids = input.artwork_id if input.artwork_id
  query.tags = { $in: input.tags } if input.tags
  query.tracking_tags = { $in: input.tracking_tags } if input.tracking_tags

  # Convert query for super article for article
  if input.super_article_for
    query['super_article.related_articles']= input.super_article_for

  # Only add the $or array for queries that require it (blank $or array causes problems)
  query.$or ?= [] if input.artist_id or input.all_by_author or
    input.has_video or input.channel_id

  # Convert query for channel_id to include partner_channel_id
  query.$or.push(
    { channel_id: input.channel_id }
    { partner_channel_id: input.channel_id }
  ) if input.channel_id

  # Convert query for articles by author
  query.$or.push(
    { author_id: input.all_by_author }
    { contributing_authors: { $elemMatch: { id: input.all_by_author } } }
  ) if input.all_by_author

  # Convert query for articles featured to an artist or artwork
  query.$or.push(
    { primary_featured_artist_ids: input.artist_id }
    { featured_artist_ids: input.artist_id }
    { biography_for_artist_id: input.artist_id }
  ) if input.artist_id

  # Convert query for articles that have video sections
  query.$or.push(
    { sections: { $elemMatch: { type: 'video' } } }
    { 'hero_section.type': 'video' }
  ) if input.has_video

  # Find articles that contain fair_ids
  if input.fair_ids
    query.fair_ids = { $elemMatch: { $in: input.fair_ids } }

  # Convert query for articles by vertical
  query.vertical = { $elemMatch: { id: input.vertical } } if input.vertical

  # Allow regex searching through the q param
  query.thumbnail_title = { $regex: new RegExp(input.q, 'i') } if input.q and input.q.length

  # Look for articles that are scheduled
  query.scheduled_publish_at = { $ne: null } if input.scheduled

  {
    query: query
    limit: limit
    offset: offset
    sort: sortParamToQuery(sort)
    count: count
  }

sortParamToQuery = (input) ->
  return { updated_at: -1 } unless input
  sort = {}
  for param in input.split(',')
    if param.substring(0, 1) is '-'
      sort[param.substring(1)] = -1
    else
      sort[param] = 1
  sort

Joi = require '../../../lib/joi'
{ API_MAX, API_PAGE_SIZE } = process.env

#
# Input Schema
#
imageSection = (->
  @object().meta(
    name: 'Image'
    isTypeOf: (data) -> data.type is 'image'
  ).keys
    type: @string().valid('image')
    url: @string().allow('', null)
    caption: @string().allow('', null)
    width: @number().allow(null)
    height: @number().allow(null)
    layout: @string().allow('', null)
).call Joi

videoSection = (->
  @object().meta(
    name: 'Video'
    isTypeOf: (data) -> data.type is 'video'
  ).keys
    type: @string().valid('video', 'basic')
    url: @string().allow('', null)
    caption: @string().allow('', null)
    cover_image_url: @string().allow('', null)
    layout: @string().allow('column_width', 'overflow_fillwidth', 'fillwidth', '', null)
    background_color: @string().allow('',null)
).call Joi

featureSection = (->
  @object().meta(
    name: 'FeatureHeader'
    isTypeOf: (data) -> data.type in ['fullscreen', 'split', 'text', 'basic']
  ).keys
    type: @string().valid('fullscreen', 'split', 'text', 'basic').default('text')
    title: @string().allow('',null)
    intro: @string().allow('',null) # TODO - Remove after backfill
    deck: @string().allow('',null)
    url: @string().allow('',null)
).call Joi

seriesSection = (->
  @object().meta(
    name: 'SeriesHeader'
    isTypeOf: (data) -> data.type in ['series']
  ).keys
    type: @string().valid('series').default('series')
    url: @string().allow('')
).call Joi

denormalizedArtwork = (->
  @object().meta(
    name: 'Artwork'
    isTypeOf: (data) -> data.type is 'artwork'
  ).keys
    type: @string().valid('artwork').default('artwork')
    id: @string().allow('', null)
    slug: @string().allow('', null)
    date: @string().allow('', null)
    title: @string().allow('', null)
    image: @string().allow('', null)
    partner: @object().keys
      name: @string().allow('', null)
      slug: @string().allow('', null)
    artists: @array().items(
      @object().keys
        name: @string().allow('', null)
        slug: @string().allow('', null)
    ).allow(null).default([])
    artist: @object().keys
      name: @string().allow('', null)
      slug: @string().allow('', null)
    width: @number().allow(null)
    height: @number().allow(null)
    credit: @string().allow('')
).call Joi

ImageCollectionSection = (->
  @object().meta(
    name: 'ImageCollection'
    isTypeOf: (data) -> data.type is 'image_collection'
  ).keys
    type: 'image_collection'
    layout: @string().allow(
      'column_width', 'overflow_fillwidth', 'fillwidth'
    ).default('overflow_fillwidth')
    images: @array().items([denormalizedArtwork, imageSection])
).call Joi

@inputSchema = (->
  id: @string().objectid()
  internalID: @string().objectid()
  author_id: @string().objectid()
  author_ids: @array().items(@string().objectid()).default([])
  author: @object().keys
    name: @string().allow('').default('')
    id: @string().objectid()
  tier: @number().default(2)
  thumbnail_title: @string().allow('', null)
  thumbnail_teaser: @string().allow('', null)
  thumbnail_image: @string().allow('', null)
  tags: @array().items(@string()).default([])
  tracking_tags: @array().items(@string()).default([])
  vertical: @object().keys(
    name: @string()
    id: @string().objectid()
  ).allow(null)
  title: @string().allow('', null)
  layout: @string().allow('classic', 'feature', 'news', 'standard', 'series', 'video').default('classic')
  updated_at: @date()
  published: @boolean().default(false)
  published_at: @date().allow(null)
  scheduled_publish_at: @date().allow(null)
  lead_paragraph: @string().allow('', null)
  gravity_id: @string().objectid().allow('', null)
  hero_section: @alternatives().try(videoSection, ImageCollectionSection, imageSection, featureSection, seriesSection).allow(null).default(null)
  series: @object().keys(
    description: @string().allow('')
    sub_title: @string().allow('')
  ).allow(null)
  sections: @array().items([
    ImageCollectionSection
    videoSection
    @object().meta(
      name: 'MarketingCollection'
      isTypeOf: (data) -> data.type is 'marketing_collection'
      ).keys
        type: @string().valid('collection')
        slug: @string().allow('')
        image_url: @string().allow('', null)
        name: @string().allow('', null)
    @object().meta(
      name: 'Callout'
      isTypeOf: (data) -> data.type is 'callout'
    ).keys
      type: @string().valid('callout')
      thumbnail_url: @string().allow('',null)
      text: @string().allow('',null)
      article: @string().allow('',null)
      hide_image: @boolean().default(false)
      top_stories: @boolean().default(false)
    @object().meta(
      name: 'Embed'
      isTypeOf: (data) -> data.type is 'embed'
    ).keys
      type: @string().valid('embed')
      url: @string().allow('',null)
      height: @string().allow('',null)
      mobile_height: @string().allow('',null)
      layout: @string().allow('column_width', 'overflow', 'overflow_fillwidth', 'fillwidth', '', null)
    @object().meta(
      name: 'SocialEmbed'
      isTypeOf: (data) -> data.type is 'social_embed'
    ).keys
      type: @string().valid('social_embed')
      url: @string().allow('',null)
      layout: @string().allow('column_width', null)
    @object().meta(
      name: 'Text'
      isTypeOf: (data) -> data.type is 'text'
    ).keys
      type: @string().valid('text')
      body: @string().allow('', null)
      layout: @string().allow('blockquote', null)
    @object().meta(
      name: 'Slideshow'
      isTypeOf: (data) -> data.type is 'slideshow'
    ).keys
      type: @string().valid('slideshow')
      items: @array().items [
        imageSection
        videoSection
        @object().keys
          type: @string().valid('artwork')
          id: @string()
      ]
    @object().meta(
      name: 'ImageSet'
      isTypeOf: (data) -> data.type is 'image_set'
    ).keys
      type: 'image_set'
      title: @string().allow('',null)
      layout: @string().allow('full', 'mini', null)
      images: @array().items([denormalizedArtwork, imageSection])
  ]).allow(null)
  media: @object().default({}).keys(
    url: @string().allow('')
    cover_image_url: @string().allow('')
    duration: @number().default(0)
    release_date: @date()
    published: @boolean().default(false)
    description: @string().allow('')
    credits: @string().allow('')
  )
  postscript: @string().allow('', null)
  related_article_ids: @array().items(@string().objectid()).default([])
  primary_featured_artist_ids: @array().items(@string().objectid()).allow(null)
  featured_artist_ids: @array().items(@string().objectid()).allow(null)
  featured_artwork_ids: @array().items(@string().objectid()).allow(null)
  partner_ids: @array().items(@string().objectid()).allow(null)
  show_ids: @array().items(@string().objectid()).allow(null)
  fair_ids: @array().items(@string().objectid()).default([])
  fair_programming_ids: @array().items(@string().objectid()).default([])
  fair_artsy_ids: @array().items(@string().objectid()).default([])
  fair_about_ids: @array().items(@string().objectid()).default([])
  auction_ids: @array().items(@string().objectid()).default([])
  section_ids: @array().items(@string().objectid()).default([])
  biography_for_artist_id: @string().objectid().allow(null)
  featured: @boolean().default(false)
  exclude_google_news: @boolean().default(false)
  indexable: @boolean().default(true)
  contributing_authors: @array().items([
    @object().meta(name: 'ContributingAuthor').keys
      id: @string().objectid().allow(null)
      name: @string().allow('', null)
  ]).default([])
  sponsor: @object().default({}).keys(
    description: @string().allow('')
    sub_title: @string().allow('')
    partner_dark_logo: @string().allow('')
    partner_light_logo: @string().allow('')
    partner_condensed_logo: @string().allow('')
    partner_logo_link: @string().allow('')
    pixel_tracking_code: @string().allow('')
  )
  email_metadata: @object().default({}).keys
    image_url: @string().allow('', null)
    headline: @string().allow('')
    author: @string().allow('')
    custom_text: @string().allow('')
  is_super_article: @boolean().default(false)
  super_article: @object().keys
    partner_link: @string().allow('',null)
    partner_link_title: @string().allow('',null)
    partner_logo: @string().allow('',null)
    partner_logo_link: @string().allow('',null)
    partner_fullscreen_header_logo: @string().allow('',null)
    secondary_partner_logo: @string().allow('',null)
    secondary_logo_text: @string().allow('',null)
    secondary_logo_link: @string().allow('',null)
    footer_blurb: @string().allow('',null)
    related_articles: @array().items(@string().objectid()).default([])
    footer_title: @string().allow('', null)
  send_body: @boolean().default(false)
  channel_id: @string().objectid().allow(null).default(null)
  partner_channel_id: @string().objectid().allow(null).default(null)
  description: @string().allow('',null)
  slug: @string().allow(null)
  daily_email: @boolean().allow(null).default(false)
  weekly_email: @boolean().allow(null).default(false)
  social_image: @string().allow('', null)
  social_title: @string().allow('', null)
  social_description: @string().allow('', null)
  search_title: @string().allow('', null)
  search_description: @string().allow('', null)
  seo_keyword: @string().allow('', null)
  keywords: @array().items(@string()).allow(null)
  news_source: @object().default({}).keys
    title: @string().allow('')
    url: @string().allow('')
).call Joi

#
# Query Schema (input arguments)
#
@querySchema = (->
  id: @string().objectid()
  ids: @array().items(@string().objectid())
  access_token: @string()
  all_by_author: @string().objectid()
  artist_id: @string().objectid()
  artwork_id: @string().objectid()
  auction_id: @string().objectid()
  author_id: @string().objectid()
  biography_for_artist_id: @string().objectid()
  channel_id: @string().objectid()
  count: @boolean().default(false)
  daily_email: @boolean()
  exclude_google_news: @boolean()
  fair_about_id: @string().objectid()
  fair_artsy_id: @string().objectid()
  fair_id: @string().objectid()
  fair_ids: @array().items(@string().objectid())
  fair_programming_id: @string().objectid()
  featured: @boolean()
  has_video: @boolean()
  indexable: @boolean()
  in_editorial_feed: @boolean()
  is_super_article: @boolean()
  layout: @string()
  limit: @number().max(Number API_MAX).default(Number API_PAGE_SIZE)
  offset: @number()
  omit: @array().items(@string())
  partner_id: @string().objectid()
  published: @boolean().default(true)
  q: @string().allow('')
  scheduled: @boolean()
  section_id: @string().objectid()
  show_id: @string().objectid()
  sort: @string()
  super_article_for: @string().objectid()
  tags: @array().items(@string())
  tier: @number()
  tracking_tags: @array().items(@string())
  vertical: @string().objectid()
  weekly_email: @boolean()
).call Joi

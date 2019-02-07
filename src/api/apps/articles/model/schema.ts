const Joi = require("../../../lib/joi")
const { API_MAX, API_PAGE_SIZE } = process.env

//
// Input Schema
//
const imageSection = (() => {
  return Joi.object()
    .meta({
      name: "Image",
      isTypeOf(data) {
        return data.type === "image"
      },
    })
    .keys({
      type: Joi.string().valid("image"),
      url: Joi.string().allow("", null),
      caption: Joi.string().allow("", null),
      width: Joi.number().allow(null),
      height: Joi.number().allow(null),
      layout: Joi.string().allow("", null),
    })
}).call(Joi)

const videoSection = (() => {
  return Joi.object()
    .meta({
      name: "Video",
      isTypeOf(data) {
        return data.type === "video"
      },
    })
    .keys({
      type: Joi.string().valid("video", "basic"),
      url: Joi.string().allow("", null),
      caption: Joi.string().allow("", null),
      cover_image_url: Joi.string().allow("", null),
      layout: Joi.string().allow(
        "column_width",
        "overflow_fillwidth",
        "fillwidth",
        "",
        null
      ),
      background_color: Joi.string().allow("", null),
    })
}).call(Joi)

const featureSection = (() => {
  return Joi.object()
    .meta({
      name: "FeatureHeader",
      isTypeOf(data) {
        return ["fullscreen", "split", "text", "basic"].includes(data.type)
      },
    })
    .keys({
      type: Joi.string()
        .valid("fullscreen", "split", "text", "basic")
        .default("text"),
      title: Joi.string().allow("", null),
      intro: Joi.string().allow("", null), // TODO - Remove after backfill
      deck: Joi.string().allow("", null),
      url: Joi.string().allow("", null),
    })
}).call(Joi)

const seriesSection = (() => {
  return Joi.object()
    .meta({
      name: "SeriesHeader",
      isTypeOf(data) {
        return ["series"].includes(data.type)
      },
    })
    .keys({
      type: Joi.string()
        .valid("series")
        .default("series"),
      url: Joi.string().allow(""),
    })
}).call(Joi)

const denormalizedArtwork = (() => {
  return Joi.object()
    .meta({
      name: "Artwork",
      isTypeOf(data) {
        return data.type === "artwork"
      },
    })
    .keys({
      type: Joi.string()
        .valid("artwork")
        .default("artwork"),
      id: Joi.string().allow("", null),
      slug: Joi.string().allow("", null),
      date: Joi.string().allow("", null),
      title: Joi.string().allow("", null),
      image: Joi.string().allow("", null),
      partner: Joi.object().keys({
        name: Joi.string().allow("", null),
        slug: Joi.string().allow("", null),
      }),
      artists: Joi.array()
        .items(
          Joi.object().keys({
            name: Joi.string().allow("", null),
            slug: Joi.string().allow("", null),
          })
        )
        .allow(null)
        .default([]),
      artist: Joi.object().keys({
        name: Joi.string().allow("", null),
        slug: Joi.string().allow("", null),
      }),
      width: Joi.number().allow(null),
      height: Joi.number().allow(null),
      credit: Joi.string().allow(""),
    })
}).call(Joi)

const ImageCollectionSection = (() => {
  return Joi.object()
    .meta({
      name: "ImageCollection",
      isTypeOf(data) {
        return data.type === "image_collection"
      },
    })
    .keys({
      type: "image_collection",
      layout: Joi.string()
        .allow("column_width", "overflow_fillwidth", "fillwidth")
        .default("overflow_fillwidth"),
      images: Joi.array().items([denormalizedArtwork, imageSection]),
    })
}).call(Joi)

export const inputSchema = Joi.object().keys({
  id: Joi.string().objectid(),
  author_id: Joi.string().objectid(),
  author_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  author: Joi.object().keys({
    name: Joi.string()
      .allow("")
      .default(""),
    id: Joi.string().objectid(),
  }),
  tier: Joi.number().default(2),
  thumbnail_title: Joi.string().allow("", null),
  thumbnail_teaser: Joi.string().allow("", null),
  thumbnail_image: Joi.string().allow("", null),
  tags: Joi.array()
    .items(Joi.string())
    .default([]),
  tracking_tags: Joi.array()
    .items(Joi.string())
    .default([]),
  vertical: Joi.object()
    .keys({
      name: Joi.string(),
      id: Joi.string().objectid(),
    })
    .allow(null),
  title: Joi.string().allow("", null),
  layout: Joi.string()
    .allow("classic", "feature", "news", "standard", "series", "video")
    .default("classic"),
  updated_at: Joi.date(),
  published: Joi.boolean().default(false),
  published_at: Joi.date().allow(null),
  scheduled_publish_at: Joi.date().allow(null),
  lead_paragraph: Joi.string().allow("", null),
  gravity_id: Joi.string()
    .objectid()
    .allow("", null),
  hero_section: Joi.alternatives()
    .try(
      videoSection,
      ImageCollectionSection,
      imageSection,
      featureSection,
      seriesSection
    )
    .allow(null)
    .default(null),
  series: Joi.object()
    .keys({
      description: Joi.string().allow(""),
      sub_title: Joi.string().allow(""),
    })
    .allow(null),
  sections: Joi.array()
    .items([
      ImageCollectionSection,
      videoSection,
      Joi.object()
        .meta({
          name: "Callout",
          isTypeOf(data) {
            return data.type === "callout"
          },
        })
        .keys({
          type: Joi.string().valid("callout"),
          thumbnail_url: Joi.string().allow("", null),
          text: Joi.string().allow("", null),
          article: Joi.string().allow("", null),
          hide_image: Joi.boolean().default(false),
          top_stories: Joi.boolean().default(false),
        }),
      Joi.object()
        .meta({
          name: "Embed",
          isTypeOf(data) {
            return data.type === "embed"
          },
        })
        .keys({
          type: Joi.string().valid("embed"),
          url: Joi.string().allow("", null),
          height: Joi.string().allow("", null),
          mobile_height: Joi.string().allow("", null),
          layout: Joi.string().allow(
            "column_width",
            "overflow",
            "overflow_fillwidth",
            "fillwidth",
            "",
            null
          ),
        }),
      Joi.object()
        .meta({
          name: "SocialEmbed",
          isTypeOf(data) {
            return data.type === "social_embed"
          },
        })
        .keys({
          type: Joi.string().valid("social_embed"),
          url: Joi.string().allow("", null),
          layout: Joi.string().allow("column_width", null),
        }),
      Joi.object()
        .meta({
          name: "Text",
          isTypeOf(data) {
            return data.type === "text"
          },
        })
        .keys({
          type: Joi.string().valid("text"),
          body: Joi.string().allow("", null),
          layout: Joi.string().allow("blockquote", null),
        }),
      Joi.object()
        .meta({
          name: "Slideshow",
          isTypeOf(data) {
            return data.type === "slideshow"
          },
        })
        .keys({
          type: Joi.string().valid("slideshow"),
          items: Joi.array().items([
            imageSection,
            videoSection,
            Joi.object().keys({
              type: Joi.string().valid("artwork"),
              id: Joi.string(),
            }),
          ]),
        }),
      Joi.object()
        .meta({
          name: "ImageSet",
          isTypeOf(data) {
            return data.type === "image_set"
          },
        })
        .keys({
          type: "image_set",
          title: Joi.string().allow("", null),
          layout: Joi.string().allow("full", "mini", null),
          images: Joi.array().items([denormalizedArtwork, imageSection]),
        }),
    ])
    .allow(null),
  media: Joi.object()
    .default({})
    .keys({
      url: Joi.string().allow(""),
      cover_image_url: Joi.string().allow(""),
      duration: Joi.number().default(0),
      release_date: Joi.date(),
      published: Joi.boolean().default(false),
      description: Joi.string().allow(""),
      credits: Joi.string().allow(""),
    }),
  postscript: Joi.string().allow("", null),
  related_article_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  primary_featured_artist_ids: Joi.array()
    .items(Joi.string().objectid())
    .allow(null),
  featured_artist_ids: Joi.array()
    .items(Joi.string().objectid())
    .allow(null),
  featured_artwork_ids: Joi.array()
    .items(Joi.string().objectid())
    .allow(null),
  partner_ids: Joi.array()
    .items(Joi.string().objectid())
    .allow(null),
  show_ids: Joi.array()
    .items(Joi.string().objectid())
    .allow(null),
  fair_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  fair_programming_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  fair_artsy_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  fair_about_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  auction_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  section_ids: Joi.array()
    .items(Joi.string().objectid())
    .default([]),
  biography_for_artist_id: Joi.string()
    .objectid()
    .allow(null),
  featured: Joi.boolean().default(false),
  exclude_google_news: Joi.boolean().default(false),
  indexable: Joi.boolean().default(true),
  contributing_authors: Joi.array()
    .items([
      Joi.object()
        .meta({ name: "ContributingAuthor" })
        .keys({
          id: Joi.string()
            .objectid()
            .allow(null),
          name: Joi.string().allow("", null),
        }),
    ])
    .default([]),
  sponsor: Joi.object()
    .default({})
    .keys({
      description: Joi.string().allow(""),
      sub_title: Joi.string().allow(""),
      partner_dark_logo: Joi.string().allow(""),
      partner_light_logo: Joi.string().allow(""),
      partner_condensed_logo: Joi.string().allow(""),
      partner_logo_link: Joi.string().allow(""),
      pixel_tracking_code: Joi.string().allow(""),
    }),
  email_metadata: Joi.object()
    .default({})
    .keys({
      image_url: Joi.string().allow("", null),
      headline: Joi.string().allow(""),
      author: Joi.string().allow(""),
      custom_text: Joi.string().allow(""),
    }),
  is_super_article: Joi.boolean().default(false),
  super_article: Joi.object().keys({
    partner_link: Joi.string().allow("", null),
    partner_link_title: Joi.string().allow("", null),
    partner_logo: Joi.string().allow("", null),
    partner_logo_link: Joi.string().allow("", null),
    partner_fullscreen_header_logo: Joi.string().allow("", null),
    secondary_partner_logo: Joi.string().allow("", null),
    secondary_logo_text: Joi.string().allow("", null),
    secondary_logo_link: Joi.string().allow("", null),
    footer_blurb: Joi.string().allow("", null),
    related_articles: Joi.array()
      .items(Joi.string().objectid())
      .default([]),
    footer_title: Joi.string().allow("", null),
  }),
  send_body: Joi.boolean().default(false),
  channel_id: Joi.string()
    .objectid()
    .allow(null)
    .default(null),
  partner_channel_id: Joi.string()
    .objectid()
    .allow(null)
    .default(null),
  description: Joi.string().allow("", null),
  slug: Joi.string().allow(null),
  daily_email: Joi.boolean()
    .allow(null)
    .default(false),
  weekly_email: Joi.boolean()
    .allow(null)
    .default(false),
  social_image: Joi.string().allow("", null),
  social_title: Joi.string().allow("", null),
  social_description: Joi.string().allow("", null),
  search_title: Joi.string().allow("", null),
  search_description: Joi.string().allow("", null),
  seo_keyword: Joi.string().allow("", null),
  keywords: Joi.array()
    .items(Joi.string())
    .allow(null),
  news_source: Joi.object()
    .default({})
    .keys({
      title: Joi.string().allow(""),
      url: Joi.string().allow(""),
    }),
})

//
// Query Schema
//
export const querySchema = {
  id: Joi.string().objectid(),
  ids: Joi.array().items(Joi.string().objectid()),
  access_token: Joi.string(),
  all_by_author: Joi.string().objectid(),
  artist_id: Joi.string().objectid(),
  artwork_id: Joi.string().objectid(),
  auction_id: Joi.string().objectid(),
  author_id: Joi.string().objectid(),
  biography_for_artist_id: Joi.string().objectid(),
  channel_id: Joi.string().objectid(),
  count: Joi.boolean().default(false),
  daily_email: Joi.boolean(),
  exclude_google_news: Joi.boolean(),
  fair_about_id: Joi.string().objectid(),
  fair_artsy_id: Joi.string().objectid(),
  fair_id: Joi.string().objectid(),
  fair_ids: Joi.array().items(Joi.string().objectid()),
  fair_programming_id: Joi.string().objectid(),
  featured: Joi.boolean(),
  has_video: Joi.boolean(),
  indexable: Joi.boolean(),
  in_editorial_feed: Joi.boolean(),
  is_super_article: Joi.boolean(),
  layout: Joi.string(),
  limit: Joi.number()
    .max(Number(API_MAX))
    .default(Number(API_PAGE_SIZE)),
  offset: Joi.number(),
  omit: Joi.array().items(Joi.string()),
  partner_id: Joi.string().objectid(),
  published: Joi.boolean().default(true),
  q: Joi.string().allow(""),
  scheduled: Joi.boolean(),
  section_id: Joi.string().objectid(),
  show_id: Joi.string().objectid(),
  sort: Joi.string(),
  super_article_for: Joi.string().objectid(),
  tags: Joi.array().items(Joi.string()),
  tier: Joi.number(),
  tracking_tags: Joi.array().items(Joi.string()),
  vertical: Joi.string().objectid(),
  weekly_email: Joi.boolean(),
}

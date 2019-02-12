import { each, omit } from "lodash"
import { ObjectId } from "mongojs"

export const toQuery = (input, callback) => {
  const { limit, offset, sort, count } = input
  const query = omit(
    input,
    "limit",
    "offset",
    "sort",
    "count",
    "fair_id",
    "fair_programming_id",
    "fair_artsy_id",
    "fair_about_id",
    "partner_id",
    "show_id",
    "auction_id",
    "section_id",
    "ids",
    "artwork_id",
    "tags",
    "tracking_tags",
    "super_article_for",
    "channel_id",
    "all_by_author",
    "artist_id",
    "has_video",
    "has_published_media",
    "fair_ids",
    "vertical",
    "q",
    "scheduled",
    "access_token",
    "omit",
    "in_editorial_feed"
  )
  if (input.fair_id) {
    query.fair_ids = input.fair_id
  }
  if (input.fair_programming_id) {
    query.fair_programming_ids = input.fair_programming_id
  }
  if (input.fair_artsy_id) {
    query.fair_artsy_ids = input.fair_artsy_id
  }
  if (input.fair_about_id) {
    query.fair_about_ids = input.fair_about_id
  }
  if (input.partner_id) {
    query.partner_ids = input.partner_id
  }
  if (input.show_id) {
    query.show_ids = input.show_id
  }
  if (input.auction_id) {
    query.auction_ids = input.auction_id
  }
  if (input.section_id) {
    query.section_ids = input.section_id
  }
  if (input.ids) {
    query._id = { $in: input.ids }
  }
  if (input.artwork_id) {
    query.featured_artwork_ids = input.artwork_id
  }
  if (input.tags) {
    query.tags = { $in: input.tags }
  }
  if (input.tracking_tags) {
    query.tracking_tags = { $in: input.tracking_tags }
  }

  // Convert query for super article for article
  if (input.super_article_for) {
    query["super_article.related_articles"] = input.super_article_for
  }

  // Only add the $or array for queries that require it (blank $or array causes problems)
  if (
    input.artist_id ||
    input.all_by_author ||
    input.has_video ||
    input.channel_id ||
    input.has_published_media
  ) {
    if (query.$or == null) {
      query.$or = []
    }
  }

  // Convert query for channel_id to include partner_channel_id
  if (input.channel_id) {
    query.$or.push(
      { channel_id: input.channel_id },
      { partner_channel_id: input.channel_id }
    )
  }

  // Convert query for articles by author
  if (input.all_by_author) {
    query.$or.push(
      { author_id: input.all_by_author },
      { contributing_authors: { $elemMatch: { id: input.all_by_author } } }
    )
  }

  // Convert query for articles featured to an artist or artwork
  if (input.artist_id) {
    query.$or.push(
      { primary_featured_artist_ids: input.artist_id },
      { featured_artist_ids: input.artist_id },
      { biography_for_artist_id: input.artist_id }
    )
  }

  // Convert query for articles that have video sections
  if (input.has_video) {
    query.$or.push(
      { sections: { $elemMatch: { type: "video" } } },
      { "hero_section.type": "video" }
    )
  }

  // Convert query for video layout articles with published media

  if (input.has_published_media) {
    query.$or.push(
      { layout: "video", "media.published": true },
      { layout: { $in: ["feature", "standard", "series"] } }
    )
  }

  // Find articles that contain fair_ids
  if (input.fair_ids) {
    query.fair_ids = { $elemMatch: { $in: input.fair_ids } }
  }

  // Convert query for articles in editorial feed
  if (input.in_editorial_feed) {
    query.layout = { $in: ["feature", "standard", "series", "video"] }
  }

  // Convert query for articles by vertical
  if (input.vertical) {
    query["vertical.id"] = input.vertical
  }

  // Allow regex searching through the q param
  if (input.q && input.q.length) {
    query.thumbnail_title = { $regex: new RegExp(input.q, "i") }
  }

  // Look for articles that are scheduled
  if (input.scheduled) {
    query.scheduled_publish_at = { $ne: null }
  }

  // Omit articles from query
  if (input.omit) {
    const objectids = []
    const slugs = []
    each(input.omit, function(id) {
      if (ObjectId.isValid(id)) {
        return objectids.push(ObjectId(id))
      } else {
        return slugs.push(id)
      }
    })
    if (slugs.length) {
      query.slugs = { $nin: slugs }
    }
    if (objectids.length) {
      query._id = { $nin: objectids }
    }
  }

  return {
    query,
    limit,
    offset,
    sort: sortParamToQuery(sort),
    count,
  }
}

var sortParamToQuery = function(input) {
  if (!input) {
    return { updated_at: -1 }
  }
  const sort = {}
  for (let param of Array.from(input.split(","))) {
    if (param.substring(0, 1) === "-") {
      sort[param.substring(1)] = -1
    } else {
      sort[param] = 1
    }
  }
  return sort
}

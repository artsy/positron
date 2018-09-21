import _s from "underscore.string"
import cheerio from "cheerio"
import url from "url"
import {
  compact,
  findIndex,
  findLastIndex,
  flatten,
  last,
  pluck,
} from "underscore"

export const getArticleByline = article => {
  const { contributing_authors, author } = article

  if (contributing_authors && contributing_authors.length) {
    return _s.toSentence(pluck(contributing_authors, "name"))
  } else if (author.name) {
    return author.name
  }
}

export const getSlugsFromHTML = (html, model) => {
  const $ = cheerio.load(html)
  const slugs = compact($("a")).map(a => {
    let href = $(a).attr("href")
    if (href) {
      if (href.match("google")) {
        href = decodeURIComponent(
          href.replace("https://www.google.com/url?q=", "")
        )
        href = href.split("&")[0]
      }
      if (href.match(`artsy.net/${model}`)) {
        return last(url.parse(href).pathname.split("/"))
      } else {
        return null
      }
    } else {
      return null
    }
  })
  return slugs
}

export const getMentionedArtistSlugs = article => {
  const slugs = article.sections.map(section => {
    switch (section.type) {
      case "text": {
        return getSlugsFromHTML(section.body, "artist")
      }
      case "image_set":
      case "image_collection": {
        return section.images.map(image => {
          if (image.type === "artwork") {
            return image.artists.map(artist => artist.id)
          } else {
            return getSlugsFromHTML(image.caption, "artist")
          }
        })
      }
    }
  })
  return compact(flatten(slugs))
}

export const getMentionedArtworkSlugs = article => {
  const slugs = article.sections.map(section => {
    switch (section.type) {
      case "text": {
        return getSlugsFromHTML(section.body, "artwork")
      }
      case "image_set":
      case "image_collection": {
        return section.images.map(image => {
          if (image.type === "artwork") {
            return image.slug
          } else {
            return getSlugsFromHTML(image.caption, "artwork")
          }
        })
      }
    }
  })
  return compact(flatten(slugs))
}

export const getContentStartEnd = article => {
  const { sections } = article || []
  const types =
    sections &&
    sections.map((section, i) => {
      return { type: section.type, index: i }
    })
  const start = findIndex(types, { type: "text" })
  const end = findLastIndex(types, { type: "text" })

  return { start, end }
}

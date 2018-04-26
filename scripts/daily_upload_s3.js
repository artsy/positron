//
// A script that collects article data from our mongo database, creates a CSV document,
// and sends that data to S3 for consumption by Fulcrum.
//

import knox from 'knox'
import mongojs from 'mongojs'
import fs from 'fs'
import moment from 'moment'
import { map, pick } from 'lodash'
import RavenServer from 'raven'
const { SENTRY_PRIVATE_DSN } = process.env

RavenServer.config(SENTRY_PRIVATE_DSN).install()
RavenServer.context(() => {
  // Connect to database
  const db = mongojs(process.env.MONGOHQ_URL, ['articles'])

  // Setup file naming
  const filename = `export_${moment().format('YYYYMMDDhhmmss')}.csv`
  const dir = 'scripts/tmp/'

  const attrs = [
    'id',
    'author_id',
    'auction_ids',
    'contributing_authors',
    'fair_ids',
    'featured',
    'featured_artist_ids',
    'featured_artwork_ids',
    'partner_ids',
    'primary_featured_artist_ids',
    'slugs',
    'tags',
    'title',
    'tier',
    'published_at',
    'show_ids',
    'thumbnail_image',
    'thumbnail_title',
    'keywords',
    'slug',
    'channel_id',
    'partner_channel_id',
    'vertical',
    'tracking_tags',
    'exclude_google_news',
    'indexable',
    'is_super_article',
    'description',
    'sections',
    'hero_section',
    'social_title',
    'social_image',
    'social_description',
    'search_title',
    'search_description',
    'email_title',
    'postscript',
    'layout'
  ]

  db.articles.find({ published: true }).toArray((err, articles) => {
    if (err) {
      console.log(err)
      return
    }

    const stringify = arr => {
      if (arr) {
        const str = arr
          .toString()
          .replace(/"/gi, "'")
          .replace(/\n/gi, '')
        return `"${str}"`
      }
    }

    const csv = [attrs.join(',')]

    articles.map(a => {
      let published_at = ''
      if (a.published_at) {
        published_at =
          moment(a.published_at).format('YYYY-MM-DDThh:mm') + '-05:00'
      }
      const contributing_authors = stringify(map(a.contributing_authors, 'name'))
      const sections = a.sections.map(section => pick(section, 'type'))
      let hero
      if (a.hero_section) {
        hero = stringify(JSON.stringify(pick(a.hero_section, 'type')))
      }
      const headline = a.email_metadata && a.email_metadata.headline
      const row = [
        a._id,
        a.author_id,
        stringify(a.auction_ids),
        contributing_authors,
        stringify(a.fair_ids),
        a.featured,
        stringify(a.featured_artist_ids),
        stringify(a.featured_artwork_ids),
        stringify(a.partner_ids),
        stringify(a.primary_featured_artist_ids),
        stringify(a.slugs),
        stringify(a.tags),
        stringify(a.title),
        a.tier,
        published_at,
        stringify(a.show_ids),
        stringify(a.thumbnail_image),
        stringify(a.thumbnail_title),
        stringify(a.keywords),
        stringify(a.slug),
        a.channel_id,
        a.partner_channel_id,
        (a.vertical && a.vertical.name) || null,
        stringify(a.tracking_tags),
        a.exclude_google_news,
        a.indexable,
        a.is_super_article,
        stringify(a.description),
        stringify(JSON.stringify(sections)),
        hero,
        stringify(a.social_title),
        stringify(a.social_image),
        stringify(a.social_description),
        stringify(a.search_title),
        stringify(a.search_description),
        (headline && stringify(headline)) || null,
        stringify(a.postscript),
        a.layout
      ].join(',')
      csv.push(row)
    })

    const finalCSV = csv.join('\n')

    fs.writeFile(dir + filename, finalCSV, (err, res) => {
      if (err) {
        console.log(err)
        return
      }
      // Setup S3 Client
      const client = knox.createClient({
        key: process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.FULCRUM_BUCKET
      })

      client.putFile(dir + filename, `reports/positron_articles/${filename}`, {
        'Content-Type': 'text/csv'
      }, (err, result) => {
        if (err) {
          console.log(err)
          return
        }

        console.log('Completed uploading articles to S3.')
        // Delete file and close db
        fs.unlink(dir + filename)
        db.close()
      })
    })
  })
})

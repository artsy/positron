This is a comprehensive example article from Positron's `articles` collection,
chosen because it demonstrates all key relationship types (artists, artworks, channels, tags).

Presented here in Mongo's JSON-like response format:

```js
{
  _id: ObjectId('58ab078cbdb8fb001136c63c'),

  // === AUTHOR FIELDS ===
  author_id: ObjectId('523783258b3b815f7100055a'),
  author: {
    id: ObjectId('523783258b3b815f7100055a'),
    name: 'Artsy Editorial'
  },
  author_ids: [],  // References to authors collection (often empty, use contributing_authors for display)
  contributing_authors: [
    { id: ObjectId('523783258b3b815f7100055a'), name: 'Casey Lesser' }
  ],

  // === ARTIST RELATIONSHIPS ===
  // These reference Gravity's artist database (ObjectIds)
  primary_featured_artist_ids: [
    ObjectId('526abdd57622dd2839000162'),
    ObjectId('587e94b0a09a671d0f000081'),
    ObjectId('575ee7d1275b242b0f0027f5'),
    ObjectId('51a917a3275b2481f60000c1'),
    ObjectId('50a801f42f514467620006d2'),
    // ... (18 total artists)
  ],
  featured_artist_ids: null,        // DEPRECATED - not used since 2024
  biography_for_artist_id: null,    // Single artist for biography articles (rare)

  // === ARTWORK RELATIONSHIPS ===
  // These reference Gravity's artwork database (ObjectIds)
  featured_artwork_ids: [
    ObjectId('57ced08bcd530e660200033c'),
    ObjectId('58828bc6cd530e646400080e'),
    ObjectId('58110ea68b3b8130ec000c20'),
    ObjectId('5656499ca6ca6d6401000152'),
    // ... (24 total featured artworks)
  ],

  // === CHANNEL RELATIONSHIPS ===
  channel_id: ObjectId('5759e3efb5989e6f98f77993'),  // Artsy Editorial
  partner_channel_id: null,
  partner_ids: [ ObjectId('533c24d3ebad647b68000105') ],

  // === TAGS ===
  tags: [ 'Artists', 'Contemporary Art' ],
  // tracking_tags: [ ... ],  // Internal tracking codes (not present on this article)
  keywords: [
    'Artists',
    'Contemporary Art',
    'Aaron Angell',
    'Aneta Regel',
    'Coille Hooven',
    'Elisabeth Kley',
    'Gareth Mason',
    'Jami Porter Lara',
    'Julia Haft Candell',
    'Matt Wedel'
  ],

  // === ARTICLE METADATA ===
  title: 'These 20 Artists Are Shaping the Future of Ceramics',
  thumbnail_title: 'These 20 Artists Are Shaping the Future of Ceramics',
  description: 'Countless artists today are shifting the perception of ceramics, ensuring that whether taking the shape of a functional vessel or an explosive sculpture, the art form receives its due respect and recognition.',
  layout: 'feature',
  tier: 1,
  published: true,
  featured: true,
  exclude_google_news: false,

  // === URLS & SLUGS ===
  slugs: [
    'artsy-editorial-02-20-17',
    'artsy-editorial-20-artists-shaping-future-ceramics'
  ],
  // Canonical slug is always the LAST entry in the array

  // === HERO SECTION ===
  hero_section: {
    type: 'text',
    deck: '',
    url: 'https://artsy-media-uploads.s3.amazonaws.com/balaNLQ_OV-0D1i59pqCIw%2FJS-.jpg'
  },

  // === CONTENT SECTIONS ===
  // Array of content blocks - this example shows key section types
  sections: [
    // --- Text section ---
    {
      type: 'text',
      body: '<p>Artists and artisans working with ceramics have steadily contributed to the art world for centuries...</p>'
    },

    // --- Text section with artist heading ---
    {
      type: 'text',
      body: '<h2><span><a href="https://www.artsy.net/artist/bruce-m-sherman/" class="is-follow-link">Bruce M. Sherman</a></span></h2><h3>B. 1942, New York • Lives and works in New York</h3>'
    },

    // --- Image collection with EMBEDDED ARTWORKS ---
    // Note: embedded artwork IDs are STRINGS (not ObjectIds)
    // This denormalized data is a snapshot at embedding time
    {
      type: 'image_collection',
      layout: 'overflow_fillwidth',
      images: [
        {
          type: 'artwork',                    // Indicates this is an artwork, not a plain image
          id: '5f8f171cf7fa5600139334bd',     // String ID (NOT ObjectId)
          slug: 'bruce-m-sherman-lady-of-the-flora',
          date: '2016',
          title: 'Lady of the Flora',
          image: 'https://d32dm0rphc51dk.cloudfront.net/AjNkO_OkjWXKMOfOyrLjVg/larger.jpg',
          partner: { name: 'Fort Makers', slug: 'fort-makers-gallery' },
          artists: [ { name: 'Bruce M. Sherman', slug: 'bruce-m-sherman' } ],
          artist: { name: 'Bruce M. Sherman', slug: 'bruce-m-sherman' },
          width: 5678,
          height: 5678,
          credit: ''
        },
        {
          type: 'artwork',
          id: '5f8f171c7b9317000edb07a6',
          slug: 'bruce-m-sherman-lord-of-the-flora',
          date: '2016',
          title: 'Lord of the Flora',
          image: 'https://d32dm0rphc51dk.cloudfront.net/68qJmOzfQbbsCw0ac3vf0Q/larger.jpg',
          partner: { name: 'Fort Makers', slug: 'fort-makers-gallery' },
          artists: [ { name: 'Bruce M. Sherman', slug: 'bruce-m-sherman' } ],
          artist: { name: 'Bruce M. Sherman', slug: 'bruce-m-sherman' },
          width: 5270,
          height: 5270,
          credit: ''
        }
      ]
    },

    // --- Image collection with PLAIN IMAGES (not artworks) ---
    {
      type: 'image_collection',
      layout: 'overflow_fillwidth',
      images: [
        {
          type: 'image',                      // Plain image, not an artwork
          url: 'https://artsy-media-uploads.s3.amazonaws.com/example.jpg',
          caption: '<p>Photo credit: Example Photographer</p>',
          width: 1200,
          height: 800
        }
      ]
    },

    // ... (additional sections truncated for brevity)
  ],

  // === RELATED CONTENT IDS ===
  fair_ids: [],
  fair_programming_ids: [],
  fair_artsy_ids: [],
  fair_about_ids: [],
  auction_ids: [],
  section_ids: [],
  show_ids: null,

  // === EMAIL & SOCIAL METADATA ===
  email_metadata: {
    headline: 'These 20 Artists Are Shaping the Future of Ceramics',
    author: 'Casey Lesser',
    image_url: 'https://artsy-media-uploads.s3.amazonaws.com/XaUf1g2xrUgIcU1Aezf4IA%2Fceramics.jpg',
    custom_text: ''
  },
  social_title: '20 Artists Shaping the Future of Ceramics',
  social_description: ' Works by 20 living artists that show how the perception of ceramics is shifting more each day. ',
  search_title: 'These 20 Contemporary Artists Are Shaping the Future of Ceramics',
  search_description: '',
  seo_keyword: '',

  // === SUPER ARTICLE (legacy feature) ===
  is_super_article: false,
  super_article: {
    partner_link: '',
    partner_logo: '',
    partner_link_title: '',
    partner_logo_link: '',
    partner_fullscreen_header_logo: '',
    secondary_partner_logo: '',
    secondary_logo_text: '',
    secondary_logo_link: '',
    footer_blurb: '',
    related_articles: []
  },

  // === FLAGS ===
  send_body: false,
  daily_email: false,
  weekly_email: false,

  // === TIMESTAMPS ===
  updated_at: ISODate('2024-12-20T21:33:42.808Z'),
  published_at: ISODate('2024-12-20T21:33:42.808Z'),

  // === DUPLICATE ID FIELD ===
  id: '58ab078cbdb8fb001136c63c'  // String version of _id (legacy)
}
```

## Key Fields

### Author Attribution

- **author**: Organizational account (typically "Artsy Editorial")
- **author_ids**: Array of Positron author record IDs (for joining with `authors` collection)
- **contributing_authors**: Display byline - array of writers credited on the article

### Relationship Fields

- **primary_featured_artist_ids**: Array of ObjectIds referencing Gravity artists (active field)
- **featured_artist_ids**: DEPRECATED since 2024
- **biography_for_artist_id**: Single ObjectId for biography articles (rare)
- **featured_artwork_ids**: Array of ObjectIds referencing Gravity artworks
- **channel_id**: ObjectId referencing `channels` collection
- **partner_channel_id**: Alternative channel reference for partner content (query both fields with `$or`)

### Content

- **sections**: Array of content blocks with various types:
  - `text` - Rich text content (HTML)
  - `image_collection` - Collections of images or artworks
  - `image_set` - Sets of images
  - `slideshow` - Image slideshows
  - `video` - Video content
  - `embed` - Generic embeds
  - `social_embed` - Social media embeds
  - `callout` - Highlighted text boxes

### Embedded Artworks vs Plain Images

Within `image_collection` sections, images can be:

1. **Plain images** (`type: 'image'`):

   - Have `url`, `caption`, `width`, `height`

2. **Embedded artworks** (`type: 'artwork'`):
   - Have `id` (STRING, not ObjectId), `slug`, `title`, `date`
   - Include denormalized `artists`, `partner` data
   - Data is a snapshot at embedding time (may be stale)
   - See `article-artworks.md` for featured vs mentioned distinction

### Categorization

- **layout**: `feature`, `news`, `series`, `standard`, `video` (plus deprecated: `basic`, `center`, `classic`)
- **vertical**: Embedded object with `id` and `name` (Art Market, Art, News, Visual Culture, Creativity, Podcast)
- **tags**: Freeform string array for public categorization (autosuggested, but not validated against tags collection)
- **tracking_tags**: Internal tracking codes (often author initials)
- **keywords**: SEO keywords array

### Status & Visibility

- **published**: Boolean - whether article is live
- **featured**: Boolean - eligible for homepage featuring
- **exclude_google_news**: Boolean - excluded from Google News feed

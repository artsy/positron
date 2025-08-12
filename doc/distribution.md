# Content Distribution

When an editor publishes content in Writer, it gets distributed across the web. In this doc, we break down the distribution of this content.

### Table of contents

- [Artsy.net](#artsy.net)
- [Google AMP](#google-amp)
- [Google News (sitemaps)](#google-news)
- [RSS](#rss)
- [Analytics](#analytics)

## [Artsy.net](https://www.artsy.net/articles)

We publish all editorial content at Artsy.net/articles, and articles appear in different contexts throughout Artsy.net. Articles by distinct teams at Artsy are distinguished by their association with a Channel.

Because we have multiple channels, each piece of content on the site gets treated differently depending on which channel it belongs to. For example, we have [promoted content](https://www.artsy.net/article/artsy-school-s-out-for-the-summer-paul-winstanley-s-spare-portraits-of-empty-art-schools) written by Artsy staff, [partner-written articles](https://www.artsy.net/waterhouse-and-dodd/article/waterhouse-dodd-interview-juliette-losq), and [Life at Artsy](https://www.artsy.net/article/daniel-doubrovkine-what-do-software-engineers-do) posts which you can see all have different visual treatments.

In [Force](https://github.com/artsy/force), we've separated the main article body rendering to a [component](https://github.com/artsy/force/tree/3ab04ecb16ac07137f8793d2344b2a74e41d323a/src/desktop/components/article). This helps us embed articles anywhere on the site, like on a [fair article](https://www.artsy.net/the-armory-show-2017/info/about-the-fair) or artist bio.

> ##### Aside on Channels
>
> We typically think of Channels as groups of people. A [Channel](https://github.com/artsy/positron/blob/main/api/apps/channels/model.coffee) contains some metadata and an array of Users. Users can be in multiple Channels. Depending on which Channel you're writing articles in, you'll see different layout options and administrative settings. A long time ago, we only had Users and our entire Artsy Editorial staff had to use a single login.

Bored? Here are some great Artsy Editorial (Channel) articles:

- [Are Video Games Art?](https://www.artsy.net/article/artsy-editorial-are-video-games-art)
- [What Happens If You Break an Artwork?](https://www.artsy.net/article/artsy-editorial-break-artwork)
- [GIPHY Is Helping Get Artists’ Works Viewed 100 Million Times](https://www.artsy.net/article/artsy-editorial-giphy-artists-works-viewed-100-million-times)
- [What Makes "Bad" Art Good?](https://www.artsy.net/article/artsy-editorial-bad-art-good)

Articles are responsive, so they look good on all devices

![responsive-article](http://files.artsy.net/images/screen-shot-2017-05-25-at-13624-pm.png)
Image from [ami.responsivedesign.is](http://ami.responsivedesign.is/)

## Google AMP

We've been tackling [speed issues](http://artsy.github.io/blog/2016/11/02/improving-page-speed-with-graphql/) for a while on Publishing, and once we heard about [Google AMP](https://www.ampproject.org/) and its straightforward implementation, we were on board.

By adhering to the AMP Project rules and using `<html ⚡>` on the page, we get \<1 second load times from Google Search. These pages can be found by adding `/amp` to the end of an article.

Bored? Here are the same Artsy Editorial articles in AMP:

- [Are Video Games Art?](https://www.artsy.net/article/artsy-editorial-are-video-games-art/amp)
- [What Happens If You Break an Artwork?](https://www.artsy.net/article/artsy-editorial-break-artwork/amp)
- [GIPHY Is Helping Get Artists’ Works Viewed 100 Million Times](https://www.artsy.net/article/artsy-editorial-giphy-artists-works-viewed-100-million-times/amp)
- [What Makes "Bad" Art Good?](https://www.artsy.net/article/artsy-editorial-bad-art-good/amp)

There are many reasons [why](https://medium.com/@cramforce/why-amp-is-fast-7d2ff1f48597) AMP is fast, but the 50KB CSS limit seems to be the hardest to deal with. We created an [AMP-specific stylesheet](https://github.com/artsy/force/blob/main/desktop/apps/article/stylesheets/amp.styl) that is picky about which stylesheets to require. In the cases where we only need one or two CSS rules from a file, we rewrite it instead of requiring the entire file.

## Google News

### Articles sitemap

We use sitemaps to manage distribution of Artsy's editorial content to Google Search.

The [articles sitemap](https://www.artsy.net/sitemap-articles-2018.xml) is generated daily. It is housed by S3, served by Force, and configured via Ember, with the help of a few external services.

Changes to the sitemap itself are made in Ember via the [ArticleSitemapJob](https://github.com/artsy/ember/blob/main/src/ember/jobs/sitemaps/article_sitemap_job.py).

If additional fields are added to the article sitemap, we must also fetch the new field from Positron via [Degas's Positron extracts](https://github.com/artsy/degas/blob/main/config/sources/positron.yaml).

### News sitemap

In addition to Google Search, [a different version of sitemap](https://www.artsy.net/sitemap-news.xml) is generated to distribute editorial content to Google News, which is a distinct service from Search. News sitemaps must satisfy certain requirements, most notably:

- Include URLs for articles published in the last 2 days
- Update your News sitemap with fresh articles as they're published.

Because of these requirements, unlike the rest of the sitemaps, we generate our [news sitemap dynamically in Force](https://github.com/artsy/force/blob/0ea515a8af942b6513a02d0d952f176340f9539e/src/desktop/apps/sitemaps/routes.coffee#L16-L29). The guideline for creating a news sitemap can be found at [Google's Publisher Center Help](https://support.google.com/news/publisher-center/answer/74288?hl=en).

Once crawled, news articles should appear on search results as Top stories (results may vary depending on the query.) They should also appear on [https://news.google.com](https://news.google.com) as well.

![google-news](https://raw.githubusercontent.com/artsy/positron/main/doc/images/google-news.png)

Articles can be excluded from this process on a case-by-case basis when the `exclude_google_news` field is marked `true`.

## RSS

All of our latest content published in the last two days can be found in our [News RSS feed](https://www.artsy.net/rss/news). This is generated by Force in a handy little Express [sub-app](https://github.com/artsy/force/tree/master/desktop/apps/rss).

The RSS feed is consumed by [Apple News](https://help.apple.com/newspublisher/icloud/#/apdc2c7520ff), and additionally by [Flipboard](https://about.flipboard.com/rss-spec/), used internally by Artsy's editorial team.

## Analytics

Now that we've dispersed all of our content, how do we know it's working?

- **[Parsel.y](http://parse.ly)**: good for real-time stats on article performance
- **[Google Analytics](https://analytics.google.com)**: for more granular work and reports
- **[Looker](https://artsy.looker.com)**: combines multiple data sources, great for drilling, making inferences
- **[Segment.io](https://segment.io)**: this is not a dashboard, but an event bus that passes analytics events from Force, GA, and others to Redshift, our data warehouse. Looker then pulls data from Redshift.

Our Editorial Team uses [Airtable](https://airtable.com) to organize and plan stories. We run a [data transfer script](https://github.com/artsy/positron/blob/main/scripts/ga_airtable_transfer.js) every hour on the half hour. The script simply takes article analytics from GA and saves them into a table in Airtable.

#### FAQ

**Why don't I see Google AMP calls in the `force-production` Segment.io source?**

Segment.io only accepts data from Google AMP if the Source is a Server type. Our `force-production` source is a Javascript Website type, so we've had to create a separate source for [Google AMP](https://segment.com/artsy-engineering/sources/googleamp/overview).

**Where can I see Google AMP analytics in Parse.ly?**

Go to a [post](https://dash.parsely.com/artsy.net/posts/zeZzxls1qwb-how-bernini-captured-the-power-of-human-sexuality-in-stone/), look for the Pages section, expand it, and look for urls that contain the term `amp`.

**Why does Parse.ly report such low time on page numbers for Google AMP?**

The official response from Parsely: "AMP only recently started supporting engaged time tracking, so that’s more or less a placeholder for us while we build it out."

**What kind of data do we capture for FBIA?**

We track pageviews and bounce rate. The bounce rate tracks 15 seconds and 30 seconds.

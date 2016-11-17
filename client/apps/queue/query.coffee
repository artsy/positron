module.exports = (published, channel_id) ->
  """
  {
    latest: articles(published: #{published}, sort:"-published_at", channel_id: "#{channel_id}"){
      thumbnail_image
      thumbnail_title
      slug
      published_at
    }
    queued: articles(published: #{published}, channel_id: "#{channel_id}", daily_email: true){
      thumbnail_image
      thumbnail_title
      slug
      published_at
    }
  }
  """

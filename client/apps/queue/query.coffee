module.exports = (published, channel_id) ->
  """
  {
    articles(published: #{published}, sort:"-published_at", channel_id: "#{channel_id}"){
      thumbnail_image
      thumbnail_title
      slug
      published_at
    }
  }
  """
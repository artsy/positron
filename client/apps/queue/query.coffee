module.exports = (argString) ->
  """
  {
    articles(#{argString}){
      thumbnail_image
      thumbnail_title
      email_metadata {
        headline
        image_url
      }
      slug
      published_at
      scheduled_publish_at
      id
      channel_id
      partner_channel_id
    }
  }
  """

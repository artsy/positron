module.exports = (offset = 0) ->
  """
  {
    authors(count: true, limit: 10, offset: #{offset}){
      name
      bio
      twitter_handle
      id
      image_url
    }
  }
  """
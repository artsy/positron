module.exports = (argString) ->
  """
  {
    articles(#{argString}){
      thumbnail_image
      thumbnail_title
      slug
      published_at
      id
    }
  }
  """

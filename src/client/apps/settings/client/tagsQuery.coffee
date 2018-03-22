module.exports = (argString) ->
  """
  {
    tags(#{argString}){
      name
      id
    }
  }
  """

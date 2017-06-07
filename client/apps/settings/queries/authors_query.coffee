module.exports = (argString = '') ->
  """
  {
    authors(#{argString}){
      name
    }
  }
  """

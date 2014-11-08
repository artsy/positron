module.exports = (el) ->
  show = @$(el).text().match(/\w/) is null
  @$(el)[(if show then 'add' else 'remove') + 'Class'](
    'is-empty'
  )
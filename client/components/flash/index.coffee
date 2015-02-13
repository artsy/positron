module.exports = ({ message, timeout }) ->
  $('body').append $el = $ """
    <div class='flash-container'>
      <div class='flash-body'>#{message}</div>
    </div>
  """
  close = ->
    $el.removeClass('is-active')
    setTimeout 300, -> $el.remove()
  setTimeout -> $el.addClass 'is-active'
  $el.click close
  setTimeout close, timeout or 2000

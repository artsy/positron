###
  Copied from https://github.com/wunderlink/simple-modal
###

require './style.css'

module.exports = (opts={}) ->
  modal = new ModalStyle(opts)
  return modal

template = require './modal.jade'


class ModalStyle
  constructor: (o) ->
    @m = {}
    @last = null
    @opts =
      title: ''
      content: 'What would you like to do?'
      buttons: [
        text: 'Cancel'
        closeOnClick: true
      ,
        text: 'Confirm'
        className: 'btn-primary'
        closeOnClick: true
      ]
      clickOutsideToClose: true
      hideOtherModals: true
      removeOnClose: true
      onClose: ->
      attachToBody: true
      width: '0px'
      minWidth: '560px'
      maxHeight: 0
      minHeight: '0px'

    buttonDefaults =
      closeOnClick: true

    for opt, val of o
      @opts[opt] = val
      if opt == 'buttons'
        for button in val
          for prop, v of buttonDefaults
            if !button[prop]?
              button[prop] = v

    @build()


  build: ->
    self = this

    @m = document.createElement 'div'
    @m.className = 'simple-modal-holder'
    @m.innerHTML = template(@opts)

    @updateContent @opts.content

    body = @m.querySelector '.simple-modal-body'
    content = @m.querySelector '.simple-modal-content'
    if @opts.width
      body.style.width = @opts.width
    if @opts.minWidth
      body.style.minWidth = @opts.minWidth

    if @opts.maxHeight > 0
      content.style.maxHeight = @opts.maxHeight+"px"
    else
      maxHeight = Math.floor(window.innerHeight * .7)
      content.style.maxHeight = maxHeight+"px"
    if @opts.minHeight
      content.style.minHeight = @opts.minHeight


    controls = @m.querySelectorAll '.simple-modal-controls>button'
    for b, i in controls
      if @opts.buttons[i]?
        item = @opts.buttons[i]
        b.setAttribute 'data-index', i
        if item.callback?
          b.onclick = (e) ->
            index = e.target.getAttribute 'data-index'
            bdata = self.opts.buttons[index]
            bdata.callback(e)
            if bdata.closeOnClick
              self.close()
        else
          b.onclick = (e) ->
            index = e.target.getAttribute 'data-index'
            bdata = self.opts.buttons[index]
            if bdata.closeOnClick
              self.close()

    if @opts.clickOutsideToClose
      bg = @m.querySelector '.simple-modal-overlay'
      bg.onclick = ->
        self.close()

    if @opts.attachToBody
      document.body.appendChild @m

    @show()

  updateContent: (new_content, replace_existing = true) ->
    c = @m.querySelector '.simple-modal-content'
    if replace_existing
      c.innerHTML = ''
    if typeof new_content == 'string'
      c.innerHTML = c.innerHTML + new_content
    else
      c.appendChild new_content

  updateHeader: (new_header, replace_existing = true) ->
    c = @m.querySelector '.simple-modal-title'
    if replace_existing
      c.innerHTML = ''
    if typeof new_header == 'string'
      c.innerHTML = c.innerHTML + new_header
    else
      c.appendChild new_header

  deconstruct: ->
    if @m
      @m.parentNode.removeChild @m
      @m = null

  close: ->
    if @opts.hideOtherModals and @last
      @last.style.display = 'block'
    if @m
      @opts.onClose()
      if @opts.removeOnClose
        @deconstruct()
      else
        @m.style.display = 'none'

  show: ->
    if @opts.hideOtherModals
      others = document.body.querySelectorAll '.simple-modal-holder'
      for other in others
        if other.style.display is 'block'
          @last = other
        other.style.display = 'none'
    if @m
      @m.style.display = 'block'

  hide: ->
    if @opts.hideOtherModals and @last
      @last.style.display = 'block'
    if @m
      @m.style.display = 'none'

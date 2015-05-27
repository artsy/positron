Vertical = require '../../models/vertical.coffee'
ImageUploadForm = require '../../components/image_upload_form/index.coffee'
sd = require('sharify').data

@init = ->
  vertical = new Vertical sd.VERTICAL
  $('.verticals-image-placeholder').each (i, el) ->
    new ImageUploadForm
      el: $(el)
      src: vertical.get($(el).attr 'data-attr')
      name: $(el).attr('data-attr')
  $('.verticals-delete').click (e) ->
    e.preventDefault()
    return unless confirm "Are you sure you want to delete this vertical?"
    vertical.destroy success: -> location.assign '/verticals'
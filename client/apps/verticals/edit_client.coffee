ImageUploadForm = require '../../components/image_upload_form/index.coffee'
sd = require('sharify').data

@init = ->
  $('.verticals-image-placeholder').each (i, el) ->
    new ImageUploadForm
      el: $(el)
      src: sd.VERTICAL[$(el).attr('data-attr')]
      name: $(el).attr('data-attr')
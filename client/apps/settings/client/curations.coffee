AdminEditView = require '../../../components/admin_form/index.coffee'
Curation = require '../../../models/curation.coffee'
sd = require('sharify').data
_s = require 'underscore.string'
ImageUploadForm = require '../../../components/image_upload_form/index.coffee'

@init = ->
  new AdminEditView
    model: new Curation(sd.CURATION)
    el: $('body')
    onDeleteUrl: '/settings/curations'

# attachUploadForms: =>
#   $('.image-form').each (i, el) =>
#     new ImageUploadForm
#       el: $(el)
#       src: propByString.get $(el).attr('data-name') #, @model.attributes
#       name: $(el).attr('data-name')

# events:
#   'click .admin-form-delete': 'destroy'
#   'change :input': 'unsaved'
#   'submit form': 'ignoreUnsaved'
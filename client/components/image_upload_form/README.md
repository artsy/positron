# Image Upload Form

A styled image upload form that shows a progress bar and preview. Used to upload thumbnails to articles and various image forms in the vertical admin UI.

![](https://s3.amazonaws.com/f.cl.ly/items/133F1h1b1I3i3Z3W0y0K/Image%202015-05-26%20at%205.34.55%20PM.png)

## Example

````coffeescript
ImageUploadForm = require '../components/image_upload_form/index.coffee'

new ImageUploadForm
  el: $('.image-form')
  remove: =>
    @section.save thumbnail_image: null
  done: (src) =>
    @section.save thumbnail_image: src
````

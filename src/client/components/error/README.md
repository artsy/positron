# Error

Unexpected error handler UI for the client and server side. On the client shows a modal, on the server renders that modal in a page.

![](http://cl.ly/image/0r0G432W031A)

## Example Client-side

Use the generic helper

````coffeescript
{ openErrorModal } = require '../components/error/client.coffee'
article.save error: openErrorModal
````

Or work with the view directly

````coffeescript
{ ErrorModal } = require '../components/error/client.coffee'
article.save error: (err) ->
  new ErrorModal error: err
````

## Example Server-side

Attach the error handler at the end of your app.

````coffeescript
app.locals.sd.SEGMENT_WRITE_KEY = '' # Add this to sharify data
require('../../components/error/server') app
````
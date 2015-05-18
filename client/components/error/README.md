# Error Modal

Unexpected error handler UI for the client and server side. On the client shows a modal, on the server renders that modal in a page. The report functionality requires Intercom to be integrated (all it does is click the intercom button on the page).

![](http://cl.ly/image/0r0G432W031A)

## Example

Use the generic helper

````coffeescript
{ openErrorModal } = require '../components/error/client.coffee'
article.save error: openErrorModal
````

Or work with the view directly

````coffeescript
{ ErrorModal } = require '../components/error/client.coffee'
article.save error: (err) ->
  new ErrorModal
    error: err
    title: "Aw snap!"
    body: "I guess you could try again later ¯\_(ツ)_/¯"
    flashMessage: "Thanks for your feedback!"
````

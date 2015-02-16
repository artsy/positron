# Error Modal

Generic error modal with a submit report functionality. Should be used sparingly mainly for catching critical unexpected errors.

## Example

Use the generic helper

````coffeescript
{ openErrorModal } = require '../components/error_modal'
article.save error: openErrorModal
````

Or work with the view directly

````coffeescript
{ ErrorModal } = require '../components/error_modal'
article.save error: (err) ->
  new ErrorModal
    error: err
    title: "Aw snap!"
    body: "I guess you could try again later ¯\_(ツ)_/¯"
    flashMessage: "Thanks for your feedback!"
````

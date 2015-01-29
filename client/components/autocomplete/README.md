# Autocomplete

A tiny wrapper around [twitter typeahead](https://twitter.github.io/typeahead.js/). It adds some default styling such as:

![](https://s3.amazonaws.com/f.cl.ly/items/313Q07471L081B0l200T/Image%202015-01-29%20at%202.56.14%20PM.png)

## Example

````coffeescript
Autocomplete = require '../../components/autocomplete/index.coffee'

new Autocomplete
  el: @$('#edit-admin-fair input')
  url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
  filter: (res) -> for fair in res
    { id: fair._id, value: fair.name }
  selected: (e, item) =>
    @article.save fair_id: item.id
````

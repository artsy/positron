# Autocomplete Select

Kinda like a cross between a `<select>` box and the autocomplete component. It has a selected state that indicates the chosen value.

![](https://s3.amazonaws.com/f.cl.ly/items/222m2M2e2h1e250q3I0E/Image%202015-01-29%20at%204.06.08%20PM.png)

## Example

Basic usage

````coffeescript
select = AutocompleteSelect @$('#input-container')[0],
  url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
  filter: (res) -> for r in res
    { id: r._id, value: r.name }
  selected: (e, item) ->
    article.save fair_id: item.id
  cleared: ->
    article.save fair_id: null
select.setState loading: false, value: article.get('fair_id')
````

If you're using a label and server-side serialization

````coffeescript
select = AutocompleteSelect @$('#input-container')[0],
  label: 'Fair Id'
  name: 'fair_id'
  url: "#{sd.ARTSY_URL}/api/v1/match/fairs?term=%QUERY"
  filter: (res) -> for r in res
    { id: r._id, value: r.name }
select.setState loading: false, value: article.get('fair_id')
````

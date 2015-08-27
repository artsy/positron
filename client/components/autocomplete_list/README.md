# Autocomplete List

An autocomplete box that when selected adds to a list. Useful for "arrays" of data e.g. curating a list of contributing authors or a list of "featured artists".

## Example

````coffeescript
list = AutocompleteList @$('#input-container')[0],
  label: 'Authors'
  name: 'author_ids'
  url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
  selected: (e, item, items) ->
    article.save contributing_authors: _.pluck items, 'id'
  removed: (e, item, items) ->
    article.save contributing_authors: _.pluck items, 'id'
  filter: (users) -> for user in users
    { id: user.id, value: _.compact([user.name, user.email]).join(', ') }

fetchAuthors success: (authors) ->
  items = authors.map (author) ->
    { id: author.get('id'), value: author.get('name') }
  list.setState loading: false, items: items
````

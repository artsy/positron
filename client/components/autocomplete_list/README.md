# Autocomplete List

An autocomplete box that when selected adds to a list. Useful for "arrays" of data e.g. curating a list of authors in an organization or a list of "featured artists".

## Example

````coffeescript
select = AutocompleteList @$('#input-container')[0],
  label: 'Authors'
  name: 'author_ids'
  url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
  filter: (users) -> for user in users
    { id: user.id, value: _.compact([user.name, user.email]).join(', ') }

organization.fetchAuthors success: (authors) ->
  items = authors.map (author) ->
    { id: author.get('id'), value: author.get('name') }
  select.setState loading: false, items: items
````

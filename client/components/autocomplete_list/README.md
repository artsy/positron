# Autocomplete List

An autocomplete input that adds selected items to a list. Useful for "arrays" of data e.g. curating a list of contributing authors or a list of "featured artists".

Add the optional prop ```draggable: true``` to enable drag and drop sorting.

## Example

````coffeescript
  AutocompleteList {
    name: 'user_ids[]'
    url: "#{sd.ARTSY_URL}/api/v1/match/users?term=%QUERY"
    placeholder: 'Search by user name...'
    draggable: true
    filter: (users) -> for user in users
      { id: user.id, value: user.name}
    selected: (e, item, items) =>
      @channel.save user_ids: _.pluck items, 'id'
    removed: (e, item, items) =>
      @channel.save user_ids: _.without(_.pluck(items, 'id'),item.id)
    idsToFetch: @user_ids
    fetchUrl: (id) ->
      "#{sd.ARTSY_URL}/api/v1/user/#{id}"
    resObject: (res) ->
      { id: res.body.id, value: res.body.name }
  }

````

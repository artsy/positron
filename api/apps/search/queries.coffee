module.exports =
  matchAll: (term) ->
    {
      bool: {
        must: {
          multi_match: {
            query: term,
            type: 'best_fields',
            fields: ['name.*', 'alternate_names.*'],
            fuzziness: 2
          }
        }
        should: {
          match_phrase: {
            name: term
          }
        }
      }
    }
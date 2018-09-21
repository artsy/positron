export const matchAll = term => {
  return {
    bool: {
      must: {
        multi_match: {
          query: term,
          type: "best_fields",
          fields: ["name.*^4", "alternate_names.*"],
          fuzziness: 2,
        },
      },
      should: {
        match_phrase: {
          name: term,
        },
      },
    },
  }
}

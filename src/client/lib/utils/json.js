export const stringifyJSONForWeb = json => {
  return JSON.stringify(json)
    .replace(/</g, "\\u003c")
    .replace(/-->/g, "--\\>")
}

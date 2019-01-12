import { stringifyJSONForWeb } from "client/lib/utils/json"

export function VerticalsQuery(ids) {
  return `
    {
      verticals(ids: ${stringifyJSONForWeb(ids)}) {
        id
        name
      }
    }
  `
}

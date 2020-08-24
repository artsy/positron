// @ts-check
import { URL } from "url"

// FIXME: cannot use typescript in yarn task commands
export const sanitizeLink = urlString => {
  let url
  if (!urlString) {
    return
  }
  try {
    url = new URL(urlString)
  } catch (_e) {
    url = new URL(`https://${urlString}`)
  }

  if (url.hostname === "artsy.net") {
    url.hostname = "www.artsy.net"
  }
  if (url.hostname.includes(".artsy.net")) {
    url.protocol = "https:"
  }

  return url.href
}

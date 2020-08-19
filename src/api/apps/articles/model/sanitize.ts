import { URL } from "url"

export const sanitizeLink = (urlString?: string) => {
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

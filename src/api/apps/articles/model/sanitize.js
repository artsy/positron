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
  if (url.href.includes("artsy.net/post/")) {
    url.href = url.href.replace("/post/", "/article/")
  }
  if (url.href.match(/\b(artsy.net\/)\w*\b\/(posts)/gm)) { // e.g: http://artsy.net/agotoronto/posts -> http://artsy.net/agotoronto/articles
    const regex = /\b(artsy.net\/\w*\b\/)\b(posts)/;
    const str = url.href;
    const subst = `$1articles`;
    const result = str.replace(regex, subst);
    url.href = result
  }
  if (url.hostname.includes("artsy.net")) {
    url.href = url.href.toLowerCase()
  }

  return url.href
}

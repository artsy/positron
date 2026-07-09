// @ts-check
import { URL } from "url"

// Protocols permitted in article links. Anything else (e.g. javascript:, data:,
// vbscript:) is rejected so it cannot be rendered as an iframe src / anchor href
// on article pages, which would allow stored XSS. See security bounty GF658.
const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"]

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
  if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
    return
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

// A video id is interpolated (unescaped) into an iframe src="..." by metaphysics
// extractEmbed on render. These characters would let a crafted id break out of
// that attribute and inject markup/handlers; real youtube/vimeo ids never
// contain them. We reject only on these, so legitimate but non-standard video
// URLs (youtu.be links with ?t=/?si=, vimeo user/showcase/private urls, trailing
// slashes) are preserved rather than destroyed. See security bounty GF658.
const UNSAFE_EMBED_ID = /["'<>`\s]/

const detectEmbedProvider = hostname => {
  if (hostname.includes("vimeo.com")) return "vimeo"
  if (hostname.includes("youtu")) return "youtube"
  return null
}

// Mirrors metaphysics extractEmbed's detectId.
const detectEmbedId = (url, provider) => {
  if (provider === "youtube") {
    return url.search === ""
      ? url.pathname.split("/").pop()
      : url.searchParams.get("v")
  }
  return url.pathname.split("/").pop()
}

export const sanitizeEmbedUrl = urlString => {
  const sanitized = sanitizeLink(urlString)
  if (!sanitized) {
    return sanitized
  }
  const url = new URL(sanitized)
  const provider = detectEmbedProvider(url.hostname)
  if (!provider) {
    return sanitized
  }
  const id = detectEmbedId(url, provider)
  if (typeof id === "string" && UNSAFE_EMBED_ID.test(id)) {
    return
  }
  return sanitized
}

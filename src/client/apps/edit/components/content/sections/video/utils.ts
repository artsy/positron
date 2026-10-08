/**
 * Helpers for YouTube/Vimeo video sections.
 *
 * `aspect_ratio` is stored as width / height (e.g. 16/9 or 9/16). Sections
 * saved before the field existed have none and render at the default.
 */

export const DEFAULT_ASPECT_RATIO = 16 / 9

export const ASPECT_RATIO_OPTIONS = [
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "9:16", value: 9 / 16 },
]

/** Portrait players are capped at this share of the viewport height. */
export const MAX_VIDEO_HEIGHT = "80vh"

const PLAYERS = {
  vimeo: "https://player.vimeo.com/video/",
  youtube: "https://www.youtube.com/embed/",
}

const QUERYSTRING =
  "?title=0&portrait=0&badge=0&byline=0&showinfo=0&rel=0&controls=2&modestbranding=1&iv_load_policy=3&color=E5E5E5"

type Provider = keyof typeof PLAYERS

const parseUrl = (url: string): URL | null => {
  try {
    return new URL(url)
  } catch (_e) {
    return null
  }
}

const detectProvider = ({ hostname }: URL): Provider | null => {
  if (hostname.includes("vimeo.com")) return "vimeo"
  if (hostname.includes("youtu")) return "youtube"
  return null
}

/**
 * Handles watch?v=, youtu.be/, /shorts/ and /embed/ urls, including share
 * links that carry extra params such as ?si=.
 */
const detectId = (url: URL, provider: Provider) => {
  const lastSegment = url.pathname
    .split("/")
    .filter(Boolean)
    .pop()

  if (provider === "youtube") {
    return url.searchParams.get("v") || lastSegment
  }
  return lastSegment
}

export const isYouTubeShort = (url: string) => {
  const parsed = parseUrl(url)
  return (
    !!parsed &&
    detectProvider(parsed) === "youtube" &&
    parsed.pathname.startsWith("/shorts/")
  )
}

/** The player iframe src, or null for urls we can't embed. */
export const getEmbedSrc = (url: string): string | null => {
  const parsed = parseUrl(url)
  const provider = parsed && detectProvider(parsed)
  const id = provider && detectId(parsed as URL, provider)

  if (!provider || !id) return null
  return `${PLAYERS[provider]}${id}${QUERYSTRING}`
}

export const isAspectRatio = (a: number, b: number) => Math.abs(a - b) < 0.01

export const formatAspectRatio = (ratio: number) => {
  const option = ASPECT_RATIO_OPTIONS.find(({ value }) =>
    isAspectRatio(value, ratio)
  )
  if (option) return option.label

  // Keep the 1 on the short side, e.g. 2.39:1 or 1:1.3
  return ratio >= 1
    ? `${Number(ratio.toFixed(2))}:1`
    : `1:${Number((1 / ratio).toFixed(2))}`
}

/**
 * Best-effort guess at a video's shape from its url. YouTube's oEmbed reports
 * 16:9 for everything, so only /shorts/ urls are recognised there; Vimeo's
 * oEmbed returns the real dimensions. Resolves to null when unknown.
 */
export const detectAspectRatio = async (
  url: string
): Promise<number | null> => {
  const parsed = parseUrl(url)
  const provider = parsed && detectProvider(parsed)

  if (provider === "youtube") {
    return isYouTubeShort(url) ? 9 / 16 : null
  }

  if (provider === "vimeo") {
    try {
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
      )
      if (!response.ok) return null

      const { width, height } = await response.json()
      return width > 0 && height > 0 ? width / height : null
    } catch (_e) {
      return null
    }
  }

  return null
}

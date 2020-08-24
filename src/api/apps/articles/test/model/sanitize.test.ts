import { sanitizeLink } from "../../model/sanitize"

describe("#sanitizeLink", () => {
  it("skips sanitizing links that do not have an href", () => {
    expect(sanitizeLink("")).toBeUndefined()
  })

  it("inserts protocol for non artsy links", () => {
    expect(sanitizeLink("insecure-website.com")).toBe(
      "https://insecure-website.com/"
    )
  })

  it("does not change existing protocol for external links", () => {
    expect(sanitizeLink("http://insecure-website.com")).toBe(
      "http://insecure-website.com/"
    )
  })

  it("inserts protocol for artsy links", () => {
    expect(sanitizeLink("folio.artsy.net")).toBe("https://folio.artsy.net/")
    expect(sanitizeLink("artsy.net")).toBe("https://www.artsy.net/")
  })

  it("replaces http with https for www.artsy.net links", () => {
    expect(sanitizeLink("http://artsy.net/artist/andy-warhol")).toBe(
      "https://www.artsy.net/artist/andy-warhol"
    )
  })

  it("replaces http with https for *.artsy.net links", () => {
    expect(sanitizeLink("http://folio.artsy.net")).toBe(
      "https://folio.artsy.net/"
    )
  })

  it("adds www to artsy links", () => {
    expect(sanitizeLink("http://artsy.net/artist/andy-warhol")).toBe(
      "https://www.artsy.net/artist/andy-warhol"
    )
  })
})

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

  it("replaces /post with /article", () => {
    expect(sanitizeLink("http://artsy.net/post/some-old-editorial")).toBe(
      "https://www.artsy.net/article/some-old-editorial"
    )
  })

  it("replaces /posts with /articles", () => {
    expect(sanitizeLink("http://artsy.net/agotoronto/posts")).toBe(
      "https://www.artsy.net/agotoronto/articles"
    )
  })

  it("does not replace non-artsy urls with the substring '/posts' with '/articles'", () => {
    expect(sanitizeLink("http://www.notartsy.net/posts")).toBe(
      "http://www.notartsy.net/posts"
    )
  })

  it("removes capital letters from artsy urls", () => {
    expect(sanitizeLink("https://artsy.net/DutchPavilion")).toBe(
      "https://www.artsy.net/dutchpavilion"
    )
  })

  it("does not remove capital letters from non-artsy urls", () => {
    expect(sanitizeLink("https://www.anotherwebsite.net/DutchPavilion")).toBe(
      "https://www.anotherwebsite.net/DutchPavilion"
    )
  })

  it("rejects javascript: urls", () => {
    expect(sanitizeLink("javascript:alert(1)")).toBeUndefined()
    expect(sanitizeLink("JavaScript:alert(document.domain)")).toBeUndefined()
  })

  it("rejects data: urls", () => {
    expect(
      sanitizeLink("data:text/html,<script>alert(1)</script>")
    ).toBeUndefined()
  })

  it("rejects vbscript: urls", () => {
    expect(sanitizeLink("vbscript:msgbox(1)")).toBeUndefined()
  })

  it("allows mailto and tel links used in article body text", () => {
    expect(sanitizeLink("mailto:hello@artsy.net")).toBe("mailto:hello@artsy.net")
    expect(sanitizeLink("tel:+15551234567")).toBe("tel:+15551234567")
  })
})

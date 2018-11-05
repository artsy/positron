import jade from "jade"
import path from "path"

describe("display template", () => {
  it("renders an ad", () => {
    const html = jade.compileFile(path.resolve(__dirname, "../index.jade"))({
      asset: () => {},
      sharify: { script: () => {} },
      css: ".div{display: block;}",
      body: '<div class="display"></div>',
      fallback: false,
      sd: {},
    })
    expect(html).toMatch('<div class="display"></div>')
    expect(html).toMatch(".div{display: block;}")
  })

  it("renders an fallback", () => {
    const html = jade.compileFile(path.resolve(__dirname, "../index.jade"))({
      css: "",
      body: "",
      fallback: true,
      sd: {},
    })
    expect(html).toMatch(
      '<iframe src="https://link.artsy.net/join/sign-up-editorial-facebook"'
    )
  })
})

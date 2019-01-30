import {
  bar,
  foo
} from "../model";

describe("Foo", () => {

  let article

  beforeEach(() => {
    article = {
      "slugs": [
        "artsy-editorial-1523284755",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-pub",
        "artsy-editorial-publish",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-i",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend",
        "artsy-editorial-1523285220",
        "artsy-editorial-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220",
        "artsy-editorial-Invalid date",
        "artsy-editorial-Invalid date",
      ]
    }
  })

  it("Bar", () => {
    foo(article)
    bar(article)

    expect(article.slugs).toHaveLength(7)
    expect(article.slugs[article.slugs.length - 1]).toBe("artsy-editorial-art-collector-andy-warhols-scene-died-fire-broke-trump-tower-apartment-weekend-1523285220")
  })
})
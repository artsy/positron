import { viewArticles } from "../articlesActions"

describe("articlesActions", () => {
  it("#updateArticle returns expected data", () => {
    global.Date = jest.fn(() => ({
      toISOString: () => "2019-03-19T20:33:06.821Z",
    })) as any
    const data = { name: "Artsy Editorial", type: "editorial", id: "234" }
    const action = viewArticles(data)

    expect(action).toEqual({
      type: "VIEW_ARTICLES",
      key: "articlesRequested",
      payload: {
        timestamp: "2019-03-19T20:33:06.821Z",
        channel: { name: "Artsy Editorial", type: "editorial", id: "234" },
      },
    })
  })
})

import { index } from "../routes"
const search = require("api/lib/search.coffee")

jest.mock("api/lib/search.coffee", () => ({
  client: { search: jest.fn() },
}))

describe("Search route", () => {
  const req = {
    query: {
      term: "apples",
    },
  }
  const res = { send: jest.fn() }
  const next = jest.fn()
  const {
    client: { search },
  } = search

  beforeEach(() => {
    search.mockReset()
    res.send.mockReset()
  })

  it("makes a search request", () => {
    index(req, res, next)
    const { query } = search.mock.calls[0][0].body.query.bool.must.multi_match

    expect(query).toBe("apples")
  })

  it("does not send back results if there is an error", () => {
    index(req, res, next)
    search.mock.calls[0][1]("error")

    expect(res.send).not.toBeCalled()
  })

  it("returns results from search", () => {
    index(req, res, next)
    search.mock.calls[0][1](null, { hits: ["Abigail"] })

    expect(res.send.mock.calls[0][0][0]).toBe("Abigail")
  })
})

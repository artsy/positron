import { articles_list } from "../routes"
const fixtures = require("../../../../test/helpers/fixtures")
const User = require("../../../models/user")

jest.mock("../../websocket", () => ({
  getSessionsForChannel: jest.fn((channel, cb) => cb()),
}))

jest.mock("lokka", () => {
  return {
    Lokka: () => ({
      query: jest.fn().mockResolvedValue({
        articles: [{ id: "123" }],
      }),
    }),
  }
})

describe("routes", () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = {
      query: {},
      user: new User(fixtures().users),
      params: {},
    }

    res = {
      render: jest.fn(),
      locals: fixtures().locals,
    }

    next = jest.fn()
  })

  describe("articles list", () => {
    it("fetches articles", async () => {
      await articles_list(req, res, next)
      expect(res.locals.sd.ARTICLES[0].id).toBe("123")
    })

    it("sends arguments to the template", async () => {
      await articles_list(req, res, next)
      expect(res.render.mock.calls[0][0]).toBe("index")
      expect(res.render.mock.calls[0][1].articles[0].id).toBe("123")
      expect(res.render.mock.calls[0][1].current_channel.name).toBe("Editorial")
    })

    describe("queries", () => {
      it("sets sd.HAS_PUBLISHED to true by default", async () => {
        await articles_list(req, res, next)
        expect(res.locals.sd.HAS_PUBLISHED).toBe(true)
      })

      it("sets sd.HAS_PUBLISHED to false if querying published: false", async () => {
        req.query = { published: "false" }
        await articles_list(req, res, next)
        expect(res.locals.sd.HAS_PUBLISHED).toBe(false)
      })

      it("sets sd.HAS_PUBLISHED to true if querying published: true", async () => {
        req.query = { published: "true" }
        await articles_list(req, res, next)
        expect(res.locals.sd.HAS_PUBLISHED).toBe(true)
      })
    })
  })
})

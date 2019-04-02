import { articles_list } from "../routes"
const fixtures = require("../../../../test/helpers/fixtures")
const User = require("../../../models/user")

jest.mock("../../websocket", () => ({
  getSessionsForChannel: jest.fn((_channel, cb) => cb()),
}))

jest.mock("lokka", () => ({
  Lokka: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockReturnValue(
      Promise.resolve({
        articles: [{ id: "123" }],
      })
    ),
  })),
}))
const LokkaMock = require("lokka").Lokka as jest.Mock

jest.mock("lokka-transport-http", () => {
  return {
    Transport: jest.fn(),
  }
})
const TransportMock = require("lokka-transport-http").Transport as jest.Mock

describe("routes", () => {
  let req
  let res
  let next
  let queryMock

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
    queryMock = jest.fn().mockReturnValue(
      Promise.resolve({
        articles: [{ id: "123" }],
      })
    )
    LokkaMock.mockImplementation(() => ({
      query: queryMock,
    }))
  })

  describe("articles list", () => {
    it("fetches published articles", async () => {
      await articles_list(req, res, next)
      expect(res.locals.sd.ARTICLES[0].id).toBe("123")
    })

    it("fetches unpublished articles", async () => {
      req.query = { published: "true" }
      await articles_list(req, res, next)
      expect(res.locals.sd.ARTICLES[0].id).toBe("123")
    })

    it("sends arguments to the template", async () => {
      await articles_list(req, res, next)
      expect(res.render.mock.calls[0][0]).toBe("index")
      expect(res.render.mock.calls[0][1].articles[0].id).toBe("123")
      expect(res.render.mock.calls[0][1].current_channel.name).toBe("Editorial")
    })

    it("Sets up http headers correctly", async () => {
      await articles_list(req, res, next)
      expect(TransportMock.mock.calls[0][1].headers["X-Access-Token"]).toBe(
        fixtures().users.access_token
      )
    })

    it("Calls Lokka with the expected query for published articles", async () => {
      await articles_list(req, res, next)
      expect(queryMock.mock.calls[0][0]).toEqual(`
    {
      articles(published: true, channel_id: "4d8cd73191a5c50ce200002b"){
        thumbnail_image
        thumbnail_title
        slug
        published_at
        published
        scheduled_publish_at
        id
        channel_id
        partner_channel_id
        updated_at
        layout
      }
    }
  `)
    })

    it("Calls Lokka with the expected query for unpublished articles", async () => {
      req.query = { published: "false" }
      await articles_list(req, res, next)
      expect(queryMock.mock.calls[0][0]).toEqual(`
    {
      articles(published: false, channel_id: "4d8cd73191a5c50ce200002b"){
        thumbnail_image
        thumbnail_title
        slug
        published_at
        published
        scheduled_publish_at
        id
        channel_id
        partner_channel_id
        updated_at
        layout
      }
    }
  `)
    })

    it("queries unpublished if published articles returns empty", async () => {
      queryMock.mockReturnValueOnce(
        Promise.resolve({
          articles: [],
        })
      ),
        LokkaMock.mockImplementationOnce(() => ({
          query: queryMock,
        }))
      await articles_list(req, res, next)

      expect(queryMock.mock.calls[0][0]).toMatch("articles(published: true")
      expect(queryMock.mock.calls[1][0]).toMatch("articles(published: false")
    })

    it("calls next if error is thrown", async () => {
      LokkaMock.mockImplementationOnce(() => ({
        query: jest.fn().mockReturnValue(Promise.reject()),
      }))
      await articles_list(req, res, next)
      expect(next).toBeCalled()
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

  describe("renderArticles", () => {
    it("does a thing", () => {
      expect(true).toBeTruthy()
    })
  })
})

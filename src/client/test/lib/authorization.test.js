import sinon from "sinon"
import Backbone from "backbone"
import { requireChannel, requireLogin } from "client/lib/setup/authorization"

describe("authorization middleware", () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = { logout: sinon.stub() }
    res = { redirect: sinon.stub() }
    next = sinon.stub()
  })

  describe("#requireLogin", () => {
    it("redirects to login without a user", () => {
      requireLogin(req, res, next)
      expect(res.redirect.args[0][0]).toEqual("/login")
    })

    it("nexts if a user exists", () => {
      req.user = new Backbone.Model()
      requireLogin(req, res, next)
      expect(next.callCount).toEqual(1)
    })
  })

  describe("#requireChannel", () => {
    it("redirects to login without a channel", () => {
      requireChannel(req, res, next)
      expect(res.redirect.args[0][0]).toEqual("/logout")
    })

    it("nexts if the user has a channel", () => {
      req.user = new Backbone.Model({
        current_channel: new Backbone.Model(),
      })
      requireChannel(req, res, next)
      expect(next.callCount).toEqual(1)
    })
  })
})

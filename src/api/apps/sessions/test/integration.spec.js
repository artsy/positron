import { fabricate, empty } from "../../../test/helpers/db"
import { startServer, closeServer, url } from "../../../test/helpers/server"
import request from "superagent"

describe("sessions endpoints", () => {
  beforeEach(function(done) {
    empty(() => {
      fabricate("users", {}, () => startServer(done))
    })
  })

  afterEach(function(done) {
    closeServer(done)
  })

  it("gets a list of sessions", done =>
    fabricate("sessions", {}, (_, sessions) => {
      request.get(url("/sessions")).end((_, res) => {
        res.body.length.should.equal(3)
        res.body[1]._id.should.equal(246810)
        res.body[0]._id.should.equal(123456)
        done()
      })
    }))
})

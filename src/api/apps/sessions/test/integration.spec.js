import { fabricate, empty } from "../../../test/helpers/db"
import app from "../../../"
import request from "superagent"

describe("sessions endpoints", () => {
  beforeEach(function(done) {
    empty(() => {
      fabricate("users", {}, (_, user) => {
        this.user = user
        this.server = app.listen(5000, () => done())
      })
    })
  })

  afterEach(function() {
    this.server.close()
  })

  it("gets a list of sessions", done =>
    fabricate("sessions", {}, (_, sessions) => {
      request.get("http://localhost:5000/sessions").end((_, res) => {
        res.body.length.should.equal(3)
        res.body[1]._id.should.equal(246810)
        res.body[0]._id.should.equal(123456)
        done()
      })
    }))
})

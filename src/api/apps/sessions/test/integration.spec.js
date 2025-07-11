import { fabricate, empty } from "../../../test/helpers/db"
const { getAvailablePort } = require("../../../test/helpers/port.coffee")
import app from "../../../"
import request from "superagent"

describe("sessions endpoints", () => {
  let server
  let port
  beforeEach(function(done) {
    empty(emptyErr => {
      if (emptyErr) {
        done(emptyErr)
      }
      getAvailablePort((portErr, p) => {
        if (portErr) {
          done(portErr)
        }
        port = p
        server = app.listen(port, () => done())
      })
    })
  })

  afterEach(function() {
    server.close()
  })

  it("gets a list of sessions", done =>
    fabricate("sessions", {}, (_, sessions) => {
      request.get(`http://localhost:${port}/sessions`).end((_, res) => {
        res.body.length.should.equal(3)
        res.body[1]._id.should.equal(246810)
        res.body[0]._id.should.equal(123456)
        done()
      })
    }))
})

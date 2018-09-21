import { where, save, destroy } from "../model"
import { fabricate, empty } from "../../../test/helpers/db"

describe("Sessions Model", () => {
  beforeEach(done => {
    empty(() => {
      fabricate("sessions", {}, done)
    })
  })

  it("#where", done => {
    where({}, (_, data) => {
      data.length.should.equal(3)
      data[0].user.id.should.equal("123")
      done()
    })
  })

  it("#save", done => {
    save(
      {
        _id: "59fa424574132b001d917253",
        id: "59fa424574132b001d917253",
        timestamp: "2018-02-20T21:13:09.358Z",
        user: { id: "586ff4069c18db5923002ca6", name: "Luc Succes" },
        article: "59fa424574132b001d917253",
        channel: {
          id: "5759e3efb5989e6f98f77993",
          name: "Artsy Editorial",
          type: "editorial",
        },
      },
      (_, session) => {
        session._id.should.equal("59fa424574132b001d917253")
        done()
      }
    )
  })

  it("Can #save without username (partners)", done => {
    save(
      {
        _id: "59fa424574132b001d917253",
        id: "59fa424574132b001d917253",
        timestamp: "2018-02-20T21:13:09.358Z",
        user: { id: "586ff4069c18db5923002ca6" },
        article: "59fa424574132b001d917253",
        channel: {
          id: "5759e3efb5989e6f98f77993",
          name: "Artsy Editorial",
          type: "editorial",
        },
      },
      (_, session) => {
        session._id.should.equal("59fa424574132b001d917253")
        done()
      }
    )
  })

  it("#destroy", done => {
    where({}, (_, data) => {
      data.length.should.equal(3)
      destroy("123456", (_, session) => {
        session._id.should.equal("123456")
        done()
      })
    })
  })
})

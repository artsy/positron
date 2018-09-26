/* eslint-env mocha */
import jade from "jade"
import path from "path"
import User from "../../../models/user.coffee"

describe("sidebar template", () => {
  it("renders a link to a new article for non-admins", () => {
    const html = jade.compileFile(
      path.resolve(__dirname, "../templates/sidebar.jade")
    )({
      sd: { URL: "/" },
      user: new User({
        name: "Andy Foobar",
        channel_ids: ["123"],
        current_channel: "normies",
      }),
    })
    expect(html).toMatch("/articles/new")
  })
})

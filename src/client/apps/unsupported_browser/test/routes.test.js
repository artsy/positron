import { index } from "client/apps/unsupported_browser/routes"

describe("Unsupported Browser", () => {
  let res

  beforeEach(() => {
    res = { send: jest.fn() }
  })

  it("renders a message asking to upgrade the browser", () => {
    index({}, res, {})
    expect(res.send.mock.calls[0][0]).toMatch(
      "You must use the lastest version of Chrome, Safari, Firefox, or Internet Explorer to use Artsy Writer."
    )
  })
})

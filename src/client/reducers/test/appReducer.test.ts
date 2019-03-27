import sharify from "sharify"
import { appReducer } from "../appReducer"

jest.mock("sharify", () => ({
  data: {
    API_URL: "https://stagingwriter.artsy.net",
    APP_URL: "https://stagingwriter.artsy.net/api",
    ARTSY_URL: "https://stagingapi.artsy.net",
    FORCE_URL: "https://staging.artsy.net",
    GRAPHQL_ENDPOINT: "https://metaphysics-staging.artsy.net",
  },
}))

describe("appReducer", () => {
  let current_channel
  let user

  beforeEach(() => {
    current_channel = {
      id: "5759e3efb5989e6f98f77993",
      name: "Artsy Editorial",
      type: "editorial",
    }
    user = {
      access_token: "sample-token",
      name: "User Name",
      email: "user@email.com",
      id: "5678",
      type: "Admin",
      partner_ids: ["12345"],
      channel_ids: [current_channel.id],
      current_channel,
    }
    sharify.data.USER = user
    sharify.data.CURRENT_CHANNEL = current_channel
  })

  it("Returns the initial state", () => {
    const initialState = appReducer(undefined, { payload: {} })

    expect(initialState.apiURL).toEqual("https://stagingwriter.artsy.net")
    expect(initialState.appURL).toBe("https://stagingwriter.artsy.net/api")
    expect(initialState.artsyURL).toBe("https://stagingapi.artsy.net")
    expect(initialState.channel).toBe(current_channel)
    expect(initialState.forceURL).toBe("https://staging.artsy.net")
    expect(initialState.isAdmin).toBe(true)
    expect(initialState.isEditorial).toBe(true)
    expect(initialState.isPartnerChannel).toBe(false)
    expect(initialState.metaphysicsURL).toBe(
      "https://metaphysics-staging.artsy.net"
    )
    expect(initialState.user).toBe(user)
  })

  describe("isEditorial", () => {
    it("sets initial state for editorial users", () => {
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isEditorial).toBe(true)
    })

    it("sets initial state for non-editorial users", () => {
      sharify.data.CURRENT_CHANNEL.type = "partner"
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isEditorial).toBe(false)
    })
  })

  describe("isAdmin", () => {
    it("sets initial state for admin users", () => {
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isEditorial).toBe(true)
    })

    it("sets initial state for non-admin users", () => {
      delete sharify.data.USER.type
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isAdmin).toBe(false)
    })
  })

  describe("isPartnerChannel", () => {
    it("sets initial state for partner channels", () => {
      sharify.data.CURRENT_CHANNEL.type = "partner"
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isPartnerChannel).toBe(true)
    })

    it("sets initial state for non-partner channels", () => {
      const initialState = appReducer(undefined, { payload: {} })
      expect(initialState.isPartnerChannel).toBe(false)
    })
  })
})

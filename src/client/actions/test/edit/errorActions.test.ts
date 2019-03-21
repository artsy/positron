import { logError, resetError } from "client/actions/edit/errorActions"

describe("Editing errors", () => {
  it("#logError sets error to arg", () => {
    const action = logError({ message: "Error message" })

    expect(action).toEqual({
      type: "ERROR",
      payload: { error: { message: "Error message" } },
    })
  })

  it("#resetError sets error to null", () => {
    const action = resetError()

    expect(action).toEqual({
      type: "ERROR",
      payload: { error: null },
    })
  })
})

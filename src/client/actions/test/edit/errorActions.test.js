import { logError, resetError } from "client/actions/edit/errorActions"

describe("Editing errors", () => {
  it("#logError sets error to arg", () => {
    const message = "Error message"
    const action = logError({ message })

    expect(action.type).toBe("ERROR")
    expect(action.payload.error.message).toBe(message)
  })

  it("#resetError sets error to null", () => {
    const message = "Error message"
    const action = resetError({ message })

    expect(action.type).toBe("ERROR")
    expect(action.payload.error).toBe(null)
  })
})

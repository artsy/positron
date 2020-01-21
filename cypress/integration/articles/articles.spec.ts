describe("Articles", () => {
  it("does stuff", () => {
    cy.visit("/")

    cy.title().should("eq", "adsfasdf")
  })
})

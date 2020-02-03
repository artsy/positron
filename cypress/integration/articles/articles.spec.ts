describe("Articles", () => {
  it("does stuff", () => {
    cy.setLogin()

    cy.visit("/articles")

    cy.title().should("eq", "Artsy Writer")
  })
})

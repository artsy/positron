describe("tags", () => {
  it("can create a new tag", () => {
    cy.setLogin()

    // naming a network call so we can inspect it later
    cy.server()
      .route("POST", "/api/tags")
      .as("tagsPost")
    cy.server()
      .route("DELETE", "/api/tags/**")
      .as("tagsDelete")

    cy.visit("/settings/tags")

    cy.findByPlaceholderText("Enter tag title...")
      .click()
      .type("monkey")
    cy.findByText("Add").click()

    // wait until the save completes
    cy.wait("@tagsPost")
      .its("status")
      .should("be", 200)

    // make sure it persisted
    cy.reload()
    const newTag = cy.findByText("monkey")

    // clean it up
    newTag.find(".remove-button").click()

    // wait until the delete completes
    cy.wait("@tagsDelete")
      .its("status")
      .should("be", 200)
    cy.queryByText("monkey").should("not.exist")

    // make sure it persisted
    cy.reload()
    cy.queryByText("monkey").should("not.exist")
  })
})

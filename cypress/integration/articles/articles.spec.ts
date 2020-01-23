describe("Articles", () => {
  it("can edit articles", () => {
    cy.setLogin()

    cy.visit("/articles")
    cy.title().should("eq", "Artsy Writer")
    cy.findByText(Cypress.env("RECENT_ARTICLE_TITLE"))

    openMonkeyArticleForEdit()

    const question =
      "A stolen $15,000 wooden monkey was returned to a Danish art museum?"
    const statement =
      "A stolen $15,000 wooden monkey was returned to a Danish art museum."

    // edit article
    const body = cy.findAllByText(statement).first()
    body.click().type("{backspace}?")

    saveArticle()

    openMonkeyArticleForEdit()

    // view article
    cy.findByText(question)
    cy.findByText("View").click()
    cy.log(
      "Please verify that a tab opened with the title ending in a question mark!"
    )

    // clean it up
    const title = cy.findAllByText(question).first()
    title.click().type("{backspace}.")

    saveArticle()

    openMonkeyArticleForEdit()

    // view article
    cy.findByText(statement)
    cy.findByText("View").click()

    cy.log("Please verify that a tab opened with the title ending in a period!")
  })

  function saveArticle() {
    cy.findByText(/^Danish design-lovers can finally rest easy/).click({
      force: true,
    })
    cy.wait(2000)
    cy.findByText("Save Article").click()
  }

  function openMonkeyArticleForEdit() {
    // search for article
    cy.findByPlaceholderText("Search Articles...").type("monkey")
    cy.findByText(
      "A stolen $15,000 wooden monkey was returned to a Danish art museum."
    ).click()

    // wait for edit page to load
    cy.findAllByText("Unpublish")
  }
})

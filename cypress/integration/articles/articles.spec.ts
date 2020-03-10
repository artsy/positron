describe("Articles", () => {
  it("can edit articles", () => {
    cy.setLogin()

    cy.visit("/articles")
    cy.title().should("eq", "Artsy Writer")
    cy.findByText("Latest Articles")

    openMonkeyArticleForEdit()

    captureArticleIDFromURL()

    const question =
      "A stolen $15,000 wooden monkey was returned to a Danish art museum?"
    const statement =
      "A stolen $15,000 wooden monkey was returned to a Danish art museum."

    // edit article
    const body = cy.findAllByText(statement).first()
    body.click().type("{backspace}?")

    saveArticle()
    verifyMonkeyArticleHasTitle(question)

    // clean it up
    openMonkeyArticleForEdit()
    const title = cy.findAllByText(question).first()
    title.click().type("{backspace}.")

    saveArticle()
    verifyMonkeyArticleHasTitle(statement)
  })

  it("gets seo warnings", () => {
    cy.setLogin()

    cy.visit("/articles")
    cy.title().should("eq", "Artsy Writer")
    cy.findByText("Latest Articles")

    openMonkeyArticleForEdit()

    cy.findByText("Set Target Keyword").click()

    cy.findByPlaceholderText("A searchable term for this content")
      .click()
      .type("monkey")

    cy.findByText(
      "A meta description has been specified, but it does not contain the focus keyword."
    )
    cy.findByText(
      "The focus keyword appears in the first paragraph of the copy."
    )
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
    cy.location("pathname").should("match", /^\/articles\/.*\/edit$/)
  }

  function captureArticleIDFromURL() {
    cy.location("pathname")
      .invoke("split", "/")
      .its(2)
      .as("articleID")
  }

  function verifyMonkeyArticleHasTitle(title: string) {
    cy.get("@articleID").then(articleID => {
      cy.request(`/api/articles/${articleID}`).then(response => {
        expect(response.status).to.eq(200)
        expect(response.body.title).to.eq(title)
      })
    })
  }
})

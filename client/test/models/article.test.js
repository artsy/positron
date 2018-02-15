import * as Article from 'client/models/article.js'

describe('Article', () => {
  describe('#getArticleByline', () => {
    let article

    beforeEach(() => {
      article = {
        author: {id: '50f4367051e7956b6e00045d', name: 'Artsy Editorial'},
        contributing_authors: []
      }
    })

    it('Returns the author if no contributing authors', () => {
      const byline = Article.getArticleByline(article)
      expect(byline).toBe(article.author.name)
    })

    it('Returns a single contributing author', () => {
      article.contributing_authors.push(
        {id: '123', name: 'Casey Lesser'}
      )
      const byline = Article.getArticleByline(article)
      expect(byline).toBe(article.contributing_authors[0].name)
    })

    it('Returns a list of two contributing authors', () => {
      article.contributing_authors.push(
        {id: '123', name: 'Casey Lesser'},
        {id: '234', name: 'Molly Gottschalk'}
      )
      const byline = Article.getArticleByline(article)
      expect(byline).toBe('Casey Lesser and Molly Gottschalk')
    })

    it('Returns a list of two contributing authors', () => {
      article.contributing_authors.push(
        {id: '123', name: 'Casey Lesser'},
        {id: '234', name: 'Molly Gottschalk'},
        {id: '345', name: 'Tess Thackara'}
      )
      const byline = Article.getArticleByline(article)
      expect(byline).toBe('Casey Lesser, Molly Gottschalk and Tess Thackara')
    })
  })
})

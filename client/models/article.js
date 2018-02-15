import _s from 'underscore.string'
import { pluck } from 'underscore'

export const getArticleByline = (article) => {
  const { contributing_authors, author } = article

  if (contributing_authors && contributing_authors.length) {
    return _s.toSentence(pluck(contributing_authors, 'name'))
  } else if (author.name) {
    return author.name
  }
}

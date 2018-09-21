import request from "superagent"
import { clone, uniq } from "lodash"
import { connect } from "react-redux"
import { difference, flatten, pluck } from "underscore"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteList } from "client/components/autocomplete2/list"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"
import { AuthorsQuery } from "client/queries/authors"

export class ArticleAuthors extends Component {
  static propTypes = {
    article: PropTypes.object,
    apiURL: PropTypes.string,
    isEditorial: PropTypes.bool,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object,
  }

  onChangeAuthor = name => {
    const { article, onChangeArticleAction } = this.props
    const author = clone(article.author) || {}

    author.name = name
    onChangeArticleAction("author", author)
  }

  fetchAuthors = (fetchedItems, cb) => {
    const { apiURL, article, user } = this.props
    const { author_ids } = article

    const alreadyFetched = pluck(fetchedItems, "id")
    const idsToFetch = difference(author_ids, alreadyFetched)
    let newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${apiURL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: AuthorsQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          newItems.push(res.body.data.authors)
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  render() {
    const { article, apiURL, isEditorial, onChangeArticleAction } = this.props
    const name = article.author ? article.author.name : ""

    return (
      <Row>
        <Col xs={6}>
          <div className="field-group">
            <label>Primary Author</label>
            <input
              className="bordered-input"
              defaultValue={name}
              onChange={e => this.onChangeAuthor(e.target.value)}
            />
          </div>
        </Col>

        <Col xs={6}>
          {isEditorial && (
            <div className="field-group">
              <label>Authors</label>
              <AutocompleteList
                fetchItems={this.fetchAuthors}
                items={article.author_ids || []}
                filter={items => {
                  return items.results.map(item => {
                    const { id, image_url, name } = item
                    return {
                      id,
                      thumbnail_image: image_url,
                      name,
                    }
                  })
                }}
                onSelect={results =>
                  onChangeArticleAction("author_ids", results)
                }
                placeholder="Search by author name..."
                url={`${apiURL}/authors?q=%QUERY`}
              />
            </div>
          )}
          {article.layout !== "news" && (
            <div className="field-group">
              <AutocompleteListMetaphysics
                field="contributing_authors"
                label="Contributing Authors"
                model="users"
              />
            </div>
          )}
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
  isEditorial: state.app.isEditorial,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticleAuthors)

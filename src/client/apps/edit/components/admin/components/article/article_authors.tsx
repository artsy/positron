import { Box, Flex, Sans } from "@artsy/palette"
import Input from "@artsy/reaction/dist/Components/Input"
import { clone, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"
import { onChangeArticle } from "../../../../../../actions/edit/articleActions"
import { AutocompleteList } from "../../../../../../components/autocomplete2/list"
import AutocompleteListMetaphysics from "../../../../../../components/autocomplete2/list_metaphysics"
import { AuthorsQuery } from "../../../../../../queries/authors"
import { AdminArticleProps } from "./index"

export class ArticleAuthors extends Component<AdminArticleProps> {
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
    const newItems = clone(fetchedItems)

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
            new Error(err)
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
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pb={40} pr={[0, 20]}>
          <Sans size="3t" weight="medium">
            Primary Author
          </Sans>
          <Input
            defaultValue={name}
            type="text"
            onChange={e => this.onChangeAuthor(e.currentTarget.value)}
            block
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 20]}>
          {isEditorial && (
            <Box pb={40}>
              <AutocompleteList
                label="Authors"
                fetchItems={this.fetchAuthors}
                items={article.author_ids || []}
                filter={items => {
                  return items.results.map(item => {
                    const { id, image_url } = item
                    return {
                      id,
                      thumbnail_image: image_url,
                      name: item.name,
                    }
                  })
                }}
                onSelect={results =>
                  onChangeArticleAction("author_ids", results)
                }
                placeholder="Search by author name..."
                url={`${apiURL}/authors?q=%QUERY`}
              />
            </Box>
          )}
          {article.layout !== "news" && (
            <AutocompleteListMetaphysics
              field="contributing_authors"
              label="Contributing Authors"
              model="users"
            />
          )}
        </Box>
      </Flex>
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

import colors from "@artsy/reaction/dist/Assets/Colors"
import request from "superagent"
import styled from "styled-components"
import { clone, uniq } from "lodash"
import { connect } from "react-redux"
import { difference, flatten, pluck } from "underscore"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { Col, Row } from "react-styled-flexboxgrid"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteList } from "/client/components/autocomplete2/list"
import { ArticlePublishDate } from "./article_publish_date"
import { RelatedArticleQuery } from "client/queries/related_articles"
import ArticleAuthors from "./article_authors"

export class AdminArticle extends Component {
  static propTypes = {
    article: PropTypes.object,
    apiURL: PropTypes.string,
    channel: PropTypes.object,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object,
  }

  fetchArticles = (fetchedItems, cb) => {
    const { apiURL, article, user } = this.props
    const { related_article_ids } = article

    const alreadyFetched = pluck(fetchedItems, "id")
    const idsToFetch = difference(related_article_ids, alreadyFetched)
    let newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${apiURL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: RelatedArticleQuery(idsToFetch) })
        .end((err, res) => {
          if (err) {
            console.error(err)
          }
          newItems.push(res.body.data.articles)
          const uniqItems = uniq(flatten(newItems))
          cb(uniqItems)
        })
    } else {
      return fetchedItems
    }
  }

  render() {
    const { article, apiURL, channel, onChangeArticleAction } = this.props

    return (
      <div>
        <ArticleAuthors />

        <Row>
          <Col xs={6}>
            {article.layout !== "news" && (
              <Row>
                <Col xs={6}>
                  <div className="field-group">
                    <label>Article Tier</label>
                    <ButtonGroup>
                      <Button
                        active={article.tier === 1}
                        onClick={() => onChangeArticleAction("tier", 1)}
                      >
                        Tier 1
                      </Button>
                      <Button
                        active={article.tier === 2}
                        onClick={() => onChangeArticleAction("tier", 2)}
                      >
                        Tier 2
                      </Button>
                    </ButtonGroup>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="field-group">
                    <label>Magazine Feed</label>
                    <ButtonGroup>
                      <Button
                        active={article.featured}
                        onClick={() => onChangeArticleAction("featured", true)}
                      >
                        Yes
                      </Button>
                      <Button
                        active={!article.featured}
                        onClick={() => onChangeArticleAction("featured", false)}
                      >
                        No
                      </Button>
                    </ButtonGroup>
                  </div>
                </Col>
              </Row>
            )}

            {channel.type === "editorial" &&
              article.layout !== "news" && (
                <div className="field-group">
                  <label>Article Layout</label>
                  <ButtonGroup>
                    <Button
                      active={article.layout === "standard"}
                      onClick={() =>
                        onChangeArticleAction("layout", "standard")
                      }
                    >
                      Standard
                    </Button>
                    <Button
                      active={article.layout === "feature"}
                      onClick={() => onChangeArticleAction("layout", "feature")}
                    >
                      Feature
                    </Button>
                  </ButtonGroup>
                </div>
              )}

            <div
              className="field-group--inline flat-checkbox"
              onClick={e =>
                onChangeArticleAction("indexable", !article.indexable)
              }
            >
              <input type="checkbox" checked={article.indexable} readOnly />
              <label>Index for search</label>
            </div>

            <div
              className="field-group field-group--inline flat-checkbox"
              onClick={() =>
                onChangeArticleAction(
                  "exclude_google_news",
                  !article.exclude_google_news
                )
              }
            >
              <input
                type="checkbox"
                checked={article.exclude_google_news}
                readOnly
              />
              <label>Exclude from Google News</label>
            </div>
          </Col>

          <Col xs={6}>
            <ArticlePublishDate
              article={article}
              onChange={onChangeArticleAction}
            />

            <div className="field-group">
              <label>Related Articles</label>
              <AutocompleteList
                fetchItems={this.fetchArticles}
                items={article.related_article_ids || []}
                onSelect={results =>
                  onChangeArticleAction("related_article_ids", results)
                }
                placeholder="Search by title..."
                url={`${apiURL}/articles?published=true&q=%QUERY`}
              />
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
  channel: state.app.channel,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminArticle)

const Button = styled.button`
  padding: 10px 20px;
  border: 2px solid ${colors.grayMedium};
  color: ${props => (props.active ? "black" : colors.grayMedium)};
  ${avantgarde("s11")} outline: none;
`

const ButtonGroup = styled.div`
  margin-top: 5px;
  button {
    display: inline-block;
    &:first-child {
      border-right: none;
    }
  }
`

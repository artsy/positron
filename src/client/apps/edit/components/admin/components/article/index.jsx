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
import { Flex, Theme } from "@artsy/palette"

import { onChangeArticle } from "client/actions/edit/articleActions"
import { AutocompleteList } from "/client/components/autocomplete2/list"
import { ArticlePublishDate } from "./article_publish_date"
import { RelatedArticleQuery } from "client/queries/related_articles"
import ArticleAuthors from "./article_authors"
import { ArticleVideoReleaseDate } from './article_video_release_date'

export class AdminArticle extends Component {
  static propTypes = {
    article: PropTypes.object,
    apiURL: PropTypes.string,
    channel: PropTypes.object,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object,
  }

  constructor(props) {
    super(props)

    const { article: { media } } = this.props
    const duration = (media || {}).duration || 0

    this.state = {
      min: Math.floor(Math.round(duration) / 60),
      sec: Math.round(duration) % 60,
      videoDurationHasFocus: false,
    }
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

  onMediaChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const media = clone(article.media) || {}

    media[key] = value
    onChangeArticleAction("media", media)
  }

  onVideoDurationMinUpdated = event => {
    this.setState({ min: event.target.value }, () => {
      this.onMediaChange("duration", (this.state.min * 60) + this.state.sec)
    })
  }

  onVideoDurationSecondUpdated = event => {
    this.setState({ sec: event.target.value }, () => {
      this.onMediaChange("duration", (this.state.min * 60) + this.state.sec)
    })
  }

  render() {
    const { article, apiURL, channel, onChangeArticleAction } = this.props
    const { min, sec, videoDurationHasFocus } = this.state

    return (
      <Theme>
        <div>
          <ArticleAuthors/>

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

              <Row>
                {channel.type === "editorial" &&
                article.layout !== "news" && (
                  <Col xs={6}>
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
                          onClick={() =>
                            onChangeArticleAction("layout", "feature")
                          }
                        >
                          Feature
                        </Button>
                      </ButtonGroup>
                    </div>
                  </Col>
                )}

                {article.layout === "video" && (
                  <Col xs={6}>
                    <div className="field-group">
                      <label>Video duration</label>

                      <InputGroup
                        mt={0.5}
                        mr={4}
                        pr={2}
                        flexDirection="row"
                        alignItems="center"
                        videoDurationHasFocus={videoDurationHasFocus}
                        onClick={() =>
                          this.setState({ videoDurationHasFocus: true })
                        }
                      >
                        <input
                          className="bordered-input"
                          type="number"
                          min="00"
                          max="99"
                          step="1"
                          placeholder="00"
                          defaultValue={min}
                          onChange={this.onVideoDurationMinUpdated}
                          onBlur={() =>
                            this.setState({ videoDurationHasFocus: false })
                          }
                        />
                        min
                        <input
                          className="bordered-input"
                          type="number"
                          min="00"
                          max="60"
                          step="1"
                          placeholder="00"
                          defaultValue={sec}
                          onChange={this.onVideoDurationSecondUpdated}
                          onBlur={() =>
                            this.setState({ videoDurationHasFocus: false })
                          }
                        />
                        sec
                      </InputGroup>
                    </div>
                  </Col>
                )}
              </Row>

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

              {article.layout === "video" && (
                <ArticleVideoReleaseDate
                  article={article}
                  onChangeArticleAction={onChangeArticleAction}
                />)}

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

              {article.layout === "video" && (
                <div
                  className="field-group field-group--inline flat-checkbox"
                  onClick={() =>
                    this.onMediaChange("published", !article.media.published)
                  }
                >
                  <input type="checkbox" checked={article.media.published} readOnly />
                  <label>Video Published</label>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </Theme>
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

export const InputGroup = styled(Flex)`
  border: 2px solid ${props => props.videoDurationHasFocus ? colors.purpleRegular : colors.grayRegular};
  transition: border 0.3s;

  .bordered-input {
    border: none;
    margin-top: 0;
  }
`
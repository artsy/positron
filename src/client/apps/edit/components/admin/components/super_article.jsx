import request from "superagent"
import { connect } from "react-redux"
import { clone, uniq } from "lodash"
import { difference, flatten, pluck } from "underscore"
import { Col, Row } from "react-styled-flexboxgrid"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { AutocompleteList } from "/client/components/autocomplete2/list"
import { onChangeArticle } from "client/actions/edit/articleActions"
import ImageUpload from "./image_upload.coffee"
import { SubArticleQuery } from "client/queries/sub_articles"

export class AdminSuperArticle extends Component {
  static propTypes = {
    article: PropTypes.object,
    apiURL: PropTypes.string,
    onChangeArticleAction: PropTypes.func,
    user: PropTypes.object,
  }

  onChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const super_article = clone(article.super_article) || {}

    super_article[key] = value
    onChangeArticleAction("super_article", super_article)
  }

  fetchArticles = (fetchedItems, cb) => {
    const { apiURL, article, user } = this.props
    const super_article = article.super_article || {}
    const { related_articles } = super_article

    const alreadyFetched = pluck(fetchedItems, "id")
    const idsToFetch = difference(related_articles, alreadyFetched)
    let newItems = clone(fetchedItems)

    if (idsToFetch.length) {
      request
        .get(`${apiURL}/graphql`)
        .set({
          Accept: "application/json",
          "X-Access-Token": user && user.access_token,
        })
        .query({ query: SubArticleQuery(idsToFetch) })
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
    const { article, apiURL, onChangeArticleAction } = this.props
    const super_article = article.super_article || {}
    const {
      footer_blurb,
      footer_title,
      partner_fullscreen_header_logo,
      partner_link,
      partner_link_title,
      partner_logo,
      partner_logo_link,
      related_articles,
      secondary_logo_link,
      secondary_logo_text,
      secondary_partner_logo,
    } = super_article
    const isDisabled = !article.is_super_article

    return (
      <div className="AdminSuperArticle">
        <Row>
          <Col xs={12}>
            <div
              className="field-group field-group--inline flat-checkbox"
              onClick={e =>
                onChangeArticleAction(
                  "is_super_article",
                  !article.is_super_article
                )
              }
              name="media.published"
            >
              <input
                type="checkbox"
                checked={article.is_super_article}
                readOnly
              />
              <label>Enable Super Article</label>
            </div>
          </Col>
        </Row>

        <Row>
          <Col xs={4}>
            <div className="field-group">
              <label>Partner Link Title</label>
              <input
                className="bordered-input"
                defaultValue={partner_link_title || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("partner_link_title", e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Partner Link</label>
              <input
                className="bordered-input"
                defaultValue={partner_link || ""}
                disabled={isDisabled}
                onChange={e => this.onChange("partner_link", e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Partner Logo Link</label>
              <input
                className="bordered-input"
                defaultValue={partner_logo_link || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("partner_logo_link", e.target.value)
                }
              />
            </div>

            <div className="field-group">
              <label>Secondary Logo Text</label>
              <input
                className="bordered-input"
                defaultValue={secondary_logo_text || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("secondary_logo_text", e.target.value)
                }
              />
            </div>
            <div className="field-group">
              <label>Secondary Logo Link</label>
              <input
                className="bordered-input"
                defaultValue={secondary_logo_link || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("secondary_logo_link", e.target.value)
                }
              />
            </div>
            <div className="field-group">
              <label>Footer Title</label>
              <input
                className="bordered-input"
                defaultValue={footer_title || ""}
                disabled={isDisabled}
                onChange={e => this.onChange("footer_title", e.target.value)}
              />
            </div>
            <div className="field-group">
              <label>Footer Blurb</label>
              <textarea
                className="bordered-input"
                defaultValue={footer_blurb || ""}
                disabled={isDisabled}
                onChange={e => this.onChange("footer_blurb", e.target.value)}
              />
              <div className="supports-markdown" />
            </div>
          </Col>

          <Col xs={4}>
            <div className="field-group">
              <label>Partner Logo</label>
              <ImageUpload
                disabled={isDisabled}
                name="partner_logo"
                src={partner_logo || ""}
                onChange={this.onChange}
              />
            </div>

            <div className="field-group">
              <label>Partner Fullscreen</label>
              <ImageUpload
                disabled={isDisabled}
                name="partner_fullscreen_header_logo"
                src={partner_fullscreen_header_logo || ""}
                onChange={this.onChange}
              />
            </div>

            <div className="field-group">
              <label>Secondary Logo</label>
              <ImageUpload
                disabled={isDisabled}
                name="secondary_partner_logo"
                src={secondary_partner_logo || ""}
                onChange={this.onChange}
              />
            </div>
          </Col>
          <Col xs={4}>
            <label>SubArticles</label>
            <AutocompleteList
              disabled={isDisabled}
              fetchItems={this.fetchArticles}
              items={related_articles || []}
              onSelect={results => this.onChange("related_articles", results)}
              placeholder="Search by title..."
              url={`${apiURL}/articles?published=true&q=%QUERY`}
            />
          </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  apiURL: state.app.apiURL,
  article: state.edit.article,
  user: state.app.user,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminSuperArticle)

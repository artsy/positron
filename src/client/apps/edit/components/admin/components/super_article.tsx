import { Box, Checkbox, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import TextArea from "@artsy/reaction/dist/Components/TextArea"
import { clone, uniq } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import request from "superagent"
import { difference, flatten, pluck } from "underscore"
import { onChangeArticle } from "../../../../../actions/edit/articleActions"
import { AutocompleteList } from "../../../../../components/autocomplete2/list"
import { FormLabel } from "../../../../../components/form_label"
import { SubArticleQuery } from "../../../../../queries/sub_articles"
const ImageUpload = require("./image_upload.coffee")

interface AdminSuperArticleProps {
  article: ArticleData
  apiURL: string
  onChangeArticleAction: (key: string, val: any) => void
  user: any
}

export class AdminSuperArticle extends Component<AdminSuperArticleProps> {
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
    const newItems = clone(fetchedItems)

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
            new Error(err)
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
        <Box pb={40}>
          <Checkbox
            onSelect={() =>
              onChangeArticleAction(
                "is_super_article",
                !article.is_super_article
              )
            }
            selected={article.is_super_article}
          >
            <FormLabel>Enable Super Article</FormLabel>
          </Checkbox>
        </Box>

        <Flex justifyContent="space-between" flexDirection={["column", "row"]}>
          <Box width={["100%", "31%"]} pb={40}>
            <Box pb={40}>
              <FormLabel>Partner Link Title</FormLabel>
              <Input
                block
                defaultValue={partner_link_title || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("partner_link_title", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Partner Link</FormLabel>
              <Input
                block
                defaultValue={partner_link || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("partner_link", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Partner Logo Link</FormLabel>
              <Input
                block
                defaultValue={partner_logo_link || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("partner_logo_link", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Secondary Logo Text</FormLabel>
              <Input
                block
                defaultValue={secondary_logo_text || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("secondary_logo_text", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Secondary Logo Link</FormLabel>
              <Input
                block
                defaultValue={secondary_logo_link || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("secondary_logo_link", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Footer Title</FormLabel>
              <Input
                block
                defaultValue={footer_title || ""}
                disabled={isDisabled}
                onChange={e =>
                  this.onChange("footer_title", e.currentTarget.value)
                }
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Footer Blurb</FormLabel>
              <TextArea
                block
                defaultValue={footer_blurb || ""}
                disabled={isDisabled}
                onChange={e => this.onChange("footer_blurb", e.target.value)}
              />
              <div className="supports-markdown" />
            </Box>
          </Box>

          <Box width={["100%", "31%"]} pb={40}>
            <Box pb={40}>
              <FormLabel>Partner Logo</FormLabel>
              <ImageUpload
                disabled={isDisabled}
                name="partner_logo"
                src={partner_logo || ""}
                onChange={this.onChange}
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Partner Fullscreen</FormLabel>
              <ImageUpload
                disabled={isDisabled}
                name="partner_fullscreen_header_logo"
                src={partner_fullscreen_header_logo || ""}
                onChange={this.onChange}
              />
            </Box>

            <Box pb={40}>
              <FormLabel>Secondary Logo</FormLabel>
              <ImageUpload
                disabled={isDisabled}
                name="secondary_partner_logo"
                src={secondary_partner_logo || ""}
                onChange={this.onChange}
              />
            </Box>
          </Box>

          <Box width={["100%", "31%"]} pb={40}>
            <FormLabel>SubArticles</FormLabel>
            <AutocompleteList
              disabled={isDisabled}
              fetchItems={this.fetchArticles}
              items={related_articles || []}
              onSelect={results => this.onChange("related_articles", results)}
              placeholder="Search by title..."
              url={`${apiURL}/articles?published=true&q=%QUERY`}
            />
          </Box>
        </Flex>
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

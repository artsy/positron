import { Box, Checkbox, Flex } from "@artsy/palette"
import { Input } from "@artsy/reaction/dist/Components/Input"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import { clone } from "lodash"
import React, { Component } from "react"
import { connect } from "react-redux"
import { DisplayProps } from "../index"
import { EmailPreview } from "./preview/email_preview"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export class DisplayEmail extends Component<DisplayProps> {
  onChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const emailMetadata = clone(article.email_metadata) || {}

    emailMetadata[key] = value
    onChangeArticleAction("email_metadata", emailMetadata)
  }

  render() {
    const { article, onChangeArticleAction } = this.props
    const emailMetadata = article.email_metadata || {}
    const { author, custom_text, headline, image_url } = emailMetadata

    return (
      <div>
        <Flex
          flexDirection={["column", "row"]}
          justifyContent="space-between"
          pt={4}
        >
          <Box width={["100%", "31%"]}>
            <Box pb={4}>
              <FormLabel>Email Image</FormLabel>
              <ImageUpload
                name="image_url"
                src={image_url || ""}
                onChange={this.onChange}
              />
            </Box>

            <Box pb={4}>
              <CharacterLimit
                label="Email Headline"
                limit={97}
                type="textarea"
                onChange={value => this.onChange("headline", value)}
                defaultValue={headline}
              />
            </Box>

            <Box pb={4}>
              <CharacterLimit
                label="Custom Text"
                limit={160}
                type="textarea"
                onChange={value => this.onChange("custom_text", value)}
                defaultValue={custom_text}
              />
            </Box>

            <Box pb={3}>
              <FormLabel>Author</FormLabel>
              <Input
                block
                onChange={e => this.onChange("author", e.currentTarget.value)}
                defaultValue={author || ""}
              />
            </Box>
          </Box>

          <Box width={["100%", "65%"]} pb={4} pt={1}>
            <EmailPreview article={article} />
          </Box>
        </Flex>

        <Box pb={4}>
          <Checkbox
            selected={article.send_body}
            onSelect={() =>
              onChangeArticleAction("send_body", !article.send_body)
            }
          />
        </Box>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplayEmail)

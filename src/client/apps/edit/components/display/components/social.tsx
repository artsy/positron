import { Box, Flex } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { connect } from "react-redux"
import { DisplayProps } from "../index"
import { SocialPreview } from "./preview/social_preview"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const DisplaySocial: React.SFC<DisplayProps> = props => {
  const { article, onChangeArticleAction } = props
  const { social_description, social_image, social_title } = article

  return (
    <Flex
      flexDirection={["column", "row"]}
      justifyContent="space-between"
      pt={4}
    >
      <Box width={["100%", "31%"]} pb={4}>
        <Box pb={4}>
          <FormLabel>Social Image</FormLabel>
          <ImageUpload
            name="social_image"
            src={social_image || ""}
            onChange={(key, value) => onChangeArticleAction(key, value)}
          />
        </Box>

        <Box pb={4}>
          <CharacterLimit
            label="Social Headline"
            limit={97}
            type="textarea"
            onChange={value => onChangeArticleAction("social_title", value)}
            defaultValue={social_title}
          />
        </Box>

        <Box pb={4}>
          <CharacterLimit
            label="Social Description"
            limit={160}
            type="textarea"
            onChange={value =>
              onChangeArticleAction("social_description", value)
            }
            defaultValue={social_description}
          />
        </Box>
      </Box>

      <Box width={["100%", "65%"]} pb={4} pt={1}>
        <SocialPreview article={article} />
      </Box>
    </Flex>
  )
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
)(DisplaySocial)

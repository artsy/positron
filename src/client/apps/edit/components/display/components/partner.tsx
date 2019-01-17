import { Box, color, Flex, Serif } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { DisplayProps } from "../index"
import { FillTitlePrompt } from "./magazine"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const DisplayPartner: React.SFC<DisplayProps> = props => {
  const { article, onChangeArticleAction } = props

  return (
    <div>
      <Intro pt={50}>
        <Flex
          maxWidth={960}
          mx="auto"
          mt={4}
          px={3}
          flexDirection="column"
          alignItems="center"
        >
          <Serif size="6">
            Prepare your article for Artsy and social media
          </Serif>
          <Serif size="5" pb={2}>
            Choose a thumbnail image and title that captures the user&rsquo;s
            attention
          </Serif>
          <img src="/images/edit_prepare_example.png" width="100%" />
        </Flex>
      </Intro>

      <Flex
        pt={4}
        maxWidth={960}
        px={3}
        mx="auto"
        justifyContent="space-between"
      >
        <Box width={["100%", "31%"]} pb={4}>
          <FormLabel isRequired>Thumbnail Image</FormLabel>
          <Box pt={1}>
            <ImageUpload
              name="thumbnail_image"
              src={article.thumbnail_image || ""}
              onChange={(key, value) => onChangeArticleAction(key, value)}
            />
          </Box>
        </Box>

        <FormFields width={["100%", "65%"]} pb={4}>
          <CharacterLimit
            label="Title"
            limit={97}
            type="textarea"
            onChange={value => onChangeArticleAction("thumbnail_title", value)}
            defaultValue={article.thumbnail_title || ""}
            isRequired
          />
          <FillTitlePrompt
            size="2"
            mt={0.5}
            color={color("black30")}
            textAlign="right"
            onClick={() =>
              onChangeArticleAction("thumbnail_title", article.title)
            }
          >
            Use Article Title
          </FillTitlePrompt>
        </FormFields>
      </Flex>
    </div>
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
)(DisplayPartner)

const Intro = styled(Box)`
  background: #eee;
`

const FormFields = styled(Box)`
  .DraftEditor-root {
    min-height: 130px;
    font-size: 22px;
  }
`

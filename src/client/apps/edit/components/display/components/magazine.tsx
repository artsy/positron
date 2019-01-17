import { Box, color, Flex, Serif } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import { FormLabel } from "client/components/form_label"
import ImageGenerator from "client/components/image_generator"
import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { DisplayProps } from "../index"
import { MagazinePreview } from "./preview/magazine_preview"
const ImageUpload = require("client/apps/edit/components/admin/components/image_upload.coffee")

export const DisplayMagazine: React.SFC<DisplayProps> = props => {
  const { article, onChangeArticleAction } = props

  return (
    <Flex
      flexDirection={["column", "row"]}
      justifyContent="space-between"
      pt={4}
    >
      <Box width={["100%", "31%"]} pb={4}>
        <Box pb={4}>
          <FormLabel isRequired>Magazine Image</FormLabel>
          <ImageUpload
            name="thumbnail_image"
            src={article.thumbnail_image || ""}
            onChange={(key: string, value: any) =>
              onChangeArticleAction(key, value)
            }
          />
        </Box>

        <Box pb={4}>
          <CharacterLimit
            label="Magazine Headline"
            limit={97}
            type="textarea"
            onChange={value => onChangeArticleAction("thumbnail_title", value)}
            defaultValue={article.thumbnail_title}
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
        </Box>

        <Box pb={4}>
          <CharacterLimit
            label="Magazine Description"
            limit={160}
            type="textarea"
            onChange={value => onChangeArticleAction("description", value)}
            defaultValue={article.description}
          />
        </Box>

        {article.layout === "news" && <ImageGenerator />}
      </Box>

      <Box width={["100%", "65%"]} pb={4} pt={1}>
        <MagazinePreview article={article} />
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
)(DisplayMagazine)

const FillTitlePrompt = styled(Serif).attrs<{ onClick: () => void }>({})`
  cursor: pointer;
`

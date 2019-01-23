import { Box, Flex } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { CharacterLimit } from "client/components/character_limit"
import React from "react"
import { connect } from "react-redux"
import { DisplayProps } from "../index"
import { SearchPreview } from "./preview/search_preview"

interface DisplaySearchProps extends DisplayProps {
  forceURL: string
}

export const DisplaySearch: React.SFC<DisplaySearchProps> = props => {
  const { article, forceURL, onChangeArticleAction } = props
  const { search_description, search_title } = article

  return (
    <Flex
      flexDirection={["column", "row"]}
      justifyContent="space-between"
      pt={4}
    >
      <Box width={["100%", "31%"]} pb={4}>
        <Box pb={4}>
          <CharacterLimit
            label="Search Headline"
            limit={97}
            type="textarea"
            onChange={value => onChangeArticleAction("search_title", value)}
            defaultValue={search_title}
          />
        </Box>

        <Box pb={4}>
          <CharacterLimit
            label="Search Description"
            limit={160}
            type="textarea"
            onChange={value =>
              onChangeArticleAction("search_description", value)
            }
            defaultValue={search_description}
          />
        </Box>
      </Box>

      <Box width={["100%", "65%"]} pb={4} pt={1}>
        <SearchPreview article={article} forceURL={forceURL} />
      </Box>
    </Flex>
  )
}

const mapStateToProps = state => ({
  article: state.edit.article,
  forceURL: state.app.forceURL,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplaySearch)

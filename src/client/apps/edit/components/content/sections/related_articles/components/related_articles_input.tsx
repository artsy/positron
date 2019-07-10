import { Box, Sans } from "@artsy/palette"
import { Autocomplete } from "client/components/autocomplete2"
import React from "react"
import { data as sd } from "sharify"
import styled from "styled-components"
import { RelatedArticlesProps } from "../index"

export const RelatedArticlesInput: React.SFC<RelatedArticlesProps> = ({
  article,
  color,
  onChange,
}) => {
  const related = article.related_article_ids || []
  return (
    <RelatedArticlesInputContainer width="50%" pt={2} pb={100} color={color}>
      <Sans size="4">Add an article</Sans>

      <Autocomplete
        items={related}
        onSelect={onChange}
        placeholder="Search by title..."
        url={`${sd.API_URL}/articles?channel_id=${article.channel_id}&q=%QUERY`}
      />
    </RelatedArticlesInputContainer>
  )
}

const RelatedArticlesInputContainer = styled(Box)`
  color: ${props => props.color || "black"};
  align-self: flex-end;

  input {
    color: "black";
  }
`

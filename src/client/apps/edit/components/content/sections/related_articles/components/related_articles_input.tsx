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
    <RelatedArticlesInputContainer
      className="RelatedArticlesInput"
      color={color}
    >
      <label>Add an article</label>

      <Autocomplete
        items={related}
        onSelect={onChange}
        placeholder="Search by title..."
        url={`${sd.API_URL}/articles?channel_id=${article.channel_id}&q=%QUERY`}
      />
    </RelatedArticlesInputContainer>
  )
}

const RelatedArticlesInputContainer = styled.div`
  color: ${props => props.color || "black"};

  input {
    color: "black";
  }
`

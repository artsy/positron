import React from "react"
import AutocompleteListMetaphysics from "../../../../../../components/autocomplete2/list_metaphysics"
import MentionedList from "./mentioned_list"

export const FeaturingMentioned: React.SFC<{ model: string }> = props => {
  const { model } = props

  const field =
    model === "artist" ? "primary_featured_artist_ids" : "featured_artwork_ids"

  return (
    <div>
      <AutocompleteListMetaphysics field={field} model={`${model}s`} />
      <MentionedList model={model} />
    </div>
  )
}

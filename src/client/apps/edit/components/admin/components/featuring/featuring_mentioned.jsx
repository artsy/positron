import PropTypes from "prop-types"
import React, { Component } from "react"
import MentionedList from "./mentioned_list"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"

export class FeaturingMentioned extends Component {
  static propTypes = {
    model: PropTypes.string,
  }

  render() {
    const { model } = this.props

    const field =
      model === "artist"
        ? "primary_featured_artist_ids"
        : "featured_artwork_ids"

    return (
      <div className="FeaturingMentioned">
        <AutocompleteListMetaphysics field={field} model={`${model}s`} />
        <MentionedList model={model} />
      </div>
    )
  }
}

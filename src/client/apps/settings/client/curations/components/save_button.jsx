import PropTypes from "prop-types"
import React from "react"

export const SaveButton = props => {
  const { onSave, isSaved } = props
  const saveColor = isSaved ? "black" : "rgb(247, 98, 90)"

  return (
    <button
      className="save-curation avant-garde-button"
      onClick={onSave}
      style={{ color: saveColor }}
    >
      {isSaved ? "Saved" : "Save"}
    </button>
  )
}

SaveButton.propTypes = {
  isSaved: PropTypes.bool,
  onSave: PropTypes.func.isRequired,
}

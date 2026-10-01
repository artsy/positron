import React from "react"

interface Props {
  width?: string
}

/**
 * Four-tile grid glyph for the "Artwork Grid" section tool. Reaction's
 * IconEdit* set has no grid icon, so this one lives in Positron.
 */
export const IconEditArtworkGrid: React.SFC<Props> = ({ width = "45px" }) => (
  <svg
    className="edit-artwork-grid"
    width={width}
    viewBox="0 0 42 42"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="17" height="17" />
    <rect x="23" y="2" width="17" height="17" />
    <rect x="2" y="23" width="17" height="17" />
    <rect x="23" y="23" width="17" height="17" />
  </svg>
)

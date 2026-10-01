import { color, Sans } from "@artsy/palette"
import { RemoveButton } from "client/components/remove_button"
import { ArtworkGridArtwork } from "client/typings/sections"
import React from "react"
import styled from "styled-components"

interface Props {
  artwork: ArtworkGridArtwork
  editing?: boolean
  /** Read by DragDropList to decide whether to wrap this item in a DragTarget */
  isDraggable?: boolean
  onRemove?: () => void
}

export const getArtistName = (artwork: ArtworkGridArtwork) => {
  const artist = artwork.artist || (artwork.artists && artwork.artists[0])
  return artist ? artist.name : undefined
}

/**
 * Editor preview tile for one artwork in an Artwork Grid section. Renders
 * the denormalized snapshot stored on the section; Force renders the
 * public tile from live Gravity data.
 */
export const ArtworkGridItem: React.SFC<Props> = ({
  artwork,
  editing,
  onRemove,
}) => {
  const artistName = getArtistName(artwork)
  const partnerName = artwork.partner && artwork.partner.name

  return (
    <ArtworkGridItemContainer>
      {artwork.image ? (
        <ArtworkGridImage src={artwork.image} alt={artwork.title || ""} />
      ) : (
        <ArtworkGridImagePlaceholder />
      )}
      <ArtworkGridMeta>
        {artistName && (
          <Sans size="3" weight="medium">
            {artistName}
          </Sans>
        )}
        {artwork.title && (
          <Sans size="3" color="black60">
            <i>{artwork.title}</i>
            {artwork.date ? `, ${artwork.date}` : ""}
          </Sans>
        )}
        {partnerName && (
          <Sans size="3" color="black60">
            {partnerName}
          </Sans>
        )}
      </ArtworkGridMeta>
      {editing && onRemove && <RemoveButton onClick={onRemove} />}
    </ArtworkGridItemContainer>
  )
}

export const ArtworkGridItemContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: 0;
`

const ArtworkGridImage = styled.img`
  display: block;
  width: 100%;
  height: auto;
`

const ArtworkGridImagePlaceholder = styled.div`
  width: 100%;
  padding-bottom: 100%;
  background: ${color("black10")};
`

const ArtworkGridMeta = styled.div`
  padding-top: 10px;
`

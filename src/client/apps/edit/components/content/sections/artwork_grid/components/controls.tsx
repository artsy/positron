import { Box, Col, Flex } from "@artsy/palette"
import { logError } from "client/actions/edit/errorActions"
import {
  onChangeSection,
  removeSection,
} from "client/actions/edit/sectionActions"
import SectionControls from "client/apps/edit/components/content/section_controls"
import { Autocomplete } from "client/components/autocomplete2"
import { FormLabel } from "client/components/form_label"
import {
  ArtworkGridArtwork,
  ArtworkGridColumns,
  SectionData,
} from "client/typings/sections"
import React, { Component } from "react"
import { connect } from "react-redux"
import { data as sd } from "sharify"
import styled from "styled-components"
import { ArtworkInputs } from "../../images/components/controls"
import { InputArtworkUrl } from "../../images/components/input_artwork_url"
import {
  fetchDenormalizedArtwork,
  filterArtworkSearchResults,
} from "../../shared/artworks"
import { COLUMN_OPTIONS, DEFAULT_COLUMNS } from "../constants"

interface Props {
  editSection: SectionData
  logErrorAction: (e: any) => void
  onChangeSectionAction: (key: string, val: any) => void
  removeSectionAction: (i: number) => void
  sectionIndex: number
}

/**
 * Sticky controls for an Artwork Grid section: column count, artwork search
 * and add-by-URL. An empty grid is removed when the editor clicks away.
 */
export class ArtworkGridControls extends Component<Props> {
  componentWillUnmount = () => {
    const { editSection, removeSectionAction, sectionIndex } = this.props

    if (!this.getArtworks().length) {
      removeSectionAction(sectionIndex)
    }
    return editSection
  }

  getArtworks = (): ArtworkGridArtwork[] => {
    return this.props.editSection.artworks || []
  }

  /**
   * Resolves to the denormalized artwork, or null when Gravity rejects the
   * id. Returning null (rather than throwing) keeps Autocomplete's async
   * onSelect path from rejecting; callers filter nulls out.
   */
  fetchArtwork = async (id: string) => {
    const { logErrorAction } = this.props

    try {
      return await fetchDenormalizedArtwork(id)
    } catch (err) {
      logErrorAction({ message: "Artwork not found." })
      return null
    }
  }

  /** Autocomplete hands back the whole item list, including the new pick. */
  onSelectArtworks = (artworks: Array<ArtworkGridArtwork | null>) => {
    const { onChangeSectionAction } = this.props
    const valid = artworks.filter(
      artwork => artwork && artwork.type === "artwork"
    )

    onChangeSectionAction("artworks", valid)
  }

  /** Add-by-URL appends a single artwork, skipping duplicates. */
  addArtwork = (artwork: ArtworkGridArtwork | null) => {
    const { onChangeSectionAction } = this.props
    const artworks = this.getArtworks()

    if (!artwork || artworks.some(existing => existing.id === artwork.id)) {
      return
    }
    onChangeSectionAction("artworks", artworks.concat(artwork))
  }

  setColumns = (columns: ArtworkGridColumns) => {
    this.props.onChangeSectionAction("columns", columns)
  }

  render() {
    const { editSection } = this.props
    const artworks = this.getArtworks()
    const columns = editSection.columns || DEFAULT_COLUMNS

    return (
      <SectionControls
        showLayouts={false}
        isHero={false}
        disabledAlert={() => undefined}
      >
        <Box>
          <Flex alignItems="center" pt={1}>
            <FormLabel color="white">Columns</FormLabel>
            <Flex pl={2}>
              {COLUMN_OPTIONS.map(option => (
                <ColumnButton
                  key={option}
                  data-columns={option}
                  isActive={columns === option}
                  onClick={() => this.setColumns(option)}
                >
                  {option}
                </ColumnButton>
              ))}
            </Flex>
          </Flex>

          <ArtworkInputs pt={1}>
            <Col xs={6} pr={1}>
              <Autocomplete
                filter={filterArtworkSearchResults}
                formatSelected={item => this.fetchArtwork(item._id)}
                items={artworks as any[]}
                onSelect={this.onSelectArtworks}
                placeholder="Search artworks by title..."
                url={`${sd.ARTSY_URL}/api/search?q=%QUERY`}
              />
            </Col>
            <Col xs={6} pl={1} pt={1}>
              <InputArtworkUrl
                addArtwork={this.addArtwork}
                fetchArtwork={this.fetchArtwork}
                disabled={false}
              />
            </Col>
          </ArtworkInputs>
        </Box>
      </SectionControls>
    )
  }
}

const mapStateToProps = state => ({
  editSection: state.edit.section,
  sectionIndex: state.edit.sectionIndex,
})

const mapDispatchToProps = {
  logErrorAction: logError,
  onChangeSectionAction: onChangeSection,
  removeSectionAction: removeSection,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArtworkGridControls)

export const ColumnButton = styled.a<{ isActive: boolean }>`
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 38px;
  margin-right: 10px;
  text-align: center;
  color: white;
  border: 1px solid ${props => (props.isActive ? "white" : "transparent")};
  opacity: ${props => (props.isActive ? 1 : 0.5)};
  cursor: pointer;
  transition: opacity 0.3s;

  &:hover {
    opacity: 1;
  }
`

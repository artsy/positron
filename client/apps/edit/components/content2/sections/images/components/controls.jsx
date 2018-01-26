import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { clone } from 'lodash'
import { connect } from 'react-redux'
import { data as sd } from 'sharify'
import { Row, Col } from 'react-styled-flexboxgrid'
import Artwork from '/client/models/artwork.coffee'
import FileInput from '/client/components/file_input'
import SectionControls from '../../../section_controls'
import {
  logError,
  onChangeSection,
  removeSection
} from 'client/actions/editActions'
import { Autocomplete } from '/client/components/autocomplete2'
import { InputArtworkUrl } from './input_artwork_url'

export class ImagesControls extends Component {
  static propTypes = {
    isHero: PropTypes.bool,
    logErrorAction: PropTypes.func,
    onChange: PropTypes.func,
    removeSectionAction: PropTypes.func,
    section: PropTypes.object.isRequired,
    sectionIndex: PropTypes.number,
    setProgress: PropTypes.func
  }

  componentWillUnmount = () => {
    const {
      removeSectionAction,
      section,
      sectionIndex
    } = this.props

    if (!section.images.length) {
      removeSectionAction(sectionIndex)
    }
  }

  filterAutocomplete = (items) => {
    return items._embedded.results.map((item) => {
      const { type } = item

      if (type && type.toLowerCase() === 'artwork') {
        const { title, _links } = item
        const { thumbnail, self } = _links
        const _id = self.href.substr(self.href.lastIndexOf('/') + 1)
        const thumbnail_image = thumbnail && thumbnail.href

        return {
          _id,
          title,
          thumbnail_image,
          type
        }
      } else {
        return false
      }
    })
  }

  fetchDenormalizedArtwork = async (id) => {
    const { logErrorAction } = this.props

    try {
      const artwork = await new Artwork({ id }).fetch()
      return new Artwork(artwork).denormalized()
    } catch (err) {
      logErrorAction({message: 'Artwork not found.'})
      return err
    }
  }

  onNewImage = (image) => {
    const { section, onChange } = this.props
    const newImages = clone(section.images).concat(image)

    onChange('images', newImages)
  }

  onUpload = (image, width, height) => {
    this.onNewImage({
      url: image,
      type: 'image',
      width: width,
      height: height,
      caption: ''
    })
  }

  inputsAreDisabled = () => {
    const { section } = this.props
    return section.layout === 'fillwidth' && section.images.length > 0
  }

  fillWidthAlert = () => {
    const { logErrorAction } = this.props
    const message = 'Fullscreen layouts accept one asset, please remove extra images or use another layout.'

    logErrorAction({ message })
  }

  render () {
    const {
      isHero,
      onChange,
      section,
      setProgress
    } = this.props

    const inputsAreDisabled = this.inputsAreDisabled()

    return (
        <SectionControls
          showLayouts={!isHero}
          isHero={isHero}
          disabledAlert={this.fillWidthAlert}
        >
          <div onClick={inputsAreDisabled ? this.fillWidthAlert : undefined}>
            <FileInput
              disabled={inputsAreDisabled}
              onProgress={setProgress}
              onUpload={this.onUpload}
            />
          </div>

          { !isHero &&
            <Row
              className='edit-controls__artwork-inputs'
              onClick={inputsAreDisabled ? this.fillWidthAlert : undefined}
            >
              <Col xs={6}>
                <Autocomplete
                  autoFocus
                  disabled={inputsAreDisabled}
                  filter={this.filterAutocomplete}
                  formatSelected={(item) => this.fetchDenormalizedArtwork(item._id)}
                  items={section.images || []}
                  onSelect={(images) => onChange('images', images)}
                  placeholder='Search artworks by title...'
                  url={`${sd.ARTSY_URL}/api/search?q=%QUERY`}
                />
              </Col>
              <Col xs={6}>
                <InputArtworkUrl
                  addArtwork={this.onNewImage}
                  fetchArtwork={this.fetchDenormalizedArtwork}
                />
              </Col>
            </Row>
          }

        { section.type === 'image_set' &&
          <Row className='edit-controls__image-set-inputs'>
            <Col xs={6}>
              <input
                ref='title'
                className='bordered-input bordered-input-dark'
                defaultValue={section.title}
                onChange={(e) => {
                  onChange('title', e.target.value)
                }}
                placeholder='Image Set Title (optional)'
              />
            </Col>
            <Col xs={6} className='inputs'>
              <label>Entry Point:</label>
              <div className='layout-inputs'>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => onChange('layout', 'mini')}
                    data-active={section.layout !== 'full'}
                  />
                  Mini
                </div>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => onChange('layout', 'full')}
                    data-active={section.layout === 'full'}
                  />
                  Full
                </div>
              </div>
            </Col>
          </Row>
        }
      </SectionControls>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  section: state.edit.section,
  sectionIndex: state.edit.sectionIndex
})

const mapDispatchToProps = {
  logErrorAction: logError,
  onChange: onChangeSection,
  removeSectionAction: removeSection
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImagesControls)

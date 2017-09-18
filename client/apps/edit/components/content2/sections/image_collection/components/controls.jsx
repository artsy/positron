import React, { Component } from 'react'
const gemup = require('gemup')
const sd = require('sharify').data
import { defer } from 'lodash'
import Artwork from '/client/models/artwork.coffee'
import Autocomplete from '/client/components/autocomplete/index.coffee'
import FileInput from '/client/components/file_input/index.jsx'
import SectionControls from '../../../section_controls/index.jsx'
import UrlArtworkInput from './url_artwork_input.coffee'

export default class Controls extends Component {
  constructor (props) {
    super(props)
  }

  componentDidMount() {
    this.setupAutocomplete()
  }

  componentWillUnmount() {
    this.autocomplete.remove()
  }

  addArtworkFromUrl = (images) => {
    this.props.section.set('images', images)
    this.props.onChange()
  }

  setupAutocomplete() {
    const $el = $(this.refs.autocomplete)
    this.autocomplete = new Autocomplete({
      url: `${sd.ARTSY_URL}/api/search?q=%QUERY`,
      el: $el,
      filter(res) {
        const vals = []
        for (let r of Array.from(res._embedded.results)) {
          if ((r.type != null ? r.type.toLowerCase() : undefined) === 'artwork') {
            const id = r._links.self.href.substr(r._links.self.href.lastIndexOf('/') + 1)
            vals.push({
              id,
              value: r.title,
              thumbnail: (r._links.thumbnail != null ? r._links.thumbnail.href : null)
            })
          }
        }
        return vals
      },
      templates: {
        suggestion(data) {
          return `<div class='autocomplete-suggestion' style='background-image: url(${data.thumbnail})'></div>${data.value}`
        }
      },
      selected: this.onSelectArtwork
    })
    return defer(() => $el.focus())
  }

  onSelectArtwork = (e, selected) => {
    new Artwork({id: selected.id}).fetch({
      success: artwork => {
        const newImages = this.props.images.concat([artwork.denormalized()])
        this.props.section.set('images', newImages)
        $(this.refs.autocomplete).val('').focus()
        this.props.onChange()
      }
    })
  }

  onUpload = (image, width, height) => {
    const newImages = this.props.images.concat({
      url: image,
      type: 'image',
      width: width,
      height: height,
      caption: ''
    })
    this.props.section.set('images', newImages)
  }

  onChangeImageSetTitle = (e) => {
    this.props.section.set('title', e.target.value)
  }

  toggleImagesetLayout = (layout) => {
    this.props.section.set('layout', layout)
  }

  inputsAreDisabled(section) {
    return section.get('layout') === 'fillwidth' && section.get('images').length > 0
  }

  fillwidthAlert() {
    alert('Fullscreen layouts accept one asset, please remove extra images.')
  }

  render() {
    const { article, channel, images, section, setProgress, onChange } = this.props
    const inputsAreDisabled = this.inputsAreDisabled(section)

    return (
        <SectionControls
          section={section}
          channel={channel}
          articleLayout={article.get('layout')}
          onChange={onChange}
          sectionLayouts={true}
          disabledAlert={this.fillwidthAlert}>

          <div onClick={inputsAreDisabled && this.fillwidthAlert}>
            <FileInput
              disabled={inputsAreDisabled}
              onProgress={setProgress}
              onUpload={this.onUpload} />
          </div>

          <section
            className='edit-controls__artwork-inputs'
            onClick={inputsAreDisabled && this.fillwidthAlert}>
            <div className='edit-controls__autocomplete-input'>
              <input
                ref='autocomplete'
                className='bordered-input bordered-input-dark'
                placeholder='Search for artwork by title'
                disabled={inputsAreDisabled} />
            </div>
            <UrlArtworkInput
              images={images}
              addArtworkFromUrl={this.addArtworkFromUrl}
              disabled={inputsAreDisabled} />
          </section>

        { section.get('type') === 'image_set' &&
          <section
            className='edit-controls__image-set-inputs'>
            <input
              ref='title'
              className='bordered-input bordered-input-dark'
              defaultValue={this.props.section.get('title')}
              onChange={this.onChangeImageSetTitle}
              placeholder='Image Set Title (optional)' />

            <div className='inputs'>
              <label>Entry Point:</label>
              <div className='layout-inputs'>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => this.toggleImagesetLayout('mini')}
                    data-active={section.get('layout') !== 'full'} >
                  </div>
                  Mini
                </div>
                <div className='input-group'>
                  <div
                    className='radio-input'
                    onClick={() => this.toggleImagesetLayout('full')}
                    data-active={section.get('layout') === 'full'} >
                  </div>
                  Full
                </div>
              </div>
            </div>
          </section>
        }
      </SectionControls>
    )
  }
}

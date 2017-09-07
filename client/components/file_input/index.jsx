import React, { Component } from 'react'
const gemup = require('gemup')
const sd = require('sharify').data

export default class FileInput extends Component {
  constructor (props) {
    super(props)
  }

  getSizeLimit() {
    if (this.props.sizeLimit) {
      return this.props.sizeLimit * 1000000
    } else {
      return 30000000
    }
  }

  getSizeError() {
    const size = this.props.sizeLimit ? this.props.sizeLimit.toString() : '30'
    return 'Error: Size limit is ' + size + 'MB, selected file is too large.'
  }

  uploadFile = (e) => {
    if (e.target.files[0].size > this.getSizeLimit()) {
      return alert(this.getSizeError())
    }
    gemup(e.target.files[0], {
      app: sd.GEMINI_APP,
      key: sd.GEMINI_KEY,
      progress: percent => {
        this.props.onProgress(percent)
      },
      add: src => {
        this.props.onProgress(0.1)
      },
      fail: err => {
        console.log(err)
      },
      done: src => {
        const image = new Image()
        image.src = src
        image.onload = () => {
          this.props.onUpload(src, image.width, image.height)
          this.props.onProgress(null)
        }
      }
    })
  }

  getAccepted() {
    const accept = ['.jpg', '.jpeg', '.png', '.gif']
    if (this.props.video) {
      accept.push('.mp4')
    }
    return accept.toString()
  }

  renderUploadPrompt() {
    if (this.props.prompt) {
      return (
        <h1>{this.props.prompt}</h1>
      )
    } else {
      return (
        <h1>
          <span>Drag & </span>
          <span className='file-input__upload-container-drop'>Drop</span>
          <span> or </span>
          <span className='file-input__upload-container-click'>Click</span>
          <span> to {this.props.hasImage ? 'Replace' : 'Upload'}</span>
        </h1>
      )
    }
  }

  render() {
    const { label, hasImage, sizeLimit, type } = this.props
    const typeClass = type ? ' ' + type : ''
    return (
      <div className={'file-input' + typeClass}>
        {label && <h2>{label}</h2>}
        <div className='file-input__upload-container'>
          {this.renderUploadPrompt()}
          <h2>Up to {sizeLimit ? sizeLimit.toString() : '30'}MB</h2>
          <input type='file' onChange={this.uploadFile} accept={this.getAccepted()} />
        </div>
      </div>
    )
  }
}

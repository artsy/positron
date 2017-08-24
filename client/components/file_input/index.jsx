import React, { Component } from 'react'
const gemup = require('gemup')
const sd = require('sharify').data

export default class FileInput extends Component {
  constructor (props) {
    super(props)
    this.uploadFile = this.uploadFile.bind(this)
  }

  uploadFile (e) {
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
        alert(err)
      },
      done: src => {
        const image = new Image()
        image.src = src
        image.onload = () => {
          this.props.onUpload(src)
          this.props.onProgress(null)
        }
      }
    })
  }

  getAccepted () {
    const accept = ['.jpg', '.jpeg', '.png', '.gif']
    if (this.props.video) {
      accept.push('.mp4')
    }
    return accept.toString()
  }

  render () {
    return (
      <div className='file-input'>
        {this.props.label && <h2>{this.props.label}</h2>}
        <div className='file-input__upload-container'>
          <h1>
            <span>Drag & </span>
            <span className='file-input__upload-container-drop'>Drop</span>
            <span> or </span>
            <span className='file-input__upload-container-click'>Click</span>
            <span> to {this.props.hasImage ? 'Replace' : 'Upload'}</span>
          </h1>
          <h2>Up to 30mb</h2>
          <input type='file' onChange={this.uploadFile} accept={this.getAccepted()} />
        </div>
      </div>
    );
  }
}

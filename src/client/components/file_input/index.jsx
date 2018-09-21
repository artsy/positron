import PropTypes from "prop-types"
import React, { Component } from "react"
const gemup = require("gemup")
const sd = require("sharify").data

export default class FileInput extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    hasImage: PropTypes.any,
    label: PropTypes.string,
    onProgress: PropTypes.func,
    onUpload: PropTypes.func,
    prompt: PropTypes.string,
    sizeLimit: PropTypes.number,
    type: PropTypes.string,
    video: PropTypes.bool,
  }

  getSizeLimit() {
    if (this.props.sizeLimit) {
      return this.props.sizeLimit * 1000000
    } else {
      return 30000000
    }
  }

  getSizeError() {
    const size = this.props.sizeLimit ? this.props.sizeLimit.toString() : "30"
    return "Error: Size limit is " + size + "MB, selected file is too large."
  }

  uploadFile = e => {
    const { onProgress, onUpload } = this.props

    if (e.target.files[0].size > this.getSizeLimit()) {
      return alert(this.getSizeError())
    }
    gemup(e.target.files[0], {
      app: sd.GEMINI_APP,
      key: sd.GEMINI_KEY,
      progress: percent => {
        onProgress(percent)
      },
      add: src => {
        onProgress(0.1)
      },
      fail: err => {
        console.log(err)
      },
      done: src => {
        if (src.match(".mp4")) {
          onUpload(src)
          onProgress(null)
        } else {
          const image = new Image()
          image.src = src
          image.onload = () => {
            onUpload(src, image.width, image.height)
            onProgress(null)
          }
        }
      },
    })
  }

  getAccepted() {
    const accept = [".jpg", ".jpeg", ".png", ".gif"]
    if (this.props.video) {
      accept.push(".mp4")
    }
    return accept.toString()
  }

  renderUploadPrompt() {
    const { hasImage, prompt } = this.props

    if (prompt) {
      return <h1>{prompt}</h1>
    } else {
      return (
        <h1>
          <span>Drag & </span>
          <span className="file-input__upload-container-drop">Drop</span>
          <span> or </span>
          <span className="file-input__upload-container-click">Click</span>
          <span> to {hasImage ? "Replace" : "Upload"}</span>
        </h1>
      )
    }
  }

  render() {
    const { label, sizeLimit, type, disabled } = this.props
    const typeClass = type ? " " + type : ""
    const disabledClass = disabled ? " disabled" : ""
    return (
      <div className={"file-input" + typeClass + disabledClass}>
        {label && <h2>{label}</h2>}
        <div className="file-input__upload-container">
          {this.renderUploadPrompt()}
          <h2>
            Up to {sizeLimit ? sizeLimit.toString() : "30"}
            MB
          </h2>
          <input
            type="file"
            onChange={this.uploadFile}
            accept={this.getAccepted()}
          />
        </div>
      </div>
    )
  }
}

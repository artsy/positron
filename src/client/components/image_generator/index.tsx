import React, { Component } from 'react'
import gemup from 'gemup'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { data as sd } from 'sharify'

interface State {
  text: string
}

interface Props {
  onChangeArticleAction: any
}

export class ImageGenerator extends Component<Props, State> {
  onChange = (text) => {
    this.setState({ text })
  }

  onClick = async () => {
    const { text } = this.state

    const canvas = document.getElementById('canvas')
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.font = '30px Helvetica'
      ctx.fillStyle = 'black'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = 'white'
      ctx.fillText(text, 10, 50)
      const newImage = canvas.toDataURL('image/png')

      // Create blob and upload to s3
      const blob = await (await fetch(newImage)).blob()
      this.upload(blob)
    }
  }

  upload = (image) => {
    const { onChangeArticleAction } = this.props

    gemup(image, {
      app: sd.GEMINI_APP,
      key: sd.GEMINI_KEY,
      done: (src) => {
        onChangeArticleAction('thumbnail_image', src)
      }
    })
  }

  render () {
    return (
      <Row>

        <Col xs={6} className='field-group'>
          <label>Image Text</label>
          <textarea
            className='bordered-input'
            onChange={(e) => this.onChange(e.target.value)}
            placeholder='Custom Headline'
          />
          <Canvas
            id='canvas'
            width='600px'
            height='400px'
          />
          <button
            onClick={this.onClick}
          >Save New Image</button>
        </Col>

      </Row>
    )
  }
}

const Canvas = styled.canvas`
  border: 1px solid black;
  display: none;
`

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageGenerator)

import gemup from "@artsy/gemup"
import { Box, Button, TextArea } from "@artsy/palette"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { FormLabel } from "client/components/form_label"
import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import { data as sd } from "sharify"
import styled from "styled-components"

interface State {
  text: string
}

interface Props {
  article: any
  onChangeArticleAction: any
}

export class ImageGenerator extends Component<Props, State> {
  state = {
    text: this.props.article.thumbnail_title || "",
  }

  onChange = text => {
    this.setState({ text })
  }

  onClick = async () => {
    const { article } = this.props
    const { text } = this.state

    const canvas: any = document.getElementById("canvas")

    if (canvas) {
      const ctx = canvas.getContext("2d")
      const dateString = article.published_at || article.scheduled_publish_at
      const date = (dateString ? moment(dateString) : moment()).format("MMM DD")

      // Generate thumbnail on canvas
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "white"
      ctx.font = '32px "Unica77LLWebMedium"'
      ctx.fillText("News", 120, 62)
      ctx.fillText(date, 490, 62)
      ctx.font = '50px "Adobe Garamond W08"'
      this.wrapText(ctx, text, 120, 130, 840, 50)

      // Create image blob and upload to s3
      const newImage = canvas.toDataURL("image/png")
      const blob = await (await fetch(newImage)).blob()
      this.upload(blob)
    }
  }

  // Originally from https://codepen.io/bramus/pen/eZYqoO
  wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ")
    let line = ""

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " "
      const metrics = ctx.measureText(testLine)
      const testWidth = metrics.width
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y)
        line = words[n] + " "
        y += lineHeight
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, x, y)
  }

  upload = image => {
    const { onChangeArticleAction } = this.props

    gemup(image, {
      app: sd.GEMINI_APP,
      done: src => {
        onChangeArticleAction("thumbnail_image", src)
      },
    })
  }

  render() {
    const { text } = this.state

    return (
      <Box>
        <FormLabel>Image Text</FormLabel>
        <Box mt={1}>
          <TextArea
            onChange={e => this.onChange(e.value)}
            placeholder="Start Typing..."
            defaultValue={text}
          />
          <Canvas id="canvas" width="1080px" height="470px" />
          <Button variant="secondaryOutline" onClick={this.onClick}>
            Generate New Image
          </Button>
        </Box>
      </Box>
    )
  }
}

const Canvas = styled.canvas`
  display: none;
`

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImageGenerator)

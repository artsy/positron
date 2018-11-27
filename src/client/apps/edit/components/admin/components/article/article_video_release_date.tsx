import { Flex } from "@artsy/palette"
import colors from "@artsy/reaction/dist/Assets/Colors"
import { clone } from "lodash"
import moment from "moment"
import React, { Component } from "react"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import styled from "styled-components"
import { ButtonMedium } from "./button_medium"

interface ArticleReleaseDateProps {
  article: ArticleData
  onChangeArticleAction: any
}

interface ArticleReleaseDateState {
  hasChanged: boolean
  releaseDate?: string
}

export class ArticleVideoReleaseDate extends Component<
  ArticleReleaseDateProps,
  ArticleReleaseDateState
> {
  constructor(props) {
    super(props)

    const { article } = props

    this.state = {
      hasChanged: false,
      releaseDate:
        article && article.media
          ? moment(article.media.release_date).toISOString()
          : undefined,
    }
  }

  onMediaChange = (key, value) => {
    const { article, onChangeArticleAction } = this.props
    const media = clone(article.media) || {}

    media[key] = value
    onChangeArticleAction("media", media)
  }

  onMediaReleaseChange = () => {
    this.setState({ hasChanged: false }, () => {
      this.onMediaChange("release_date", this.state.releaseDate)
    })
  }

  onDateChange = event => {
    const date = moment(event.target.value).toISOString()

    this.setState({ hasChanged: true, releaseDate: date })
  }

  render() {
    const { hasChanged, releaseDate } = this.state

    return (
      <div className="field-group">
        <label>Video Release Date</label>

        <Container>
          <Input
            type="date"
            className="bordered-input"
            defaultValue={moment(releaseDate).format("YYYY-MM-DD")}
            onChange={this.onDateChange}
          />

          <ButtonMedium
            background={hasChanged ? colors.redMedium : undefined}
            onClick={this.onMediaReleaseChange}
          >
            Update
          </ButtonMedium>
        </Container>
      </div>
    )
  }
}

const Container = styled(Flex)`
  margin-top: 5px;

  button {
    flex: 1;
  }
`

const Input = styled.input`
  width: 326px !important;
  margin-right: 20px;
  margin-top: 0 !important;
`

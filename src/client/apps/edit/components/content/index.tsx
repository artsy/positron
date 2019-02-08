import { color } from "@artsy/palette"
import {
  ArticleData,
  ArticleLayout,
} from "@artsy/reaction/dist/Components/Publishing/Typings"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import EditArticle from "./article_layouts/article"
import EditNews from "./article_layouts/news"
import EditSeries from "./article_layouts/series"
import EditVideo from "./article_layouts/video"

interface EditContentProps {
  article: ArticleData
}

export class EditContent extends Component<EditContentProps> {
  getArticleLayout = () => {
    const { article } = this.props

    switch (article.layout) {
      case "series": {
        return <EditSeries />
      }
      case "video": {
        return <EditVideo />
      }
      case "news": {
        return <EditNews />
      }
      default: {
        return <EditArticle />
      }
    }
  }

  render() {
    const { article } = this.props

    return (
      <EditContentContainer layout={article.layout || "standard"}>
        {this.getArticleLayout()}
      </EditContentContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

export default connect(mapStateToProps)(EditContent)

const EditContentContainer = styled.div<{ layout: ArticleLayout }>`
  padding: 95px 0;
  min-height: 100vh;

  ${props =>
    (props.layout === "video" || props.layout === "series") &&
    `
    border-left: 1px solid ${color("black30")};
    padding-bottom: 0;

    .loading-spinner {
      background: white;
    }

    .TextNav {
      background: white;
      ::after {
        border-top-color: white;
      }
    }
  `};
`

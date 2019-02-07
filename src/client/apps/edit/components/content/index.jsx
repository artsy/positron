import { connect } from "react-redux"
import PropTypes from "prop-types"
import React, { Component } from "react"
import EditArticle from "./article_layouts/article"
import EditNews from "./article_layouts/news"
import EditSeries from "./article_layouts/series"
import EditVideo from "./article_layouts/video"
import styled from "styled-components"
import { color } from "@artsy/palette"

export class EditContent extends Component {
  static propTypes = {
    article: PropTypes.object,
  }

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
      <EditContentContainer layout={article.layout}>
        {this.getArticleLayout()}
      </EditContentContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

export default connect(mapStateToProps)(EditContent)

const EditContentContainer = styled.div`
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

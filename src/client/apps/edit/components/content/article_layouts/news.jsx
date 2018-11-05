import { connect } from "react-redux"
import PropTypes from "prop-types"
import styled from "styled-components"
import React, { Component } from "react"
import { NewsHeadline } from "@artsy/reaction/dist/Components/Publishing/News/NewsHeadline"
import { NewsByline } from "@artsy/reaction/dist/Components/Publishing/Byline/NewsByline"
import SectionList from "../section_list"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { EditSourceControls } from "../sections/news/EditSourceControls"
import { hot } from "react-hot-loader"

export class EditNews extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired,
  }

  state = {
    isEditSourceOpen: false,
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(key, value) => onChangeArticleAction("title", value)}
        placeholder="Title"
        name="title"
      />
    )
  }

  editSource = () => {
    const { article } = this.props
    const { isEditSourceOpen } = this.state
    const { title } = article.news_source

    return (
      <AddSource
        onClick={() => {
          this.setState({ isEditSourceOpen: !isEditSourceOpen })
        }}
      >
        {title && title.length ? title : "Add Source"}
      </AddSource>
    )
  }

  saveSource = source => {
    const { onChangeArticleAction } = this.props
    this.setState({ isEditSourceOpen: false })
    if (source) {
      onChangeArticleAction("news_source", source)
    }
  }

  render() {
    const { article } = this.props

    return (
      <EditNewsContainer>
        <NewsHeadline article={article} editTitle={this.editTitle()} />
        <SectionList />

        <NewsByline article={article} editSource={this.editSource()} />
        {this.state.isEditSourceOpen && (
          <EditSourceControls
            source={article.news_source}
            onApply={this.saveSource}
          />
        )}
      </EditNewsContainer>
    )
  }
}

const mapStateToProps = state => ({
  article: state.edit.article,
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle,
}

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(EditNews)
)

const EditNewsContainer = styled.div`
  max-width: 820px;
  margin: 40px auto;

  .SectionText {
    max-width: 680px;
  }
  div[class*="NewsByline__NewsBylineContainer"] {
    padding: 0 20px;
  }
`

export const AddSource = styled.div`
  text-decoration: underline;
`

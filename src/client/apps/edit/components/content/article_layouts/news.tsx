import { NewsByline } from "@artsy/reaction/dist/Components/Publishing/Byline/NewsByline"
import { NewsHeadline } from "@artsy/reaction/dist/Components/Publishing/News/NewsHeadline"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { onChangeArticle } from "client/actions/edit/articleActions"
import { EditSourceControls } from "client/apps/edit/components/content/sections/news/EditSourceControls"
import { PlainText } from "client/components/draft/plain_text/plain_text"
import React, { Component } from "react"
import { hot } from "react-hot-loader"
import { connect } from "react-redux"
import styled from "styled-components"
import SectionList from "../section_list"

interface EditNewsProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
}

interface EditNewsState {
  isEditSourceOpen: boolean
}

export class EditNews extends Component<EditNewsProps, EditNewsState> {
  state = {
    isEditSourceOpen: false,
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={val => onChangeArticleAction("title", val)}
        placeholder="Title"
      />
    )
  }

  editSource = () => {
    const { article } = this.props
    const { isEditSourceOpen } = this.state
    const title = article.news_source && article.news_source.title

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
            source={article.news_source as any}
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

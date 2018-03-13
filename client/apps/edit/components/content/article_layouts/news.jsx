import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React, { Component } from 'react'
import { NewsHeadline } from '@artsy/reaction/dist/Components/Publishing/News/NewsHeadline'
import { NewsByline } from '@artsy/reaction/dist/Components/Publishing/Byline/NewsByline'
import SectionList from '../section_list'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { onChangeArticle } from 'client/actions/editActions'

export class EditNews extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired
  }

  editTitle = () => {
    const { article, onChangeArticleAction } = this.props

    return (
      <PlainText
        content={article.title}
        onChange={(key, value) => onChangeArticleAction('title', value)}
        placeholder='Title'
        name='title'
      />
    )
  }

  render () {
    const { article } = this.props

    return (
      <EditNewsContainer>

        <NewsHeadline
          article={article}
          editTitle={this.editTitle()}
        />
        <SectionList />

        <NewsByline article={article} />

      </EditNewsContainer>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditNews)

const EditNewsContainer = styled.div`
  max-width: 780px;
  margin: 40px auto;

  .SectionText {
    max-width: 680px;
  }

  .SectionContainer {
    padding: 20px 0;
  }
`

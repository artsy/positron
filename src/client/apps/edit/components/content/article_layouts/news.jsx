import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React, { Component } from 'react'
import { NewsHeadline } from '@artsy/reaction/dist/Components/Publishing/News/NewsHeadline'
import { NewsByline } from '@artsy/reaction/dist/Components/Publishing/Byline/NewsByline'
import { borderedInput } from '@artsy/reaction/dist/Components/Mixins'
import SectionList from '../section_list'
import { PlainText } from '/client/components/rich_text/components/plain_text'
import { onChangeArticle } from 'client/actions/editActions'

class EditSourceControls extends Component {
  render() {
    return (
      <EditSourceContainer>
        <EditSourceInput
          placeholder={"Enter source name"}
        />
        <EditSourceInput
          placeholder={"Paste or type a link"}
        />
      </EditSourceContainer>
    )
  }
}

const EditSourceContainer = styled.div`
  background-color: black;
  width: 300px;
  margin-left: 20px;
  margin-top: 20px;
`

const EditSourceInput = styled.input`
  margin: 10px;
  width: 90%;
  ${borderedInput}
  height: 30px;
`

export class EditNews extends Component {
  static propTypes = {
    article: PropTypes.object.isRequired,
    onChangeArticleAction: PropTypes.func.isRequired
  }

  state = {
    isEditSourceOpen: false
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

  editSource = () => {
    const { article, onChangeArticleAction } = this.props
    const { isEditSourceOpen } = this.state
 
    return (
      <AddSource onClick={() => { this.setState({ isEditSourceOpen: !isEditSourceOpen })}}>
        Add Source
      </AddSource>
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

        <NewsByline article={article} editSource={this.editSource()}/>
        { this.state.isEditSourceOpen && <EditSourceControls /> }
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
  max-width: 820px;
  margin: 40px auto;

  .SectionText {
    max-width: 680px;
  }
  div[class*='NewsByline__NewsBylineContainer'] {
    padding: 0 20px;
  }
`

const AddSource = styled.div`
  text-decoration: underline;
`

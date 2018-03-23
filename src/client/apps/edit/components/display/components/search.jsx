import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Col, Row } from 'react-styled-flexboxgrid'
import { onChangeArticle } from 'client/actions/editActions'
import { CharacterLimit } from 'client/components/character_limit'
import { SearchPreview } from './preview/search_preview'

export class DisplaySearch extends Component {
  static propTypes = {
    article: PropTypes.object,
    forceURL: PropTypes.string,
    onChangeArticleAction: PropTypes.func
  }

  render () {
    const { article, forceURL, onChangeArticleAction } = this.props
    const { search_description, search_title } = article

    return (
      <Row className='DisplaySearch'>

        <Col xs={4}>
          <div className='field-group'>
            <CharacterLimit
              label='Search Headline'
              limit={97}
              type='textarea'
              onChange={(value) => onChangeArticleAction('search_title', value)}
              defaultValue={search_title}
            />
          </div>

          <div className='field-group'>
            <CharacterLimit
              label='Search Description'
              limit={160}
              type='textarea'
              onChange={(value) => onChangeArticleAction('search_description', value)}
              defaultValue={search_description}
            />
          </div>
        </Col>

        <Col xs={8}>
          <SearchPreview
            article={article}
            forceURL={forceURL}
          />
        </Col>
      </Row>
    )
  }
}

const mapStateToProps = (state) => ({
  article: state.edit.article,
  forceURL: state.app.forceURL
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DisplaySearch)

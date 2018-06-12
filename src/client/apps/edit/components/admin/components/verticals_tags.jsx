import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { connect } from 'react-redux'
import { filter, map } from 'lodash'
import Verticals from '../../../../../collections/verticals.coffee'
import { AutocompleteInlineList } from '/client/components/autocomplete2/inline_list'
import { onChangeArticle } from 'client/actions/edit/articleActions'

export class AdminVerticalsTags extends Component {
  static propTypes = {
    apiURL: PropTypes.string,
    article: PropTypes.object,
    onChangeArticleAction: PropTypes.func
  }

  state = {
    vertical: this.props.article.vertical || null,
    verticals: []
  }

  componentWillMount = () => {
    this.fetchVerticals()
  }

  fetchVerticals = () => {
    new Verticals().fetch({
      cache: true,
      success: (res) => {
        const verticals = map(res.sortBy('name'), 'attributes')
        this.maybeSetupNews(verticals)
        this.setState({ verticals })
      }
    })
  }

  maybeSetupNews = (verticals) => {
    const { article, onChangeArticleAction } = this.props

    if (article.layout === 'news' && !article.vertical) {
      const vertical = filter(verticals, ['name', 'News'])[0]
      onChangeArticleAction('vertical', vertical)
    }
  }

  renderVerticalsList = () => {
    const { verticals } = this.state
    const { article, onChangeArticleAction } = this.props
    const name = article.vertical && article.vertical.name

    return verticals.map((item, index) => {
      const isActive = name && item.name === name
      const activeClass = isActive ? 'avant-garde-button-black' : ''

      return (
        <button
          key={index}
          className={`avant-garde-button ${activeClass}`}
          data-active={isActive}
          onClick={() => {
            const vertical = isActive ? null : item
            onChangeArticleAction('vertical', vertical)
          }}
        >
          {item.name}
        </button>
      )
    })
  }

  render () {
    const { apiURL, article, onChangeArticleAction } = this.props

    return (
      <Row className='AdminVerticalsTags'>

        <Col xs={6} className='field-group verticals'>
          <label>Editorial Vertical</label>
          {this.renderVerticalsList()}
        </Col>

        <Col xs={6} className='field-group'>

          <div className='field-group tags'>
            <label>Topic Tags</label>
            <AutocompleteInlineList
              items={article.tags}
              filter={(tags) => {
                return tags.results.map((tag) => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={(tag) => tag.name}
              onSelect={(tags) => onChangeArticleAction('tags', tags)}
              placeholder='Start typing a topic tag...'
              url={`${apiURL}/tags?public=true&q=%QUERY`}
            />
          </div>

          <div className='field-group tracking-tags'>
            <label>Tracking Tags</label>
            <AutocompleteInlineList
              items={article.tracking_tags}
              filter={(tags) => {
                return tags.results.map((tag) => {
                  return { id: tag.id, name: tag.name }
                })
              }}
              formatSelected={(tag) => tag.name}
              onSelect={(tags) => onChangeArticleAction('tracking_tags', tags)}
              placeholder='Start typing a tracking tag...'
              url={`${apiURL}/tags?public=false&q=%QUERY`}
            />
          </div>
        </Col>

      </Row>
    )
  }
}

const mapStateToProps = (state) => ({
  apiURL: state.app.apiURL,
  article: state.edit.article
})

const mapDispatchToProps = {
  onChangeArticleAction: onChangeArticle
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminVerticalsTags)

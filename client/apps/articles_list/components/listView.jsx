import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/articlesActions'
import { data as sd } from 'sharify'

import $ from 'jquery'
import { debounce } from 'lodash'
import FilterSearch from 'client/components/filter_search/index.coffee'
import request from 'superagent'

require('jquery-on-infinite-scroll')
const query = require('../query.coffee')
const icons = () => require('../icons.jade')(...arguments)

export class ArticlesListView extends Component {
  static propTypes = {
    actions: PropTypes.object,
    articles: PropTypes.array,
    published: PropTypes.bool,
    channel: PropTypes.object
  }

  state = {
    articles: this.props.articles || [],
    published: this.props.published,
    offset: 0
  }

  componentDidMount () {
    const { viewArticles } = this.props.actions
    viewArticles()

    const canLoadMore = debounce(this.canLoadMore, 300)
    return $.onInfiniteScroll(canLoadMore)
  }

  canLoadMore = () => {
    if ($('.filter-search__input').val()) { return }
    $('.loading-spinner').fadeIn()
    return this.fetchFeed(this.state.published, this.state.offset + 10, this.appendMore.bind(this))
  }

  setResults = (results) => {
    return this.setState({articles: results})
  }

  setPublished (type) {
    this.setState({published: type, offset: 0})
    return this.fetchFeed(type, 0, this.setResults)
  }

  appendMore (results) {
    const articles = this.state.articles.concat(results)
    this.setState({articles})
    return $('.loading-spinner').fadeOut()
  }

  fetchFeed (type, offset, cb) {
    const feedQuery = query(`published: ${type}, offset: ${offset}, channel_id: "${sd.CURRENT_CHANNEL.id}"`)
    return request
      .post(sd.API_URL + '/graphql')
      .set('X-Access-Token', sd.USER != null ? sd.USER.access_token : undefined)
      .send({query: feedQuery})
      .end((err, res) => {
        if (err || !(res.body != null ? res.body.data : undefined)) { return }
        this.setState({offset: this.state.offset + 10})
        return cb(res.body.data.articles)
      })
  }

  showEmptyMessage () {
    return (
      <div className='article=list__empty'>
        <div>You haven’t written any articles yet.</div>
        <div>Artsy Writer is a tool for writing stories about art on Artsy.</div>
        <div>Get started by writing an article or reaching out to your liaison for help.</div>
        <a
          className='avant-garde-button avant-garde-button-black article-new-button'
          href='/articles/new'
          dangerouslySetInnerHTML={{ __html: $(icons()).filter('.new-article').html() + 'Write An Article' }}
        />
      </div>
    )
  }

  showArticlesList () {
    console.log(this.props.articles)
    if (this.props.articles && this.props.articles.length) {
      return (
        <div className='articles-list__container'>
          <div className='articles-list__title'>Latest Articles</div>
          <FilterSearch
            url={sd.API_URL + `/articles?published=${this.state.published}&channel_id=${sd.CURRENT_CHANNEL.id}&q=%QUERY`}
            placeholder='Search Articles...'
            collection={this.state.articles}
            searchResults={this.setResults}
            selected={null}
            contentType='article'
            checkable={false}
            isArtsyChannel={this.props.channel.isArtsyChannel()}
          />
        </div>
      )
    } else {
      return this.showEmptyMessage()
    }
  }

  render () {
    return (
      <div className='articles-list'>
        <h1 className='articles-list__header page-header'>
          <div className='max-width-container'>
            <nav className='nav-tabs'>
              <a className={`${this.state.published === true ? 'is-active' : ''} published`}
                onClick={() => this.setPublished(true)}>
                Published
              </a>
              <a className={`${this.state.published === false ? 'is-active' : ''} drafts`}
                onClick={() => this.setPublished(false)}>
                Drafts
              </a>
            </nav>
            <div className='channel-name'>
              {`${this.props.channel.get('name')}`}
            </div>
          </div>
        </h1>
        {this.showArticlesList()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticlesListView)

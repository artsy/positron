import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { viewArticles } from 'client/actions/articlesActions'
import request from 'superagent'
import $ from 'jquery'
import { debounce } from 'lodash'
import FilterSearch from 'client/components/filter_search/index.coffee'
import IconNewArticle from '../../../components/layout/public/icons/layout_new_article.svg'

require('jquery-on-infinite-scroll')
const query = require('../query.coffee')

export class ArticlesList extends Component {
  static propTypes = {
    articles: PropTypes.array,
    published: PropTypes.bool,
    channel: PropTypes.object,
    apiURL: PropTypes.string,
    user: PropTypes.object,
    viewArticlesAction: PropTypes.func
  }

  state = {
    articles: this.props.articles || [],
    published: this.props.published,
    offset: 0
  }

  componentDidMount () {
    const { channel, viewArticlesAction } = this.props
    viewArticlesAction(channel)

    const canLoadMore = debounce(this.canLoadMore, 300)
    $.onInfiniteScroll(canLoadMore)
  }

  canLoadMore = () => {
    // TODO: remove jQuery
    if ($('.filter-search__input').val()) { return }
    $('.loading-spinner').fadeIn()
    this.fetchFeed(this.state.published, this.state.offset + 10, this.appendMore.bind(this))
  }

  setResults = (results) => {
    this.setState({articles: results})
  }

  setPublished (type) {
    this.setState({published: type, offset: 0})
    this.fetchFeed(type, 0, this.setResults)
  }

  appendMore (results) {
    const articles = this.state.articles.concat(results)
    this.setState({articles})
    $('.loading-spinner').fadeOut()
  }

  fetchFeed (type, offset, cb) {
    const { channel, user, apiURL } = this.props
    const feedQuery = query(`published: ${type}, offset: ${offset}, channel_id: "${channel.id}"`)
    request
      .post(apiURL + '/graphql')
      .set('X-Access-Token', user != null ? user.access_token : undefined)
      .send({query: feedQuery})
      .end((err, res) => {
        if (err || !(res.body != null ? res.body.data : undefined)) { return }
        this.setState({offset: this.state.offset + 10})
        return cb(res.body.data.articles)
      })
  }

  showEmptyMessage () {
    return (
      <div className='article-list__empty'>
        <div>You haven’t written any articles yet.</div>
        <div>Artsy Writer is a tool for writing stories about art on Artsy.</div>
        <div>Get started by writing an article or reaching out to your liaison for help.</div>
        <a
          className='avant-garde-button avant-garde-button-black article-new-button'
          href='/articles/new'>
          <IconNewArticle /> Write An Article
        </a>
      </div>
    )
  }

  showArticlesList () {
    const { channel, apiURL } = this.props
    const isArtsyChannel = (type) => {
      return type in ['editorial', 'support', 'team']
    }

    //TODO: convert css to use styled-components
    if (this.props.articles && this.props.articles.length) {
      return (
        <div className='articles-list__container'>
          <div className='articles-list__title'>Latest Articles</div>
          <FilterSearch
            url={apiURL + `/articles?published=${this.state.published}&channel_id=${channel.id}&q=%QUERY`}
            placeholder='Search Articles...'
            collection={this.state.articles}
            searchResults={this.setResults}
            selected={null}
            contentType='article'
            checkable={false}
            isArtsyChannel={isArtsyChannel(channel.type)}
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
              {`${this.props.channel.name}`}
            </div>
          </div>
        </h1>
        {this.showArticlesList()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  channel: state.app.channel,
  apiURL: state.app.apiURL
})

const mapDispatchToProps = (dispatch) => ({
  viewArticlesAction: viewArticles
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticlesList)

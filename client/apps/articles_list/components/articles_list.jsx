import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styled from 'styled-components'
import { connect } from 'react-redux'
import { viewArticles } from 'client/actions/articlesActions'
import request from 'superagent'
import $ from 'jquery'
import { debounce } from 'lodash'
import FilterSearch from 'client/components/filter_search/index.coffee'
import IconNewArticle from '../../../components/layout/public/icons/layout_new_article.svg'
import { Fonts } from '@artsy/reaction-force/dist/Components/Publishing/Fonts'

require('jquery-on-infinite-scroll')
const query = require('../query.coffee')

const Header = styled.h1`
  position: fixed;
  top: 0;
  left: 110px;
  right: 0;
  background-color: white;
  z-index: 10;
`

const ArticlesContainer = styled.div`
  margin-top: 105px;
  position: relative;
`

const MaxWidthContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Title = styled.div`
  ${Fonts.garamond('s30')};
  padding: 20px 0;
`

const EmptyState = styled.div`
  text-align: center;
  margin-top: 150px;
`

const EmptyStateSection = styled.div`
  font-size: 20px;
  line-height: 28px;
`

const EmptyStateTitle = styled.div`
  margin-top: 28px;
  margin-bottom: 45px;
  line-height: 28px;
  font-size: 24px;
  font-weight: bold;
  position: relative;
  &:after {
    content: '.';
    border-bottom: 3px solid #000;
    width: 50px;
    color: transparent;
    position: absolute;
    display: block;
    margin: auto;
    left: calc(50% - 25px);
    margin-top: -10px;
  }
`

export class ArticlesList extends Component {
  static propTypes = {
    articles: PropTypes.array,
    published: PropTypes.bool,
    channel: PropTypes.object,
    apiURL: PropTypes.string,
    user: PropTypes.object,
    viewArticlesAction: PropTypes.func,
    checkable: PropTypes.bool,
    selected: PropTypes.func
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
      <EmptyState>
        <EmptyStateTitle>You haven’t written any articles yet.</EmptyStateTitle>
        <EmptyStateSection>Artsy Writer is a tool for writing stories about art on Artsy.</EmptyStateSection>
        <EmptyStateSection>Get started by writing an article or reaching out to your liaison for help.</EmptyStateSection>
        <a
          className='avant-garde-button avant-garde-button-black'
          href='/articles/new'>
          <IconNewArticle /> Write An Article
        </a>
      </EmptyState>
    )
  }

  showArticlesList () {
    const { channel, apiURL, checkable, selected } = this.props
    const isArtsyChannel = (type) => {
      return type in ['editorial', 'support', 'team']
    }

    if (this.props.articles && this.props.articles.length) {
      return (
        <ArticlesContainer>
          <Title>Latest Articles</Title>
          <FilterSearch
            url={apiURL + `/articles?published=${this.state.published}&channel_id=${channel.id}&q=%QUERY`}
            placeholder='Search Articles...'
            collection={this.state.articles}
            searchResults={this.setResults}
            selected={selected}
            contentType='article'
            checkable={checkable || false}
            isArtsyChannel={isArtsyChannel(channel.type)}
          />
        </ArticlesContainer>
      )
    } else {
      return this.showEmptyMessage()
    }
  }

  render () {
    return (
      <div>
        <Header className='page-header'>
          <MaxWidthContainer className='max-width-container'>
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
          </MaxWidthContainer>
        </Header>
        {this.showArticlesList()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  channel: state.app.channel,
  apiURL: state.app.apiURL,
  user: state.app.user
})

const mapDispatchToProps = (dispatch) => ({
  viewArticlesAction: viewArticles
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ArticlesList)

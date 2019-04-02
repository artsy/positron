import { Box, color, Serif, space, Spinner } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { viewArticles } from "client/actions/articlesActions"
import { Channel } from "client/typings"
import $ from "jquery"
import { debounce } from "lodash"
import React, { Component } from "react"
import { hot } from "react-hot-loader"
import { connect } from "react-redux"
import styled from "styled-components"
import request from "superagent"
import { ArticlesListQuery as query } from "../query"
import { ArticlesListEmpty } from "./articles_list_empty"
import ArticlesListHeader from "./articles_list_header"
const FilterSearch = require("client/components/filter_search/index.coffee")
require("jquery-on-infinite-scroll")

interface ArticlesListProps {
  apiURL: string
  articles: ArticleData[]
  channel: Channel
  checkable: boolean
  isPartnerChannel: boolean
  published: boolean
  user: any
  viewArticlesAction: (channel: Channel) => void
  selected: () => void
}

interface ArticlesListState {
  articles: ArticleData[]
  isLoading: boolean
  isPublished: boolean
  offset: number
}

export class ArticlesList extends Component<
  ArticlesListProps,
  ArticlesListState
> {
  state = {
    articles: this.props.articles || [],
    isLoading: true,
    isPublished: this.props.published,
    offset: 0,
  }

  componentDidMount() {
    const { channel, viewArticlesAction } = this.props
    viewArticlesAction(channel)

    const canLoadMore = debounce(this.canLoadMore, 300)
    // @ts-ignore
    $.onInfiniteScroll(canLoadMore)
  }

  canLoadMore = () => {
    const { isPublished, offset } = this.state
    // TODO: remove jQuery
    if ($(".filter-search__input").val()) {
      return
    }
    this.setState({ isLoading: true })
    this.fetchFeed(isPublished, offset + 10, this.appendMore.bind(this))
  }

  setResults = (results: ArticleData[]) => {
    this.setState({ articles: results, isLoading: false })
  }

  setPublished = (isPublished: boolean) => {
    this.setState({ isPublished, offset: 0, isLoading: true })
    this.fetchFeed(isPublished, 0, this.setResults)
  }

  appendMore(results: ArticleData[]) {
    const articles = this.state.articles.concat(results)
    this.setState({ articles, isLoading: false })
  }

  fetchFeed = (
    published: boolean,
    offset: number,
    cb: (data: ArticleData[]) => void
  ) => {
    const { channel, user, apiURL } = this.props
    const feedQuery = query(`
      published: ${published},
      offset: ${offset},
      channel_id: "${channel.id}"
    `)
    request
      .post(apiURL + "/graphql")
      .set("X-Access-Token", user != null ? user.access_token : undefined)
      .send({ query: feedQuery })
      .end((err, res) => {
        if (err || !(res.body != null ? res.body.data : undefined)) {
          return
        }
        this.setState({ offset: this.state.offset + 10 })
        return cb(res.body.data.articles)
      })
  }

  render() {
    const {
      articles,
      apiURL,
      channel,
      checkable,
      isPartnerChannel,
      selected,
    } = this.props
    const { isLoading, isPublished } = this.state

    return (
      <Box maxWidth={960} mx="auto" px={3}>
        <ArticlesListHeader
          isPublished={isPublished}
          onChangeTabs={this.setPublished}
        />
        {articles && articles.length ? (
          <ArticlesListContainer mt={105} className="articles-list">
            <Serif size="8" py={2}>
              Latest Articles
            </Serif>

            <FilterSearch
              url={`${apiURL}/articles?published=${isPublished}&channel_id=${
                channel.id
              }&q=%QUERY`}
              placeholder="Search Articles..."
              collection={this.state.articles}
              searchResults={this.setResults}
              selected={selected}
              contentType="article"
              checkable={checkable || false}
              isArtsyChannel={!isPartnerChannel}
            />
            {isLoading && (
              <SpinnerContainer>
                <Spinner />
              </SpinnerContainer>
            )}
          </ArticlesListContainer>
        ) : (
          <ArticlesListEmpty />
        )}
      </Box>
    )
  }
}

const ArticlesListContainer = styled(Box)`
  position: relative;

  .filter-search__header-container {
    position: absolute;
    top: ${space(2)}px;
    right: 0;
    border: none;
  }

  .article-list__results {
    border-top: 3px solid ${color("black10")};
  }

  .article-list-scheduled {
    color: ${color("green100")};
  }
`
const SpinnerContainer = styled.div`
  width: 100%;
  padding: ${space(2)}px;
  position: relative;
`

const mapStateToProps = state => ({
  channel: state.app.channel,
  apiURL: state.app.apiURL,
  isPartnerChannel: state.app.isPartnerChannel,
  user: state.app.user,
})

const mapDispatchToProps = {
  viewArticlesAction: viewArticles,
}

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ArticlesList)
)
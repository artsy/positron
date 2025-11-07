import { Box, color, space, Spinner } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { viewArticles } from "client/actions/articlesActions"
import { Channel } from "client/typings"
import $ from "jquery"
import { debounce } from "lodash"
import React, { Component } from "react"
import { hot } from "react-hot-loader/root"
import { connect } from "react-redux"
import Waypoint from "react-waypoint"
import styled from "styled-components"
import request from "superagent"
import { ArticlesListQuery } from "../query"
import { ArticlesListEmpty } from "./articles_list_empty"
import ArticlesListHeader from "./articles_list_header"
const FilterSearch = require("client/components/filter_search/index.coffee")

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
  hasMoreArticles: boolean
}

const ARTICLE_PAGE_LIMIT = 10

export class ArticlesList extends Component<
  ArticlesListProps,
  ArticlesListState
> {
  public debouncedCanLoadMore

  constructor(props) {
    super(props)

    this.state = {
      articles: props.articles,
      isLoading: false,
      isPublished: props.published,
      offset: 0,
      hasMoreArticles: true,
    }

    this.debouncedCanLoadMore = debounce(this.canLoadMore, 300)
  }

  componentDidMount() {
    const { channel, viewArticlesAction } = this.props
    viewArticlesAction(channel)
  }

  canLoadMore = () => {
    const { offset, hasMoreArticles, isLoading } = this.state
    // TODO: remove jQuery
    if ($(".filter-search__input").val()) {
      return
    }
    // Don't load more if already loading or no more articles exist
    if (isLoading || !hasMoreArticles) {
      return
    }
    this.setState({ isLoading: true, offset: offset + 10 }, this.fetchFeed)
  }

  setResults = (results: ArticleData[]) => {
    this.setState({ articles: results, isLoading: false })
  }

  setPublished = (isPublished: boolean) => {
    this.setState(
      {
        isPublished,
        offset: 0,
        isLoading: true,
        articles: [],
        hasMoreArticles: true,
      },
      this.fetchFeed
    )
  }

  appendMore = (results: ArticleData[]) => {
    const articles = this.state.articles.concat(results)
    // If we get fewer than 10 results, we've reached the end
    const hasMoreArticles = results.length >= ARTICLE_PAGE_LIMIT
    this.setState({ articles, isLoading: false, hasMoreArticles })
  }

  fetchFeed = () => {
    const { channel, user, apiURL } = this.props
    const { isPublished, offset } = this.state
    const query = ArticlesListQuery(`
      published: ${isPublished},
      offset: ${offset},
      channel_id: "${channel.id}",
      limit: ${ARTICLE_PAGE_LIMIT},
    `)

    request
      .post(apiURL + "/graphql")
      .set("X-Access-Token", user ? user.access_token : undefined)
      .send({ query })
      .end((err, res) => {
        if (err) {
          console.error("Error fetching articles:", err)
          this.setState({ isLoading: false })
          return
        }
        this.appendMore(res.body.data.articles)
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
    const hasResultsForView =
      articles.length && articles[0].published === isPublished
    return (
      <Box maxWidth={960} mx="auto" px={3} mt={105}>
        <ArticlesListHeader
          isPublished={isPublished}
          onChangeTabs={this.setPublished}
        />
        {articles.length ? (
          <ArticlesListContainer className="articles-list">
            <FilterSearch
              url={`${apiURL}/articles?published=${isPublished}&channel_id=${
                channel.id
              }&q=%QUERY`}
              placeholder="Search Articles..."
              collection={this.state.articles}
              searchResults={this.setResults}
              selected={selected}
              contentType="article"
              checkable={checkable}
              isArtsyChannel={!isPartnerChannel}
              isLoading={isLoading}
              headerText="Latest Articles"
            />
          </ArticlesListContainer>
        ) : (
          <ArticlesListEmpty />
        )}

        {isLoading ? (
          <SpinnerContainer>
            <Spinner />
          </SpinnerContainer>
        ) : (
          hasResultsForView && <Waypoint onEnter={this.debouncedCanLoadMore} />
        )}
      </Box>
    )
  }
}

const ArticlesListContainer = styled(Box)`
  .article-list-scheduled {
    color: ${color("green100")};
  }
`
const SpinnerContainer = styled.div`
  width: 100%;
  padding: ${space(4)}px;
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

export default hot(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ArticlesList)
)

import { Box, color, Serif, space, Spinner } from "@artsy/palette"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { viewArticles } from "client/actions/articlesActions"
import { Channel } from "client/typings"
import $ from "jquery"
import { debounce } from "lodash"
import React, { Component } from "react"
import { hot } from "react-hot-loader"
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
}

export class ArticlesList extends Component<
  ArticlesListProps,
  ArticlesListState
> {
  public debouncedCanLoadMore

  constructor(props) {
    super(props)

    this.state = {
      articles: this.props.articles,
      isLoading: false,
      isPublished: this.props.published,
      offset: 0,
    }

    this.debouncedCanLoadMore = debounce(this.canLoadMore, 300)
  }

  componentDidMount() {
    const { channel, viewArticlesAction } = this.props
    viewArticlesAction(channel)
  }

  canLoadMore = () => {
    const { offset } = this.state
    // TODO: remove jQuery
    if ($(".filter-search__input").val()) {
      return
    }
    this.setState({ isLoading: true, offset: offset + 10 }, this.fetchFeed)
  }

  setResults = (results: ArticleData[]) => {
    this.setState({ articles: results, isLoading: false })
  }

  setPublished = (isPublished: boolean) => {
    this.setState(
      { isPublished, offset: 0, isLoading: true, articles: [] },
      this.fetchFeed
    )
  }

  appendMore = (results: ArticleData[]) => {
    const articles = this.state.articles.concat(results)
    this.setState({ articles, isLoading: false })
  }

  fetchFeed = () => {
    const { channel, user, apiURL } = this.props
    const { isPublished, offset } = this.state
    const query = ArticlesListQuery(`
      published: ${isPublished},
      offset: ${offset},
      channel_id: "${channel.id}"
    `)

    request
      .post(apiURL + "/graphql")
      .set("X-Access-Token", user ? user.access_token : undefined)
      .send({ query })
      .end((err, res) => {
        if (err) {
          return new Error(err)
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

    return (
      <Box maxWidth={960} mx="auto" px={3}>
        <ArticlesListHeader
          isPublished={isPublished}
          onChangeTabs={this.setPublished}
        />
        {articles.length ? (
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
              checkable={checkable}
              isArtsyChannel={!isPartnerChannel}
              isLoading={isLoading}
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
          <Waypoint onEnter={this.debouncedCanLoadMore} />
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

export default hot(module)(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ArticlesList)
)

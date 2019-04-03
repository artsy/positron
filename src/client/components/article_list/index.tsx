import { Button, color, Flex, Sans, Serif, space } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import { IconLock } from "@artsy/reaction/dist/Components/Publishing/Icon/IconLock"
import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import moment from "moment"
import React, { Component } from "react"
import { connect } from "react-redux"
import styled from "styled-components"
import { capitalize } from "underscore.string"
import ArticleListItem from "./article_list_item"

interface ArticleListProps {
  activeSessions: any
  articles: ArticleData[]
  checkable: boolean
  display: string
  forceURL: string
  isArtsyChannel: boolean
  isLoading: boolean
  selected: (article: ArticleData) => void
  user: any
}

export class ArticleList extends Component<ArticleListProps> {
  render() {
    const { isLoading, selected } = this.props
    const articles = this.props.articles || {}

    return (
      <ArticleListContainer>
        {!articles.length && !isLoading ? (
          <Serif size="5" pt={4}>
            No Results Found
          </Serif>
        ) : (
          articles.map((article, i) => {
            return (
              <ArticleListItem
                key={i}
                selected={selected}
                checkable={checkable}
                article={article}
              />
            )
          })
        )}
      </ArticleListContainer>
    )
  }
}

export const ArticleListContainer = styled.div``

const mapStateToProps = state => ({
  activeSessions: state.articlesList.articlesInSession || {},
  user: state.app.user,
  forceURL: state.app.forceURL,
})

export default connect(mapStateToProps)(ArticleList)

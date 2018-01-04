import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import { Col, Row } from 'react-styled-flexboxgrid'
import { data as sd } from 'sharify'
// import Verticals from '../../../../../collections/verticals.coffee'
import { Autocomplete } from '/client/components/autocomplete2/index'
import { ArticleTagQuery } from 'client/queries/article_tags'

import request from 'superagent'

export class AutocompleteInlineList extends Component {
  static propTypes = {
    // article: PropTypes.object,
    // onChange: PropTypes.func
  }

  // fetchVerticals = async () => {
    // new Verticals().fetch({
    //   cache: true,
    //   success: (verticals) => {
    //     let sortedVerticals = verticals.sortBy('name')
    //     this.setState({verticals: sortedVerticals})
    //   }
    // })
  // }

  fetchTags = (article) => {
    // const { related_article_ids } = this.props.article.attributes
    // const { relatedArticles } = this.state
    // const alreadyFetched = pluck(relatedArticles, 'id')
    // const idsToFetch = difference(related_article_ids, alreadyFetched)
    const tagsToFetch = article.topic_tags
    debugger
    if (tagsToFetch.length) {
      tagsToFetch.map((tag) => {
        request
          .get(`${sd.API_URL}/graphql`)
          .set({
            'Accept': 'application/json',
            'X-Access-Token': (sd.USER && sd.USER.access_token)
          })
          .query({ query: ArticleTagQuery(tag.name) })
          .end((err, res) => {
            if (err) {
              console.error(err)
            }
            debugger
            // relatedArticles.push(res.body.data.articles)
      //       this.setState({
      //         loading: false,
      //         relatedArticles: uniq(flatten(relatedArticles))
      //       })
          })
      })
    } else {
      debugger
    //   this.setState({
    //     loading: false,
    //     relatedArticles
    //   })
    }
  }

  render () {
    return (
      <div className='AutocompleteInlineList'>
        <Autocomplete {...this.props} />
      </div>
    )
  }
}

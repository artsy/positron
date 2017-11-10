import _ from 'underscore'
import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Article from '../../models/article'
import Channel from '../../models/channel'
import EditLayout from './components/layout'
import EditHeader from './components/header'
import EditDisplay from './components/display'
import EditAdmin from './components/admin'
import EditContent from './components/content2'
import { data as sd } from 'sharify'

export function init () {
  console.log('is this working!!!??')
  const article = new Article(sd.ARTICLE)
  const channel = new Channel(sd.CURRENT_CHANNEL)
  const author = _.pick(article.get('author'), 'id', 'name')

  article.set({
    author
  })

  new EditLayout({ el: $('#layout-content'), article, channel })
  new EditHeader({ el: $('#edit-header'), article })
  new EditDisplay({ el: $('#edit-display'), article })

  ReactDOM.render(
    <EditAdmin
      article={article}
      channel={channel}
    />,
    $('#edit-admin')[0]
  )

  ReactDOM.render(
    <EditContent
      article={article}
      channel={channel}
    />,
    $('#edit-content')[0]
  )
}

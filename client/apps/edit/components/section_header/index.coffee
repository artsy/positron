React = require 'react'
moment = require 'moment'
RichTextParagraph = React.createFactory require '../../../../components/rich_text/components/input_paragraph.coffee'
{ div, p, textarea } = React.DOM


module.exports = React.createClass
  displayName: 'SectionHeader'

  changeTitle: (e) ->
    if e.key is 'Enter'
      e.preventDefault()

  setTitle: ->
    @props.article.set 'title', this.refs.title.value
    @props.saveArticle()

  setLeadParagraph: (html) ->
    @props.article.setLeadParagraph(html)
    @props.saveArticle()

  render: ->
    div { className: 'edit-header-container' },

      div { id: 'edit-title' },
        textarea {
          className: 'invisible-input'
          placeholder: 'Type a title'
          defaultValue: @props.article.get 'title'
          onKeyPress: @changeTitle
          onKeyUp: @setTitle
          ref: 'title'
        }
        unless @props.article.get('title')?.length > 0
          div { className: 'edit-required' }

      div {
        id: 'edit-lead-paragraph'
        className: 'edit-body-container'
      },
        RichTextParagraph {
          text: @props.article.get('lead_paragraph')
          onChange: @setLeadParagraph
          placeholder: 'Lead paragraph (optional)'
        }

      div { className: 'edit-author-section' },
        if @props.article.get('author')
          p { className: 'article-author' },
            @props.article.get('author').name
        p { className: 'article-date' }, @props.article.getPublishDate()

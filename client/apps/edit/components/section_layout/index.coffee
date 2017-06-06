React = require 'react'
moment = require 'moment'
_ = require 'underscore'
HeroSection = React.createFactory require '../hero_section/index.coffee'
RichTextParagraph = React.createFactory require '../../../../components/rich_text/components/input_paragraph.coffee'
SectionList = React.createFactory require '../section_list/index.coffee'
{ div, p, textarea } = React.DOM


module.exports = React.createClass
  displayName: 'SectionLayout'

  componentWillMount: ->
    @debouncedSave = _.debounce((-> @props.article.save()), 800)
    @props.article.sections.on 'change', => @saveArticle()

  saveArticle: ->
    unless @props.article.get('published')
      $('#edit-save').addClass('is-saving')
      @debouncedSave()
    else
      $('#edit-save').removeClass('is-saving').addClass 'attention'

  getPublishDate: ->
    date = new Date
    if @props.article.get('published')
      date = @props.article.get('published_at')
    else if @props.article.get('scheduled_publish_at')
      date = @props.article.get('scheduled_publish_at')
    return moment(date).format('MMM D, YYYY h:mm a')

  render: ->
    div {className: 'edit-section-layout'},
      # HERO SECTION
      if @props.article.get('hero_section') != null or @props.channel.hasFeature 'hero'
        div { id: 'edit-hero-section' },
          HeroSection {
            section: @props.article.heroSection
          }
      div { className: 'edit-header-container' },
        # ARTICLE TITLE
        div { id: 'edit-title' },
          textarea {
            className: 'invisible-input'
            placeholder: 'Type a title'
            defaultValue: @props.article.get 'title'
          }
          unless @props.article.get('title')?.length > 0
            div { className: 'edit-required' }
        # LEAD-PARAGRAPH
        div {
          id: 'edit-lead-paragraph'
          className: 'edit-body-container'
        },
          RichTextParagraph {
            text: @props.article.get('lead_paragraph')
            onChange: @props.article.setLeadParagraph
            placeholder: 'Lead paragraph (optional)'
          }
        # AUTHOR SECTION
        div { className: 'edit-author-section' },
          if @props.article.get('author')
            p { className: 'article-author' },
              @props.article.get('author').name
          p { className: 'article-date' }, @getPublishDate()

        div { id: 'edit-sections', className: 'edit-body-container' },
          SectionList {
            sections: @props.article.sections
          }
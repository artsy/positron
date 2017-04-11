_ = require 'underscore'

formatComponents = (article) ->
  @components = []
  @components.push getTitle(article)
  @components.push getSections(article)
  _.flatten @components

getTitle = (article) ->
  role: 'title'
  text: article.title

getSections = (article) ->
  for section in article.sections
    switch section.type
      when 'text'
        role: 'body'
        format: 'html'
        text: section.body
  _.compact sections

@formatAppleNews = (article) ->
  version: '1.4'
  identified: ''
  components: formatComponents(article)

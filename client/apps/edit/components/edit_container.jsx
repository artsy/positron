import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as Actions from 'client/actions/editActions'

import { EditContent } from './content/index.jsx'
import { EditHeader } from './header/index.jsx'
import EditAdmin from './admin/index'

class EditContainer extends Component {
  static propTypes = {
    article: PropTypes.object,
    actions: PropTypes.object,
    channel: PropTypes.object,
    edit: PropTypes.object,
    user: PropTypes.object
  }

  constructor (props) {
    super(props)

    props.article.sections.on(
      'change add remove reset',
      () => this.maybeSaveArticle()
    )
    props.article.heroSection.on(
      'change remove',
      () => this.maybeSaveArticle()
    )
  }

  onChange = (key, value) => {
    const { article } = this.props

    article.set(key, value)
    this.maybeSaveArticle()
  }

  maybeSaveArticle = () => {
    const { article, actions } = this.props
    const { changeSavedStatus, saveArticle } = actions

    if (article.get('published')) {
      changeSavedStatus(false)
    } else {
      saveArticle(article)
    }
  }

  getActiveSection = () => {
    const { article, channel, edit } = this.props
    const { activeSection } = edit

    const props = {
      article,
      channel,
      onChange: this.onChange
    }

    switch (activeSection) {
      case 'content':
        return <EditContent {...props} />
      case 'admin':
        return <EditAdmin {...props} />
    }
  }

  render () {
    return (
      <div className='EditContainer'>

        <EditHeader {...this.props} />

        {this.getActiveSection()}

      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContainer)

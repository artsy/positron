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

  getActiveSection = () => {
    const { actions, article, channel, edit } = this.props
    const { activeSection } = edit

    const props = {
      article,
      channel,
      saveArticle: (article) => actions.saveArticle(article),
      savedStatus: (status) => actions.savedStatus(status)
    }

    switch (activeSection) {
      case 'content':
        return <EditContent {...props} />
      case 'admin':
        return <EditAdmin {...props} />
    }
  }

  render () {
    const { actions, article, channel, edit, user } = this.props

    return (
      <div className='EditContainer'>
        <EditHeader
          actions={actions}
          article={article}
          channel={channel}
          edit={edit}
          user={user}
        />
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

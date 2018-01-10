import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import * as Actions from 'client/actions/editActions'

export class EditError extends Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired
  }

  render () {
    const { resetError } = this.props.actions
    const { message } = this.props.error

    return (
      <div
        className='EditError flash-error'
        onClick={resetError}
      >
        {message}
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
)(EditError)

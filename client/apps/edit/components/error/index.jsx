import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { resetError } from 'client/actions/editActions'

export class EditError extends Component {
  static propTypes = {
    resetErrorAction: PropTypes.func,
    error: PropTypes.object
  }

  render () {
    const { resetErrorAction } = this.props
    const { message } = this.props.error

    return (
      <div
        className='EditError flash-error'
        onClick={resetErrorAction}
      >
        {message}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  error: state.edit.error
})

const mapDispatchToProps = {
  resetErrorAction: resetError
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditError)

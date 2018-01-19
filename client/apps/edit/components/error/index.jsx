import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { resetError } from 'client/actions/editActions'

export class EditError extends Component {
  static propTypes = {
    resetError: PropTypes.object.isRequired,
    error: PropTypes.object.isRequired
  }

  render () {
    const { resetError } = this.props
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
  error: state.error
})

const mapDispatchToProps = (dispatch) => ({
  resetErrorAction: resetError
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditError)

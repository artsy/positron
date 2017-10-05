import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'
import PropTypes from 'prop-types'
import React from 'react'

export default class CharacterLimitInput extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      remainingChars: props.limit - this.getTextLength(props.defaultValue, props.html)
    }
  }

  getTextLength = (text, isHtml) => {
    return isHtml ? $(text).text().length : text.length
  }

  onInputChange = (e) => {
    const input = this.props.html ? e : e.target.value
    const remainingChars = this.props.limit - this.getTextLength(input, this.props.html)
    this.setState({ remainingChars })
    this.props.onChange(input)
  }

  renderTextArea = (propsForInput) => {
    if (this.props.html) {
      return (
        <div className='bordered-input'>
          <Paragraph
            onChange={this.onInputChange}
            html={this.props.defaultValue}
            linked
            stripLinebreaks
            placeholder={this.props.placeholder} />
        </div>
      )
    } else {
      return <textarea {...propsForInput} />
    }
  }

  render () {
    const propsForInput = {
      className: 'bordered-input',
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue,
      onChange: this.onInputChange,
      name: this.props.name,
      maxLength: this.props.limit
    }

    return (
      <div>
        <label>
          {this.props.label}
          <span>{this.state.remainingChars} Characters</span>
        </label>
        {this.props.type === 'textarea'
          ? this.renderTextArea(propsForInput)
          : <input {...propsForInput} />
        }
      </div>
    )
  }
}

CharacterLimitInput.propTypes = {
  defaultValue: PropTypes.string.isRequired,
  html: PropTypes.bool,
  label: PropTypes.string,
  limit: PropTypes.number.isRequired,
  name: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string
}

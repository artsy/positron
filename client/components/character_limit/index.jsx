import Paragraph from 'client/components/rich_text2/components/paragraph.coffee'
import { PlainText } from '/client/components/rich_text2/components/plain_text.jsx'
import PropTypes from 'prop-types'
import React from 'react'

export class CharacterLimit extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      remainingChars: props.limit - this.getTextLength(props.defaultValue || '', props.html)
    }
  }

  getTextLength = (text, isHtml) => {
    return isHtml ? $(text).text().length : text.length
  }

  onChange = (e) => {
    const input = this.props.type === 'textarea' ? e : e.target.value
    const remainingChars = this.props.limit - this.getTextLength(input, this.props.html)
    this.setState({ remainingChars })
    this.props.onChange(input)
  }

  renderTextArea = (propsForInput) => {
    if (this.props.html) {
      return (
        <div className='bordered-input'>
          <Paragraph
            onChange={this.onChange}
            html={this.props.defaultValue || ''}
            linked
            stripLinebreaks
            placeholder={this.props.placeholder} />
        </div>
      )
    } else {
      return (
        <div className='bordered-input'>
          <PlainText
            content={this.props.defaultValue || ''}
            onChange={this.onChange}
            placeholder={this.props.placeholder} />
        </div>
      )
    }
  }

  render () {
    const propsForInput = {
      className: 'bordered-input',
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue || '',
      onChange: this.onChange,
      maxLength: this.props.limit
    }
    const remainingColor = this.state.remainingChars >= 0 ? '#666' : '#f7625a'

    return (
      <div className='character-limit'>
        <label>
          {this.props.label}
          <span style={{color: remainingColor}}>{this.state.remainingChars} Characters</span>
        </label>
        {this.props.type === 'textarea'
          ? this.renderTextArea(propsForInput)
          : <input {...propsForInput} />
        }
      </div>
    )
  }
}

CharacterLimit.propTypes = {
  defaultValue: PropTypes.string,
  html: PropTypes.bool,
  label: PropTypes.string,
  limit: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string
}

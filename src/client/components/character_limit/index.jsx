import PropTypes from "prop-types"
import React from "react"
import { Paragraph } from "client/components/draft/paragraph/paragraph"
import { PlainText } from "client/components/draft/plain_text/plain_text"

export class CharacterLimit extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      remainingChars:
        props.limit - this.getTextLength(props.defaultValue || "", props.html),
    }
  }

  getTextLength = (text, isHtml) => {
    return isHtml ? $(text).text().length : text.length
  }

  onChange = e => {
    const { html, limit, onChange, type } = this.props
    const input = type === "textarea" ? e : e.target.value
    const remainingChars = limit - this.getTextLength(input, html)

    this.setState({ remainingChars })
    onChange(input)
  }

  renderTextArea = propsForInput => {
    const { defaultValue, html, placeholder } = this.props

    if (html) {
      return (
        <div className="bordered-input">
          <Paragraph
            onChange={this.onChange}
            hasLinks
            html={defaultValue || ""}
            stripLinebreaks
            placeholder={placeholder}
          />
        </div>
      )
    } else {
      return (
        <div className="bordered-input">
          <PlainText
            content={defaultValue || ""}
            onChange={this.onChange}
            placeholder={placeholder}
          />
        </div>
      )
    }
  }

  render() {
    const { defaultValue, label, limit, placeholder, type } = this.props
    const { remainingChars } = this.state

    const propsForInput = {
      className: "bordered-input",
      placeholder: placeholder,
      defaultValue: defaultValue || "",
      onChange: this.onChange,
      maxLength: limit,
    }
    const remainingColor = remainingChars >= 0 ? "#999" : "#f7625a"

    return (
      <div className="CharacterLimit" data-type={type}>
        <label>
          {label}
          <span style={{ color: remainingColor }}>
            {remainingChars} Characters
          </span>
        </label>
        {type === "textarea" ? (
          this.renderTextArea(propsForInput)
        ) : (
          <input {...propsForInput} />
        )}
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
  type: PropTypes.string,
}

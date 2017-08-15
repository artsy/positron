import React from "react"

export default class CharacterLimitInput extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      remainingChars: props.limit - props.defaultValue.length
    }
  }

  onInputChange(e) {
    const remainingChars = this.props.limit - e.target.value.length

    this.setState({ remainingChars })
    this.props.onChange(e)
  }

  render() {
    const propsForInput = {
      className: "bordered-input",
      placeholder: this.props.placeholder,
      defaultValue: this.props.defaultValue,
      onChange: this.onInputChange.bind(this),
      name: this.props.name,
      maxLength: this.props.limit
    }

    return (
      <div>
        <label>{this.props.label}</label>
        <div>{this.state.remainingChars} Charactors</div>
        {this.props.type === 'textarea' ? <textarea {...propsForInput} /> : <input {...propsForInput} />}
      </div>
    )
  }
}

import PropTypes from "prop-types"
import React, { Component } from "react"

export class DropDownItem extends Component {
  static propTypes = {
    active: PropTypes.bool,
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    children: PropTypes.any,
  }

  constructor(props) {
    super(props)

    this.state = {
      isActive: props.active || false,
    }
  }

  render() {
    const { active, children, index, onClick, title } = this.props

    return (
      <div className="DropDownItem" key={"DropDownItem-" + index}>
        <div
          className="DropDownItem__title"
          onClick={() => onClick(index)}
          data-active={active}
        >
          <h1 className={!title ? "placeholder" : undefined}>
            {title || "Missing Title"}
          </h1>
          <div className="icon" />
        </div>
        {active && <div className="DropDownItem__content">{children}</div>}
      </div>
    )
  }
}

import PropTypes from "prop-types"
import React, { Component } from "react"
import { Autocomplete } from "/client/components/autocomplete2/index"
import { clone } from "lodash"

export class AutocompleteInlineList extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    formatSelected: PropTypes.func,
    formatSearchResult: PropTypes.func,
    items: PropTypes.array,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string,
  }

  onRemoveItem = item => {
    const { items, onSelect } = this.props
    const newItems = clone(items)

    newItems.splice(item, 1)
    onSelect(newItems)
  }

  render() {
    const { items, className } = this.props

    return (
      <div className={`Autocomplete--inline ${className ? className : ""}`}>
        <div className="Autocomplete__list">
          {items.map((item, i) => {
            return (
              <div className="Autocomplete__list-item" key={i}>
                {item}
                <button onClick={() => this.onRemoveItem(i)} />
              </div>
            )
          })}
        </div>

        <Autocomplete {...this.props} />
      </div>
    )
  }
}

AutocompleteInlineList.defaultProps = { items: [] }

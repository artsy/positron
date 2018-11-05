import PropTypes from "prop-types"
import React, { Component } from "react"
import { Autocomplete } from "/client/components/autocomplete2/index"
import { ListItem } from "./list"

export class AutocompleteSingle extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    fetchItem: PropTypes.func,
    formatSelected: PropTypes.func,
    formatListItem: PropTypes.func,
    formatSearchResult: PropTypes.func,
    item: PropTypes.string,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string,
  }

  state = {
    item: null,
  }

  componentWillMount = () => {
    this.fetchItem()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.item !== this.props.item) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    const { fetchItem } = this.props
    const { item } = this.state

    fetchItem(item, fetchedItems => {
      this.setState({ item: fetchedItems[0] })
    })
  }

  onRemoveItem = () => {
    const { onSelect } = this.props
    this.setState({ item: null })
    onSelect(null)
  }

  onSelect = items => {
    const { onSelect } = this.props
    this.setState({ item: items[0] })
    onSelect(items[0])
  }

  render() {
    const { className, formatListItem } = this.props
    const { item } = this.state

    const props = {
      ...this.props,
      items: item,
      onSelect: this.onSelect,
    }

    const title = item ? item.title || item.name : ""
    return (
      <div className={`AutocompleteList ${className || ""}`}>
        {item ? (
          <div className="Autocomplete__list">
            <ListItem className="Autocomplete__list-item">
              {formatListItem ? (
                formatListItem()
              ) : (
                <span className="selected">{title}</span>
              )}
              <button
                className="remove-button"
                onClick={() => this.onRemoveItem()}
              />
            </ListItem>
          </div>
        ) : (
          <Autocomplete {...props} />
        )}
      </div>
    )
  }
}

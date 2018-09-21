import colors from "@artsy/reaction/dist/Assets/Colors"
import styled from "styled-components"
import { clone, map, uniq } from "lodash"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { garamond } from "@artsy/reaction/dist/Assets/Fonts"
import { Autocomplete } from "/client/components/autocomplete2/index"

export class AutocompleteList extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    fetchItems: PropTypes.func,
    formatSelected: PropTypes.func,
    formatListItem: PropTypes.func,
    formatSearchResult: PropTypes.func,
    items: PropTypes.array,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string,
  }

  state = {
    items: [],
  }

  componentWillMount = () => {
    this.fetchItems()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.items !== this.props.items) {
      this.fetchItems()
    }
  }

  fetchItems = () => {
    const { fetchItems } = this.props
    const { items } = this.state

    fetchItems(items, fetchedItems => {
      this.setState({ items: fetchedItems })
    })
  }

  onRemoveItem = item => {
    const { onSelect } = this.props
    const { items } = this.state
    const newItems = clone(items)
    let newItemsIds

    newItems.splice(item, 1)
    if (newItems.length && newItems[0]._id) {
      newItemsIds = map(newItems, "_id")
    } else {
      newItemsIds = map(newItems, "id")
    }
    onSelect(uniq(newItemsIds))
    this.setState({ items: newItems })
  }

  render() {
    const { className, formatListItem } = this.props
    const { items } = this.state

    return (
      <div className={`AutocompleteList ${className || ""}`}>
        {items.length > 0 && (
          <div className="Autocomplete__list">
            {items.map((item, i) => {
              const title = item ? item.title || item.name : ""
              return (
                <ListItem className="Autocomplete__list-item" key={i}>
                  {formatListItem ? (
                    formatListItem()
                  ) : (
                    <span className="selected">{title}</span>
                  )}
                  <button
                    className="remove-button"
                    onClick={() => this.onRemoveItem(i)}
                  />
                </ListItem>
              )
            })}
          </div>
        )}
        <Autocomplete {...this.props} />
      </div>
    )
  }
}

export const ListItem = styled.div`
  ${garamond("s17")} align-items: center;
  border: 2px solid ${colors.grayRegular};
  color: ${props => (props.color ? props.color : colors.purpleRegular)};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  letter-spacing: 0;
  line-height: 26px;
  margin-bottom: 10px;
  overflow: ellipsis;
  padding: 5px 20px 5px 10px;
  position: relative;
  text-transform: none;
`

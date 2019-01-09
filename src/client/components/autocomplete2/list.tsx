import { Box, color, Flex, Sans, Serif } from "@artsy/palette"
import { clone, map, uniq } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"
import { Autocomplete, AutocompleteProps, Item } from "./index"

interface AutocompleteListProps extends AutocompleteProps {
  fetchItems: (fetchedItems: Item[], cb: (Items: Item[]) => void) => void
  formatListItem?: any
  label?: string
}

interface AutocompleteListState {
  items: Item[]
}

export class AutocompleteList extends Component<
  AutocompleteListProps,
  AutocompleteListState
> {
  state = {
    items: [] as Item[],
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
    const { formatListItem, label } = this.props
    const { items } = this.state

    return (
      <div>
        {label && (
          <Sans size="3t" weight="medium">
            {label}
          </Sans>
        )}
        {items.length > 0 && (
          <Box mt={1}>
            {items.map((item, i) => {
              const title = item ? item.title || item.name : ""
              return (
                <ListItem key={i}>
                  {formatListItem ? (
                    formatListItem()
                  ) : (
                    <Serif size="4t" color={color("purple100")}>
                      {title}
                    </Serif>
                  )}
                  <button
                    className="remove-button"
                    onClick={() => this.onRemoveItem(i)}
                  />
                </ListItem>
              )
            })}
          </Box>
        )}
        <Autocomplete {...this.props} />
      </div>
    )
  }
}

export const ListItem = styled(Flex)`
  border: 1px solid ${color("black10")};
  position: relative;
  padding: 10px 10px 10px;
  margin-bottom: 10px;
  align-items: center;
  justify-content: space-between;

  button,
  button:hover {
    top: 3px;
  }
`

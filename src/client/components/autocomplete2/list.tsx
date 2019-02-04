import { Box, color, Flex, Sans, Serif, space } from "@artsy/palette"
import { DragDropList } from "client/components/drag_drop2"
import { DragPlaceholder } from "client/components/drag_drop2/drag_target"
import { clone, map, uniq } from "lodash"
import React, { Component } from "react"
import styled from "styled-components"
import { Autocomplete, AutocompleteProps, Item } from "./index"

interface AutocompleteListProps extends AutocompleteProps {
  fetchItems: (fetchedItems: Item[], cb: (Items: Item[]) => void) => void
  formatListItem?: any
  label?: string
  isDraggable?: boolean
  onDragEnd?: (items: any[]) => void
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

  onDragEnd = newItems => {
    const { onDragEnd } = this.props
    this.setState({ items: newItems })
    onDragEnd && onDragEnd(newItems)
  }

  renderListItems = () => {
    const { formatListItem, isDraggable } = this.props
    const { items } = this.state

    return items.map((item, i) => {
      const title = item ? item.title || item.name : ""
      return (
        <ListItem key={i} isDraggable={isDraggable}>
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
    })
  }

  render() {
    const { isDraggable, label } = this.props
    const { items } = this.state

    return (
      <AutocompleteListContainer>
        {label && (
          <Sans size="3t" weight="medium">
            {label}
          </Sans>
        )}

        {items.length > 0 && (
          <Box mt={1}>
            {isDraggable ? (
              <DragDropList items={items} onDragEnd={this.onDragEnd}>
                {this.renderListItems()}
              </DragDropList>
            ) : (
              this.renderListItems()
            )}
          </Box>
        )}
        <Autocomplete {...this.props} />
      </AutocompleteListContainer>
    )
  }
}

export const ListItem = styled(Flex)<{ isDraggable?: boolean }>`
  border: 1px solid ${color("black10")};
  position: relative;
  padding: 10px 10px 10px;
  margin-bottom: ${space(1)}px;
  align-items: center;
  justify-content: space-between;

  button,
  button:hover {
    top: 3px;
  }

  ${props =>
    props.isDraggable &&
    `
    ${Sans} {
      user-select: none;
    }

    button {
      z-index: 10;
    }
  `};
`

const AutocompleteListContainer = styled.div`
  ${DragPlaceholder} {
    max-height: calc(100% - ${space(1)}px);
  }
`

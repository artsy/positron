import { Box, color, Sans, Serif } from "@artsy/palette"
import { Autocomplete, Item } from "client/components/autocomplete2/index"
import React, { Component, ReactNode } from "react"
import { ListItem } from "./list"
import { AutocompleteListProps } from "./list_metaphysics"

interface MetaphysicsItem extends Item {
  _id: string
}

interface AutocompleteSingleProps extends AutocompleteListProps {
  idToFetch?: string
  fetchItem: (idToFetch: string, cb?: (item: any[]) => void) => void
  formatListItem?: () => ReactNode
}

interface AutocompleteSingleState {
  item?: Item | MetaphysicsItem
}

export class AutocompleteSingle extends Component<
  AutocompleteSingleProps,
  AutocompleteSingleState
> {
  state = {
    item: undefined,
  }

  componentWillMount = () => {
    this.fetchItem()
  }

  componentDidUpdate = prevProps => {
    if (prevProps.idToFetch !== this.props.idToFetch) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    const { fetchItem, idToFetch } = this.props

    if (idToFetch) {
      fetchItem(idToFetch, fetchedItems => {
        this.setState({ item: fetchedItems[0] })
      })
    }
  }

  onRemoveItem = () => {
    const { onSelect } = this.props
    this.setState({ item: undefined })
    onSelect(null)
  }

  onSelect = items => {
    const { onSelect } = this.props
    this.setState({ item: items[0] })
    onSelect(items[0])
  }

  formatItem = (item: Item | MetaphysicsItem) => (
    <Serif size="4t" color={color("purple100")}>
      {item && (item.title || item.name || "")}
    </Serif>
  )

  render() {
    const { formatListItem, label } = this.props
    const { item } = this.state

    const props = {
      ...this.props,
      items: item ? [item] : undefined,
      onSelect: this.onSelect,
    }

    return (
      <div>
        {label && (
          <Sans size="3t" weight="medium">
            {label}
          </Sans>
        )}
        {item ? (
          <Box mt={2}>
            <ListItem>
              {formatListItem ? formatListItem() : this.formatItem(item)}
              <button
                className="remove-button"
                onClick={() => this.onRemoveItem()}
              />
            </ListItem>
          </Box>
        ) : (
          <Autocomplete {...props} />
        )}
      </div>
    )
  }
}

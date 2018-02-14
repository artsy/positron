import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Autocomplete } from '/client/components/autocomplete2/index'

export class AutocompleteList extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    fetchItems: PropTypes.func,
    formatSelected: PropTypes.func,
    formatSearchResult: PropTypes.func,
    items: PropTypes.array,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string
  }

  state = {
    items: []
  }

  componentWillMount = () => {
    this.fetchItems()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.items !== this.props.items) {
      this.fetchItems()
    }
  }

  fetchItems = () => {
    const { fetchItems } = this.props
    const { items } = this.state

    fetchItems(items, (fetchedItems) => {
      this.setState({ items: fetchedItems })
    })
  }

  onRemoveItem = (item) => {
    const { items, onSelect } = this.props
    const newItems = clone(items)

    newItems.splice(item, 1)
    onSelect(newItems)
    this.setState({items: newItems})
  }

  render () {
    const { className, formatSelected } = this.props
    const { items } = this.state

    return (
      <div className={`Autocomplete--list ${className || ''}`}>

        <div className='Autocomplete__list'>
          {items.length > 0 && items.map((item, i) => {
            const { title, name } = item
            return (
              <div
                className='Autocomplete__list-item'
                key={i}
              >
                {formatSelected
                  ? formatSelected()
                  : <span className='selected'>
                      {title || name}
                    </span>
                }
                <button
                  className='remove-button'
                  onClick={() => this.onRemoveItem(i)}
                />
              </div>
            )
          })}
        </div>

        <Autocomplete {...this.props} />

      </div>
    )
  }
}

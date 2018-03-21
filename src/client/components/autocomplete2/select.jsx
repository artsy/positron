import colors from '@artsy/reaction/dist/Assets/Colors'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Fonts } from '@artsy/reaction/dist/Components/Publishing/Fonts'
import { Autocomplete } from '/client/components/autocomplete2/index'

export class AutocompleteSelect extends Component {
  static propTypes = {
    className: PropTypes.string,
    disabled: PropTypes.bool,
    filter: PropTypes.func,
    fetchItems: PropTypes.func,
    formatSelected: PropTypes.func,
    formatListItem: PropTypes.func,
    formatSearchResult: PropTypes.func,
    item: PropTypes.string,
    onSelect: PropTypes.func,
    placeholder: PropTypes.string,
    url: PropTypes.string
  }

  state = {
    item: null
  }

  componentWillMount = () => {
    this.fetchItem()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.item !== this.props.item) {
      this.fetchItem()
    }
  }

  fetchItem = () => {
    const { fetchItems } = this.props
    const { item } = this.state

    fetchItems(item, (fetchedItems) => {
      this.setState({ item: fetchedItems[0] })
    })
  }

  onRemoveItem = () => {
    const { onSelect } = this.props

    this.setState({item: null})
    onSelect(null)
  }

  onSelect = (results) => {
    const { onSelect } = this.props

    this.setState({ item: results[0] })
    onSelect(results[0])
  }

  render () {
    const { className, formatListItem } = this.props
    const { item } = this.state

    const props = {
      ...this.props,
      items: [item],
      onSelect: this.onSelect
    }

    return (
      <div className={`AutocompleteList ${className || ''}`}>
        {item &&
          <div className='Autocomplete__list'>
            <ListItem
              className='Autocomplete__list-item'
            >
              {formatListItem
                ? formatListItem()
                : <span className='selected'>
                    {item.title}
                  </span>
              }
              <button
                className='remove-button'
                onClick={() => this.onRemoveItem()}
              />
            </ListItem>
          </div>
        }
        <Autocomplete {...props} />

      </div>
    )
  }
}

export const ListItem = styled.div`
  ${Fonts.garamond('s17')}
  align-items: center;
  border: 2px solid ${colors.grayRegular};
  color: ${props => props.color ? props.color : colors.purpleRegular};
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

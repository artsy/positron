import PropTypes from "prop-types"
import React, { Component } from "react"
import { clone, compact, uniq } from "lodash"
import Icon from "@artsy/reaction/dist/Components/Icon"

export class Autocomplete extends Component {
  static propTypes = {
    autoFocus: PropTypes.bool,
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

  state = {
    searchResults: [],
    loading: false,
  }

  componentDidMount = () => {
    if (this.textInput) {
      this.addAutocomplete()
    }
  }

  addAutocomplete = () => {
    const { url, filter } = this.props

    const returnItems = items => {
      return items.results.map(item => {
        return {
          _id: item.id,
          title: item.title,
          thumbnail_image: item.thumbnail_image,
        }
      })
    }

    this.engine = new Bloodhound({
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace("value"),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url,
        filter: filter || returnItems,
        ajax: {
          beforeSend: () => {
            this.setState({ loading: true })
          },
          complete: () => {
            this.setState({ loading: false })
          },
        },
      },
    })
    this.engine.initialize()
  }

  search = value => {
    if (this.engine.remote.url !== this.props.url) {
      this.engine.remote.url = this.props.url
    }
    this.engine.get(value, searchResults => {
      this.setState({ searchResults })
    })
  }

  formatSelected = async selected => {
    const { formatSelected } = this.props

    try {
      if (!formatSelected) {
        return selected.id || selected._id
      } else {
        return await formatSelected(selected)
      }
    } catch (error) {
      console.error(error)
    }
  }

  onSelect = async selected => {
    const { items, onSelect } = this.props
    let newItems
    if (items) {
      newItems = clone(items)
    } else {
      newItems = []
    }

    try {
      const item = await this.formatSelected(selected)

      newItems.push(item)
      onSelect(uniq(newItems))
      this.onBlur()

      if (this.textInput) {
        this.textInput.focus()
      }
    } catch (err) {
      console.error(err)
    }
  }

  onBlur = () => {
    if (this.textInput) {
      this.textInput.blur()
      this.textInput.value = ""
    }
    this.setState({ searchResults: [] })
  }

  isFocused = () => {
    return this.textInput === document.activeElement
  }

  formatResult(item) {
    return (
      <div className="Autocomplete__item">
        <div className="Autocomplete__item-img">
          {item.thumbnail_image && <img src={item.thumbnail_image || ""} />}
        </div>
        <div className="Autocomplete__item-title">
          {item.title || item.name}
        </div>
      </div>
    )
  }

  formatSearchResults = () => {
    const { formatSearchResult } = this.props
    const { loading } = this.state
    const searchResults = compact(this.state.searchResults)

    if (searchResults.length) {
      return searchResults.map((item, i) => {
        return (
          <div
            key={i}
            className="Autocomplete__result"
            onClick={() => this.onSelect(item)}
          >
            {formatSearchResult ? (
              <div className="Autocomplete__item">
                {formatSearchResult(item)}
              </div>
            ) : (
              this.formatResult(item)
            )}
          </div>
        )
      })
    } else if (loading) {
      return (
        <div className="Autocomplete__item Autocomplete__item--loading">
          <div className="loading-spinner" />
        </div>
      )
    } else {
      return (
        <div className="Autocomplete__item Autocomplete__item--empty">
          No results
        </div>
      )
    }
  }

  renderSearchResults = () => {
    if (this.isFocused()) {
      // display if input is focused
      return (
        <div className="Autocomplete__results">
          <div className="Autocomplete__results-list">
            {this.formatSearchResults()}
          </div>
          <div className="Autocomplete__results-bg" onClick={this.onBlur} />
        </div>
      )
    }
  }

  render() {
    const { autoFocus, className, disabled, placeholder } = this.props

    return (
      <div className={`Autocomplete ${className ? className : ""}`}>
        <Icon name="search" color="black" className="Autocomplete__icon" />
        <input
          autoFocus={autoFocus}
          className="Autocomplete__input bordered-input"
          disabled={disabled}
          onChange={e => this.search(e.target.value)}
          placeholder={placeholder}
          ref={input => {
            this.textInput = input
          }}
        />
        {this.renderSearchResults()}
      </div>
    )
  }
}

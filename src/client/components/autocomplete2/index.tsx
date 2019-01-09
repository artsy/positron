import { Box, color, Flex } from "@artsy/palette"
import Icon from "@artsy/reaction/dist/Components/Icon"
import Input from "@artsy/reaction/dist/Components/Input"
import { clone, compact, uniq } from "lodash"
import React, { Component, ReactNode } from "react"
import styled from "styled-components"

export interface Item {
  name?: string
  title?: string
}

export interface SearchResultItem extends Item {
  id?: string
  thumbnail_image?: string
}

export interface AutocompleteProps {
  disabled?: boolean
  filter?: any
  formatSelected?: any
  formatSearchResult?: (item: Item | undefined) => ReactNode
  items?: Item[]
  onSelect: any
  placeholder: string
  url: string
}

interface AutocompleteState {
  searchResults: any[]
  hasFocus: boolean
  loading: boolean
}

export class Autocomplete extends Component<
  AutocompleteProps,
  AutocompleteState
> {
  private textInput: React.RefObject<HTMLInputElement>
  public engine

  constructor(props) {
    super(props)
    this.textInput = React.createRef()

    this.state = {
      searchResults: [],
      hasFocus: false,
      loading: false,
    }
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
    // @ts-ignore
    const datumTokenizer = Bloodhound.tokenizers.obj.whitespace("value")
    // @ts-ignore
    const queryTokenizer = Bloodhound.tokenizers.whitespace
    // @ts-ignore
    this.engine = new Bloodhound({
      datumTokenizer,
      queryTokenizer,
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
      new Error(error)
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
    } catch (err) {
      new Error(err)
    }
  }

  onBlur = () => {
    this.setState({ searchResults: [], hasFocus: false })
  }

  formatResult = (searchResult: SearchResultItem) => {
    return (
      <AutocompleteResult>
        <AutocompleteResultImg width={45} height={45} mr={15}>
          {searchResult.thumbnail_image && (
            <img src={searchResult.thumbnail_image || ""} />
          )}
        </AutocompleteResultImg>
        <div>{searchResult.title || searchResult.name}</div>
      </AutocompleteResult>
    )
  }

  formatSearchResults = () => {
    const { formatSearchResult } = this.props
    const { loading } = this.state
    const searchResults = compact(this.state.searchResults)
    return null
    // if (searchResults.length) {
    //   return searchResults.map((searchResult, i) => {
    //     return (
    //       <div key={i} onClick={() => this.onSelect(searchResult)}>
    //         {formatSearchResult ? (
    //           <AutocompleteResult>
    //             {formatSearchResult(searchResult)}
    //           </AutocompleteResult>
    //         ) : (
    //           this.formatResult(searchResult)
    //         )}
    //       </div>
    //     )
    //   })
    // } else if (loading) {
    //   return (
    //     <AutocompleteResult>
    //       <div className="loading-spinner" />
    //     </AutocompleteResult>
    //   )
    // } else {
    //   return <AutocompleteResult isEmpty>No results</AutocompleteResult>
    // }
  }

  renderSearchResults = () => {
    if (this.state.hasFocus) {
      return (
        <AutocompleteResults>
          <AutocompleteResultsBackground onClick={this.onBlur} />
          <div>{this.formatSearchResults()}</div>
        </AutocompleteResults>
      )
    }
  }

  render() {
    const { disabled, placeholder } = this.props

    return (
      <AutocompleteWrapper>
        <SearchIcon name="search" color="black" />
        <Input
          block
          disabled={disabled}
          innerRef={this.textInput}
          onChange={e => this.search(e.currentTarget.value)}
          onFocus={() => this.setState({ hasFocus: true })}
          placeholder={placeholder}
          type="text"
        />
        {this.renderSearchResults()}
      </AutocompleteWrapper>
    )
  }
}

export const AutocompleteWrapper = styled.div`
  position: relative;

  input {
    padding-left: 36px;
  }
`

export const SearchIcon = styled(Icon)`
  position: absolute;
  top: 7px;
  left: 3px;
`

export const AutocompleteResults = styled.div`
  border-left: 1px solid ${color("black10")};
  border-right: 1px solid ${color("black10")};
  position: absolute;
  z-index: 10;
  width: 100%;
  top: calc(100% - 15px);
`

const AutocompleteResultsBackground = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  opacity: 0;
  z-index: -1;
`

const AutocompleteResult = styled(Flex)<{ isEmpty?: boolean; children: any }>`
  padding: 10px;
  background: white;
  color: ${color("black100")};
  align-items: center;
  border-bottom: 1px solid ${color("black10")};
  min-height: 50px;
  z-index: 3;

  &:hover {
    background: ${color("black10")};
    cursor: pointer;
  }

  ${props =>
    props.isEmpty &&
    `
    background: ${color("black10")};
    color: ${color("black30")};
  `};
`

export const AutocompleteResultImg = styled(Box)`
  background: ${color("black30")};
  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`

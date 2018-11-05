import configureStore from "redux-mock-store"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { MentionedList } from "../../../components/featuring/mentioned_list"
import { ListItem } from "client/components/autocomplete2/list"
import Artists from "client/collections/artists.coffee"
import Artworks from "client/collections/artworks.coffee"

describe("MentionedList", () => {
  let props
  let response

  const getWrapper = props => {
    const mockStore = configureStore([])
    const { article, mentioned } = props

    const store = mockStore({
      app: {
        channel: { type: "editorial" },
      },
      edit: {
        article,
        mentioned,
      },
    })

    return mount(
      <Provider store={store}>
        <MentionedList {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      article: cloneDeep(StandardArticle),
      onAddFeaturedItemAction: jest.fn(),
      mentioned: {
        artist: [
          {
            _id: "123",
            name: "Pablo Picasso",
          },
        ],
        artwork: [
          {
            _id: "456",
            name: "Stripes",
          },
        ],
      },
      metaphysicsURL: "https://metaphysics-staging.artsy.net",
      model: "artist",
      setMentionedItemsAction: jest.fn(),
      user: { access_token: "" },
    }

    response = {
      body: {
        data: {
          artists: [
            {
              _id: "123",
              name: "Pablo Picasso",
            },
          ],
        },
      },
    }
  })

  it("Renders mentioned artists", () => {
    const component = getWrapper(props)

    expect(component.find(ListItem).exists()).toBe(true)
    expect(component.text()).toMatch(props.mentioned.artist[0].name)
  })

  it("Renders mentioned artworks", () => {
    response.body.data.artworks = []
    props.model = "artwork"
    const component = getWrapper(props)

    expect(component.find(ListItem).exists()).toBe(true)
    expect(component.text()).toMatch(props.mentioned.artwork[0].name)
  })

  it("Calls #getMentionedArtists on mount if model is artist", () => {
    const component = getWrapper(props)
    component.find(MentionedList).instance().getMentionedArtists = jest.fn()
    component
      .find(MentionedList)
      .instance()
      .componentWillMount()
    expect(
      component.find(MentionedList).instance().getMentionedArtists
    ).toBeCalled()
  })

  it("Calls #getMentionedArtworks on mount if model is artwork", () => {
    props.model = "artwork"
    const component = getWrapper(props)
    component.find(MentionedList).instance().getMentionedArtworks = jest.fn()
    component
      .find(MentionedList)
      .instance()
      .componentWillMount()
    expect(
      component.find(MentionedList).instance().getMentionedArtworks
    ).toBeCalled()
  })

  it("#getMentionedArtists fetches items and calls #setMentionedAction", () => {
    Artists.prototype.getOrFetchIds = jest.fn()
    getWrapper(props)
    Artists.prototype.getOrFetchIds.mock.calls[0][1].success(props.model, [])
    expect(props.setMentionedItemsAction).toBeCalled()
  })

  it("#getMentionedArtworks fetches items and calls #setMentionedAction", () => {
    Artworks.prototype.getOrFetchIds = jest.fn()
    props.model = "artwork"
    getWrapper(props)
    Artworks.prototype.getOrFetchIds.mock.calls[0][1].success(props.model, [])
    expect(props.setMentionedItemsAction).toBeCalled()
  })

  it('Renders "Feature All" checkbox if mentioned length', () => {
    const component = getWrapper(props)
    expect(component.text()).toMatch("Feature all mentioned")
  })

  it('"Feature All" checkbox features mentioned items on click', () => {
    const component = getWrapper(props)
    component
      .find(".flat-checkbox")
      .first()
      .simulate("click")

    expect(props.onAddFeaturedItemAction.mock.calls[0][0]).toBe(props.model)
    expect(props.onAddFeaturedItemAction.mock.calls[0][1].name).toMatch(
      props.mentioned.artist[0].name
    )
    expect(props.onAddFeaturedItemAction.mock.calls[0][1]._id).toMatch(
      props.mentioned.artist[0]._id
    )
  })

  it("#isFeatured returns true if item _id is already featured", () => {
    props.article.primary_featured_artist_ids = ["123"]
    const component = getWrapper(props).find(MentionedList)
    const isFeatured = component
      .instance()
      .isFeatured(props.mentioned.artist[0]._id)

    expect(isFeatured).toBe(true)
  })

  it("#isFeatured returns false if item _id is not featured", () => {
    props.article.primary_featured_artist_ids = []
    const component = getWrapper(props).find(MentionedList)
    const isFeatured = component
      .instance()
      .isFeatured(props.mentioned.artist[0]._id)

    expect(isFeatured).toBeFalsy()
  })

  it("#notFeaturedArray returns array of mentioned items that are not featured", () => {
    const artist = { _id: "234", name: "Chip Hughes" }
    props.article.primary_featured_artist_ids = ["123"]
    props.mentioned.artist.push(artist)
    const component = getWrapper(props).find(MentionedList)
    const notFeaturedArray = component.instance().notFeaturedArray()

    expect(notFeaturedArray.length).not.toBe(props.mentioned.artist.length)
    expect(notFeaturedArray[0].name).toBe(props.mentioned.artist[1].name)
  })
})

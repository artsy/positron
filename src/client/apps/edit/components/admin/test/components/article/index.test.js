import configureStore from "redux-mock-store"
import request from "superagent"
import { cloneDeep, extend } from "lodash"
import { mount, shallow } from "enzyme"
import React from "react"
import { Provider } from "react-redux"
import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { AdminArticle } from "../../../components/article"
import { ArticleAuthors } from "../../../components/article/article_authors"
import { ArticlePublishDate } from "../../../components/article/article_publish_date"
import { AutocompleteList } from "/client/components/autocomplete2/list"
import { ButtonMedium } from '../../../components/article/button_medium'
require("typeahead.js")

jest.mock("superagent", () => {
  return {
    get: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnValue({
      end: jest.fn(),
    }),
  }
})

describe("AdminArticle", () => {
  let props
  let response

  const getWrapper = props => {
    const mockStore = configureStore([])
    const { article, channel } = props

    const store = mockStore({
      app: { channel },
      edit: { article },
    })

    return mount(
      <Provider store={store}>
        <AdminArticle {...props} />
      </Provider>
    )
  }

  beforeEach(() => {
    let article = extend(cloneDeep(StandardArticle), {
      author: { name: "Artsy Editorial", id: "123" },
    })

    props = {
      article,
      channel: { type: "editorial" },
      onChangeArticleAction: jest.fn(),
    }

    response = {
      body: {
        data: {
          articles: [
            {
              id: "123",
              title:
                "How a Dissatisfied Housewife Was Saved by Radical Performance",
            },
          ],
        },
      },
    }
  })

  describe("Rendering", () => {
    it("Renders authors component", () => {
      const component = getWrapper(props)
      expect(component.find(ArticleAuthors).exists()).toBe(true)
    })

    it("Renders tier buttons", () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch("Article Tier")
      expect(
        component
          .find("button")
          .at(0)
          .text()
      ).toBe("Tier 1")
      expect(
        component
          .find("button")
          .at(1)
          .text()
      ).toBe("Tier 2")
    })

    it("if news layout, does not render tier buttons", () => {
      props.article.layout = "news"
      const component = getWrapper(props)

      expect(component.html()).not.toMatch("Article Tier")
      expect(component.find("button").length).toBe(1)
    })

    it("Renders featured/magazine buttons", () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch("Magazine Feed")
      expect(
        component
          .find("button")
          .at(2)
          .text()
      ).toBe("Yes")
      expect(
        component
          .find("button")
          .at(3)
          .text()
      ).toBe("No")
    })

    it("if news layout, does not render featured/magazine buttons", () => {
      props.article.layout = "news"
      const component = getWrapper(props)

      expect(component.html()).not.toMatch("Magazine Feed")
      expect(component.find("button").length).toBe(1)
    })

    it("Renders layout buttons if editorial", () => {
      const component = getWrapper(props)

      expect(component.html()).toMatch("Article Layout")
      expect(
        component
          .find("button")
          .at(4)
          .text()
      ).toBe("Standard")
      expect(
        component
          .find("button")
          .at(5)
          .text()
      ).toBe("Feature")
    })

    it("if news layout, does not render layout buttons", () => {
      props.article.layout = "news"
      const component = getWrapper(props)

      expect(component.html()).not.toMatch("Article Layout")
      expect(component.html()).not.toMatch("Standard")
      expect(component.html()).not.toMatch("Feature")
    })

    it("If not editorial, does not render layout buttons", () => {
      props.channel.type = "partner"
      const component = getWrapper(props)

      expect(component.html()).not.toMatch("Article Layout")
      expect(component.html()).not.toMatch("Standard")
      expect(component.html()).not.toMatch("Feature")
    })

    it("Renders indexable checkbox", () => {
      const component = getWrapper(props)
      expect(component.html()).toMatch("Index for search")
    })

    it("Renders Google news checkbox", () => {
      const component = getWrapper(props)
      expect(component.html()).toMatch("Exclude from Google News")
    })

    it("Renders publish date component", () => {
      const component = getWrapper(props)
      expect(component.find(ArticlePublishDate).exists()).toBe(true)
    })

    it("Renders related articles autocomplete", () => {
      const component = getWrapper(props)
      expect(component.html()).toMatch("Related Articles")
      expect(
        component
          .find(AutocompleteList)
          .at(1)
          .getElement().props.url
      ).toMatch("articles")
    })
  })

  it("#fetchArticles can fetch related articles", () => {
    const callback = jest.fn()
    request.query().end.mockImplementation(() => {
      callback(response.body.data.articles)
    })
    props.article.related_article_ids = ["123"]

    const component = shallow(<AdminArticle {...props} />)
    component.instance().fetchArticles()
    expect(callback).toBeCalled()
  })

  describe("Editing", () => {
    it("Can change article tier", () => {
      props.article.tier = 1
      const component = getWrapper(props)
      component
        .find("button")
        .at(1)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("tier")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(2)
    })

    it("Can change featured/magazine", () => {
      props.article.featured = true
      const component = getWrapper(props)
      component
        .find("button")
        .at(3)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("featured")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(false)
    })

    it("Can change article layout", () => {
      const component = getWrapper(props)
      component
        .find("button")
        .at(5)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("layout")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe("feature")
    })

    it("Can change indexable checkbox", () => {
      props.article.indexable = true
      const component = getWrapper(props)
      component
        .find(".flat-checkbox")
        .at(0)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("indexable")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(false)
    })

    it("Can change Google news checkbox", () => {
      props.article.exclude_google_news = true
      const component = getWrapper(props)
      component
        .find(".flat-checkbox")
        .at(1)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe(
        "exclude_google_news"
      )
      expect(props.onChangeArticleAction.mock.calls[0][1]).toBe(false)
    })

    it("Can change video duration", () => {
      props.article.layout = "video"
      props.article.media = { duration: 212 }

      const component = getWrapper(props)

      const inputForMin = component.find("input[type='number']").at(0)
      const inputForSec = component.find("input[type='number']").at(1)

      expect(inputForMin.props().defaultValue).toEqual(3)
      expect(inputForSec.props().defaultValue).toEqual(32)

      inputForMin.simulate('change', { target: { value: 10 }})
      inputForSec.simulate('change', { target: { value: 30 }})

      expect(props.onChangeArticleAction.mock.calls[0][0]).toEqual("media")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toEqual({ duration: 632 })

      expect(props.onChangeArticleAction.mock.calls[1][0]).toEqual("media")
      expect(props.onChangeArticleAction.mock.calls[1][1]).toEqual({ duration: 630 })
    })

    it("Can change video release date", () => {
      props.article.layout = "video"
      props.article.media = { release_date: "2017-02-07" }

      const component = getWrapper(props)
      component
        .find('input[type="date"]')
        .at(1)
        .simulate("change", { target: { value: "2017-02-07" } })

      component
        .find(ButtonMedium)
        .at(1)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toEqual("media")
      expect(props.onChangeArticleAction.mock.calls[0][1].release_date).toMatch("2017-02-07")
    })

    it("Can change video published", () => {
      props.article.layout = "video"
      props.article.media = { published: false }

      const component = getWrapper(props)
      component
        .find(".flat-checkbox")
        .at(2)
        .simulate("click")

      expect(props.onChangeArticleAction.mock.calls[0][0]).toBe("media")
      expect(props.onChangeArticleAction.mock.calls[0][1]).toEqual({ published: true })
    })
  })
})

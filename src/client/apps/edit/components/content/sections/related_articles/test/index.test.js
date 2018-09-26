import request from "superagent"
import React from "react"
import { cloneDeep } from "lodash"
import { mount } from "enzyme"
import {
  FeatureArticle,
  ShortStandardArticle,
  StandardArticle,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { ArticleCard } from "@artsy/reaction/dist/Components/Publishing/RelatedArticles/ArticleCards/ArticleCard"
import { EditArticleCard } from "../components/edit_article_card"
import { RelatedArticlesInput } from "../components/related_articles_input"
import { RelatedArticles } from "../index"
require("typeahead.js")

jest.mock("superagent", () => {
  return {
    get: jest.genMockFunction().mockReturnThis(),
    set: jest.genMockFunction().mockReturnThis(),
    query: jest.genMockFunction().mockReturnThis(),
    end: jest.fn(),
  }
})

describe("RelatedArticles", () => {
  let props

  beforeEach(() => {
    request.end.mockImplementation(cb => {
      cb(null, {
        body: {
          data: {
            articles: [FeatureArticle, StandardArticle],
          },
        },
      })
    })

    props = {
      article: cloneDeep(StandardArticle),
      onChange: jest.fn(),
    }
  })

  it("Renders an input and placeholder ArticleCard if no related ids", () => {
    const component = mount(<RelatedArticles {...props} />)
    expect(component.find(RelatedArticlesInput).length).toBe(1)
    expect(component.find(ArticleCard).length).toBe(1)
    expect(component.text()).toMatch(props.article.title)
    expect(component.text()).toMatch("Title")
    expect(component.text()).toMatch("Article or video description...")
    expect(component.text()).toMatch("Publish Date")
  })

  it("Fetches related and renders EditArticleCard if related_article_ids length", () => {
    props.article.related_article_ids = ["123", "456"]
    const component = mount(<RelatedArticles {...props} />)
    expect(component.find(EditArticleCard).length).toBe(2)
    expect(component.state().relatedArticles.length).toBe(2)
    expect(component.text()).toMatch(FeatureArticle.title)
  })

  it("onAddArticle calls onChange and fetches articles", () => {
    const component = mount(<RelatedArticles {...props} />)
    component.instance().onAddArticle(["678"])
    expect(props.onChange.mock.calls[0][0]).toBe("related_article_ids")
    expect(props.onChange.mock.calls[0][1][0]).toBe("678")
    expect(request.end).toBeCalled()
  })

  it("onRemoveArticle calls onChange and resets state.relatedArticles", () => {
    props.article.related_article_ids = ["123", "678"]
    const component = mount(<RelatedArticles {...props} />)
    component.instance().onRemoveArticle("678", 1)
    expect(props.onChange.mock.calls[0][0]).toBe("related_article_ids")
    expect(props.onChange.mock.calls[0][1].length).toBe(1)
    expect(props.onChange.mock.calls[0][1][0]).toBe("123")
    expect(component.state().relatedArticles.length).toBe(1)
  })

  it("onDragEnd calls onChange and resets state", () => {
    let relatedArticles = [
      FeatureArticle,
      StandardArticle,
      ShortStandardArticle,
    ]
    const component = mount(<RelatedArticles {...props} />)
    component.setState({ relatedArticles })
    component.instance().onDragEnd(relatedArticles.reverse())
    expect(props.onChange.mock.calls[0][0]).toBe("related_article_ids")
    expect(props.onChange.mock.calls[0][1][2]).toBe(FeatureArticle._id)
    expect(component.state().relatedArticles[2]).toBe(FeatureArticle)
  })
})

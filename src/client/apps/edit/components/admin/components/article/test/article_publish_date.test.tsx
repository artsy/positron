import { StandardArticle } from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import { mount } from "enzyme"
import { cloneDeep } from "lodash"
import moment from "moment"
import React from "react"
import { ArticlePublishDate } from "../article_publish_date"

describe("ArticlePublishDate", () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(<ArticlePublishDate {...passedProps} />)
  }

  beforeEach(() => {
    const article = cloneDeep(StandardArticle)

    props = {
      article,
      onChange: jest.fn(),
    }
  })

  it("Renders a label", () => {
    const component = getWrapper()
    expect(component.text()).toMatch("Publish Date/Time")
  })

  describe("date", () => {
    it("Can render a date input with current date as default", () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper()

      expect(
        component.find('input[type="date"]').getElement().props.defaultValue
      ).toBe(
        moment()
          .local()
          .format("YYYY-MM-DD")
      )
    })

    it("Can render a date input with saved published_at", () => {
      const component = getWrapper()

      expect(
        component.find('input[type="date"]').getElement().props.defaultValue
      ).toBe(moment(props.article.published_at).format("YYYY-MM-DD"))
    })

    it("Can render a date input with saved scheduled_published_at", () => {
      const date = moment()
        .add("1", "days")
        .toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper()

      expect(
        component.find('input[type="date"]').getElement().props.defaultValue
      ).toBe(moment(props.article.scheduled_publish_at).format("YYYY-MM-DD"))
    })

    it("Can change the date", () => {
      props.article.published = true
      const component = getWrapper()
      const instance = component.instance() as ArticlePublishDate
      instance.date.value = "2018-05-04"
      instance.onScheduleChange()

      expect(props.onChange.mock.calls[0][0]).toBe("published_at")
      expect(props.onChange.mock.calls[0][1]).toMatch("2018-05-04")
      expect(instance.state.hasChanged).toBeFalsy()
    })
  })

  describe("time", () => {
    it("Can render a time input with current time as default", () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper()

      expect(
        component.find('input[type="time"]').getElement().props.defaultValue
      ).toMatch(
        moment()
          .local()
          .format("HH:")
      )
    })

    it("Can render a time input with saved published_at", () => {
      const component = getWrapper()

      expect(
        component.find('input[type="time"]').getElement().props.defaultValue
      ).toBe(moment(props.article.published_at).format("HH:mm"))
    })

    it("Can render a time input with saved scheduled_published_at", () => {
      const date = moment()
        .add("1", "days")
        .toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper()

      expect(
        component.find('input[type="time"]').getElement().props.defaultValue
      ).toBe(moment(props.article.scheduled_publish_at).format("HH:mm"))
    })

    it("Can change the time", () => {
      props.article.published = true
      const component = getWrapper().instance() as ArticlePublishDate
      component.time.value = "02:34"
      component.onScheduleChange()

      expect(props.onChange.mock.calls[0][0]).toBe("published_at")
      expect(props.onChange.mock.calls[0][1]).toMatch("02:34")
    })
  })

  describe("#setupPublishDate", () => {
    it("Returns expected date and time if published_at", () => {
      const component = getWrapper().instance() as ArticlePublishDate
      const setupDate = component.setupPublishDate()

      expect(setupDate.publish_date).toBe(
        moment(props.article.published_at).format("YYYY-MM-DD")
      )
      expect(setupDate.publish_time).toBe(
        moment(props.article.published_at).format("HH:mm")
      )
    })

    it("Returns expected date and time if scheduled_published_at", () => {
      const date = moment()
        .add("1", "days")
        .toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper().instance() as ArticlePublishDate
      const setupDate = component.setupPublishDate()

      expect(setupDate.publish_date).toBe(moment(date).format("YYYY-MM-DD"))
      expect(setupDate.publish_time).toBe(moment(date).format("HH:mm"))
    })

    it("Returns current date if no saved dates", () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper().instance() as ArticlePublishDate
      const setupDate = component.setupPublishDate()

      expect(setupDate.publish_date).toBe(
        moment()
          .local()
          .format("YYYY-MM-DD")
      )
    })
  })

  describe("#getPublishText", () => {
    it('Returns "Update" if published', () => {
      props.article.published = true
      const component = getWrapper().instance() as ArticlePublishDate
      const text = component.getPublishText()

      expect(text).toBe("Update")
    })

    it('Returns "Update" if scheduled_publish_at has changed', () => {
      props.article.scheduled_publish_at = moment().toISOString()
      const component = getWrapper().instance() as ArticlePublishDate
      component.setState({ hasChanged: true })
      const text = component.getPublishText()

      expect(text).toBe("Update")
    })

    it('Returns "Schedule" if unpublished', () => {
      const component = getWrapper().instance() as ArticlePublishDate
      const text = component.getPublishText()

      expect(text).toBe("Schedule")
    })

    it('Returns "Unschedule" if unpublished and scheduled_published_at', () => {
      const date = moment()
        .add("1", "days")
        .toISOString()
      props.article.scheduled_publish_at = date
      const component = getWrapper().instance() as ArticlePublishDate
      const text = component.getPublishText()

      expect(text).toBe("Unschedule")
    })
  })

  it("#hasChanged returns true if state date and time do not match inputs", () => {
    const component = getWrapper().instance() as ArticlePublishDate
    component.date.value = "2018-02-02"
    component.time.value = "02:34"
    const hasChanged = component.hasChanged()

    expect(hasChanged).toBe(true)
  })

  it("#onChangeFocus sets state if focus has changed", () => {
    const component = getWrapper()
    const instance = component.instance() as ArticlePublishDate

    instance.setState = jest.fn()
    component.update()
    instance.date.value = "2018-02-02"
    instance.time.value = "02:34"
    instance.onChangeFocus()

    expect(instance.setState).toBeCalledWith({ hasChanged: true, focus: false })
  })

  it("Button calls #onScheduleChange on click", () => {
    const component = getWrapper()
    component.setState({ hasChanged: true })
    component
      .find("button")
      .at(0)
      .simulate("click")

    expect(props.onChange.mock.calls[0][0]).toBe("scheduled_publish_at")
  })

  describe("#onScheduleChange", () => {
    it("Sets published_at if article is published", () => {
      props.article.published = true
      const component = getWrapper()
      const instance = component.instance() as ArticlePublishDate
      instance.date.value = "2018-02-02"
      instance.setState({ hasChanged: true })
      component
        .find("button")
        .at(0)
        .simulate("click")

      expect(props.onChange.mock.calls[0][0]).toBe("published_at")
      expect(props.onChange.mock.calls[0][1]).toMatch("2018-02-02")
    })

    it("Sets scheduled_publish_at if article is not published", () => {
      const component = getWrapper()
      const instance = component.instance() as ArticlePublishDate
      instance.date.value = "2018-02-02"
      instance.setState({ hasChanged: true })
      component
        .find("button")
        .at(0)
        .simulate("click")

      expect(props.onChange.mock.calls[0][0]).toBe("scheduled_publish_at")
      expect(props.onChange.mock.calls[0][1]).toMatch("2018-02-02")
    })

    it("Calls #onUnschedule if scheduled_publish_at exists", () => {
      delete props.article.published_at
      props.article.scheduled_publish_at = new Date().toISOString()
      const component = getWrapper()
      component
        .find("button")
        .at(0)
        .simulate("click")

      expect(props.onChange.mock.calls[0][0]).toBe("scheduled_publish_at")
      expect(props.onChange.mock.calls[0][1]).toBe(null)
    })

    it("Sets state.hasChanged to false", () => {
      const component = getWrapper()
      const instance = component.instance() as ArticlePublishDate
      component.setState({ hasChanged: true })
      component
        .find("button")
        .at(0)
        .simulate("click")

      expect(instance.state.hasChanged).toBe(false)
    })
  })

  describe("#onUnschedule", () => {
    beforeEach(() => {
      delete props.article.published_at
      props.article.scheduled_publish_at = new Date().toISOString()
    })

    it("Un-sets scheduled_publish_at", () => {
      const component = getWrapper().instance() as ArticlePublishDate
      component.onUnschedule()

      expect(props.onChange.mock.calls[0][0]).toBe("scheduled_publish_at")
      expect(props.onChange.mock.calls[0][1]).toBe(null)
    })

    it("Updates the state", () => {
      const component = getWrapper(props)
      const instance = component.instance() as ArticlePublishDate
      instance.onUnschedule()

      expect(instance.state.publish_date).toBe(null)
      expect(instance.state.publish_time).toBe(null)
      expect(instance.state.hasChanged).toBe(false)
    })
  })
})

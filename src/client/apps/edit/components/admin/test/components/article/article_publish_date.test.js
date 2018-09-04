import moment from 'moment'
import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { StandardArticle } from '@artsy/reaction/dist/Components/Publishing/Fixtures/Articles'
import { ArticlePublishDate } from '../../../components/article/article_publish_date'

describe('ArticlePublishDate', () => {
  let props

  const getWrapper = (props) => {
    return mount(
      <ArticlePublishDate {...props} />
    )
  }

  beforeEach(() => {
    let article = cloneDeep(StandardArticle)

    props = {
      article,
      onChange: jest.fn()
    }
  })

  it('Renders a label', () => {
    const component = getWrapper(props)
    expect(component.text()).toMatch('Publish Date/Time')
  })

  describe('date', () => {
    it('Can render a date input with current date as default', () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper(props)

      expect(component.find('input[type="date"]').getElement().props.defaultValue).toBe(
        moment().local().format('YYYY-MM-DD')
      )
    })

    it('Can render a date input with saved published_at', () => {
      const component = getWrapper(props)

      expect(component.find('input[type="date"]').getElement().props.defaultValue).toBe(
        moment(props.article.published_at).format('YYYY-MM-DD')
      )
    })

    it('Can render a date input with saved scheduled_published_at', () => {
      const date = moment().add('1', 'days').toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper(props)

      expect(component.find('input[type="date"]').getElement().props.defaultValue).toBe(
        moment(props.article.scheduled_publish_at).format('YYYY-MM-DD')
      )
    })

    it('Can change the date', () => {
      props.article.published = true
      const component = getWrapper(props)
      component.instance().date.value = '2018-05-04'
      component.instance().onScheduleChange()

      expect(props.onChange.mock.calls[0][0]).toBe('published_at')
      expect(props.onChange.mock.calls[0][1]).toMatch('2018-05-04')
      expect(component.state().hasChanged).toBeFalsy()
    })
  })

  describe('time', () => {
    it('Can render a time input with current time as default', () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper(props)

      expect(component.find('input[type="time"]').getElement().props.defaultValue).toMatch(
        moment().local().format('HH:')
      )
    })

    it('Can render a time input with saved published_at', () => {
      const component = getWrapper(props)

      expect(component.find('input[type="time"]').getElement().props.defaultValue).toBe(
        moment(props.article.published_at).format('HH:mm')
      )
    })

    it('Can render a time input with saved scheduled_published_at', () => {
      const date = moment().add('1', 'days').toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper(props)

      expect(component.find('input[type="time"]').getElement().props.defaultValue).toBe(
        moment(props.article.scheduled_publish_at).format('HH:mm')
      )
    })

    it('Can change the time', () => {
      props.article.published = true
      const component = getWrapper(props)
      component.instance().time.value = '02:34'
      component.instance().onScheduleChange()

      expect(props.onChange.mock.calls[0][0]).toBe('published_at')
      expect(props.onChange.mock.calls[0][1]).toMatch('02:34')
    })
  })

  describe('#setupPublishDate', () => {
    it('Returns expected date and time if published_at', () => {
      const component = getWrapper(props)
      const setupDate = component.instance().setupPublishDate()

      expect(setupDate.publish_date).toBe(moment(props.article.published_at).format('YYYY-MM-DD'))
      expect(setupDate.publish_time).toBe(moment(props.article.published_at).format('HH:mm'))
    })

    it('Returns expected date and time if scheduled_published_at', () => {
      const date = moment().add('1', 'days').toISOString()
      props.article.scheduled_publish_at = date
      delete props.article.published_at
      const component = getWrapper(props)
      const setupDate = component.instance().setupPublishDate()

      expect(setupDate.publish_date).toBe(moment(date).format('YYYY-MM-DD'))
      expect(setupDate.publish_time).toBe(moment(date).format('HH:mm'))
    })

    it('Returns current date if no saved dates', () => {
      props.article.published = false
      delete props.article.published_at
      const component = getWrapper(props)
      const setupDate = component.instance().setupPublishDate()

      expect(setupDate.publish_date).toBe(moment().local().format('YYYY-MM-DD'))
    })
  })

  describe('#getPublishText', () => {
    it('Returns "Update" if published', () => {
      props.article.published = true
      const component = getWrapper(props)
      const text = component.instance().getPublishText()

      expect(text).toBe('Update')
    })

    it('Returns "Update" if scheduled_publish_at has changed', () => {
      props.article.scheduled_publish_at = moment().toISOString()
      const component = getWrapper(props)
      component.setState({ hasChanged: true })
      const text = component.instance().getPublishText()

      expect(text).toBe('Update')
    })

    it('Returns "Schedule" if unpublished', () => {
      const component = getWrapper(props)
      const text = component.instance().getPublishText()

      expect(text).toBe('Schedule')
    })

    it('Returns "Unschedule" if unpublished and scheduled_published_at', () => {
      const date = moment().add('1', 'days').toISOString()
      props.article.scheduled_publish_at = date
      const component = getWrapper(props)
      const text = component.instance().getPublishText()

      expect(text).toBe('Unschedule')
    })
  })

  it('#hasChanged returns true if state date and time do not match inputs', () => {
    const component = getWrapper(props)
    component.instance().date.value = '2018-02-02'
    component.instance().time.value = '02:34'
    const hasChanged = component.instance().hasChanged()

    expect(hasChanged).toBe(true)
  })

  it('#onChangeFocus sets state if focus has changed', () => {
    const component = getWrapper(props)
    component.instance().setState = jest.fn()
    component.update()
    component.instance().date.value = '2018-02-02'
    component.instance().time.value = '02:34'
    component.instance().onChangeFocus()

    expect(component.instance().setState.mock.calls[0][0].hasChanged).toBe(true)
    expect(component.instance().setState.mock.calls[0][0].focus).toBe(false)
  })

  it('Button calls #onScheduleChange on click', () => {
    const component = getWrapper(props)
    component.find('button').at(0).simulate('click')

    expect(props.onChange.mock.calls[0][0]).toBe('scheduled_publish_at')
  })

  describe('#onScheduleChange', () => {
    it('Sets published_at if article is published', () => {
      props.article.published = true
      const component = getWrapper(props)
      component.instance().date.value = '2018-02-02'
      component.find('button').at(0).simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('published_at')
      expect(props.onChange.mock.calls[0][1]).toMatch('2018-02-02')
    })

    it('Sets scheduled_publish_at if article is not published', () => {
      const component = getWrapper(props)
      component.instance().date.value = '2018-02-02'
      component.find('button').at(0).simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('scheduled_publish_at')
      expect(props.onChange.mock.calls[0][1]).toMatch('2018-02-02')
    })

    it('Calls #onUnschedule if scheduled_publish_at exists', () => {
      delete props.article.published_at
      props.article.scheduled_publish_at = new Date().toISOString()
      const component = getWrapper(props)
      component.find('button').at(0).simulate('click')

      expect(props.onChange.mock.calls[0][0]).toBe('scheduled_publish_at')
      expect(props.onChange.mock.calls[0][1]).toBe(null)
    })

    it('Sets state.hasChanged to false', () => {
      const component = getWrapper(props)
      component.instance().setState({ hasChanged: true })
      component.find('button').at(0).simulate('click')

      expect(component.state().hasChanged).toBe(false)
    })
  })

  describe('#onUnschedule', () => {
    beforeEach(() => {
      delete props.article.published_at
      props.article.scheduled_publish_at = new Date().toISOString()
    })

    it('Un-sets scheduled_publish_at', () => {
      const component = getWrapper(props)
      component.instance().onUnschedule()

      expect(props.onChange.mock.calls[0][0]).toBe('scheduled_publish_at')
      expect(props.onChange.mock.calls[0][1]).toBe(null)
    })

    it('Updates the state', () => {
      const component = getWrapper(props)
      component.instance().onUnschedule()

      expect(component.state().publish_date).toBe(null)
      expect(component.state().publish_time).toBe(null)
      expect(component.state().hasChanged).toBe(false)
    })
  })
})

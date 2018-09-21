import colors from "@artsy/reaction/dist/Assets/Colors"
import moment from "moment"
import styled from "styled-components"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactDOM from "react-dom"
import { avantgarde } from "@artsy/reaction/dist/Assets/Fonts"

export class ArticlePublishDate extends Component {
  static propTypes = {
    article: PropTypes.object,
    onChange: PropTypes.func,
  }

  state = {
    focus: false,
    hasChanged: false,
    publish_date: null,
    publish_time: null,
  }

  componentWillMount = () => {
    this.setState(this.setupPublishDate())
  }

  onScheduleChange = () => {
    const { article, onChange } = this.props
    const { scheduled_publish_at } = article
    const { hasChanged } = this.state

    if (this.date && this.time) {
      const date = this.date.value
      const time = this.time.value
      const new_published = moment(`${date} ${time}`)
        .local()
        .toISOString()

      if (scheduled_publish_at && !hasChanged) {
        this.onUnschedule()
      } else if (!article.published) {
        onChange("scheduled_publish_at", new_published)
      } else {
        onChange("published_at", new_published)
      }
      this.setState({ hasChanged: false })
    }
  }

  onUnschedule = () => {
    const { onChange } = this.props
    let publish_date = null
    let publish_time = null

    if (this.date && this.time) {
      this.date.value = publish_date
      this.time.value = publish_time
    }
    onChange("scheduled_publish_at", null)
    this.setState({ hasChanged: false, publish_date, publish_time })
  }

  setupPublishDate = () => {
    const { published_at, scheduled_publish_at } = this.props.article
    let publish_date
    let publish_time

    if (scheduled_publish_at) {
      publish_date = moment(scheduled_publish_at).format("YYYY-MM-DD")
      publish_time = moment(scheduled_publish_at).format("HH:mm")
    } else if (published_at) {
      publish_date = moment(published_at).format("YYYY-MM-DD")
      publish_time = moment(published_at).format("HH:mm")
    } else {
      publish_date = moment()
        .local()
        .format("YYYY-MM-DD")
      publish_time = moment()
        .local()
        .format("HH:mm")
    }

    return { publish_date, publish_time }
  }

  getPublishText = () => {
    const { hasChanged } = this.state
    const { published, scheduled_publish_at } = this.props.article

    if (published || (scheduled_publish_at && hasChanged)) {
      return "Update"
    } else if (scheduled_publish_at) {
      return "Unschedule"
    } else {
      return "Schedule"
    }
  }

  onChangeFocus = () => {
    if (this.date && this.time) {
      const dateIsFocused =
        document.activeElement === ReactDOM.findDOMNode(this.date)
      const timeIsFocused =
        document.activeElement === ReactDOM.findDOMNode(this.time)
      const hasChanged = this.hasChanged()

      this.setState({
        hasChanged,
        focus: dateIsFocused || timeIsFocused,
      })
    }
  }

  hasChanged = () => {
    const { publish_date, publish_time } = this.state

    if (this.date && this.time) {
      const dateHasChanged = publish_date !== this.date.value
      const timeHasChanged = publish_time !== this.time.value

      return dateHasChanged || timeHasChanged
    }
  }

  render() {
    const { focus, hasChanged, publish_date, publish_time } = this.state

    return (
      <div className="ArticlePublishDate">
        <label>Publish Date/Time</label>

        <DateContainer>
          <InputGroup
            focus={focus}
            onClick={this.onChangeFocus}
            onMouseUp={this.onChangeFocus}
            onKeyUp={this.onChangeFocus}
          >
            <input
              className="bordered-input"
              defaultValue={publish_date}
              type="date"
              ref={ref => {
                this.date = ref
              }}
              onBlur={this.onChangeFocus}
            />
            <input
              className="bordered-input"
              defaultValue={publish_time}
              type="time"
              ref={ref => {
                this.time = ref
              }}
              onBlur={this.onChangeFocus}
            />
          </InputGroup>

          <ButtonMedium
            background={hasChanged ? colors.redMedium : undefined}
            onClick={this.onScheduleChange}
          >
            {this.getPublishText()}
          </ButtonMedium>
        </DateContainer>
      </div>
    )
  }
}
export const DateContainer = styled.div`
  display: flex;
  margin: 5px 0 40px 0;
`

export const InputGroup = styled.div`
  display: flex;
  border: 2px solid
    ${props => (props.focus ? colors.purpleRegular : colors.grayRegular)};
  transition: border 0.3s;
  margin-right: 20px;
  .bordered-input {
    border: none;
    margin-top: 0;
  }
`

export const ButtonMedium = styled.button`
  padding: 10px 20px;
  color: ${props => (props.color ? props.color : "white")};
  cursor: pointer;
  background: ${props =>
    props.background ? props.background : colors.grayMedium};
  ${avantgarde("s11")} outline: none;
  border: none;
  width: -moz-available;
  width: -webkit-fill-available;
  transition: background 0.3s;
  &:hover {
    background: ${colors.purpleRegular};
  }
`

import { Button, color, Flex } from "@artsy/palette"
import moment from "moment"
import React, { Component } from "react"
import ReactDOM from "react-dom"
import { ArticleData } from "reaction/Components/Publishing/Typings"
import styled from "styled-components"
import { FormLabel } from "../../../../../../components/form_label"

interface ArticlePublishDateProps {
  article: ArticleData
  onChange: (key: string, value: any) => void
}

export class ArticlePublishDate extends Component<ArticlePublishDateProps> {
  public date
  public time

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
    const publish_date = null
    const publish_time = null

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
        <FormLabel>Publish Date/Time</FormLabel>

        <Flex mt={1} mb={40}>
          <InputGroup
            hasFocus={focus}
            mr={20}
            onClick={this.onChangeFocus}
            onMouseUp={this.onChangeFocus}
            onKeyUp={this.onChangeFocus}
          >
            <input
              className="bordered-input"
              defaultValue={publish_date || ""}
              type="date"
              ref={ref => {
                this.date = ref
              }}
              onBlur={this.onChangeFocus}
            />
            <input
              className="bordered-input"
              defaultValue={publish_time || ""}
              type="time"
              ref={ref => {
                this.time = ref
              }}
              onBlur={this.onChangeFocus}
            />
          </InputGroup>

          <Button
            disabled={!hasChanged}
            onClick={this.onScheduleChange}
            width="100%"
            height="auto"
          >
            {this.getPublishText()}
          </Button>
        </Flex>
      </div>
    )
  }
}

export const InputGroup = styled(Flex).attrs<{ hasFocus?: boolean }>({})`
  min-width: 70%;
  border: 1px solid
    ${props => (props.hasFocus ? color("purple100") : color("black10"))};
  transition: border 0.25s;

  &:hover {
    border: 1px solid ${color("purple100")};
  }

  input,
  .bordered-input {
    border: none;
    margin-top: 3px;
  }
`

import {
  Box,
  Button as SystemButton,
  color,
  Separator,
  Theme,
} from "@artsy/palette"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import { set } from "lodash"
import React from "react"
import styled from "styled-components"
import { Campaign } from "./components/campaign"
import { Canvas } from "./components/canvas"
import { Panel } from "./components/panel"

interface DisplayAdminProps {
  curation: any
}

interface DisplayAdminState {
  activeSection?: number
  curation: any
  saveStatus: string
}

export default class DisplayAdmin extends React.Component<
  DisplayAdminProps,
  DisplayAdminState
> {
  constructor(props) {
    super(props)
    this.state = {
      curation: props.curation,
      saveStatus: "Saved",
    }
  }

  onChange = (key, value, index) => {
    const newCuration = this.state.curation.clone()
    const campaign = newCuration.get("campaigns")[index]
    set(campaign, key, value)
    this.setState({
      curation: newCuration,
      saveStatus: "Save",
    })
  }

  save = () => {
    this.state.curation.save(
      {},
      {
        success: () => this.setState({ saveStatus: "Saved" }),
        error: _error => {
          // console.error(error)
          this.setState({ saveStatus: "Error" })
        },
      }
    )
  }

  newCampaign = () => {
    const newCuration = this.state.curation.clone()
    const newCampaign = {
      sov: 0.2,
      panel: { assets: [] },
      canvas: { assets: [] },
    }
    newCuration.get("campaigns").push(newCampaign)
    this.setState({
      curation: newCuration,
      saveStatus: "Save",
      activeSection: newCuration.get("campaigns").length - 1,
    })
  }

  deleteCampaign = index => {
    const confirmDelete = confirm("Are you sure?")
    if (confirmDelete) {
      const newCuration = this.state.curation.clone()
      newCuration.get("campaigns").splice(index, 1)
      this.setState({
        curation: newCuration,
        saveStatus: "Save",
      })
    }
  }

  render() {
    const { curation, saveStatus } = this.state
    const saveColor = saveStatus !== "Saved" ? color("red100") : "black"

    return (
      <Theme>
        <Box py={80}>
          <DropDownList sections={curation.get("campaigns")}>
            {curation.get("campaigns").map((campaign, index) => (
              <Box position="relative" pt={40} key={index}>
                <Box position="absolute" top="-50px" right={0}>
                  <Button
                    variant="secondaryOutline"
                    size="small"
                    onClick={() => this.deleteCampaign(index)}
                  >
                    Delete Campaign
                  </Button>
                </Box>
                <Campaign
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
                <Separator />
                <Panel
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
                <Separator />
                <Canvas
                  campaign={campaign}
                  index={index}
                  onChange={this.onChange}
                />
              </Box>
            ))}
          </DropDownList>

          <Box
            position="fixed"
            top={8}
            zIndex={100}
            right={"calc(50vw + 55px - (1120px / 2))"}
          >
            <Button
              onClick={this.save}
              variant="secondaryOutline"
              color={saveColor}
            >
              {saveStatus}
            </Button>
          </Box>

          <Button width="100%" mt={3} size="large" onClick={this.newCampaign}>
            Add New Campaign
          </Button>
        </Box>
      </Theme>
    )
  }
}

const Button = styled(SystemButton).attrs<{ color?: string }>({})`
  ${props => props.color && `color: ${props.color}`};
`

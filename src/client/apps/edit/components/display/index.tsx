import { ArticleData } from "@artsy/reaction/dist/Components/Publishing/Typings"
import { DropDownList } from "client/components/drop_down/drop_down_list"
import React from "react"
import { connect } from "react-redux"
import { EditAdminContainer } from "../admin"
import DisplayEmail from "./components/email"
import DisplayMagazine from "./components/magazine"
import DisplayPartner from "./components/partner"
import DisplaySearch from "./components/search"
import DisplaySocial from "./components/social"

export interface DisplayProps {
  article: ArticleData
  onChangeArticleAction: (key: string, val: any) => void
}

export const EditDisplay: React.SFC<{ isPartner: boolean }> = props => {
  const { isPartner } = props
  const sections = [
    { title: "Magazine" },
    { title: "Social" },
    { title: "Search" },
    { title: "Email" },
  ]

  return (
    <div>
      {isPartner ? (
        <DisplayPartner />
      ) : (
        <EditAdminContainer pb={95} pt={135} maxWidth={960} px={3} mx="auto">
          <DropDownList activeSections={[0]} openMany sections={sections}>
            <DisplayMagazine />
            <DisplaySocial />
            <DisplaySearch />
            <DisplayEmail />
          </DropDownList>
        </EditAdminContainer>
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  isPartner: state.app.channel.type === "partner",
})

export default connect(mapStateToProps)(EditDisplay)

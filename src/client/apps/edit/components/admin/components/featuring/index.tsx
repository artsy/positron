import { Box, Flex } from "@artsy/palette"
import AutocompleteListMetaphysics from "client/components/autocomplete2/list_metaphysics"
import React from "react"
import { FeaturingMentioned } from "./featuring_mentioned"

interface AdminFeaturingProps {
  isAdmin: boolean
}

export const AdminFeaturing: React.SFC<AdminFeaturingProps> = props => {
  const { isAdmin } = props
  return (
    <div>
      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="partner_ids"
            label="Partners (editorial role required)"
            model="partners"
            placeholder="Search by partner name..."
            disabled={!isAdmin}
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="fair_ids"
            label="Fairs"
            model="fairs"
            placeholder="Search by fair name..."
          />
        </Box>
      </Flex>

      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <AutocompleteListMetaphysics
            field="show_ids"
            label="Shows (editorial role required)"
            model="partner_shows"
            placeholder="Search by show name..."
            disabled={!isAdmin}
          />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <AutocompleteListMetaphysics
            field="auction_ids"
            label="Auctions (editorial role required)"
            model="sales"
            placeholder="Search by auction name..."
            disabled={!isAdmin}
          />
        </Box>
      </Flex>

      <Flex flexDirection={["column", "row"]}>
        <Box width={["100%", "50%"]} pr={[0, 2]}>
          <FeaturingMentioned model="artist" />
        </Box>

        <Box width={["100%", "50%"]} pl={[0, 2]}>
          <FeaturingMentioned model="artwork" />
        </Box>
      </Flex>
    </div>
  )
}

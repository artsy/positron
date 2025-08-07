/**
 * @generated SignedSource<<cb7ce2e5964f8625e7b5be441ef05328>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from "relay-runtime"
import { FragmentRefs } from "relay-runtime"
export type client$data = {
  readonly article:
    | {
        readonly id: string | null | undefined
      }
    | null
    | undefined
  readonly " $fragmentType": "client"
}
export type client$key = {
  readonly " $data"?: client$data
  readonly " $fragmentSpreads": FragmentRefs<"client">
}

const node: ReaderFragment = {
  argumentDefinitions: [],
  kind: "Fragment",
  metadata: null,
  name: "client",
  selections: [
    {
      alias: null,
      args: [
        {
          kind: "Literal",
          name: "id",
          value: "hi",
        },
      ],
      concreteType: "Anon1081",
      kind: "LinkedField",
      name: "article",
      plural: false,
      selections: [
        {
          alias: null,
          args: null,
          kind: "ScalarField",
          name: "id",
          storageKey: null,
        },
      ],
      storageKey: 'article(id:"hi")',
    },
  ],
  type: "RootQueryType",
  abstractKey: null,
}

;(node as any).hash = "e24886b14c4cc6ba37123e8c657e1ab8"

export default node

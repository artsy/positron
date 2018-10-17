import { ContentBlock, ContentState } from "draft-js"

export type StyleElementsParagraph = "B" | "I"
export type StyleElements = "B" | "I" | "S" | "U"

export type StyleNamesParagraph = "BOLD" | "ITALIC"
export type StyleNames = "BOLD" | "ITALIC" | "STRIKETHROUGH" | "UNDERLINE"

export interface StyleMapStyle {
  element: StyleElements
  name: StyleNames
}

export type StyleMap = StyleMapStyle[]

export type StyleMapNamesParagraph = StyleNamesParagraph[]
export type StyleMapNamesFull = StyleNames[]

export type AllowedStylesParagraph = StyleElementsParagraph[]
export type AllowedStyles = StyleElements[]

export type BlockElement = "h1" | "h2" | "h3" | "blockquote" | "ul" | "ol" | "p"
export type AllowedBlocks = BlockElement[]

export type BlockName =
  | "header-one"
  | "header-two"
  | "header-three"
  | "blockquote"
  | "unordered-list-item"
  | "ordered-list-item"
  | "unstyled"

export interface DecoratorType {
  strategy: (
    contentBlock: ContentBlock,
    callback: (start: number, end: number) => void,
    contentState: ContentState
  ) => void
  component: any
  props?: object
}

export type Decorator = DecoratorType[]

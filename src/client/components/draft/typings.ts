import { ContentBlock, ContentState } from "draft-js"

export type StyleElementsParagraph = "B" | "I"
export type StyleElementsFull = "B" | "I" | "S" | "U"

export type StyleNamesParagraph = "BOLD" | "ITALIC"
export type StyleNamesFull = "BOLD" | "ITALIC" | "STRIKETHROUGH" | "UNDERLINE"

export interface StyleMapStyle {
  element: StyleElementsParagraph | StyleElementsFull
  name: StyleNamesParagraph | StyleNamesFull
}

export type StyleMap = StyleMapStyle[]

export type StyleMapNamesParagraph = StyleNamesParagraph[]
export type StyleMapNamesFull = StyleNamesFull[]

export type AllowedStylesParagraph = StyleElementsParagraph[]
export type AllowedStylesFull = StyleElementsFull[]

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

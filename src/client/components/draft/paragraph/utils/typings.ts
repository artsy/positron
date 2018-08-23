import { ContentBlock, ContentState } from 'draft-js'

export type StyleNode = 'B' | 'I'

export type StyleName = 'BOLD' | 'ITALIC'

export interface StyleMapStyle {
  label: StyleNode
  name: StyleName
}

export type StyleMap = StyleMapStyle[]

export type StyleMapNames = StyleName[]

export type AllowedStyles = StyleNode[]

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

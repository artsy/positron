import { ArtworkGridArtwork, ArtworkGridColumns } from "client/typings/sections"

export const DEFAULT_COLUMNS: ArtworkGridColumns = 3
export const COLUMN_OPTIONS: ArtworkGridColumns[] = [2, 3, 4]

/**
 * The section fields an Artwork Grid editor may change. `onChangeSection`
 * from sectionActions is (key: string, value: any) and satisfies this.
 */
export interface OnChangeArtworkGridSection {
  (key: "artworks", value: ArtworkGridArtwork[]): void
  (key: "columns", value: ArtworkGridColumns): void
}

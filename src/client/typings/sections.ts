/**
 * Editor typings for article sections.
 *
 * `@artsy/reaction` is legacy and its `SectionType` union does not include
 * `artwork_grid`. Rather than bump reaction, the client widens its types
 * here and imports section/article typings from this module.
 *
 * Note: the repo's prettier (1.14) cannot parse `export type { ... }`, so
 * re-exports are written as type aliases.
 */
import {
  ArticleData as ArticleDataFromReaction,
  ArticleLayout as ArticleLayoutFromReaction,
  GravityEntity as GravityEntityFromReaction,
  ImageData as ImageDataFromReaction,
  ImagesData as ImagesDataFromReaction,
  SectionData as SectionDataFromReaction,
  SectionLayout as SectionLayoutFromReaction,
  SectionType as SectionTypeFromReaction,
} from "@artsy/reaction/dist/Components/Publishing/Typings"

export type ArticleLayout = ArticleLayoutFromReaction
export type GravityEntity = GravityEntityFromReaction
export type ImageData = ImageDataFromReaction
export type ImagesData = ImagesDataFromReaction
export type SectionLayout = SectionLayoutFromReaction

/**
 * Reaction's own types, for casting at the boundary when handing data to a
 * reaction component that does not know about `artwork_grid`.
 */
export type ReactionArticleData = ArticleDataFromReaction
export type ReactionSectionData = SectionDataFromReaction

export type SectionType = SectionTypeFromReaction | "artwork_grid"

export type ArtworkGridColumns = 2 | 3 | 4

/**
 * Mirrors `denormalizedArtwork` in src/api/apps/articles/model/schema.coffee
 * and `Artwork#denormalized()` in src/client/models/artwork.coffee.
 */
export interface ArtworkGridArtwork {
  type: "artwork"
  id: string
  slug: string
  date?: string | null
  title?: string | null
  image?: string | null
  partner?: GravityEntity
  artists?: GravityEntity[]
  artist?: GravityEntity
  width?: number | null
  height?: number | null
  credit?: string
}

export interface SectionData extends Omit<SectionDataFromReaction, "type"> {
  type: SectionType
  columns?: ArtworkGridColumns
  artworks?: ArtworkGridArtwork[]
}

/**
 * Reaction's ArticleData carries an `[x: string]: any` index signature, which
 * makes `Omit` collapse every key to `any`. Pick the named keys instead so
 * `layout`, `id`, etc. keep their types while `sections` is overridden.
 */
type ReactionArticleKeys =
  | "id"
  | "layout"
  | "authors"
  | "postscript"
  | "date"
  | "published_at"
  | "lead_paragraph"
  | "series"
  | "news_source"
  | "tracking_tags"
  | "sponsor"
  | "shouldAdRender"
  | "partner"
  | "sale"

export interface ArticleData
  extends Pick<ArticleDataFromReaction, ReactionArticleKeys> {
  sections?: SectionData[]
  [x: string]: any
}

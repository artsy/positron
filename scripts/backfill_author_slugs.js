/**
 * Migration script to populate slugs for all existing authors
 *
 * Usage: node scripts/backfill_author_slugs.js
 */

const Author = require("../src/api/apps/authors/model")
const db = require("../src/api/lib/db")

const backfillAuthorSlugs = async () => {
  try {
    console.log("Starting author slug backfill...")

    const authors = await db
      .collection("authors")
      .find({
        $or: [{ slug: null }, { slug: "" }, { slug: { $exists: false } }],
      })
      .toArray()

    console.log(`Found ${authors.length} authors without slugs`)

    if (authors.length === 0) {
      console.log("No authors need slug backfill")
      return
    }

    let updated = 0
    let skipped = 0

    for (const author of authors) {
      if (!author.name || author.name.trim() === "") {
        console.warn(`Skipping author ${author._id} - no name`)
        skipped++
        continue
      }

      await new Promise((resolve, reject) => {
        const input = {
          id: author._id.toString(),
          name: author.name,
          bio: author.bio,
          image_url: author.image_url,
          twitter_handle: author.twitter_handle,
          instagram_handle: author.instagram_handle,
          role: author.role,
        }

        Author.save(input, (err, savedAuthor) => {
          if (err) {
            console.error(
              `✗ Error saving author "${author.name}" (${author._id}):`,
              err
            )
            skipped++
            reject(err)
          } else {
            updated++
            console.log(
              `✓ Updated author "${author.name}" (${author._id}) with slug: "${
                savedAuthor.slug
              }"`
            )
            resolve()
          }
        })
      })
    }

    console.log("\n=== Backfill Complete ===")
    console.log(`Authors updated: ${updated}`)
    console.log(`Authors skipped: ${skipped}`)
    console.log(`Total processed: ${authors.length}`)

    console.log("\nCreating index on authors.slug...")
    await db
      .collection("authors")
      .createIndex(
        { slug: 1 },
        { background: true, unique: true, sparse: true }
      )
    console.log("✓ Index created")
  } catch (error) {
    console.error("Error during backfill:", error)
    throw error
  }
}

backfillAuthorSlugs()
  .then(() => {
    console.log("\nMigration successful!")
    process.exit(0)
  })
  .catch(error => {
    console.error("\nMigration failed:", error)
    process.exit(1)
  })

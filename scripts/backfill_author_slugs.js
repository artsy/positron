/**
 * Migration script to populate slugs for all existing authors
 *
 * Usage: node scripts/backfill_author_slugs.js
 */

const _s = require("underscore.string")
const db = require("../src/api/lib/db")

const generateUniqueSlug = async (name, existingSlugs, authorId = null) => {
  let baseSlug = _s.slugify(name)

  if (!baseSlug) {
    console.warn(`Warning: Could not generate slug for name: "${name}"`)
    return null
  }

  // Check if base slug is unique
  const query = { slug: baseSlug }
  if (authorId) {
    query._id = { $ne: authorId }
  }

  const existingAuthor = await db.collection("authors").findOne(query)

  if (!existingAuthor && !existingSlugs.has(baseSlug)) {
    return baseSlug
  }

  // Add counter suffix to make it unique
  let counter = 1
  let slugWithCounter = `${baseSlug}-${counter}`

  while (
    existingSlugs.has(slugWithCounter) ||
    (await db
      .collection("authors")
      .findOne({ slug: slugWithCounter, _id: { $ne: authorId } }))
  ) {
    counter++
    slugWithCounter = `${baseSlug}-${counter}`
  }

  return slugWithCounter
}

const backfillAuthorSlugs = async () => {
  try {
    console.log("Starting author slug backfill...")

    // Get all authors without slugs
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

    // Track slugs we've assigned in this run to avoid duplicates
    const assignedSlugs = new Set()

    let updated = 0
    let skipped = 0

    for (const author of authors) {
      if (!author.name || author.name.trim() === "") {
        console.warn(`Skipping author ${author._id} - no name`)
        skipped++
        continue
      }

      const slug = await generateUniqueSlug(
        author.name,
        assignedSlugs,
        author._id
      )

      if (!slug) {
        console.warn(`Skipping author ${author._id} - could not generate slug`)
        skipped++
        continue
      }

      assignedSlugs.add(slug)

      await db
        .collection("authors")
        .updateOne({ _id: author._id }, { $set: { slug: slug } })

      updated++
      console.log(
        `✓ Updated author "${author.name}" (${author._id}) with slug: "${slug}"`
      )
    }

    console.log("\n=== Backfill Complete ===")
    console.log(`Authors updated: ${updated}`)
    console.log(`Authors skipped: ${skipped}`)
    console.log(`Total processed: ${authors.length}`)

    // Create index on slug field for better query performance
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

// Run the migration
backfillAuthorSlugs()
  .then(() => {
    console.log("\nMigration successful!")
    process.exit(0)
  })
  .catch(error => {
    console.error("\nMigration failed:", error)
    process.exit(1)
  })

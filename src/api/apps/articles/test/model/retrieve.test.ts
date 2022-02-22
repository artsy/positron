import { ObjectId } from "mongodb"
import { toQuery } from "../../model/retrieve"

describe("Retrieve", () => {
  describe("#toQuery", () => {
    it("aggregates the query for all_by_author", () => {
      const { query } = toQuery({
        all_by_author: ObjectId("5086df098523e60002000017"),
        published: true,
      })
      query.$or[0].author_id.should.containEql(
        ObjectId("5086df098523e60002000017")
      )
      query.$or[1].contributing_authors.$elemMatch.should.be.ok()
      query.$or[1].contributing_authors.$elemMatch.id.should.containEql(
        ObjectId("5086df098523e60002000017")
      )
    })

    it("aggregates the query for vertical", () => {
      const { query } = toQuery({
        vertical: "55356a9deca560a0137bb4a7",
        published: true,
      })
      query["vertical.id"].should.containEql(
        ObjectId("55356a9deca560a0137bb4a7")
      )
    })

    it("aggregates the query for artist_id", () => {
      const { query } = toQuery({
        artist_id: "5086df098523e60002000016",
        published: true,
      })
      query.$or[0].primary_featured_artist_ids.should.containEql(
        ObjectId("5086df098523e60002000016")
      )
      query.$or[1].featured_artist_ids.should.containEql(
        ObjectId("5086df098523e60002000016")
      )
      query.$or[2].biography_for_artist_id.should.containEql(
        ObjectId("5086df098523e60002000016")
      )
    })

    it("uses Regex in thumbnail_title for q", () => {
      const { query } = toQuery({
        q: "Thumbnail Title 101",
        published: true,
      })
      query.hasOwnProperty("thumbnail_title").should.be.true()
      query.thumbnail_title.$regex.should.be.ok()
    })

    it("ignores q if it is empty", () => {
      const { query } = toQuery({
        q: "",
        published: true,
      })
      query.hasOwnProperty("thumbnail_title").should.be.false()
    })

    it("aggregates the query for has_video", () => {
      const { query } = toQuery({
        has_video: true,
        published: true,
      })
      query.$or[1]["hero_section.type"].should.be.ok()
      query.$or[1]["hero_section.type"].should.equal("video")
      query.$or[0].sections.$elemMatch.should.be.ok()
      query.$or[0].sections.$elemMatch.type.should.equal("video")
    })

    it("aggregates the query for has_published_media", () => {
      const { query } = toQuery({
        ids: ["5530e72f7261696238050000"],
        published: true,
        has_published_media: true,
      })
      query.$or[0].layout.should.be.ok()
      query.$or[0].layout.should.equal("video")
      query.$or[0]["media.published"].should.equal(true)
    })

    it("finds articles by multiple fair ids", () => {
      const { query } = toQuery({
        fair_ids: ["5086df098523e60002000016", "5086df098523e60002000015"],
        published: true,
      })
      query.fair_ids.$elemMatch.should.be.ok()
      query.fair_ids.$elemMatch.$in[0].should.containEql(
        ObjectId("5086df098523e60002000016")
      )
      query.fair_ids.$elemMatch.$in[1].should.containEql(
        ObjectId("5086df098523e60002000015")
      )
    })

    it("finds articles by multiple ids", () => {
      const { query } = toQuery({
        ids: ["54276766fd4f50996aeca2b8", "54276766fd4f50996aeca2b7"],
        published: true,
      })
      query._id.$in.should.be.ok()
      query._id.$in[0].should.containEql(ObjectId("54276766fd4f50996aeca2b8"))
      query._id.$in[1].should.containEql(ObjectId("54276766fd4f50996aeca2b7"))
    })

    it("finds articles in editorial feed", () => {
      const { query } = toQuery({
        in_editorial_feed: true,
      })
      query.layout.$in.should.be.ok()
      query.layout.$in[0].should.containEql("feature")
      query.layout.$in[1].should.containEql("standard")
      query.layout.$in[2].should.containEql("series")
      query.layout.$in[3].should.containEql("video")
    })

    it("finds scheduled articles", () => {
      const { query } = toQuery({
        scheduled: true,
      })
      query.scheduled_publish_at.should.have.keys("$ne")
    })

    it("omits articles", () => {
      const { query } = toQuery({
        omit: ["54276766fd4f50996aeca2b7"],
      })
      query._id.should.have.keys("$nin")
    })
  })
})

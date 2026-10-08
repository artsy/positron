import {
  detectAspectRatio,
  formatAspectRatio,
  getEmbedSrc,
  isYouTubeShort,
} from "../utils"

describe("video utils", () => {
  describe("#getEmbedSrc", () => {
    it("handles youtube watch urls", () => {
      expect(
        getEmbedSrc("https://www.youtube.com/watch?v=PXi7Kjlsz9A&t=10")
      ).toMatch(/^https:\/\/www\.youtube\.com\/embed\/PXi7Kjlsz9A\?/)
    })

    it("handles youtube shorts share links", () => {
      expect(
        getEmbedSrc("https://youtube.com/shorts/-Jkcx0Q8X3I?si=abc123")
      ).toMatch(/^https:\/\/www\.youtube\.com\/embed\/-Jkcx0Q8X3I\?/)
    })

    it("handles youtu.be share links", () => {
      expect(getEmbedSrc("https://youtu.be/PXi7Kjlsz9A?si=abc123")).toMatch(
        /^https:\/\/www\.youtube\.com\/embed\/PXi7Kjlsz9A\?/
      )
    })

    it("handles vimeo urls", () => {
      expect(getEmbedSrc("https://vimeo.com/265111898/")).toMatch(
        /^https:\/\/player\.vimeo\.com\/video\/265111898\?/
      )
    })

    it("returns null for unsupported or invalid urls", () => {
      expect(getEmbedSrc("https://example.com/video")).toBeNull()
      expect(getEmbedSrc("not a url")).toBeNull()
    })
  })

  describe("#isYouTubeShort", () => {
    it("recognizes shorts urls", () => {
      expect(isYouTubeShort("https://www.youtube.com/shorts/-Jkcx0Q8X3I")).toBe(
        true
      )
      expect(isYouTubeShort("https://www.youtube.com/watch?v=x")).toBe(false)
      expect(isYouTubeShort("https://vimeo.com/shorts/1")).toBe(false)
    })
  })

  describe("#formatAspectRatio", () => {
    it("labels presets and other ratios", () => {
      expect(formatAspectRatio(9 / 16)).toBe("9:16")
      expect(formatAspectRatio(0.5625)).toBe("9:16")
      expect(formatAspectRatio(2.39)).toBe("2.39:1")
      expect(formatAspectRatio(1000 / 1300)).toBe("1:1.3")
    })
  })

  describe("#detectAspectRatio", () => {
    const fetchMock = jest.fn()

    beforeEach(() => {
      fetchMock.mockReset()
      ;(global as any).fetch = fetchMock
    })

    afterEach(() => {
      delete (global as any).fetch
    })

    it("treats youtube shorts as 9:16", async () => {
      expect(
        await detectAspectRatio("https://youtube.com/shorts/-Jkcx0Q8X3I")
      ).toBe(9 / 16)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("leaves other youtube videos undetected", async () => {
      expect(
        await detectAspectRatio("https://www.youtube.com/watch?v=PXi7Kjlsz9A")
      ).toBeNull()
    })

    it("reads vimeo dimensions from oembed", async () => {
      fetchMock.mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ width: 360, height: 640 }),
        })
      )

      expect(await detectAspectRatio("https://vimeo.com/265111898")).toBe(
        360 / 640
      )
      expect(fetchMock.mock.calls[0][0]).toBe(
        "https://vimeo.com/api/oembed.json?url=https%3A%2F%2Fvimeo.com%2F265111898"
      )
    })

    it("returns null when vimeo oembed fails", async () => {
      fetchMock.mockImplementation(() => Promise.resolve({ ok: false }))
      expect(await detectAspectRatio("https://vimeo.com/1")).toBeNull()

      fetchMock.mockImplementation(() => Promise.reject(new Error("offline")))
      expect(await detectAspectRatio("https://vimeo.com/1")).toBeNull()
    })
  })
})

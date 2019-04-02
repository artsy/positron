export const ArticlesListQuery = (argString: string) => {
  return `
    {
      articles(${argString}){
        thumbnail_image
        thumbnail_title
        slug
        published_at
        published
        scheduled_publish_at
        id
        channel_id
        partner_channel_id
        updated_at
        layout
      }
    }
  `
}

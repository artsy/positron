#
# OpenSearch index lifecycle for the article search tests.
#
# Two things made this flaky in CI:
#
#   * The bundled elasticsearch@11 client issues `POST /<index>` for
#     `indices.create`, which OpenSearch rejects with a 405. That call has
#     therefore been a silent no-op, so the index only ever existed when a
#     document write happened to auto-create it first — otherwise reads and
#     writes hit "no such index [articles_test]". We create it with the PUT
#     the server actually expects.
#   * Each spec deleted the index in `after` fire-and-forget, so a pending
#     delete from one file could land mid-run in the next. Awaiting delete
#     keeps the per-file lifecycle serialized.
#
# Errors are swallowed (already-exists on create, not-found on delete) so a
# leftover index from a crashed run can't wedge the suite.
#
search = require '../../lib/search_client'

module.exports.createArticlesIndex = (done) ->
  search.client.transport.request { method: 'PUT', path: "/#{search.index}" }, -> done?()

module.exports.deleteArticlesIndex = (done) ->
  search.client.indices.delete { index: search.index }, -> done?()

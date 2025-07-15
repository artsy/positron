Problem: server.close() is called without waiting for it to complete. The next test's server.listen(5000) might try to bind before the previous server fully releases the port.

Summary of Async Operations That Need Synchronization:

1. Database collection drops (empty() function) - Need to wait for all drop() operations to complete
2. Elasticsearch index creation/deletion - Need callbacks/promises to ensure completion
3. Server startup/shutdown - Need to wait for port binding/release
4. Database insertions (fabricate()) - Need to ensure data is fully written before tests run
5. Article indexing in Elasticsearch - Articles get indexed asynchronously after creation

The root cause is that async operations are started but not awaited, causing the next test to begin before the previous test's cleanup is complete.

Summary of fixes:

1. ✅ Database cleanup - Fixed empty() function to properly wait for all collection drops to complete and handle errors
2. ✅ Elasticsearch cleanup - Fixed after() hooks to wait for index deletion before proceeding
3. ✅ Server shutdown - Fixed server.close() calls to wait for port release before continuing
4. ✅ Database insertions - Added proper error handling to fabricate() function
5. ✅ Elasticsearch search operations - Added proper error handling for search queries

These changes should eliminate the race conditions by ensuring:

- Database collections are fully dropped before new tests start
- Elasticsearch indices are properly deleted before new tests begin
- Server ports are fully released before new servers try to bind
- Database errors are properly propagated instead of being silently ignored

The flaky tests you were seeing were likely caused by these async operations not completing properly, leading to:

- Database state bleeding between tests
- Port conflicts from servers not fully shutting down
- Elasticsearch queries failing due to incomplete index cleanup

Key improvement in #5:

The Elasticsearch test was failing with Cannot read properties of undefined (reading 'hits') because the search was returning undefined instead of a proper response object.

The fix adds proper error handling:

- Check for search errors and propagate them
- Validate that the response object exists and has the expected structure
- Provide meaningful error messages instead of cryptic property access failures

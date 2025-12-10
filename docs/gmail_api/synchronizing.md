# Synchronizing Clients with Gmail

Keeping your client synchronized with Gmail is important for most application
scenarios. There are two overall synchronization scenarios: full synchronization
and partial synchronization. Full synchronization is required the first time
your client connects to Gmail and in some other rare scenarios. If your client
has recently synchronized, partial synchronization is a lighter-weight
alternative to a full sync. You can also use [push notifications](https://developers.google.com/workspace/gmail/api/guides/push)
to trigger partial synchronization in real-time and only when necessary, thereby
avoiding needless polling.

## Contents

## Full synchronization

The first time your application connects to Gmail, or if partial synchronization
is not available, you must perform a full sync. In a full sync operation, your
application should retrieve and store as many of the most recent messages or
threads as are necessary for your purpose. For example, if your application
displays a list of recent messages, you may wish to retrieve and cache enough
messages to allow for a responsive interface if the user scrolls beyond the
first several messages displayed. The general procedure for performing a full
sync operation is as follows:

1. Call [`messages.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/list) to retrieve the first page of message IDs.
2. Create a [batch request](https://developers.google.com/workspace/gmail/api/guides/batch) of [`messages.get`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/get) requests for each of the messages returned by the list request. If your application displays message contents, you should use `format=FULL` or `format=RAW` the first time your application retrieves a message and cache the results to avoid additional retrieval operations. If you are retrieving a previously cached message, you should use `format=MINIMAL` to reduce the size of the response as only the `labelIds` may change.
3. Merge the updates into your cached results. Your application should store the `historyId` of the most recent message (the first message in the `list` response) for future partial synchronization.

| **Note:** You can also perform synchronization using the equivalent [`Threads` resource](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads) methods. This may be advantageous if your application primarily works with threads or only requires message metadata.

## Partial synchronization

If your application has synchronized recently, you can perform a partial
sync using the [`history.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/history/list)
method to return all history records newer than the `startHistoryId` you specify
in your request. History records provide message IDs and type of change for
each message, such as message added, deleted, or labels modified since the time
of the `startHistoryId`. You can obtain and store the `historyId` of the most
recent message from a full or partial sync to provide as a `startHistoryId` for
future partial synchronization operations.

## Limitations

History records are typically available for at least one week and often
longer. However, the time period for which records are available may be
significantly less and records may sometimes be unavailable in rare cases. If
the `startHistoryId` supplied by your client is outside the available range of
history records, the API returns an `HTTP 404` error response. In this case,
your client must perform a full sync as described in the previous section.
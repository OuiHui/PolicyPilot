## Overview

The Gmail API provides server push notifications that let you watch for
changes to Gmail mailboxes. You can use this feature to improve the performance
of your application. It allows you to eliminate the extra network and compute
costs involved with polling resources to determine if they have changed.
Whenever a mailbox changes, the Gmail API notifies your backend
server application.
| **Note:** For notifications to user-owned devices (i.e. installed apps, mobile devices, or browsers), the poll-based [sync guide](https://developers.google.com/workspace/gmail/api/guides/sync) is still the recommended approach to retrieve updates.

## Initial Cloud Pub/Sub Setup

The Gmail API uses the [Cloud Pub/Sub API](https://cloud.google.com/pubsub/overview) to deliver
push notifications. This allows notification via a variety of methods
including webhooks and polling on a single subscription endpoint.

### Prerequisites

In order to complete the rest of this setup, make sure you fulfill the
[Cloud Pub/Sub Prerequisites](https://cloud.google.com/pubsub/prereqs) and then
[set up a Cloud Pub/Sub client](https://cloud.google.com/pubsub/configure).

### Create a topic

Using your Cloud Pub/Sub client, [create the topic](https://cloud.google.com/pubsub/publisher#create)
that the Gmail API should
send notifications to. The topic name can be any name you choose under your
project (i.e. matching `projects/myproject/topics/*`, where `myproject`
is the *Project ID* listed for your project in the Google Developers Console).

### Create a subscription

Follow the
[Cloud Pub/Sub Subscriber Guide](https://cloud.google.com/pubsub/subscriber) to set up
a subscription to the topic that you created. Configure the subscription type to
be either a webhook push (i.e. HTTP POST callback) or pull (i.e. initiated by
your app). This is how your application will receive notifications for updates.

### Grant publish rights on your topic

Cloud Pub/Sub requires that you grant Gmail privileges to publish notifications
to your topic.

To do this, you need to grant `publish` privileges to
`gmail-api-push@system.gserviceaccount.com`. You can do this
using the [Cloud Pub/Sub Developer Console permissions interface](https://console.cloud.google.com/project/_/cloudpubsub/topicList)
following the [resource-level access control instructions](https://cloud.google.com/pubsub/access_control#set_topic_level_access).

Your organization's [domain restricted sharing](https://cloud.google.com/resource-manager/docs/organization-policy/domain-restricted-sharing#how-drs-works) configuration may prevent you from granting publish permissions.
To resolve this, you can [configure an exception](https://cloud.google.com/resource-manager/docs/organization-policy/restricting-domains#configure-exceptions) for this service account.

## Getting Gmail mailbox updates

Once the initial Cloud Pub/Sub setup is finished, configure Gmail accounts to
send notifications for mailbox updates.

### Watch request

To configure Gmail accounts to send notifications to your Cloud Pub/Sub topic,
simply use your *Gmail API* client to call
[`watch`](https://developers.google.com/workspace/gmail/api/v1/reference/users/watch)
on the Gmail user mailbox similar to any other Gmail API call.
To do so, provide the topic name created above and any other options
in your `watch` request, such as [`labels`](https://developers.google.com/workspace/gmail/api/guides/labels) to
filter on. For example, to be notified any time a change is made to the Inbox:  

### Protocol

    POST "https://www.googleapis.com/gmail/v1/users/me/watch"
    Content-type: application/json

    {
      topicName: "projects/myproject/topics/mytopic",
      labelIds: ["INBOX"],
      labelFilterBehavior: "INCLUDE",
    }

### Python

    request = {
      'labelIds': ['INBOX'],
      'topicName': 'projects/myproject/topics/mytopic',
      'labelFilterBehavior': 'INCLUDE'
    }
    gmail.users().watch(userId='me', body=request).execute()

### Watch response

If the [`watch`](https://developers.google.com/workspace/gmail/api/v1/reference/users/watch) request is successful
you will receive a response like:  

    {
      historyId: 1234567890
      expiration: 1431990098200
    }

with the current mailbox `historyId` for the user. All changes after that
`historyId` will be notified to your client. If you need to process changes
prior to this `historyId`, refer to the [sync guide](https://developers.google.com/workspace/gmail/api/guides/sync).

Additionally, a successful `watch` call should cause a notification to
immediately be sent to your Cloud Pub/Sub topic.

If you receive an error from the `watch` call, the details should explain
the source of the problem, which is typically with the setup of the
Cloud Pub/Sub topic and subscription. Refer to the
[Cloud Pub/Sub documentation](https://cloud.google.com/pubsub/docs) to confirm that
the setup is correct and for help with debugging topic and subscription issues.

### Renewing mailbox watch

You must re-call [`watch`](https://developers.google.com/workspace/gmail/api/v1/reference/users/watch) at least every
7 days or else you will stop receiving updates for the user. We recommend
calling `watch` once per day. The `watch` response also has an expiration
field with the timestamp for the `watch` expiration.

## Receiving notifications

Whenever a mailbox update occurs that matches your `watch`, your application
will receive a notification message describing the change.

If you have configured a push subscription, a webhook notification to your
server will conform to a
[`PubsubMessage`](https://cloud.google.com/pubsub/docs/reference/rest/v1/PubsubMessage):  

    POST https://yourserver.example.com/yourUrl
    Content-type: application/json

    {
      message:
      {
        // This is the actual notification data, as base64url-encoded JSON.
        data: "eyJlbWFpbEFkZHJlc3MiOiAidXNlckBleGFtcGxlLmNvbSIsICJoaXN0b3J5SWQiOiAiMTIzNDU2Nzg5MCJ9",

        // This is a Cloud Pub/Sub message id, unrelated to Gmail messages.
        "messageId": "2070443601311540",

        // This is the publish time of the message.
        "publishTime": "2021-02-26T19:13:55.749Z",
      }

      subscription: "projects/myproject/subscriptions/mysubscription"
    }

The HTTP POST body is JSON and the actual Gmail notification payload is in the
`message.data` field. That `message.data` field is a base64url-encoded string
that decodes to a JSON object containing the email address and the new mailbox
history ID for the user:  

    {"emailAddress": "user@example.com", "historyId": "9876543210"}

You can then use [`history.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/history/list)
to get the change details for the user since their *last known*
historyId, as per the [sync guide](https://developers.google.com/workspace/gmail/api/guides/sync#partial).

For example, to use [`history.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/history/list)
to identify changes that occurred between your initial [`watch`](https://developers.google.com/workspace/gmail/api/v1/reference/users/watch)
call and the receipt of the notification message shared in the previous
example, pass `1234567890` as the `startHistoryId` to `history.list`.
Afterwards,`9876543210` can be persisted as the *last known* historyId for
future use cases.

If you have configured a pull subscription instead, refer to the code samples in
the [Cloud Pub/Sub Subscriber Pull Guide](https://cloud.google.com/pubsub/docs/pull) for
more details on receiving messages.

### Responding to notifications

All notifications need to be acknowledged. If you use webhook
[push delivery](https://cloud.google.com/pubsub/docs/push), then responding
successfully (e.g. HTTP 200) will acknowledge the notification.

If using pull delivery
([REST Pull](https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/pull),
[RPC Pull](https://cloud.google.com/pubsub/docs/reference/rpc/google.pubsub.v1#google.pubsub.v1.PullRequest)
, or
[RPC StreamingPull](https://cloud.google.com/pubsub/docs/reference/rpc/google.pubsub.v1#streamingpullrequest))
then you must follow up with an acknowledge call
([REST](https://cloud.google.com/pubsub/docs/reference/rest/v1/projects.subscriptions/acknowledge)
or
[RPC](https://cloud.google.com/pubsub/docs/reference/rpc/google.pubsub.v1#acknowledgerequest)).
Refer to the code samples in the
[Cloud Pub/Sub Subscriber Pull Guide](https://cloud.google.com/pubsub/docs/pull) for
more details on acknowledging messages either
[asynchronously](https://cloud.google.com/pubsub/docs/pull#asynchronous-pull) or
[synchronously](https://cloud.google.com/pubsub/docs/pull#synchronous_pull) using the
official RPC-based client libraries.

If the notifications are not acknowledged (e.g. your webhook callback
returns an error or times out), Cloud Pub/Sub will retry the notification
at a later time.

## Stopping mailbox updates

To stop receiving updates on a mailbox, call
[`stop`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users/stop) and all new notifications
should stop within a few minutes.

## Limitations

### Max notification rate

Each Gmail user being watched has a maximum notification rate of 1 event/sec. Any
user notifications above that rate will be dropped. Be careful when handling
notifications to be sure not to trigger another notification, and thereby
start a notification loop.

### Reliability

Typically all notifications should be delivered reliably within a few seconds;
however in some extreme situations notifications may be delayed or dropped.
Make sure to handle this possibility gracefully, so that the application
still syncs even if no push messages are received. For example, fall back to
periodically calling
[`history.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/history/list) after a
period with no notifications for a user.

### Cloud Pub/Sub Limitations

The Cloud Pub/Sub API also has its own limitations, specifically detailed
in its [pricing](https://cloud.google.com/pubsub/pricing) and [quotas](https://cloud.google.com/pubsub/quotas) documentation.
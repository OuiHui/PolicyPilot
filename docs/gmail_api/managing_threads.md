# Managing Threads

The Gmail API uses [`Thread` resources](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads)
to group email replies with their original message into a single conversation or
thread. This allows you to retrieve all messages in a conversation, in order,
making it easier to have context for a message or to refine search results.

Like [messages](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages), threads may also have
labels applied to them. However, unlike messages, threads cannot be created,
only deleted. Messages can, however, be inserted into a thread.

## Contents

## Retrieving threads

Threads provide a simple way of retrieving messages in a conversation in order.
By listing a set of threads you can choose to group messages by conversation
and provide additional context. You can retrieve a list of threads using the
[`threads.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads/list) method, or retrieve
a specific thread with
[`threads.get`](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads/list). You can also
[filter threads](https://developers.google.com/workspace/gmail/api/guides/filtering) using the same query parameters as
for the [`Message` resource](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages). If any
message in a thread matches the query, that thread is returned in the result.  

The code sample below demonstrates how to use both methods in a sample that
displays the most chatty threads in your inbox. The `threads.list` method
fetches all thread IDs, then `threads.get` grabs all messages in each thread.
For those with 3 or more replies, we extract the `Subject` line and display the
non-empty ones plus the number of messages in the thread. You'll also find this
code sample featured in the corresponding DevByte video.

### Python

gmail/snippet/thread/threads.py  
[View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/gmail/snippet/thread/threads.py)  

```python
import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def show_chatty_threads():
  """Display threads with long conversations(>= 3 messages)
  Return: None

  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()

  try:
    # create gmail api client
    service = build("gmail", "v1", credentials=creds)

    # pylint: disable=maybe-no-member
    # pylint: disable:R1710
    threads = (
        service.users().threads().list(userId="me").execute().get("threads", [])
    )
    for thread in threads:
      tdata = (
          service.users().threads().get(userId="me", id=thread["id"]).execute()
      )
      nmsgs = len(tdata["messages"])

      # skip if <3 msgs in thread
      if nmsgs > 2:
        msg = tdata["messages"][0]["payload"]
        subject = ""
        for header in msg["headers"]:
          if header["name"] == "Subject":
            subject = header["value"]
            break
        if subject:  # skip if no Subject line
          print(f"- {subject}, {nmsgs}")
    return threads

  except HttpError as error:
    print(f"An error occurred: {error}")


if __name__ == "__main__":
  show_chatty_threads()
```

## Adding drafts and messages to threads

If you are sending or migrating messages that are a response to another email
or part of a conversation, your application should add that message to the
related thread. This makes it easier for Gmail users who are participating in
the conversation to keep the message in context.

A draft can be added to a thread as part of
[creating](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/create),
[updating](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/update), or
[sending](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/send) a draft message.
You can also add a message to a thread as part of
[inserting](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/insert) or
[sending](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/send) a message.

In order to be part of a thread, a message or draft must meet the following
criteria:

1. The requested `threadId` must be specified on the `Message` or `Draft.Message` you supply with your request.
2. The `References` and `In-Reply-To` headers must be set in compliance with the [RFC 2822](https://tools.ietf.org/html/rfc2822#appendix-A.2) standard.
3. The `Subject` headers must match.

Take a look at the [creating a draft](https://developers.google.com/workspace/gmail/api/guides/drafts) or [sending a
message](https://developers.google.com/workspace/gmail/api/guides/sending) examples. In both cases, you would simply
add a `threadId` key paired with a thread ID to a message's metadata, the
`message` object.
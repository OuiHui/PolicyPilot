# List Gmail messages

This page explains how to call the Gmail API's
[`users.messages.list`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)
method.

The method returns an array of Gmail `Message` resources that
contain the message `id` and `threadId`. To retrieve full message details, use
the
[`users.messages.get`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get)
method.

## Prerequisites

### Python

A Google Cloud project with the Gmail API enabled. For steps, complete
the
[Gmail API Python quickstart](https://developers.google.com/workspace/gmail/api/quickstart/python).

## List messages

The `users.messages.list` method supports several query parameters to filter the
messages:

- `maxResults`: Maximum number of messages to return (defaults to 100, max 500).
- `pageToken`: Token to retrieve a specific page of results.
- `q`: Query string to filter messages, such as `from:someuser@example.com is:unread"`.
- `labelIds`: Only return messages with labels that match all specified label IDs.
- `includeSpamTrash`: Include messages from `SPAM` and `TRASH` in the results.

### Code sample

### Python

The following code sample shows how to list messages for the authenticated
Gmail user. The code handles pagination to retrieve all
messages matching the query.  
gmail/snippet/list_messages.py  
[View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/gmail/snippet/list_messages.py)  

```python
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def main():
    """Shows basic usage of the Gmail API.
    Lists the user's Gmail messages.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        # Save the credentials for the next run
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    try:
        # Call the Gmail API
        service = build("gmail", "v1", credentials=creds)
        results = (
            service.users().messages().list(userId="me", labelIds=["INBOX"]).execute()
        )
        messages = results.get("messages", [])

        if not messages:
            print("No messages found.")
            return

        print("Messages:")
        for message in messages:
            print(f'Message ID: {message["id"]}')
            msg = (
                service.users().messages().get(userId="me", id=message["id"]).execute()
            )
            print(f'  Subject: {msg["snippet"]}')

    except HttpError as error:
        # TODO(developer) - Handle errors from gmail API.
        print(f"An error occurred: {error}")


if __name__ == "__main__":
    main()
```

The `users.messages.list` method returns a response body that contains the
following:

- `messages[]`: An array of `Message` resources.
- `nextPageToken`: For requests with multiple pages of results, a token that can be used with a subsequent calls to list more messages.
- `resultSizeEstimate`: An estimated total number of results.

To fetch the full message content and metadata, use the `message.id` field to
call the
[`users.messages.get`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get)
method.

## Related resources

- [`users.messages.list`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/list)
- [`users.messages.get`](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages/get)
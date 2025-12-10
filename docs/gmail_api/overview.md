# Gmail API Overview

|-------------------------------------------------------------------------------------------------------------------------------------------|
| Got 5 minutes? Help us improve our Google Workspace documentation by taking a quick [online survey](https://forms.gle/XcqRP3PJiQv9ADuj9). |

The Gmail API is a RESTful API that can be used to access Gmail mailboxes and
send mail. For most web applications the Gmail API is the best choice for
authorized access to a user's Gmail data and is suitable for various
applications, such as:

- Read-only mail extraction, indexing, and backup
- Automated or programmatic message sending
- Email account migration
- Email organization including filtering and sorting of messages
- Standardization of email signatures across an organization

Following is a list of common terms used in the Gmail API:

*Message*
:   An email message containing the sender, recipients, subject, and body. After a
    message has been created, a message cannot be changed. A message is represented
    by a [message resource](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.messages#Message).

*Thread*
:   A collection of related messages forming a conversation. In an email client
    app, a thread is formed when one or more recipients respond to a message with
    their own message.

*Label*

:   A mechanism for organizing messages and threads. For example,
    the label "taxes" might be created and applied to all messages and threads
    having to do with a user's taxes. There are two types of labels:

    *System labels*
    :   Internally-created labels, such as `INBOX`, `TRASH`, or `SPAM`. These labels
        cannot be deleted or modified. However, some system labels, such as `INBOX`
        can be applied to, or removed from, messages and threads.

    *User labels*
    :   Labels created by a user. These labels can be deleted or modified by the
        user or an application. A user label is represented by a
        [label resource](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.labels).

*Draft*

:   An unsent message. A message contained within the draft can be replaced.
    Sending a draft automatically deletes the draft and creates a message with
    the `SENT` system label. A draft is represented by a
    [draft resource](https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts).

## Next steps

- To learn about developing with Google Workspace APIs, including handling
  authentication and authorization, refer
  to [Get started as a Google Workspace developer](https://developers.google.com/workspace/guides/getstarted-overview).

- To learn how to configure and run a simple Gmail API app, read the
  [Quickstarts overview](https://developers.google.com/workspace/gmail/api/guides/quickstarts-overview).
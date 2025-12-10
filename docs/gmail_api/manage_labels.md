# Manage labels

You can use labels to tag, organize, and categorize messages and threads
in Gmail. A label has a many-to-many relationship with messages and
threads: you can apply multiple labels to a single message or thread
and apply a single label to multiple messages or threads.

For information about how to
[create](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels/create),
[get](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels/get),
[list](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels/list),
[update](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels/update),
or [delete](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels/delete) labels, see the
[Labels reference](https://developers.google.com/workspace/gmail/api/v1/reference/users/labels).

To manage labels, you must use the
`https://www.googleapis.com/auth/gmail.labels` scope. For more information
about scopes, see
[Gmail API-specific authorization and authentication information](https://developers.google.com/workspace/gmail/api/auth/scopes).

## Types of labels

Labels come in two varieties: reserved `SYSTEM` labels and custom `USER` labels.
System labels typically correspond to pre-defined elements in the Gmail web
interface such as the inbox. Systems label names are reserved; no `USER` label can
be created with the same name as any `SYSTEM` label. The following table lists
several of the most common Gmail system labels:

|         Name          | Can be manually applied |                                                                                                                                                                                                                                       Notes                                                                                                                                                                                                                                        |
|-----------------------|-------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `INBOX`               | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `SPAM`                | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `TRASH`               | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `UNREAD`              | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `STARRED`             | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `IMPORTANT`           | yes                     |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `SENT`                | no                      | Applied automatically to messages that are sent with [`drafts.send`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/send) or [`messages.send`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/send), inserted with [`messages.insert`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/insert) and the user's email in the `From` header, or sent by the user through the web interface. |
| `DRAFT`               | no                      | Automatically applied to all [`draft`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts) messages created with the Gmail API or Gmail interface.                                                                                                                                                                                                                                                                                                        |
| `CATEGORY_PERSONAL`   | yes                     | Corresponds to messages that are displayed in the Personal tab of the Gmail interface.                                                                                                                                                                                                                                                                                                                                                                                             |
| `CATEGORY_SOCIAL`     | yes                     | Corresponds to messages that are displayed in the Social tab of the Gmail interface.                                                                                                                                                                                                                                                                                                                                                                                               |
| `CATEGORY_PROMOTIONS` | yes                     | Corresponds to messages that are displayed in the Promotions tab of the Gmail interface.                                                                                                                                                                                                                                                                                                                                                                                           |
| `CATEGORY_UPDATES`    | yes                     | Corresponds to messages that are displayed in the Updates tab of the Gmail interface.                                                                                                                                                                                                                                                                                                                                                                                              |
| `CATEGORY_FORUMS`     | yes                     | Corresponds to messages that are displayed in the Forums tab of the Gmail interface.                                                                                                                                                                                                                                                                                                                                                                                               |

| **Note:** The above list is not exhaustive and other reserved label names exist. Attempting to create a custom label with a name that conflicts with a reserved name results in an `HTTP 400 - Invalid label name` error.

## Manage labels on messages \& threads

Labels only exist on messages. For instance, if you list labels on a thread, you
get a list of labels that exist on any of the messages within the thread. A
label might not exist on every message within a thread. You can apply
multiple labels to messages, but you can't apply
labels to draft messages.

### Add or remove labels to threads

When you add or remove a label to a thread, you add or remove the specified
label on all existing messages in the thread.

If messages are added to a thread after you add a label, the new messages
don't inherit the existing label associated with the thread. To add the label
to those messages, add the label to the thread again.

To add or remove the labels associated with a thread, use
[`threads.modify`](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads/modify).

### Add or remove labels to messages

When you add a label to a message, the label is added to that message and
becomes associated with the thread to which the message belongs. The label isn't
added to other messages within the thread.

If you remove a label from a message and it was the only message in the thread
with that label, the label is also removed from the thread.

To add or remove the labels applied to a message, use
[`messages.modify`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/modify).
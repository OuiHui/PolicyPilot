# Searching for Messages

You can search or filter files using the
[`messages.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/list) and
[`threads.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads/list) methods.
These methods accept the `q` parameter which supports most of the same
[advanced search syntax](https://support.google.com/mail/answer/7190) as
the Gmail web-interface. For a list of search and filter differences between
the Gmail UI and Gmail API, see
[Search filter differences: Gmail UI versus Gmail API](https://developers.google.com/workspace/gmail/api/guides/filtering#differences).

This advanced syntax allows you to use search queries
to filter messages by properties such as the sender, date, or label to name a
few possibilities. For example, the following query retrieves all messages sent
by the user in January of 2014:  

    GET https://www.googleapis.com/gmail/v1/users/me/messages?q=in:sent after:2014/01/01 before:2014/02/01

| **Warning:** All dates used in the search query are interpreted as midnight on that date in the PST timezone. To specify accurate dates for other timezones pass the value in seconds instead:  
|
| ```
| ?q=in:sent after:1388552400 before:1391230800
| ```

In addition to search queries, you can also filter messages and threads by label
with the `labelIds` parameter. This allows you to search for messages and
threads with the specified system or user labels applied. For more information,
see the [`messages.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages/list) or
[`threads.list`](https://developers.google.com/workspace/gmail/api/v1/reference/users/threads/list) method reference.

## Search and filter differences: Gmail UI versus Gmail API

- The Gmail UI performs *alias expansion* which allows it to infer an
  account alias from a Google Workspace account. For example, suppose you have an
  account
  of `myprimary@mycompany.net` and your admin sets up an alias for that account of
  `myalias@mycompany.net`. If `myalias@mycompany.net` sends an email, but you
  search for "`from: myprimary@mycompany.net)`" the email sent by
  `myalias@mycompany.net` shows up as a search result the Gmail UI, but not in
  the API response.

- The Gmail UI allows users to perform thread-wide searches, but the API
  doesn't.
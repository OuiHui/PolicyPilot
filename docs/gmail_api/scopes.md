# Choose Gmail API scopes

This document contains Gmail API-specific authorization and
authentication information. Before reading this document, be sure to read the
Google Workspace's general authentication and authorization information at
[Learn about authentication and authorization](https://developers.google.com/workspace/guides/auth-overview).

## Configure OAuth 2.0 for authorization

[Configure the OAuth consent screen and choose scopes](https://developers.google.com/workspace/guides/configure-oauth-consent)
to define what information is displayed to users and app reviewers, and register
your app so that you can publish it later.

## Gmail API scopes

To define the level of access granted to your app, you need to identify and
declare *authorization scopes*. An authorization scope is an OAuth 2.0 URI string
that contains the Google Workspace app name, what kind of data it accesses, and
the level of access. Scopes are your app's requests to work with Google Workspace data, including
users' Google Account data.


When your app is installed, a user is asked to validate the scopes used
by the app. Generally, you should choose the most narrowly focused scope
possible and avoid requesting scopes that your app doesn't require. Users more
readily grant access to limited, clearly described scopes.
| If your public application uses scopes that permit access to certain user data, it must complete a verification process. If you see **unverified
| app** on the screen when testing your application, you must submit a verification request to remove it. Find out more about [unverified apps](https://support.google.com/cloud/answer/7454865) and get answers to [frequently asked questions about app verification](https://support.google.com/cloud/answer/9110914) in the Help Center.

The Gmail API supports the following scopes:

|                               Scope code                                |                                                                                                                                               Description                                                                                                                                               |     Usage     |
|-------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------|
| `https://www.googleapis.com/auth/gmail.addons.current.action.compose`   | Manage drafts and send emails when you interact with the add-on.                                                                                                                                                                                                                                        | Non-sensitive |
| `https://www.googleapis.com/auth/gmail.addons.current.message.action`   | View your email messages when you interact with the add-on.                                                                                                                                                                                                                                             | Non-sensitive |
| `https://www.googleapis.com/auth/gmail.addons.current.message.metadata` | View your email message metadata when the add-on is running.                                                                                                                                                                                                                                            | Sensitive     |
| `https://www.googleapis.com/auth/gmail.addons.current.message.readonly` | View your email messages when the add-on is running.                                                                                                                                                                                                                                                    | Sensitive     |
| `https://www.googleapis.com/auth/gmail.labels`                          | Create, read, update, and delete labels only.                                                                                                                                                                                                                                                           | Non-sensitive |
| `https://www.googleapis.com/auth/gmail.send`                            | Send messages only. No read or modify privileges on mailbox.                                                                                                                                                                                                                                            | Sensitive     |
| `https://www.googleapis.com/auth/gmail.readonly`                        | Read all resources and their metadata---no write operations.                                                                                                                                                                                                                                            | Restricted    |
| `https://www.googleapis.com/auth/gmail.compose`                         | Create, read, update, and delete drafts. Send messages and drafts.                                                                                                                                                                                                                                      | Restricted    |
| `https://www.googleapis.com/auth/gmail.insert`                          | Insert and import messages only.                                                                                                                                                                                                                                                                        | Restricted    |
| `https://www.googleapis.com/auth/gmail.modify`                          | All read/write operations except immediate, permanent deletion of threads and messages, bypassing Trash.                                                                                                                                                                                                | Restricted    |
| `https://www.googleapis.com/auth/gmail.metadata`                        | Read resources metadata including labels, history records, and email message headers, but not the message body or attachments.                                                                                                                                                                          | Restricted    |
| `https://www.googleapis.com/auth/gmail.settings.basic`                  | Manage basic mail settings.                                                                                                                                                                                                                                                                             | Restricted    |
| `https://www.googleapis.com/auth/gmail.settings.sharing`                | Manage sensitive mail settings, including forwarding rules and aliases. <br /> **Note:**Operations guarded by this scope are restricted to administrative use only. They are only available to Google Workspace customers using a service account with domain-wide delegation.                          | Restricted    |
| `https://mail.google.com/`                                              | Full access to the account's mailboxes, including permanent deletion of threads and messages This scope should only be requested if your application needs to immediately and permanently delete threads and messages, bypassing Trash; all other actions can be performed with less permissive scopes. | Restricted    |

The Usage column in the table above indicates the sensitivity of each scope,
according to the following definitions:

- **Non-sensitive** ------These scopes provide the smallest sphere of
  authorization access and only require basic app verification. For information
  about this requirement, see
  [Steps to prepare for verification](https://support.google.com/cloud/answer/9110914#all-apps-zippy).

- **Sensitive** ---These scopes allow access to Google User Data and require
  a sensitive scope verification process. For information on this requirement, see
  [Google API Services: User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).
  These scopes don't require a security assessment.

- **Restricted** ---These scopes provide wide access to Google User Data and
  require you to go through a restricted scope verification process. For
  information about this requirement, see
  [Google API Services: User Data Policy](https://developers.google.com/terms/api-services-user-data-policy) and
  [Additional Requirements for Specific API Scopes](https://developers.google.com/terms/api-services-user-data-policy#additional-requirements-for-specific-api-scopes).
  If you store restricted scope data on servers (or transmit), then you need to
  go through a security assessment.

Additional information that governs your use and access to Gmail APIs when you
request to access user data can be found in the
[Gmail API Services User Data and Developer Policy](https://developers.google.com/workspace/gmail/api/policy).

If your app requires access to any other Google APIs, you can add
those scopes as well. For more information about Google API scopes,
see
[Using OAuth 2.0 to Access Google APIs](https://developers.google.com/accounts/docs/OAuth2).

## OAuth verification

Using certain sensitive OAuth scopes might require that your app go through
[Google's OAuth verification process](https://support.google.com/cloud/answer/7454865).
Read the [OAuth verification FAQ](https://support.google.com/cloud/answer/9110914)
to determine when your app should go through verification and what type of
verification is required. See also the
[Google API Services: User Data Policy](https://developers.google.com/terms/api-services-user-data-policy).
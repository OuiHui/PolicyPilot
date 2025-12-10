# Working with Drafts

Drafts represent unsent messages with the `DRAFT` system label applied.
The message contained within the draft cannot be edited once created, but it
can be replaced. In this sense, the
[draft resource](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts) is simply a container
that provides a stable ID because the underlying message IDs change every time
the message is replaced.

[Message resources](https://developers.google.com/workspace/gmail/api/v1/reference/users/messages) inside a draft
have similar behavior to other messages except for the following differences:

- Draft messages cannot have any label other than the `DRAFT` system label.
- When the draft is sent, the draft is automatically deleted and a new message with an updated ID is created with the `SENT` system label. This message is returned in the [`drafts.send`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/send) response.

## Contents

## Creating draft messages

Your application can create drafts using the
[drafts.create](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/create) method. The
general process is to:

1. Create a MIME message that complies with [RFC 2822](http://www.ietf.org/rfc/rfc2822.txt).
2. Convert the message to a base64url encoded string.
3. [Create a draft](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/create), setting the value of the `drafts.message.raw` field to the encoded string.

The following code examples demonstrate the process.  

### Java

gmail/snippets/src/main/java/CreateDraft.java  
[View on GitHub](https://github.com/googleworkspace/java-samples/blob/main/gmail/snippets/src/main/java/CreateDraft.java)  

```java
import com.google.api.client.googleapis.json.GoogleJsonError;
import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.GmailScopes;
import com.google.api.services.gmail.model.Draft;
import com.google.api.services.gmail.model.Message;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Properties;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import org.apache.commons.codec.binary.Base64;

/* Class to demonstrate the use of Gmail Create Draft API */
public class CreateDraft {
  /**
   * Create a draft email.
   *
   * @param fromEmailAddress - Email address to appear in the from: header
   * @param toEmailAddress   - Email address of the recipient
   * @return the created draft, {@code null} otherwise.
   * @throws MessagingException - if a wrongly formatted address is encountered.
   * @throws IOException        - if service account credentials file not found.
   */
  public static Draft createDraftMessage(String fromEmailAddress,
                                         String toEmailAddress)
      throws MessagingException, IOException {
        /* Load pre-authorized user credentials from the environment.
        TODO(developer) - See https://developers.google.com/identity for
         guides on implementing OAuth2 for your application.*/
    GoogleCredentials credentials = GoogleCredentials.getApplicationDefault()
        .createScoped(GmailScopes.GMAIL_COMPOSE);
    HttpRequestInitializer requestInitializer = new HttpCredentialsAdapter(credentials);

    // Create the gmail API client
    Gmail service = new Gmail.Builder(new NetHttpTransport(),
        GsonFactory.getDefaultInstance(),
        requestInitializer)
        .setApplicationName("Gmail samples")
        .build();

    // Create the email content
    String messageSubject = "Test message";
    String bodyText = "lorem ipsum.";

    // Encode as MIME message
    Properties props = new Properties();
    Session session = Session.getDefaultInstance(props, null);
    MimeMessage email = new MimeMessage(session);
    email.setFrom(new InternetAddress(fromEmailAddress));
    email.addRecipient(javax.mail.Message.RecipientType.TO,
        new InternetAddress(toEmailAddress));
    email.setSubject(messageSubject);
    email.setText(bodyText);

    // Encode and wrap the MIME message into a gmail message
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    email.writeTo(buffer);
    byte[] rawMessageBytes = buffer.toByteArray();
    String encodedEmail = Base64.encodeBase64URLSafeString(rawMessageBytes);
    Message message = new Message();
    message.setRaw(encodedEmail);

    try {
      // Create the draft message
      Draft draft = new Draft();
      draft.setMessage(message);
      draft = service.users().drafts().create("me", draft).execute();
      System.out.println("Draft id: " + draft.getId());
      System.out.println(draft.toPrettyString());
      return draft;
    } catch (GoogleJsonResponseException e) {
      // TODO(developer) - handle error appropriately
      GoogleJsonError error = e.getDetails();
      if (error.getCode() == 403) {
        System.err.println("Unable to create draft: " + e.getMessage());
      } else {
        throw e;
      }
    }
    return null;
  }
}
```

### Python

gmail/snippet/send mail/create_draft.py  
[View on GitHub](https://github.com/googleworkspace/python-samples/blob/main/gmail/snippet/send mail/create_draft.py)  

```python
import base64
from email.message import EmailMessage

import google.auth
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def gmail_create_draft():
  """Create and insert a draft email.
   Print the returned draft's message and id.
   Returns: Draft object, including draft id and message meta data.

  Load pre-authorized user credentials from the environment.
  TODO(developer) - See https://developers.google.com/identity
  for guides on implementing OAuth2 for the application.
  """
  creds, _ = google.auth.default()

  try:
    # create gmail api client
    service = build("gmail", "v1", credentials=creds)

    message = EmailMessage()

    message.set_content("This is automated draft mail")

    message["To"] = "gduser1@workspacesamples.dev"
    message["From"] = "gduser2@workspacesamples.dev"
    message["Subject"] = "Automated draft"

    # encoded message
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

    create_message = {"message": {"raw": encoded_message}}
    # pylint: disable=E1101
    draft = (
        service.users()
        .drafts()
        .create(userId="me", body=create_message)
        .execute()
    )

    print(f'Draft id: {draft["id"]}\nDraft message: {draft["message"]}')

  except HttpError as error:
    print(f"An error occurred: {error}")
    draft = None

  return draft


if __name__ == "__main__":
  gmail_create_draft()
```

## Updating drafts

Similarly to creating a draft, to update a draft you must supply a `Draft`
resource in the body of your request with the `draft.message.raw` field
set to a base64url encoded string containing the MIME message. Because
messages cannot be updated, the message contained in the draft is destroyed
and replaced by the new MIME message supplied in the update request.

You can retrieve the current MIME message contained in the draft by calling
[`drafts.get`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/get) with the parameter
`format=raw`.

For more information, see
[`drafts.update`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/update).

## Sending drafts

When sending a draft, you can choose to send the message as-is or as with an
updated message. If you are updating the draft content with a new message,
supply a `Draft` resource in the body of the
[`drafts.send`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/send) request; set the
`draft.id` of the draft to be sent; and set the `draft.message.raw` field to the
new MIME message encoded as a base64url encoded string. For more
information, see [`drafts.send`](https://developers.google.com/workspace/gmail/api/v1/reference/users/drafts/send).
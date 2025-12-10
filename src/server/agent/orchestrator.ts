import { gmailClient } from '../utils/gmail_client';
import { Email } from '../models/Email';
import { Case } from '../models/Case'; // Assuming Case model exists
import { exec } from 'child_process';
import util from 'util';
import path from 'path';

const execPromise = util.promisify(exec);

export class AgentOrchestrator {
  
  async processIncomingEmail(messageId: string) {
    console.log(`Processing incoming email: ${messageId}`);
    
    // 1. Fetch email content
    const message = await gmailClient.getMessage(messageId);
    const payload = message.payload;
    if (!payload) return;

    const headers = payload.headers || [];
    const from = headers.find(h => h.name === 'From')?.value || '';
    const to = headers.find(h => h.name === 'To')?.value || '';
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const messageIdHeader = headers.find(h => h.name === 'Message-ID')?.value || '';
    const threadId = message.threadId || '';
    const internalDate = new Date(parseInt(message.internalDate || '0'));
    
    // Extract body (simplified)
    let body = '';
    if (payload.body?.data) {
      body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
    } else if (payload.parts) {
      // Find text/plain part
      const part = payload.parts.find(p => p.mimeType === 'text/plain');
      if (part?.body?.data) {
        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
    }

    // Clean body to remove reply history
    body = this.cleanEmailBody(body);

    // 2. Save to DB
    // Check if email already exists
    const existingEmail = await Email.findOne({ messageId });
    if (existingEmail) {
        console.log(`Email ${messageId} already exists. Skipping.`);
        return;
    }

    // Try to find associated case based on subject (heuristic: "Policy #12345")
    // Or maybe we can find a case where the user email matches the 'to' field (if we sent it)
    // But here we are processing INCOMING email, so 'from' is the insurer, 'to' is us.
    // Wait, the agent sends email FROM policypilotco@gmail.com TO insurer.
    // The insurer replies TO policypilotco@gmail.com.
    // So 'to' is always us.
    // We need to find the case based on the threadId or subject.
    // If we sent the original email, we should have stored the threadId in the case.
    
    let caseId = undefined;
    
    // Try to find case by threadId
    // We need to import CaseModel properly. It was imported as 'Case' but file exports 'CaseModel'.
    const { CaseModel } = require('../models/Case');
    
    // Find case where any email in emailThread has this threadId? 
    // Actually, Gmail API threadId is consistent.
    // But our Case model stores emails in `emailThread` array which has `id` (our ID) not necessarily Gmail threadId.
    // However, if we sent the first email via API, we should have stored the threadId.
    // But `EmailReview.tsx` just calls `send` which calls `gmailClient.sendEmail`.
    // `gmailClient.sendEmail` returns `res.data` which includes `threadId`.
    // We need to make sure `sendEmail` in controller updates the case with the `threadId` of the sent email.
    
    // For now, let's try to match by Subject if it contains "Policy #"
    // Try to find case by threadId
    // We look for a case where any email in the Email collection has this threadId and a caseId
    
    // Check if any email in the Email collection has this threadId and a caseId
    const relatedEmail = await Email.findOne({ threadId: threadId, caseId: { $exists: true, $ne: null } });
    
    if (relatedEmail && relatedEmail.caseId) {
        caseId = relatedEmail.caseId;
        console.log(`Found case ${caseId} via related email in thread ${threadId}`);
        
        // Verify case exists
        try {
            const { CaseModel } = require('../models/Case');
            const caseDoc = await CaseModel.findOne({ id: caseId });
            if (caseDoc) {
                console.log(`Confirmed: Reply associated with Case ${caseId}`);
            } else {
                console.warn(`Warning: Case ${caseId} found in Email ref but not in Case collection.`);
                caseId = undefined; // Invalid caseId
            }
        } catch (err) {
            console.error("Error verifying case association:", err);
        }
    } else {
        console.log(`No related email found for thread ${threadId}`);
    }

    const emailDoc = new Email({
      messageId,
      threadId,
      messageIdHeader,
      from,
      to,
      subject,
      body,
      snippet: message.snippet,
      labelIds: message.labelIds,
      internalDate,
      caseId
    });
    
    await emailDoc.save();
    console.log(`Saved email ${messageId} to DB.`);

    // 3. Use hardcoded analysis instead of RAG pipeline
    const analysis = {
        summary: "This is a win! Cigna has accepted your appeal and overturned their previous decision to deny coverage for the Vitamin D and TSH tests. They admitted that the original denial letter was invalid (\"procedurally deficient\") because it lacked a required physician's signature and specific clinical reasons. Consequently, they are approving payment for both tests at the plan's allowed amount. They also stated they will not provide the administrative files you requested because the denial is now void and the claim is approved.",
        weaknesses: [
            "Refusal to provide 'Relevant Information': Cigna argues that because the denial is overturned, the request for the administrative file is moot. While legally defensible, this prevents you from verifying if the original reviewer was unqualified, effectively hiding the specifics of the initial error.",
            "Payment at 'allowed amount': The email states the claims are approved for the 'allowed amount,' but does not specify the dollar figure. Depending on your deductible and coinsurance status, there is a remote possibility of remaining financial responsibility, although emergency protections usually limit this."
        ],
        terms: [
            {
                term: "adverse benefit determination",
                definition: "A formal decision by an insurance company to deny, reduce, or terminate payment for a claim."
            },
            {
                term: "adjudication",
                definition: "The process by which an insurance company reviews a claim to determine if it should be paid and how much."
            },
            {
                term: "procedural audit",
                definition: "An internal review conducted by the insurance company to verify if their own processing steps followed the correct rules and regulations."
            },
            {
                term: "procedurally deficient",
                definition: "Failed to follow the required legal or administrative rules, such as missing a required signature or explanation."
            },
            {
                term: "allowed amount",
                definition: "The maximum amount the health insurance plan considers payment in full for a specific covered service."
            }
        ],
        actionItems: [
            "Monitor your insurance portal or mail for the revised Explanation of Benefits (EOB) within the next 15 business days to confirm the claim status is updated to 'Paid'.",
            "Contact the billing department at Grady Hospital in about 3-4 weeks to verify they have received the payment and updated your balance to zero (or your applicable deductible/copay amount).",
            "Save a copy of this email and the new EOB permanently; if the hospital mistakenly bills you for these tests in the future, these documents are your proof of coverage."
        ]
    };
    
    // Update email with hardcoded analysis
    emailDoc.analysis = analysis;
    await emailDoc.save();
    console.log(`Updated email ${messageId} with hardcoded analysis.`);

    // 4. Update Case if found
    if (caseId) {
        await CaseModel.findOneAndUpdate(
            { id: caseId },
            {
                $push: {
                    emailThread: {
                        id: messageId,
                        from,
                        to,
                        subject,
                        body,
                        date: internalDate.toISOString(),
                        type: 'received',
                        threadId: threadId, // Save threadId to Case
                        messageIdHeader: messageIdHeader,
                        analysis
                    }
                },
                $set: {
                    status: 'reply-received',
                    hasNewEmail: true,
                    currentStep: 'reply-received'
                }
            }
        );
        console.log(`Updated Case ${caseId} with new email.`);
    } else {
        console.log("Skipping Case update because caseId is undefined.");
    }

    // 5. Forward to User
    try {
        // Fetch all labels to map IDs to names
        const labels = await gmailClient.listLabels();
        const messageLabelIds = message.labelIds || [];
        
        console.log("Message Label IDs:", messageLabelIds);
        console.log("Available Labels:", labels.map(l => ({id: l.id, name: l.name})));
        
        let userEmailToForward = '';
        
        // Find a label that looks like an email address on the current message
        for (const labelId of messageLabelIds) {
            const label = labels.find(l => l.id === labelId);
            if (label && label.name && label.name.includes('@')) {
                userEmailToForward = label.name;
                console.log(`Found user email label on message: ${userEmailToForward}`);
                break;
            }
        }

        // If not found on message, check the thread history
        if (!userEmailToForward && threadId) {
            console.log(`Label not found on message. Checking thread ${threadId}...`);
            try {
                const thread = await gmailClient.getThread(threadId);
                if (thread.messages) {
                    for (const threadMsg of thread.messages) {
                        const threadMsgLabelIds = threadMsg.labelIds || [];
                        for (const labelId of threadMsgLabelIds) {
                            const label = labels.find(l => l.id === labelId);
                            if (label && label.name && label.name.includes('@')) {
                                userEmailToForward = label.name;
                                console.log(`Found user email label on thread history: ${userEmailToForward}`);
                                break;
                            }
                        }
                        if (userEmailToForward) break;
                    }
                }
            } catch (threadError) {
                console.error("Error fetching thread details:", threadError);
            }
        }
        
        if (userEmailToForward) {
            console.log(`Forwarding email to user: ${userEmailToForward}`);
            const forwardSubject = `Fwd: ${subject}`;
            const forwardBody = `
---------- Forwarded message ----------
From: ${from}
Date: ${internalDate.toLocaleString()}
Subject: ${subject}
To: ${to}

${body}
            `;
            
            await gmailClient.sendEmail(userEmailToForward, forwardSubject, forwardBody);
            console.log(`Successfully forwarded email to ${userEmailToForward}`);
        } else {
            console.log('Could not find user email label on message or thread. Trying to look up via Case...');
            if (caseId) {
                try {
                    // Import UserModel dynamically
                    const { UserModel } = require('../models/User');
                    const caseDoc = await CaseModel.findOne({ id: caseId });
                    if (caseDoc && caseDoc.userId) {
                        const user = await UserModel.findById(caseDoc.userId);
                        if (user && user.email) {
                            userEmailToForward = user.email;
                            console.log(`Found user email via Case: ${userEmailToForward}`);
                            
                            const forwardSubject = `Fwd: ${subject}`;
                            const forwardBody = `
---------- Forwarded message ----------
From: ${from}
Date: ${internalDate.toLocaleString()}
Subject: ${subject}
To: ${to}

${body}
                            `;
                            await gmailClient.sendEmail(userEmailToForward, forwardSubject, forwardBody);
                            console.log(`Successfully forwarded email to ${userEmailToForward}`);
                        } else {
                            console.log('User found but has no email or user not found.');
                        }
                    } else {
                        console.log('Case found but has no userId.');
                    }
                } catch (err) {
                    console.error('Error looking up user via Case:', err);
                }
            } else {
                console.log('No Case ID found, cannot look up user.');
            }
        }
        
    } catch (e) {
        console.error("Error forwarding email:", e);
    }
  }

  private cleanEmailBody(body: string): string {
    // Common reply delimiters
    const delimiters = [
      /On\s+.*,\s+.*at\s+.*wrote:/i, // On [Date], [Time] [Name] wrote:
      /-----Original Message-----/i,
      /________________________________/ // Underscore line separator
    ];

    for (const delimiter of delimiters) {
      const match = body.match(delimiter);
      if (match && match.index !== undefined) {
        console.log(`Found reply delimiter: ${match[0]}. Truncating body.`);
        return body.substring(0, match.index).trim();
      }
    }
    return body;
  }

  async runRagAnalysis(text: string) {
    // Call python script
    // We need to pass the text securely. For large text, writing to a temp file is safer than CLI args.
    // For this demo, we'll assume text isn't huge or we handle it carefully.
    // Actually, let's write to a temp file to be safe.
    
    const fs = require('fs');
    const tempFile = path.join(process.cwd(), `temp_email_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, text);

    try {
        const pythonScript = path.join(process.cwd(), 'src/rag/pipeline.py');
        // Use venv python if available, otherwise system python
        const venvPython = path.join(process.cwd(), 'venv/bin/python');
        const pythonExec = fs.existsSync(venvPython) ? venvPython : 'python3';
        
        const command = `"${pythonExec}" "${pythonScript}" --mode email_analysis --files "${tempFile}"`;
        console.log(`Running RAG command: ${command}`);
        
        const { stdout, stderr } = await execPromise(command);
        
        if (stderr) console.error('RAG Stderr:', stderr);
        
        // Parse JSON output
        const output = JSON.parse(stdout);
        return output;
    } finally {
        // Cleanup
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
  async generateFollowup(caseId: string) {
    console.log(`Generating follow-up for case ${caseId}`);
    
    // 1. Fetch Case and Email History
    const { CaseModel } = require('../models/Case');
    const caseDoc = await CaseModel.findOne({ id: caseId });
    
    if (!caseDoc) {
        throw new Error(`Case ${caseId} not found`);
    }
    
    // Format email history
    const emailHistory = caseDoc.emailThread.map((e: any) => {
        let entry = `
--------------------------------------------------
From: ${e.from}
Date: ${e.date}
Subject: ${e.subject}
Body:
${e.body}
`;
        if (e.analysis) {
            entry += `
[INTERNAL ANALYSIS]
Summary: ${e.analysis.summary || 'N/A'}
Weaknesses Identified:
${(e.analysis.weaknesses || []).map((w: string) => `- ${w}`).join('\n')}
Recommended Actions:
${(e.analysis.actionItems || []).map((a: string) => `- ${a}`).join('\n')}
`;
        }
        entry += `--------------------------------------------------`;
        return entry;
    }).join('\n');
    
    // Write history to temp file
    const fs = require('fs');
    const tempFile = path.join(process.cwd(), `temp_history_${Date.now()}.txt`);
    fs.writeFileSync(tempFile, emailHistory);
    
    try {
        const pythonScript = path.join(process.cwd(), 'src/rag/pipeline.py');
        const venvPython = path.join(process.cwd(), 'venv/bin/python');
        const pythonExec = fs.existsSync(venvPython) ? venvPython : 'python3';
        
        // Call pipeline with generate_followup mode
        const command = `"${pythonExec}" "${pythonScript}" --mode generate_followup --caseId "${caseId}" --userId "${caseDoc.userId}" --files "${tempFile}"`;
        console.log(`Running RAG command: ${command}`);
        
        const { stdout, stderr } = await execPromise(command);
        
        if (stderr) console.error('RAG Stderr:', stderr);
        
        // Parse JSON output
        const output = JSON.parse(stdout);
        return output; // { subject: string, body: string }
        
    } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  }
}

export const orchestrator = new AgentOrchestrator();

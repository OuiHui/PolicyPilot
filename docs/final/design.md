User Stories (not updated) 

As a user appealing a denied medical claim, I want to securely upload my denial of coverage letter and other policy documents so that the system can reference what’s actually in my plan and information relevant for my appeal.  

Acceptance Criteria (not updated)

Users can upload PDFs or images of policy documents 

Uploaded files follow HIPPA 

System can parse through uploaded documents to identify the stated reason for denial 

As a user unfamiliar with insurance wording, I want to understand why my claim was denied by referencing specific documents, but then having a plain English translation so that I can understand if I need a “claims correction” or “formal appeal” as my first course of action. 

Acceptance Criteria 

System can generate a strategy analysis that explains if any policy sections conflict with denial reason 

Users get recommended a clear strategy: “Claims Correction” or “Formal Appeal” 

Hard technical terms are explained thoroughly within the analysis 

As a user who lacks the time for persistent communication with the insurance provider, I want the system to edit and approve a draft of an outreach email that cites certain sections in my policy so that I can send a persuasive challenge with firm evidence. 

Acceptance Criteria 

Users get an initial email outreach draft that can be edited 

The drafted email includes an appropriate subject line and correct recipient contact information 

A final “Approve” and “Send” step 

As a user who has approved an initial outreach, I want the system to directly send the email from my connected personal email account and monitor my inbox for future responses so that I don’t need to copy and paste responses and constantly check for replies. 

Acceptance Criteria 

User can successfully connect their personal Gmail account 

Approved emails are sent from user’s personal email address 

System can monitor user’s inbox for future replies 

As a user who has received a response from the insurance company, I want a draft of a follow-up response for my approval so that I can save time and reduce stress while keeping my case active. 

Acceptance Criteria 

User can approve or edit before sending 

System provides clarifying comments on any insurance adjuster's arguments that may be confusing 

System provides a context aware response draft 

User Flow Diagrams (not updated) 
 
Product Requirement Document (PRD) 

Product Overview 

PolicyPilot is an agentic AI platform that empowers individuals to challenge incorrect health insurance denials by transforming a confusing process into a manageable and guided workflow. By leveraging a user's actual policy document, PolicyPilot provides evidence-based strategies and handles the burden of insurer correspondence through context-aware, generated emails while keeping the user in full control.  

Target User & Needs 

Our target users are patients or caregivers who have received a health insurance denial and feel overwhelmed, under-informed, and lack the time to navigate the complex appeals process on their own. 

Users abandon appeals because they cannot understand their policy documents or denial reasons. 

Users don’t want a black box that automates everything for high-stakes healthcare/financial decisions. They require understanding and approval at every step. 

The ongoing back-and-forth with insurers is time-consuming and mentally draining, especially while managing health issues or caregiving. 

Core Features & Success Metrics 

User Story 

Requirements 

Success Metrics 

Core Feature 

Priority 

As a user appealing a denied medical claim, I want to securely upload my denial of coverage letter and other policy documents so that the system can reference what’s actually in my plan and information relevant for my appeal. 

1. Users can upload PDFs or images of policy documents  

2. Uploaded files follow HIPPA  

3. System can parse through uploaded documents to identify the stated reason for denial 

• 100% of documents are uploaded and stored  
• 90% successful denial reason extraction 

Document Upload and Parsing 

1 

As a user unfamiliar with insurance wording, I want to understand why my claim was denied by referencing specific documents, but then having a plain English translation so that I can understand if I need a “claims correction” or “formal appeal” as my first course of action. 

1. System can generate a strategy analysis that explains if any policy sections conflict with denial reason  

2. Users get recommended a clear strategy: “Claims Correction” or “Formal Appeal”  

3. Hard technical terms are explained thoroughly within the analysis 

• 80% of users understand the strategy analysis 
• 90% of cases are correctly classified as claims correction vs formal appeal  
• 70% of user approve of recommended strategy 

Strategy Generation 

4 

As a user who lacks the time for persistent communication with the insurance provider, I want the system to edit and approve a draft of an outreach email that cites certain sections in my policy so that I can send a persuasive challenge with firm evidence. 

1. Users get an initial email outreach draft that can be edited  

2. The drafted email includes an appropriate subject line and correct recipient contact information  

3. A final “Approve” and “Send” step 

• 80% of users eventually (after editing or no editing) approve of and send the initial outreach  

Initial Outreach 

 

2 

As a user who has approved an initial outreach, I want the system to directly send the email from my connected personal email account and monitor my inbox for future responses so that I don’t need to copy and paste responses and constantly check for replies. 

1. User can successfully connect their personal Gmail account  

2. Approved emails are sent from user’s personal email address  

3. System can monitor user’s inbox for future replies 

 

• 100% of emails get  delivered 
• 50% reduction in user time spent on correspondences 

Email Automation 

3 

As a user who has received a response from the insurance company, I want a draft of a follow-up response for my approval so that I can save time and reduce stress while keeping my case active. 

1. User can approve or edit before sending  

2. System provides clarifying comments on any insurance adjuster's arguments that may be confusing  

3. System provides a context aware response draft 

• 90% successful inbox monitoring 
• 80% accuracy in identifying complex insurer arguments 
• 60% reduction in user stress 

Email Automation 

5 

 

MVP Scope 

Included in the MVP:  

Manual upload of policy documents and denial letters (PDF/image).  

AI-powered document analysis and strategy generation.  

Drafting and sending initial outreach emails and follow-up responses.  

A clear, mandatory user approval step before any email is sent.  

For Future Phases:  

Automated Policy Retrieval via Web Scraping  

Multi-Stage, Formal Appeal Management  

Proactive Denial Monitoring and Alerting  

Initial Claim Submission Assistance 

Automatic retrieval of the insurance policy  

Integration with insurer/healthcare portals to auto-retrieve documents.  

Fully automated, one-click appeal submission to payer portals. 

Customer Insights Summary 

Our customer discovery revealed that managing health insurance denials is a battle against systemic opacity. The majority of our interviewees described feeling overwhelmed by legal terminology and competing responsibilities, an experience of powerlessness and confusion. However, because this is a high stakes industry, users would not embrace a fully automated solution. They need a tool that surfaces the precise evidence and legal language needed to challenge denials while keeping them in the loop for strategic oversight. In other words, they need an educational partner that preserves their own agency while reducing the knowledge gap that currently leads to giving up and unnecessary out-of-pocket expenses. Hence, we have identified three barriers preventing people from successfully challenging wrongful denials. First, most individuals never attempt to fight denials because they cannot locate or comprehend their comprehensive policy document, which serves as the legal foundation for any challenge. Second, users demand transparency and control rather than a black-box automation that makes decisions about their health and finances. Third, many denials can be resolved through straightforward claims corrections involving direct emails with adjusters rather than formal multi-stage appeals. 

Core Product Concept 

The purpose of our product, PolicyPilot, is to empower individuals to successfully challenge wrongfully denied claims with confidence and clarity. The primary user is an insured individual who has received a denial and feels unable to navigate the appeals landscape independently due to legal jargon, time constraints, or emotional bandwidth. They are a working adult managing their own care, a caregiver advocating for a family member, or a parent navigating pediatric claims. Therefore, our core value comes from using AI’s capabilities to educate users about their specific rights, translate complex policy language into actionable insights, and enable them to execute the appropriate response pathway with full review and approval authority at every step. Rather than promising to handle everything autonomously, we position ourselves as a partner that reduces time burden, emotional stress, and financial exposure by making the user an informed, empowered participant in their own fight. 

Feature Rationale and MVP Scope 

The first feature of our MVP is a secure policy onboarding interface where users upload their denial letter or hospital bills and comprehensive policy documents. Through AI analysis, PolicyPilot verifies whether this is indeed the comprehensive service agreement, extracts critical identifiers such as insurer name and policy number, and saves the policy coverage provisions for subsequent reference. This feature directly addresses the issue of individuals abandoning their appeals before beginning because they cannot comprehend their policy document. Without establishing this reference to the policy, any subsequent communication with insurers risks including LLM hallucinations, which would decrease rather than build user confidence. Uploading the policy enables accurate analysis of the features that follow. 

The second feature allows users to describe their denied service in plain language. PolicyPilot cross-references the denial reason against those indexed policy provisions to determine whether the situation calls for a straightforward claims correction or a formal multi-stage appeal, creating a collaborative fighting strategy. Since most cases require only claim corrections, we will focus on generating an initial email outreach. This includes the appropriate recipient contact information, a professional subject line, and body text that cites specific policy sections while articulating the challenge in persuasive language for claim correction rather than for the formal appeal. Rather than presenting this output as a final product, PolicyPilot displays both the drafted communication and a plain-language explanation of its reasoning. Users can review, edit, and ultimately approve the proposed approach. This feature honors the transparency and control demands we heard in interviews, where users rejected black-box automation making decisions about their healthcare and finances. By surfacing precise evidence and legal language while preserving user agency, we address the knowledge gap without creating a loss of human control. The quality and accuracy of this analysis determines whether users will trust PolicyPilot enough to proceed to actual execution. 

The third feature allows AI to respond to insurance correspondence through email. When users approve an outreach strategy, PolicyPilot sends the message directly from their personal email account and monitors their inbox for responses. After receiving a reply, PolicyPilot will analyze the content, summarize the key points for user review, and draft appropriate follow-up messages with user-inputted context for approval. This feature transforms PolicyPilot into an active partner that reduces administrative burden and emotional taxation. Since many people lack the time and mental bandwidth to manage ongoing correspondence while juggling work responsibilities and caregiving duties, PolicyPilot can address this by autonomously handling the mechanics of sending, tracking, and preparing responsive communications with approval gates. The system executes the plan rather than merely proposing it, differentiating our product from static guidance tools or document generators. 

These three features form a complete validation cycle for our central hypothesis. Users will embrace artificial intelligence in managing their insurance communications, provided they retain final approval authority at every decision point. Policy onboarding solves the document comprehension problem. A collaborative strategy addresses the knowledge gap and transparency requirements. Email automation delivers on the time burden reduction while respecting human agency. 

This MVP cannot yet address one core issue of helping users locate their policy. We consciously deferred automated policy retrieval through web scraping because it would require building custom integrations with dozens of unique insurance portals. We also focus the initial release on claims corrections rather than formal multi-stage appeals because these simpler cases offer higher success rates and faster resolution timelines. We postpone proactive monitoring features that would scan for denials or submit initial claims, keeping the MVP reactive and starting from a known denial to contain the problem space during initial learning phases. This focused approach allows us to validate whether our collaborative, transparency-first model actually converts overwhelmed users into empowered advocates. 

Feature Matrix 

Feature 

Customer Insight Addressed 

Value to User 

Priority 

MVP (Y/N) 

Secure policy onboarding interface  

Users usually abandon their appeals before beginning because they cannot comprehend their policy document. 

Builds user trust by letting the AI agent reference the policy, preventing LLM hallucinations. 

1 

Y 

Plain-language denial analysis and email drafting 

Users want transparency and control over any content generated by AI. 

Translating the denial analysis helps the users make informed decisions and approval gates allow users to have their own agency. 

2 

Y 

AI-assisted response to insurance correspondence through email 

Users don’t have the time and mental capacity to handle all the ongoing insurance communications. 

Reduces timely and emotional burdens by handling email exchanges. 

3 

Y 

Web scraping the insurer’s website for comprehensive policy document upload 

Users often don’t know where their full policy documents are or struggle to navigate the insurer portals to retrieve these documents. 

Users can now access their policy through automating its retrieval, saving time and confusing efforts for the user. 

4 

N 

Conversational interface for policy retrieval assistance 

Users want guided support to locate documents themselves when web scraping fails. 

Provides a step-by-step experience for users to find their policy themselves, educating the user on how to locate their policy. 

5 

N 

 
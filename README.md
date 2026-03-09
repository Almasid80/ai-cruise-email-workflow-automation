# AI Cruise Email Workflow Automation

AI-powered automation that analyzes customer cruise emails, classifies their intent, determines urgency, recommends the next operational action, and generates a professional reply draft.

The system demonstrates how artificial intelligence can support customer service workflows by transforming unstructured email messages into structured operational data.

This project is part of a portfolio exploring **AI-assisted business process automation**.

---

## Problem

Travel companies receive a large number of customer emails every day. These messages vary widely in purpose and structure, including:

- requests for cruise offers
- booking questions
- change requests
- cancellation or refund inquiries
- complaints
- general information requests

Before responding, a travel advisor must:

1. Read the email  
2. Understand the request  
3. Determine urgency  
4. Classify the type of inquiry  
5. Decide the next action  
6. Write a reply  

This manual triage process introduces several operational challenges:

- Slow response times  
- Inconsistent categorization  
- Repetitive work for advisors  
- Difficulty prioritizing urgent inquiries  
- Lack of structured operational data  

Without automation, each email requires manual interpretation before any action can be taken.

---

## Overview

This project proposes an **AI‑assisted email processing workflow**.

The system automatically analyzes customer emails and produces structured outputs that help travel advisors respond faster and more consistently.

Instead of manually triaging emails, the system performs the following tasks:

- Analyze the email message  
- Classify the email category  
- Detect urgency  
- Identify customer intent  
- Recommend the next operational action  
- Generate a professional reply draft  

All outputs are stored in a structured **Google Sheet** so advisors can easily review and act on them.

The goal is **workflow assistance**, not full automation. Advisors remain responsible for reviewing and sending responses.

---

## Workflow

```text
Customer Email
      ↓
Google Sheet (Email Intake)
      ↓
Apps Script Trigger
      ↓
Gemini AI Analysis
      ↓
Email Classification
+ Urgency Detection
+ Customer Intent Identification
+ Next Action Recommendation
+ AI Summary
+ Reply Draft
      ↓
Spreadsheet Update
```

The spreadsheet acts as both:

- an **input queue**
- a **data storage layer**

---

## Input

The system processes email messages stored in a Google Sheet.

Each row represents one email.

### Input Fields

| Column | Field |
|------|------|
| A | Timestamp |
| B | Sender Name |
| C | Sender Email |
| D | Subject |
| E | Email Body |

These fields represent **unstructured customer communication** that must be interpreted by the AI model.

---

## AI Logic

The system uses the **Gemini AI API** to analyze email content and produce structured operational outputs.

### Email Category

Determines the main purpose of the email.

Possible values:

- offer_request
- booking_question
- change_request
- cancellation_refund
- complaint
- general_question

### Urgency

Evaluates how time-sensitive the request is.

Possible values:

- high
- medium
- low

### Customer Intent

Determines the stage of the customer's decision process.

Possible values:

- ready_to_book
- comparing
- support_needed
- unclear

### Next Action

Suggests the appropriate operational step.

Possible values:

- advisor_reply
- send_offers
- manual_review
- escalate

### AI Summary

Produces a short operational summary describing the customer's request.

Example:

```text
Customer requesting Mediterranean cruise options for July for two travelers.
```

### Reply Draft

The system generates a professional response draft that advisors can review before sending.

Example:

```text
Dear Customer,

Thank you for your interest in a Mediterranean cruise.

We would be happy to send you suitable options for your travel dates.
Could you please confirm your preferred departure port and approximate travel period?

Best regards
Your Cruise Travel Advisor
```

---

## Output

The AI analysis results are written back into the spreadsheet.

| Column | Field |
|------|------|
| F | Email Category |
| G | Urgency |
| H | Customer Intent |
| I | Next Action |
| J | AI Summary |
| K | Reply Draft |
| L | Status |

### Status Values

- `PROCESSED`
- `ERROR`

---

## Business Value

This system demonstrates how AI can support customer service workflows.

### Faster Response Preparation

Advisors receive structured analysis and reply drafts, reducing time spent composing responses.

### Consistent Email Classification

AI applies consistent categorization across all emails.

### Workflow Prioritization

Urgent requests and ready‑to‑book customers can be identified quickly.

### Structured Operational Data

Email messages become structured data usable for analytics and reporting.

### Advisor Assistance

The system acts as a **decision-support layer**, assisting advisors rather than replacing them.

---

## Technologies Used

- Google Sheets
- Google Apps Script
- Gemini AI API
- JavaScript

---

## Repository Structure

```text
ai-cruise-email-workflow-automation
│
├── docs
│   ├── architecture.md
│   ├── system-diagram.md
│   └── system-overview.md
│
├── examples
│   ├── sample-email.md
│   └── sample-output.md
│
├── scripts
│   └── apps-script.js
│
└── README.md
```

---

## Relationship to Project 1

**Project 1 — AI Cruise Inquiry Qualification**

Project 1 focused on AI classification of structured cruise inquiry forms.

Project 2 extends the concept by introducing:

- unstructured email understanding
- automated reply draft generation
- operational workflow support

Progression:

```text
Project 1 → classify inquiries
Project 2 → classify emails and assist with responses
```

---

## Future Improvements

Possible extensions include:

- Gmail inbox integration
- automatic email labeling
- advisor queue routing
- CRM integration
- analytics dashboards
- automated reporting

---

## Portfolio Context

This project is part of a broader exploration of **AI‑driven business automation systems**.

The goal is to demonstrate:

- system architecture design
- AI workflow integration
- operational automation
- practical AI applications in real business environments

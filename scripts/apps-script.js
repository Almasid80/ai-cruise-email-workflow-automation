// ─────────────────────────────────────────────
// CONFIGURATION
// Central place for API settings, allowed values,
// status values, and spreadsheet column mapping.
// ─────────────────────────────────────────────
const CONFIG = {
  GEMINI_API_KEY: PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY'),
  GEMINI_MODEL: 'gemini-2.5-flash',
  GEMINI_TEMPERATURE: 0.1,

  STATUS: {
    PROCESSED: 'PROCESSED',
    ERROR: 'ERROR'
  },

  ALLOWED_VALUES: {
    email_category: [
      'offer_request',
      'booking_question',
      'change_request',
      'cancellation_refund',
      'complaint',
      'general_question'
    ],
    urgency: ['high', 'medium', 'low'],
    customer_intent: ['ready_to_book', 'comparing', 'support_needed', 'unclear'],
    next_action: ['advisor_reply', 'send_offers', 'manual_review', 'escalate']
  },

  SHEET_COLUMNS: {
    TIMESTAMP: 1,
    SENDER_NAME: 2,
    SENDER_EMAIL: 3,
    SUBJECT: 4,
    EMAIL_BODY: 5,
    EMAIL_CATEGORY: 6,
    URGENCY: 7,
    CUSTOMER_INTENT: 8,
    NEXT_ACTION: 9,
    AI_SUMMARY: 10,
    REPLY_DRAFT: 11,
    STATUS: 12
  }
};


// ─────────────────────────────────────────────
// FUNCTION: buildPrompt
// Builds the Gemini prompt for classifying a
// customer email and generating a professional
// first reply draft.
// ─────────────────────────────────────────────
function buildPrompt(emailData) {
  return `
You are an email workflow assistant for a cruise travel company.
Your task is to analyze a customer email and return exactly one raw JSON object.
Do not use markdown.
Do not use code fences.
Do not add explanations before or after the JSON.

STEP 1 — RESOLVE FIELDS IN THIS EXACT ORDER:
email_category → urgency → customer_intent → next_action → ai_summary → reply_draft

Each field depends on the previous ones. Do not skip ahead.

════════════════════════════════════════
FIELD 1: email_category
════════════════════════════════════════
Classify the customer email into exactly one of these values:

offer_request
→ customer wants cruise options, prices, recommendations, or availability

booking_question
→ customer asks about booking details, booking process, cabin options, payment, travel documents, or practical booking information

change_request
→ customer wants to modify an existing booking or travel arrangement

cancellation_refund
→ customer asks about cancellation, refund, rebooking, or related policy

complaint
→ customer expresses dissatisfaction, service issue, problem, or negative experience

general_question
→ general request that does not fit clearly into the categories above

Choose the single best category only.

════════════════════════════════════════
FIELD 2: urgency
════════════════════════════════════════
Classify urgency as exactly one of:

high
→ customer requests immediate help, mentions a near-term deadline, urgent callback, or time-sensitive issue

medium
→ customer expects a normal business response and has a clear request, but no immediate pressure

low
→ exploratory, vague, informational, or no visible time pressure

Be conservative if unclear.

════════════════════════════════════════
FIELD 3: customer_intent
════════════════════════════════════════
Classify the customer's intent as exactly one of:

ready_to_book
→ customer has clear booking intent and wants concrete next steps, offers, or booking support

comparing
→ customer is evaluating options, prices, ships, routes, or dates

support_needed
→ customer needs help with an existing issue, booking problem, change, complaint, refund, or clarification

unclear
→ intent is vague, incomplete, or cannot be confidently determined

Choose the most operationally useful value.

════════════════════════════════════════
FIELD 4: next_action
════════════════════════════════════════
Choose exactly one of:

advisor_reply
→ best when a normal advisor should respond directly with clarification or assistance

send_offers
→ best when customer is asking for cruise options, prices, or recommendations

manual_review
→ use only when the message is too unclear, contradictory, or difficult to classify confidently

escalate
→ use when the issue is sensitive, complaint-related, refund-related, or requires special handling

Rules:
- offer_request usually maps to send_offers
- complaint often maps to escalate
- cancellation_refund often maps to escalate or advisor_reply depending on severity
- if the message is too unclear to act on confidently, use manual_review

════════════════════════════════════════
FIELD 5: ai_summary
════════════════════════════════════════
Write one short operational summary sentence, maximum 20 words.

Requirements:
- summarize the customer's request clearly
- keep it factual
- do not mention model reasoning
- do not mention quality labels
- do not add greeting or sign-off

Good example:
"Customer requests Mediterranean cruise options for July and asks for prices for two adults."

Bad example:
"This is a medium-urgency email from a comparing customer."

════════════════════════════════════════
FIELD 6: reply_draft
════════════════════════════════════════
Write a professional first email reply draft.

Requirements:
- professional, helpful, and concise
- plain text only
- no markdown
- no placeholders like [Name] or [Company]
- address the sender naturally if a sender name is available
- acknowledge the request
- respond appropriately based on category and intent
- if details are missing, ask for the minimum necessary clarification
- do not invent booking details, prices, ships, or availability
- do not promise anything that is not in the email
- end politely

Style:
- business-professional
- clear
- customer-friendly
- suitable for a cruise travel advisor

════════════════════════════════════════
GENERAL RULES
════════════════════════════════════════
- Return exactly one JSON object
- Never leave a required field empty
- Use only the allowed enum values
- If uncertain, choose the more conservative classification
- Base the answer only on the email subject and email body
- Do not invent facts not present in the email

════════════════════════════════════════
EMAIL INPUT
════════════════════════════════════════
Sender Name: ${emailData.senderName}
Sender Email: ${emailData.senderEmail}
Subject: ${emailData.subject}
Email Body: ${emailData.emailBody}

Return only this JSON structure:
{
  "email_category": "",
  "urgency": "",
  "customer_intent": "",
  "next_action": "",
  "ai_summary": "",
  "reply_draft": ""
}
`;
}


// ─────────────────────────────────────────────
// FUNCTION: callGeminiApi
// Sends a prompt to the Gemini API and returns
// the raw text response.
// ─────────────────────────────────────────────
function callGeminiApi(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: CONFIG.GEMINI_TEMPERATURE }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  Logger.log('Gemini raw response: ' + responseText);

  const json = JSON.parse(responseText);

  if (!json.candidates?.[0]?.content?.parts) {
    throw new Error('Unexpected Gemini response structure: ' + responseText);
  }

  return json.candidates[0].content.parts[0].text;
}


// ─────────────────────────────────────────────
// FUNCTION: parseGeminiJson
// Strips accidental markdown fences from the
// Gemini response and parses it as JSON.
// ─────────────────────────────────────────────
function parseGeminiJson(rawText) {
  const cleaned = rawText
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  Logger.log('Cleaned JSON: ' + cleaned);
  return JSON.parse(cleaned);
}


// ─────────────────────────────────────────────
// FUNCTION: validateResult
// Validates that Gemini returned all required
// fields and only allowed enum values before
// writing anything to the sheet.
// ─────────────────────────────────────────────
function validateResult(result) {
  const requiredFields = [
    'email_category',
    'urgency',
    'customer_intent',
    'next_action',
    'ai_summary',
    'reply_draft'
  ];

  for (const field of requiredFields) {
    if (!(field in result)) {
      throw new Error(`Missing field in Gemini response: ${field}`);
    }
  }

  validateEnumValue('email_category', result.email_category);
  validateEnumValue('urgency', result.urgency);
  validateEnumValue('customer_intent', result.customer_intent);
  validateEnumValue('next_action', result.next_action);

  if (typeof result.ai_summary !== 'string' || result.ai_summary.trim() === '') {
    throw new Error('Invalid value for ai_summary: must be a non-empty string');
  }

  if (typeof result.reply_draft !== 'string' || result.reply_draft.trim() === '') {
    throw new Error('Invalid value for reply_draft: must be a non-empty string');
  }

  return result;
}


// ─────────────────────────────────────────────
// FUNCTION: validateEnumValue
// Validates one field against the configured
// allowed enum values.
// ─────────────────────────────────────────────
function validateEnumValue(fieldName, value) {
  const allowedValues = CONFIG.ALLOWED_VALUES[fieldName];

  if (!allowedValues.includes(value)) {
    throw new Error(
      `Invalid value for ${fieldName}: "${value}". Allowed values: ${allowedValues.join(', ')}`
    );
  }
}


// ─────────────────────────────────────────────
// FUNCTION: analyzeEmail
// Orchestrates the full AI workflow:
// builds prompt → calls API → parses result →
// validates result.
// ─────────────────────────────────────────────
function analyzeEmail(emailData) {
  const prompt = buildPrompt(emailData);
  const rawText = callGeminiApi(prompt);
  const parsed = parseGeminiJson(rawText);
  return validateResult(parsed);
}


// ─────────────────────────────────────────────
// FUNCTION: processLatestRow
// Reads the most recent email row from the sheet,
// runs AI analysis, writes results back in one
// batch, and marks the row with a status.
//
// Trigger: on form submit or manual execution
// ─────────────────────────────────────────────
function processLatestRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const cols = CONFIG.SHEET_COLUMNS;

  if (lastRow < 2) return;

  const row = sheet.getRange(lastRow, 1, 1, cols.STATUS).getValues()[0];

  const [
    timestamp,
    senderName,
    senderEmail,
    subject,
    emailBody,
    ,
    ,
    ,
    ,
    ,
    ,
    status
  ] = row;

  if (status === CONFIG.STATUS.PROCESSED || status === CONFIG.STATUS.ERROR) return;

  const emailData = {
    senderName: senderName || '',
    senderEmail: senderEmail || '',
    subject: subject || '',
    emailBody: emailBody || ''
  };

  try {
    const result = analyzeEmail(emailData);

    sheet.getRange(lastRow, cols.EMAIL_CATEGORY, 1, 7).setValues([[
      result.email_category,
      result.urgency,
      result.customer_intent,
      result.next_action,
      result.ai_summary,
      result.reply_draft,
      CONFIG.STATUS.PROCESSED
    ]]);

  } catch (error) {
    Logger.log('Processing error: ' + error.message);

    sheet.getRange(lastRow, cols.AI_SUMMARY, 1, 3).setValues([[
      `ERROR: ${error.message}`,
      '',
      CONFIG.STATUS.ERROR
    ]]);
  }
}

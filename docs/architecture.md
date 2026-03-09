# Architecture

The system is built using lightweight cloud tools that integrate easily with existing workflows.

## Components

### Google Sheet
Stores incoming email messages and AI outputs. Each row represents one email.

### Google Apps Script
Acts as the orchestration layer. It reads the email data, sends it to the AI model, and writes the results back to the sheet.

### Gemini AI API
Processes the email text and generates structured outputs including classification, urgency, intent, and reply draft.

## Processing Steps

1. Email data is entered into Google Sheets.
2. Apps Script reads the latest row.
3. The script builds a structured prompt.
4. The prompt is sent to the Gemini API.
5. The AI analyzes the email.
6. AI returns structured JSON.
7. The script validates the result.
8. The result is written back to the spreadsheet.

## Architecture Benefits

- Simple
- Transparent
- Easy to debug
- Suitable for workflow automation demonstrations

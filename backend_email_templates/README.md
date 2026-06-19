# Backend Email Templates

This folder contains the raw HTML/CSS templates that should be used by the backend service to send out system notification emails.

## Files

- `baseTemplate.html`: The beautiful, styled wrapper for all emails.

## How to Use

The `baseTemplate.html` uses placeholders like `{{variable_name}}` which you can replace using your preferred templating engine (e.g., Handlebars, EJS, or simple string replacement).

### Required Variables
1. `{{contest_name}}`: The name of the contest
2. `{{email_subject}}`: The subject of the email, usually provided by the admin.
3. `{{{email_body_html}}}`: This is the actual message content provided by the admin.

**Important Note for `email_body_html`:**
The Admin will provide the email body as plain text with line breaks (`\n`). Before injecting this into the template, please convert the plain text into valid HTML. 
For example, you can wrap each line in a `<p>` tag:
```javascript
const email_body_html = plainTextBody
  .split('\n')
  .map(line => line.trim() ? `<p style="color: #4b5563; line-height: 1.6; font-size: 16px; margin-bottom: 12px;">${line}</p>` : '')
  .join('');
```

This ensures the final email matches the exact design previewed by the Admin in the frontend panel.

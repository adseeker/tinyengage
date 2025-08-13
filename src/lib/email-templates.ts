import { Survey, SurveyOption } from '@/types'
import { generateSignedToken } from './crypto'

export function generateEmailHTML(
  survey: Survey,
  recipientId: string = 'REPLACE_WITH_SUBSCRIBER_EMAIL',
  baseUrl: string = 'http://localhost:3000'
): string {
  const buttons = survey.options.map(option => 
    generateResponseButton(survey.id, recipientId, option.id, option, baseUrl)
  ).join('\n          ')

  return `
<!-- 
  TinyEngagement Email Survey Template
  
  IMPORTANT: Before using this template:
  1. Replace 'REPLACE_WITH_SUBSCRIBER_EMAIL' with your email platform's merge tag
     - Mailchimp: *|EMAIL|*
     - ConvertKit: {{ subscriber.email_address }}
     - Klaviyo: {{ person.email }}
     - ActiveCampaign: %EMAIL%
  
  2. Make sure your base URL is correct (currently: ${baseUrl})
-->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${survey.title}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body {
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      margin: 4px;
      text-decoration: none;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 16px;
      font-weight: 500;
      text-align: center;
      border: 2px solid #e5e7eb;
      background-color: #ffffff;
      color: #374151;
      min-width: 44px;
      min-height: 44px;
      box-sizing: border-box;
    }
    .button:hover {
      background-color: #f9fafb;
    }
    .emoji {
      font-size: 20px;
      margin-right: 8px;
    }
    
    @media screen and (max-width: 600px) {
      .button {
        display: block !important;
        width: 100% !important;
        margin: 8px 0 !important;
      }
    }
  </style>
</head>
<body style="background-color: #f9fafb; font-family: system-ui, -apple-system, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="padding: 40px 20px; text-align: center;">
              <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">
                ${survey.title}
              </h1>
              ${survey.description ? `
              <p style="margin: 0 0 24px 0; font-size: 16px; color: #6b7280; line-height: 1.5;">
                ${survey.description}
              </p>
              ` : ''}
              <div style="text-align: center;">
                ${buttons}
              </div>
              <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af;">
                Click any option above to submit your response instantly.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 20px 0 0 0; font-size: 12px; color: #6b7280; text-align: center;">
          Powered by TinyEngagement
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim()
}

function generateResponseButton(
  surveyId: string,
  recipientId: string,
  optionId: string,
  option: SurveyOption,
  baseUrl: string
): string {
  const token = generateSignedToken(surveyId, recipientId, optionId)
  const responseUrl = `${baseUrl}/r?tok=${token}`

  const buttonStyle = option.color 
    ? `background-color: ${option.color}; border-color: ${option.color}; color: white;`
    : ''

  return `<a href="${responseUrl}" class="button" style="${buttonStyle}">
                  ${option.emoji ? `<span class="emoji">${option.emoji}</span>` : ''}${option.label}
                </a>`
}

export function generatePlainTextEmail(
  survey: Survey,
  recipientId: string,
  baseUrl: string = 'http://localhost:3000'
): string {
  const links = survey.options.map(option => {
    const token = generateSignedToken(survey.id, recipientId, option.id)
    const responseUrl = `${baseUrl}/r?tok=${token}`
    return `${option.emoji ? option.emoji + ' ' : ''}${option.label}: ${responseUrl}`
  }).join('\n')

  return `
${survey.title}

${survey.description ? survey.description + '\n' : ''}
Please click one of the following links to submit your response:

${links}

---
Powered by TinyEngagement
`.trim()
}

export interface EmailPreviewData {
  html: string
  plainText: string
  subject: string
}

export function generateEmailPreview(
  survey: Survey,
  recipientId: string = 'preview',
  baseUrl: string = 'http://localhost:3000'
): EmailPreviewData {
  return {
    html: generateEmailHTML(survey, recipientId, baseUrl),
    plainText: generatePlainTextEmail(survey, recipientId, baseUrl),
    subject: survey.title
  }
}
/**
 * Vercel serverless contact handler.
 * Sends email via Resend (RESEND_API_KEY) or FormSubmit fallback.
 */
const RECIPIENT = 'shalomcee002@gmail.com';
const FORMSUBMIT_URL = 'https://formsubmit.co/ajax/' + encodeURIComponent(RECIPIENT);

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function validate(body) {
  const errors = [];
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const phone = String(body.phone || '').trim();
  const subject = String(body.subject || '').trim();
  const message = String(body.message || '').trim();

  if (name.length < 3) errors.push('Name is too short.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Invalid email address.');
  if (!phone) errors.push('Phone number is required.');
  if (!subject) errors.push('Please select a subject.');
  if (message.length < 10) errors.push('Message is too short.');

  return {
    ok: errors.length === 0,
    errors,
    data: { name, email, phone, subject, message },
  };
}

function buildEmailText(data) {
  const timestamp = new Date().toISOString();
  return [
    '--- New Contact Form Submission ---',
    'Timestamp: ' + timestamp,
    '',
    'Name: ' + data.name,
    'Email: ' + data.email,
    'Phone: ' + data.phone,
    'Subject: ' + data.subject,
    '',
    'Message:',
    data.message,
    '-----------------------------------',
  ].join('\n');
}

async function sendViaResend(data) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  const from = process.env.RESEND_FROM || 'Portfolio <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [RECIPIENT],
      reply_to: data.email,
      subject: 'New Portfolio Message: ' + data.subject,
      text: buildEmailText(data),
    }),
  });

  const result = await response.json().catch(function () { return {}; });
  if (!response.ok) {
    throw new Error(result.message || 'Resend API error');
  }
  return true;
}

async function sendViaFormSubmit(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('email', data.email);
  formData.append('phone', data.phone);
  formData.append('subject', data.subject);
  formData.append('message', data.message);
  formData.append('_subject', 'Portfolio: ' + data.subject);
  formData.append('_captcha', 'false');

  const response = await fetch(FORMSUBMIT_URL, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  });

  const result = await response.json().catch(function () { return {}; });
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'FormSubmit error');
  }
  return true;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  if (body.website) {
    return sendJson(res, 200, { success: true, message: 'Message sent successfully!' });
  }

  const result = validate(body);
  if (!result.ok) {
    return sendJson(res, 400, { success: false, message: result.errors.join(' ') });
  }

  try {
    const usedResend = await sendViaResend(result.data);
    if (!usedResend) {
      await sendViaFormSubmit(result.data);
    }
    return sendJson(res, 200, { success: true, message: 'Message sent successfully!' });
  } catch (err) {
    return sendJson(res, 500, {
      success: false,
      message: 'Failed to send message. Please email ' + RECIPIENT + ' directly.',
    });
  }
};

/**
 * Template Engine
 * Replaces dynamic variables: {{ college_name }}, {{ contact_person }}, {{ department }}, {{ city }}, {{ sender_name }}
 * Applies intelligent fallbacks and calculates deterministic SHA-256 template hash.
 */

const crypto = require('crypto');

function getTemplateHash(subject, body) {
  return crypto.createHash('sha256').update((subject || '') + '::' + (body || '')).digest('hex').substring(0, 16);
}

function renderContent(templateStr, recipient = {}) {
  let output = templateStr || '';

  const fallbacks = {
    college_name: recipient.college_name || 'Your Institution',
    contact_person: recipient.contact_person || 'Sir/Madam',
    department: recipient.department || 'Office of Academic Affairs and Student Development',
    city: recipient.city || 'your campus',
    state: recipient.state || 'your region',
    sender_name: 'Shortfundly Outreach Team'
  };

  for (const [key, val] of Object.entries(fallbacks)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    output = output.replace(regex, val);
  }

  return output;
}

module.exports = {
  getTemplateHash,
  renderContent
};

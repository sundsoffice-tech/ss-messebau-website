# AI Chatbot Setup Guide

## Overview

This guide explains how to configure the AI chatbot functionality after deploying the new backend implementation.

## Prerequisites

- Admin access to the website
- OpenAI API key (get one from https://platform.openai.com/api-keys)

## Setup Methods

### Method 1: Admin Dashboard (Recommended)

1. **Login to Admin Panel**
   - Navigate to `https://your-domain.com` and login as admin
   - Click on "Admin" in the navigation menu

2. **Navigate to AI Settings**
   - Click on "KI-Verwaltung" (AI Management) tab
   - Click on "API-Schlüssel" (API Keys) sub-tab

3. **Add OpenAI API Key**
   - Click "Neuer Schlüssel" (New Key) button
   - Select "OpenAI (GPT)" from the provider dropdown
   - Paste your OpenAI API key (starts with `sk-`)
   - Click "Speichern" (Save)

4. **Verify Key is Active**
   - The key should appear in the list with status "Aktiv" (Active)
   - Only the last 4 characters of the key will be visible for security

5. **Test the Chatbot**
   - Navigate to the "Kontakt" page
   - Open the chat widget in the bottom-right corner
   - Send a test message to verify the chatbot responds

### Method 2: Environment Variable

For production deployments, you can use an environment variable instead of storing the key in the database:

1. **Set Environment Variable**
   ```bash
   export OPENAI_API_KEY="sk-your-key-here"
   ```

2. **Configure in Hosting Panel**
   - In Hostinger or your hosting provider
   - Navigate to "Environment Variables" or similar section
   - Add variable: `OPENAI_API_KEY` with your OpenAI key as the value

3. **Verify**
   - The chat API will automatically use the environment variable if no database key is found
   - Test the chatbot as described in Method 1, step 5

## Training the Chatbot (Optional)

You can add custom knowledge to the chatbot through the admin panel:

1. **Navigate to Training Data**
   - Go to Admin Panel → KI-Verwaltung → Trainingsdaten

2. **Add Training Entry**
   - Click "Neuer Eintrag" (New Entry)
   - Enter a title (e.g., "Pricing Information")
   - Select a category (FAQ, Products, Pricing, etc.)
   - Enter the content (detailed information about your services, pricing, processes, etc.)
   - Click "Speichern" (Save)

3. **Activate/Deactivate Entries**
   - Toggle entries on/off using the eye icon
   - Only active entries are included in the chatbot's knowledge base

## Troubleshooting

### Chatbot Returns Error Message

**Symptom:** Chat displays "Der KI-Berater ist momentan nicht erreichbar..."

**Solutions:**
1. Verify API key is active in admin panel
2. Check OpenAI API key is valid (not revoked, has credits)
3. Check browser console for error messages
4. Verify you're logged in (chat requires authentication)

### API Key Won't Save

**Symptom:** Error when adding API key in admin panel

**Solutions:**
1. Ensure database directory has write permissions: `chmod 755 public/api/data/`
2. Check database file exists and is writable: `chmod 644 public/api/data/database.sqlite`
3. Verify you're logged in as admin
4. Check browser console for error messages

### Chat Doesn't Respond

**Symptom:** Sending message shows no response or spinner keeps spinning

**Solutions:**
1. Check rate limiting - wait 30 seconds between messages
2. Verify authentication by refreshing the page and logging in again
3. Check OpenAI API status: https://status.openai.com/
4. Review audit logs in admin panel for error details

## Security Considerations

- **Never commit API keys to Git** - Always use environment variables or database storage
- **Revoke old keys** - Use the "Widerrufen" (Revoke) button if a key is compromised
- **Monitor usage** - Check OpenAI dashboard for unexpected API usage
- **Limit access** - Only admins can add/view/delete API keys
- **Session security** - Chat requires authentication to prevent abuse

## API Rate Limits

The chatbot has built-in rate limiting:
- Maximum 10 messages per 5 minutes per user
- Enforced on both frontend and backend
- Prevents abuse and controls costs

## Cost Monitoring

- OpenAI charges per token used
- Model: GPT-4o (specified in chat.php)
- Max tokens per response: 1000 (configurable in chat.php)
- Monitor costs in OpenAI dashboard: https://platform.openai.com/usage

## Support

If you encounter issues not covered in this guide:
1. Check the audit logs in Admin Panel → KI-Verwaltung → Audit-Log
2. Review browser console for JavaScript errors
3. Check server PHP error logs
4. Contact the development team with specific error messages


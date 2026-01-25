# Google Cloud Speech-to-Text Setup Guide

This guide walks you through setting up Google Cloud Speech-to-Text API for the Live Meeting Helper app.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "live-meeting-helper")
5. Click "Create"

## Step 2: Enable the Speech-to-Text API

1. In the Google Cloud Console, go to **APIs & Services > Library**
2. Search for "Cloud Speech-to-Text API"
3. Click on it and press **Enable**

## Step 3: Create a Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Enter a name (e.g., "speech-to-text-service")
4. Click **Create and Continue**
5. For the role, select **Cloud Speech Client** (or skip if you want minimal permissions)
6. Click **Done**

## Step 4: Download the Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key > Create new key**
5. Select **JSON** format
6. Click **Create** - the key file will download automatically
7. **Important**: Move this file to a secure location (e.g., `~/.gcp/credentials.json`)

## Step 5: Set Environment Variable

Add the path to your credentials file in your `.env.local` file:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/credentials.json
```

Or set it in your shell:

**Windows (PowerShell):**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\credentials.json"
```

**Windows (Command Prompt):**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\credentials.json
```

**Linux/macOS:**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/credentials.json"
```

## Step 6: Enable Billing (Required)

Google Cloud Speech-to-Text requires a billing account:

1. Go to **Billing** in the Cloud Console
2. Link a billing account to your project
3. Note: You get 60 minutes/month free for speech recognition

## Step 7: Verify Setup

Run this command to verify your setup:

```bash
python -c "from google.cloud import speech; client = speech.SpeechClient(); print('Setup successful!')"
```

## Pricing

- **Free tier**: 60 minutes/month of speech recognition
- **Standard**: $0.006 per 15 seconds after free tier
- See [pricing page](https://cloud.google.com/speech-to-text/pricing) for details

## Troubleshooting

### "Could not automatically determine credentials"
- Ensure `GOOGLE_APPLICATION_CREDENTIALS` environment variable is set
- Verify the path points to a valid JSON key file

### "Permission denied"
- Ensure the service account has the "Cloud Speech Client" role
- Or grant "Cloud Speech-to-Text API User" role

### "API not enabled"
- Go to APIs & Services > Library and enable "Cloud Speech-to-Text API"

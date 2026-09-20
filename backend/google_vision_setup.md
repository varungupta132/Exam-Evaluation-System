# Google Vision AI Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Vision API:
   - Go to "APIs & Services" > "Library"
   - Search for "Cloud Vision API"
   - Click "Enable"

## Step 2: Create Service Account

1. Go to "IAM & Admin" > "Service Accounts"
2. Click "Create Service Account"
3. Fill in the details:
   - Name: `exam-evaluator`
   - Description: `Service account for exam evaluation system`
4. Click "Create and Continue"

## Step 3: Grant Permissions

1. Add these roles to the service account:
   - `Cloud Vision AI Service Agent`
   - `Storage Object Viewer` (if using Cloud Storage)
2. Click "Continue" and then "Done"

## Step 4: Create and Download Key

1. Find your service account in the list
2. Click on it to open details
3. Go to "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Select "JSON" format
6. Download the key file
7. Rename it to `service-account-key.json`
8. Place it in the `backend/` directory

## Step 5: Set Environment Variable

The app will automatically use the key file if it's named `service-account-key.json` and placed in the backend directory.

## Step 6: Test the Setup

Run the backend server and check if Google Vision API is working:

```bash
cd backend
python app.py
```

Visit `http://localhost:5000/api/health` to check if all services are running.

## Pricing Information

- Google Vision API: $1.50 per 1,000 images for text detection
- First 1,000 images per month are free
- Perfect for development and testing

## Troubleshooting

### Error: "Could not automatically determine credentials"
- Make sure `service-account-key.json` is in the backend directory
- Check that the file is valid JSON

### Error: "Vision API not enabled"
- Go back to Google Cloud Console
- Enable the Cloud Vision API for your project

### Error: "Permission denied"
- Check that your service account has the correct roles
- Verify the project ID is correct
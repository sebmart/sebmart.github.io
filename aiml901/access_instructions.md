---
title: Access Instructions
---
# Getting Started with n8n

You should have received an email that looks like this:
![[email_screenshot.png]]
Create an n8n account and you will be able to access our workspace. 
# API Keys

Even though we are using n8n, we will be utilizing other services, such as OpenAI, Slack, Google Sheets, and Outlook Calendar. If we want to access an LLM like GPT-5 through n8n, we can't just use the ChatGPT interface online. Instead, we make a call to an API. An API (Application Programming Interface) is a way for different software systems to communicate with one another. 

For each service, we will make an API key. This is a form of authorization that lets a program prove that it's allowed to access the API. For example, if we want to call the OpenAI API to use an LLM, the API key tells OpenAI that the program calling it should have access.

## Getting Started with OpenAI

1. Go to https://openai.com/api/ and log in to the API platform.
2. In the top left, press the search button and search for API keys or navigate to https://platform.openai.com/settings/organization/api-keys
3.  Press `+ Create new secret key` and give it a name like "n8n connection"
	1. Save your key somewhere secure and copy it; we will need it for the next step.
4. Sign in to https://aiml901-martin.app.n8n.cloud/signin. Next to the `Create Workflow` button, press the small arrow and choose `Create Credential`
![[create_credential.png]]
5. Choose `OpenAI` and then hit `Continue`
6. For the API Key, put in the key from step 3.
7. Hit `Save`. You should get a green box that says that the connection was tested successfully.

When you use an OpenAI node, you can now use this credential to access OpenAI models!

## Getting Started with Google Products

We will show you how to get set up with Google Calendar, but the same idea holds for Google Calendar, Gmail, and other Google products. **We recommend that you set this up for Google Calendar, Gmail, and Google Sheets.**

1. In n8n, next to the `Create Workflow` button, press the small arrow and choose `Create Credential`.
2. Choose `Google Calendar OAuth2 API` and then hit `Continue`
3. This will take you to a screen where you can sign in with your Google account. Do this and you're all set!

## Getting Started with Telegram

Another easy option is Telegram, which has a great interface for connecting chatbots. 

1. In Telegram, open a new chat with BotFather and type `/newbot`. It will then prompt you to name your bot. Follow the prompts until your bot is created.
2. When successfully created, a message will appear that says `Use this token to access the HTTP API`. Copy the string of letters and numbers.
3. In n8n, click `Create Credential` and choose Telegram. Paste the token from Telegram into the Access Token field and then click `Save`.
4. In Telegram, the message begins with `Done! Congratulations on your new bot. You will find it at`, followed by a URL. Click on this link and hit `Start` to begin a chat with your bot.

> [!info] Telegram Privacy
> When you make a Telegram bot, this is technically accessible by anyone who knows the bot's username. This means that other people could potentially message your bot. When we are linking an n8n workflow to Telegram, we should ensure that we only move forward if the message is from a whitelisted user (or, more restrictively, just yourself). [Here is a great video](https://www.youtube.com/watch?v=QZ93nQGwnPg) showing both how to set up Telegram with n8n and also how to make sure that it only accepts messages from valid users. We will also do this step in Recitation 1.
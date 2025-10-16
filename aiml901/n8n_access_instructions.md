---
title: n8n Access Instructions
author: Alex Jensen
---
# Overview

Even though we are using n8n, we will be utilizing other services, such as OpenAI, Slack, Google Sheets, and Outlook Calendar. If we want to access an LLM like GPT-5 through n8n, we can't just use the ChatGPT interface online. Instead, we make a call to an API. An API (Application Programming Interface) is a way for different software systems to communicate with one another. 

For each service, we will make an API key. This is a form of authorization that lets a program prove that it's allowed to access the API. For example, if we want to call the OpenAI API to use an LLM, the API key tells OpenAI that the program calling it should have access.

This document is organized into two main sections: 
- **Before the Class** gives information on setting up accounts _before the class starts_ so that you are ready when we begin.
- **Connecting During the Class** explains how to connect these products _within n8n_. This will be done during the lectures and recitations but you are free to get this set up earlier.

---

# Before the Class
## Getting Started with n8n

You should have received an email that looks like this:
![[email_screenshot.png]]
Create an n8n account using this email and you will be able to access our workspace. 

---
## Google Products

For the class, you can either use a personal Google account or create a new one specifically for this class. If you already have an account that you are willing to use, there is no action item here. Note that n8n will have access to your files in this account.

---
### OpenAI

In the recitations, all examples will use OpenAI's GPT-5, since this is a state-of-the-art model. However, to use this via the API, you need to complete an identity verification that requires submitting personal information; the steps to do this are shown below. **We strongly recommend that you do this.** GPT-5 is (currently) one of the best models available. However, n8n also works with other LLMs, so you are able to use alternative models. If you are not comfortable completing this step, please reach out to us.

1. Log into https://platform.openai.com or make an account to get started. Even if you've used ChatGPT before, this interface might look slightly different.
2. In the top right corner, click on `Settings` (a gear icon) and then navigate to `Billing`. 
3. Add a payment method and then add $5-10 to your credit balance. This will allow you to make calls to OpenAI from n8n and should be enough for the whole course.
4. In the top left, press the search button and search for API keys or navigate to https://platform.openai.com/settings/organization/api-keys
5.  Press `+ Create new secret key` and give it a name like "n8n connection".
6. **Save your key somewhere secure and copy it**; you will not be able to access this key again beyond this screen and you will need to input it into n8n later. If you lose it, you can always make another API key.

**Verification:**
1. Log into https://platform.openai.com. Click on `Settings` and then navigate to `General`.
2. You should see within the settings an option called `Verification`. Click the `Verify Organization` button and follow the steps to complete the process.

---
# Connecting During the Class

### OpenAI

1. Sign in to https://aiml901-martin.app.n8n.cloud/signin. Next to the `Create Workflow` button, press the small arrow and choose `Create Credential`.
![[create_credential.png]]
2. Choose `OpenAI` and then hit `Continue`
3. For the API Key, put in the key from step 3.
4. Hit `Save`. You should get a green box that says that the connection was tested successfully.

When you use an OpenAI node, you can now use this credential to access OpenAI models!

---
### Google Product API Keys

We will show you how to get set up with Google Calendar, but the same idea holds for Google Calendar, Gmail, and other Google products. **We recommend that you set this up for Google Calendar, Gmail, and Google Sheets.**

1. In n8n, next to the `Create Workflow` button, press the small arrow and choose `Create Credential`.
2. Choose `Google Calendar OAuth2 API` and then hit `Continue`
3. This will take you to a screen where you can sign in with your Google account. Do this and you're all set!

---
### Getting Connected to Telegram

We will use Telegram to message n8n since it has a great interface for connecting chatbots. 

Download the Telegram app on your phone to get started.

1. In Telegram, open a new chat with BotFather and type `/newbot`. It will then prompt you to name your bot. Follow the prompts until your bot is created.
2. When successfully created, a message will appear that says `Use this token to access the HTTP API`. Copy the string of letters and numbers.
3. In n8n, click `Create Credential` and choose Telegram. Paste the token from Telegram into the Access Token field and then click `Save`.
4. In Telegram, the message begins with `Done! Congratulations on your new bot. You will find it at`, followed by a URL. Click on this link and hit `Start` to begin a chat with your bot.

> [!info] Telegram Privacy
> When you make a Telegram bot, this is technically accessible by anyone who knows the bot's username. This means that other people could potentially message your bot. When we are linking an n8n workflow to Telegram, we should ensure that we only move forward if the message is from a whitelisted user (or, more restrictively, just yourself). [Here is a great video](https://www.youtube.com/watch?v=QZ93nQGwnPg) showing both how to set up Telegram with n8n and also how to make sure that it only accepts messages from valid users. We will do a similar but slightly easier step in Recitation 1.
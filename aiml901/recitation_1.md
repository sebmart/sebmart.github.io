---
title: Recitation 1
---
## You’ll Need…

1. OpenAI connection
2. Google account for the class; we will use Google Calendar.
3. Telegram account

You can get connected [here](access_instructions).

---
In this recitation, we will build two projects using [n8n](https://aiml901-martin.app.n8n.cloud/):

1. A **customizable chatbot** powered by ChatGPT.
2. A **Google Calendar assistant** that can add, update, and delete events by sending a text message through Telegram

---
## Learning Objectives

- Learn the basics of **nodes** and **connections** in n8n.
- See the power of **system prompting** (controlling the “voice” of an AI).
- Understand the difference between a simple **LLM chain** and a full **AI Agent** with tools.
- See an example of how we can create value using AI.

---
# Part 1: Nodes and Triggers

Let's get logged in to [n8n](https://aiml901-martin.app.n8n.cloud/home/workflows). Once you do so, watch this brief video that introduces some basic terminology and shows you the n8n interface:
![[n8n terminology 3.mov|n8n terminology]]
In n8n, we will be making workflows.
- A **workflow** is a series of connected tasks that can automate a process. 
	- Workflows consist of **triggers, nodes, and connections**
- **Triggers** (or trigger nodes) tell us when the workflow should start. This can occur when we hit execute workflow, send a message, receive an email, or more.
- **Nodes** each perform a specific task, such as manipulating data, sending an email, or reading a calendar.
- **Connections** tell n8n in what order we want these operations to occur and how our information should flow through the workflow. Think of it like a process flow chart, with our unit of flow being our information.

---
# Part 2: Customizable Chatbot
 
Now, we will show you an introductory workflow and build a chatbot.

---
### Step 1. Trigger: Listening for Chat Message

- Every workflow in n8n starts with a type of trigger that initiates the workflow. We will start our workflow when certain types of Slack messages are sent.
- **Add node:** `On chat message`
- **What it does:** Listens for chat messages within n8n. You should see a chat box at the bottom of your screen. If you do not, there should be a little arrow at the bottom right to expand a bottom menu.
- **Why this matters:** Without a trigger, nothing starts. This lets us send messages to what will be our chatbot, which begins the workflow. This example gives us a simple interface for testing before connecting to external apps.

Try sending a chat message and see how it executes. Clicking into the node, you will see a sessionId, the action "sendMessage," and your message (called chatInput).

---
### Step 2. Processing: ChatGPT Response

Next, we want to send our message to an LLM.

- **Add node:** `Basic LLM Chain` (Chat GPT Response)
	- **Prompt (User Message):** 
```JSON
{{ $json.chatInput }}
```
 - **Add node:** under the Basic LLM Chain, click the `+` for the model and choose `OpenAI Chat Model`
	- This tells us what model we are going to call, the "brains" of our LLM. For now, let's just use `gpt-5`.
	- Set the credential to connect with to be your OpenAI account.
	
 Connect our chat trigger to the Basic LLM Chain and send a message. This returns something that is pretty clearly just ChatGPT. However, we have much more control in n8n!
 
---
### Step 3.  Customizing the Response
 
 We will add a **system prompt** that allows us to personalize our GPT. A system prompt is a set of instructions that is also sent to the LLM every time that we send a message.

Click into the Basic LLM Chain node. Under `Chat Messages (if Using a Chat Model)`, click `Add prompt` and for `Type Name or ID`, choose `System`. Then, copy in this prompt:
``` text
You are a cowboy philosopher who teaches using the Socratic method. Always respond in a folksy, cowboy-like manner, with colloquial Western language, metaphors, and imagery (horses, trails, saloons, dusty roads, ranch life, etc.). Your role is not to give direct answers, but to ask probing, thoughtful questions that guide the other person toward realizin’ the truth for themselves. Stay curious, never condescending. Keep the tone friendly, rustic, and wise, as if you’re sittin’ ‘round a campfire under the stars.
	
	- Always answer with questions, not direct solutions.
    - Use cowboy idioms and imagery while still keeping your questions sharp and logical.
    - Encourage reflection by drawin’ parallels to life on the frontier.
    - Avoid modern slang or technical jargon—stick to cowboy-style plain speech.
    
    Example style:
    
    Instead of saying "Yes, that’s correct", say "Well partner, what makes ya reckon that’s the right trail to ride down?"
    
    Instead of saying "The answer is X", say "Suppose ya took the north trail instead of the south—what do ya figure might happen then?"
```

Send a chat message asking for the difference between correlation and causation.

---
## Part 2 Exercises:

1. **Tone:** Change the system prompt so the bot acts like a pirate. What types of words should it use?
2. **Wording:** Try to make the bot limit its answer to 3 words. What happens if you push it and ask multiple questions?
3. **Formatting:** Ask the bot to answer in bullet points. Does it handle this well?
4. **Limitations:** What happens if you ask the bot something that it doesn't know, like your middle name?

---
# Part 3: Google Calendar Agent

Now we build something more advanced: a **Calendar assistant**. This shows how to go beyond a single LLM response, giving the AI the ability to actually take actions.

We are using Google Calendar because it is easy to implement, but what we are doing here can be extended to other calendars. Microsoft Outlook's calendar also works but has slightly fewer options, so we need to dive a bit deeper in order to have as much functionality as we would like.

Start a new workspace and let’s get started!

---
### Step 1. Trigger: Telegram

- **Add node:** `On App Event → Telegram → On message`
	- Connect with your Telegram credential
	- Click `Additional Fields → Restrict to User IDs` and put your Telegram user ID. You can find this by messaging `/start` to userinfobot on Telegram or going to `https://api.telegram.org/bot<yourtoken>/getUpdates`, replacing `<yourtoken>` with the bot token. This prevents other Telegram users from accessing your n8n workflow through your chatbot.
- **What it does:** This lets you receive messages from Telegram, which will ultimately make adding events to your calendar much quicker.

--- 
### Step 2. Core Brain: AI Agent

- **Add node:** `AI Agent`
	- **Prompt (User Message**):
	```JSON
	{{ $json.chatInput }}
	```
- **What it does:** This is different from the “LLM Chain.” The Agent can **plan** and **choose tools.**
- We will add a system message to clarify its instructions in the exercises.

---
### Step 3. Connection to OpenAI

- **Add node:** under the AI Agent, click the `+` for the chat model and choose `OpenAI Chat Model`. For the model, select `gpt-5`.

---
### Step 4. Give the Agent a Memory

- **Add node:** `Simple Memory`
	- **Session ID:** Define below
	- **Session Key from Previous Node:** 
```JSON
{{ $('Telegram Trigger').item.json.message.chat.id }}
```
- Connect it to the AI Agent.
- **What it does:** Stores recent conversation history.
- **Why this matters:** Without memory, the agent forgets everything after each turn. With memory, it can follow up (“delete that soccer event I just made”).

---
### Step 5. First Tool: Create Event

- **Add node:** Click the `+` for Tool under the AI Agent node and choose `Google Calendar → Create Event`
- Choose to connect with your Google Calendar credential and decide calendar you want to add to.
- Press the stars next to the `Start` and `End` options to let our agent decide when the event starts and ends.
- In the additional fields, add the `Summary` option and also let the agent decide this. The `Summary`is the title of the event in your calendar.
- **Why this matters:** This is the _first power_ we give the agent—the ability to create new events.

---
### Step 6. Responding in Telegram

- **Add node:** `Telegram → Send a text message`
	- Chat ID: your Telegram user ID
	- Text:
		```JSON
		{{ $json.output }}
	  ```

We can make the workflow active by toggling the button in the top toolbar from Inactive to Active. This means that the workflow will actively "listen" for events; in our case, this means that it will respond each time that we send a message.

---
## Part 3 Exercises:

These exercises help walk through how we should prompt our agent and then also let us add other tools that we might want to use.

1. Explain in words what happens when you send a message to the agent. What does it do?
2. Ask your agent to add an event tomorrow at 2 PM. What happens?
3. Check what happens when you schedule an event for “tonight” or “tomorrow morning”. What time ranges are used for these events?
4. We should give a default amount of time for our event. Add this to your system prompt and try Exercise 3.1 again.
5. Now, add the following to the system prompt for the `AI Agent` and try Exercise 3.1 again:
   ```text
       Current time: {{ $now }}
    ```
6. While our agent “knows” what tools are available to it (which we will discuss later), it is helpful in the system prompt to provide a description of the tools available. Update the system prompt to describe the `Create Event` tool.
7. Currently, our agent only lets us add events, but we can’t delete or update this event. In order to do so, we need to get the ID of the event. Add another Google Calendar tool and choose the operation `Get Many`.
    1. We can set a limit on how many events we retrieve, if your calendar is particularly full. We can also set a time frame in which to search; this can be automatically determined by our agent, as well.
    2. Update the system prompt to describe this new tool.
8. Now, on your own, add `Update Event` and `Delete Event` tools and update the system prompt to describe them. Note that you can choose what to update, such as the timing, the name of the event, and many other options.
    1. Add a **clarifying question rule**: if the agent isn’t sure which event to delete, it should ask you first.

### Challenges:

1. It's nice to be able to send a voice message in Telegram and for it to process this. Think about what steps you would need to add so that n8n can process both text and voice messages.
2. Try to give your agent a multi-step command. For example, “delete the Marketing meeting today and then create a new one at 4 PM for one hour.”
    1. What steps are needed? Does it complete these steps?
    2. If not, add instructions as necessary to make this more consistent. What works? What does not?
3. When we try to implement new tools, things don't always work perfectly. For example, Google Calendar's API handles calls to create events with and without attendees slightly differently. 
	1. In the `Create Event` node, under `Additional Fields`, click `Add Field` and then `Attendees` and let the model automatically define it. Now, create an event without any attendees. What happens? How can we deal with this?
	2. We also want to be able to update events to have attendees. How would we do this?

---
## For the Final:

The following topics may appear on the final exam:

- System prompting
    - Changing the tone of an LLM
    - Providing instructions on using tools efficiently
- Use of the `Basic LLM Chain` and `AI Agent` nodes, along with tools
- n8n triggers 
	- `Trigger manually`
	- `On chat message`
	- `Telegram → On message`
- Use of the Google Calendar tools
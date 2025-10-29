---
title: Recitation 1
author:
  - Alex Jensen
---
## You’ll Need…

1. OpenAI connection
2. Google account for the class; we will use Google Calendar.
3. Telegram account

You can get connected [here](access_instructions).

---
In this recitation, we will use [n8n](https://aiml901-martin.app.n8n.cloud/) to build a **Google Calendar assistant** that can add, update, and delete events by sending a text message through Telegram

You can watch a video recording of the recitation here:
![Recitation 1 Recording](https://youtu.be/zn9OrCbJEdY)

---
## Learning Objectives

- Learn the basics of **nodes** and **connections** in n8n.
- See the power of **system prompting** (controlling the “voice” of an AI).
- Understand how to use an **AI Agent** with tools.
- See an example of how we can create value using AI.

---
# n8n Terminology

Let's get logged in to [n8n](https://aiml901-martin.app.n8n.cloud/home/workflows). Once you do so, watch this brief video that introduces some basic terminology and shows you the n8n interface:
![n8n YouTube video](https://youtu.be/LktPqqbnbRM)

In n8n, we will be making workflows.
- A **workflow** is a series of connected tasks that can automate a process. 
	- Workflows consist of **triggers, nodes, and connections**
- **Triggers** (or trigger nodes) tell us when the workflow should start. This can occur when we hit execute workflow, send a message, receive an email, or more.
- **Nodes** each perform a specific task, such as manipulating data, sending an email, or reading a calendar.
- **Connections** tell n8n in what order we want these operations to occur and how our information should flow through the workflow. Think of it like a process flow chart, with our unit of flow being our information.
- **Credentials** let us connect n8n to other services, such as OpenAI and Google products

---
# Part 1: Core Content (Google Calendar Agent)
 
Now we build a **Calendar assistant**. This shows how to go beyond a single LLM response, giving the AI the ability to actually take actions.

We are using Google Calendar because it is easy to implement, but what we are doing here can be extended to other calendars. Microsoft Outlook's calendar also works but has slightly fewer options, so we need to dive a bit deeper in order to have as much functionality as we would like.

Start a new workspace and let’s get started!

---
### Step 1. Trigger: Listening for Chat Message

- Every workflow in n8n starts with a type of trigger that initiates the workflow. We will start our workflow when certain types of Slack messages are sent.
- **Add node:** `On chat message`
- **What it does:** Listens for chat messages within n8n. You should see a chat box at the bottom of your screen. If you do not, there should be a little arrow at the bottom right to expand a bottom menu.
- **Why this matters:** Without a trigger, nothing starts. This lets us send messages to what will be our chatbot, which begins the workflow. This example gives us a simple interface for testing before connecting to external apps.

Try sending a chat message and see how it executes. Clicking into the node, you will see a sessionId, the action "sendMessage," and your message (called chatInput).

---
### Step 2. Core Brain: AI Agent

- **Add node:** `AI Agent`
	- **Source for Prompt (User Message):** Connected Chat Trigger Node
- **What it does:** The agent can **plan** and **choose tools.** It receives as an input the message that we sent in the chat.
- We will add a system message to clarify its instructions in the exercises, which allows us to customize it farther.

---
### Step 3. Connection to OpenAI

- **Add node:** under the AI Agent, click the `+` for the chat model and choose `OpenAI Chat Model`. For the model, select `gpt-5`.
- If you want to make it run slightly faster, click `Add Option → Reasoning Effort` and choose low. This makes the model spend less time thinking through its response. If you use a different model, Reasoning Effort might not appear as an option.

---
### Step 4. Give the Agent a Memory

Currently, if we were to send a message to the chat, it would be able to respond, but unlike regular ChatGPT, this model has no memory of the previous messages it has received. You can actually test this yourself: send a chat message asking what the previous message said.

We will add a way for the agent to view past messages. With memory, it can follow up on previous things that you said (“delete that soccer event I just made”).

- **Add node:** under the AI Agent, click the `+` for the memory and choose`Simple Memory`
	- **Session ID:** Connected Chat Trigger Node
	- **Context Window Length:** The number of messages that the AI agent should "remember." I usually choose 20 messages, since this is enough for the AI agent to remember what previously happened in the conversation, but fewer messages is more efficient.

---
### Step 5. System Prompt

Now, we customize the directions for our agent. Currently, it is acting just like GPT5; the way that it responds might seem familiar! However, we can change this. 

A **system message** is a set of directions for our LLM to follow. If you have made a custom GPT before, this is exactly what you supplied to customize it.

- Click into the `AI Agent` node. Then, click `Add Option → System Message`.
- As an example, add this prompt:
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

Now, send a chat message asking for the difference between correlation and causation. See how it responds.

---
### Exercises:

1. **Tone:** Change the system prompt so the bot acts like a pirate. What types of words should it use?
2. **Wording:** Try to make the bot limit its answer to 3 words. What happens if you push it and ask multiple questions?
3. **Formatting:** Ask the bot to answer in bullet points. Does it handle this well?
4. **Limitations:** What happens if you ask the bot something that it doesn't know, like your middle name?

---
### Step 6. System Prompting for Google Calendar Agent

Now, we have seen that we are able to change the agent's behavior. _This is extremely powerful_— with a well-thought-out system prompt, you can change GPT5's default behavior into something like interview practice, a storyteller, or more.

In our case, we want it to behave as a calendar agent that can update our schedule. There are some tricks to this that are covered in the exercises below. For now, begin to think about what you want the agent's behavior to be like. If you say, "create an event tonight," should it clarify the specific timing or perhaps assume that the event is from 6–9 p.m.? If you don't specify the day, should it assume that you mean today?

For now, make the system prompt something like "You are a calendar agent." Feel free to add more instructions; we just cannot leave that box empty, as it otherwise causes an error. 

---
### Step 7. First Tool: Create Event

Now, our agent has a model chosen (in our case, GPT5), memory, and a short system prompt. We now need it to connect to our calendar.

- **Add node:** Click the `+` for Tool under the AI Agent node and choose `Google Calendar`
- Create a credential for your Google Calendar.
- `Tool Description` gives the agent more information on how to use this tool. In our case, we can leave it as `Set Automatically`, but we could also choose to describe it in-depth if we want the tool to be used for a specific case.
- `Resource`: We will choose `Event`. However, we can also use the tool to manipulate full calendars, but we are focused on individual events.
- `Operation`: Choose `Create`, since we want to make events.
- Press the stars next to the `Start` and `End` options to let our agent decide when the event starts and ends.
- In the additional fields, add the `Summary` option and also let the agent decide this. The `Summary`is the title of the event in your calendar.
- **Why this matters:** This is the _first power_ we give the agent—the ability to create new events.

Now, send a chat message adding an event to your calendar. Check that the event was actually created.

> [!info] Event Timing
> The event may have been created, but it's possible that it was put in your calendar at the wrong time or on the wrong day. This is because LLMs do not have a good sense of what the current time is. However, there's an easy way to counteract this: return to the system prompt for the AI agent. Make sure that you choose `Expression` instead of `Fixed` in the top right of the system message and then add the following text, which tells the LLM what the current time is and anchors it:
```text
       Current time: {{ $now }}
```

---
### Exercises:

These exercises help walk through how we should prompt our agent and then also let us add other tools that we might want to use.

1. Ask your agent to add an event tomorrow at 2 PM. What happens? Does it execute correctly?
2. Check what happens when you schedule an event for “tonight” or “tomorrow morning”. What time ranges are used for these events?
3. We should give a default amount of time for our event. Add this to your system prompt and try Exercise 1 again.

---
### Step 8. Delete Events Tool

Now, we want to be able to remove events from our calendar.

- **Add node:** Click the `+` for Tool under the AI Agent node and choose `Google Calendar`
- `Operation`: choose `Delete`
- Choose which calendar you wish to delete events from
- `Event ID`: press the stars to let the agent decide this value.

Google Calendar events are stored by an `Event ID`. However, our agent currently has no way of knowing by default what the ID of an event is. To see this, try to delete an event that you just made. This is why we introduce the `Get Many Events` tool.

---
### Step 9. Get Many Events Tool

This tool has multiple uses. Firstly, it allows us to retrieve events from our calendar, which is useful if we want to know our schedule for a given day. Additionally, when events are retrieved, our agent is able to gain valuable information about them, including timing, attendees, and crucially, the event ID.

 **Add node:** Click the `+` for Tool under the AI Agent node and choose `Google Calendar`
- `Operation`: choose `Get Many`
- Choose which calendar you want to use
- `Return All` will return all events that match the specification. I leave this off for now and leave the limit at 50. Imagine that you ask about your schedule for the next month; this could be a lot of events! 
- `Before` and `After` let the agent search for events that occur in a specific time period. To do so, press the stars to let the agent automatically choose these.
- We might want to let the agent come up with its own ways to search for events (for example, by title, attendees, etc.). To do so, click `Add option → Query` and then press the stars to let the agent choose this value.

Now, try to delete an event. It should work!

---
### Exercises:

1. Now, try to add an `Update Event` tool. What information do you want it to be able to update in events?
2. While our agent “knows” what tools are available to it (which we will discuss later), it is helpful in the system prompt to provide a description of the tools that it has available. Update the system prompt to describe the tools. This can help make it more accurate, especially for more complicated questions.
3. Add a **clarifying question rule**: if the agent isn’t sure which event to delete or update, it should ask you first. For example, if I have two events called "Pottery" and want to delete one, we probably want it to know which one it is.

### Challenges:

1. Try to give your agent a multi-step command. For example, “delete the Marketing meeting today and then create a new one at 4 PM for one hour.”
    1. What steps are needed? Does it complete these steps?
    2. If not, add instructions as necessary to make this more consistent. What works? What does not?
2. When we try to implement new tools, things don't always work perfectly. For example, Google Calendar's API handles calls to create events with and without attendees slightly differently. 
	1. In the `Create Event` node, under `Additional Fields`, click `Add Field` and then `Attendees` and let the model automatically define it. Now, create an event without any attendees. You will see that it fails; it expects there to be attendees. Create two separate `Create Event` tools, one that includes attendees and one which does not, and provide a description for the AI agent, as well as when it should use each node.
	2. Now, try to do the same thing for the `Update Event` tool.

---
## For the Final:

The following topics may appear on the final exam:

- System prompting
    - Changing the tone of an LLM
    - Providing instructions on using tools efficiently
- Use of the `AI Agent` node
- `On chat message` trigger
- Use of the Google Calendar tool `Add Event` tool.

---
# Part 2: Exploratory Content (Connecting to Telegram)

Any content in this section will not be covered on the final exam. However, it is designed to show interesting ways we can expand what we do in n8n and hopefully encourage you to explore further on your own!

For now, we will show how to connect to Telegram, a mobile messaging app. You can also connect services like Slack and WhatsApp, but Telegram is easier to get set up. We will use this to replace our `Chat Trigger` node.

To begin, follow the directions under the `Telegram` section [here.](https://sebastienmartin.info/aiml901/n8n_access_instructions.html)

---
### Step 1. Trigger: Telegram

- **Add node:** `On App Event → Telegram → On message`
	- Connect with your Telegram credential
	- By default, Telegram bots are public. We don't want everyone to be able to access our workflow (and by extent, our calendar). Click `Additional Fields → Restrict to User IDs` and put your Telegram user ID. You can find this by messaging `/start` to @userinfobot on Telegram and copying the user ID from there. This prevents other Telegram users from accessing your n8n workflow through your chatbot.
- **What it does:** This lets you receive messages from Telegram, which will ultimately make adding events to your calendar much quicker.

Test this by clicking `Execute Workflow` and then sending a message in Telegram to your bot. You should see it appear in n8n.

---
### Step 2. Modifying the AI Agent Node and Memory

The format of the message from the Telegram trigger and the chat trigger are slightly different, so we need to modify several things. First, connect the `+` from the Telegram trigger to the left side of the AI Agent node, where the chat trigger is also connected.

- Click into the `AI Agent` node.
- `Source for Prompt (User Message)`: Define below
- `Prompt (User Message)`:  Put in 
```JSON
{{ $json.message.text }}
```
This is just the text from our Telegram message. If you successfully received a message from Telegram, you can also see this text in the inputs on the left side of the screen; you can drag and drop this text into the box (see the video for a demonstration of this).

We also need to modify the memory, since it was previously formatted for the chat trigger:

- Click into the `Simple Memory` node.
- `Session ID`: Define below
- `Key`: Each message that we send gets stored in the memory with an associated key. When we provide a key here, the AI agent then will read the last (in our case) 20 messages with that key. For now, this does not affect us, but if we have multiple workflows that are using simple memory, giving them the same key would mean that those messages would be "stored in the same place," which could mean that the AI agent then is reading messages from the wrong workflow. The easiest way to deal with this is to just give each workflow a unique key, which is just a string of letters, numbers, and characters. 
	- Personally, I just like to use my Telegram user ID. However, if I had many workflows using Telegram and using this same user ID, this would cause problems like I mentioned above. To do this, copy and paste the following: 
```JSON
{{ $('Telegram Trigger').item.json.message.from.id }}
```


---
### Step 3. Responding in Telegram

- **Add node:** `Telegram → Send a text message`
	- Chat ID: your Telegram user ID
	- Text:
		```JSON
		{{ $json.output }}
	  ```

- Next, take the `+` on the right side of the AI Agent node and attach it to the left side of this Telegram node. Congratulations, it is now able to take the output of the agent and send it back to you in Telegram!

---
### Exercises:

 1. It's nice to be able to send a voice message in Telegram and for it to process this. Think about what steps you would need to add so that n8n can process both text and voice messages. Explore in n8n to see if you can get this up and running!
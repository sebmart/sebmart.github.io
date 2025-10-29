---
title: Recitation 2
author: Alex Jensen
---

> [!info] Note
> This recitation has more core content than recitations 3, 4, and 5. We really focus on a deep understanding on n8n, finding nodes that you need, and troubleshooting errors. As a result, this may take slightly longer to process, but will be extremely helpful going forward. Plus, the following recitations will be slightly lighter.

An important use case for agents is in responding to large quantities of emails. This is particularly important in a setting such as customer service, where you might want to respond to some types of emails automatically but route others to human representatives for more complex, sensitive, or urgent topics.

In Lecture 1, you saw a small example of this with class emails with questions about a variety of topics. We expand on this today to make it slightly more robust and also introduce many different types of n8n nodes and functionalities.

While a professor might want to be more accessible than this, we can imagine many scenarios where the head of a team does not need to receive all requests unless absolutely necessary. We simply use this scenario since it is one we know best!

---
## You'll Need...

1. Google Sheets connection
2. Gmail connection
3. OpenAI connection

---
## Learning Objectives

- A deeper understanding of n8n and node input and output with JSON expressions.
- Learn about branching and build routing with `If`, `Wait`, and Gmail/Google Sheets nodes.

---
# Part 1: Core Content 

## JSON

As we begin to dig deeper, we need to understand how n8n passes information from node to node. 
### What is JSON?

JSON (JavaScript Object Notation) is a simple way to structure data so that both humans and computers can read it. Think of it like a digital filing cabinet where you store information as **key–value pairs**. The _key_ is the label (like “Name”), and the _value_ is the content (like “Albert Einstein”).
### The Basics

1. **Objects** (curly braces `{ }`): hold sets of key–value pairs.  
Example:
```JSON
{
  "name": "Albert Einstein",
  "age": 76
}
```
In this case, the keys are `name` and `age`, while `"Albert Einstein"` and `76` are the values. Note that we need to include quotation marks for values that are not just numbers.

2. **Arrays** (square brackets `[ ]`): hold lists of items.  
Example:
```JSON
{
  "students": ["Maya", "John", "Priya"]
}
```
2. **Referencing values**: You get values by following the keys.
- In the first example, `name` → `"Albert Einstein"`.
- In the second example, we can refer to the second element of the array "students" (which is "John") with the expression `students[1]`. For the third element, we would choose `students[2]`. This may seem counterintuitive, but arrays are numbered starting from 0.
### Putting It Together

If you wanted to describe a course with students, it might look like:
```JSON
{
  "course": "AgentOps",
  "instructor": "Prof. Martin",
  "students": [
    {"name": "Maya", "year": "MBA1"},
    {"name": "John", "year": "MBA2"}
  ]
}
```
Here:
- `course` is a string (formal way of saying a set of letters/words),
- `students` is an array of objects,
- each student object has its own keys (`name`, `year`).

### Referring to Values in n8n

In n8n, we can write expressions that let us refer to the values in a JSON structure. You've actually already seen this before; in Recitation 1, we saw the prompt for the AI Agent node `{{ $json.chatInput }}`. This is how we let n8n reference whatever value is stored under the key `chatInput`.

Let's think about the previous example. 
- If we wrote `{{ $json.course }}`, this would give us the value `"AgentOps"`.
- If we wrote `{{ $json.students }}`, we would get 
```JSON
[
    {"name": "Maya", "year": "MBA1"},
    {"name": "John", "year": "MBA2"}
]
```
- To get the first student, we would write `{{ $json.students[0] }}`.
- To get the first student's name, we would write `{{ $json.students[0].name }}`

In other words, to reference values that are within other objects (like how `name` is within the array `students`), we just need to use periods and string together the names of the keys. 

> [!info] Disclaimer
> There is slightly more nuance to this that we will discuss in the next section. Specifically, this structure works if we are referring to a JSON object that comes from a node directly before the node where we want to reference the object. We will show you an example very shortly on how to generalize this even more.
## Inputs and Outputs

Each node in n8n is part of a data pipeline.
- **Input:** What the node receives, which is usually a JSON object from the previous node(s).
- **Output:** What the node returns, which is usually one or more JSON objects that can be used by the following nodes.

We can visualize this as
```text
Input (JSON items) → Process (defined by node logic) → Output (JSON items)
```

In the case of triggers (nodes that start workflows), the input may or may not be JSON. For example, add a `Chat Trigger` node and then send a message in the chat. Click into the trigger and you will see under Output something that looks like
```JSON
[
	{
		"sessionId": "5ac9fc059d414fe0b1942e98c232c98c",
		"action": "sendMessage",
		"chatInput": "Hello"
	}
]
```
In this case, our input came from our message, which was then processed into JSON and assigned a `sessionId` and `action`. 

Now, add an `AI Agent` node and give it a model (if you are unsure how to do this, make sure to refer to [Recitation 1](https://sebastienmartin.info/aiml901/recitation_1.html)). If you click into that node and don't change any settings, you will see an interface that looks like this:
![[input_output_interface.png]]

We can see the input coming from the chat trigger node. Looking at the `Prompt (User Message)` value, we see the expression `{{ $json.chatInput }}`. This is how we refer to 

## Running Nodes Individually and Pinning

So far, we have focused on executing entire workflows, but n8n actually gives us the option of executing nodes individually. This can be extremely helpful to not rerun the same nodes again and again, especially if we know that they are working. This is something that we will explore later in the recitation, but note that **we need to have executed the previous nodes in order to run a node**. This is because we need to have its inputs available!

One way to make sure that the inputs are available is by _pinning data_. This fixes the input so if we rerun the workflow, the input does not change and that node doesn't need to run again. Why would we do this? This guarantees that we have the data available if we need to run the next step to troubleshoot.

This may seem pretty abstract at the moment. Once you have sent a message in the chat and your `Chat Trigger` has a green checkmark, click into it. In the top right, you will see a little pin icon:
![[pinning_data.png]]

Click on it and it will turn purple. If you try to send a different chat message, you may get a message asking if you want to unpin to send the new message. This is because **the output of this node is locked when you pin it**. Save your workflow and refresh the page. You'll see that we keep the data, which is extremely useful for testing!

To see the use of this further, look at the AI Agent node after the chat trigger. If you hit the `Execute Workflow` button and do not unpin the chat trigger, it will receive the same input each time. We can also execute the node by itself; click into it and press `Execute step`. Note that this only works when the input is available, which you will see on the lefthand side of the screen when you click into the node. We will practice this as we make our agent.

---
### Exercise

You will be given a workflow and you should use your JSON skills to find the error and fix it. Copy and paste in this workflow:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "options": {
          "responseMode": "lastNode"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.chatTrigger",
      "typeVersion": 1.3,
      "position": [
        -304,
        0
      ],
      "id": "bd9a4ec0-1e97-47ea-9a97-1889a390f1a9",
      "name": "When chat message received",
      "webhookId": "0a6de3a1-29f0-481d-97ce-9e55298d7bd7"
    },
    {
      "parameters": {
        "mode": "raw",
        "jsonOutput": "={\n  \"message\": \"{{ $json.chatInput }}\",\n  \"students\": [\n    {\"name\": \"Romeo\"},\n    {\"name\": \"Juliet\"},\n    {\"name\": \"Mercutio\"}\n  ]\n}",
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -96,
        0
      ],
      "id": "c6005c6a-e7ba-44db-b197-e34b575300cd",
      "name": "Build profile"
    },
    {
      "parameters": {
        "sendTo": "={{ $json.email }}",
        "subject": "Class Roster",
        "emailType": "text",
        "message": "=The students in your class are {{ $json.students[0].name }}, {{ $json.students[1].name }}, and {{ $json.students[2].name }}.\n\nThe message you sent them is:\n\n{{ $json.message }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        112,
        0
      ],
      "id": "1104fbf2-41c0-45e4-9c55-d975d0f40f86",
      "name": "Send a message",
      "webhookId": "aba873ec-57da-4766-acfc-86beebc5acf5",
      "credentials": {
        "gmailOAuth2": {
          "id": "06JM4io9KZSonBii",
          "name": "Sebastien Gmail account"
        }
      }
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Recitation 2 - n8n Deep Dive",
        "height": 464,
        "width": 576
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -560,
        -544
      ],
      "id": "1624390a-2e72-4777-9301-a895d43e1feb",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "content": "## Questions\n\n1. What node do we see an error in?\n2. Try to fix the error. What needs to change? Try to do it yourself, but remember that the AI Assistant can help you as well!\n",
        "height": 192,
        "width": 528,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        48,
        -272
      ],
      "id": "c0024e2d-f4f6-4a84-ba90-c5985bcea201",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "mode": "raw",
        "jsonOutput": "={\n  \"message\": \"Email sent!\",\n  \"message2\": \"Just showing off that this is not being sent\",\n  \"message_for_students\": \"{{ $('Build profile').item.json.message }}\"\n}\n ",
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        304,
        0
      ],
      "id": "6e6780ce-7fdb-4a1b-9f8c-b8b6eb6116bf",
      "name": "Response Message"
    }
  ],
  "connections": {
    "When chat message received": {
      "main": [
        [
          {
            "node": "Build profile",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Build profile": {
      "main": [
        [
          {
            "node": "Send a message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Send a message": {
      "main": [
        [
          {
            "node": "Response Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Response Message": {
      "main": [
        []
      ]
    }
  },
  "pinData": {
    "When chat message received": [
      {
        "sessionId": "fec14fd0c4184413a1ad74a95daef98f",
        "action": "sendMessage",
        "chatInput": "Glad to see you at the recitation!"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

Note that I have pinned a chat message, but you are free to unpin it.

1. What node is causing the error? What is the error?
2. Try to fix the error. What needs to change? Remember, you can use the AI Assistant to help you.

One small note: the `Chat Trigger` has some hidden behavior. If we look at the last node, we see that it has three key-value pairs:

```JSON
{
  "message": "Email sent!",
  "message2": "Just showing off that this is not being sent",
  "message_for_students": "{{ $('Build profile').item.json.message }}"
}
```

The chat trigger has several response modes. Up to this point, we have only used `When Last Node Finishes`. In this case, it looks for the output of the last node and if there is a key called "message", it will return that value. Otherwise, it will return the whole object.

To see this, change the key "message" to anything else. If you run the entire workflow again, you'll see that in the chat, you actually receive the entire JSON object!

To make it extremely clear what you are returning, you can change the response mode to `Using Response Nodes` and then add a node at the end called `Respond to Chat`. Just make sure to put in the correct message there!

A last note: as shown in the JSON clip from the last node above, the `message_for_students` is actually referencing a node that is not directly connected to it. As a result, we can't just reference that message as `{{ $json.message }}`; we instead have to use the name of the node followed by `.item`. You are not expected to know all of JSON, but it's important to note this difference.

---
## Creating our Email Triage Agent

Now, we begin to build our agent. We first want to lay out exactly what we want our workflow to do. It should:

1. Receive emails,
2. Use an AI agent to assign a category (administrative, class content, n8n, etc.), assign a specific teaching team member to the email, draft a response, and assign an urgency level to the email,
3. CCs the appropriate member of the teaching team for high-urgency items,
4. Responds to all emails, and
5. Logs every ticket to Google Sheets.

Note that we could definitely still critique this workflow. Perhaps we always should CC the teaching team or only have the agent respond to a specific set of emails. This structure is quite flexible and we encourage you to explore and optimize it yourself.

Start a new workflow and let's get started!

---
### Step 1: Gmail Trigger

- **Add node:** `On App Event → Gmail → On message received`
	- Connect with your Gmail connection. Ideally, use an email that's not your personal one so that it does not respond to those ones.
	- `Poll Times`: By default, we can't let n8n listen constantly for emails. A "poll time" just tells us how often it checks if there is a new email. In this case, if this was just an email waiting for student emails, we could assume that we won't receive more than 1 email per minute, but we could adapt this accordingly.

Click `Execute Workflow` and send an email to the Gmail that you used for this node. You should see a large JSON object with many fields. Now, you are better able to parse this!

Once you have done this step, pin the data in this node. This means we don't need to keep sending emails to ourselves.

---
### Step 2: Extract First Name

To be able to respond more personably, we will extract the first name of the user. Note that this is perhaps not the best use case; for the sake of simplicity, we assume that people sending the email have one word first names, but we know that this doesn't hold in practice. It's easier (and more accurate) to simply give the AI Agent the full name of the user and let it determine what their first name is. However, this node is extremely useful.

- **Add node:** `Edit Fields (Set)`
	- Now that you know the basics of JSON, you can choose either mode! We will stick with `Manual Mapping` for this recitation.
	- `Fields to Set`: Click `Add Field`. 
		- For name, put `firstName`
		- Next to the equality sign, put `{{ $json.from.value[0].name.trim().split(' ')[0] }}`. This finds the name of the person sending the email and takes the first word as the first name.
	- `Input Fields to Include`: If we want, we can pass the inputs directly to the output. This makes it easy to keep passing data through the nodes, even if we don't directly use it. For now, we choose `All`/
- **What it does:** The `Set` node lets us transform JSON objects. 

Now, when you are in the node, click `Execute Step`. This will only execute this node. In the output, you will see a lot of the key-value pairs from the input, as well as a new one called `firstName`.

---
### Step 3: Categorization Agent

We now add our AI agent, which has several responsibilities. Given an email, it needs to assign it a **category, corresponding teaching staff (professor, TA, IPCM),** and **urgency level.**

Feel free to create this yourself, but we also will provide you with some code that you can copy and paste to get this node. This includes:

- The `AI Agent` node;
- The model (in our case, OpenAI);
- `Prompt (User Message)`, including the student's first name, the subject of the email, and the email itself;
- A `System Message` that explains the behavior of the agent and some general rules;
- An `Output Parser`, which we will not discuss in depth yet. This is a tool that says that the output of the AI Agent needs to have a specific format. In our case, this ensures that we always have the output structure that we want.

```JSON
{
  "nodes": [
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5-mini",
          "mode": "list",
          "cachedResultName": "gpt-5-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        -1152,
        96
      ],
      "id": "709145a8-493c-4f86-89bf-02874dcfd591",
      "name": "GPT-5 mini",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Sender: {{ $json.firstName }}\nSubject: {{ $json.subject }}\nContent: {{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "You will receive an email sent from a student to the AIML901 teaching team at Kellogg. You are an AI agent named \"Kai Support\" that will help them and connect them to the team.\n\nYour goal is to:\n- Reply to the email (choose title and content)\n- CC the correct team member to the email\n- Create a corresponding ticket in the teaching team's spreadsheet.\n\n# Categories\n\n- *administrative*: administrative question(s) or information  (e.g., when is the final exam; I cannot attend next class, etc..)\n- *content*: course content question(s) (e.g., what's an LLM?)\n- *n8n*: technical questions about n8n\n- *project*: question about the individual class project.\n- *other*: anything that is hard to relate to the other categories.\n\n# Behavior\n\n- Use the name \"Kai support\" to sign the email.\n- Adopt the tone of a cheerful PhD student TA\n- In addition to the information provided here, use the AIML-901 Docs tool to reference other information about the class.\n- You do not necessarily have enough information to help the student. When in doubt, always prefer to be sincere about what you know and what you don't. And if you don't, mention that the person you CCed will help. If you have the information necessary to respond to all of the student's questions, set confidence to TRUE and otherwise, set it to FALSE.\n\n# Teaching Team:\n- Sebastien Martin\n  - main instructor\n  - aiml901sebastienmartin+prof@gmail.com\n  - role: anything important or that cannot be directed to another team member, such as personal situations and complex questions\n- Alex Jensen\n  - TA\n  - aiml901sebastienmartin+ta@gmail.com\n  - role: anything relating to n8n, the final exam, and quick content questions\n- Jillian Law\n  - In-person class moderator\n  - JillianLaw2024@u.northwestern.edu\n  - role: anything relating to attendance, seating, and classroom rules\n\n# Background information\n\n**Location:** KGH 1130  \n- **Lectures:** Tue/Fri  \n  - Sec. 31: 10:30–12  \n  - Sec. 32: 1:30–3  \n- **Recitations:** Wed  \n  - Sec. 31: 1:30–2:30  \n  - Sec. 32: 3:30–4:30  \n- **Office Hours:** Wed  \n  - Sec. 31 & 32: 2:30–3:30, 4:30–5  \n\n**Policy:** [Kellogg Honor Code](http://www.kellogg.northwestern.edu/policies/honor-code.aspx)\n\n---\n\n## Module 1: How AI Works\n*Build a deep understanding of genAI, from pretraining to agents.*\n\n- **Class 1 (Oct 21):** Build your first AI agent; intro to deliverables  \n- **Recitation 1 (Oct 22):** Build a Google Calendar agent (first n8n agent)  \n- **Class 2 (Oct 24):** Pretraining a large language model  \n- **Class 3 (Oct 28):** Post-training, alignment, and safety  \n- **Recitation 2 (Oct 29):** Build a customer service agent (n8n deep dive)  \n- **Class 4 (Oct 31):** AI agents, tools (RAG, etc.), usage  \n\n---\n\n## Module 2: What AI Can Do\n*AI tools, prompting, productivity, ecosystem.*\n\n- **Class 5 (Nov 4):** Prompting and leveraging AI  \n- **Recitation 3 (Nov 4–5, evening):** Build a personal assistant agent (advanced n8n)  \n- **Class 6 (Nov 5):** AI landscape and state-of-the-art companies  \n\n---\n\n## Module 3: From AI to Impact\n*Connecting AI to business outcomes.*\n\n- **Class 7 (Nov 7):** Evaluation pipelines  \n- **Class 8 (Nov 11):** AI strategy & risk management  \n- **Recitation 4 (Nov 12):** Build an evaluation mechanism (agent evaluation)  \n- **Class 9 (Nov 14):** Change management with AI case study  \n- **Class 10 (Nov 18):** Project showcase, final exam review, staying current  \n- **Recitation 5 (Nov 19):** End-to-end product creation (Lovable, apps/websites)  \n\n---\n\n## Deliverables\n- **Weekly Homework:** AI-powered, delivered by *Kai* (<30 min each)  \n- **Project:** Individual, due Nov 25 (early submissions allowed)  \n- **Final Exam:** Online, self-serve (Nov 21–25), 1h30, focused on n8n recitations"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        -1152,
        -112
      ],
      "id": "dd8dc66f-6b4e-4b6e-9340-7faf0dbf647f",
      "name": "Category Agent"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\n    \"response_content\",\n    \"response_cc\",\n    \"ticket_description\",\n    \"ticket_category\",\n    \"ticket_cc\",\n    \"ticket_priority\",\n    \"ticket_name\",\n    \"confidence\"\n  ],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"response_content\": {\n      \"type\": \"string\",\n      \"description\": \"Formatted like a complete email content (e.g., starts with hi and ends with signature).\"\n    },\n    \"response_cc\": {\n      \"type\": \"string\",\n      \"description\": \"The email address of the person to CC. Nothing else.\"\n    },\n    \"ticket_description\": {\n      \"type\": \"string\",\n      \"description\": \"Just one sentence, to the point.\"\n    },\n    \"ticket_category\": {\n      \"type\": \"string\",\n      \"enum\": [\"administrative\", \"content\", \"n8n\", \"project\", \"other\"],\n      \"description\": \"One of the allowed categories.\"\n    },\n    \"ticket_cc\": {\n      \"type\": \"string\",\n      \"description\": \"The full name of the person corresponding to the CCed email address.\"\n    },\n    \"ticket_name\": {\n      \"type\": \"string\",\n      \"description\": \"Name of the student; if unknown, their email.\"\n    },\n    \"ticket_priority\": {\n      \"type\": \"string\",\n      \"description\": \"Priority label (e.g., low/medium/high).\"\n    },\n    \"confidence\": {\n      \"type\": \"boolean\",\n      \"description\": \"Model's confidence in the category/route; true if the answer to all of the questions is known and false otherwise.\"\n    }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        -976,
        80
      ],
      "id": "9b8cb8a7-d9f9-4de2-92ce-056137835154",
      "name": "agent decision format"
    }
  ],
  "connections": {
    "GPT-5 mini": {
      "ai_languageModel": [
        [
          {
            "node": "Category Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Category Agent": {
      "main": [
        []
      ]
    },
    "agent decision format": {
      "ai_outputParser": [
        [
          {
            "node": "Category Agent",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}

```

If you click on the `Output Parser`, you'll be able to see that this is just JSON. Try running the AI agent. Looking at the key called `required`, you will see a list of words (response_content, response_cc, etc.) that are exactly the keys in the output.

Run this node and for now, let's pin the output. This means that we don't have to send another call to the OpenAI API. Note that we see the keys from the output parser, but they are an object called `output`. Therefore, if we want to retrieve the `response_content`, we would need to write `{{ $json.output.response_content }}`.

---
### Step 4: Routing

We now need to decide whether a member of the teaching team needs to be CCed or if this can be handled by the agent's response. The Category Agent gives us a **priority level** (ticket_priority), indicating how urgent the message is. If the message is high priority, we want to CC the teaching team.

- **Add node:** `If`
    - For value1, input the priority assigned by the Category Agent:
    ```JSON
    {{ $json.output.ticket_priority }}
    ```
    
    - Click the dropdown next to “is equal to”. Choose `#Number` and then “is greater than or equal to”
    - For value2, put `high`. This means that our condition is True if the message is high priority and False otherwise.
 - **What it does:** If the ticket is high priority, then we will take the True branch. Otherwise, we take the False branch.
- **Why this matters:** This allows us to execute different paths depending on the priority of the ticket. In our case, we only want to CC the teaching team if deemed necessary, and this lets us distinguish between the two cases. 

---
### Exercises

1. Run the `If` node. Was the previous email considered high priority?
2. If you click on `Add condition`, we can add other conditions to help determine which path should be taken. Add a condition saying that if the `ticket_category` is "other", the teaching team should be CCed, regardless of the priority level.
3. Looking back at the AI agent, we can see that one of the outputs (and one of the inputs to the `If` node) was `confidence`. This will be either "True" or "False" and indicates whether the AI thinks it is able to accurately respond to the email. Add a condition that if confidence is False, the teaching team should be CCed, regardless of the priority level. (Note: you will need to click on the box that says "Is equal to" and choose `Boolean → Is True`)
4. Add your own custom condition! Note that we have other information available from the AI agent. 

---
### Step 5: Email Response

Now, we respond using the output from the agent. We first consider the case when the ticket is not high priority. In this case, we do not need to CC the teaching team.

- **Add node:** `Gmail → Thread Actions → Reply to a message`
`Thread ID`: 
```JSON
{{ $('When receiving an email').item.json.threadId }}
```
`Message Snippet or ID`:
```JSON
{{ $('When receiving an email').item.json.threadId }}
```
`Message`:
```JSON
{{ $json.output.response_content }}
```
- Connect this to the `true` output from the If node.
- **What it does:** This sends a message to respond to the email that the student sent. A "thread" is a chain of emails and replies, so using the Thread ID allows us to respond directly to the email instead of just sending them a separate email.

---
### Step 6: CCing the Teaching Team

The steps here are identical as the previous step, but now we want to CC the teaching team.

- Copy the node from Step 7 and connect it to the `false` output from the If node.
- Click into the node. Click `Add option` and then `CC`. In the field, we will input
```JSON
{{ $json.output.response_cc }}
```

---
### Step 7: Logging Tickets

Finally, we want to log each ticket in a Google Sheet. First, make a Google Sheet with the following column titles:

| Student | Assigned Teaching Staff | Category | Email Description |
| ------- | ----------------------- | -------- | ----------------- |
|         |                         |          |                   |

- **Add node:** `Google Sheets → Append row in sheet`
    - Document: whatever you call the Google Sheets file
    - Sheet: the correct sheet within the document
    - Mapping Column Mode: Map Each Column Manually
    - We then need to drag and drop the correct information from our fields.
- Connect this to both the `true` and `false` outputs of the If node, since we want to log the tickets regardless of whether the teaching team is CCed.

---
### Exercises:

1. Let's say we only want to add tickets to the sheet if the teaching team is not CCed. What would we change?
2. We would like to know if the ticket is handled by a human or AI. Add a column to your Google Sheets called Handled By and have it fill in as “Human” if the teaching team was CCed and “AI” if it was not.
	- *Hint*: Use the `Edit Fields (Set)` node to map this to a value.
3. For transparency, maybe we want Professor Martin to be CCed on any email where other members of the teaching team are also CCed. However, there can also be emails where just Professor Martin is CCed. What would we need to change here? 
4. We do not give the Category Agent much information about how it should decide how confident it is in its response. In fact, it is possible that it could decide that it should never (or always) CC the teaching team. Try sending several emails with different issues to see how it handles this. Are there any guidelines we can add to ensure how well we do this?
   
   **Challenge:** Try changing the content of the output parser so instead of giving True or False for the confidence parameter, it gives a number between 1 and 5. The easiest way to do this is to give the JSON in the output parser to ChatGPT and ask it to modify it; it is generally quite good at this. What else needs to change in the workflow?

---
### For the Final:

- JSON structure in n8n
- Node inputs and outputs
- `Edit Fields (Set)` and `If` node
- `Gmail` and `Google Sheets` nodes

---
# Exploratory Content

Note that our agent (specifically, the model that it uses) is trained on past data and does not contain by itself specific knowledge about the class. We need to give our agent enough information to be able to respond to student emails. There are two ways that we can do this: adding information to the system message or giving it access to files. We currently have focused on adding information to the system message; look at it and you will see information about class times, the teaching team, and topics covered. Now, we focus on letting our agent access information beyond this. 

Copy and paste the following into your workflow. Do not worry about connecting it up just yet.

```JSON

{
  "nodes": [
    {
      "parameters": {
        "mode": "insert",
        "memoryKey": {
          "__rl": true,
          "mode": "list",
          "value": "vector_store_key"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.vectorStoreInMemory",
      "typeVersion": 1.3,
      "position": [
        -1568,
        304
      ],
      "id": "37282b22-6d56-47ff-af9b-129b35e3486c",
      "name": "Simple Vector Store"
    },
    {
      "parameters": {
        "dataType": "binary",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.documentDefaultDataLoader",
      "typeVersion": 1.1,
      "position": [
        -1520,
        512
      ],
      "id": "4c2ef9b2-f5b2-4458-b9c8-6658f99575d7",
      "name": "Default Data Loader"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.embeddingsOpenAi",
      "typeVersion": 1.2,
      "position": [
        -1312,
        512
      ],
      "id": "4f948be1-b6cd-460f-aacc-1f86f1bd327c",
      "name": "Embeddings OpenAI",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "mode": "retrieve-as-tool",
        "toolDescription": "Retrieve information about NimbusSoft, your company. Use this to answer specific queries from the users.",
        "memoryKey": {
          "__rl": true,
          "mode": "list",
          "value": "vector_store_key"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.vectorStoreInMemory",
      "typeVersion": 1.3,
      "position": [
        -1136,
        304
      ],
      "id": "5397980f-2cd3-4bc8-baab-abad43dbc2d1",
      "name": "AIML 901 Docs"
    }
  ],
  "connections": {
    "Default Data Loader": {
      "ai_document": [
        [
          {
            "node": "Simple Vector Store",
            "type": "ai_document",
            "index": 0
          }
        ]
      ]
    },
    "Embeddings OpenAI": {
      "ai_embedding": [
        [
          {
            "node": "Simple Vector Store",
            "type": "ai_embedding",
            "index": 0
          },
          {
            "node": "AIML 901 Docs",
            "type": "ai_embedding",
            "index": 0
          }
        ]
      ]
    },
    "AIML 901 Docs": {
      "ai_tool": [
        []
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

## Retrieval-Augmented Generation (RAG)

To improve our agent, we want to give it a tool that allows it to search through documents before it creates its response. This is known as **Retrieval-Augmented Generation, or RAG**. However, it would be extremely inefficient for our agent to have to read through entire documents each time. As a result, we want to consolidate this text into a more accessible format. Specifically, we want the following process:

1. A student asks a question
2. The AI agent searches a knowledge base for the most relevant chunks of text.
3. These chunks of text are passed to the LLM.
4. The LLM uses these to compose its response.

Here, we walk through the parts that you were given above. For more information, ask the AI Assistant or read through the documentation for the nodes. This is simply a minimal example to get you started.

---
### Simple Vector Store

We will build a way to insert the documents into what is known as a **vector store**. A vector is a string of numbers. We will take our data and transform it into vectors, where similar vectors refer to similar sequences of data.

Note that you might need to make a `Memory Key`, which is like your key for the `Simple Memory` subnode.

---
### Default Data Loader

This node decides how to load data into the vector store. Specifically, we need to split the data from the documents into chunks, which are each stored as a separate vector. This is responsible for determining what type of data is being loaded in and how it is split, but we still need to determine how to make the vectors from this chunked data.

---
### Embeddings OpenAI

There are many ways to create these vectors, also known as **embedding the text.** OpenAI provides different embedding schema, which create the vectors that we store. This also can be used to determine the meanings of the vectors, which we need when we retrieve the data in the next step.

---
### AIML 901 Docs

The simple vector store, default data loader, and embeddings are what we use to load the data into the vector store. However, we now need a way to retrieve vectors and decode them. This node uses the embeddings to retrieve the data that we store so that an AI agent can access this information. 

From the `Category Agent`, connect the `+` sign where it says `Tool` to this node. Now, the AI agent is able to reference any documents within the vector store.

---
### Preparing RAG Input

At this point, we do not have a way for the important class documents to be added to the vector store. 

- **Add node:** `Add another trigger → On form submission`
	- **Form Title:** Something along the lines of AIML 901 Information Database
	- Click `Add Form Element`
		- **Field Name:** File
		- **Element Type:** File
		- **Accepted File Types:** We can choose what types of files to add in. For now, write `.pdf, .docx`
- Connect the output of this node to the Simple Vector Store.
- **What it does:** Last week, we saw some different types of trigger nodes. This is an alternative that starts the workflow when a user fills out the form. In our specific case, when we fill out the form and submit a file, it then embeds the data from the file as vectors, which we can then retrieve later.

---
### Exercises

1. Create a document with a random fact about the class that the AI agent does not already know and add it to the vector store. Try to send an email and get the AI agent to reference this!
2. Change the setting of the agent completely. What if this was for a company instead of a class? What needs to change?

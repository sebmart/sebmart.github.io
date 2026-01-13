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
- Learn about branching and build routing with `If` and Gmail/Google Sheets nodes.
- Understand and problem-solve errors in n8n.

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

3. **Referencing values**: You get values by following the keys.
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

In n8n, we can write expressions that let us refer to the values in a JSON structure. You've actually already seen this before; in Recitation 1, we saw the prompt for the AI Agent node {{ $json.chatInput }}.

This is how we let n8n reference whatever value is stored under the key `chatInput`.

Let's think about the previous example. 
- If we wrote
```JSON
{{ $json.course }}
```
this would give us the value `"AgentOps"`.
- If we wrote
```JSON
{{ $json.students }}
```
we would get 
```JSON
[
    {"name": "Maya", "year": "MBA1"},
    {"name": "John", "year": "MBA2"}
]
```
- To get the first student, we would write 
```JSON
{{ $json.students[0] }}
```
- To get the first student's name, we would write 
```JSON
{{ $json.students[0].name }}
```

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

We can see the input coming from the chat trigger node. Looking at the `Prompt (User Message)` value, we see the expression 
```JSON
{{ $json.chatInput }}
```
This is how we refer to the `chatInput` value from the chat trigger.

## Running Nodes Individually and Pinning

So far, we have focused on executing entire workflows, but n8n actually gives us the option of executing nodes individually. This can be extremely helpful to not rerun the same nodes again and again, especially if we know that they are working. This is something that we will explore later in the recitation, but note that **we need to have executed the previous nodes in order to run a node**. This is because we need to have its inputs available!

One way to make sure that the inputs are available is by _pinning data_. This fixes the input so if we rerun the workflow, the input does not change and that node doesn't need to run again. Why would we do this? This guarantees that we have the data available if we need to run the next step to troubleshoot.

This may seem pretty abstract at the moment. Once you have sent a message in the chat and your `Chat Trigger` has a green checkmark, click into it. In the top right, you will see a little pin icon:
![[pinning_data.png]]

Click on it and it will turn purple. If you try to send a different chat message, you may get a message asking if you want to unpin to send the new message. This is because **the output of this node is locked when you pin it**. Save your workflow and refresh the page. You'll see that we keep the data, which is extremely useful for testing!

To see the use of this further, look at the AI Agent node after the chat trigger. If you hit the `Execute Workflow` button and do not unpin the chat trigger, it will receive the same input each time. We can also execute the node by itself; click into it and press `Execute step`. Note that this only works when the input is available, which you will see on the lefthand side of the screen when you click into the node. We will practice this as we make our agent.

---
## Creating our Email Triage Agent

Now, we begin to build our agent. We first want to lay out exactly what we want our workflow to do. It should:

1. Receive emails,
2. Use an AI agent to assign a category (administrative, class content, n8n, etc.), assign a specific teaching team member to the email, draft a response, and assign an urgency level to the email,
3. CCs the appropriate member of the teaching team for high-urgency items,
4. Responds to all emails,
5. Logs every ticket to Google Sheets, and
6. Sends a separate reminder to the relevant member of the teaching team.

Note that we could definitely still critique this workflow. Perhaps we always should CC the teaching team or only have the agent respond to a specific set of emails. This structure is quite flexible and we encourage you to explore and optimize it yourself.

Start a new workflow and let's get started! You will be provided with instructions on how to work creating every node yourself, but for the video, you will be provided with the workflow (which you can copy and paste from directly below) and then we will discuss each step.

```JSON
{
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute"
            }
          ]
        },
        "simple": false,
        "filters": {},
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1.3,
      "position": [
        144,
        528
      ],
      "id": "9ce98fa7-d77f-48a9-a1b6-08632c8f7668",
      "name": "When receiving an email",
      "credentials": {
        "gmailOAuth2": {
          "id": "9Rpb3KSeY5jaPu26",
          "name": "Alex Student Gmail"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "ffb8b510-9924-4a6c-a164-a5a57f6ab9c7",
              "name": "firstName",
              "value": "={{ $json.from.value[0].name.trim().split(' ')[0] }}",
              "type": "string"
            }
          ]
        },
        "includeOtherFields": true,
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        368,
        528
      ],
      "id": "973c0d4d-2765-4e32-bdc5-a94ed960a7b0",
      "name": "Set First Name"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\n    \"response_content\",\n    \"response_cc\",\n    \"ticket_description\",\n    \"ticket_category\",\n    \"ticket_cc\",\n    \"ticket_priority\",\n    \"ticket_name\",\n    \"confidence\"\n  ],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"response_content\": {\n      \"type\": \"string\",\n      \"description\": \"Formatted like a complete email content (e.g., starts with hi and ends with signature).\"\n    },\n    \"response_cc\": {\n      \"type\": \"string\",\n      \"description\": \"The email address of the person to CC. Nothing else.\"\n    },\n    \"ticket_description\": {\n      \"type\": \"string\",\n      \"description\": \"Just one sentence, to the point.\"\n    },\n    \"ticket_category\": {\n      \"type\": \"string\",\n      \"enum\": [\"administrative\", \"content\", \"n8n\", \"project\", \"other\"],\n      \"description\": \"One of the allowed categories.\"\n    },\n    \"ticket_cc\": {\n      \"type\": \"string\",\n      \"description\": \"The full name of the person corresponding to the CCed email address.\"\n    },\n    \"ticket_name\": {\n      \"type\": \"string\",\n      \"description\": \"Name of the student; if unknown, their email.\"\n    },\n    \"ticket_priority\": {\n      \"type\": \"string\",\n      \"description\": \"Priority label (e.g., low/medium/high).\"\n    },\n    \"confidence\": {\n      \"type\": \"boolean\",\n      \"description\": \"Model's confidence in the category/route; true if the answer to all of the questions is known and false otherwise.\"\n    }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1024,
        800
      ],
      "id": "74f23027-61e6-4676-9f77-10b8038ba352",
      "name": "agent decision format"
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
        432,
        32
      ],
      "id": "b015a87f-a4ed-491e-91ff-301f42e6da78",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('Set First Name').item.json.threadId }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        544,
        784
      ],
      "id": "bea54655-05e4-44ff-b09f-72e0f9b4d57d",
      "name": "Simple Memory"
    },
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "Reply to a message in Gmail without CCing anyone",
        "resource": "thread",
        "operation": "reply",
        "threadId": "={{ $('Set First Name').item.json.threadId }}",
        "messageId": "={{ $('Set First Name').item.json.id }}",
        "message": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Message', ``, 'string') }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTool",
      "typeVersion": 2.1,
      "position": [
        672,
        832
      ],
      "id": "a8a779c2-80d8-410d-811f-1fdb9ab678b3",
      "name": "Reply to a message in Gmail",
      "webhookId": "eca0178c-0444-4570-9abb-a13b8367889c",
      "credentials": {
        "gmailOAuth2": {
          "id": "9Rpb3KSeY5jaPu26",
          "name": "Alex Student Gmail"
        }
      }
    },
    {
      "parameters": {
        "descriptionType": "manual",
        "toolDescription": "Reply to a message in Gmail while CCing a member of the teaching team.",
        "resource": "thread",
        "operation": "reply",
        "threadId": "={{ $('Set First Name').item.json.threadId }}",
        "messageId": "={{ $('Set First Name').item.json.id }}",
        "message": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Message', ``, 'string') }}",
        "options": {
          "ccList": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('CC', ``, 'string') }}"
        }
      },
      "type": "n8n-nodes-base.gmailTool",
      "typeVersion": 2.1,
      "position": [
        880,
        848
      ],
      "id": "e70c5023-8829-4e3e-a235-fc275642cf83",
      "name": "Reply to a message in Gmail (CC)",
      "webhookId": "eca0178c-0444-4570-9abb-a13b8367889c",
      "credentials": {
        "gmailOAuth2": {
          "id": "9Rpb3KSeY5jaPu26",
          "name": "Alex Student Gmail"
        }
      }
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "12c9o9E9vqZF9IK2oDJ5l50xYiVbg-l7C_W4koeAm-Mk",
          "mode": "list",
          "cachedResultName": "Recitation 2 Email Triage",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/12c9o9E9vqZF9IK2oDJ5l50xYiVbg-l7C_W4koeAm-Mk/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/12c9o9E9vqZF9IK2oDJ5l50xYiVbg-l7C_W4koeAm-Mk/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Assigned Teaching Staff": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Assigned_Teaching_Staff', ``, 'string') }}",
            "Student": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Student', ``, 'string') }}",
            "Category": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Category', ``, 'string') }}",
            "Email Description": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Email_Description', ``, 'string') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "Student",
              "displayName": "Student",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Assigned Teaching Staff",
              "displayName": "Assigned Teaching Staff",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Category",
              "displayName": "Category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Email Description",
              "displayName": "Email Description",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheetsTool",
      "typeVersion": 4.7,
      "position": [
        768,
        976
      ],
      "id": "b4a4b6b7-b5cb-4bea-b0f6-9c7a1c454e7f",
      "name": "Append row",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Sender: {{ $json.firstName }}\nSubject: {{ $json.subject }}\nContent: {{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "You will receive an email sent from a student to the AIML901 teaching team at Kellogg. You are an AI agent named \"Kai Support\" that will help them and connect them to the team.\n\nYour goal is to use your tools to:\n- Reply to the email (choose content)\n- CC the correct team member to the email\n- Create a corresponding ticket in the teaching team's spreadsheet.\n\n# Categories\n\nYou will assign a category to use the Google Sheets tool. These categories are:\n\n- *administrative*: administrative question(s) or information  (e.g., when is the final exam; I cannot attend next class, etc..)\n- *content*: course content question(s) (e.g., what's an LLM?)\n- *n8n*: technical questions about n8n\n- *project*: question about the individual class project.\n- *other*: anything that is hard to relate to the other categories.\n\n# Tools\n\nYou have 3 tools available:\n\n- Append row allows you to log the email in Google Sheets.\n- Reply to a message in Gmail allows you to reply to the message without CCing a member of the teaching team.\n- Reply to a message in Gmail allows you to reply to the message while CCing a member of the teaching team.\n\n# Behavior\n\n- Always use the tools. You should respond to the student and also log your response using the Google Sheet tool.\n- Use the name \"Kai support\" to sign the email.\n- Adopt the tone of a cheerful PhD student TA\n- In addition to the information provided here, use the AIML-901 Docs tool to reference other information about the class.\n- You do not necessarily have enough information to help the student. When in doubt, always prefer to be sincere about what you know and what you don't. And if you don't, mention that the person you CCed will help. If you have the information necessary to respond to all of the student's questions, set confidence to TRUE and otherwise, set it to FALSE.\n\n# Teaching Team:\n- Sebastien Martin\n  - main instructor\n  - aiml901sebastienmartin+prof@gmail.com\n  - role: anything important or that cannot be directed to another team member, such as personal situations and complex questions\n- Alex Jensen\n  - TA\n  - aiml901sebastienmartin+ta@gmail.com\n  - role: anything relating to n8n, the final exam, and quick content questions\n- Gitanjali Jaggi\n  - In-person class moderator for Section 31\n  - gitanjali.jaggi@kellogg.northwestern.edu\n  - role: anything relating to attendance, seating, and classroom rules\n- Erika Guan\n  - In-person class moderator for Section 81\n  - erikaguanqing@gmail.com\n  - role: anything relating to attendance, seating, and classroom rules\n\n# Background information\n\n**Location:** KGH 1130  \n- **Lectures:** Tue/Fri  \n  - Sec. 31: 10:30–12  \n  - Sec. 32: 1:30–3  \n- **Recitations:** Wed  \n  - Sec. 31: 1:30–2:30  \n  - Sec. 32: 3:30–4:30  \n- **Office Hours:** Wed  \n  - Sec. 31 & 32: 2:30–3:30, 4:30–5  \n\n**Policy:** [Kellogg Honor Code](http://www.kellogg.northwestern.edu/policies/honor-code.aspx)\n\n---\n\n## Module 1: How AI Works\n*Build a deep understanding of genAI, from pretraining to agents.*\n\n- **Class 1 (Oct 21):** Build your first AI agent; intro to deliverables  \n- **Recitation 1 (Oct 22):** Build a Google Calendar agent (first n8n agent)  \n- **Class 2 (Oct 24):** Pretraining a large language model  \n- **Class 3 (Oct 28):** Post-training, alignment, and safety  \n- **Recitation 2 (Oct 29):** Build a customer service agent (n8n deep dive)  \n- **Class 4 (Oct 31):** AI agents, tools (RAG, etc.), usage  \n\n---\n\n## Module 2: What AI Can Do\n*AI tools, prompting, productivity, ecosystem.*\n\n- **Class 5 (Nov 4):** Prompting and leveraging AI  \n- **Recitation 3 (Nov 4–5, evening):** Build a personal assistant agent (advanced n8n)  \n- **Class 6 (Nov 5):** AI landscape and state-of-the-art companies  \n\n---\n\n## Module 3: From AI to Impact\n*Connecting AI to business outcomes.*\n\n- **Class 7 (Nov 7):** Evaluation pipelines  \n- **Class 8 (Nov 11):** AI strategy & risk management  \n- **Recitation 4 (Nov 12):** Build an evaluation mechanism (agent evaluation)  \n- **Class 9 (Nov 14):** Change management with AI case study  \n- **Class 10 (Nov 18):** Project showcase, final exam review, staying current  \n- **Recitation 5 (Nov 19):** End-to-end product creation (Lovable, apps/websites)  \n\n---\n\n## Deliverables\n- **Weekly Homework:** AI-powered, delivered by *Kai* (<30 min each)  \n- **Project:** Individual, due Nov 25 (early submissions allowed)  \n- **Final Exam:** Online, self-serve (Nov 21–25), 1h30, focused on n8n recitations"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        608,
        528
      ],
      "id": "0e3b673d-81ae-42ff-b597-66304c61d4f5",
      "name": "Category Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.1",
          "mode": "list",
          "cachedResultName": "gpt-5.1"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        416,
        736
      ],
      "id": "fa0c841a-6e64-46e8-b505-6f0ae73d633f",
      "name": "GPT-5.1",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict",
            "version": 2
          },
          "conditions": [
            {
              "id": "5cb9f2b0-bcfd-4839-8db8-ae80bef2e4d7",
              "leftValue": "={{ $json.output.ticket_priority }}",
              "rightValue": "high",
              "operator": {
                "type": "string",
                "operation": "equals"
              }
            }
          ],
          "combinator": "or"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1024,
        528
      ],
      "id": "2a876b68-7f10-453b-9400-f77a06607916",
      "name": "If high priority..."
    },
    {
      "parameters": {
        "sendTo": "={{ $('Category Agent').item.json.output.response_cc }}",
        "subject": "URGENT: Email Requiring Response",
        "emailType": "text",
        "message": "There is an urgent email requiring your attention.",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1248,
        432
      ],
      "id": "86cad136-c5ca-4b3d-b530-9e47515ebe2a",
      "name": "High Priority Reminder Email",
      "webhookId": "ce6930ee-2f72-469b-9664-92c8c123e2e1",
      "credentials": {
        "gmailOAuth2": {
          "id": "9Rpb3KSeY5jaPu26",
          "name": "Alex Student Gmail"
        }
      }
    }
  ],
  "connections": {
    "When receiving an email": {
      "main": [
        [
          {
            "node": "Set First Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set First Name": {
      "main": [
        [
          {
            "node": "Category Agent",
            "type": "main",
            "index": 0
          }
        ]
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
    },
    "Simple Memory": {
      "ai_memory": [
        [
          {
            "node": "Category Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Reply to a message in Gmail": {
      "ai_tool": [
        [
          {
            "node": "Category Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Reply to a message in Gmail (CC)": {
      "ai_tool": [
        [
          {
            "node": "Category Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Append row": {
      "ai_tool": [
        [
          {
            "node": "Category Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Category Agent": {
      "main": [
        [
          {
            "node": "If high priority...",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "GPT-5.1": {
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
    "If high priority...": {
      "main": [
        [
          {
            "node": "High Priority Reminder Email",
            "type": "main",
            "index": 0
          }
        ],
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

---
### Step 1: Gmail Trigger

- **Add node:** `On App Event → Gmail → On message received`
	- Connect with your Gmail connection. Ideally, use an email that's not your personal one so that it does not respond to those ones.
	- `Poll Times`: By default, we can't let n8n listen constantly for emails. A "poll time" just tells us how often it checks if there are new emails. If multiple emails are received within that time, the workflow will run once for each email, which is exactly what we want.

Click `Execute Workflow` and send an email to the Gmail that you used for this node. Once you do so, you should see a large JSON object with many fields. Using your knowledge of JSON, you should be better able to parse this now! 

For ease of use, **pin the data in this node.** This means we don't need to keep sending emails to ourselves and can instead use the same email over and over for testing once we are sure that the first step is working properly.

---
### Step 2A: Edit Fields and Error Handling

To be able to respond more personably, we will extract the first name of the user. Note that this is perhaps not the best use case; for the sake of simplicity, we assume that people sending the email have one word first names, but we know that this doesn't hold in practice. It's easier (and more accurate) to simply give the AI Agent the full name of the user and let it determine what their first name is. 

To do this, we introduce a new node, called `Edit Fields (Set)`, which is extremely useful for defining information in a JSON format. We will also use this as an opportunity to practice dealing with errors in n8n.

- **Add node:** `Edit Fields (Set)`
	- Now that you know the basics of JSON, you can choose either mode! We will stick with `Manual Mapping` for this recitation.
- `Fields to Set`: Click `Add Field`. 
	- This will find the name of the person sending the email and takes the first word as the first name.
	- For name, put `firstName`. We are creating a new JSON key and then need to give it a value.
	- Next to the equality sign, put 
```JSON
	{{ $json.email }}
```

#### Exercises: 
1. Try to run this node. What happens when you try to do so? Does it run successfully?
2. Try to fix the error. What needs to change? Remember, you can use the AI Assistant to help you. Try to get this to run in any way without an error.

Spoilers ahead! Try to understand what is happening in this node before moving onto the next part.

---
### Step 2B: Fixing the Node

Note that we aren't really getting an error, but it's simply not doing what we want it to do. This is one of the trickiest parts of using n8n or other software; sometimes, things will run, but they are not functioning properly, and it is up to us to identify these cases. In this case, `firstName` is just given the value `null`.  We now fix this.

- **Add node:** `Edit Fields (Set)`
	- Now that you know the basics of JSON, you can choose either mode! We will stick with `Manual Mapping` for this recitation.
- `Fields to Set`: Click `Add Field`. 
	- This will find the name of the person sending the email and takes the first word as the first name.
	- For name, put `firstName`
	- Next to the equality sign, put 
```JSON
	{{ $json.from.value[0].name.trim().split(' ')[0] }}
```
		
- `Input Fields to Include`: If we want, we can pass the inputs directly to the output. This makes it easy to keep passing data through the nodes, even if we don't directly use it. For now, we choose `All`.
- **What it does:** The `Set` node lets us transform JSON objects. 

Now, when you are in the node, click `Execute Step`. This will only execute this node. In the output, you will see a lot of the key-value pairs from the input, as well as a new one called `firstName`.

---
### Step 3: Categorization Agent

We now add our AI agent, which has several responsibilities. Given an email, it needs to assign it a **category, corresponding teaching staff (professor, TA, IPCM),** and **urgency level.** It will then use its tools to send the email to the appropriate people and log the response in a Google Sheet.

Feel free to create this yourself, but we also will provide you with some code that you can copy and paste to get this node. This includes:

- The `AI Agent` node;
- The model (in our case, OpenAI);
- `Prompt (User Message)`, including the student's first name, the subject of the email, and the email itself;
- A `System Message` that explains the behavior of the agent and some general rules;
- `Simple Memory`, used in case the AI Agent needs to perform multiple actions.

```JSON
{
  "nodes": [
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('Set First Name').item.json.threadId }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        576,
        816
      ],
      "id": "bea54655-05e4-44ff-b09f-72e0f9b4d57d",
      "name": "Simple Memory"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Sender: {{ $json.firstName }}\nSubject: {{ $json.subject }}\nContent: {{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "You will receive an email sent from a student to the AIML901 teaching team at Kellogg. You are an AI agent named \"Kai Support\" that will help them and connect them to the team.\n\nYour goal is to use your tools to:\n- Reply to the email (choose content)\n- CC the correct team member to the email\n- Create a corresponding ticket in the teaching team's spreadsheet.\n\n# Categories\n\nYou will assign a category to use the Google Sheets tool. These categories are:\n\n- *administrative*: administrative question(s) or information  (e.g., when is the final exam; I cannot attend next class, etc..)\n- *content*: course content question(s) (e.g., what's an LLM?)\n- *n8n*: technical questions about n8n\n- *project*: question about the individual class project.\n- *other*: anything that is hard to relate to the other categories.\n\n# Tools\n\nYou have 3 tools available:\n\n- Append row allows you to log the email in Google Sheets.\n- Reply to a message in Gmail allows you to reply to the message without CCing a member of the teaching team.\n- Reply to a message in Gmail allows you to reply to the message while CCing a member of the teaching team.\n\n# Behavior\n\n- Always use the tools. You should respond to the student and also log your response using the Google Sheet tool.\n- Use the name \"Kai support\" to sign the email.\n- Adopt the tone of a cheerful PhD student TA\n- In addition to the information provided here, use the AIML-901 Docs tool to reference other information about the class.\n- You do not necessarily have enough information to help the student. When in doubt, always prefer to be sincere about what you know and what you don't. And if you don't, mention that the person you CCed will help. If you have the information necessary to respond to all of the student's questions, set confidence to TRUE and otherwise, set it to FALSE.\n\n# Teaching Team:\n- Sebastien Martin\n  - main instructor\n  - aiml901sebastienmartin+prof@gmail.com\n  - role: anything important or that cannot be directed to another team member, such as personal situations and complex questions\n- Alex Jensen\n  - TA\n  - aiml901sebastienmartin+ta@gmail.com\n  - role: anything relating to n8n, the final exam, and quick content questions\n- Gitanjali Jaggi\n  - In-person class moderator for Section 31\n  - gitanjali.jaggi@kellogg.northwestern.edu\n  - role: anything relating to attendance, seating, and classroom rules\n- Erika Guan\n  - In-person class moderator for Section 81\n  - erikaguanqing@gmail.com\n  - role: anything relating to attendance, seating, and classroom rules\n\n# Background information\n\n**Location:** KGH 1130  \n- **Lectures:** Tue/Fri  \n  - Sec. 31: 10:30–12  \n  - Sec. 32: 1:30–3  \n- **Recitations:** Wed  \n  - Sec. 31: 1:30–2:30  \n  - Sec. 32: 3:30–4:30  \n- **Office Hours:** Wed  \n  - Sec. 31 & 32: 2:30–3:30, 4:30–5  \n\n**Policy:** [Kellogg Honor Code](http://www.kellogg.northwestern.edu/policies/honor-code.aspx)\n\n---\n\n## Module 1: How AI Works\n*Build a deep understanding of genAI, from pretraining to agents.*\n\n- **Class 1 (Oct 21):** Build your first AI agent; intro to deliverables  \n- **Recitation 1 (Oct 22):** Build a Google Calendar agent (first n8n agent)  \n- **Class 2 (Oct 24):** Pretraining a large language model  \n- **Class 3 (Oct 28):** Post-training, alignment, and safety  \n- **Recitation 2 (Oct 29):** Build a customer service agent (n8n deep dive)  \n- **Class 4 (Oct 31):** AI agents, tools (RAG, etc.), usage  \n\n---\n\n## Module 2: What AI Can Do\n*AI tools, prompting, productivity, ecosystem.*\n\n- **Class 5 (Nov 4):** Prompting and leveraging AI  \n- **Recitation 3 (Nov 4–5, evening):** Build a personal assistant agent (advanced n8n)  \n- **Class 6 (Nov 5):** AI landscape and state-of-the-art companies  \n\n---\n\n## Module 3: From AI to Impact\n*Connecting AI to business outcomes.*\n\n- **Class 7 (Nov 7):** Evaluation pipelines  \n- **Class 8 (Nov 11):** AI strategy & risk management  \n- **Recitation 4 (Nov 12):** Build an evaluation mechanism (agent evaluation)  \n- **Class 9 (Nov 14):** Change management with AI case study  \n- **Class 10 (Nov 18):** Project showcase, final exam review, staying current  \n- **Recitation 5 (Nov 19):** End-to-end product creation (Lovable, apps/websites)  \n\n---\n\n## Deliverables\n- **Weekly Homework:** AI-powered, delivered by *Kai* (<30 min each)  \n- **Project:** Individual, due Nov 25 (early submissions allowed)  \n- **Final Exam:** Online, self-serve (Nov 21–25), 1h30, focused on n8n recitations"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        672,
        528
      ],
      "id": "0e3b673d-81ae-42ff-b597-66304c61d4f5",
      "name": "Category Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.1",
          "mode": "list",
          "cachedResultName": "gpt-5.1"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        448,
        784
      ],
      "id": "fa0c841a-6e64-46e8-b505-6f0ae73d633f",
      "name": "GPT-5.1",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    }
  ],
  "connections": {
    "Simple Memory": {
      "ai_memory": [
        [
          {
            "node": "Category Agent",
            "type": "ai_memory",
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
    "GPT-5.1": {
      "ai_languageModel": [
        [
          {
            "node": "Category Agent",
            "type": "ai_languageModel",
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

---
### Step 4: Gmail Tools

Now, we need to give our agent the power to send emails, both CCing the teaching team and not. Due to how n8n is built, we actually will create two separate tools to handle this, with just one different step between the two tools:

- **Add node:** Click the `+` for Tool under the AI Agent node and choose `Gmail`.
	- Create a credential for your Gmail.
- `Tool Description` gives the agent more information on how to use this tool. In our case, we choose `Set Manually` and should say which tool this is. For example, for the tool where we do not want to CC anyone, we might say, "Reply to a message in Gmail without CCing anyone" while for the tool that CCs the teaching team, we might say, "Reply to a message in Gmail while CCing a member of the teaching team."
- `Resource`: We will choose `Thread`. This lets us respond directly to an email, as opposed to sending a new email not in a thread.
- `Operation`: Choose `Reply` to have it send an email.
- `Thread ID`: This tells the agent which email to respond to.
```JSON
{{ $('Set First Name').item.json.threadId }}
```
- `Message Snippet or ID`: This tells the agent which message in particular within the thread to respond to.
```JSON
{{ $('Set First Name').item.json.id }}
```
- `Email Type`: We are not sending a very formatted email with pictures, so we choose Text as opposed to HTML.
- `Message`: Press the stars to the right of the box. This lets our agent decide what to put as the message of the email.
- For the Gmail tool with CCing: Press `Add option → CC` and then press the stars to the right of the box to let the agent decide whom to CC.

You should now have two separate Gmail tools, giving your agent the power to send emails! 

> [!info] Note
> In practice, we need to be careful about what we allow our LLM to do, since a lack of alignment with our vision can lead to unintended consequences. In future recitations, we will discuss **evaluation**, which is how we test if our agent is performing well.

---
### Step 5: Google Sheet Tool

Now, we will log responses in a Google Sheet in case we need to refer back to the emails. This isn't strictly necessary but is useful when we want to test how well the agent is performing its task.

First, make a Google Sheet with the following column titles:

| Student | Assigned Teaching Staff | Category | Email Description |
| ------- | ----------------------- | -------- | ----------------- |
|         |                         |          |                   |
Back in n8n:
- **Add node:** Click the `+` for Tool under the AI Agent node and choose `Google Sheets Tool`.
	- Create a credential for your Google Sheets.`
- `Operation`: We choose `Append Row` to add rows to the sheet. Each response will add one new row to the spreadsheet.
- `Document`: whatever you call the Google Sheets file
- `Sheet`: the correct sheet within the document
- `Mapping Column Mode`: Map Each Column Manually
- For the four columns, press the stars to the right of the text box in order to have the agent automatically fill in these fields.

---

### Step 6: Output Parser

We will add an `Output Parser`, which we will not discuss in depth yet. This is a tool that says that the output of the AI Agent needs to have a specific format. In our case, this ensures that we always have the output structure that we want.

- In the `AI Agent`, click `Require Specific Output Format`. If you exit the node, you will see a new option on the bottom of the node next to `Tool` called `Output Parser`.
- Click on the `+` for `Output Parser` and choose `Structured Output Parser`.
- For `Schema Type`, we could use a JSON example, but we will use `Define using JSON Schema`.
- For the `Input Schema`, copy and paste in the following code:
```JSON
{
  "type": "object",
  "required": [
    "response_content",
    "response_cc",
    "ticket_description",
    "ticket_category",
    "ticket_cc",
    "ticket_priority",
    "ticket_name",
    "confidence"
  ],
  "additionalProperties": false,
  "properties": {
    "response_content": {
      "type": "string",
      "description": "Formatted like a complete email content (e.g., starts with hi and ends with signature)."
    },
    "response_cc": {
      "type": "string",
      "description": "The email address of the person to CC. Nothing else."
    },
    "ticket_description": {
      "type": "string",
      "description": "Just one sentence, to the point."
    },
    "ticket_category": {
      "type": "string",
      "enum": ["administrative", "content", "n8n", "project", "other"],
      "description": "One of the allowed categories."
    },
    "ticket_cc": {
      "type": "string",
      "description": "The full name of the person corresponding to the CCed email address."
    },
    "ticket_name": {
      "type": "string",
      "description": "Name of the student; if unknown, their email."
    },
    "ticket_priority": {
      "type": "string",
      "description": "Priority label (e.g., low/medium/high)."
    },
    "confidence": {
      "type": "boolean",
      "description": "Model's confidence in the category/route; true if the answer to all of the questions is known and false otherwise."
    }
  }
}
```

You can see that this is just JSON! It tells us that we want to include information such as a brief description of the email, whom should be CCed, a category for the email, a priority level. Feel free to explore this further.

Now, try running the AI agent. Looking at the key called `required`, you will see a list of words (response_content, response_cc, etc.) that are exactly the keys in the output. For now, let's pin the output. This means that we don't have to send another call to the OpenAI API. Note that we see the keys from the output parser, but they are an object called `output`. Therefore, if we want to retrieve the `response_content`, we would need to write

```JSON
{{ $json.output.response_content }}
```

> [!info] Note
> Output parsers can look intimidating, but we can actually use ChatGPT or another LLM to write these very easily! For example, you could say, "I want a JSON schema for an output parser that includes a key called ticket_priority that is low, medium, or high and another key called ticket_description which is just a sentence." 

---
### Step 7: Routing with an Error

While the agent determines whether or not a member of the teaching team needs to be CCed, some emails are more time-sensitive than others. The Category Agent gives us a **priority level** (ticket_priority), indicating how urgent the message is. Perhaps we want to send an extra reminder to the associated member of the teaching team when the email is high priority. To do this, we want to send this message **conditionally**, which can be done using the `If` node.

> [!info] Note
> We will originally set this up slightly incorrectly to demonstrate an error. Make sure to follow Step 8 after this to fix it!

- **Add node:** `If`
    - For value1, input the priority assigned by the Category Agent:
    ```JSON
    {{ $json.output.ticket_priority }}
    ```
    - Click the dropdown next to “is equal to”. Choose `Boolean` and then `is true`.
 - **What it does:** If the ticket is high priority, then we will take the True branch. Otherwise, we take the False branch.
- **Why this matters:** This allows us to execute different paths depending on the priority of the ticket. In our case, we only want to CC the teaching team if deemed necessary, and this lets us distinguish between the two cases. 

#### Exercise:
1. Try to run the workflow. Where do you see an error?
2. Try to fix the error. Try to do it yourself, but remember that the AI Assistant can help you as well.

Now, we'll fix this error.

---
### Step 8: Fixing Routing

You should see an error along the lines of "Wrong type: 'low' is a string but was expecting a boolean." A boolean is a value that is either True or False. In our case, `ticket_priority` will be low, medium, or high, causing this to break!

- Click the dropdown next to “is equal to”. Choose `String` and then “is greater than or equal to”
    - For value2, put `high`. This means that our condition is True if the message is high priority and False otherwise.

---
### Exercises

1. Run the `If` node. Was the previous email considered high priority?
2. If you click on `Add condition`, we can add other conditions to help determine which path should be taken. Add a condition saying that if the `ticket_category` is "other", the teaching team should be CCed, regardless of the priority level.
3. Looking back at the AI agent, we can see that one of the outputs (and one of the inputs to the `If` node) was `confidence`. This will be either "True" or "False" and indicates whether the AI thinks it is able to accurately respond to the email. Add a condition that if confidence is False, the teaching team should be CCed, regardless of the priority level. (Note: you will need to click on the box that says "Is equal to" and choose `Boolean → Is True`)
4. Add your own custom condition! Note that we have other information available from the AI agent. 

---
### Step 9: Email Reminder

Now, we need to create a reminder for the teaching team. For the sake of simplicity, we will also use email here, but in practice, we could use something like Telegram (see [Recitation 1](https://sebastienmartin.info/aiml901/recitation_1.html)) to notify the teaching team on multiple platforms.

- **Add node:** `Gmail → Send a message`
- `To`: we want to send this to the correct member of the team
```JSON
{{ $('Category Agent').item.json.output.response_cc }}
```
- For the subject line and message, you can customize these; we just want a simple reminder, like "There is an urgent email requiring your attention." We could make this more specific, as well.
- Connect this to the `true` output from the If node.
- **What it does:** This sends an email to a member of the teaching team. Note that this is slightly different from the Gmail tools that we attached directly to the AI Agent. The AI is able to decide how many emails to send and when to send them, but this node will always run when it is reached.
---
### Exercises:

1. What would we change if we want to also send the extra reminder email if the AI Agent is not confident in its response? Implement this in n8n.
2. Let's say we only want to add tickets to the sheet if the teaching team is not CCed. What would we change?
3. We would like to know if the ticket is handled by a human or AI. Add a column to your Google Sheets called Handled By and have it fill in as “Human” if the teaching team was CCed and “AI” if it was not.
4. For transparency, maybe we want Professor Martin to be CCed on any email where other members of the teaching team are also CCed. However, there can also be emails where just Professor Martin is CCed. What would we need to change here? 
5. We do not give the Category Agent much information about how it should decide how confident it is in its response. In fact, it is possible that it could decide that it should never (or always) CC the teaching team. Try sending several emails with different issues to see how it handles this. Are there any guidelines we can add to ensure how well we do this?
   
   **Challenge:** This question goes along with Question 1. Try changing the content of the output parser so instead of giving True or False for the confidence parameter, it gives a number between 1 and 5. The easiest way to do this is to give the JSON in the output parser to ChatGPT and ask it to modify it; it is generally quite good at this. What else needs to change in the workflow?

---
### For the Homework:

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
        0,
        1280
      ],
      "id": "9a451388-a915-4878-a812-887f460ab3da",
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
        48,
        1488
      ],
      "id": "99c2d48c-f7a3-448b-9c93-57613df597db",
      "name": "Default Data Loader"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.embeddingsOpenAi",
      "typeVersion": 1.2,
      "position": [
        256,
        1488
      ],
      "id": "07f70d48-cfc8-405c-bd4d-9754b9dab713",
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
        432,
        1280
      ],
      "id": "b8c19147-fd2d-459e-a5b4-5ae3490c449d",
      "name": "AIML 901 Docs"
    },
    {
      "parameters": {
        "content": "## Exploratory Content: RAG",
        "height": 400,
        "width": 1184,
        "color": 3
      },
      "type": "n8n-nodes-base.stickyNote",
      "position": [
        -304,
        1216
      ],
      "typeVersion": 1,
      "id": "e76859d4-0618-4494-a216-b5b47b2ddd34",
      "name": "Sticky Note"
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

### Default Data Loader

This node decides how to load data into the vector store. Specifically, we need to split the data from the documents into chunks, which are each stored as a separate vector. This is responsible for determining what type of data is being loaded in and how it is split, but we still need to determine how to make the vectors from this chunked data.

### Embeddings OpenAI

There are many ways to create these vectors, also known as **embedding the text.** OpenAI provides different embedding schema, which create the vectors that we store. This also can be used to determine the meanings of the vectors, which we need when we retrieve the data in the next step.

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

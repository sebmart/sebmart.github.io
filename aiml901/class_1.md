---
title: "Class 1: Let's get building!"
author:
  - Sébastien Martin
---
## What you already prepared

- An OpenAI API key (it's like a password for your OpenAI account).
- A Google Account.
- Having signed up to [the course's n8n account](https://aiml901-martin.app.n8n.cloud/). 

If you've not done it yet, [instructions are available here](https://sebastienmartin.info/aiml901/n8n_access_instructions.html).

---
## What's needed for today

- Copy the following code below into a new n8n workflow:
```json
{
  "nodes": [
    {
      "parameters": {
        "pollTimes": {
          "item": [
            {
              "mode": "everyMinute"
            },
            {}
          ]
        },
        "simple": false,
        "filters": {},
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1.3,
      "position": [
        816,
        672
      ],
      "id": "edd26635-315b-4345-8d7e-070f248039e1",
      "name": "When receiving an email"
    },
    {
      "parameters": {
        "resource": "thread",
        "operation": "reply",
        "threadId": "={{ $('When receiving an email').item.json.threadId }}",
        "messageId": "={{ $('When receiving an email').item.json.threadId }}",
        "message": "={{ $json.output.response_content }}",
        "options": {
          "ccList": "={{ $json.output.response_cc }}"
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1392,
        576
      ],
      "id": "cf4a44d8-4e5d-431f-b47b-deb338cf5337",
      "name": "reply to the email",
      "webhookId": "9694af38-894a-4c7b-9e1e-bb465bdce757"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"response_content\", \"ticket_description\", \"ticket_category\", \"ticket_cc\", \"ticket_priority\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"response_content\": {\n      \"type\": \"string\",\n      \"description\": \"Formatted like a complete email content (e.g., ends with signature).\"\n    },\n    \"ticket_description\": {\n      \"type\": \"string\",\n      \"description\": \"Just one sentence, to the point.\"\n    },\n    \"ticket_category\": {\n      \"type\": \"string\",\n      \"description\": \"Match exactly the keyword of one of the categories described in your instructions\"\n    },\n    \"ticket_cc\": {\n      \"type\": \"string\",\n      \"description\": \"The full name of the person that should handle the ticket.\"\n    },\n    \"ticket_name\": {\n      \"type\": \"string\",\n      \"description\": \"Name of the student. If you don't know, their email\"\n    }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1216,
        896
      ],
      "id": "3be36cf2-b8d9-443f-b30f-3ad7c8a1282a",
      "name": "agent decision format"
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "193WT2rdO1QxUzxMV1RBs0oYcnwsAJmdfym5Gk7bLn7Y",
          "mode": "list",
          "cachedResultName": "Email tickets",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/193WT2rdO1QxUzxMV1RBs0oYcnwsAJmdfym5Gk7bLn7Y/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/193WT2rdO1QxUzxMV1RBs0oYcnwsAJmdfym5Gk7bLn7Y/edit#gid=0"
        },
        "columns": {
          "mappingMode": "autoMapInputData",
          "value": {},
          "matchingColumns": [],
          "schema": [
            {
              "id": "student_name",
              "displayName": "student_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "ticket_owner",
              "displayName": "ticket_owner",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "ticket_category",
              "displayName": "ticket_category",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "ticket_description",
              "displayName": "ticket_description",
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
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        1616,
        768
      ],
      "id": "53cb4298-6c2c-4dcf-88bd-e879344823c6",
      "name": "Add ticket to table"
    },
    {
      "parameters": {
        "content": "### Setup (1/4): make the agent receive emails\n\n1. **Click** on the `When receiving an email` node to the right (the envelope icon).\n2. Make sure you have a **Google account** that you want to use for this course (see Kai homework). You can use your personal one or create a new one (recommended).\n3. Set your **Gmail credentials** with the Google account you want to use for this course, using the `Credential to connect with` dropdown and then \"Create new credential\" if you don't have it already. Google will ask you for permission: say yes. Make sure the\n4. Verify that your new credential is now selected in the `Credential to connect with` dropdown\n ",
        "height": 368,
        "width": 480
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        272,
        592
      ],
      "id": "64fd7f37-65b7-40a1-ae2d-f7f6fb2bc911",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "content": "### Setup (2/4): the agent can reply to emails\n\nGive the agent the ability to reply to emails.\n\n- Do the same thing as **step 1/4** with the node to the left (`reply to the email`). \n- You should not have to create new credentials this time. Use the same gmail credential you previously created",
        "height": 192,
        "width": 432
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        1600,
        528
      ],
      "id": "4760228d-b0c9-4e16-8e9b-539f82d74453",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "content": "### Setup (3/4): the agent can add tickets to a Google Sheet\n\nGive the agent the ability to edit a Google Spreadsheet.\n\n1. Do the same thing as step 1/4 with the node `Add ticket to table` to the left. That is, create a new **Google Sheet credential** using the same Google Account (repeat the Google login/verification process).\n2. Once you have set `Credential to connect with`, we will now guide the agent to the correct spreadsheet.\n3. Follow [the instructions](https://sebastienmartin.info/aiml901/class_1.html) (at the end of the page) to create a spreadsheet in your google account.\n4. Going back to the node, click on the dropdown next to `Document`. Your copy of the spreadsheet should appear there. Select it.\n5. In the following dropdown (`Sheet`), select the only sheet available.\n6. In \"Mapping Column Mode\", set \"mapping automatically\"\n7. That's it! The agent can now edit the ticket list :tada:\n",
        "height": 432,
        "width": 432
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        1808,
        800
      ],
      "id": "1886ac00-eebb-45d6-89a6-380fa65c2bc7",
      "name": "Sticky Note2"
    },
    {
      "parameters": {
        "content": "### How to use the Agent (1/2)\n\nFirst go through the yellow \"Setup\" boxes to connect everything.\n\nFor today, we will trigger the agent manually to test it. The agent can automatically reply to emails, but we don't need this for today.\n\nTo use the agent:\n\n1. Send an email from any email account you want to the Gmail address of the Google account you connected to the agent. The email should be a question/comment to the teaching team of AIML901.\n2. Wait a few seconds to make sure it has been sent (you can also double-check that it has been received by opening Gmail).\n3. Click on `Execute Workflow`, the big orange/red button at the bottom of the page.\n4. Observe the agent working.\n5. Once you see that `reply to the email` and `add ticket to table` have been completed, feel free to open the email thread to see the agent response, and the `ticket list` sheet to see the new entry!\n\n\n\n\n",
        "height": 416,
        "width": 432,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        672,
        0
      ],
      "id": "2510897a-2bc5-42d7-864e-19860cbed3a4",
      "name": "Sticky Note3"
    },
    {
      "parameters": {
        "content": "### How to use the Agent once set (2/2)\n\nThis is your own agent! Try to modify its behavior. To do so, click on the `AI Agent` node, and edit the (long) text field `System Message` at the bottom.\n\n\n\n\n",
        "height": 144,
        "width": 432,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        1136,
        0
      ],
      "id": "879b6652-99e8-403e-b646-5626a22fd955",
      "name": "Sticky Note4"
    },
    {
      "parameters": {
        "content": "### Setup (4/4): Give the agent a brain\n\nWe will use OpenAI API to power our agent\n1. First, make sure you have created the OpenAI API key you will use in this course (see homework). This is a long string of characters that should only be known to you.\n2. Click on the node `OpenAI LLM` right above (the OpenAI logo).\n3. You will now create the **OpenAI credential** you will use throughout the course. This is similar to the Google credential. First, click on the `Credential to connect with` dropdown.\n4. Create a **new credential**: the only thing you have to fill is `API Key` with the one you previously created.\n5. Now you can choose your model in the `Model` dropdown. I recommend `GPT5-Mini` if you have access to it.\n6. You now have a working agent! :robot:",
        "height": 416,
        "width": 432
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        832,
        1120
      ],
      "id": "82053ba4-e772-4c50-82bd-04233e312d41",
      "name": "Sticky Note5"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5",
          "mode": "list",
          "cachedResultName": "gpt-5"
        },
        "options": {
          "reasoningEffort": "low"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        992,
        896
      ],
      "id": "9215e28c-01ad-4455-8d1b-951f443bad4a",
      "name": "OpenAI LLM"
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Lecture 1 - Let's get building!",
        "height": 464,
        "width": 576
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        0,
        0
      ],
      "id": "b89385d0-beaf-4f8f-a9a8-44ba57db0e55",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "187b00a1-41c4-4d68-85e0-ad3d41b74a3f",
              "name": "student_name",
              "value": "={{ $('When receiving an email').item.json.from.value[0].name }} ({{ $('When receiving an email').item.json.from.value[0].address }})",
              "type": "string"
            },
            {
              "id": "2fe030a8-98ea-479e-b599-23c92bf31eba",
              "name": "ticket_owner",
              "value": "={{ $json.output.ticket_cc }}",
              "type": "string"
            },
            {
              "id": "7d929c1c-a76e-4850-af4e-83aef67fb28c",
              "name": "ticket_description",
              "value": "={{ $json.output.ticket_description }}",
              "type": "string"
            },
            {
              "id": "522060d6-38cb-4aa5-ac3c-dec394ef4876",
              "name": "ticket_category",
              "value": "={{ $json.output.ticket_category }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1392,
        768
      ],
      "id": "d1d3479b-bd9f-4684-ac72-e7e61b27a429",
      "name": "ticket content"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Sender: {{ $json.headers.from }}\nSubject: {{ $json.headers.subject }}\nContent: {{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "You will receive an email sent from a student to the AIML901 teaching team at Kellogg. You are an AI agent named \"Kai Support\" that will help them and connect them to the team.\n\nYour goal is to:\n- Reply to the email (choose title and content)\n- Create a corresponding ticket in the teaching team's spreadsheet, and assign it to a specific team member.\n\n# Categories\n\n- *administrative*: administrative question(s) or information  (e.g., when is the final exam; I cannot attend next class, etc..)\n- *content*: course content question(s) (e.g., what's an LLM?)\n- *n8n*: technical questions about n8n\n- *project*: question about the individual class project.\n- *other*: anything that is hard to relate to the other categories.\n\n# Behavior\n\n- Use the name \"Kai support\" to sign the email (do not pretend that you're not an AI).\n- Adopt the tone of a cheerful PhD student TA\n- You do not necessarily have enough information to help the student. When in doubt, always prefer to be sincere about what you know and what you don't. And if you don't, mention that you contacted a staff member for help, and share who it is (the name on the ticket).\n\n# Teaching Team:\n- Sebastien Martin\n  - main instructor\n  - aiml901sebastienmartin+prof@gmail.com\n  - role: anything important or that cannot be directed to another team member, such as personal situations and complex questions\n- Alex Jensen\n  - TA\n  - aiml901sebastienmartin+ta@gmail.com\n  - role: anything relating to n8n, the final exam, and quick content questions\n- Jillian Law\n  - In-person class moderator\n  - JillianLaw2024@u.northwestern.edu\n  - role: anything relating to attendance, seating, and classroom rules\n\n# Background information about the course\n\n## Overview\n\nAIML901-OP: \"AI Foundations for Managers - AgentOps\" is a hands-on, five-week Kellogg course focused on **generative and agentic AI**, that serves as an introduction to AI for managers. Students gain practical experience developing AI workflows with **n8n**, develop a deep understanding of the underlying genAI technology, and learn to leverage this technology to create _real_ business value.\n\n---\n\n## Course Features\n- **State-of-the-Art:** Focus on latest developments in generative and agentic AI.  \n- **Hands-On:** Core deliverable is an AI project; most lectures include practical activities.  \n- **n8n Platform:** Use n8n to build, automate, and explore agentic workflows—no coding required.  \n- **Future-Focused:** Provides foundation for staying current with evolving AI.  \n- **AI-Supported Learning:** Includes AI homework, assistants, and case studies.\n\n---\n\n## Positioning Within AIML-901\n\nAll AIML-901 courses  (including this one) cover:\n- AI/ML history and basics  \n- Generative AI  \n- Ethics, fairness, governance, future outlook  \n- Business applications and managerial roles  \n\nThis version is taught in a **Lab** format, uniquely **hands-on** and particularly focuses on **building agentic AI** products to create operational value.  \nStudents learn:\n- To **build AI agents**  \n- To **understand generative AI tech**  \n- To **design AI workflows that add value**  \n\nOther AIML-901 versions are complementary and recommended for broader perspectives.\n\n---\n\n## Prerequisites\nNo technical or coding prerequisites. Open to all students. Course is fast-paced and challenging but accessible.\n\n---\n\n# Deliverables and Expectations\n\n## Recitations\n- Five 60-min **hands-on sessions** led by TA on building AI agents in **n8n**.  \n- Focus: business use cases, progressively complex workflows.  \n- **Attendance:** Optional but strongly encouraged (exam covers recitation content).  \n- **Recordings available** for all sessions.\n\n---\n\n## Individual Project\n\nDesign a process using **agentic AI** to solve a **well-defined, meaningful task**. The goal is not only to build a prototype but to **demonstrate the value of AI** in your chosen setting. Choose an ambitious, personally meaningful topic.\n\n### Application Examples\n\nPropose an AI use case that benefits an organization you know or supports a startup idea.\n\nExamples:\n1. AI-generated daily investment-relevant news summaries.\n2. Automated medical record updates from doctor/patient recordings.\n3. Personal email agent for summarization, drafting replies, and task follow-up.\n4. Course recommendation system for Kellogg students.\n5. Automated consultant expense coordination and tracking.\n6. Insurance letter generation from medical and police reports.\n### Deliverable\n\n**Pitch video (main deliverable, due end of exam week):**\n- **8 minutes**, addressed to stakeholders or investors.\n- Must include:\n  - Problem explanation.\n  - How AI is leveraged.\n  - Live demo of prototype (MVP) using **n8n**.\n  - Live demo of **evaluation process MVP**.\n  - Discussion of practical value, implementation path, risks, and change management.\n\nSubmit:\n- **Pitch video**\n- **Working n8n workflow + evaluation pipeline**\n\n### Rubric\n\n| **Category**         | **Description**                                                                                                                                                                                                                                                                                      | **Weight** |\n| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |\n| **Potential for impact** | AI applied to a meaningful, well-scoped, and original problem you understand deeply. Integration into the organization clearly explained.                                                                                                               | 40% |\n| **Prototype** | Working **n8n** + AI API prototype with a functional evaluation pipeline. MVP-level complexity acceptable. Should show thoughtful iteration and be runnable by the teaching team.                                                                                 | 40% |\n| **Presentation** | Engaging and creative 8-minute pitch. | 20% |\n\n### Timeline / Milestones\n\n| **Week**  | **Goal** |\n| --------- | -------- |\n| 1 | Rough idea: features, target audience, problem. |\n| 2 | Begin n8n implementation, identify added features. |\n| 3 | Continue iteration. |\n| 4 | Build evaluation pipeline and iterate. |\n| 5 | Refine implementation, impact, and risks. |\n| Exam week | Finalize and refine video presentation. |\n\n### Getting Help\n\n- **Recitations**: n8n and related tools.\n- **Office hours**: every Wednesday.\n- **Homework**: project check-ins.\n- **Kai (AI assistant)**: project guidance.\n- **Slack**: peer support.\n### Advice and Rules\n\n- **Less is more** — simple, well-scoped ideas outperform complex ones.\n- **Application quality > AI complexity.**\n- **Focus on domains you know personally.**\n- **Ambition encouraged** — contact real stakeholders if possible.\n- **Start early** — iteration is key.\n\n### Collaboration Rules\n- You may collaborate (max **3 people**), but:\n  - Each student must submit an **individual video** and be **graded separately**.\n  - Each must present and demo a **distinct prototype/evaluation MVP**.\n  - Combined effort should scale with group size.\n\n### Video Requirements\n- Length: **7–8m15s** for full credit.\n- Use **Zoom** to record yourself and share your screen at the same time.\n\n\n---\n\n## Final Exam\n\n- Virtual, open-book, 1.5 hours.  \n- Practical exercises using n8n to build AI agents.  \n- Focuses on recitation material and applied skills.\n- The difficulty is set so that everyone who completed the recitations and understood them will get all points. This exam is just a check that you did learn how to use n8n.\n\n---\n\n## Homework (\"Kai Homework\")\n- Conversational prep assignments with AI TA (Kai) before each class (~30 min).  \n- **Graded on effort**, not accuracy.  \n- Opens after each class; due the evening before the next (so that the team has time to review them before class).  \n- Supports upcoming class content.  \nSee [[kai_instructions|Kai instructions]] for details.\n\n---\n\n## Combined Grade Breakdown\n- 50% Individual project  \n- 25% Final exam  \n- 25% Participation (attendance, engagement, homework effort)\n\nKellogg sets an upper limit of 60% As across the sections. Most students should have full grade at the final exam, therefore the participation and project grades matter significantly.\n\n---\n\n## Attendance and Participation\n- Voluntary participation + occasional warm calling.  \n- On-time attendance expected; one free unexcused absence.  \n- Three unexcused absences may result in failure per Kellogg policy.  \n- Health-related absences excused via Academic Experience form.\n\n---\n\n## AI Policy\nAI use is encouraged. Understand the tools—don’t use them as black boxes.\n\n---\n\n## Classroom Etiquette & Honor Code\nFollow [Kellogg Honor Code](https://www.kellogg.northwestern.edu/the-experience/policies/honor-code/) and [Classroom Etiquette](https://www.kellogg.northwestern.edu/policies/etiquette.aspx).\n\nDo not:\n1. Cross-talk  \n2. Arrive late/leave unnecessarily  \n3. Use devices outside designated times  \n   - Tablets allowed flat for notes  \n   - Laptops only during hands-on sessions  \n4. Engage in disruptive behavior\n\n---\n\n## Software, Tools, and Costs\n| Tool | Cost | Notes |\n|------|------|-------|\n| ChatGPT/Claude/Gemini | Recommended | ChatGPT Plus suggested |\n| **n8n** | Free | Sponsored |\n| **Lovable** | Free (1 month) | Sponsored |\n| **Kai (AI TA)** | Free | Covered by Kellogg |\n| **OpenAI API** | ~$10 total | Required for AI agent builds |\n\n- - **Kai interface:**\n\t- Kai is GPT5 + a long system message, that's it!\n\t- Kai is tuned to be accurate but \"slow\", as it uses a GPT-5 model with reasoning, which can take a few seconds.\n\t- Kai is accessed through the [NOYES AI platform](platform.noyesai.com), which was created by prof. Martin to support learning. \n\n\n---\n\n## Quarter-specific details\n\nThis Fall quarter, we have two full time sections:\n- **Section 31:** lectures at 10:30 am-12 pm in KGH 1130 on Tuesday/Friday, and recitations at 1:30 pm - 2:30 pm on Wednesday in KGH 1130\n- **Section 32:** lectures at 1:30 pm- 3 pm in KGH 1130 on Tuesday/Friday, and recitations at 3:30 pm - 4:30 pm on Wednesday in KGH 1130\n\n- The instructor handles the lectures and the TA handles the recitations, but both are present for both. \n- Students can ask to attend the lecture or recitation of the other section, but our classroom is full, so they should swap with another student to make sure there is room for them (e.g., on Slack).\n- **Office hours** are **in person** around the recitation times in KGH 1130: 2:30 - 3:30 pm and 4:30 - 5:00 pm, with the TA and/or the instructor. It's a good time to ask for project feedback!\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1040,
        672
      ],
      "id": "3241930c-1e42-4007-b56d-d852d9008e2b",
      "name": "AI Agent"
    }
  ],
  "connections": {
    "When receiving an email": {
      "main": [
        [
          {
            "node": "AI Agent",
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
            "node": "AI Agent",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI LLM": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "ticket content": {
      "main": [
        [
          {
            "node": "Add ticket to table",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "reply to the email",
            "type": "main",
            "index": 0
          },
          {
            "node": "ticket content",
            "type": "main",
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
- Create an empty Google Sheet in your Google account. Name it something like "Class 1 - Email Agent". **Copy the following column headers into the first row of the spreadsheet**

| student_name | ticket_owner | ticket_category | ticket_description |
| ------------ | ------------ | --------------- | ------------------ |
|              |              |                 |                    |


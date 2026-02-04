---
title: Recitation 5
author: Alex Jensen
---
Today, we continue with our exploration of the Proxima Health Systems case. We have talked about creating an agent to help with CRM, follow-up emails, or other aspects of the workflow. In this recitation we explore this further. What would an agent for this process look like? How do we know that it is "doing a good job?" It's our job to come up with a way to understand how well the agent is performing and optimize it as much as possible.

---
## You'll Need...

- Google Sheets connection
- OpenAI connection
- CRM spreadsheet with columns **account_name, contact, type, summary, needs, products,** and **next_steps**. You can make a copy of it [here](https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/copy).
- Expense evaluation spreadsheet that you can [copy from here](https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/copy).

---
## Learning Objectives

- Understand how to build an evaluation pipeline in n8n
- Decide between different choices of metrics

---
# Exercise

We will actually start by brainstorming how we would do this. What sort of input would we want to process? What would a good output look like? Thinking about these ideas will inform the structure of our agent, as well as what we will test for in evaluation.

---
# Part 1: Proxima Health Agent

We will start with the expense agent itself. Copy and paste the following code into a new workflow:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "formTitle": "Client conversation transcript",
        "formDescription": "Upload the recording of the customer interaction, or directly upload the transcript.",
        "formFields": {
          "values": [
            {
              "fieldLabel": "Audio recording",
              "fieldType": "file",
              "multipleFiles": false,
              "acceptFileTypes": ".flac, .mp3, .mp4, .mpeg, .mpga, .m4a, .ogg, .wav, .webm"
            },
            {
              "fieldLabel": "If no audio, directly copy the transcript"
            }
          ]
        },
        "options": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.formTrigger",
      "typeVersion": 2.3,
      "position": [
        -144,
        656
      ],
      "id": "4841881c-982d-4cc4-a175-912d5fc5fff1",
      "name": "Upload audio or transcript",
      "webhookId": "e98e13f8-6154-497a-8fb1-dffc65bc72ad"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "leftValue": "={{ $json['Audio recording'].size }}",
                    "rightValue": 0,
                    "operator": {
                      "type": "number",
                      "operation": "gt"
                    },
                    "id": "3f164f0c-56f0-4d4b-83a4-ce557f107d13"
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "if audio"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "id": "6c74856b-96be-415f-a1e7-e4054d602e78",
                    "leftValue": "={{ $json['If no audio, directly copy the transcript'] }}",
                    "rightValue": "",
                    "operator": {
                      "type": "string",
                      "operation": "notEmpty",
                      "singleValue": true
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "if transcript"
            }
          ]
        },
        "options": {
          "fallbackOutput": "extra",
          "renameFallbackOutput": "if nothing"
        }
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.3,
      "position": [
        48,
        640
      ],
      "id": "befdb855-2313-46c2-beb5-071bb6f8e9e7",
      "name": "Detect input type"
    },
    {
      "parameters": {
        "resource": "audio",
        "operation": "transcribe",
        "binaryPropertyName": "Audio_recording",
        "options": {
          "language": "en"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.8,
      "position": [
        368,
        464
      ],
      "id": "e2192fe1-6d24-4520-b0fa-e8b6fd73bedc",
      "name": "Transcribe audio of visit",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "operation": "completion",
        "completionTitle": "Missing information!",
        "completionMessage": "You did not submit a recording or a transcript!",
        "options": {}
      },
      "type": "n8n-nodes-base.form",
      "typeVersion": 2.3,
      "position": [
        208,
        832
      ],
      "id": "0a1b1cef-8aa7-4949-b2ab-3380b818b27e",
      "name": "Error: nothing was uploaded!",
      "webhookId": "486ab396-07f9-41b2-8f47-2988208ad6aa"
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
        688,
        784
      ],
      "id": "8d828a36-e3d4-43a2-b9bc-c6b10e46ffb2",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"$schema\": \"https://json-schema.org/draft/2020-12/schema\",\n  \"title\": \"AfterVisit AI Output (Flat Simplified)\",\n  \"type\": \"object\",\n  \"description\": \"Flat, no-nesting schema for teaching and evaluation.\",\n  \"required\": [\n    \"account_name\",\n    \"contact\",\n    \"type\",\n    \"summary\",\n    \"needs\",\n    \"products\",\n    \"next_steps\",\n    \"follow_up_email_subject\",\n    \"follow_up_email_body_text\"\n  ],\n  \"properties\": {\n    \"account_name\": {\n      \"type\": \"string\",\n      \"description\": \"Account (hospital/clinic) name.\"\n    },\n    \"contact\": {\n      \"type\": \"string\",\n      \"description\": \"Primary customer attendee full name (single string).\"\n    },\n    \"type\": {\n      \"type\": \"string\",\n      \"enum\": [\"onsite\", \"virtual\", \"phone\"],\n      \"description\": \"Interaction type.\"\n    },\n    \"summary\": {\n      \"type\": \"string\",\n      \"description\": \"Short paragraph of what was discussed.\"\n    },\n    \"needs\": {\n      \"type\": \"string\",\n      \"description\": \"Bullet-style plain text list of customer needs or pain points (one per line, prefixed with '- ').\"\n    },\n    \"products\": {\n      \"type\": \"string\",\n      \"description\": \"Single primary product category for the meeting.\",\n      \"enum\": [\n        \"capital_equipment\",\n        \"diagnostics\",\n        \"consumables\",\n        \"services\",\n        \"digital_ops\"\n      ]\n    },\n    \"next_steps\": {\n      \"type\": \"string\",\n      \"description\": \"Bullet-style plain text list of follow-up actions (one per line, prefixed with '- ').\"\n    },\n    \"follow_up_email_subject\": {\n      \"type\": \"string\",\n      \"description\": \"Email subject.\"\n    },\n    \"follow_up_email_body_text\": {\n      \"type\": \"string\",\n      \"description\": \"Plain-text email body.\"\n    }\n  }\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        928,
        784
      ],
      "id": "b623e320-89d4-4531-88b4-bcd705497091",
      "name": "Agent Output Rules"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "9d283c07-a1a1-44e8-a301-f93e4da2aedd",
              "name": "text",
              "value": "={{ $('Upload audio or transcript').item.json['If no audio, directly copy the transcript'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        368,
        656
      ],
      "id": "584f7f0a-5b1d-4c1a-a592-2c068af88db2",
      "name": "Process the transcript"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI – Transcript Parser and Summarizer\n\nPurpose\n- Parse a single sales rep transcript and produce a minimal JSON object that downstream automation (n8n) can route to Salesforce (CRM) and Outlook.\n\nCompany context (for grounding)\n- Proxima Health Systems (PXH) is a North American distributor serving hospitals and clinics. Offerings span:\n  - Capital equipment (e.g., infusion pumps, patient monitors, sterilizers, OR tables/lights)\n  - Diagnostics and clinical systems (POC analyzers, vital‑signs stations)\n  - Consumables and accessories (tubing sets, filters, electrodes, drapes)\n  - Services (field repair, preventive‑maintenance plans, depot/loaners)\n  - Digital/operations (asset tracking, service scheduling, basic compliance documentation)\n- Buying and stakeholders often include materials management/procurement, clinical leaders (OR/ICU/Med‑Surg), and biomedical engineering. Finance may weigh in on large capital purchases.\n- Sales reps are relationship‑driven account owners. A typical visit reviews the installed base and open issues, surfaces needs/pain points, discusses products or service options, agrees on next steps, and plans follow‑ups. Notes are logged in Salesforce; follow‑up emails recap agreements.\n\nInputs you receive\n- One raw transcript of an interaction (onsite, virtual, or phone) between a PXH rep and a single customer attendee. There is no separate context summary; extract everything from the transcript itself.\n\nYour task\n- Output a single JSON document that matches the caller‑provided flat schema (no nesting) with top‑level keys: `account_name`, `contact`, `type`, `summary`, `needs`, `products`, `next_steps`, `follow_up_email_subject`, `follow_up_email_body_text`.\n- Output JSON only. No markdown, no commentary, no code fences.\n\nGuidelines\n1. Be faithful to the transcript; do not invent facts. If a value is missing, return the smallest valid value the schema allows (e.g., `[]` for arrays, `\"\"` for strings).\n2. type must be one of `onsite`, `virtual`, `phone` based on cues (“onsite”, “Zoom/Teams/Teams”, “called”).\n3. summary: 2–4 sentences capturing main issues, products/services discussed, and direction of travel.\n4. needs: return a single string formatted as a newline-separated bullet list (`- item`) of customer pain points and requests. Omit blank trailing lines.\n5. products: return a single string from representing the primary category for the visit.\n6. next_steps: return a single plain-text string formatted as a newline-separated bullet list (`- action`) covering all follow-up items and dates, mirroring transcript phrasing (e.g., “next Wednesday”, “by Tuesday”, or a date).\n7. contact: return the single customer attendee’s full name string. Do not include the PXH rep or add emails/roles.\n8. account_name: use the customer organization named in the transcript. If multiple orgs are mentioned, choose the customer site the rep is visiting/serving.\n9. follow_up_email_subject: concise subject referencing the main topic and, when obvious, the account.\n10. follow_up_email_body_text: short, polite recap (4–7 sentences) reiterating key points and next steps without marketing fluff.\n11. Avoid PHI or patient identifiers unless explicitly present; do not add any.\n\nChecklist before sending\n- JSON conforms to the schema (keys present, types correct) and contains no extra properties.\n- Product category is chosen from the allowed set and reflects the main focus of the conversation.\n- `needs` field is a single string with newline-separated `- item` bullets that mirror the transcript.\n- Next steps field is a single string with newline-separated `- action` bullets that align with the transcript timing.\n- Email subject/body align with the summary and remain professional and concise."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        720,
        592
      ],
      "id": "e147805f-b6bc-488b-8571-2a85245cb349",
      "name": "Process transcript with AI"
    },
    {
      "parameters": {
        "content": "# AfterVisit AI agent workflow ",
        "height": 576,
        "width": 2384,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -224,
        432
      ],
      "id": "e29123dc-37d6-461d-84dc-da90f8f0215c",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "resource": "draft",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [
        1520,
        784
      ],
      "id": "b22f6e71-1dd8-48b9-b208-feb2da6bc6c5",
      "name": "Create Outlook draft",
      "webhookId": "94253bc1-9e63-4a92-a93e-f56a1bf2c407",
      "disabled": true
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8",
          "mode": "list",
          "cachedResultName": "Proxima Health Logging Spreadsheet",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "account_name": "={{ $json.output.account_name }}",
            "contact": "={{ $json.output.contact }}",
            "type": "={{ $json.output.type }}",
            "summary": "={{ $json.output.summary }}",
            "needs": "={{ $json.output.needs }}",
            "products": "={{ $json.output.products }}",
            "next_steps": "={{ $json.output.next_steps }}",
            "date": "={{ new Date($('Upload audio or transcript').item.json.submittedAt).toLocaleDateString('en-US') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "date",
              "displayName": "date",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "account_name",
              "displayName": "account_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "contact",
              "displayName": "contact",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "type",
              "displayName": "type",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "summary",
              "displayName": "summary",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "needs",
              "displayName": "needs",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "products",
              "displayName": "products",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "next_steps",
              "displayName": "next_steps",
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
        1520,
        608
      ],
      "id": "8fcc0798-80cf-4a50-87a5-219b7d06a9b5",
      "name": "Append row in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Recitation 5 - Evaluation\n\n![Proxima Health logo](https://i.ibb.co/My1FBbwg/company-logo.jpg)\n\n",
        "height": 624,
        "width": 496,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -752,
        176
      ],
      "id": "6ceb3a36-39c0-4ba5-8f6c-f2403223ba45",
      "name": "Sticky Note6"
    }
  ],
  "connections": {
    "Upload audio or transcript": {
      "main": [
        [
          {
            "node": "Detect input type",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Detect input type": {
      "main": [
        [
          {
            "node": "Transcribe audio of visit",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process the transcript",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error: nothing was uploaded!",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Transcribe audio of visit": {
      "main": [
        [
          {
            "node": "Process transcript with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Process transcript with AI",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Agent Output Rules": {
      "ai_outputParser": [
        [
          {
            "node": "Process transcript with AI",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Process the transcript": {
      "main": [
        [
          {
            "node": "Process transcript with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process transcript with AI": {
      "main": [
        [
          {
            "node": "Append row in sheet",
            "type": "main",
            "index": 0
          },
          {
            "node": "Create Outlook draft",
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

This consists of...
1. An **n8n Form** that allows users to upload a voice recording or a transcript of the conversation;
2. A **Switch** node that determines if the upload is a voice recording or transcript;
3. An **OpenAI transcription** node that can convert a voice recording to text;
4. An **Edit Fields** node that prepares the input for the agent. This is not important for now, but it will be once we start to add in other forms of inputs;
5. An **AI Agent** that will write a follow-up email, summarize the conversation, and extract information such as the product category, needs, and next steps;
6. An **Output Parser** to ensure the formatting of the output;
7. A **Google Sheets** node to log the expense.

With this, we have a full pipeline that lets us categorize expenses! 

Make sure to click into the `OpenAI Chat Model` node to fill in your credentials. In the `Append row in sheet` node for Google Sheets, also add your credential and choose the `Expenses Spreadsheet` from earlier. You may need to run the workflow once and drag-and-drop the appropriate key into each `Value to Send` for the spreadsheet.

---
### Exercises

For the following exercises, here is an example transcript that you can use:

```text
Context: Onsite visit at North Shore Medical Center (Med/Surg floor conference nook). Proxima Health Systems (PXH) rep Alex Lee meets with Jordan Patel (Biomed lead) and Maria Santos (Materials Management). Goal: discuss infusion pump alarm issues, PM backlog, and potential refresh options; align on next steps. Alex (PXH): Thanks for making time, Jordan, Maria. Quick agenda: (1) alarm drift on Med/Surg pumps, (2) PM backlog on ~14 units, (3) whether a refresh in FY26 makes sense, and (4) next steps and dates. Sound right? Jordan (Biomed): That’s our list. Nurses flagged nuisance alarms and a couple of pumps with unreliable occlusion alerts. We’ve also slipped on PMs—staffing and parts. Maria (Materials): And if we look at any refresh, I’ll need early heads‑up for budget. Alex (PXH): On the alarms, is it mostly nuisance or do you see true drift out of spec? Jordan (Biomed): Mostly nuisance—sensors still pass, but thresholds seem sensitive. Two pumps failed occlusion checks last week. Alex (PXH): Understood. On PMs, my last export showed 14 units past due. Does that match your list? Jordan (Biomed): Yes—four are more than 60 days overdue, the rest 30–60. We missed a shipment on filters and some tubings for test rigs. Alex (PXH): Ok. For the immediate needs, we can: (a) get you a parts kit and prioritize PM visits for the overdue 14 units, (b) run a quick alarm calibration sweep, and (c) set a nursing in‑service to reduce nuisance alerts. Does that help? Jordan (Biomed): Yes, parts and PM support would be great. Training for nurses helps too. Maria (Materials): Just send me the parts list and lead times so I can align POs. Alex (PXH): Got it. On the longer term: some sites are moving to the next‑gen infusion pumps—better alarm management and analytics. Should we explore a FY26 refresh, maybe staged by unit? Jordan (Biomed): Possibly. ICU is interested in advanced profiles; Med/Surg could stay standard. I’d want a short demo for ICU and a side‑by‑side. Maria (Materials): For budget, give me two options: standard configuration and an advanced bundle. If service can include a preventive maintenance (PM) plan, that’s helpful. Alex (PXH): Perfect. So products on the table are infusion pumps (capital equipment) and PM plans (services). Any consumables we should bundle—tubing sets, filters? Jordan (Biomed): Tubing sets—yes, but keep that separate from capital. Filters we need for maintenance, please include. Alex (PXH): Noted. Let me summarize needs and then we’ll lock next steps: — Needs/pain points: nuisance alarms on Med/Surg; two pumps failing occlusion checks; PM backlog on 14 units; parts shortages (filters/tubings); ICU wants demo of advanced features; Materials needs budget options. — Products discussed: infusion pumps (capital_equipment), preventive maintenance plans (services), consumables (tubing sets/filters) as a separate line. Jordan (Biomed): That’s accurate. Maria (Materials): Works for me. Alex (PXH): Next steps I propose: 1) I’ll schedule a 30‑minute ICU demo for the next‑gen pumps. Target date: next Wednesday. 2) I’ll send two quote options by Tuesday: (a) standard configuration; (b) advanced bundle; both will include a PM plan line. 3) I’ll coordinate a PM visit to clear the 14 overdue units and ship the maintenance filters. We’ll propose dates in that quote email. Jordan (Biomed): Please invite our ICU nurse manager, Dr. Kim, to the demo. Maria (Materials): And price the PM plan as an add‑on so finance can see the delta. Alex (PXH): Done. For the follow‑up email, I’ll recap: issues we discussed, the two quote options, and the demo date. Anything else you want documented? Jordan (Biomed): Include that two units failed occlusion checks—so service should prioritize those first. Maria (Materials): Add expected lead times on filters and the service window options. Alex (PXH): Will do. Quick recap before we break: — Summary: We reviewed alarm and PM issues on Med/Surg infusion pumps, agreed to a short ICU demo of next‑gen pumps, and to receive two quotes (standard vs advanced) with an optional PM plan. Immediate focus is clearing PM backlog and addressing two failed occlusion checks; Materials needs parts lead times. — Next steps/dates: • Schedule ICU demo (Alex) – target next Wednesday. • Send two quote options incl. PM plan (Alex) – by Tuesday. • Coordinate PM visit + ship filters (Alex with Service) – dates proposed in the quote email. Jordan (Biomed): Sounds good. Maria (Materials): Thanks, looking forward to the email. Alex (PXH): Appreciate the time. I’ll follow up as outlined.
```

1. Look at the system message. This does not contain a description of the product categories, but the agent is still assigning items to each! How does it know what the categories are?
2. Instead of using an output parser, we could have given the agent a Google Sheets tool and let it automatically fill in the columns. What are the advantages and disadvantages of doing it this way?
3. Try sending several conversation transcripts and see how it categorizes them in the spreadsheet. What happens if information is missing? More examples of transcripts can be found in the [Proxima Health Evaluation spreadsheet](https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit?gid=0#gid=0).
4. Can you improve how it assigns product categories by modifying the system prompt?
5. What if a transcript is assigned a product category of services instead of diagnostics? Is that better or worse than if the category should be diagnostics and it was instead assigned consumables? Or do we not care about this distinction?

As an added note, we may need to add instructions on how to deal with missing information. Here is one thing we could add to the end of the system message to do so:

```text
Failure handling
- If essential details are missing, fill with minimal valid values rather than guessing.
- If the transcript seems incomplete, still return a valid JSON structure with empty arrays/strings where allowed.
```

---
# Part 2: Adding in Evaluation Pipeline

Now, we want a formal way to test how well our expense agent actually works. To do so, we need to create an understanding of _what it means for our agent to work well_.

To implement this, we will use n8n's **evaluation** nodes and triggers to let us test different inputs and see how well they do against our chosen benchmarks. We consider two types of tasks:
- **Verifiable tasks** can be automatically checked to see if the agent is performing them correctly. For example, is the agent assigning an expense to the correct category?
- **Non-verifiable or unverifiable tasks** do not have a clear right/wrong answer. For example, does the agent's description of the expense accurately reflect it?
Both of these can be handled in n8n! For this walkthrough, we will focus on two metrics, but you will be encouraged to create your own metrics in the exercises.

The two metrics we will consider are as follows:
- **Correctness metric:** each transcript is given a product category, which is one of **“Capital Equipment,” “diagnostics,” “Consumables,” ”Services”** or **“Digital Ops.”** Does the agent categorize correctly?
- **LLM-as-a-judge:** We are also given a potential follow-up email by the agent. Is this email professional and does it fit the tone and language that we want reps to use?

> [!info] Note
> There is an important difference between human-in-the-loop and evaluation. Human-in-the-loop should not be used to fix systemic/recurring errors; we should catch that during evaluation and use it to improve our system message. Instead, human-in-the-loop is meant to provide human oversight once we are already confident that our agent is doing well.

In this portion, we focus on the correctness metric. Here are the nodes that we will build:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas",
          "mode": "list",
          "cachedResultName": "Proxima Health Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit#gid=0"
        }
      },
      "type": "n8n-nodes-base.evaluationTrigger",
      "typeVersion": 4.7,
      "position": [
        -128,
        64
      ],
      "id": "895a434f-1161-4a8c-93a7-9f0868c91f36",
      "name": "Evaluation Transcripts",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "9d283c07-a1a1-44e8-a301-f93e4da2aedd",
              "name": "text",
              "value": "={{ $json['Conversation Transcripts'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        368,
        64
      ],
      "id": "c35b46ea-a149-434a-845b-844d7c0f29e3",
      "name": "Process evaluation transcript"
    },
    {
      "parameters": {
        "operation": "setMetrics",
        "metric": "customMetrics",
        "metrics": {
          "assignments": [
            {
              "name": "correct product category",
              "value": "={{ $('Evaluation').item.json.output.contact == $('Evaluation Transcripts').item.json.contact }}",
              "type": "number",
              "id": "90922726-2513-4b0b-ab2f-da9db16b9383"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1936,
        -32
      ],
      "id": "aa0559c5-cb6a-41c8-baea-11e0eebf83c2",
      "name": "Evaluation Metrics"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas",
          "mode": "list",
          "cachedResultName": "Proxima Health Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit#gid=0"
        },
        "outputs": {
          "values": [
            {
              "outputName": "generated_account_name",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.account_name }}"
            },
            {
              "outputName": "generated_contact",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.contact }}"
            },
            {
              "outputName": "generated_type",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.type }}"
            },
            {
              "outputName": "generated_summary",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.summary }}"
            },
            {
              "outputName": "generated_needs",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.needs }}"
            },
            {
              "outputName": "generated_products",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.products }}"
            },
            {
              "outputName": "generated_next_steps",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.next_steps }}"
            },
            {
              "outputName": "generated_email_subject",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.follow_up_email_subject }}"
            },
            {
              "outputName": "generated_email_body",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.follow_up_email_body_text }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1936,
        176
      ],
      "id": "76b4c942-279a-4bb8-9672-7b2acea9ad3e",
      "name": "Record Evaluation",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "operation": "checkIfEvaluating"
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1104,
        592
      ],
      "id": "bc1daef2-8911-4f08-9a5a-314d7da22688",
      "name": "Evaluation"
    },
    {
      "parameters": {
        "content": "# Evaluation pipeline",
        "height": 576,
        "width": 2384
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -224,
        -160
      ],
      "id": "48be7154-934b-4184-956f-68a20fbec7b3",
      "name": "Sticky Note2"
    }
  ],
  "connections": {
    "Evaluation Transcripts": {
      "main": [
        [
          {
            "node": "Process evaluation transcript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process evaluation transcript": {
      "main": [
        []
      ]
    },
    "Evaluation": {
      "main": [
        [
          {
            "node": "Evaluation Metrics",
            "type": "main",
            "index": 0
          },
          {
            "node": "Record Evaluation",
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
## Step 1: Evaluation Spreadsheet

To test our agent, we need examples of inputs, or expenses that members of the team might input. We will store this in a Google Sheet; an example that you can copy can be found [here](https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/copy).

This spreadsheet has many columns. For now, we focus on **Conversation Transcripts, Products, Generated Products, Generated Email Body, Rating** and **Judge Email Feedback**.For the correctness metric, we need to supply the "correct answer" (given by the column Products) along with the input so that we can compare the output of our agent (given by Generated Products) to the true answer.

For LLM-as-a-judge, since there is no longer a true answer, our analogous step will be providing specific directions to the LLM, which may include examples of what "good" outputs look like. We will use the Judge Email Feedback column so that the judge will explain its decision-making.

---
## Step 2: Evaluation Trigger

- **Add node**: `Add another trigger → When running evaluation`
	- I renamed this node to `Evaluation Transcripts`, which we will use later on.
	- Source: `Google Sheets`
	- Document Containing Dataset: Proxima Health Evaluation spreadsheet that you copied earlier
- **What it does**: This spreadsheet contains examples of potential transcripts. When we execute the workflow from this evaluation node, it will treat each row of the spreadsheet as a separate input and run through each row one at a time. 

---
## Step 2: Standardizing Inputs

- **Add node**: `Edit Fields (Set)`
	- Rename this node to `Process evaluation transcript`. This isn't strictly necessary, but in Step 4, you may copy and paste in some expressions for each output. In order to do so, we need to have the same node name.
	- Mode: `Manual Mapping`
	- Click `Add Field` and make name be `text` with value `{{ $json['Conversation Transcripts'] }}`
	- Connect this node to the evaluation trigger and then also to the AI Agent node.
- **What it does**: Note that if we tried to directly feed the output of the evaluation trigger into the AI Agent, this would result in an error because the User Message in the agent is `{{ $json.text }}`. As a result, we standardize our input format so it is the same if we are evaluating or if there is a chat message.

Now, connect the output of this node directly to the `AI Agent`.

> [!info] General Use
> This is a great strategy in general if data could be coming from different sources to one node in n8n. For example, you might want to have a workflow that allows you to test using the `Chat Trigger` node but it can also receive messages from Telegram. Since the JSON formats of these triggers are different, you can use the `Edit Fields (Set)` node to make their outputs look similar so you can feed them into the next node more easily and not have to deal with each case separately.

---
## Step 3: Routing

When we are testing, we don't want to update the spreadsheet that is holding our actual expenses! Remove the connection between the AI Agent and the following nodes. We will add a special node that checks if we are performing evaluation and chooses the path based on this.

- **Add node**: `Action in an app → Evaluation → Check if evaluating`
	- Connect this to the output of the agent
- **What it does**: We might want different behavior if we are evaluating versus actual runs of the workflow. In our case, we want to log actual calls in a spreadsheet, but if we are doing evaluation, we will log it elsewhere.

Now, connect the `Normal` output from this node to the Google Sheet and Outlook nodes. If we are not evaluating, then it will choose this branch and act like before!

---
## Step 4: Evaluation Logging

- **Add node**: `Action in an app → Evaluation → Set Outputs`
	- Source: `Google Sheets`
	- Document: `Proxima Health Evaluation`
	- Choose `Add Output` and give it the name `generated_account_name` with value
```JSON
{{ $('Process transcript with AI').item.json.output.account_name }}
```
- Add more outputs with names `generated_contact`, `generated_type`, `generated_summary`, `generated_needs`, `generated_products`, `generated_next_steps`, `generated_email_subject`, and `generated_email_body`. Note that these match the names of the columns in the spreadsheet, though we leave two of them out for now. For the expressions for each column, use `{{ $('Process transcript with AI').item.json.output.[COLUMN NAME HERE] }}`, inserting the correct column name. This will also be shown in the video; running each evaluation node in order will make this easier.
- Connect to the `Evaluation` output of the evaluation check in Step 3.
- We choose the name `Assigned Category` so that it matches the column name in the Google Sheet and writes its output in the correct place.
- **What it does**: We want to log what our AI Agent categorizes the prompt. This lets it write to the column in the Google Sheet so we have a clear record of what the assigned category was.

---
## Step 5: Correctness Metric

Now, we want to see how well our agent did. However, this is largely dependent on what we think "good" means. For example, it's possible that product categories could overlap; if our agent assigns a transcript to one instead of the other, is this better or worse than if it confused these categories in a slightly different way?

To start, we just use a correctness metric. In our Proxima Health Evaluation document, note that we have a column called **Products**. This is the product category that we think the prompt should be assigned to. If the category that the agent assigns is the same as this category, we mark it as correct, and otherwise, we mark it as incorrect.

- **Add node**: `Action in an app → Evaluation → Set Metrics`
	- Metric: `Custom Metrics`. We could use `Categorization`, but we will later add another metric.
	- Click `Add Field`. For name, put something like `correct product category`.
	- For the other box, put `{{ $('Evaluation').item.json.output.contact == $('Evaluation Transcripts').item.json.contact }}``
- **What it does**: This simply compares the expected and actual answer to see if they are the same.
- Connect this to the `Check if Evaluating` node.

---
## Exercises

1. Now, execute the workflow starting at the evaluation trigger. How well does it do? 
2. At this firm, the product category `services` makes up the vast majority of the expenses. Does the evaluation reflect this? How could we make it reflect this more? 
3. Try to add a correctness metric for the `contact` field. What should we do if there is no name reported?
4. Realistically, reps might instead add a voice note talking through the conversation, rather than the conversation transcript itself. What would we change to deal with this?
5. **Challenge:** Note that the rep submitting the transcript might forget crucial information, such as needs or the contact at Proxima Health Systems.
	1. The needs are perhaps most vital. If they are missing, the agent should flag it and and send the user a message to ask about this. Note: our agent currently does not have memory. What happens if it asks the user and then they respond?
	2. If the contact is missing, what should the default behavior be? Implement your idea in n8n.

---
# Part 3: LLM-as-a-Judge

Correctness is a rather coarse metric and beyond categorization, it may not even be applicable. For example, the agent also generates a description of each expense which would allow us to quickly check on how the budget is being spent. We might be interested in how useful these descriptions are. This is a **non-verifiable task**; we cannot verify if its answer is correct, and in fact, there might not even be a correct answer!

To still be able to evaluate the agent's answers in this case, we instead can use another LLM as a judge. 

Note that there is a way to do this using a `Set Metrics` evaluation node in n8n and choosing the metric `Helpfulness (AI-based)`. However, **we won't do this**. We will do it in a slightly different way that lets us log more information, including the reasoning of the judge agent. 

While we walk through the steps to create each node, you can also check this against the actual nodes:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "promptType": "define",
        "text": "=# Original Transcript\n\n{{ $('Process evaluation transcript').item.json.text }}\n\n# Generated Email\n\n**Title:** {{ $json.output.follow_up_email_subject }}\n**Body:**\n{{ $json.output.follow_up_email_body_text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI – Follow-Up Email Quality Judge\n\nPurpose\n- Evaluate an LLM-generated follow-up email (subject + body) against a sales-call transcript for Proxima Health Systems (PXH).\n- Provide consistent scoring (1–5) and qualitative feedback that instructors can share with students.\n- Focus on clarity, warmth, completeness, and actionability aligned with PXH relationship standards.\n\nCompany context\n- PXH is a North American distributor serving hospitals and clinics with:\n  - Capital equipment (e.g., OR tables/lights, infusion pumps)\n  - Diagnostics and clinical systems (chemistry analyzers, point-of-care testing)\n  - Consumables and accessories (electrodes, cuffs, filters)\n  - Services (field repair, preventive-maintenance plans, depot coverage)\n  - Digital/operations offerings (asset tracking, workflow scheduling)\n- Sales reps are trusted account owners. A strong follow-up email thanks the customer, mirrors the visit summary, confirms needs/pain points, and clearly states next actions with dates or owners.\n- Reps document everything in Salesforce and send the email externally, so tone must be professional yet warm. No internal CRM shorthand should appear.\n\nInputs you receive\n- One raw transcript of a PXH rep meeting or call with a single customer stakeholder.\n- One proposed email draft consisting of a subject line and a body.\n\nYour task\n- Compare the draft email against the transcript.\n- Produce a structured response that conforms exactly to the caller-provided JSON Schema (one rating field and one explanation field). Do not add extra fields or commentary.\n\nScoring rubric (apply holistic judgment)\n5 – Outstanding. Subject references the main topic/account, greeting is warm (“Hi/Hello/Dear <name>,”), tone is appreciative, and the body accurately and succinctly recaps all major issues, needs, and next steps (including owners/dates). Email closes with a professional sign-off and invites follow-up.\n4 – Strong. Covers almost everything with minor omissions or slightly less polished phrasing, but still aligned with PXH standards.\n3 – Adequate. Captures some key items but misses notable needs/next steps, or tone/opening/closing feels generic. Student should revise.\n2 – Weak. Omits several critical items, misstates facts, or feels transactional/cold. Significant rewrite required.\n1 – Unacceptable. Wrong account/contact, fabricated content, or missing core deliverables (e.g., no next steps, no thanks, no greeting).\n\nEvaluation checklist (use to ground your comments)\n- Greeting & tone: opens with “Hi/Hello/Dear <contact name>,” acknowledges the meeting, thanks the stakeholder, and maintains a collaborative tone without slang.\n- Subject line: mentions the key topic(s) and, when obvious, the account/site.\n- Summary accuracy: reflects major discussion points without inventing details.\n- Needs/pain points: surfaces customer asks/pain points drawn from the transcript.\n- Next steps: lists all agreed follow-up actions with owners and timing language.\n- Clarity & structure: organized in short paragraphs or bullets; easy to skim.\n- Professional close: ends with a friendly invitation to reach out and a sign-off (“Best regards, Alex / Proxima Health Systems” or equivalent).\n- Compliance: no PHI; no internal-only notes (e.g., SKU shorthand unless customer used it).\n\nExamples (for scoring intuition – do not quote verbatim in outputs)\n\nExample A – Strong email (Rate 5/5)\nTranscript highlights: site walk-through for OR tables; needs tilt-stable table, new lights, ergonomic package; next steps include demo next Wednesday, dual quotes, financing summary by mid-month.\nDraft email:\nSubject: “Thank you — OR table and lighting next steps for Summit Ridge Surgical Center”\nBody:\n“Hi Dr. Sofia Ramirez,\n\nThank you for walking me through OR 2 today. We confirmed the tilt drift on the table, the aging light arms, and your interest in the ergonomic package. As discussed, I’ll send the invite for the in-room demo next Wednesday at 2 pm, deliver both the baseline and ergonomic quotes tomorrow, and forward a financing summary by November 15 so Finance can review. I’ll also include the maintenance interval details you called out. Please let me know if there are accessories you’d like us to bring to the demo.\n\nWarm regards,\nCasey Morgan\nProxima Health Systems”\nWhy 5: Warm tone, precise recap, every next step with owners/dates, professional close.\n\nExample B – Needs improvement (Rate 3/5)\nTranscript highlights: virtual call about analyzer coolant leak, QC drift, urgent service tech, loaner, reagent replenishment, depot coverage quote.\nDraft email:\nSubject: “Analyzer follow-up”\nBody:\n“Hey Dr. Meredith Lawson,\n\nJust following up about the analyzer leak. I’ll check with service on timing and let you know if we can send someone. We’ll also look at the depot option. Talk soon.\n\nThanks,\nRiley Chen”\nWhy 3: Tone too casual (“Hey”), misses QC drift, reagent replenishment, and loaner commitments; vague next steps.\n\nExample C – Poor email (Rate 1/5)\nTranscript highlights: consumables backorder, substitution matrix, split shipments, par tracking one-pager.\nDraft email:\nSubject: “Meeting recap”\nBody:\n“Hi Dana,\n\nThanks for the chat. We’ll be in touch.\n\n- Sam”\nWhy 1: Omits needs, substitution details, and all action items; unusable for CRM.\n\nFailure handling\n- If the email references facts not in the transcript, call them out as hallucinations and lower the rating.\n- If the email misses critical safety, compliance, or timing details, deduct accordingly.\n- If greeting is wrong contact or tone is cold/transactional, reflect that in the score.\n\nReminder\n- Provide an honest, actionable assessment grounded in the transcript.\n- Be concise but specific in your explanation so a student knows exactly what to fix.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1520,
        48
      ],
      "id": "c3a69c28-ccf3-43c7-8752-b7945519382a",
      "name": "Email Judge"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.2",
          "mode": "list",
          "cachedResultName": "gpt-5.2"
        },
        "options": {
          "responseFormat": "json_object",
          "reasoningEffort": "low"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1472,
        272
      ],
      "id": "3aa5877a-47ca-459a-856f-78cc95036704",
      "name": "OpenAI Chat Model1",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"$schema\": \"https://json-schema.org/draft/2020-12/schema\",\n  \"title\": \"Email Judge Output\",\n  \"type\": \"object\",\n  \"required\": [\"rating\", \"explanation\"],\n  \"properties\": {\n    \"rating\": {\n      \"type\": \"integer\",\n      \"minimum\": 1,\n      \"maximum\": 5,\n      \"description\": \"Overall quality score for the follow-up email (1 = poor, 5 = excellent).\"\n    },\n    \"explanation\": {\n      \"type\": \"string\",\n      \"minLength\": 1,\n      \"description\": \"Concise rationale (3–5 sentences) referencing transcript evidence.\"\n    }\n  },\n  \"additionalProperties\": false\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1728,
        272
      ],
      "id": "165307ce-6795-4d21-8cd6-21a126f21605",
      "name": "judge output rules"
    }
  ],
  "connections": {
    "Email Judge": {
      "main": [
        []
      ]
    },
    "OpenAI Chat Model1": {
      "ai_languageModel": [
        [
          {
            "node": "Email Judge",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "judge output rules": {
      "ai_outputParser": [
        [
          {
            "node": "Email Judge",
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

We will also need to modify our `Set Metrics` and `Set Outputs` nodes slightly, discussed below.

---
## Step 1: Judge Agent

Connect the output of the `Set Metrics` node to the agent. This agent receives:
- The original transcript from the user
- The generated email, including the title and body
It then generates a rating from 1-5 (called `rating`) and an explanation about the score (called `explanation`).

Note that we use a newer, stronger model for this evaluation.

---
## Step 2: Logging Reasoning

Now, we want to record both the score and the reasoning so we can easily view this. This will be helpful if we want to determine if the judge is performing well. 

- Open the `Set Outputs` evaluation node.
- Click `Add Output`. We will add two outputs.
- `name`: `rating`. This is how the judge rated the email. For the `Value`, write
```JSON
{{ $json.output.explanation }}
```
- `name`: `judge_email_feedback`. This represents the explanation about the rating. For the `Value`, write
```JSON
{{ $json.output.rating }}
```
This lets us log the information in the sheet

---
## Step 3: Judge Metric

- Open the `Set Metrics` evaluation node. Click `Add Field`
- `name`: Write something like `email quality`. For the value, write
```JSON
{{ $json.output.rating }}
```

Congratulations, you have just built an evaluation pipeline for both the product categorization and emails!

---
## Exercises

1. Does the judge perform well? Are its scores representative of what we would like?
	- Add instructions to the judge agent's system prompt to modify its behavior.
2. Try to add your own metric. This can be based on fields that the AI Agent already has (such as date), or you can add fields to the agent!

**Challenge:**
1. We might want to evaluate product categorization beyond correctness. As mentioned before, certain miscategorizations are worse than others. Let's say that miscategorizing anything else as `capital_equipment` is 3 times as worse as other miscategorizations and miscategorizing `services` as others is twice as worse as other miscategorizations. Create a custom metric that then calculates the total miscategorization score based on these rules.

---
## For the Homework:

-  Creating evaluation pipelines for your agents
	- Use of the nodes `Set Outputs, Set Metrics,` and `Check if Evaluating` and the evaluation trigger `On new Evaluation event`

> [!info] Note
> For the project, you do **not** need to build an evaluation pipeline in n8n. However, you do have to show some form of evaluation, which could just be a spreadsheet with inputs, outputs, and some reasoning about how well the agent is performing.

---
# Full Workflow

In case you have some error in your workflow, here is the entire workflow to check, including the evaluation pipeline:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "formTitle": "Client conversation transcript",
        "formDescription": "Upload the recording of the customer interaction, or directly upload the transcript.",
        "formFields": {
          "values": [
            {
              "fieldLabel": "Audio recording",
              "fieldType": "file",
              "multipleFiles": false,
              "acceptFileTypes": ".flac, .mp3, .mp4, .mpeg, .mpga, .m4a, .ogg, .wav, .webm"
            },
            {
              "fieldLabel": "If no audio, directly copy the transcript"
            }
          ]
        },
        "options": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.formTrigger",
      "typeVersion": 2.3,
      "position": [
        -144,
        656
      ],
      "id": "4841881c-982d-4cc4-a175-912d5fc5fff1",
      "name": "Upload audio or transcript",
      "webhookId": "e98e13f8-6154-497a-8fb1-dffc65bc72ad"
    },
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "leftValue": "={{ $json['Audio recording'].size }}",
                    "rightValue": 0,
                    "operator": {
                      "type": "number",
                      "operation": "gt"
                    },
                    "id": "3f164f0c-56f0-4d4b-83a4-ce557f107d13"
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "if audio"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 2
                },
                "conditions": [
                  {
                    "id": "6c74856b-96be-415f-a1e7-e4054d602e78",
                    "leftValue": "={{ $json['If no audio, directly copy the transcript'] }}",
                    "rightValue": "",
                    "operator": {
                      "type": "string",
                      "operation": "notEmpty",
                      "singleValue": true
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "if transcript"
            }
          ]
        },
        "options": {
          "fallbackOutput": "extra",
          "renameFallbackOutput": "if nothing"
        }
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.3,
      "position": [
        48,
        640
      ],
      "id": "befdb855-2313-46c2-beb5-071bb6f8e9e7",
      "name": "Detect input type"
    },
    {
      "parameters": {
        "resource": "audio",
        "operation": "transcribe",
        "binaryPropertyName": "Audio_recording",
        "options": {
          "language": "en"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.8,
      "position": [
        368,
        464
      ],
      "id": "e2192fe1-6d24-4520-b0fa-e8b6fd73bedc",
      "name": "Transcribe audio of visit",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "operation": "completion",
        "completionTitle": "Missing information!",
        "completionMessage": "You did not submit a recording or a transcript!",
        "options": {}
      },
      "type": "n8n-nodes-base.form",
      "typeVersion": 2.3,
      "position": [
        208,
        832
      ],
      "id": "0a1b1cef-8aa7-4949-b2ab-3380b818b27e",
      "name": "Error: nothing was uploaded!",
      "webhookId": "486ab396-07f9-41b2-8f47-2988208ad6aa"
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
        688,
        784
      ],
      "id": "8d828a36-e3d4-43a2-b9bc-c6b10e46ffb2",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"$schema\": \"https://json-schema.org/draft/2020-12/schema\",\n  \"title\": \"AfterVisit AI Output (Flat Simplified)\",\n  \"type\": \"object\",\n  \"description\": \"Flat, no-nesting schema for teaching and evaluation.\",\n  \"required\": [\n    \"account_name\",\n    \"contact\",\n    \"type\",\n    \"summary\",\n    \"needs\",\n    \"products\",\n    \"next_steps\",\n    \"follow_up_email_subject\",\n    \"follow_up_email_body_text\"\n  ],\n  \"properties\": {\n    \"account_name\": {\n      \"type\": \"string\",\n      \"description\": \"Account (hospital/clinic) name.\"\n    },\n    \"contact\": {\n      \"type\": \"string\",\n      \"description\": \"Primary customer attendee full name (single string).\"\n    },\n    \"type\": {\n      \"type\": \"string\",\n      \"enum\": [\"onsite\", \"virtual\", \"phone\"],\n      \"description\": \"Interaction type.\"\n    },\n    \"summary\": {\n      \"type\": \"string\",\n      \"description\": \"Short paragraph of what was discussed.\"\n    },\n    \"needs\": {\n      \"type\": \"string\",\n      \"description\": \"Bullet-style plain text list of customer needs or pain points (one per line, prefixed with '- ').\"\n    },\n    \"products\": {\n      \"type\": \"string\",\n      \"description\": \"Single primary product category for the meeting.\",\n      \"enum\": [\n        \"capital_equipment\",\n        \"diagnostics\",\n        \"consumables\",\n        \"services\",\n        \"digital_ops\"\n      ]\n    },\n    \"next_steps\": {\n      \"type\": \"string\",\n      \"description\": \"Bullet-style plain text list of follow-up actions (one per line, prefixed with '- ').\"\n    },\n    \"follow_up_email_subject\": {\n      \"type\": \"string\",\n      \"description\": \"Email subject.\"\n    },\n    \"follow_up_email_body_text\": {\n      \"type\": \"string\",\n      \"description\": \"Plain-text email body.\"\n    }\n  }\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        928,
        784
      ],
      "id": "b623e320-89d4-4531-88b4-bcd705497091",
      "name": "Agent Output Rules"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "9d283c07-a1a1-44e8-a301-f93e4da2aedd",
              "name": "text",
              "value": "={{ $('Upload audio or transcript').item.json['If no audio, directly copy the transcript'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        368,
        656
      ],
      "id": "584f7f0a-5b1d-4c1a-a592-2c068af88db2",
      "name": "Process the transcript"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas",
          "mode": "list",
          "cachedResultName": "Proxima Health Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit#gid=0"
        }
      },
      "type": "n8n-nodes-base.evaluationTrigger",
      "typeVersion": 4.7,
      "position": [
        -128,
        64
      ],
      "id": "895a434f-1161-4a8c-93a7-9f0868c91f36",
      "name": "Evaluation Transcripts",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "9d283c07-a1a1-44e8-a301-f93e4da2aedd",
              "name": "text",
              "value": "={{ $json['Conversation Transcripts'] }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        368,
        64
      ],
      "id": "c35b46ea-a149-434a-845b-844d7c0f29e3",
      "name": "Process evaluation transcript"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI – Transcript Parser and Summarizer\n\nPurpose\n- Parse a single sales rep transcript and produce a minimal JSON object that downstream automation (n8n) can route to Salesforce (CRM) and Outlook.\n\nCompany context (for grounding)\n- Proxima Health Systems (PXH) is a North American distributor serving hospitals and clinics. Offerings span:\n  - Capital equipment (e.g., infusion pumps, patient monitors, sterilizers, OR tables/lights)\n  - Diagnostics and clinical systems (POC analyzers, vital‑signs stations)\n  - Consumables and accessories (tubing sets, filters, electrodes, drapes)\n  - Services (field repair, preventive‑maintenance plans, depot/loaners)\n  - Digital/operations (asset tracking, service scheduling, basic compliance documentation)\n- Buying and stakeholders often include materials management/procurement, clinical leaders (OR/ICU/Med‑Surg), and biomedical engineering. Finance may weigh in on large capital purchases.\n- Sales reps are relationship‑driven account owners. A typical visit reviews the installed base and open issues, surfaces needs/pain points, discusses products or service options, agrees on next steps, and plans follow‑ups. Notes are logged in Salesforce; follow‑up emails recap agreements.\n\nInputs you receive\n- One raw transcript of an interaction (onsite, virtual, or phone) between a PXH rep and a single customer attendee. There is no separate context summary; extract everything from the transcript itself.\n\nYour task\n- Output a single JSON document that matches the caller‑provided flat schema (no nesting) with top‑level keys: `account_name`, `contact`, `type`, `summary`, `needs`, `products`, `next_steps`, `follow_up_email_subject`, `follow_up_email_body_text`.\n- Output JSON only. No markdown, no commentary, no code fences.\n\nGuidelines\n1. Be faithful to the transcript; do not invent facts. If a value is missing, return the smallest valid value the schema allows (e.g., `[]` for arrays, `\"\"` for strings).\n2. type must be one of `onsite`, `virtual`, `phone` based on cues (“onsite”, “Zoom/Teams/Teams”, “called”).\n3. summary: 2–4 sentences capturing main issues, products/services discussed, and direction of travel.\n4. needs: return a single string formatted as a newline-separated bullet list (`- item`) of customer pain points and requests. Omit blank trailing lines.\n5. products: return a single string from representing the primary category for the visit.\n6. next_steps: return a single plain-text string formatted as a newline-separated bullet list (`- action`) covering all follow-up items and dates, mirroring transcript phrasing (e.g., “next Wednesday”, “by Tuesday”, or a date).\n7. contact: return the single customer attendee’s full name string. Do not include the PXH rep or add emails/roles.\n8. account_name: use the customer organization named in the transcript. If multiple orgs are mentioned, choose the customer site the rep is visiting/serving.\n9. follow_up_email_subject: concise subject referencing the main topic and, when obvious, the account.\n10. follow_up_email_body_text: short, polite recap (4–7 sentences) reiterating key points and next steps without marketing fluff.\n11. Avoid PHI or patient identifiers unless explicitly present; do not add any.\n\nChecklist before sending\n- JSON conforms to the schema (keys present, types correct) and contains no extra properties.\n- Product category is chosen from the allowed set and reflects the main focus of the conversation.\n- `needs` field is a single string with newline-separated `- item` bullets that mirror the transcript.\n- Next steps field is a single string with newline-separated `- action` bullets that align with the transcript timing.\n- Email subject/body align with the summary and remain professional and concise."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        720,
        592
      ],
      "id": "e147805f-b6bc-488b-8571-2a85245cb349",
      "name": "Process transcript with AI"
    },
    {
      "parameters": {
        "operation": "setMetrics",
        "metric": "customMetrics",
        "metrics": {
          "assignments": [
            {
              "name": "correct product category",
              "value": "={{ $('Evaluation').item.json.output.contact == $('Evaluation Transcripts').item.json.contact }}",
              "type": "number",
              "id": "90922726-2513-4b0b-ab2f-da9db16b9383"
            },
            {
              "id": "8e1766bc-a913-454e-b34d-722148996c01",
              "name": "email quality",
              "value": "={{ $json.output.rating }}",
              "type": "number"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1936,
        -32
      ],
      "id": "aa0559c5-cb6a-41c8-baea-11e0eebf83c2",
      "name": "Evaluation Metrics"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=# Original Transcript\n\n{{ $('Process evaluation transcript').item.json.text }}\n\n# Generated Email\n\n**Title:** {{ $json.output.follow_up_email_subject }}\n**Body:**\n{{ $json.output.follow_up_email_body_text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI – Follow-Up Email Quality Judge\n\nPurpose\n- Evaluate an LLM-generated follow-up email (subject + body) against a sales-call transcript for Proxima Health Systems (PXH).\n- Provide consistent scoring (1–5) and qualitative feedback that instructors can share with students.\n- Focus on clarity, warmth, completeness, and actionability aligned with PXH relationship standards.\n\nCompany context\n- PXH is a North American distributor serving hospitals and clinics with:\n  - Capital equipment (e.g., OR tables/lights, infusion pumps)\n  - Diagnostics and clinical systems (chemistry analyzers, point-of-care testing)\n  - Consumables and accessories (electrodes, cuffs, filters)\n  - Services (field repair, preventive-maintenance plans, depot coverage)\n  - Digital/operations offerings (asset tracking, workflow scheduling)\n- Sales reps are trusted account owners. A strong follow-up email thanks the customer, mirrors the visit summary, confirms needs/pain points, and clearly states next actions with dates or owners.\n- Reps document everything in Salesforce and send the email externally, so tone must be professional yet warm. No internal CRM shorthand should appear.\n\nInputs you receive\n- One raw transcript of a PXH rep meeting or call with a single customer stakeholder.\n- One proposed email draft consisting of a subject line and a body.\n\nYour task\n- Compare the draft email against the transcript.\n- Produce a structured response that conforms exactly to the caller-provided JSON Schema (one rating field and one explanation field). Do not add extra fields or commentary.\n\nScoring rubric (apply holistic judgment)\n5 – Outstanding. Subject references the main topic/account, greeting is warm (“Hi/Hello/Dear <name>,”), tone is appreciative, and the body accurately and succinctly recaps all major issues, needs, and next steps (including owners/dates). Email closes with a professional sign-off and invites follow-up.\n4 – Strong. Covers almost everything with minor omissions or slightly less polished phrasing, but still aligned with PXH standards.\n3 – Adequate. Captures some key items but misses notable needs/next steps, or tone/opening/closing feels generic. Student should revise.\n2 – Weak. Omits several critical items, misstates facts, or feels transactional/cold. Significant rewrite required.\n1 – Unacceptable. Wrong account/contact, fabricated content, or missing core deliverables (e.g., no next steps, no thanks, no greeting).\n\nEvaluation checklist (use to ground your comments)\n- Greeting & tone: opens with “Hi/Hello/Dear <contact name>,” acknowledges the meeting, thanks the stakeholder, and maintains a collaborative tone without slang.\n- Subject line: mentions the key topic(s) and, when obvious, the account/site.\n- Summary accuracy: reflects major discussion points without inventing details.\n- Needs/pain points: surfaces customer asks/pain points drawn from the transcript.\n- Next steps: lists all agreed follow-up actions with owners and timing language.\n- Clarity & structure: organized in short paragraphs or bullets; easy to skim.\n- Professional close: ends with a friendly invitation to reach out and a sign-off (“Best regards, Alex / Proxima Health Systems” or equivalent).\n- Compliance: no PHI; no internal-only notes (e.g., SKU shorthand unless customer used it).\n\nExamples (for scoring intuition – do not quote verbatim in outputs)\n\nExample A – Strong email (Rate 5/5)\nTranscript highlights: site walk-through for OR tables; needs tilt-stable table, new lights, ergonomic package; next steps include demo next Wednesday, dual quotes, financing summary by mid-month.\nDraft email:\nSubject: “Thank you — OR table and lighting next steps for Summit Ridge Surgical Center”\nBody:\n“Hi Dr. Sofia Ramirez,\n\nThank you for walking me through OR 2 today. We confirmed the tilt drift on the table, the aging light arms, and your interest in the ergonomic package. As discussed, I’ll send the invite for the in-room demo next Wednesday at 2 pm, deliver both the baseline and ergonomic quotes tomorrow, and forward a financing summary by November 15 so Finance can review. I’ll also include the maintenance interval details you called out. Please let me know if there are accessories you’d like us to bring to the demo.\n\nWarm regards,\nCasey Morgan\nProxima Health Systems”\nWhy 5: Warm tone, precise recap, every next step with owners/dates, professional close.\n\nExample B – Needs improvement (Rate 3/5)\nTranscript highlights: virtual call about analyzer coolant leak, QC drift, urgent service tech, loaner, reagent replenishment, depot coverage quote.\nDraft email:\nSubject: “Analyzer follow-up”\nBody:\n“Hey Dr. Meredith Lawson,\n\nJust following up about the analyzer leak. I’ll check with service on timing and let you know if we can send someone. We’ll also look at the depot option. Talk soon.\n\nThanks,\nRiley Chen”\nWhy 3: Tone too casual (“Hey”), misses QC drift, reagent replenishment, and loaner commitments; vague next steps.\n\nExample C – Poor email (Rate 1/5)\nTranscript highlights: consumables backorder, substitution matrix, split shipments, par tracking one-pager.\nDraft email:\nSubject: “Meeting recap”\nBody:\n“Hi Dana,\n\nThanks for the chat. We’ll be in touch.\n\n- Sam”\nWhy 1: Omits needs, substitution details, and all action items; unusable for CRM.\n\nFailure handling\n- If the email references facts not in the transcript, call them out as hallucinations and lower the rating.\n- If the email misses critical safety, compliance, or timing details, deduct accordingly.\n- If greeting is wrong contact or tone is cold/transactional, reflect that in the score.\n\nReminder\n- Provide an honest, actionable assessment grounded in the transcript.\n- Be concise but specific in your explanation so a student knows exactly what to fix.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1520,
        48
      ],
      "id": "c3a69c28-ccf3-43c7-8752-b7945519382a",
      "name": "Email Judge"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas",
          "mode": "list",
          "cachedResultName": "Proxima Health Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ePXxc7pEmgbPLlxmJWX42hbwElrJJQQalafInWFOuas/edit#gid=0"
        },
        "outputs": {
          "values": [
            {
              "outputName": "generated_account_name",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.account_name }}"
            },
            {
              "outputName": "generated_contact",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.contact }}"
            },
            {
              "outputName": "generated_type",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.type }}"
            },
            {
              "outputName": "generated_summary",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.summary }}"
            },
            {
              "outputName": "generated_needs",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.needs }}"
            },
            {
              "outputName": "generated_products",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.products }}"
            },
            {
              "outputName": "generated_next_steps",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.next_steps }}"
            },
            {
              "outputName": "generated_email_subject",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.follow_up_email_subject }}"
            },
            {
              "outputName": "generated_email_body",
              "outputValue": "={{ $('Process transcript with AI').item.json.output.follow_up_email_body_text }}"
            },
            {
              "outputName": "judge_email_feedback",
              "outputValue": "={{ $json.output.explanation }}"
            },
            {
              "outputName": "rating",
              "outputValue": "={{ $json.output.rating }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1936,
        176
      ],
      "id": "76b4c942-279a-4bb8-9672-7b2acea9ad3e",
      "name": "Record Evaluation",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "operation": "checkIfEvaluating"
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1104,
        592
      ],
      "id": "bc1daef2-8911-4f08-9a5a-314d7da22688",
      "name": "Evaluation"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.2",
          "mode": "list",
          "cachedResultName": "gpt-5.2"
        },
        "options": {
          "responseFormat": "json_object",
          "reasoningEffort": "low"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1472,
        272
      ],
      "id": "3aa5877a-47ca-459a-856f-78cc95036704",
      "name": "OpenAI Chat Model1",
      "credentials": {
        "openAiApi": {
          "id": "ng8YPN3U1fTEiF8P",
          "name": "AIML901 OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "content": "# AfterVisit AI agent workflow ",
        "height": 576,
        "width": 2384,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -224,
        432
      ],
      "id": "e29123dc-37d6-461d-84dc-da90f8f0215c",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"$schema\": \"https://json-schema.org/draft/2020-12/schema\",\n  \"title\": \"Email Judge Output\",\n  \"type\": \"object\",\n  \"required\": [\"rating\", \"explanation\"],\n  \"properties\": {\n    \"rating\": {\n      \"type\": \"integer\",\n      \"minimum\": 1,\n      \"maximum\": 5,\n      \"description\": \"Overall quality score for the follow-up email (1 = poor, 5 = excellent).\"\n    },\n    \"explanation\": {\n      \"type\": \"string\",\n      \"minLength\": 1,\n      \"description\": \"Concise rationale (3–5 sentences) referencing transcript evidence.\"\n    }\n  },\n  \"additionalProperties\": false\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1728,
        272
      ],
      "id": "165307ce-6795-4d21-8cd6-21a126f21605",
      "name": "judge output rules"
    },
    {
      "parameters": {
        "resource": "draft",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [
        1520,
        784
      ],
      "id": "b22f6e71-1dd8-48b9-b208-feb2da6bc6c5",
      "name": "Create Outlook draft",
      "webhookId": "94253bc1-9e63-4a92-a93e-f56a1bf2c407",
      "disabled": true
    },
    {
      "parameters": {
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8",
          "mode": "list",
          "cachedResultName": "Proxima Health Logging Spreadsheet",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "account_name": "={{ $json.output.account_name }}",
            "contact": "={{ $json.output.contact }}",
            "type": "={{ $json.output.type }}",
            "summary": "={{ $json.output.summary }}",
            "needs": "={{ $json.output.needs }}",
            "products": "={{ $json.output.products }}",
            "next_steps": "={{ $json.output.next_steps }}",
            "date": "={{ new Date($('Upload audio or transcript').item.json.submittedAt).toLocaleDateString('en-US') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "date",
              "displayName": "date",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "account_name",
              "displayName": "account_name",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "contact",
              "displayName": "contact",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "type",
              "displayName": "type",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "summary",
              "displayName": "summary",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "needs",
              "displayName": "needs",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "products",
              "displayName": "products",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "next_steps",
              "displayName": "next_steps",
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
        1520,
        608
      ],
      "id": "8fcc0798-80cf-4a50-87a5-219b7d06a9b5",
      "name": "Append row in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Recitation 5 - Evaluation\n\n![Proxima Health logo](https://i.ibb.co/My1FBbwg/company-logo.jpg)\n\n",
        "height": 624,
        "width": 496,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -752,
        176
      ],
      "id": "6ceb3a36-39c0-4ba5-8f6c-f2403223ba45",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "content": "# Evaluation pipeline",
        "height": 576,
        "width": 2384
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -224,
        -160
      ],
      "id": "48be7154-934b-4184-956f-68a20fbec7b3",
      "name": "Sticky Note2"
    }
  ],
  "connections": {
    "Upload audio or transcript": {
      "main": [
        [
          {
            "node": "Detect input type",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Detect input type": {
      "main": [
        [
          {
            "node": "Transcribe audio of visit",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Process the transcript",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Error: nothing was uploaded!",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Transcribe audio of visit": {
      "main": [
        [
          {
            "node": "Process transcript with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "Process transcript with AI",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Agent Output Rules": {
      "ai_outputParser": [
        [
          {
            "node": "Process transcript with AI",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Process the transcript": {
      "main": [
        [
          {
            "node": "Process transcript with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Evaluation Transcripts": {
      "main": [
        [
          {
            "node": "Process evaluation transcript",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process evaluation transcript": {
      "main": [
        [
          {
            "node": "Process transcript with AI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process transcript with AI": {
      "main": [
        [
          {
            "node": "Evaluation",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Email Judge": {
      "main": [
        [
          {
            "node": "Record Evaluation",
            "type": "main",
            "index": 0
          },
          {
            "node": "Evaluation Metrics",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Evaluation": {
      "main": [
        [
          {
            "node": "Email Judge",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Create Outlook draft",
            "type": "main",
            "index": 0
          },
          {
            "node": "Append row in sheet",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model1": {
      "ai_languageModel": [
        [
          {
            "node": "Email Judge",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "judge output rules": {
      "ai_outputParser": [
        [
          {
            "node": "Email Judge",
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

---
# Exploratory Content: Monthly CRM Updates

Note that we could easily exchange the `Chat Trigger` node for a Telegram message node, which would make it easy for employees to input expenses and allow for better tracking. With this information collected in our Google Sheet, we might want to know how many items we have for each product category each month.

We will walk through the steps to build this workflow, that complements our previous one:
```JSON
{
  "nodes": [
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "months",
              "triggerAtHour": 9
            }
          ]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        224,
        1184
      ],
      "id": "38ba8205-ad4a-47c4-8927-e8fd2b13b2f7",
      "name": "Schedule Trigger"
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8",
          "mode": "list",
          "cachedResultName": "Proxima Health Logging CRM",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit#gid=0"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.googleSheets",
      "typeVersion": 4.7,
      "position": [
        432,
        1184
      ],
      "id": "24a35f89-079e-43f7-83f5-f747ffb992f3",
      "name": "Get row(s) in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
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
              "id": "62207fd1-7f07-4e67-9b2e-912793fb6bfe",
              "leftValue": "={{ $json.date }}",
              "rightValue": "={{ new Date(Date.now() - 30*24*60*60*1000).toISOString() }}",
              "operator": {
                "type": "dateTime",
                "operation": "after"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.filter",
      "typeVersion": 2.2,
      "position": [
        624,
        1184
      ],
      "id": "c6d4eee4-0076-4eba-a5d8-351b2d944b26",
      "name": "Filter"
    },
    {
      "parameters": {
        "fieldsToSummarize": {
          "values": [
            {
              "field": "products"
            }
          ]
        },
        "fieldsToSplitBy": "products",
        "options": {}
      },
      "type": "n8n-nodes-base.summarize",
      "typeVersion": 1.1,
      "position": [
        832,
        1184
      ],
      "id": "b19fc805-6d28-47af-8149-158e35e322ba",
      "name": "Summarize"
    },
    {
      "parameters": {
        "sendTo": "alexjensenaiml901@gmail.com",
        "subject": "Monthly CRM Report",
        "emailType": "text",
        "message": "=Here is how many events you have for each product category for the previous month:\n\n{{ $json.data[0].products }}: ${{ $json.data[0].count_products }}\n\n{{ $json.data[1].products }}: ${{ $json.data[1].count_products }}\n\n{{ $json.data[2].products }}: ${{ $json.data[2].count_products }}\n\n{{ $json.data[3].products }}: ${{ $json.data[3].count_products }}\n\n",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1232,
        1184
      ],
      "id": "354f97b7-2959-41a5-bdea-b31469fe9929",
      "name": "Send a message",
      "webhookId": "e1c31dba-96ba-4d3b-a67c-f61c68959187",
      "credentials": {
        "gmailOAuth2": {
          "id": "ZDwBAnHZsFJYfLcn",
          "name": "Alex Gmail"
        }
      }
    },
    {
      "parameters": {
        "aggregate": "aggregateAllItemData",
        "options": {}
      },
      "type": "n8n-nodes-base.aggregate",
      "typeVersion": 1,
      "position": [
        1040,
        1184
      ],
      "id": "b31fcbf0-289a-43ef-b34d-41246135c139",
      "name": "Aggregate"
    },
    {
      "parameters": {
        "content": "## Exploratory content: monthly CRM updates",
        "height": 256,
        "width": 1280
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        160,
        1104
      ],
      "id": "828395c9-a96f-408b-bef2-213c983e9f5f",
      "name": "Sticky Note"
    }
  ],
  "connections": {
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Get row(s) in sheet",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Get row(s) in sheet": {
      "main": [
        [
          {
            "node": "Filter",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Filter": {
      "main": [
        [
          {
            "node": "Summarize",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Summarize": {
      "main": [
        [
          {
            "node": "Aggregate",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Aggregate": {
      "main": [
        [
          {
            "node": "Send a message",
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

---
## Step 1: Schedule Trigger

- **Add node:** `Schedule Trigger`
- Set it up to trigger once per month. You can also choose what time this should occur at.

---
## Step 2: Retrieving Data

- **Add node:** `Google Sheets → Get row(s) in sheet`
	- Choose the `Proxima Health Logging CRM` spreadsheet from before

---
## Step 3: Filtering

We now want to only look at expenses from the past month.

- **Add node:** `Filter`
- For the first value, choose
```JSON
{{ $json.date }}
```
- Choose `Date & Time → is after`
- For the second value, choose 
```JSON
{{ new Date(Date.now() - 30*24*60*60*1000).toISOString() }}
```
- This represents 30 days before the current time.

---
## Step 4: Summarizing

Now, we want to count the number of rows by product category. `Summarize` lets us do operations such as summing, counting, and finding the minimum or maximum of a set of data.

- **Add node:** `Summarize`
	- Aggregation: `Count`
	- Field: `products`
	- Fields to Split By: `products`
		- This means that we get one number for services, one for capital equipment, and so forth.

---
## Step 5: Aggregating

This is a common step to make our data easier to access. If you run each node individually, you will see that the `Summarize` node will return a separate JSON object for each category. To actually be able to reference each of these values individually, we need to transform the structure. To see this difficulty, try to make a Gmail node directly after the `Summarize` node and reference each category's amount.

- **Add node:** `Aggregate`
	- Aggregate: `All Item Data (Into a Single List)`
	- Put Output in Field: `data`
	- Include: `All Fields`
- **What it does**: Takes all of the JSON objects and makes them into a single list, allowing us to reference each category individually. 

----
## Step 6: Email

- **Add node:** `Gmail → Send a message`
	- Resource: `Message`
	- Operation: `Send`
	- To: Your choice! 
	- Subject: I chose something like "Monthly CRM Report"
	- Email Type: `Text`
	- Message:
```JSON
Here is how many events you have for each product category for the previous month:

{{ $json.data[0].products }}: ${{ $json.data[0].count_products }}

{{ $json.data[1].products }}: ${{ $json.data[1].count_products }}

{{ $json.data[2].products }}: ${{ $json.data[2].count_products }}

{{ $json.data[3].products }}: ${{ $json.data[3].count_products }}


```

This is a relatively simple email structure, but just shows all of the expenses. Note that this hard-codes the fact that there will be four product categories, which may not be the case.
---
title: "Class 7: AgentOps"
author:
  - Sébastien Martin
---
## "AfterVisit AI" agent workflow

![[company logo.jpg|400]]
We created an n8n workflow for Proxima Health Systems. You can copy the workflow below if you want to explore it on your own.

```json
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
        336,
        64
      ],
      "id": "4ba3f8a3-d8fa-43f8-b120-e7061e5615c5",
      "name": "Upload audio or transcript",
      "webhookId": "74975f38-74c3-4f02-9305-73c05c5f7e04"
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
        528,
        48
      ],
      "id": "13c06858-30f2-4885-8196-e0f89c157e15",
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
        848,
        -128
      ],
      "id": "c844b9a6-dbc6-4b60-9a5a-c1d61b136140",
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
        688,
        240
      ],
      "id": "ae86fc04-5434-4014-a07e-0aef574b223a",
      "name": "Error: nothing was uploaded!",
      "webhookId": "4a3f37b1-0b85-4b99-8bbe-b4789bfe4631"
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
          "responseFormat": "json_object",
          "reasoningEffort": "low"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1168,
        192
      ],
      "id": "e2768416-45b9-4418-8802-33dbe442e97f",
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
        1408,
        192
      ],
      "id": "fd8c0c12-525f-4ee4-9a9c-038145782eb6",
      "name": "Agent Output Rules"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "77c4598f-7a98-44c5-a6f0-b01d5636eb15",
              "name": "account",
              "value": "={{ $json.output.account_name }}",
              "type": "string"
            },
            {
              "id": "2cc6b9da-d1be-42d7-b2e6-afa961ceb84b",
              "name": "contact",
              "value": "={{ $json.output.contact }}",
              "type": "string"
            },
            {
              "id": "0dd07bc1-1305-43dd-816e-0ddc61ab8356",
              "name": "type",
              "value": "={{ $json.output.type }}",
              "type": "string"
            },
            {
              "id": "51b9ed4c-5f59-4083-b3dd-a9c959f8cdfd",
              "name": "summary",
              "value": "={{ $json.output.summary }}",
              "type": "string"
            },
            {
              "id": "5195521e-8998-4379-b3b2-8b44cb2b85cf",
              "name": "needs",
              "value": "={{ $json.output.needs }}",
              "type": "string"
            },
            {
              "id": "80f6c2e8-9f03-4359-8478-4d3088f5025b",
              "name": "products",
              "value": "={{ $json.output.products }}",
              "type": "string"
            },
            {
              "id": "6e160f9e-a714-464c-8121-d671590a109a",
              "name": "next_steps",
              "value": "={{ $json.output.next_steps }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1600,
        -64
      ],
      "id": "07e33952-4f7a-42c1-bfe9-f12e331f0795",
      "name": "CRM content"
    },
    {
      "parameters": {
        "resource": "task",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.salesforce",
      "typeVersion": 1,
      "position": [
        1856,
        -64
      ],
      "id": "7bc65601-f5a4-4272-8f76-a521d675d6b3",
      "name": "Update Salesforce!",
      "disabled": true
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "c90c20e8-96e3-4e87-abc5-fa096fd1b831",
              "name": "subject",
              "value": "={{ $json.output.follow_up_email_subject }}",
              "type": "string"
            },
            {
              "id": "89cfce4f-01bb-478a-8c7f-d2194a3d0c9d",
              "name": "body_text",
              "value": "={{ $json.output.follow_up_email_body_text }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1600,
        112
      ],
      "id": "74e728fc-664a-43bf-bfea-beaddd49fcfa",
      "name": "Follow-up email content"
    },
    {
      "parameters": {
        "resource": "draft",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.microsoftOutlook",
      "typeVersion": 2,
      "position": [
        1856,
        112
      ],
      "id": "67bb9352-0f49-459f-a9de-2495b75b91e2",
      "name": "Create Outlook draft",
      "webhookId": "0399566e-df76-44cb-b4af-581ee56174a4",
      "disabled": true
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
        848,
        64
      ],
      "id": "13f96101-0757-46ee-baa5-2b7eeee74580",
      "name": "Process the transcript"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI \u2013 Transcript Parser and Summarizer\n\nPurpose\n- Parse a single sales rep transcript and produce a minimal JSON object that downstream automation (n8n) can route to Salesforce (CRM) and Outlook.\n- Conform exactly to the JSON Schema provided to you by the caller. Do not add extra fields or omit required ones.\n\nCompany context (for grounding)\n- Proxima Health Systems (PXH) is a North American distributor serving hospitals and clinics. Offerings span:\n  - Capital equipment (e.g., infusion pumps, patient monitors, sterilizers, OR tables/lights)\n  - Diagnostics and clinical systems (POC analyzers, vital\u2011signs stations)\n  - Consumables and accessories (tubing sets, filters, electrodes, drapes)\n  - Services (field repair, preventive\u2011maintenance plans, depot/loaners)\n  - Digital/operations (asset tracking, service scheduling, basic compliance documentation)\n- Buying and stakeholders often include materials management/procurement, clinical leaders (OR/ICU/Med\u2011Surg), and biomedical engineering. Finance may weigh in on large capital purchases.\n- Sales reps are relationship\u2011driven account owners. A typical visit reviews the installed base and open issues, surfaces needs/pain points, discusses products or service options, agrees on next steps, and plans follow\u2011ups. Notes are logged in Salesforce; follow\u2011up emails recap agreements.\n\nInputs you receive\n- One raw transcript of an interaction (onsite, virtual, or phone) between a PXH rep and a single customer attendee. There is no separate context summary; extract everything from the transcript itself.\n\nYour task\n- Output a single JSON document that matches the caller\u2011provided flat schema (no nesting) with top\u2011level keys: `account_name`, `contact`, `type`, `summary`, `needs`, `products`, `next_steps`, `follow_up_email_subject`, `follow_up_email_body_text`.\n- Output JSON only. No markdown, no commentary, no code fences.\n\nGuidelines\n1. Be faithful to the transcript; do not invent facts. If a value is missing, return the smallest valid value the schema allows (e.g., `[]` for arrays, `\"\"` for strings).\n2. type must be one of `onsite`, `virtual`, `phone` based on cues (\u201consite\u201d, \u201cZoom/Teams/Teams\u201d, \u201ccalled\u201d).\n3. summary: 2\u20134 sentences capturing main issues, products/services discussed, and direction of travel.\n4. needs: return a single string formatted as a newline-separated bullet list (`- item`) of customer pain points and requests. Omit blank trailing lines.\n5. products: return a single string from `capital_equipment`, `diagnostics`, `consumables`, `services`, `digital_ops` representing the primary category for the visit.\n6. next_steps: return a single plain-text string formatted as a newline-separated bullet list (`- action`) covering all follow-up items and dates, mirroring transcript phrasing (e.g., \u201cnext Wednesday\u201d, \u201cby Tuesday\u201d, or a date).\n7. contact: return the single customer attendee\u2019s full name string. Do not include the PXH rep or add emails/roles.\n8. account_name: use the customer organization named in the transcript. If multiple orgs are mentioned, choose the customer site the rep is visiting/serving.\n9. follow_up_email_subject: concise subject referencing the main topic and, when obvious, the account.\n10. follow_up_email_body_text: short, polite recap (4\u20137 sentences) reiterating key points and next steps without marketing fluff.\n11. Avoid PHI or patient identifiers unless explicitly present; do not add any.\n\nChecklist before sending\n- JSON conforms to the schema (keys present, types correct) and contains no extra properties.\n- Product category is chosen from the allowed set and reflects the main focus of the conversation.\n- `needs` field is a single string with newline-separated `- item` bullets that mirror the transcript.\n- Next steps field is a single string with newline-separated `- action` bullets that align with the transcript timing.\n- Email subject/body align with the summary and remain professional and concise.\n\nFailure handling\n- If essential details are missing, fill with minimal valid values rather than guessing.\n- If the transcript seems incomplete, still return a valid JSON structure with empty arrays/strings where allowed.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1200,
        0
      ],
      "id": "f27f14a0-6aff-4584-b41d-db537af86108",
      "name": "Process transcript with AI"
    },
    {
      "parameters": {
        "content": "# AfterVisit AI agent workflow ",
        "height": 592,
        "width": 1904,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        256,
        -160
      ],
      "id": "f5605c75-4799-4951-9a24-1e96734449ab",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Class 7 - AgentOps\n\nThe proposed AfterVisit AI agent workflow:\n- takes a conversation recording or just text notes as input\n- processs them into a CRM update and a follow-up email draft\n- note that I did not actually really connect to the CRM & email services\n\n![Proxima Health logo](https://i.ibb.co/My1FBbwg/company-logo.jpg)\n\n",
        "height": 832,
        "width": 496,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -336,
        -336
      ],
      "id": "d9a8fd1d-d6d3-4c42-9bf8-3587a75049cd",
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
    "CRM content": {
      "main": [
        [
          {
            "node": "Update Salesforce!",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Follow-up email content": {
      "main": [
        [
          {
            "node": "Create Outlook draft",
            "type": "main",
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
            "node": "CRM content",
            "type": "main",
            "index": 0
          },
          {
            "node": "Follow-up email content",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {
    "Upload audio or transcript": [
      {
        "Audio recording": null,
        "If no audio, directly copy the transcript": "Context: Onsite visit at North Shore Medical Center (Med/Surg floor conference nook). Proxima Health Systems (PXH) rep Alex Lee meets with Jordan Patel (Biomed lead) and Maria Santos (Materials Management). Goal: discuss infusion pump alarm issues, PM backlog, and potential refresh options; align on next steps.  Alex (PXH): Thanks for making time, Jordan, Maria. Quick agenda: (1) alarm drift on Med/Surg pumps, (2) PM backlog on ~14 units, (3) whether a refresh in FY26 makes sense, and (4) next steps and dates. Sound right?  Jordan (Biomed): That\u2019s our list. Nurses flagged nuisance alarms and a couple of pumps with unreliable occlusion alerts. We\u2019ve also slipped on PMs\u2014staffing and parts.  Maria (Materials): And if we look at any refresh, I\u2019ll need early heads\u2011up for budget.  Alex (PXH): On the alarms, is it mostly nuisance or do you see true drift out of spec?  Jordan (Biomed): Mostly nuisance\u2014sensors still pass, but thresholds seem sensitive. Two pumps failed occlusion checks last week.  Alex (PXH): Understood. On PMs, my last export showed 14 units past due. Does that match your list?  Jordan (Biomed): Yes\u2014four are more than 60 days overdue, the rest 30\u201360. We missed a shipment on filters and some tubings for test rigs.  Alex (PXH): Ok. For the immediate needs, we can: (a) get you a parts kit and prioritize PM visits for the overdue 14 units, (b) run a quick alarm calibration sweep, and (c) set a nursing in\u2011service to reduce nuisance alerts. Does that help?  Jordan (Biomed): Yes, parts and PM support would be great. Training for nurses helps too.  Maria (Materials): Just send me the parts list and lead times so I can align POs.  Alex (PXH): Got it. On the longer term: some sites are moving to the next\u2011gen infusion pumps\u2014better alarm management and analytics. Should we explore a FY26 refresh, maybe staged by unit?  Jordan (Biomed): Possibly. ICU is interested in advanced profiles; Med/Surg could stay standard. I\u2019d want a short demo for ICU and a side\u2011by\u2011side.  Maria (Materials): For budget, give me two options: standard configuration and an advanced bundle. If service can include a preventive maintenance (PM) plan, that\u2019s helpful.  Alex (PXH): Perfect. So products on the table are infusion pumps (capital equipment) and PM plans (services). Any consumables we should bundle\u2014tubing sets, filters?  Jordan (Biomed): Tubing sets\u2014yes, but keep that separate from capital. Filters we need for maintenance, please include.  Alex (PXH): Noted. Let me summarize needs and then we\u2019ll lock next steps: \u2014 Needs/pain points: nuisance alarms on Med/Surg; two pumps failing occlusion checks; PM backlog on 14 units; parts shortages (filters/tubings); ICU wants demo of advanced features; Materials needs budget options. \u2014 Products discussed: infusion pumps (capital_equipment), preventive maintenance plans (services), consumables (tubing sets/filters) as a separate line.  Jordan (Biomed): That\u2019s accurate.  Maria (Materials): Works for me.  Alex (PXH): Next steps I propose: 1) I\u2019ll schedule a 30\u2011minute ICU demo for the next\u2011gen pumps. Target date: next Wednesday. 2) I\u2019ll send two quote options by Tuesday: (a) standard configuration; (b) advanced bundle; both will include a PM plan line. 3) I\u2019ll coordinate a PM visit to clear the 14 overdue units and ship the maintenance filters. We\u2019ll propose dates in that quote email.  Jordan (Biomed): Please invite our ICU nurse manager, Dr. Kim, to the demo.  Maria (Materials): And price the PM plan as an add\u2011on so finance can see the delta.  Alex (PXH): Done. For the follow\u2011up email, I\u2019ll recap: issues we discussed, the two quote options, and the demo date. Anything else you want documented?  Jordan (Biomed): Include that two units failed occlusion checks\u2014so service should prioritize those first.  Maria (Materials): Add expected lead times on filters and the service window options.  Alex (PXH): Will do. Quick recap before we break: \u2014 Summary: We reviewed alarm and PM issues on Med/Surg infusion pumps, agreed to a short ICU demo of next\u2011gen pumps, and to receive two quotes (standard vs advanced) with an optional PM plan. Immediate focus is clearing PM backlog and addressing two failed occlusion checks; Materials needs parts lead times. \u2014 Next steps/dates:    \u2022 Schedule ICU demo (Alex) \u2013 target next Wednesday.    \u2022 Send two quote options incl. PM plan (Alex) \u2013 by Tuesday.    \u2022 Coordinate PM visit + ship filters (Alex with Service) \u2013 dates proposed in the quote email.  Jordan (Biomed): Sounds good.  Maria (Materials): Thanks, looking forward to the email.  Alex (PXH): Appreciate the time. I\u2019ll follow up as outlined.",
        "submittedAt": "2025-10-26T22:12:44.562-05:00",
        "formMode": "test"
      }
    ]
  },
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

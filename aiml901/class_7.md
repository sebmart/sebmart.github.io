---
title: "Class 7: Evaluating AI"
author:
  - Sébastien Martin
---
## "AfterVisit AI" agent workflow

![[company logo.jpg|400]]
We created an n8n workflow for Proxima Health, with an evaluation pipeline. You can copy the workflow below if you want to explore it on your own.

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
        320,
        320
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
        512,
        304
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
        832,
        128
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
        672,
        496
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
        1152,
        448
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
        1392,
        448
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
              "name": "output.account",
              "value": "={{ $json.output.account }}",
              "type": "object"
            },
            {
              "id": "2cc6b9da-d1be-42d7-b2e6-afa961ceb84b",
              "name": "output.contacts",
              "value": "={{ $json.output.contacts }}",
              "type": "array"
            },
            {
              "id": "0dd07bc1-1305-43dd-816e-0ddc61ab8356",
              "name": "output.interaction",
              "value": "={{ $json.output.interaction }}",
              "type": "object"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1984,
        272
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
        2240,
        272
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
              "value": "={{ $json.output.follow_up_email.subject }}",
              "type": "string"
            },
            {
              "id": "89cfce4f-01bb-478a-8c7f-d2194a3d0c9d",
              "name": "body_text",
              "value": "={{ $json.output.follow_up_email.body_text }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1984,
        448
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
        2240,
        448
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
        832,
        320
      ],
      "id": "13f96101-0757-46ee-baa5-2b7eeee74580",
      "name": "Process the transcript"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E",
          "mode": "list"
        },
        "sheetName": {
          "__rl": true,
          "value": 281917283,
          "mode": "list",
          "cachedResultName": "Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E/edit#gid=281917283"
        }
      },
      "type": "n8n-nodes-base.evaluationTrigger",
      "typeVersion": 4.7,
      "position": [
        304,
        -272
      ],
      "id": "ec5db124-dced-4c5b-aeea-747a9c975f43",
      "name": "Evaluation Transcripts",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "Q40lU2Fozry1GEN4",
          "name": "92sebastien@gmail.com"
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
        832,
        -272
      ],
      "id": "b4d410e8-9a71-4a72-8665-b0c853161b66",
      "name": "Process evaluation transcript"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "System role: AfterVisit AI – Transcript Parser and Summarizer\n\nPurpose\n- Parse a single sales rep transcript and produce a minimal JSON object that downstream automation (n8n) can route to Salesforce (CRM) and Outlook.\n- Conform exactly to the JSON Schema provided to you by the caller. Do not add extra fields or omit required ones.\n\nCompany context (for grounding)\n- Proxima Health Systems (PXH) is a North American distributor serving hospitals and clinics. Offerings span:\n  - Capital equipment (e.g., infusion pumps, patient monitors, sterilizers, OR tables/lights)\n  - Diagnostics and clinical systems (POC analyzers, vital‑signs stations)\n  - Consumables and accessories (tubing sets, filters, electrodes, drapes)\n  - Services (field repair, preventive‑maintenance plans, depot/loaners)\n  - Digital/operations (asset tracking, service scheduling, basic compliance documentation)\n- Buying and stakeholders often include materials management/procurement, clinical leaders (OR/ICU/Med‑Surg), and biomedical engineering. Finance may weigh in on large capital purchases.\n- Sales reps are relationship‑driven account owners. A typical visit reviews the installed base and open issues, surfaces needs/pain points, discusses products or service options, agrees on next steps, and plans follow‑ups. Notes are logged in Salesforce; follow‑up emails recap agreements.\n\nInputs you receive\n- One raw transcript of an interaction (onsite, virtual, or phone) between a PXH rep and a single customer attendee. There is no separate context summary; extract everything from the transcript itself.\n\nYour task\n- Output a single JSON document that matches the caller‑provided flat schema (no nesting) with top‑level keys: `account_name`, `contact`, `type`, `summary`, `needs`, `products`, `next_steps`, `follow_up_email_subject`, `follow_up_email_body_text`.\n- Output JSON only. No markdown, no commentary, no code fences.\n\nGuidelines\n1. Be faithful to the transcript; do not invent facts. If a value is missing, return the smallest valid value the schema allows (e.g., `[]` for arrays, `\"\"` for strings).\n2. type must be one of `onsite`, `virtual`, `phone` based on cues (“onsite”, “Zoom/Teams/Teams”, “called”).\n3. summary: 2–4 sentences capturing main issues, products/services discussed, and direction of travel.\n4. needs: return a single string formatted as a newline-separated bullet list (`- item`) of customer pain points and requests. Omit blank trailing lines.\n5. products: return a single string from `capital_equipment`, `diagnostics`, `consumables`, `services`, `digital_ops` representing the primary category for the visit.\n6. next_steps: return a single plain-text string formatted as a newline-separated bullet list (`- action`) covering all follow-up items and dates, mirroring transcript phrasing (e.g., “next Wednesday”, “by Tuesday”, or a date).\n7. contact: return the single customer attendee’s full name string. Do not include the PXH rep or add emails/roles.\n8. account_name: use the customer organization named in the transcript. If multiple orgs are mentioned, choose the customer site the rep is visiting/serving.\n9. follow_up_email_subject: concise subject referencing the main topic and, when obvious, the account.\n10. follow_up_email_body_text: short, polite recap (4–7 sentences) reiterating key points and next steps without marketing fluff.\n11. Avoid PHI or patient identifiers unless explicitly present; do not add any.\n\nChecklist before sending\n- JSON conforms to the schema (keys present, types correct) and contains no extra properties.\n- Product category is chosen from the allowed set and reflects the main focus of the conversation.\n- `needs` field is a single string with newline-separated `- item` bullets that mirror the transcript.\n- Next steps field is a single string with newline-separated `- action` bullets that align with the transcript timing.\n- Email subject/body align with the summary and remain professional and concise.\n\nFailure handling\n- If essential details are missing, fill with minimal valid values rather than guessing.\n- If the transcript seems incomplete, still return a valid JSON structure with empty arrays/strings where allowed.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1184,
        256
      ],
      "id": "f27f14a0-6aff-4584-b41d-db537af86108",
      "name": "Process transcript with AI"
    },
    {
      "parameters": {
        "operation": "setMetrics",
        "metric": "customMetrics",
        "metrics": {
          "assignments": [
            {
              "id": "df2e4bd6-680c-43f6-8dbd-c716ae2943b7",
              "name": "correct account name",
              "value": "={{ $json.output.account_name == $('Evaluation Transcripts').item.json.account_name }}",
              "type": "number"
            },
            {
              "name": "correct product category",
              "value": "={{ $json.output.contact == $('Evaluation Transcripts').item.json.contact }}",
              "type": "number",
              "id": "90922726-2513-4b0b-ab2f-da9db16b9383"
            },
            {
              "id": "ac6164be-d9be-4476-a9e0-67d664ec0f85",
              "name": "correct interview type",
              "value": "={{ $json.output.type == $('Evaluation Transcripts').item.json.type }}",
              "type": "number"
            },
            {
              "id": "5477e015-43af-41cd-a00a-b805539b3cdd",
              "name": "correct contact",
              "value": "={{ $json.output.contact == $('Evaluation Transcripts').item.json.contact }}",
              "type": "number"
            },
            {
              "id": "df805af1-e23f-4086-b80c-f13c86250ba3",
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
        2400,
        -368
      ],
      "id": "77ea1b03-896d-44eb-a642-dcf956d00b03",
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
        1792,
        -432
      ],
      "id": "a38183d8-ed0e-4814-af6f-cbcc33a4f3dd",
      "name": "Email Judge"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E",
          "mode": "list",
          "cachedResultName": "Class 7 - Proxima Health agent evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": 281917283,
          "mode": "list",
          "cachedResultName": "Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E/edit#gid=281917283"
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
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        2400,
        -96
      ],
      "id": "36e362a6-8f69-45b8-a703-92fa50b22a37",
      "name": "Record Evaluation",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "Q40lU2Fozry1GEN4",
          "name": "92sebastien@gmail.com"
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
        1568,
        256
      ],
      "id": "a864e7e6-4ce2-44d5-a556-5ce4556f055d",
      "name": "Evaluation"
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
        1776,
        -240
      ],
      "id": "c5a40c5d-d3dd-4286-8bae-e54966d6088a",
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
        "assignments": {
          "assignments": [
            {
              "id": "2e00dfed-3e0f-4232-879b-f065cacf3f74",
              "name": "correct_account_name",
              "value": "={{ $json.output.account_name == $('Evaluation Transcripts').item.json.account_name }}",
              "type": "boolean"
            },
            {
              "id": "a4887c43-dd41-4bfe-a3f4-f0303ef83b7e",
              "name": "correct_product_category",
              "value": "={{ $json.output.products == $('Evaluation Transcripts').item.json.products }}",
              "type": "boolean"
            },
            {
              "id": "f68b2e1e-08b8-4c76-83c4-211bb6371f27",
              "name": "correct_interview_type",
              "value": "={{ $json.output.type == $('Evaluation Transcripts').item.json.type }}",
              "type": "boolean"
            },
            {
              "id": "4f885714-f062-4243-ba12-427ba628d1fb",
              "name": "correct_contact",
              "value": "={{ $json.output.contact == $('Evaluation Transcripts').item.json.contact }}",
              "type": "boolean"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        1840,
        -80
      ],
      "id": "f0b0fc7b-2395-4e7d-bfd1-f0cc271d812c",
      "name": "correctness metrics"
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
        240,
        -496
      ],
      "id": "b83e64d3-c224-4781-9d3b-e4fe56f3ed1f",
      "name": "Sticky Note"
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
        240,
        96
      ],
      "id": "f5605c75-4799-4951-9a24-1e96734449ab",
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
        1952,
        -240
      ],
      "id": "6b55ffff-bcc5-4fa5-9932-c4d4cf1dd070",
      "name": "judge output rules"
    },
    {
      "parameters": {
        "mode": "combine",
        "combineBy": "combineAll",
        "options": {}
      },
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        2208,
        -272
      ],
      "id": "bca28b39-4034-4a26-a1c4-c0fdfe640c88",
      "name": "Merge"
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Class 7 - AI Evaluation\n\n![Proxima Health logo](https://i.ibb.co/My1FBbwg/company-logo.jpg)\n\n",
        "height": 704,
        "width": 624,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -464,
        -288
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
            "node": "Merge",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Record Evaluation": {
      "main": [
        []
      ]
    },
    "Evaluation": {
      "main": [
        [
          {
            "node": "Email Judge",
            "type": "main",
            "index": 0
          },
          {
            "node": "correctness metrics",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Follow-up email content",
            "type": "main",
            "index": 0
          },
          {
            "node": "CRM content",
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
    "correctness metrics": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
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
    },
    "Merge": {
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
    }
  },
  "pinData": {
    "Upload audio or transcript": [
      {
        "Audio recording": null,
        "If no audio, directly copy the transcript": "Context: Onsite visit at North Shore Medical Center (Med/Surg floor conference nook). Proxima Health Systems (PXH) rep Alex Lee meets with Jordan Patel (Biomed lead) and Maria Santos (Materials Management). Goal: discuss infusion pump alarm issues, PM backlog, and potential refresh options; align on next steps.  Alex (PXH): Thanks for making time, Jordan, Maria. Quick agenda: (1) alarm drift on Med/Surg pumps, (2) PM backlog on ~14 units, (3) whether a refresh in FY26 makes sense, and (4) next steps and dates. Sound right?  Jordan (Biomed): That’s our list. Nurses flagged nuisance alarms and a couple of pumps with unreliable occlusion alerts. We’ve also slipped on PMs—staffing and parts.  Maria (Materials): And if we look at any refresh, I’ll need early heads‑up for budget.  Alex (PXH): On the alarms, is it mostly nuisance or do you see true drift out of spec?  Jordan (Biomed): Mostly nuisance—sensors still pass, but thresholds seem sensitive. Two pumps failed occlusion checks last week.  Alex (PXH): Understood. On PMs, my last export showed 14 units past due. Does that match your list?  Jordan (Biomed): Yes—four are more than 60 days overdue, the rest 30–60. We missed a shipment on filters and some tubings for test rigs.  Alex (PXH): Ok. For the immediate needs, we can: (a) get you a parts kit and prioritize PM visits for the overdue 14 units, (b) run a quick alarm calibration sweep, and (c) set a nursing in‑service to reduce nuisance alerts. Does that help?  Jordan (Biomed): Yes, parts and PM support would be great. Training for nurses helps too.  Maria (Materials): Just send me the parts list and lead times so I can align POs.  Alex (PXH): Got it. On the longer term: some sites are moving to the next‑gen infusion pumps—better alarm management and analytics. Should we explore a FY26 refresh, maybe staged by unit?  Jordan (Biomed): Possibly. ICU is interested in advanced profiles; Med/Surg could stay standard. I’d want a short demo for ICU and a side‑by‑side.  Maria (Materials): For budget, give me two options: standard configuration and an advanced bundle. If service can include a preventive maintenance (PM) plan, that’s helpful.  Alex (PXH): Perfect. So products on the table are infusion pumps (capital equipment) and PM plans (services). Any consumables we should bundle—tubing sets, filters?  Jordan (Biomed): Tubing sets—yes, but keep that separate from capital. Filters we need for maintenance, please include.  Alex (PXH): Noted. Let me summarize needs and then we’ll lock next steps: — Needs/pain points: nuisance alarms on Med/Surg; two pumps failing occlusion checks; PM backlog on 14 units; parts shortages (filters/tubings); ICU wants demo of advanced features; Materials needs budget options. — Products discussed: infusion pumps (capital_equipment), preventive maintenance plans (services), consumables (tubing sets/filters) as a separate line.  Jordan (Biomed): That’s accurate.  Maria (Materials): Works for me.  Alex (PXH): Next steps I propose: 1) I’ll schedule a 30‑minute ICU demo for the next‑gen pumps. Target date: next Wednesday. 2) I’ll send two quote options by Tuesday: (a) standard configuration; (b) advanced bundle; both will include a PM plan line. 3) I’ll coordinate a PM visit to clear the 14 overdue units and ship the maintenance filters. We’ll propose dates in that quote email.  Jordan (Biomed): Please invite our ICU nurse manager, Dr. Kim, to the demo.  Maria (Materials): And price the PM plan as an add‑on so finance can see the delta.  Alex (PXH): Done. For the follow‑up email, I’ll recap: issues we discussed, the two quote options, and the demo date. Anything else you want documented?  Jordan (Biomed): Include that two units failed occlusion checks—so service should prioritize those first.  Maria (Materials): Add expected lead times on filters and the service window options.  Alex (PXH): Will do. Quick recap before we break: — Summary: We reviewed alarm and PM issues on Med/Surg infusion pumps, agreed to a short ICU demo of next‑gen pumps, and to receive two quotes (standard vs advanced) with an optional PM plan. Immediate focus is clearing PM backlog and addressing two failed occlusion checks; Materials needs parts lead times. — Next steps/dates:    • Schedule ICU demo (Alex) – target next Wednesday.    • Send two quote options incl. PM plan (Alex) – by Tuesday.    • Coordinate PM visit + ship filters (Alex with Service) – dates proposed in the quote email.  Jordan (Biomed): Sounds good.  Maria (Materials): Thanks, looking forward to the email.  Alex (PXH): Appreciate the time. I’ll follow up as outlined.",
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

## Evaluation spreadsheet

[Link to our evaluation Google Sheet](https://docs.google.com/spreadsheets/d/1ED_QBUBXGYbCjj9DcINkz7z643nqnmnQ07EJ9HL3o2E/edit?usp=sharing): It is read-only, so feel free to copy it if you'd like to try it yourself!
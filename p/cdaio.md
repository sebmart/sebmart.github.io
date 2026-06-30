---
title: "Build — AI Agents"
description: "Senior Management Program in AI and Digital Transformation · June 30, 2026"
show_nav: true
hero_link_url: "/cdaio-slides/"
hero_link_text: "Slides ↗"
hero_link2_url: "/cdaio-slides/slides.pdf"
hero_link2_text: "Slides (PDF) ↗"
---

<style>.post pre { max-height: 22rem; overflow: auto; }</style>

This page is your companion for the three hours we'll spend building AI agents together. Everything we copy and paste during the session lives here, in the order we'll use it, so keep it open in your browser the whole time. If you ever fall behind, this is where you catch back up.

## Setup before we start

Yesterday morning I sent you a short email about one quick step to get ready for our sessions. If you haven't done it yet, here it is again. It only takes two or three minutes, and it makes sure you can build your own agents with me today.

We'll build in **n8n**, a platform many companies use to run their AI agents in production. You should have received an invitation by email from n8n: click the link, pick a name and a password, and you're in. It's completely free, and there's nothing to download. If you don't see it, check your spam folder, and let me know if it still doesn't show up.

Once your account is set, open our workspace below and make sure you can log in. Keep this tab handy, we'll use it for the whole session:

<p style="margin: 1.2rem 0;">
  <a href="https://aiml901-martin.app.n8n.cloud/" target="_blank" rel="noopener" style="display:inline-block; background:#EA4B71; color:#fff; font-weight:600; padding:12px 22px; border-radius:10px; text-decoration:none;">Open our n8n workspace ↗</a>
</p>

## 1 · Concierge prompt

This is the system prompt for the Skyline Experiences concierge. To copy any block on this page, hover over it with your mouse and click **Copy code** at the top-right corner.

```text
WHO YOU ARE
You are the concierge for Skyline Experiences, a premium outdoor-experiences company.

OUR TONE
Warm, friendly, and helpful — like a well-travelled concierge.

USING THE WEATHER TOOL
You have a weather tool that gives a five-day forecast for a city. When the weather matters to the question, use it before you answer — give it only the city name, for example "Miami". Never guess the weather.
```

## 2 · Email agent

The full workflow template we'll use to give the agent its own inbox. Copy it and paste it straight onto your n8n canvas.

{% raw %}
```json
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
        "maxResults": 1,
        "filters": {
          "sender": "YOUR_EMAIL_HERE@EMAIL.COM"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1.4,
      "position": [
        -1232,
        48
      ],
      "id": "4502f514-4a6c-4b47-849e-b37dc066e09d",
      "name": "Gmail Trigger",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-5-mini"
        },
        "builtInTools": {},
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.3,
      "position": [
        -912,
        272
      ],
      "id": "1cf4a7c6-84db-4899-a0fb-3632c0a3ec93",
      "name": "OpenAI GPT-5-mini",
      "credentials": {
        "openAiApi": {
          "id": "kfUvMwXQo7ZO5WoA",
          "name": "CDAIO OpenAI Key"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7a10ac8e-3fd2-4c85-8e45-3439fb479310",
              "name": "customer_email ",
              "value": "=CUSTOMER NAME: \n{{ $json.from.value[0].name }}\n\nCUSTOMER EMAIL ADDRESS\n{{ $json.from.value[0].address }}\n\nCUSTOMER EMAIL CONTENT\n{{ $json.text || $json.html || $json.textAsHtml || $json.snippet || '' }}",
              "type": "string"
            },
            {
              "id": "dc841810-8d2d-4372-86a5-db63413a25d5",
              "name": "email_id",
              "value": "={{ $json.id }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -1040,
        48
      ],
      "id": "4fa4642c-1f6d-4d4c-b61f-45914b3329ff",
      "name": "Collect Customer Email"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n\t\"type\": \"object\",\n\t\"properties\": {\n\t\t\"reply_email_content_html\": {\n\t\t\t\"type\": \"string\"\n\t\t}\n\t}\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        -624,
        272
      ],
      "id": "9d9558e4-c9ee-4cdd-892d-0b0d4b449520",
      "name": "output format1"
    },
    {
      "parameters": {
        "content": "## To get started\nClick on the \"Gmail\" node below. Then, towards the bottom in \"sender\", replace YOUR_EMAIL_HERE@EMAIL.COM with your email address",
        "height": 240,
        "width": 288
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -1328,
        -208
      ],
      "id": "230b07c2-2a6c-41c8-b83b-75f4b1d99b29",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "content": "## To use the agent\n\n- send an email from _your_ email address (the same you entered before) to `aiml901sebastienmartin@gmail.com`, which is the agent address and wait a minute for the email to land.\n- Then either activate each step manually to explore the agent during class, or click on \"Publish\" at the top to automate it.\n- wait for the agent reply in your mail box (it can take 1-2min)",
        "height": 320,
        "width": 480,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -880,
        -288
      ],
      "id": "d7d795cb-2798-4990-96c7-58367e81d678",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json['customer_email '] }}\n",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "WHO YOU ARE\nYou are the customer assistant for Skyline Experiences. You write the final reply that is sent straight to the customer. You have a weather tool that gives a five-day forecast for any city — you just give it the city name and nothing else, for example \"Miami\".\n\nBACKGROUND — ABOUT US\nSkyline Experiences runs premium outdoor activities in cities around the world: sunset harbor sails, vineyard tours, hot-air-balloon rides, and walking food tours. Many customers are travelling, and because our activities are outdoors, the weather often matters to them.\n\nOUR TONE\nWarm, friendly, and professional — confident but not stiff, like a helpful well-travelled concierge.\n\nYOUR INSTRUCTIONS\n 1. Work out what the customer is really asking.\n 2. If the weather matters to their question, use the weather tool to check the five-day forecast for the city they mention before you answer. Give the tool only the city name, for example \"Miami\".\n 3. Write a short, helpful reply — three to five sentences. Answer directly, and add one practical tip when it helps.\n 4. Sign off as \"The Skyline Experiences team.\"\n\nWHAT NOT TO DO\n - Do not promise refunds, discounts, cancellations, or booking changes.\n - Do not invent details you were not given, such as prices or addresses.\n - Do not mention the weather tool — just talk naturally about the weather.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 3.1,
      "position": [
        -832,
        48
      ],
      "id": "4d694933-7af0-4c57-8714-92c52a64bf93",
      "name": "AI-response to customer"
    },
    {
      "parameters": {
        "operation": "reply",
        "messageId": "={{ $('Collect Customer Email').first().json.email_id }}",
        "message": "={{ $json.output.reply_email_content_html }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        -464,
        48
      ],
      "id": "cf93b5dc-42ea-4529-ad1a-e072cdc2066f",
      "name": "Send email to customer",
      "webhookId": "fa9f157d-1a2c-4b6a-ba2f-c8ef7d3be7a0",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    },
    {
      "parameters": {
        "operation": "5DayForecast",
        "cityName": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('City', ``, 'string') }}"
      },
      "type": "n8n-nodes-base.openWeatherMapTool",
      "typeVersion": 1,
      "position": [
        -768,
        272
      ],
      "id": "71e1f572-b396-4225-8f49-b048c4228c88",
      "name": "Weather tool",
      "credentials": {
        "openWeatherMapApi": {
          "id": "VYgQBqAIn87uZHDs",
          "name": "OpenWeather CDAIO key"
        }
      }
    }
  ],
  "connections": {
    "Gmail Trigger": {
      "main": [
        [
          {
            "node": "Collect Customer Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI GPT-5-mini": {
      "ai_languageModel": [
        [
          {
            "node": "AI-response to customer",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Collect Customer Email": {
      "main": [
        [
          {
            "node": "AI-response to customer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "output format1": {
      "ai_outputParser": [
        [
          {
            "node": "AI-response to customer",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "AI-response to customer": {
      "main": [
        [
          {
            "node": "Send email to customer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Weather tool": {
      "ai_tool": [
        [
          {
            "node": "AI-response to customer",
            "type": "ai_tool",
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
{% endraw %}

## 3 · Human in the loop

The full template for the three-AI version, where a person reviews the trickier emails before they go out. Copy it the same way and paste it onto a fresh canvas.

{% raw %}
```json
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
        "maxResults": 1,
        "filters": {
          "sender": "YOUR_EMAIL_HERE@EMAIL.COM"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.gmailTrigger",
      "typeVersion": 1.4,
      "position": [
        -1024,
        -352
      ],
      "id": "4ea47c17-17d8-49f4-8b86-0dd75e63b718",
      "name": "Gmail Trigger",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-5-mini"
        },
        "builtInTools": {},
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.3,
      "position": [
        -656,
        -160
      ],
      "id": "21dca449-43f4-4321-b3fd-8a2f0f8d216a",
      "name": "OpenAI GPT-5-mini",
      "credentials": {
        "openAiApi": {
          "id": "kfUvMwXQo7ZO5WoA",
          "name": "CDAIO OpenAI Key"
        }
      }
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
                  "version": 3
                },
                "conditions": [
                  {
                    "leftValue": "={{ $json.output.decision }}",
                    "rightValue": "AI",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    },
                    "id": "4ae7e951-0f4e-4c31-8d09-0b4fe4f92c59"
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "AI Reply Approved"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": true,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 3
                },
                "conditions": [
                  {
                    "id": "af74e439-3169-4b8b-b78f-4f4dcc3e340e",
                    "leftValue": "={{ $json.output.decision }}",
                    "rightValue": "HUMAN",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "HUMAN Review"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.4,
      "position": [
        -320,
        -352
      ],
      "id": "0cae65e9-af0c-4897-8863-974658869a90",
      "name": "Decision"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json['customer_email '] }}\n",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "WHO YOU ARE\nYou are the front desk for Skyline Experiences, a company that runs premium outdoor activities — sunset harbor sails, vineyard tours, hot-air-balloon rides, and walking food tours — in cities around the world. Every message is an email from a customer who already has a booking.\n\nYOUR JOB\nRead the customer's email and decide one thing: can our AI assistant answer this on its own, or should a real person review the reply first?\n\nLET THE AI ANSWER ON ITS OWN when the email is a simple, low-risk question we can answer with information:\n - what the weather will be like\n - what to wear or bring\n - whether the activity is still going ahead\n - the meeting point or start time\n\nSEND IT TO A HUMAN whenever money, strong emotions, or a special situation are involved:\n - the customer is upset, complaining, or asking for a refund\n - they want to cancel, reschedule, or change a booking\n - it is a special occasion (birthday, anniversary, proposal) or a VIP request\n - anything you are unsure about\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 3.1,
      "position": [
        -592,
        -352
      ],
      "id": "d0f6ebfc-5911-410a-8e2c-6e9b1dc941f3",
      "name": "AI: Escalate to human?"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $('Collect Customer Email').first().json['customer_email '] }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "=WHO YOU ARE\nYou are the customer assistant for Skyline Experiences. You write the final reply that is sent straight to the customer. You have a weather tool that gives a five-day forecast for any city — you just give it the city name and nothing else, for example \"Miami\".\n\nBACKGROUND — ABOUT US\nSkyline Experiences runs premium outdoor activities in cities around the world: sunset harbor sails, vineyard tours, hot-air-balloon rides, and walking food tours. Many customers are travelling, and because our activities are outdoors, the weather often matters to them.\n\nOUR TONE\nWarm, friendly, and professional — confident but not stiff, like a helpful well-travelled concierge.\n\nYOUR INSTRUCTIONS\n 1. Work out what the customer is really asking.\n 2. If the weather matters to their question, use the weather tool to check the five-day forecast for the city they mention before you answer. Give the tool only the city name, for example \"Miami\".\n 3. Write a short, helpful reply — three to five sentences. Answer directly, and add one practical tip when it helps.\n 4. Sign off as \"The Skyline Experiences team.\"\n\nWHAT NOT TO DO\n - Do not promise refunds, discounts, cancellations, or booking changes.\n - Do not invent details you were not given, such as prices or addresses.\n - Do not mention the weather tool — just talk naturally about the weather.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 3.1,
      "position": [
        112,
        -608
      ],
      "id": "a0622a9a-f188-42d9-b70d-e06ed4169aeb",
      "name": "AI replies directly"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "7a10ac8e-3fd2-4c85-8e45-3439fb479310",
              "name": "customer_email ",
              "value": "=CUSTOMER NAME: \n{{ $json.from.value[0].name }}\n\nCUSTOMER EMAIL ADDRESS\n{{ $json.from.value[0].address }}\n\nCUSTOMER EMAIL CONTENT\n{{ $json.text || $json.html || $json.textAsHtml || $json.snippet || '' }}",
              "type": "string"
            },
            {
              "id": "dc841810-8d2d-4372-86a5-db63413a25d5",
              "name": "email_id",
              "value": "={{ $json.id }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -832,
        -352
      ],
      "id": "e7547cd0-51f1-4bf4-9513-dd15985aafee",
      "name": "Collect Customer Email"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n\t\"type\": \"object\",\n\t\"properties\": {\n\t\t\"reply_email_content_html\": {\n\t\t\t\"type\": \"string\"\n\t\t}\n\t}\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        336,
        -384
      ],
      "id": "e35b90be-bd44-45a1-bd3a-5d6c7d408811",
      "name": "output format"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n    \"type\": \"object\",\n    \"properties\": {\n        \"decision\": {\n            \"type\": \"string\",\n            \"enum\": [\"AI\", \"HUMAN\"]\n        },\n        \"reason\": {\n            \"type\": \"string\"\n        }\n    },\n    \"required\": [\"decision\", \"reason\"]\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        -384,
        -160
      ],
      "id": "d78e77c9-a881-4e51-ae58-0ac3fabe7e96",
      "name": "output format1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $('Collect Customer Email').first().json['customer_email '] }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "WHO YOU ARE\nYou are the assistant for Skyline Experiences. This email needs a person's judgment, so you do NOT write the final reply. Instead you prepare a draft for one of our team members to review, edit, and send. You have a weather tool that gives a five-day forecast for any city — you just give it the city name and nothing else, for example \"Miami\".\n\nBACKGROUND — ABOUT US\nSkyline Experiences runs premium outdoor activities in cities around the world: sunset harbor sails, vineyard tours, hot-air-balloon rides, and walking food tours. Emails reach a human because they involve money, strong emotions, or a special situation — so they need care.\n\nYOU PRODUCE TWO THINGS\n\n1) A SHORT NOTE TO THE REVIEWER\nA few sentences, just for our team member — the customer never sees this. Cover:\n - what the customer is asking for\n - why it needs a human (refund, complaint, change, special occasion, and so on)\n - anything they should decide or double-check before sending\n\n2) A DRAFT REPLY TO THE CUSTOMER\nWrite as much of the reply as you safely can, in our warm, professional tone. Use the weather tool if the weather is relevant. Then:\n - Wherever a person must decide something, or fill in a fact you do not have, leave a clear marker in exactly this form:   [[FILL IN: what is needed]]   For example:   [[FILL IN: confirm whether we can offer a partial refund]]\n - Never guess refund amounts, prices, or booking changes — leave a marker.\n - Sign off as \"The Skyline Experiences team.\"\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 3.1,
      "position": [
        112,
        -208
      ],
      "id": "41f04a7a-644d-4399-941d-94f3fa6f3d45",
      "name": "AI drafts for Human review"
    },
    {
      "parameters": {
        "operation": "5DayForecast",
        "cityName": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('City', ``, 'string') }}"
      },
      "type": "n8n-nodes-base.openWeatherMapTool",
      "typeVersion": 1,
      "position": [
        208,
        -384
      ],
      "id": "fdbde0da-66e4-458b-bc34-da5b82bf1275",
      "name": "Weather tool",
      "credentials": {
        "openWeatherMapApi": {
          "id": "VYgQBqAIn87uZHDs",
          "name": "OpenWeather CDAIO key"
        }
      }
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-5-mini"
        },
        "builtInTools": {},
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.3,
      "position": [
        64,
        -384
      ],
      "id": "d31155bf-accd-45ca-96c0-070104a898fa",
      "name": "OpenAI GPT-5-mini2",
      "credentials": {
        "openAiApi": {
          "id": "kfUvMwXQo7ZO5WoA",
          "name": "CDAIO OpenAI Key"
        }
      }
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-5-mini"
        },
        "builtInTools": {},
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.3,
      "position": [
        64,
        32
      ],
      "id": "38b6bbdd-31ae-4841-9838-4a57f18b2322",
      "name": "OpenAI GPT-5-mini1",
      "credentials": {
        "openAiApi": {
          "id": "kfUvMwXQo7ZO5WoA",
          "name": "CDAIO OpenAI Key"
        }
      }
    },
    {
      "parameters": {
        "operation": "5DayForecast",
        "cityName": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('City', ``, 'string') }}"
      },
      "type": "n8n-nodes-base.openWeatherMapTool",
      "typeVersion": 1,
      "position": [
        208,
        32
      ],
      "id": "e18fe216-c5cc-4a03-842a-cb9c2f611d2e",
      "name": "Weather tool1",
      "credentials": {
        "openWeatherMapApi": {
          "id": "VYgQBqAIn87uZHDs",
          "name": "OpenWeather CDAIO key"
        }
      }
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n    \"type\": \"object\",\n    \"properties\": {\n        \"note_to_reviewer\": { \"type\": \"string\" },\n        \"draft_email\": { \"type\": \"string\" }\n    },\n    \"required\": [\"note_to_reviewer\", \"draft_email\"]\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        352,
        32
      ],
      "id": "a480cf15-d033-4846-86cc-8272c5618d46",
      "name": "output format2"
    },
    {
      "parameters": {
        "content": "## To get started\nClick on the \"Gmail\" node below. Then, towards the bottom in \"sender\", replace YOUR_EMAIL_HERE@EMAIL.COM with your email address",
        "height": 208,
        "width": 288
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -1120,
        -576
      ],
      "id": "34157400-c820-47fe-9b98-8b7ea8836fe3",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "operation": "reply",
        "messageId": "={{ $('Collect Customer Email').first().json.email_id }}",
        "message": "={{ $json.output.reply_email_content_html }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        736,
        -608
      ],
      "id": "f7532cbb-b18c-47ce-a801-45c1748b7f44",
      "name": "Send AI response to customer",
      "webhookId": "fa9f157d-1a2c-4b6a-ba2f-c8ef7d3be7a0",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    },
    {
      "parameters": {
        "operation": "reply",
        "messageId": "={{ $('Collect Customer Email').first().json.email_id }}",
        "emailType": "text",
        "message": "={{ $json.data['Response to Customer'] }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        736,
        -160
      ],
      "id": "29baeb74-3f3f-49ab-a078-b37f81b5cf19",
      "name": "Send edited/approved response to customer",
      "webhookId": "fa9f157d-1a2c-4b6a-ba2f-c8ef7d3be7a0",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    },
    {
      "parameters": {
        "content": "## To use the agent\n\n- send an email from _your_ email address (the same you entered before) to `aiml901sebastienmartin@gmail.com`, which is the agent address\n- wait for the agent reply in your mail box (it can take 1-2min)",
        "height": 240,
        "width": 480,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -608,
        -768
      ],
      "id": "f6209a83-d1b0-4dbc-bbf7-df5a32b708cc",
      "name": "Sticky Note1"
    },
    {
      "parameters": {
        "operation": "sendAndWait",
        "sendTo": "={{ $('Gmail Trigger').first().json.from.value[0].address }}",
        "subject": "Customer email needs your review!",
        "message": "=Dear Skyline Experiences customer service specialist,\n\nAn email was received from a customer and your review is needed. \n\nThank you!\n",
        "responseType": "customForm",
        "formFields": {
          "values": [
            {
              "fieldLabel": "Response to Customer",
              "fieldType": "textarea",
              "defaultValue": "={{ $json.output.draft_email }}",
              "requiredField": true
            }
          ]
        },
        "options": {
          "messageButtonLabel": "Reply to customer",
          "responseFormTitle": "Please edit the draft and respond to the customer",
          "responseFormDescription": "={{ $('Collect Customer Email').first().json['customer_email '] }}  \n\nINFORMATION TO CONSIDER:\n{{ $json.output.note_to_reviewer }}",
          "responseFormCustomCss": ":root {\n\t--font-family: 'Open Sans', sans-serif;\n\t--font-weight-normal: 400;\n\t--font-weight-bold: 600;\n\t--font-size-body: 12px;\n\t--font-size-label: 14px;\n\t--font-size-test-notice: 12px;\n\t--font-size-input: 14px;\n\t--font-size-header: 20px;\n\t--font-size-paragraph: 14px;\n\t--font-size-link: 12px;\n\t--font-size-error: 12px;\n\t--font-size-html-h1: 28px;\n\t--font-size-html-h2: 20px;\n\t--font-size-html-h3: 16px;\n\t--font-size-html-h4: 14px;\n\t--font-size-html-h5: 12px;\n\t--font-size-html-h6: 10px;\n\t--font-size-subheader: 14px;\n\n\t/* Colors */\n\t--color-background: #fbfcfe;\n\t--color-test-notice-text: #e6a23d;\n\t--color-test-notice-bg: #fefaf6;\n\t--color-test-notice-border: #f6dcb7;\n\t--color-card-bg: #ffffff;\n\t--color-card-border: #dbdfe7;\n\t--color-card-shadow: rgba(99, 77, 255, 0.06);\n\t--color-link: #7e8186;\n\t--color-header: #525356;\n\t--color-label: #555555;\n\t--color-input-border: #dbdfe7;\n\t--color-input-text: #71747A;\n\t--color-focus-border: rgb(90, 76, 194);\n\t--color-submit-btn-bg: #ff6d5a;\n\t--color-submit-btn-text: #ffffff;\n\t--color-error: #ea1f30;\n\t--color-required: #ff6d5a;\n\t--color-clear-button-bg: #7e8186;\n\t--color-html-text: #555;\n\t--color-html-link: #ff6d5a;\n\t--color-header-subtext: #7e8186;\n\n\t/* Border Radii */\n\t--border-radius-card: 8px;\n\t--border-radius-input: 6px;\n\t--border-radius-clear-btn: 50%;\n\t--card-border-radius: 8px;\n\n\t/* Spacing */\n\t--padding-container-top: 24px;\n\t--padding-card: 24px;\n\t--padding-test-notice-vertical: 12px;\n\t--padding-test-notice-horizontal: 24px;\n\t--margin-bottom-card: 16px;\n\t--padding-form-input: 12px;\n\t--card-padding: 24px;\n\t--card-margin-bottom: 16px;\n\n\t/* Dimensions */\n\t--container-width: 448px;\n\t--submit-btn-height: 48px;\n\t--checkbox-size: 18px;\n\n\t/* Others */\n\t--box-shadow-card: 0px 4px 16px 0px var(--color-card-shadow);\n\t--opacity-placeholder: 0.5;\n}",
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.2,
      "position": [
        496,
        -160
      ],
      "id": "96bad417-dece-4e54-955d-21b4bbfed247",
      "name": "Ask for human reviewer approval and wait",
      "webhookId": "c3eaf389-00cc-49d2-b31b-3c80876b03b9",
      "credentials": {
        "gmailOAuth2": {
          "id": "UwWZPeiiMkSypGTt",
          "name": "CDAIO Gmail"
        }
      }
    }
  ],
  "connections": {
    "Gmail Trigger": {
      "main": [
        [
          {
            "node": "Collect Customer Email",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI GPT-5-mini": {
      "ai_languageModel": [
        [
          {
            "node": "AI: Escalate to human?",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Decision": {
      "main": [
        [
          {
            "node": "AI replies directly",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "AI drafts for Human review",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI: Escalate to human?": {
      "main": [
        [
          {
            "node": "Decision",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "AI replies directly": {
      "main": [
        [
          {
            "node": "Send AI response to customer",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Collect Customer Email": {
      "main": [
        [
          {
            "node": "AI: Escalate to human?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "output format": {
      "ai_outputParser": [
        [
          {
            "node": "AI replies directly",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "output format1": {
      "ai_outputParser": [
        [
          {
            "node": "AI: Escalate to human?",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "AI drafts for Human review": {
      "main": [
        [
          {
            "node": "Ask for human reviewer approval and wait",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Weather tool": {
      "ai_tool": [
        [
          {
            "node": "AI replies directly",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI GPT-5-mini2": {
      "ai_languageModel": [
        [
          {
            "node": "AI replies directly",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI GPT-5-mini1": {
      "ai_languageModel": [
        [
          {
            "node": "AI drafts for Human review",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Weather tool1": {
      "ai_tool": [
        [
          {
            "node": "AI drafts for Human review",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "output format2": {
      "ai_outputParser": [
        [
          {
            "node": "AI drafts for Human review",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Ask for human reviewer approval and wait": {
      "main": [
        [
          {
            "node": "Send edited/approved response to customer",
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
{% endraw %}

## 4 · Talk to Maya

For the second half, we step back from building and look at a real, messy organization. Meet **Maya Chen**, who's leading the *AfterVisit AI* pilot at Proxima Health Systems — a North American distributor of medical equipment. She's convinced it's a winner. **You're the outside advisor she brought in.**

Interview her: figure out what she's really trying to do, who inside the company will make or break it, and the risks her optimism is glossing over. Then we'll debrief together — *where does the human stay, who resists, and how would you know in 90 days whether it worked?*

<p style="margin: 1.2rem 0;">
  <a href="/p/maya.html" target="_blank" rel="noopener" style="display:inline-block; background:#0d9488; color:#fff; font-weight:600; padding:12px 22px; border-radius:10px; text-decoration:none;">Open the chat with Maya in full screen ↗</a>
</p>

<iframe src="/p/maya.html" title="Chat with Maya Chen" loading="lazy" style="width:100%; height:700px; border:1px solid rgba(15,31,28,0.15); border-radius:14px; box-shadow:0 4px 18px rgba(15,31,28,0.08); background:#f4f7f6;"></iframe>

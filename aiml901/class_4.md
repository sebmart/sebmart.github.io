---
title: "Class 4: AI Agents"
author:
  - Sébastien Martin
---
## The n8n workflow of "Wiki Kai"

If you'd like to try it on your own, copy this into a new n8n workflow:

```json
{
  "nodes": [
    {
      "parameters": {
        "promptType": "define",
        "text": "=User name: {{ $json.message.chat.first_name }} {{ $json.message.chat.last_name }}\n\nTelegram message: \n{{ $json.message.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "=You are \"Wiki Kai\", a helpful AI bot on Telegram that replies to user requests and uses Wikipedia searches to back its answers with a clickable wiki link.\nYou will be part of a conversation on Telegram. You have a tool that allows you to get information on Wikipedia, and you must use it to back your answers: never share information without a link (formatted in markdown).\n\nYou will output both the reply to the user on Telegram and the Wikipedia search terms you used."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        112,
        32
      ],
      "id": "1f2aa831-a636-42ef-9762-7c0c7df9ef19",
      "name": "AI Agent"
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $json.message.from.id }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        112,
        256
      ],
      "id": "3ff69c3e-02ed-4540-9b2e-26e22d756ddc",
      "name": "Simple Memory"
    },
    {
      "parameters": {},
      "type": "@n8n/n8n-nodes-langchain.toolWikipedia",
      "typeVersion": 1,
      "position": [
        256,
        256
      ],
      "id": "9ae73666-d0a5-4f79-9d4d-701de0f8776f",
      "name": "Wikipedia"
    },
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
        -32,
        256
      ],
      "id": "e8284a85-4201-4599-aad0-59e200fe675b",
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
        "chatId": "={{ $('Receive Telegram message').item.json.message.chat.id }}",
        "text": "={{ $json.output.user_reply }}",
        "additionalFields": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        640,
        -80
      ],
      "id": "dac85d0f-4966-4203-8a34-0bd8a6a9d068",
      "name": "Reply to Telegram message",
      "webhookId": "2dd8c9be-8a69-4f0f-9a6e-094b2274f41f",
      "credentials": {
        "telegramApi": {
          "id": "gkXMftcDBSNuF8fg",
          "name": "Wiki Kai Telegram"
        }
      }
    },
    {
      "parameters": {
        "dataTableId": {
          "__rl": true,
          "value": "mNqdOJYsd2xUkijR",
          "mode": "list",
          "cachedResultName": "Wiki Kai log",
          "cachedResultUrl": "/projects/8RXE7aQqHFIRCmJF/datatables/mNqdOJYsd2xUkijR"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "kaiMessage": "={{ $json.output.user_reply }}",
            "userMessage": "={{ $('Receive Telegram message').item.json.message.text }}",
            "userName": "={{ $('Receive Telegram message').item.json.message.chat.first_name }} {{ $('Receive Telegram message').item.json.message.from.last_name }}",
            "wikiSearch": "={{ $json.output.wiki_search }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "userName",
              "displayName": "userName",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "userMessage",
              "displayName": "userMessage",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "kaiMessage",
              "displayName": "kaiMessage",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            },
            {
              "id": "wikiSearch",
              "displayName": "wikiSearch",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "readOnly": false,
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        },
        "options": {}
      },
      "type": "n8n-nodes-base.dataTable",
      "typeVersion": 1,
      "position": [
        640,
        160
      ],
      "id": "f6e9910a-6a2f-4d6a-b715-5656a9e410bd",
      "name": "Log Conversation to table"
    },
    {
      "parameters": {
        "jsonSchemaExample": "{\n\t\"user_reply\": \"hello user\",\n\t\"wiki_search\": \"LLM\"\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        384,
        256
      ],
      "id": "b3821de8-8a94-4984-a6c4-a262471a8ce9",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "updates": [
          "message"
        ],
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.telegramTrigger",
      "typeVersion": 1.2,
      "position": [
        -160,
        32
      ],
      "id": "649716b7-2d33-4559-a9fd-9a6011a0d722",
      "name": "Receive Telegram message",
      "webhookId": "67589cad-8352-4646-b5f8-bd5997c659e3",
      "credentials": {
        "telegramApi": {
          "id": "gkXMftcDBSNuF8fg",
          "name": "Wiki Kai Telegram"
        }
      }
    }
  ],
  "connections": {
    "AI Agent": {
      "main": [
        [
          {
            "node": "Reply to Telegram message",
            "type": "main",
            "index": 0
          },
          {
            "node": "Log Conversation to table",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Simple Memory": {
      "ai_memory": [
        [
          {
            "node": "AI Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Wikipedia": {
      "ai_tool": [
        [
          {
            "node": "AI Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
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
    "Structured Output Parser": {
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
    "Receive Telegram message": {
      "main": [
        [
          {
            "node": "AI Agent",
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

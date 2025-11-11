---
title: Recitation 3
author: Alex Jensen
---
While we have started to see some of the tools available to AI agents, we sometimes want to build our own custom tools. We will focus on using **sub-workflows** to do so. 

Additionally, sub-workflows let us make our system more modular and allow us to reuse "building blocks" (workflows) that we create. For example, take our Google Calendar agent from Recitation 1. We might have multiple workflows that use this, such as a personal assistant but also a broader workflow that sends out event invites and reminders to multiple people. We can make this agent into a sub-workflow and then call it from each of these other workflows instead of building the exact same agent into multiple workflows.

To demonstrate this, we consider a communications team at a nonprofit in Evanston that needs to create social media posts and send out press releases. Because the nonprofit works with many Spanish-speaking people, it is important that the social media posts are bilingual. They are hoping to utilize AI to be able to create high-quality content that engages with their community.

---
You can watch a video recording of the recitation here:
![Recitation 3 Recording](https://www.youtube.com/watch?v=tGdDLdCqQe8)

---
## You'll Need...

- OpenAI connection
- Gmail connection
- **Optional:**
	- Google Sheets connection
	- A copy of [this Google Form](https://docs.google.com/forms/d/1VVZw92zXz0YlRbYuar2YAKp5ipo-0afF2aHn0fMnvgE/copy) with a connected Google Sheet

---
## Learning Objectives

- Understanding sub-workflows and calling them both as tools and as parts of our main workflow
- Hierarchical agents
- Human-in-the-loop

---
# Core Content

## The Workflow

Our workflow will

1. Receive ideas on social media posts and press releases from a form,
2. Use AI agents to create first drafts based on these details,
3. Present it to a member of the comms team who can then iterate and finally approve posts,
4. Translate social media posts to Spanish using appropriate language,
5. Send final drafts by email to the comms team for posting.
## Sub-workflows

Press releases and social media posts are extremely different formats with different audiences. While we could build a single agent to handle both, in practice performance can suffer when you overload a single agent with too many tools (though this is becoming less and less of a problem). Instead, by decomposing into two agents each specialized for its domain, you reduce complexity per agent and (hopefully) improve reliability, which we do using **evaluation** and will be discussed in Recitation 4. Realistically, the given example could easily be handled by one agent, but this is more to illustrate some different designs that you can use in your projects.

In n8n, a **sub-workflow** is a workflow that is called by another workflow. We can use this both to create modules that we can drag and drop in multiple places and also to create custom tools for our AI agents. We will use this to create a **hierarchical agent structure**, where we have one agent that serves simply as a "supervisor" of two other agents, one of which only creates social media posts and the other that only creates press releases. The supervisor agent designates tasks to the social media and press release agents, which then will return posts to the supervisor.

To do this, we start by creating two workflows called `Press Release Agent` and `Social Media Agent`. These will be fairly simple workflows. Copy and paste in the following code and explore the two agents.

Press Release Agent:
```JSON
{
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            {
              "name": "text"
            },
            {
              "name": "title"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        0,
        0
      ],
      "id": "f7d178e5-8b10-4e96-8ded-0625571c1424",
      "name": "When Executed by Another Workflow"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"press_release_title\", \"press_release_body\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"press_release_title\": { \"type\": \"string\", \"description\": \"Short headline.\" },\n    \"press_release_body\": { \"type\": \"string\", \"description\": \"Press release body text (headline NOT duplicated).\" }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        368,
        208
      ],
      "id": "d6bfbd25-a5f2-4412-a765-d4f16b39b550",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list",
          "cachedResultName": "gpt-4o"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        192,
        208
      ],
      "id": "83969bbb-e37e-4ac2-9d7d-170ac2aed97d",
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
        "assignments": {
          "assignments": [
            {
              "id": "9625122e-1bc8-4230-a6e0-ae94b835f49b",
              "name": "press_release_body",
              "value": "={{ $json.output.press_release_body }}\n\nEvanston Immigrant Rights is an organization founded in 2020 that works to strengthen civic engagement, fight discrimination, and foster economic opportunity for Latine families.",
              "type": "string"
            }
          ]
        },
        "includeOtherFields": true,
        "include": "selected",
        "includeFields": "output.press_release_title",
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        560,
        0
      ],
      "id": "058a7c54-4db9-4b2b-bb1d-6532e41c9e16",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Text: {{ $json.text }}\nTitle: {{ $json.title }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants.\n\nUsing the content provided, your role is to create English-language press releases following AP format that are both accessible and engaging. These should be professional and ready to send to news outlets.\n\n*Do not write in Spanish; this will later be translated.*"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        224,
        0
      ],
      "id": "af1d9dbb-9537-4cb8-a907-aa9ed3cd3400",
      "name": "AI Agent"
    }
  ],
  "connections": {
    "When Executed by Another Workflow": {
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
    "AI Agent": {
      "main": [
        [
          {
            "node": "Edit Fields",
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

Social Media Agent:
```JSON
{
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            {
              "name": "text"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        0,
        0
      ],
      "id": "696f05a8-7a70-4b0c-b71f-a8c3ad1ecbdc",
      "name": "When Executed by Another Workflow"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"social_media_body\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"social_media_body\": { \"type\": \"string\", \"description\": \"One-paragraph social post.\" }\n}\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        368,
        208
      ],
      "id": "3354b318-7ee6-41a2-90b5-783e7b460a0b",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list",
          "cachedResultName": "gpt-4o"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        192,
        208
      ],
      "id": "ea1a237b-bbe2-4854-8a91-1a875e8ec17d",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "uvUQw4I0j1mG2TKg",
          "name": "Alex Jensen Student OpenAI"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants.\n\nUsing the content provided, your role is to create English-language social media posts that are both accessible and engaging. These are posts for primarily Facebook and Instagram; write a single post that is common for both and do not create separate posts for multiple platforms.\n\n*Do not write in Spanish; this will later be translated.*"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        208,
        0
      ],
      "id": "c917db3f-a7fa-4926-a7f5-a02a3df0f843",
      "name": "AI Agent"
    }
  ],
  "connections": {
    "When Executed by Another Workflow": {
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
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

Make sure to select your credentials for the OpenAI model.

You should recognize all of the nodes besides the `When Executed by Another Workflow` trigger. This allows us to call the workflow from another one. Click into one of these nodes. While we can let all data be accepted, we choose the `Input data mode` as `Define using fields below` to ensure that our data arrives the way that we want it.

Within n8n, there are two ways in which we can call these sub-workflows that start with the `When Executed by Another Workflow` trigger.

1. Within a workflow using the `Execute Sub-workflow` node. This is helpful if we have many workflows that have one part of the workflow that is exactly the same. Instead of rebuilding it from scratch, we can just build it once as a separate workflow and then use the `Execute Sub-workflow` node in each other workflow that needs that process.
2. As a tool using the `Call n8n Workflow Tool`. This lets us build custom tools for our agents to use and then call when they deem necessary.

---
## Building the Comms Agent Part 1: First Draft

We will build our agent, following the steps shown before. There are steps walking through each part below, but you can also copy this code:
```JSON
{
  "nodes": [
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"social_media_body\", \"press_release_title\", \"press_release_body\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"social_media_body\": { \"type\": \"string\", \"description\": \"One-paragraph social post. May be empty.\" },\n    \"press_release_title\": { \"type\": \"string\", \"description\": \"Short headline. May be empty.\" },\n    \"press_release_body\": { \"type\": \"string\", \"description\": \"Press release body text (headline NOT duplicated). May be empty.\" }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        720,
        912
      ],
      "id": "cc3dff7d-3a20-4162-8489-47b0cac126cd",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4.1-nano",
          "mode": "list",
          "cachedResultName": "gpt-4.1-nano"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        208,
        912
      ],
      "id": "36a08a96-ec5e-45b0-8202-f2f3573665bb",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "uvUQw4I0j1mG2TKg",
          "name": "Alex Jensen Student OpenAI"
        }
      }
    },
    {
      "parameters": {
        "description": "Call this tool to write English-language press releases.",
        "workflowId": {
          "__rl": true,
          "value": "5Os35ha1b6CBLvL5",
          "mode": "list",
          "cachedResultUrl": "/workflow/5Os35ha1b6CBLvL5",
          "cachedResultName": "Press Release Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "text": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('text', ``, 'string') }}",
            "title": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('title', ``, 'string') }}"
          },
          "matchingColumns": [
            "text"
          ],
          "schema": [
            {
              "id": "text",
              "displayName": "text",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            },
            {
              "id": "title",
              "displayName": "title",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        464,
        1056
      ],
      "id": "ad77909b-9edc-4fae-8216-df0a5748bc2a",
      "name": "Press Release"
    },
    {
      "parameters": {
        "description": "Call this tool to write English-language social media posts.",
        "workflowId": {
          "__rl": true,
          "value": "8CsMXZr7diykgdrL",
          "mode": "list",
          "cachedResultUrl": "/workflow/8CsMXZr7diykgdrL",
          "cachedResultName": "Social Media Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "text": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('text', ``, 'string') }}"
          },
          "matchingColumns": [
            "text"
          ],
          "schema": [
            {
              "id": "text",
              "displayName": "text",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        608,
        1056
      ],
      "id": "eafa83ae-9bbb-40b6-a766-1a83d41dd984",
      "name": "Social Media"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Title:  {{ $json.Title }}\nContent: {{ $json.Content }}\nFormat(s): {{ $json.Format }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants.\n\nUsing the content provided, your role is to use your tools to create English-language social media posts and/or press releases (based on the formats) that are both accessible and engaging. \n\nWhen the format includes social media, use the Social Media tool to write posts. Similarly, use the Press Release tool to write press releases. Do not write these posts/press releases yourself; always use the tools to do so."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        448,
        672
      ],
      "id": "a86f0fbb-bfc0-4322-8538-0d940021a829",
      "name": "First Draft Agent"
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $json.submittedAt }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        352,
        912
      ],
      "id": "8716ae83-8155-4061-84ee-5a89ddd88230",
      "name": "Simple Memory"
    },
    {
      "parameters": {
        "formTitle": "Communications Posts",
        "formFields": {
          "values": [
            {
              "fieldLabel": "Title",
              "requiredField": true
            },
            {
              "fieldLabel": "Content",
              "requiredField": true
            },
            {
              "fieldLabel": "Format",
              "fieldType": "checkbox",
              "fieldOptions": {
                "values": [
                  {
                    "option": "Press Release"
                  },
                  {
                    "option": "Social Media Post"
                  }
                ]
              },
              "requiredField": true
            },
            {
              "fieldLabel": "Your name",
              "requiredField": true
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.formTrigger",
      "typeVersion": 2.3,
      "position": [
        192,
        672
      ],
      "id": "04f3a35a-d9cf-44cd-9875-d7a7a10e2837",
      "name": "On form submission",
      "webhookId": "b020cfdb-1b8d-45a1-a02a-838a27a95d04"
    }
  ],
  "connections": {
    "Structured Output Parser": {
      "ai_outputParser": [
        [
          {
            "node": "First Draft Agent",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "First Draft Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Press Release": {
      "ai_tool": [
        [
          {
            "node": "First Draft Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Social Media": {
      "ai_tool": [
        [
          {
            "node": "First Draft Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "First Draft Agent": {
      "main": [
        []
      ]
    },
    "Simple Memory": {
      "ai_memory": [
        [
          {
            "node": "First Draft Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "On form submission": {
      "main": [
        [
          {
            "node": "First Draft Agent",
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
### Step 1: n8n Form

We need a way to start the workflow. In this case, we want members of the team to be able to give raw information about posts. Specifically, we need a **post name** (for internal tracking), **post description** (any relevant details, such as date and time), and **medium** (social media post, press release, or both).

- **Add node**: `n8n Form → On new n8n Form event`
	- Add a `Form Title` (what the form is called)
	- Click `Add Form Element`
		- Field Name: `Title`
		- Element Type: `Text`
		- Make this a required field
	- Click `Add Form Element`
		- Field Name: `Content`
		- Element Type: `Text`
		- Make this a required field
	- Click `Add Form Element`
		- Field Name: `Format`
		- Element Type: `Checkboxes`
		- Make two checkboxes, `Press Release` and `Social Media Post`
		- Limit Selection: `Unlimited` (since we want users to be able to draft social media posts and press releases simultaneously)
		- Make this a required field
	- Click `Add Form Element`
		- Field Name: `Your name`
		- Element Type: `Text`
		- Make this a required field
		- If we wanted, we could attach a Google Sheet to track tickets and this would let us see who was requesting what. This would be useful if people outside of the comms team are requesting posts and we need to talk to them about any details.

> [!info] Alternative: Google Form
> We use the n8n Form due to its simplicity. Remember: for your project, you only need an MVP, and we want you to focus on the importance of AI rather than connecting to other services, which can be tricky. 
> 
> However, it is fairly straightforward to connect this to a Google Form. To do so, make a Google Form and then under `Responses`, click `Link to Sheets`. Now, you have a Google Sheet such that if someone responds to the Google Form, it will appear in the Google Sheet. We can then use the Google Sheet trigger in n8n to start the workflow!

---
### Step 2: First Draft Agent

We will use a **hierarchical agent** approach to get the first draft of our posts/press releases. Specifically, the First Draft Agent serves as a supervisor/commander and then delegates responsibility to create these posts to the Press Release Agent and the Social Media Agent.

- **Add node:** `AI Agent`
	- Add an appropriate chat model and `Simple Memory`. For `Session ID`, choose `Define below`. We want the model to remember what it has just done for the given execution in case it makes an error and needs to retry, so for the `Key`, an easy choice would be `{{ $json.submittedAt }}`. Assuming that two responses are not received in the same second, this will mean that only messages sent for the given execution will be stored in the memory for the current execution.
	- `Prompt`: 
	```JSON
Title:  {{ $json.Title }}
Content: {{ $json.Content }}
Format(s): {{ $json.Format }}
	```
	- `System Message`:
```Text
Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants.

Using the content provided, your role is to use your tools to create English-language social media posts and/or press releases (based on the formats) that are both accessible and engaging. 

When the format includes social media, use the Social Media tool to write posts. Similarly, use the Press Release tool to write press releases. Do not write these posts/press releases yourself; always use the tools to do so.
```
- Attach a `Structured Output Parser` and choose `Define using JSON Schema`. For the input schema, put
```JSON
  {
  "type": "object",
  "required": ["social_media_body", "press_release_title", "press_release_body"],
  "additionalProperties": false,
  "properties": {
    "social_media_body": { "type": "string", "description": "One-paragraph social post. May be empty." },
    "press_release_title": { "type": "string", "description": "Short headline. May be empty." },
    "press_release_body": { "type": "string", "description": "Press release body text (headline NOT duplicated). May be empty." }
  }
}
  ```
  This means that this agent will output a press release and title, as well as a social media post based on the input.

---
### Step 3: Sub-Workflow Calls

Now, press the `+` for `Tools` and select `Call n8n Workflow Tool`. This is how we call a sub-workflow. Choose the Press Release Agent. You should have two `Workflow Inputs` appear: **text** and **title**. Let these be chosen automatically by the model. Now, repeat with the Social Media Agent and its one input of **text**. This lets our agent now access these workflows as tools and choose the inputs to the workflows!

---
### Exercises

1. Add a question to the n8n Form that accepts the user’s email.
2. Try to change the Social Media Agent to never use hashtags.
3. **Challenge:** Create another workflow that drafts posts specifically for X/Twitter and obeys the character limit and add it to the First Draft Agent’s tools.

---
## Building the Comms Agent Part 2: Human-in-the-Loop Edits

It would be reckless for an organization to directly post AI-generated content without human overview. The content might not match the tone of the organization or could be missing information entirely.

We will implement a **human-in-the-loop** architecture, where our workflow will wait for a member of the comms team to approve the post before sending it on. However, the team member should also be able to suggest edits and iterate on posts before sending them out, as well.

We will walk through each step, but you can also copy and paste the following into n8n and then connect the output of the `First Draft Agent` to `Input 1` of the `Merge` node.

```JSON
{
  "nodes": [
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"social_media_body\", \"press_release_title\", \"press_release_body\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"social_media_body\": { \"type\": \"string\", \"description\": \"One-paragraph social post. May be empty.\" },\n    \"press_release_title\": { \"type\": \"string\", \"description\": \"Short headline. May be empty.\" },\n    \"press_release_body\": { \"type\": \"string\", \"description\": \"Press release body text (headline NOT duplicated). May be empty.\" }\n  }\n}"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1664,
        112
      ],
      "id": "26aa4f6a-5805-42a5-85e7-d994fc5b0bd4",
      "name": "Structured Output Parser1"
    },
    {
      "parameters": {
        "resume": "form",
        "formTitle": "Post Edit Form",
        "formDescription": "=Press Release Title: {{ $json.output.press_release_title }}\n\nPress Release Body: {{ $json.output.press_release_body }}\n\nSocial Media Body: {{ $json.output.social_media_body }}",
        "formFields": {
          "values": [
            {
              "fieldLabel": "Approved?",
              "fieldType": "radio",
              "fieldOptions": {
                "values": [
                  {
                    "option": "Yes"
                  },
                  {
                    "option": "No"
                  }
                ]
              },
              "requiredField": true
            },
            {
              "fieldLabel": "Edits",
              "placeholder": "Add edits here"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.wait",
      "typeVersion": 1.1,
      "position": [
        1040,
        -224
      ],
      "id": "f9a95665-bd2a-473b-9a1d-e5a95dc0ac35",
      "name": "Wait",
      "webhookId": "d7b8fbd7-19e3-407f-8609-d4c82381669e"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list",
          "cachedResultName": "gpt-4o"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1456,
        112
      ],
      "id": "dfae788c-bea7-46f6-941c-0013eced2528",
      "name": "OpenAI Chat Model2",
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
              "id": "c6505b52-8c6a-4cd2-9c61-a1df48c5d8bc",
              "leftValue": "={{ $json[\"Approved?\"] }}",
              "rightValue": "Yes",
              "operator": {
                "type": "string",
                "operation": "equals",
                "name": "filter.operator.equals"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        1280,
        -224
      ],
      "id": "0e3503c2-9536-4be4-91b1-81e6cc088a18",
      "name": "Approved?"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        800,
        -224
      ],
      "id": "248ab95e-b6f0-4555-8dea-c8b8cced42ca",
      "name": "Merge",
      "alwaysOutputData": false
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Recitation 3 - Advanced n8n Usage",
        "height": 512,
        "width": 688,
        "color": 4
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        768,
        -800
      ],
      "id": "c355edd6-ea3b-4d2b-82c4-15ec45e9de6e",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Title: {{ $('Merge').item.json.output.press_release_title }}\nPress Release body:{{ $('Merge').item.json.output.press_release_body }}\nSocial Media body: {{ $('Merge').item.json.output.social_media_body }}\nEdits: {{ $json.Edits }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants throughout the greater Chicago area.\n\nYou will be given messages as well as edits that are wanted. Using this, your role is to edit the messages given to reflect these changes and return them to the user. These will be press releases and social media posts associated with community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants throughout Evanston and the broader Chicago area.\n\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1472,
        -144
      ],
      "id": "f901dba1-62eb-4d44-9382-ae4cde383dc2",
      "name": "Editor"
    }
  ],
  "connections": {
    "Structured Output Parser1": {
      "ai_outputParser": [
        [
          {
            "node": "Editor",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Wait": {
      "main": [
        [
          {
            "node": "Approved?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI Chat Model2": {
      "ai_languageModel": [
        [
          {
            "node": "Editor",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Approved?": {
      "main": [
        [],
        [
          {
            "node": "Editor",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Merge": {
      "main": [
        [
          {
            "node": "Wait",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Editor": {
      "main": [
        [
          {
            "node": "Merge",
            "type": "main",
            "index": 1
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
### Step 1: Merge

- **Add node:** `Merge`. Choose mode as `Append` with 2 inputs and attach the `First Draft Agent` to one of the inputs. We will assume that you attach it to `Input 1` for now.
- **What it does:** We are going to make a loop. This is an easy way to ensure that we can get an input from 2 different sources: our initial trigger or another round of the loop.

---
### Step 2: Wait for Human Response

- **Add node:** `Wait`
	- `Resume`: Choose `On Form Submitted`. This lets us present information as a form for the team to review.
	- `Form Title`: I chose `Post Edit Form`, but this can be anything. It just presents as the title of the form to the user.
	- `Form Description`: We want to include what the posts look like so the user can review them, so use something like
	```JSON
Press Release Title: {{ $json.output.press_release_title }}

Press Release Body: {{ $json.output.press_release_body }}

Social Media Body: {{ $json.output.social_media_body }}
	```
	- `Respond When`: `Form is Submitted`
	- This is another n8n form. We need to add several form elements:
		- `Field Name`: `Approved?`
			- `Element Type`: Choose `Radio Buttons` and label them `Yes` and `No`. You can experiment with other types, but this just lets users easily approve or not.
			- Make this a required field.
		- `Field Name`: `Edits`
			- `Element Type`: `Text`. This will let users add edits if they want.
			- This does _not_ need to be required. If a user is approving the posts, then they won't be suggesting edits.
- **What it does:** This creates a form where the comms team can either approve or reject the posts and provide feedback/edits.
---
### Step 3: Approval

- **Add node:** `If`
	- value1: 
```JSON
{{ $json["Approved?"] }}
```

	- value2: Yes
- **What it does:** If the user approves the posts, then we take the `true` branch. Otherwise, we take the `false` branch and continue to edit.
---
### Step 4: The Editor

- **Add node:** `AI Agent`. Connect this to the `false` output from the `If` node.
	- Connect a `Structure Output Parser` with the JSON schema
```JSON
{
  "type": "object",
  "required": ["social_media_body", "press_release_title", "press_release_body"],
  "additionalProperties": false,
  "properties": {
    "social_media_body": { "type": "string", "description": "One-paragraph social post. May be empty." },
    "press_release_title": { "type": "string", "description": "Short headline. May be empty." },
    "press_release_body": { "type": "string", "description": "Press release body text (headline NOT duplicated). May be empty." }
  }
}
```
- `Prompt (User Message)`: 
```JSON
Title: {{ $('Merge').item.json.output.press_release_title }}
Press Release body:{{ $('Merge').item.json.output.press_release_body }}
Social Media body: {{ $('Merge').item.json.output.social_media_body }}
Edits: {{ $json.Edits }}
```
- `System Message`:
```Text
Act as a communications specialist with expertise in community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants throughout Minnesota.

You will be given messages as well as edits that are wanted. Using this, your role is to edit the messages given to reflect these changes and return them to the user. These will be press releases and social media posts associated with community organizing and Latine public engagement, targeting a diverse audience of Latine immigrants throughout Evanston and the broader Chicago area.

```
- **What it does:** This takes the posts and the edits and incorporates them. Note that in the system message, we still want to provide some information about the context so it does not stray too far from the original message. 

Finally, connect the output to `Input 2` of the `Merge` node.

---
### Exercises

1. What happens if the reviewer rejects the post but does not provide any edits?
2. We used the Wait node, but n8n has many human-in-the-loop options. Try to set this up with Gmail instead. What needs to change?
3. It's possible that if we were to reject a post many times that the tone of the message would stray from our original attempt. While this might be what we want, this could also result in the message sounding worse and more generic AI-generated content. What steps could we take at this point to counteract this?
4. Press releases often have character limits. Try to change the workflow to enforce a limit of 500 characters.
5. **Challenge:** Right now, a reviewer cannot approve a press release but reject a social media post, for example. Try to change the workflow so that press releases and social media posts are routed separately.

---
## Building the Comms Agent Part 3: Translation and Sending

For this recitation, we will make the simplifying assumption that for our organization, all social media posts should be bilingual, while press releases will be in English. However, we'll expand upon this in the exercises.

Below is the code that you can copy for this portion. Connect the `true` output of the `Approved?` node to the input of the `Needs Spanish Translation?` node.

```JSON
{
  "nodes": [
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
              "id": "4ceb4881-fe73-4b14-933c-644d65201a7d",
              "leftValue": "={{ $('On form submission').item.json.Format }}",
              "rightValue": "Social Media Post",
              "operator": {
                "type": "array",
                "operation": "contains",
                "rightType": "any"
              }
            }
          ],
          "combinator": "and"
        },
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        2048,
        672
      ],
      "id": "62fb3963-b615-4ed4-983f-95695ae9099f",
      "name": "Needs Spanish translation?"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Text: {{ $('Merge').item.json.output.social_media_body }}",
        "options": {
          "systemMessage": "Act as a professional English-Spanish translator and communications specialist with expertise in community organizing and Latine public engagement. You will be provided with English-language text that needs to be translated to Spanish. Use Latin American Spanish, targeting a diverse audience of Latine immigrants throughout Evanston and the broader Chicago area. Use an approachable tone for social media outreach but be sure to use “usted” instead of “tú” unless told otherwise. Use terminology widely understood by Spanish-speaking immigrants from a range of Latin American countries including Mexico, El Salvador, Ecuador, and beyond."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        2464,
        560
      ],
      "id": "85b6ccec-1794-4944-87f0-2c3cf83b66c5",
      "name": "Translator"
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
        2432,
        704
      ],
      "id": "63b739a0-8581-417a-a1bf-df0bf58816af",
      "name": "OpenAI Chat Model1",
      "credentials": {
        "openAiApi": {
          "id": "uvUQw4I0j1mG2TKg",
          "name": "Alex Jensen Student OpenAI"
        }
      }
    },
    {
      "parameters": {
        "sendTo": "alexjensenaiml901@gmail.com",
        "subject": "Draft of Post",
        "emailType": "text",
        "message": "=Press Release title: {{ $('Merge').item.json.output.press_release_title }}\n\nPress Release body: {{ $('Merge').item.json.output.press_release_body }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        2528,
        832
      ],
      "id": "ad1fdd37-5614-4af4-8fa8-9aa79ddfa13d",
      "name": "Send a message (no Spanish)",
      "webhookId": "5541a481-a428-46b1-891b-967e41f8c545",
      "credentials": {
        "gmailOAuth2": {
          "id": "9tmoAeGxRcPZeGwf",
          "name": "Alex Jensen Student Gmail"
        }
      }
    },
    {
      "parameters": {
        "sendTo": "alexjensenaiml901@gmail.com",
        "subject": "Draft of Post",
        "emailType": "text",
        "message": "=Press Release title: {{ $('Merge').item.json.output.press_release_title }}\n\nPress Release body: {{ $('Merge').item.json.output.press_release_body }}\n\nPost body (English): {{ $('Merge').item.json.output.social_media_body }}\n\nPost body (Spanish): {{ $('Translator').item.json.output }}",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        2784,
        560
      ],
      "id": "a5b15f52-fb23-4fca-a429-0b2bcfeb559e",
      "name": "Send a message (with Spanish)",
      "webhookId": "5541a481-a428-46b1-891b-967e41f8c545",
      "credentials": {
        "gmailOAuth2": {
          "id": "9tmoAeGxRcPZeGwf",
          "name": "Alex Jensen Student Gmail"
        }
      }
    }
  ],
  "connections": {
    "Needs Spanish translation?": {
      "main": [
        [
          {
            "node": "Translator",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Send a message (no Spanish)",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Translator": {
      "main": [
        [
          {
            "node": "Send a message (with Spanish)",
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
            "node": "Translator",
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
### Step 1: Spanish Translation

- **Add node:** `If`
	- Set value1 as 
  ```JSON
{{ $('On form submission').item.json.Format }}
```
	- Change the center condition to `Array → contains`
	- Set value2 as `Social Media`
- **What it does:** The n8n Form provides the choices of Social Media and/or Press Release as potential formats. The `Format` field is therefore "Social Media," "Press Release," or "Social Media, Press Release". If Format contains the words "Social Media," we need to provide translation.

- **Add node:** `AI Agent`. Connect this to the `true` branch of the If node.
	- Add a chat model
	- `Prompt (User Message)`: 
```Text
Text: {{ $('Merge').item.json.output.social_media_body }}
```
- Set `System Message`:
```Text
Act as a professional English-Spanish translator and communications specialist with expertise in community organizing and Latine public engagement. You will be provided with English-language text that needs to be translated to Spanish. Use Latin American Spanish, targeting a diverse audience of Latine immigrants throughout Evanston and the broader Chicago area. Use an approachable tone for social media outreach but be sure to use “usted” instead of “tú” unless told otherwise. Use terminology widely understood by Spanish-speaking immigrants from a range of Latin American countries including Mexico, El Salvador, Ecuador, and beyond.
```

---
### Step 2: Final Send

We will send over the drafts via email, but this could easily be done by Telegram, another messaging service, or even being placed in a Google Sheet for storage and use later.

- **Add node:** `Gmail → Send a message`
	- `Text`:
```JSON
Press Release title: {{ $('Merge').item.json.output.press_release_title }}

Press Release body: {{ $('Merge').item.json.output.press_release_body }}

Post body (English): {{ $('Merge').item.json.output.social_media_body }}

Post body (Spanish): {{ $('Translator').item.json.output }}
```
- Connect this to the AI Agent's output. 

- **Add node:** `Gmail → Send a message`
	- `Text`:
```JSON
Press Release title: {{ $('Merge').item.json.output.press_release_title }}

Press Release body: {{ $('Merge').item.json.output.press_release_body }}
```
- Connect this to the If node's `false` output.
- In our case, if no translation is needed, then we can only have press releases. 

Choose your own subject line for the email. For both nodes, set the `Email Type` to `Text`. You can also choose the recipient(s) in the `To` field; for this recitation, I simply chose my email `alexjensenaiml901@gmail.com`, but this could be a specified member of the comms team.

---
## Exercises:

These are all ideas on how to make this workflow more robust and better. Try to think about these ideas first and then implement them in n8n!

1. What if we also want to send the final draft to the same email address as the person submitting the idea? What would we need to change?
2. Let's say that you send press releases to one English-language (Evanston Roundtable) and one Spanish-language (Telemundo) newspaper. Now, you need to translate some of the press releases. What would you change in the workflow to make this work?
3. Different forms of social media have different requirements, both in terms of character limits but also in terms of audience and how to gain traction. In this example, Facebook tends towards a slightly older (and more Spanish-speaking) audience, while Twitter/X is used by those who are very involved politically in these spheres. How would you change the workflow to better cater to these differences?
4. In our workflow, every draft requires explicit human approval. How could you change the process so that some posts (like low-stakes reminders) are auto-approved if they meet certain criteria, while others (like press releases) always require human review?
5. In the current format, the AI only sees the most recent set of edits. How could you modify the loop so the AI has access to the full revision history, and what might be the benefits or risks of that?

**Challenge:** Most posts on social media require some sort of graphic. Change the workflow so that users can submit photos/videos to be included or AI can generate some graphics. This is beyond the core content, so you may need to explore some to figure this one out!

---
## For the Final:

- `n8n Form` trigger
- Constructing sub-workflows to make custom tools
	- `When Executed by Another Workflow` trigger
	- `Call n8n Workflow Tool`
- Human-in-the-loop architecture
	- `Wait` and `Merge` nodes
- Hierarchical agent architecture

---
# Exploratory Content

You actually have all of the tools needed to make a very powerful personal assistant! Here is the outline of my personal assistant that I use that I call Jarvis:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "updates": [
          "message"
        ],
        "additionalFields": {
          "userIds": ""
        }
      },
      "type": "n8n-nodes-base.telegramTrigger",
      "typeVersion": 1.2,
      "position": [
        -400,
        -208
      ],
      "id": "34812f31-208e-48e6-b146-6fbf7075031d",
      "name": "Telegram Trigger",
      "webhookId": "55465396-8f88-46c9-8762-e61e8973ef96",
      "credentials": {
        "telegramApi": {
          "id": "UYEoXOCOqOwELc4E",
          "name": "Telegram account"
        }
      }
    },
    {
      "parameters": {
        "content": "## Personality",
        "height": 440,
        "width": 900
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        1152,
        -224
      ],
      "id": "07a75515-d0e4-435d-a2dc-65ae2d553b3a",
      "name": "Sticky Note"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.output }}",
        "messages": {
          "messageValues": [
            {
              "message": "=You are an expert style-transfer engine.\n\nRewrite the text that follows **verbatim** in Jarvis’s voice, the AI assistant from Iron Man (quick-witted, slightly snarky, concise). \n\n• Preserve every fact and number.  \n• Do **NOT** add opinions like “Indeed” or “Good job.”  \n• Return ONLY the rewritten sentence, without quotation marks.\n• If something like a link is included in the previous response, remove it; we just want text that can be read out loud.\n\nText to rewrite: {{  $json.output }}"
            }
          ]
        }
      },
      "type": "@n8n/n8n-nodes-langchain.chainLlm",
      "typeVersion": 1.6,
      "position": [
        1232,
        -160
      ],
      "id": "0c35fe00-771d-47fd-a557-5880704c62e5",
      "name": "Jarvis Personality",
      "disabled": true
    },
    {
      "parameters": {
        "operation": "sendAudio",
        "binaryData": true,
        "binaryPropertyName": "message",
        "additionalFields": {
          "fileName": "Jarvis_message"
        }
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        1856,
        -160
      ],
      "id": "e8c233c3-01d6-4f6a-adc9-02448b729a2a",
      "name": "Telegram",
      "webhookId": "9c861dbe-1cdf-4fa0-a33b-3eedff81357a",
      "credentials": {
        "telegramApi": {
          "id": "UYEoXOCOqOwELc4E",
          "name": "Telegram account"
        }
      },
      "disabled": true
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
                    "leftValue": "={{ $json.message.voice.file_id }}",
                    "rightValue": "",
                    "operator": {
                      "type": "string",
                      "operation": "exists",
                      "singleValue": true
                    },
                    "id": "554bcfe2-3ba6-40b6-9a4c-186ddf4eca9e"
                  }
                ],
                "combinator": "and"
              }
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
                    "id": "85a10b23-d0db-401e-a574-3afe7cba76f9",
                    "leftValue": "={{ $json.message.text }}",
                    "rightValue": "",
                    "operator": {
                      "type": "string",
                      "operation": "exists",
                      "singleValue": true
                    }
                  }
                ],
                "combinator": "and"
              }
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3.2,
      "position": [
        -192,
        -208
      ],
      "id": "1a0d8096-ce44-458c-9174-46730b1466e5",
      "name": "Switch"
    },
    {
      "parameters": {
        "resource": "file",
        "fileId": "={{ $json.message.voice.file_id }}",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        32,
        -304
      ],
      "id": "06628cee-529b-4846-9106-ef10861ab0cd",
      "name": "Download (Audio) File",
      "webhookId": "d325d6a8-a7ac-4124-a509-7e42c9826bc9",
      "credentials": {
        "telegramApi": {
          "id": "UYEoXOCOqOwELc4E",
          "name": "Telegram account"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "8dae1602-4083-4d1b-99d3-3606a39ba4ae",
              "name": "text",
              "value": "={{ $json.message.text }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        32,
        -144
      ],
      "id": "9b213add-bacb-48ff-83c8-d7ada444fe67",
      "name": "Set \"Text\""
    },
    {
      "parameters": {
        "resource": "audio",
        "operation": "transcribe",
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "typeVersion": 1.8,
      "position": [
        256,
        -304
      ],
      "id": "16f0f7cd-fd84-4601-87a5-e7971e7d003a",
      "name": "OpenAI",
      "credentials": {
        "openAiApi": {
          "id": "xUojZEztq2dF4TcO",
          "name": "OpenAi account"
        }
      }
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.text }}",
        "options": {
          "systemMessage": "=You are a personal assistant. Your role is to efficiently delegate user queries to the appropriate tool. You should never compose emails, summarize content, or manually handle tasks; your only job is to determine the correct tool to use.\n\n## Tools Available:\n\nCalculator – performs mathematical calculations.\nWikipedia - for general searches on information.\nGoogle Contact Agent – finds, updates, adds, or removes contact information.\nGoogle Calendar Agent - finds, updates, adds, or removes calendar events.\nGmail Agent - finds, creates, drafts, deletes, or labels emails.\nHacker News Agent - retrieves news articles focusing on tech. These are either popular/top articles or new articles.\nOutlook Contact Agent - finds, updates, adds, or removes contact information.\nOutlook Calendar Agent - finds, updates, adds, or removes calendar events.\nOutlook Email Agent - finds, creates, drafts, deletes, or labels emails.\n\n## Information Dependency Rules:\nCertain tasks require fetching contact details before proceeding. If the user requests any of the following actions, first retrieve the necessary contact information using the Outlook or Google Contact Agent then proceed to next steps:\n- Adding or removing someone from a calendar event\n- Creating a new calendar event with invitees\n- Drafting or sending an email\n- Updating an email's recipients\nTo get contact information, send a query like \"what is Alex Jensen's email address?\" This is needed to invite someone to a calendar event.\n\n## Rules\n- Here is the current date/time: {{ $now }} If asked for the date or time, use this.\n- When asked for schedules involving the calendar, reference both the Google Calendar and the Outlook calendar.\n- Otherwise, unless specified to use the Google tools (Google Contact Agent, Google Calendar Agent, and Gmail Agent), use their Outlook analogs instead. For example, if asked what emails were received today, only use the Outlook Email Agent, but if asked what emails were received in all inboxes, use both the Outlook Email Agent and Gmail Agent. \n- If asked to schedule an event for a specific day of the week, give the actual date to the Outlook or Google Calendar Agent, as well.\n- For mathematical calculations, respond in text, not mathematical notation. For example, if asked to calculate 12^3, you might say \"12 cubed is 1728.\"\n- For emails, make the format proper for an email but do not change the content received from the Gmail Agent or the Outlook Agent.\n- If asked for articles, provide the name of the article, a link, and a 1-3 sentence summary. Give the Hacker News Agent the number of articles and the type (newest or top/popular).\n- If not specified when looking for articles, assume that the user is looking for new articles."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.9,
      "position": [
        416,
        -160
      ],
      "id": "53ab0ecb-7e4b-4188-9c90-cb713aeed762",
      "name": "Assistant Agent"
    },
    {
      "parameters": {},
      "type": "@n8n/n8n-nodes-langchain.toolCalculator",
      "typeVersion": 1,
      "position": [
        848,
        48
      ],
      "id": "e2d5c9df-acf2-41ca-ab1b-41f71a518504",
      "name": "Calculator"
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.cartesia.ai/tts/bytes",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpCustomAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            },
            {
              "name": "Cartesia-Version",
              "value": "2025-04-16"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"model_id\": \"sonic-2\",\n  \"transcript\": {{ JSON.stringify($json.text).replace(/\\\\\"/g, '') }},\n  \"voice\": {\n    \"mode\": \"id\",\n    \"id\": \"da4a4eff-3b7e-4846-8f70-f075ff61222c\"\n  },\n  \"output_format\": {\n    \"container\": \"mp3\",\n    \"bit_rate\": 128000,\n    \"sample_rate\": 44100\n  },\n  \"language\": \"en\"\n}",
        "options": {
          "response": {
            "response": {
              "responseFormat": "file",
              "outputPropertyName": "message"
            }
          }
        }
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        1632,
        -160
      ],
      "id": "46e9a10b-2a35-43e2-a49c-f99b99ae24eb",
      "name": "Cartesia",
      "credentials": {
        "httpCustomAuth": {
          "id": "0WayLVb6gyBtnZLR",
          "name": "Cartesia"
        }
      },
      "disabled": true
    },
    {
      "parameters": {},
      "type": "@n8n/n8n-nodes-langchain.toolWikipedia",
      "typeVersion": 1,
      "position": [
        976,
        48
      ],
      "id": "597b6a7b-6412-4b72-b3e3-b418ef094594",
      "name": "Wikipedia"
    },
    {
      "parameters": {
        "description": "Call this tool to update the Google Calendar (adding or removing events) as well as to see a schedule.",
        "workflowId": {
          "__rl": true,
          "value": "ywXDWOLdybp9QPaj",
          "mode": "list",
          "cachedResultName": "Google Calendar Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('query', ``, 'string') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        496,
        304
      ],
      "id": "922860f5-2f11-4171-ab20-31c3f4c5688a",
      "name": "Google Calendar Agent"
    },
    {
      "parameters": {
        "description": "Call this tool to retrieve information about contacts, as well as to modify, delete, or add contacts. This is important for inviting people to events. ",
        "workflowId": {
          "__rl": true,
          "value": "wLJt1mKFGaIIFKZz",
          "mode": "list",
          "cachedResultName": "Google Contact Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ $fromAI('query') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        640,
        304
      ],
      "id": "2b4e091b-bcb3-4009-8311-757c8237083e",
      "name": "Google Contact Agent"
    },
    {
      "parameters": {
        "text": "={{ $json.output }}",
        "additionalFields": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        736,
        -320
      ],
      "id": "9f3048bd-cc05-4ed8-9921-29e3bbc6e70a",
      "name": "Telegram1",
      "webhookId": "fdb71d4e-c3a0-40d6-b7f4-b678815e0403",
      "credentials": {
        "telegramApi": {
          "id": "UYEoXOCOqOwELc4E",
          "name": "Telegram account"
        }
      }
    },
    {
      "parameters": {
        "description": "Call this tool to retrieve and send/edit emails.",
        "workflowId": {
          "__rl": true,
          "value": "IrPaIEMCUcdOQEBa",
          "mode": "list",
          "cachedResultName": "Gmail Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ $fromAI('query') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        768,
        304
      ],
      "id": "e4f77bfe-f1a0-4e45-8a07-bd7c6a83b9ea",
      "name": "Gmail Agent"
    },
    {
      "parameters": {
        "description": "Call this tool to get articles.",
        "workflowId": {
          "__rl": true,
          "value": "ECrpNyUWeIkmgvAS",
          "mode": "list",
          "cachedResultName": "Hacker News Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('query', ``, 'string') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        912,
        160
      ],
      "id": "fc46d422-dd36-4b8b-829e-d604739192b2",
      "name": "Hacker News Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4o-mini",
          "mode": "list",
          "cachedResultName": "gpt-4o-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1360,
        32
      ],
      "id": "50c33424-7f4b-4bb7-aadb-29a1bd71a3d6",
      "name": "Jarvis Brain",
      "credentials": {
        "openAiApi": {
          "id": "xUojZEztq2dF4TcO",
          "name": "OpenAi account"
        }
      },
      "disabled": true
    },
    {
      "parameters": {
        "description": "Call this tool to update the Outlook calendar.",
        "workflowId": {
          "__rl": true,
          "value": "iMmctJb0I5A39EXz",
          "mode": "list",
          "cachedResultName": "Outlook Calendar Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ $fromAI('query', ``, 'string') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        496,
        480
      ],
      "id": "7d22facc-d566-4b85-a111-49051ba0d672",
      "name": "Outlook Calendar Agent"
    },
    {
      "parameters": {
        "description": "Call this tool to retrieve information about contacts, as well as to modify, delete, or add contacts. This is important for inviting people to events. ",
        "workflowId": {
          "__rl": true,
          "value": "09EehfrpDftxcHAM",
          "mode": "list",
          "cachedResultName": "Outlook Contact Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "{{ $fromAI('query') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        640,
        480
      ],
      "id": "06caffb0-8387-4918-9465-e690d869bf72",
      "name": "Outlook Contact Agent"
    },
    {
      "parameters": {
        "description": "Call this tool to send, retrieve, edit, draft, or delete emails.",
        "workflowId": {
          "__rl": true,
          "value": "ah8a107hzxrgzIFQ",
          "mode": "list",
          "cachedResultName": "Outlook Email Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('query', ``, 'string') }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        768,
        480
      ],
      "id": "08aef09c-c871-4062-ad5a-efa1d5c9eaef",
      "name": "Outlook Email Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4.1",
          "mode": "list",
          "cachedResultName": "gpt-4.1"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        224,
        64
      ],
      "id": "071f7be8-ff72-406c-940b-36188db52176",
      "name": "Assistant Agent Brain",
      "credentials": {
        "openAiApi": {
          "id": "xUojZEztq2dF4TcO",
          "name": "OpenAi account"
        }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('Telegram Trigger').item.json.message.chat.id }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        336,
        240
      ],
      "id": "52bb2083-642b-4c51-b90f-7d8280a36a0e",
      "name": "Simple Memory Telegram"
    },
    {
      "parameters": {
        "rule": {
          "interval": [
            {
              "triggerAtHour": 8
            }
          ]
        }
      },
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1.2,
      "position": [
        -672,
        224
      ],
      "id": "2cdb3c7d-d9db-46e3-a1c1-0bb1884ad3d0",
      "name": "Schedule Trigger"
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "1e528a79-4f19-4a16-8e86-b791e3888ed9",
              "name": "query",
              "value": "Good morning! What events do I have in my calendar for today?",
              "type": "string"
            },
            {
              "id": "f741e4ad-69e1-43d3-9d03-ee83a687321e",
              "name": "sessionId",
              "value": "={{ $now + '-' + Math.random().toString(36).slice(2) }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -464,
        224
      ],
      "id": "0731db3e-24df-4ce8-ae78-786ec1484ac9",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "chatId": "7969872434",
        "text": "={{ $json.output }}",
        "additionalFields": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        -48,
        224
      ],
      "id": "0324d7f7-7d9c-4bf9-b045-ee6c7aa079ee",
      "name": "Send a text message",
      "webhookId": "d90328f9-6fdd-4a6f-8a62-f38bf42a52b0",
      "credentials": {
        "telegramApi": {
          "id": "UYEoXOCOqOwELc4E",
          "name": "Telegram account"
        }
      }
    },
    {
      "parameters": {
        "workflowId": {
          "__rl": true,
          "value": "iMmctJb0I5A39EXz",
          "mode": "list",
          "cachedResultName": "Outlook Calendar Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ $json.query }}",
            "sessionId": "={{ $json.sessionId }}"
          },
          "matchingColumns": [
            "query"
          ],
          "schema": [
            {
              "id": "query",
              "displayName": "query",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            },
            {
              "id": "sessionId",
              "displayName": "sessionId",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": false
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": true
        },
        "options": {}
      },
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1.2,
      "position": [
        -256,
        224
      ],
      "id": "20526997-3192-46dc-9565-88e963cb82fa",
      "name": "Execute Workflow"
    }
  ],
  "connections": {
    "Telegram Trigger": {
      "main": [
        [
          {
            "node": "Switch",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Jarvis Personality": {
      "main": [
        [
          {
            "node": "Cartesia",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Switch": {
      "main": [
        [
          {
            "node": "Download (Audio) File",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Set \"Text\"",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Download (Audio) File": {
      "main": [
        [
          {
            "node": "OpenAI",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Set \"Text\"": {
      "main": [
        [
          {
            "node": "Assistant Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "OpenAI": {
      "main": [
        [
          {
            "node": "Assistant Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Assistant Agent": {
      "main": [
        [
          {
            "node": "Jarvis Personality",
            "type": "main",
            "index": 0
          },
          {
            "node": "Telegram1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Calculator": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Cartesia": {
      "main": [
        [
          {
            "node": "Telegram",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Wikipedia": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Google Calendar Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Google Contact Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Telegram1": {
      "main": [
        []
      ]
    },
    "Gmail Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Hacker News Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Jarvis Brain": {
      "ai_languageModel": [
        [
          {
            "node": "Jarvis Personality",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Outlook Calendar Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Outlook Contact Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Outlook Email Agent": {
      "ai_tool": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "Assistant Agent Brain": {
      "ai_languageModel": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Simple Memory Telegram": {
      "ai_memory": [
        [
          {
            "node": "Assistant Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Schedule Trigger": {
      "main": [
        [
          {
            "node": "Edit Fields",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Edit Fields": {
      "main": [
        [
          {
            "node": "Execute Workflow",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Execute Workflow": {
      "main": [
        [
          {
            "node": "Send a text message",
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
    "instanceId": "ceb54e93c9453c0a04a7088216a654255644d70f37e774115b7c5a7902f6fb77"
  }
}
```

Note that there are several places where you would need to fill in your Telegram User ID. Additionally, it is currently configured to not use the `Personality` section, which would respond with voice messages via Telegram and would customize the "voice" of the response.

Feel free to explore this as much as you would like. Several highlights are discussed below.

## Audio/Multiple Inputs

The `Switch` node at the beginning is like the `If` node but can lead to more than two different output paths. In this case, we allow for our input from Telegram to be voice messages and we use OpenAI's `Transcribe Recording` feature.

Note that we have two nodes that feed their outputs into the Assistant Agent. If you look at the `Prompt (User Message)`, it is just {{ $json.text }}. In order to make sure that this agent can accept either input, it must be the case that the `Transcribe Recording` and `Set "Text"` nodes have the same JSON output structure. This is why we use the `Set "Text"` node, which ensures that the outputs match. This is a strategy that works more generally; 
## Sending Voice Messages to Telegram

[Cartesia](https://cartesia.ai/sonic) and [ElevenLabs](https://elevenlabs.io/) are both services that offer speech-to-voice. I have had more success connecting Cartesia, which you can see in the `Personality` section. We can then send this voice message back in Telegram.
## Tools and the HTTP Request Node

The `Assistant Agent` has many different tools available to it. Most of these are fairly simple and we will focus only on the `Outlook Calendar Agent`, which is quite similar to the Google Calendar Agent we built in [Recitation 1](https://sebastienmartin.info/aiml901/recitation_1.html). The code for this can be found here:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            {
              "name": "query"
            },
            {
              "name": "sessionId"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        336,
        -32
      ],
      "id": "be11cbd5-fac4-4776-8f66-330b871423c7",
      "name": "When Executed by Another Workflow"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-4o",
          "mode": "list",
          "cachedResultName": "gpt-4o"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        400,
        192
      ],
      "id": "fe226bf0-f4b8-4ede-90be-d9b2f04ab45e",
      "name": "OpenAI Chat Model",
      "credentials": {
        "openAiApi": {
          "id": "xUojZEztq2dF4TcO",
          "name": "OpenAi account"
        }
      }
    },
    {
      "parameters": {
        "resource": "event",
        "operation": "create",
        "calendarId": {
          "__rl": true,
          "value": "AAMkADhlZGEyZThmLTIzYzAtNGM0OS1iM2I2LTdiYmU4ZWQwOGIwYwBGAAAAAACCcm4e8iszRIRP3X-iyLzzBwDiHnTvtseZT6m7N6TID-8BAAAAAAEGAADiHnTvtseZT6m7N6TID-8BAAA1p1spAAA=",
          "mode": "list",
          "cachedResultName": "Calendar"
        },
        "subject": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Title', ``, 'string') }}",
        "startDateTime": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Start', ``, 'string') }}",
        "endDateTime": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('End', ``, 'string') }}",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.microsoftOutlookTool",
      "typeVersion": 2,
      "position": [
        688,
        192
      ],
      "id": "a88256ee-75d9-45bc-997d-e5889e9ac511",
      "name": "Create Event",
      "webhookId": "6cfbc2f2-d5e0-4b87-a039-bb45906d33c5",
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "03pPB9ZsD3ALVRos",
          "name": "Microsoft Outlook"
        }
      }
    },
    {
      "parameters": {
        "resource": "event",
        "operation": "delete",
        "calendarId": {
          "__rl": true,
          "value": "AAMkADhlZGEyZThmLTIzYzAtNGM0OS1iM2I2LTdiYmU4ZWQwOGIwYwBGAAAAAACCcm4e8iszRIRP3X-iyLzzBwDiHnTvtseZT6m7N6TID-8BAAAAAAEGAADiHnTvtseZT6m7N6TID-8BAAA1p1spAAA=",
          "mode": "list",
          "cachedResultName": "Calendar"
        },
        "eventId": {
          "__rl": true,
          "value": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Event', `the id that matches the events id`, 'string') }}",
          "mode": "id"
        }
      },
      "type": "n8n-nodes-base.microsoftOutlookTool",
      "typeVersion": 2,
      "position": [
        816,
        192
      ],
      "id": "bdb3502d-3633-4b4d-9468-d94ec4b2e88e",
      "name": "Delete Event",
      "webhookId": "6cfbc2f2-d5e0-4b87-a039-bb45906d33c5",
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "03pPB9ZsD3ALVRos",
          "name": "Microsoft Outlook"
        }
      }
    },
    {
      "parameters": {
        "resource": "event",
        "operation": "update",
        "calendarId": {
          "__rl": true,
          "value": "AAMkADhlZGEyZThmLTIzYzAtNGM0OS1iM2I2LTdiYmU4ZWQwOGIwYwBGAAAAAACCcm4e8iszRIRP3X-iyLzzBwDiHnTvtseZT6m7N6TID-8BAAAAAAEGAADiHnTvtseZT6m7N6TID-8BAAA1p1spAAA=",
          "mode": "list",
          "cachedResultName": "Calendar"
        },
        "eventId": {
          "__rl": true,
          "value": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Event', `the id that matches the events id`, 'string') }}",
          "mode": "id"
        },
        "additionalFields": {
          "end": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('End', `end time of the event`, 'string') }}",
          "start": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Start', `start time of the event`, 'string') }}",
          "subject": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Title', `title of the event`, 'string') }}"
        }
      },
      "type": "n8n-nodes-base.microsoftOutlookTool",
      "typeVersion": 2,
      "position": [
        1072,
        192
      ],
      "id": "a74b106d-a34a-4615-9033-6880aa59708e",
      "name": "Update Events",
      "webhookId": "6cfbc2f2-d5e0-4b87-a039-bb45906d33c5",
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "03pPB9ZsD3ALVRos",
          "name": "Microsoft Outlook"
        }
      }
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "{{ $(\"Trigger Node\").item.json.sessionId }}",
        "contextWindowLength": 20
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        560,
        192
      ],
      "id": "96d487b2-0aff-428e-9810-0c133456948c",
      "name": "Simple Memory"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.query }}",
        "options": {
          "systemMessage": "=You are a calendar assistant. Your job is to reliably execute the user’s intent with Outlook Calendar tools by creating, retrieving, updating, and deleting events.\n\nCurrent date/time: {{ $now }}\nTimezone: America/Chicago\n\nDefaults:\n- If no duration: 1 hour.\n- If no start time: 9:00 AM local.\n- When supplying datetimes, use the full datetime, like 2025-09-19T10:00:00-05:00.\n\nFunctions:\nCreate Event - Make a new event. \nGet Events - Retrieve calendar schedules. This requires you to supply at least a start and end time (startFilter and endFilter) and possibly a keyword (title).\nDelete Event - Remove an event (requires event ID from \"Get Events\")\nUpdate Event - Modify an event (requires event ID from \"Get Events\")\n\nExecution Rules (always follow, in order):\n1) Parse intents in sequence (delete → update → create). Execute each fully before the next.\n2) For Delete or Update: NEVER assume an event ID. First run “Get Events” with the smallest plausible window and summary filter, pick the best match, then pass its ID to the action.\n3) If multiple matches exist, ask one clarifying question.\n4) If both a deletion and a creation are requested in one message, DELETE first, then CREATE.\n5) If asked about events this week, filter events to only ones this week.\n6) If asked about an event in a certain time frame, look through all events in that time frame to find the proper one. For example, if I am asked to delete the event \"Party\" this week, you should search through all events this week to find the one called Party and delete it. If there are multiple events with the same name in the specified time frame, ask which one the user means.\n\nHeuristics:\n- “tonight”, “this evening” → 17:00–23:59 today for search.\n- “this event” after we just created/returned an event → use the most recently returned event’s ID.\n- If user asks “delete this” without a time, search today ± 1 day for events with that summary.\n\nExample:\nUser: “Delete the ‘Soccer’ event tonight, then create ‘Soccer (NEW)’ at 8:45 pm and invite alex.e.jensen@gmail.com”\nPlan:\n  a) Get Events(timeMin=today 17:00, timeMax=today 23:59, summary contains “Soccer”)\n  b) Delete Event(eventId=<best match>)\n  c) Create Event (with Attendees)(summary=\"Soccer (NEW)\", start=today 20:45, end=today 21:45, attendees=[{email:\"alex.e.jensen@gmail.com\"}])\nExecute the plan."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.9,
      "position": [
        656,
        -32
      ],
      "id": "4ebf3c10-8305-4f1f-8283-165f0afb6ecc",
      "name": "AI Agent",
      "retryOnFail": false
    },
    {
      "parameters": {
        "description": "Call this tool to get calendar events and event IDs.\n\n- For startFilter and endFilter, give dates. These represent the beginning and end of the time frame in which you are searching for events. Use the full datetime, like 2025-09-19T10:00:00-05:00.\n- title represents a keyword or phrase that you are looking for within the title of an event. If you are not searching by title, leave this as an empty string.\n\nIf you want to update or delete an event, retrieve the event ID using this tool.",
        "workflowId": {
          "__rl": true,
          "value": "e2ySKjJfF1SdFUwz",
          "mode": "list",
          "cachedResultName": "Outlook Calendar Get Events"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "startFilter": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('startFilter', ``, 'string') }}",
            "endFilter": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('endFilter', ``, 'string') }}",
            "title": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('title', ``, 'string') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "startFilter",
              "displayName": "startFilter",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string"
            },
            {
              "id": "endFilter",
              "displayName": "endFilter",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string"
            },
            {
              "id": "title",
              "displayName": "title",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string"
            }
          ],
          "attemptToConvertTypes": false,
          "convertFieldsToString": false
        }
      },
      "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 2.2,
      "position": [
        944,
        192
      ],
      "id": "e8ec760c-5f76-4def-a398-632dfbd244bf",
      "name": "Get Events"
    }
  ],
  "connections": {
    "When Executed by Another Workflow": {
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
    "Create Event": {
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
    "Delete Event": {
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
    "Update Events": {
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
    "Get Events": {
      "ai_tool": [
        [
          {
            "node": "AI Agent",
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
    "instanceId": "ceb54e93c9453c0a04a7088216a654255644d70f37e774115b7c5a7902f6fb77"
  }
}
```

Specifically, note that the `Get Events` tool is actually another workflow call! That workflow can be found here:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            {
              "name": "startFilter"
            },
            {
              "name": "endFilter"
            },
            {
              "name": "title"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        192,
        0
      ],
      "id": "beed3efb-9724-4c7a-9639-f1d336d80cad",
      "name": "When Executed by Another Workflow"
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
              "id": "4c35acbc-1cdb-4eff-8567-764c94ed6da3",
              "leftValue": "={{ $json.title }}",
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
        "options": {}
      },
      "type": "n8n-nodes-base.if",
      "typeVersion": 2.2,
      "position": [
        416,
        0
      ],
      "id": "3b2f5707-d0f6-4e47-b9d6-dace82b6049a",
      "name": "If title exists..."
    },
    {
      "parameters": {
        "url": "https://graph.microsoft.com/v1.0/me/calendar/calendarView",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "microsoftOutlookOAuth2Api",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "startDateTime",
              "value": "={{ $json.startFilter }}"
            },
            {
              "name": "endDateTime",
              "value": "={{ $json.endFilter }}"
            },
            {
              "name": "$filter",
              "value": "=contains(subject, '{{ $json.title }}')"
            },
            {
              "name": "$select",
              "value": "subject,start,end,attendees,id"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "outlook.timezone",
              "value": "Central Standard Time"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        640,
        -80
      ],
      "id": "15632857-1d19-4251-b705-f672144f325f",
      "name": "Find Events By Title",
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "03pPB9ZsD3ALVRos",
          "name": "Microsoft Outlook"
        }
      }
    },
    {
      "parameters": {
        "url": "https://graph.microsoft.com/v1.0/me/calendar/calendarView",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "microsoftOutlookOAuth2Api",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "startDateTime",
              "value": "={{ $json.startFilter }}"
            },
            {
              "name": "endDateTime",
              "value": "={{ $json.endFilter }}"
            },
            {
              "name": "$select",
              "value": "subject,start,end,attendees,id"
            }
          ]
        },
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "outlook.timezone",
              "value": "Central Standard Time"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [
        640,
        96
      ],
      "id": "593c1878-6b64-4da6-8585-724a0c16d174",
      "name": "Find Events without Title",
      "credentials": {
        "microsoftOutlookOAuth2Api": {
          "id": "03pPB9ZsD3ALVRos",
          "name": "Microsoft Outlook"
        }
      }
    }
  ],
  "connections": {
    "When Executed by Another Workflow": {
      "main": [
        [
          {
            "node": "If title exists...",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "If title exists...": {
      "main": [
        [
          {
            "node": "Find Events By Title",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Find Events without Title",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Find Events without Title": {
      "main": [
        []
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "ceb54e93c9453c0a04a7088216a654255644d70f37e774115b7c5a7902f6fb77"
  }
}
```

It is possible to use the `Get Many Events` option like in Google Calendar, but this is just to showcase what is possible. Additionally, with some older LLM models, the `Get Many Events` tool was unreliable, but that should be improved now.

Looking at the `Get Events` tool linked above, we see that we can search for events by time period and then we can either include the title or not. You will see two nodes that may look unfamiliar. These are called `HTTP Request` nodes, and they are some of the most powerful nodes in n8n. They let you request data from any app or service that has a REST API. As a result, you can replace essentially any node in n8n that connects to another service with this one, though configuring it can be slightly trickier. However, this allows for a much higher degree of control.

## Schedule Trigger

You might notice a small workflow consisting of four nodes. This is one of the most useful ways that I use my workflows. The `Schedule Trigger` will execute every day at 8 a.m. and this then sends a question to my calendar agent asking for my schedule for the day. This small workflow then gives me a Telegram message summarizing my calendar for the day.
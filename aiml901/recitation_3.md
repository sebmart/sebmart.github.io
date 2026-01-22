---
title: Recitation 3
author: Alex Jensen
---
While we have started to see some of the tools available to AI agents, we sometimes want to build our own custom tools. We will focus on using **sub-workflows** to do so. 

Additionally, sub-workflows let us make our system more modular and allow us to reuse "building blocks" (workflows) that we create. For example, take our Google Calendar agent from Recitation 1. We might have multiple workflows that use this, such as a personal assistant but also a broader workflow that sends out event invites and reminders to multiple people. We can make this agent into a sub-workflow and then call it from each of these other workflows instead of building the exact same agent into multiple workflows.

To demonstrate this, we consider a communications team at an education and learning company calling Evanston Pathways seeking to expand access to bilingual education. They need to create social media posts and send out press releases. Because the company works with many Spanish-speaking people, it is important that the social media posts are bilingual. They are hoping to utilize AI to be able to create high-quality content that engages with their community.

---
## You'll Need...

- OpenAI connection
- Gmail connection
- **Optional:**
	- Google Sheets connection
	- A copy of [this Google Form](https://docs.google.com/forms/d/1VVZw92zXz0YlRbYuar2YAKp5ipo-0afF2aHn0fMnvgE/copy) with a connected Google Sheet

---
You can watch a video recording of the recitation here:
![Recitation 3 Recording](https://youtu.be/JdyuojSYP0Q)

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
      "id": "3019f1a4-a2f3-485b-af76-5bf7479caf62",
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
      "id": "32ae928a-afc3-40cf-8c81-b0625f498400",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.2",
          "mode": "list",
          "cachedResultName": "gpt-5.2"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        192,
        208
      ],
      "id": "c2bc74ca-4cff-4453-828f-d9553be4ab4a",
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
              "value": "={{ $json.output.press_release_body }}\n\nFounded in 2022, Evanston Pathways is an education and learning company that creates bilingual programs, digital tools, and live experiences for Spanish- and English-speaking audiences.",
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
      "id": "1633715c-babb-4f8a-96ee-f5df814e3c9a",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Text: {{ $json.text }}\nTitle: {{ $json.title }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.\n\nUsing the content provided, your role is to create English-language press releases following AP format that are both accessible and engaging. These should be professional and ready to send to news outlets.\n\n*Do not write in Spanish; this will later be translated.*"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        224,
        0
      ],
      "id": "1cd9402e-0487-4b45-a58e-c8f5a958a7a9",
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
        -16,
        -64
      ],
      "id": "72095570-8433-45d1-950d-b2a2f80285ba",
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
        352,
        144
      ],
      "id": "0f1f789f-9082-49d1-b35a-fd585bb88c60",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.2",
          "mode": "list",
          "cachedResultName": "gpt-5.2"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        176,
        144
      ],
      "id": "3b5937aa-184e-4210-bff2-fd4c93ca5ef9",
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
        "promptType": "define",
        "text": "={{ $json.text }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.\n\nUsing the content provided, your role is to create English-language social media posts that are both accessible and engaging. These are posts for primarily Facebook and Instagram; write a single post that is common for both and do not create separate posts for multiple platforms.\n\n*Do not write in Spanish; this will later be translated.*"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        192,
        -64
      ],
      "id": "69737c1f-c554-4239-84b9-937d89f6ac7f",
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
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

Make sure to select your credentials for the OpenAI model. You will also need to hit the `Publish` button in the top right to make these workflows available for the later steps.

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
        608,
        1152
      ],
      "id": "1edd02f8-b402-40d5-b1e7-a6fc3611e53b",
      "name": "Structured Output Parser"
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
        96,
        1152
      ],
      "id": "b8125693-60bf-40fe-8352-b391d023e33c",
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
        "description": "Call this tool to write English-language press releases.",
        "workflowId": {
          "__rl": true,
          "value": "4v0pdadZnfSQhOLg",
          "mode": "list",
          "cachedResultUrl": "/workflow/4v0pdadZnfSQhOLg",
          "cachedResultName": "AIML901 Staff  — WI 2026 Recitation 3 - Press Release Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "text": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('text', ``, 'string') }}",
            "title": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('title', ``, 'string') }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "text",
              "displayName": "text",
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
        352,
        1296
      ],
      "id": "5bb708bd-3d55-445d-90c7-f8d3d76c4b1d",
      "name": "Press Release"
    },
    {
      "parameters": {
        "description": "Call this tool to write English-language social media posts.",
        "workflowId": {
          "__rl": true,
          "value": "JQrj7xeTOS7qofDT",
          "mode": "list",
          "cachedResultUrl": "/workflow/JQrj7xeTOS7qofDT",
          "cachedResultName": "AIML901 Staff  — WI 2026 Recitation 3 - Social Media Agent"
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
        496,
        1296
      ],
      "id": "76edee1d-3c9d-41dc-ba43-e2c5600d25fa",
      "name": "Social Media"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Title:  {{ $json.Title }}\nContent: {{ $json.Content }}\nFormat(s): {{ $json.Format }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.\n\nUsing the content provided, your role is to use your tools to create English-language social media posts and/or press releases (based on the formats) that are both accessible and engaging. \n\nWhen the format includes social media, use the Social Media tool to write posts. Similarly, use the Press Release tool to write press releases. Do not write these posts/press releases yourself; always use the tools to do so."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        336,
        912
      ],
      "id": "22e3ff54-1763-4ede-88c2-86d2d30fcc6f",
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
        240,
        1152
      ],
      "id": "f6364d2c-0ff8-4096-a6eb-aa28634d6c81",
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
        80,
        912
      ],
      "id": "a666efc4-8495-44e9-a64a-99462779d60e",
      "name": "On form submission",
      "webhookId": "b020cfdb-1b8d-45a1-a02a-838a27a95d04"
    },
    {
      "parameters": {
        "content": "## Form Input and First Draft",
        "height": 576,
        "width": 752,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        0,
        848
      ],
      "id": "09719a1a-ce49-4106-a2d5-aef47acb2532",
      "name": "Sticky Note"
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
Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.

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
        1792,
        1264
      ],
      "id": "fa93edc9-b89e-4941-bcc8-b2c02fe43a7f",
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
        1168,
        928
      ],
      "id": "074af94b-42e6-49ba-9f76-018e3ffe9742",
      "name": "Wait",
      "webhookId": "d7b8fbd7-19e3-407f-8609-d4c82381669e"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.2",
          "mode": "list",
          "cachedResultName": "gpt-5.2"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        1584,
        1264
      ],
      "id": "88411a4f-f926-403b-a167-3bfba98e1b21",
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
        1408,
        928
      ],
      "id": "208d31c9-f88d-44f6-9381-f03e85386b2d",
      "name": "Approved?"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-base.merge",
      "typeVersion": 3.2,
      "position": [
        928,
        928
      ],
      "id": "a98b3e71-a67a-4318-9142-764f27b0abae",
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
        1088,
        304
      ],
      "id": "15f19e3c-31c1-4e8e-94bd-eb18489be2cc",
      "name": "Sticky Note6"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Title: {{ $('Merge').item.json.output.press_release_title }}\nPress Release body:{{ $('Merge').item.json.output.press_release_body }}\nSocial Media body: {{ $('Merge').item.json.output.social_media_body }}\nEdits: {{ $json.Edits }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.\n\nYou will be given messages as well as edits that are wanted. Using this, your role is to edit the messages given to reflect these changes and return them to the user. These will be press releases and social media posts associated with community events and public engagement, targeting a diverse Spanish- and English-speaking audience throughout Evanston and the broader Chicago area.\n\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1600,
        1008
      ],
      "id": "89c2bb66-d29e-4123-b8fe-f0c0eeaab1c9",
      "name": "Editor"
    },
    {
      "parameters": {
        "content": "## Human-in-the-loop",
        "height": 560,
        "width": 1056,
        "color": 3
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        848,
        848
      ],
      "id": "2fe697fe-05a5-42ea-aaa2-0a72edfc7763",
      "name": "Sticky Note2"
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
Act as the in-house marketing and communications specialist for Evanston Pathways, an education and learning company whose mission is to expand access to high-quality bilingual education through programs, digital tools, and live experiences for Spanish- and English-speaking audiences. You have expertise in brand storytelling, public relations, and multicultural marketing.

You will be given messages as well as edits that are wanted. Using this, your role is to edit the messages given to reflect these changes and return them to the user. These will be press releases and social media posts associated with community events and public engagement, targeting a diverse Spanish- and English-speaking audience throughout Evanston and the broader Chicago area.
```
- Make sure to add an `OpenAI Chat Model` node.
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
	- Add a chat model.
	- `Prompt (User Message)`: 
```Text
Text: {{ $('Merge').item.json.output.social_media_body }}
```
- Set `System Message`:
```Text
Act as a professional English-Spanish translator and communications specialist with expertise in brand storytelling, public relations, and multicultural marketing. You will be provided with English-language text that needs to be translated to Spanish. Use Latin American Spanish, targeting a diverse Spanish-speaking audience throughout Evanston and the broader Chicago area. Use an approachable tone for social media outreach but be sure to use “usted” instead of “tú” unless told otherwise. Use terminology widely understood by Spanish-speaking people from a range of Latin American countries including Mexico, El Salvador, Ecuador, and beyond.
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
3. Note that our decision about whether or not Spanish translation is needed could be done by an AI Agent! Change Part 3 of the workflow to be done by an AI Agent with a Gmail tool.
	1. As an added challenge: try Question 1 again with your new workflow. What if you want it to be able to decide whom to send the message to?
4. Different forms of social media have different requirements, both in terms of character limits but also in terms of audience and how to gain traction. In this example, Facebook tends towards a slightly older (and more Spanish-speaking) audience, while Twitter/X is used by those who are very involved politically in these spheres. How would you change the workflow to better cater to these differences?
5. In our workflow, every draft requires explicit human approval. How could you change the process so that some posts (like low-stakes reminders) are auto-approved if they meet certain criteria, while others (like press releases) always require human review?
6. In the current format, the AI only sees the most recent set of edits. How could you modify the loop so the AI has access to the full revision history, and what might be the benefits or risks of that?

**Challenge:** Most posts on social media require some sort of graphic. Change the workflow so that users can submit photos/videos to be included or AI can generate some graphics. This is beyond the core content, so you may need to explore some to figure this one out!

---
## For the Homework:

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
          "userIds": "7969872434"
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
        1216,
        -256
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
        "chatId": "7969872434",
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
        "chatId": "7969872434",
        "text": "={{ $json.output }}",
        "additionalFields": {
          "appendAttribution": false
        }
      },
      "type": "n8n-nodes-base.telegram",
      "typeVersion": 1.2,
      "position": [
        816,
        -160
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
          "cachedResultUrl": "/workflow/ECrpNyUWeIkmgvAS",
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
        944,
        304
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
          "cachedResultUrl": "/workflow/iMmctJb0I5A39EXz",
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
            },
            {
              "id": "sessionId",
              "displayName": "sessionId",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "canBeUsedToMatch": true,
              "type": "string",
              "removed": true
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
          "value": "gpt-5",
          "mode": "list",
          "cachedResultName": "gpt-5"
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
        -480,
        640
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
        -272,
        640
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
        144,
        640
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
          "value": "ywXDWOLdybp9QPaj",
          "mode": "list",
          "cachedResultUrl": "/workflow/ywXDWOLdybp9QPaj",
          "cachedResultName": "Google Calendar Agent"
        },
        "workflowInputs": {
          "mappingMode": "defineBelow",
          "value": {
            "query": "={{ $json.query }}"
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
          "convertFieldsToString": true
        },
        "options": {}
      },
      "type": "n8n-nodes-base.executeWorkflow",
      "typeVersion": 1.2,
      "position": [
        -64,
        640
      ],
      "id": "20526997-3192-46dc-9565-88e963cb82fa",
      "name": "Call 'Google Calendar Agent'"
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
            "node": "Call 'Google Calendar Agent'",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Call 'Google Calendar Agent'": {
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

The `Assistant Agent` has many different tools available to it. Most of these are fairly simple and we will focus only on the `Hacker News Agent`. The code for this can be found here:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "workflowInputs": {
          "values": [
            {
              "name": "query"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1.1,
      "position": [
        -192,
        -224
      ],
      "id": "b91711cf-65c7-4902-acf8-87cadda2c364",
      "name": "When Executed by Another Workflow"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.query }}",
        "options": {
          "systemMessage": "=## Role: \nRetrieve news articles from Hacker News.\n\n## Functions:\nGet top stories– retrieve IDs for top articles.\nGet new stories– retrieve IDs for new articles.\nGet article– use ID to retrieve information about articles\n\n## Rules\n- First use get top stories or get new stories to get the relevant IDs. Then, use this ID for get article in order to retrieve information about the article.\n- For each article, give a link, the name of the article, and a 1-3 sentence summary of the article.\n\n## Examples\n- “Get the top 3 Hacker News posts” → { \"count\": 3 }\n\n## Notes:\nCurrent date/time: {{ $now }}\nDefault number of articles to retrieve: 5 if unspecified."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 1.9,
      "position": [
        48,
        -224
      ],
      "id": "ee985fe9-af05-4804-9916-4c9fdef4cc5c",
      "name": "AI Agent"
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
        -80,
        -48
      ],
      "id": "e81ddbfd-5fd0-4d35-8924-a9593c2a6fb3",
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
        "toolDescription": "Looks for top articles",
        "url": "https://hacker-news.firebaseio.com/v0/topstories.json",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "count",
              "value": "={{ $fromAI('parameters1_Value', ``, 'string') }}"
            },
            {
              "name": "id",
              "value": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('parameters1_Value', ``, 'string') }}"
            },
            {
              "name": "url",
              "value": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('parameters2_Value', ``, 'string') }}"
            }
          ]
        },
        "options": {
          "batching": {
            "batch": {
              "batchSize": 1,
              "batchInterval": 500
            }
          },
          "timeout": 10000
        }
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.2,
      "position": [
        160,
        128
      ],
      "id": "e275340d-d93c-425a-8eff-e251da2d4903",
      "name": "Get Top Stories"
    },
    {
      "parameters": {
        "toolDescription": "Looks for new articles",
        "url": "https://hacker-news.firebaseio.com/v0/newstories.json",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "count",
              "value": "={{ $fromAI('parameters1_Value', ``, 'string') }}"
            },
            {
              "name": "id",
              "value": "={{ $fromAI('parameters2_Value', ``, 'string') }}"
            },
            {
              "name": "url",
              "value": "={{ $fromAI('parameters3_Value', ``, 'string') }}"
            }
          ]
        },
        "options": {
          "batching": {
            "batch": {
              "batchSize": 1,
              "batchInterval": 500
            }
          },
          "timeout": 10000
        }
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.2,
      "position": [
        352,
        128
      ],
      "id": "cb004d7f-dd00-4d87-b338-a41173b8cfaa",
      "name": "Get New Stories"
    },
    {
      "parameters": {
        "articleId": "={{ /*n8n-auto-generated-fromAI-override*/ $fromAI('Article_ID', ``, 'string') }}",
        "additionalFields": {}
      },
      "type": "n8n-nodes-base.hackerNewsTool",
      "typeVersion": 1,
      "position": [
        512,
        128
      ],
      "id": "3776ac2e-a0fd-42a2-9c0a-56cd06f275b7",
      "name": "Get Article"
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "{{ $(\"Trigger Node\").item.json.sessionId }}"
      },
      "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      "typeVersion": 1.3,
      "position": [
        0,
        112
      ],
      "id": "d9527974-a4c3-433e-9949-5440980947cc",
      "name": "Simple Memory"
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
    "Get Top Stories": {
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
    "Get New Stories": {
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
    "Get Article": {
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
    }
  },
  "pinData": {},
  "meta": {
    "instanceId": "ceb54e93c9453c0a04a7088216a654255644d70f37e774115b7c5a7902f6fb77"
  }
}
```

This lets us look for articles that are new or popular. You will see two nodes that may look unfamiliar. These are called `HTTP Request` nodes, and they are some of the most powerful nodes in n8n. They let you request data from any app or service that has a REST API. As a result, you can replace essentially any node in n8n that connects to another service with this one, though configuring it can be slightly trickier. However, this allows for a much higher degree of control.

## Schedule Trigger

You might notice in the large assistant workflow that there is an additional, smaller workflow consisting of four nodes. This is one of the most useful ways that I use my workflows. The `Schedule Trigger` will execute every day at 8 a.m. and this then sends a question to my calendar agent asking for my schedule for the day. This small workflow then gives me a Telegram message summarizing my calendar for the day.
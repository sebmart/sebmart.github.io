---
title: Recitation 4
author: Alex Jensen
---
Picture yourself at a fast-growing consulting firm. Every week, consultants are flying to client sites, grabbing meals on the road, buying software licenses, and submitting Uber receipts. Company policy requires that each expense gets coded correctly: **“Client Billable,” “Internal Training,” “Recruiting,” “Operations.”**

At small scale, this is easy. An office manager can skim through receipts and plug them into the right category. But once you’ve got dozens of consultants, hundreds of receipts, and multiple cost centers, the process becomes a nightmare. People submit vague expense notes like “Dinner” or “Hotel,” and someone has to spend hours cleaning up and guessing categories so the finance team can generate accurate P&Ls. 

Recently, the firm has implemented an AI agent that employees can send a quick message to and it will categorize their expenses. While this has been a mostly smooth transition, there have been some complaints about unexpected classifications and this can distort client profitability and internal cost tracking. It's your job to come up with a way to understand how well the agent is performing and optimize it as much as possible.

---
## You'll Need...

- Google Sheets connection
- Expense spreadsheet with columns **Date, Category, Description, Amount,** and **Filed By**. You can make a copy of it [here](https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/copy).
- Expense evaluation spreadsheet that you can [copy from here](https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/copy).

---
## Learning Objectives

- Understand how to build an evaluation pipeline in n8n
- Decide between different choices of metrics

---
# Core Content: Expense Categorization Agent

We will start with the expense agent itself. Copy and paste the following code into a new workflow:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ $json.message }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "You are an Expense Categorization Assistant. Your job is to extract the expense amount, the date of the expense, create a short description of the expense, extract who logged the expense, and assign the expense to exactly one of the categories.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        400,
        0
      ],
      "id": "23ace37a-a1f5-44a0-8492-cc70938c5d9e",
      "name": "AI Agent"
    },
    {
      "parameters": {
        "model": {
          "__rl": true,
          "mode": "list",
          "value": "gpt-4.1-mini"
        },
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.2,
      "position": [
        368,
        208
      ],
      "id": "e5ac4a69-4c42-4d90-a1fb-1af499518696",
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
        "operation": "append",
        "documentId": {
          "__rl": true,
          "value": "1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8",
          "mode": "list",
          "cachedResultName": "Expenses Spreadsheet",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1AVmpzOTKMaTXq97ENO7tg74S9jUtt36_jwmADb_jopQ/edit#gid=0"
        },
        "columns": {
          "mappingMode": "defineBelow",
          "value": {
            "Date": "={{ $json.output.date }}",
            "Amount": "={{ $json.output.amount }}",
            "Category": "={{ $json.output.category }}",
            "Filed By": "={{ $json.output.loggedBy }}",
            "Description": "={{ $json.output.description }}"
          },
          "matchingColumns": [],
          "schema": [
            {
              "id": "Date",
              "displayName": "Date",
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
              "id": "Description",
              "displayName": "Description",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true,
              "removed": false
            },
            {
              "id": "Amount",
              "displayName": "Amount",
              "required": false,
              "defaultMatch": false,
              "display": true,
              "type": "string",
              "canBeUsedToMatch": true
            },
            {
              "id": "Filed By",
              "displayName": "Filed By",
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
        800,
        0
      ],
      "id": "13c8830a-d021-486e-b6ac-7d9b8a4a149d",
      "name": "Append row in sheet",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "1HAWOjfJhsaRb22K",
          "name": "tim.kelloggaiml@gmail.com"
        }
      }
    },
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "ae489fe6-bbf0-4d85-b68f-b2299c1a088f",
              "name": "message",
              "value": "={{ $json.chatInput }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        192,
        0
      ],
      "id": "ace6ae72-5d0e-4db3-bfc6-db86e8e7d8a2",
      "name": "Edit Fields"
    },
    {
      "parameters": {
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.chatTrigger",
      "typeVersion": 1.3,
      "position": [
        0,
        0
      ],
      "id": "b14959b0-4328-4881-96fe-b4a3d78613aa",
      "name": "When chat message received",
      "webhookId": "d228cafa-57c9-47bb-bcf9-43233c544392"
    },
    {
      "parameters": {
        "schemaType": "manual",
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"category\", \"amount\", \"date\", \"description\", \"loggedBy\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"category\": {\n      \"type\": \"string\",\n      \"enum\": [\"Client Billable\", \"Internal Training\", \"Recruiting\", \"Operations\"],\n      \"description\": \"The assigned expense category.\"\n    },\n    \"amount\": {\n      \"type\": \"number\",\n      \"description\": \"The amount of the expense as a numeric value.\"\n    },\n    \"date\": {\n      \"type\": \"string\",\n      \"pattern\": \"^[0-9]{4}-[0-9]{2}-[0-9]{2}$\",\n      \"description\": \"Date of the expense in ISO format (YYYY-MM-DD).\"\n    },\n    \"description\": {\n      \"type\": \"string\",\n      \"description\": \"Short text describing the expense (vendor, item, or activity).\"\n    },\n    \"loggedBy\": {\n      \"type\": \"string\",\n      \"description\": \"Name or identifier of the person submitting the expense.\"\n    }\n  }\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        592,
        208
      ],
      "id": "3d2bdbcd-9f5b-4487-b5ec-fef0082dab1f",
      "name": "Structured Output Parser"
    },
    {
      "parameters": {
        "content": "\n\n![Alt text](https://sebastienmartin.info/aiml901/attachments/course_canvas_vignette.png)\n\n# Recitation 4 - Agent Evaluation",
        "height": 464,
        "width": 576,
        "color": 5
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        208,
        -496
      ],
      "id": "01eb85a7-4574-4a10-a297-5dad6e2b50bb",
      "name": "Sticky Note6"
    }
  ],
  "connections": {
    "AI Agent": {
      "main": [
        [
          {
            "node": "Append row in sheet",
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
    "Edit Fields": {
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
    "When chat message received": {
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
    }
  },
  "pinData": {},
  "meta": {
    "instanceId": "dc2f41b0f3697394e32470f5727b760961a15df0a6ed2f8c99e372996569754a"
  }
}
```

This consists of...
1. A **chat trigger** that allows users to send a message to the agent;
2. An **Edit Fields** node that prepares the input for the agent. This is not important for now, but it will be once we start to add in other forms of inputs;
3. An **AI Agent** that will extract the expense amount, the date of the expense, who logged the expense, and will additionally create a short description of the expense and categorize it;
4. An **Output Parser** to ensure the formatting of the output;
5. A **Google Sheets** node to log the expense.

With this, we have a full pipeline that lets us categorize expenses! 

Make sure to click into the `OpenAI Chat Model` node to fill in your credentials. In the `Append row in sheet` node for Google Sheets, also add your credential and choose the `Expenses Spreadsheet` from earlier.

---
### Exercises

1. Look at the system message. This does not contain a description of the categories, but the agent is still assigning expenses to our 4 categories! How does it know what the categories are?
2. Instead of using an output parser, we could have given the agent a Google Sheets tool and let it automatically fill in the columns. What are the advantages and disadvantages of doing it this way?
3. Try sending several expenses and see how it categorizes them in the spreadsheet. Below are some examples to get started. 
	1. Uber from O’Hare to Client A office, $64.20, Sept 12 2025, Gracie
	2. PMI virtual workshop registration (team lead), $450, 2025-11-03
	3. Dinner with software engineering candidate, $85.00, October 2, 2025, logged by Iris
4. What happens if information is missing?
5. Can you improve how it categorizes expenses by modifying the system prompt?
6. What if a client billable item is labeled as internal training? Is that better or worse than if a recruiting expense is labeled as operations? Or do we not care about this distinction?

---
# Part 2: Adding in Evaluation Pipeline (Categorization)

Now, we want a formal way to test how well our expense agent actually works. To do so, we need to create an understanding of _what it means for our agent to work well_.

To implement this, we will use n8n's **evaluation** nodes and triggers to let us test different inputs and see how well they do against our chosen benchmarks. We consider two types of tasks:
- **Verifiable tasks** can be automatically checked to see if the agent is performing them correctly. For example, is the agent assigning an expense to the correct category?
- **Non-verifiable or unverifiable tasks** do not have a clear right/wrong answer. For example, does the agent's description of the expense accurately reflect it?
Both of these can be handled in n8n! For this walkthrough, we will focus on two metrics, but you will be encouraged to create your own metrics in the exercises.

The two metrics we will consider are as follows:
- **Correctness metric:** each expense is categorized as one of **“Client Billable,” “Internal Training,” “Recruiting,”** or **“Operations.”** Does the agent categorize correctly?
- **LLM-as-a-judge:** We are also given a short description of the expense by the agent. Do these descriptions accurately reflect the information given?

In this portion, we focus on the correctness metric. Here are the nodes that we will build:

```JSON
{
  "nodes": [
    {
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "id": "ae489fe6-bbf0-4d85-b68f-b2299c1a088f",
              "name": "message",
              "value": "={{ $json.Prompt }}",
              "type": "string"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.set",
      "typeVersion": 3.4,
      "position": [
        -880,
        208
      ],
      "id": "25edcf29-6744-421f-8d87-68834fb77db4",
      "name": "Edit Fields1"
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M",
          "mode": "list",
          "cachedResultName": "Expenses Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/edit#gid=0"
        }
      },
      "type": "n8n-nodes-base.evaluationTrigger",
      "typeVersion": 4.6,
      "position": [
        -1104,
        208
      ],
      "id": "302cc622-3d65-4abc-8420-c2c1a892d779",
      "name": "When fetching a dataset row"
    },
    {
      "parameters": {
        "operation": "checkIfEvaluating"
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.7,
      "position": [
        -224,
        96
      ],
      "id": "24964ff1-c0b8-4806-8ef8-8de6dcec4e86",
      "name": "Evaluation"
    },
    {
      "parameters": {
        "operation": "setMetrics",
        "metric": "categorization",
        "expectedAnswer": "={{ $('When fetching a dataset row').item.json[\"Target Category\"] }}",
        "actualAnswer": "={{ $json.output.category }}",
        "options": {}
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.7,
      "position": [
        208,
        0
      ],
      "id": "f0a5718a-375a-4751-b493-540534d18bac",
      "name": "Is Correct Metric"
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M",
          "mode": "list",
          "cachedResultName": "Expenses Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1x_MVmeGJAeE1J9PDcYaWwkG45tDE4Gcc5_0zqi7fw2I/edit#gid=0"
        },
        "outputs": {
          "values": [
            {
              "outputName": "Assigned Category",
              "outputValue": "={{ $('AI Agent').item.json.output.category }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.7,
      "position": [
        0,
        0
      ],
      "id": "1bdf49a5-b2de-488c-bfa3-956db1949b21",
      "name": "Logging Correctness in Google Sheet"
    }
  ],
  "connections": {
    "Edit Fields1": {
      "main": [
        []
      ]
    },
    "When fetching a dataset row": {
      "main": [
        [
          {
            "node": "Edit Fields1",
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
            "node": "Logging Correctness in Google Sheet",
            "type": "main",
            "index": 0
          }
        ],
        []
      ]
    },
    "Logging Correctness in Google Sheet": {
      "main": [
        [
          {
            "node": "Is Correct Metric",
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

---
## Step 1: Evaluation Spreadsheet

To test our agent, we need examples of inputs, or expenses that members of the team might input. We will store this in a Google Sheet; an example that you can copy can be found [here](https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/copy).

This spreadsheet has four columns: **Prompt, Target Category,** **Assigned Category,** and **Explanation**. For the correctness metric, we need to supply the "correct answer" (given by the column Target Category) along with the input so that we can compare the output of our agent (given by Assigned Category) to the true answer.

For LLM-as-a-judge, since there is no longer a true answer, our analogous step will be providing specific directions to the LLM, which may include examples of what "good" outputs look like. We will use the Explanation column so that the judge will explain its decision-making.

---
## Step 2: Evaluation Trigger

- **Add node**: `Add another trigger → When running evaluation`
	- Source: `Google Sheets`
	- Document Containing Dataset: Expenses Evaluation spreadsheet that you copied earlier
- **What it does**: This spreadsheet contains examples of potential prompts. When we execute the workflow from this evaluation node, it will treat each row of the spreadsheet as a separate input and run through each row one at a time. 

---
## Step 2: Standardizing Inputs

- **Add node**: `Edit Fields (Set)`
	- Mode: `Manual Mapping`
	- Click `Add Field` and make name be `message` with value `{{ $json.Prompt }}`
	- Connect this node to the evaluation trigger and then also to the AI Agent node.
- **What it does**: Note that if we tried to directly feed the output of the evaluation trigger into the AI Agent, this would result in an error because the User Message in the agent is `{{ $json.message }}`. As a result, we standardize our input format so it is the same if we are evaluating or if there is a chat message.

Now, connect the output of this node directly to the `AI Agent`.

> [!info] General Use
> This is a great strategy in general if data could be coming from different sources to one node in n8n. For example, you might want to have a workflow that allows you to test using the `Chat Trigger` node but it can also receive messages from Telegram. Since the JSON formats of these triggers are different, you can use the `Edit Fields (Set)` node to make their outputs look similar so you can feed them into the next node more easily and not have to deal with each case separately.

---
## Step 3: Routing

When we are testing, we don't want to update the spreadsheet that is holding our actual expenses! Remove the connection between the AI Agent and Google Sheets nodes. We will add a special node that checks if we are performing evaluation and chooses the path based on this.

- **Add node**: `Action in an app → Evaluation → Check if evaluating`
	- Connect this to the output of the agent
- **What it does**: We might want different behavior if we are evaluating versus actual runs of the workflow. In our case, we want to log actual calls in a spreadsheet, but if we are doing evaluation, we will log it elsewhere.

Now, connect the `Normal` output from this node to the Google Sheet node. If we are not evaluating, then it will choose this branch and act like before!

---
## Step 4: Evaluation Logging

- **Add node**: `Action in an app → Evaluation → Set Outputs`
	- Source: `Google Sheets`
	- Document: `Expenses Evaluation`
	- Choose `Add Output` and give it the name `Assigned Category` with value
```JSON
{{ $('AI Agent').item.json.output.category }}
```
- Connect to the `Evaluation` output of the evaluation check in Step 3.
- We choose the name `Assigned Category` so that it matches the column name in the Google Sheet and writes its output in the correct place.
- **What it does**: We want to log what our AI Agent categorizes the prompt. This lets it write to the column in the Google Sheet so we have a clear record of what the assigned category was.

---
## Step 5: Correctness Metric

Now, we want to see how well our agent did. However, this is largely dependent on what we think "good" means. For example, it's possible that Client Billable and Recruiting could overlap; if our agent assigns an expense to one instead of the other, is this better or worse than if it confused an operations versus internal training expense?

To start, we just use a correctness metric. In our Expenses Evaluation document, note that we have a column called **Target Category**. This is the category that we think the prompt should be assigned to. If the category that the agent assigns is the same as the target category, we mark it as correct, and otherwise, we mark it as incorrect.

- **Add node**: `Action in an app → Evaluation → Set Metrics`
	- Metric: `Categorization`
	- Expected Answer: `{{ $('When fetching a dataset row').item.json["Target Category"] }}`
	- Actual Answer: `{{ $json.output.category }}`
- **What it does**: This simply compares the expected and actual answer to see if they are the same.
- Connect this to the Set Outputs node.

---
## Exercises

1. Now, execute the workflow starting at the evaluation trigger. How well does it do? 
2. At this firm, the category Client Billable makes up the vast majority of the expenses. Does the evaluation reflect this? How could we make it reflect this more? 
3. Try to add a correctness metric for the `loggedBy` field. What should we do if there is no name reported?
4. Realistically, employees might be more vague than the current examples. Add these examples to the spreadsheet (or any others that you want) and see how the agent performs:

| Prompt                                                                              | Target Category   |
| ----------------------------------------------------------------------------------- | ----------------- |
| AWS usage for Client D sandbox, $342.17, 2025-06-22                                 | Client Billable   |
| Dinner at Olive Garden with team and one potential client, $210, September 15, 2025 | Client Billable   |
| Notion Pro subscription for project management, $480, July 1, 2025                  | Operations        |
| Registration fee for AI in Business conference, $650, May 10, 2025                  | Internal Training |
| Dinner, May 10, 2025, $30                                                           | Client Billable   |

5. **Challenge:** Note that the person submitting the expense might forget crucial information, such as when the expense occurred or the amount of the expense.
	1. The expense amount is perhaps most vital. If it is missing, the agent should flag it and and send the user a message to ask for the amount. Note: our agent currently does not have memory. What happens if it asks the user and then they respond?
	2. If the date is missing, what should the default behavior be? Implement your idea in n8n.

---
# Part 3: LLM-as-a-Judge

Correctness is a rather coarse metric and beyond categorization, it may not even be applicable. For example, the agent also generates a description of each expense which would allow us to quickly check on how the budget is being spent. We might be interested in how useful these descriptions are. This is a **non-verifiable task**; we cannot verify if its answer is correct, and in fact, there might not even be a correct answer!

To still be able to evaluate the agent's answers in this case, we instead can use another LLM as a judge. 

Note that there is a way to do this using an evaluation node in n8n:

- **Add node:** `Action in an app → Evaluation → Set Metrics`
	- Metric: `Helpfulness (AI-based)`
	- User Query: `{{ $('When fetching a dataset row').item.json["Prompt"] }}`
	- Response: `{{ $('AI Agent').item.json.output.description }}`

However, **we won't do this**. We will do it in a slightly different way that lets us log more information, including the reasoning of the judge agent. 

While we walk through the steps to create each node, you can also check this against the actual nodes:

```JSON
{
  "nodes": [
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
        1408,
        112
      ],
      "id": "760ef9e2-66b8-482d-8cea-1d264a3f9a2b",
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
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"score\", \"reasoning\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"score\": {\n      \"type\": \"integer\",\n      \"minimum\": 1,\n      \"maximum\": 5,\n      \"description\": \"Similarity rating where 5 = excellent fidelity to the original expense text and 1 = inaccurate.\"\n    },\n    \"reasoning\": {\n      \"type\": \"string\",\n      \"description\": \"Brief explanation of why the score was assigned (missing details, hallucinations, contradictions, etc.).\",\n      \"maxLength\": 500\n    }\n  }\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1600,
        112
      ],
      "id": "45cee8f3-07d3-4d5c-84fa-0ab9dedb7eb2",
      "name": "Structured Output Parser1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Original user-submitted text:\n\n{{ $('When fetching a dataset row').item.json[\"Prompt\"] }}\n\nProduced description of expense: \n\n{{ $('AI Agent').item.json.output.description }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Purpose\n- Judge the quality of a generated expense description by comparing it to the original user-provided expense text.\n- Assign a score (1–5) indicating how accurately the generated description captures the key meaning and details of the original. Higher scores mean better fidelity to the original.\n\nInputs\n- The raw user-submitted text describing an expense.\n- The LLM-produced summary/description of that expense.\n\nTask\n- Compare generated_description against original_text and determine whether the generated description:\n   - Preserves the core meaning\n   - Captures essential details (who, what, cost, item, purpose, etc. when applicable)\n   - Avoids adding incorrect or invented information\n   - Is consistent with the intent of the original\n- The generated description does not need to exactly match the original wording — it is a summary — but it must retain the correct core information.\n- You must provide a numeric score from 1–5 and a concise explanation describing why the score was assigned.\n\nScoring Rubric\n5 - Excellent. Captures all key details. No important information missing or distorted. No invented details. Faithful, concise summary.\n4 - Good. Mostly accurate. Minor detail missing or phrasing slightly off, but meaning preserved and no incorrect claims.\n3 - Fair. Some important details missing or phrased too vaguely. Still generally consistent with the original.\n2 - Poor. Major details are missing or incorrect. The summary is incomplete or misleading.\n1 - Inaccurate. Fails to capture the essence of the original. Missing large portions of meaning, or adds incorrect information.\n\nAdditional Guidance\n- Brevity is fine as long as accuracy is preserved.\n- Punish hallucination: adding details not found in the original lowers the score.\n- If the generated description contradicts the original, assign 1 or 2."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1408,
        -96
      ],
      "id": "fddb8c37-07ec-4774-bbb0-3fcecfd6db3d",
      "name": "Judge Agent"
    },
    {
      "parameters": {
        "source": "googleSheets",
        "documentId": {
          "__rl": true,
          "value": "1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M",
          "mode": "list",
          "cachedResultName": "Expenses Evaluation",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/edit?usp=drivesdk"
        },
        "sheetName": {
          "__rl": true,
          "value": "gid=0",
          "mode": "list",
          "cachedResultName": "Sheet1",
          "cachedResultUrl": "https://docs.google.com/spreadsheets/d/1OluWbAdB2_TqU7AoTxdOy2lJUW6-4elQb8Jfgu94m7M/edit#gid=0"
        },
        "outputs": {
          "values": [
            {
              "outputName": "Explanation",
              "outputValue": "={{ $json.output.reasoning }}"
            },
            {
              "outputName": "Rating",
              "outputValue": "={{ $json.output.score }}"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1760,
        -96
      ],
      "id": "9d729e0b-0bb4-4a52-b9b5-4439ea38e91d",
      "name": "Logged Reasoning",
      "credentials": {
        "googleSheetsOAuth2Api": {
          "id": "O8nOyQiiMhjSi2Pa",
          "name": "Alex Student Google Sheet"
        }
      }
    },
    {
      "parameters": {
        "operation": "setMetrics",
        "metric": "customMetrics",
        "metrics": {
          "assignments": [
            {
              "name": "Description Quality",
              "value": "={{ $json.output.score }}",
              "type": "number",
              "id": "3d07225e-806d-4464-aa05-5135d3dbeffb"
            }
          ]
        }
      },
      "type": "n8n-nodes-base.evaluation",
      "typeVersion": 4.8,
      "position": [
        1968,
        -96
      ],
      "id": "b84942b5-e80e-450e-988a-0763323c1ade",
      "name": "Evaluation1"
    }
  ],
  "connections": {
    "OpenAI Chat Model1": {
      "ai_languageModel": [
        [
          {
            "node": "Judge Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Structured Output Parser1": {
      "ai_outputParser": [
        [
          {
            "node": "Judge Agent",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Judge Agent": {
      "main": [
        [
          {
            "node": "Logged Reasoning",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Logged Reasoning": {
      "main": [
        [
          {
            "node": "Evaluation1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Evaluation1": {
      "main": [
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
## Step 1: Judge Agent

Copy in the following, which includes an `AI Agent` node and an `Output Parser`:

```JSON
{
  "nodes": [
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
        1408,
        160
      ],
      "id": "760ef9e2-66b8-482d-8cea-1d264a3f9a2b",
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
        "inputSchema": "{\n  \"type\": \"object\",\n  \"required\": [\"score\", \"reasoning\"],\n  \"additionalProperties\": false,\n  \"properties\": {\n    \"score\": {\n      \"type\": \"integer\",\n      \"minimum\": 1,\n      \"maximum\": 5,\n      \"description\": \"Similarity rating where 5 = excellent fidelity to the original expense text and 1 = inaccurate.\"\n    },\n    \"reasoning\": {\n      \"type\": \"string\",\n      \"description\": \"Brief explanation of why the score was assigned (missing details, hallucinations, contradictions, etc.).\",\n      \"maxLength\": 500\n    }\n  }\n}\n"
      },
      "type": "@n8n/n8n-nodes-langchain.outputParserStructured",
      "typeVersion": 1.3,
      "position": [
        1600,
        160
      ],
      "id": "45cee8f3-07d3-4d5c-84fa-0ab9dedb7eb2",
      "name": "Structured Output Parser1"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "=Original user-submitted text:\n\n{{ $('When fetching a dataset row').item.json[\"Prompt\"] }}\n\nProduced description of expense: \n\n{{ $('AI Agent').item.json.output.description }}",
        "hasOutputParser": true,
        "options": {
          "systemMessage": "Purpose\n- Judge the quality of a generated expense description by comparing it to the original user-provided expense text.\n- Assign a score (1–5) indicating how accurately the generated description captures the key meaning and details of the original. Higher scores mean better fidelity to the original.\n\nInputs\n- The raw user-submitted text describing an expense.\n- The LLM-produced summary/description of that expense.\n\nTask\n- Compare generated_description against original_text and determine whether the generated description:\n   - Preserves the core meaning\n   - Captures essential details (who, what, cost, item, purpose, etc. when applicable)\n   - Avoids adding incorrect or invented information\n   - Is consistent with the intent of the original\n- The generated description does not need to exactly match the original wording — it is a summary — but it must retain the correct core information.\n- You must provide a numeric score from 1–5 and a concise explanation describing why the score was assigned.\n\nScoring Rubric\n5 - Excellent. Captures all key details. No important information missing or distorted. No invented details. Faithful, concise summary.\n4 - Good. Mostly accurate. Minor detail missing or phrasing slightly off, but meaning preserved and no incorrect claims.\n3 - Fair. Some important details missing or phrased too vaguely. Still generally consistent with the original.\n2 - Poor. Major details are missing or incorrect. The summary is incomplete or misleading.\n1 - Inaccurate. Fails to capture the essence of the original. Missing large portions of meaning, or adds incorrect information.\n\nAdditional Guidance\n- Brevity is fine as long as accuracy is preserved.\n- Punish hallucination: adding details not found in the original lowers the score.\n- If the generated description contradicts the original, assign 1 or 2."
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 2.2,
      "position": [
        1408,
        -96
      ],
      "id": "fddb8c37-07ec-4774-bbb0-3fcecfd6db3d",
      "name": "Judge Agent"
    }
  ],
  "connections": {
    "OpenAI Chat Model1": {
      "ai_languageModel": [
        [
          {
            "node": "Judge Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Structured Output Parser1": {
      "ai_outputParser": [
        [
          {
            "node": "Judge Agent",
            "type": "ai_outputParser",
            "index": 0
          }
        ]
      ]
    },
    "Judge Agent": {
      "main": [
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

Connect the output of the `Set Metrics` node to the agent. This agent receives:
- The original input from the user about an expense
- The generated description of the expense
It then generates a rating from 1-5 (called `score`) and an explanation about the score (called `reasoning`).

---
## Step 2: Logging Reasoning

Now, we want to record both the score and the reasoning so we can easily view this. This will be helpful if we want to determine if the judge is performing well. 

- **Add node**: `Action in an app → Evaluation → Set Outputs`
	- Source: `Google Sheets`
	- Document: `Expenses Evaluation`
	- Choose `Add Output` and give it the name `Explanation` with value
```JSON
{{ $json.output.reasoning }}
```
- Choose `Add Output` and give it the name `Rating` with the value
```JSON
{{ $json.output.score }}
```

---
## Step 3: Judge Metric

- **Add node**: `Action in an app → Evaluation → Set Metrics`
	- Metric: `Custom Metrics`
	- Name: `Description Quality`
	- For the value, put
```JSON
{{ $json.output.score }}
```

Congratulations, you have just built an evaluation pipeline for both the categorization and descriptions!

---
## Exercises

1. Does the judge perform well? Are its scores representative of what we would like?
	- Add instructions to the judge agent's system prompt to modify its behavior.
2. Try to add your own metric. This can be based on fields that the AI Agent already has (such as date), or you can add fields to the agent!

**Challenges:**
1. We might want to evaluate categorization beyond correctness. As mentioned before, certain miscategorizations are worse than others. Let's say that miscategorizing anything else as Client Billable is 3 times as worse as other miscategorizations and miscategorizing Client Billable as others is twice as worse as other miscategorizations. Create a custom metric that then calculates the total miscategorization score based on these rules.
2. It is a bit clunky to have two separate `Set Outputs` and `Set Metrics` nodes. Change the order of the nodes in the evaluation pipeline to consolidate these into the Judge Agent node and then one `Set Outputs` and one `Set Metrics` node.
	 - *Hint*: You might need to write an expression for the categorization. You can use this one:
```JSON
{{ $('When fetching a dataset row').item.json["Target Category"] == $json.output.category }}
```

---
## For the Final:

-  Creating evaluation pipelines for your agents
	- Use of the nodes `Set Outputs, Set Metrics,` and `Check if Evaluating` and the evaluation trigger `On new Evaluation event`

> [!info] Note
> For the project, you do **not** need to build an evaluation pipeline in n8n. However, you do have to show some form of evaluation, which could just be a spreadsheet with inputs, outputs, and some reasoning about how well the agent is performing.

---
# Exploratory Content: Monthly Budget Updates

Note that we could easily exchange the `Chat Trigger` node for a Telegram message node, which would make it easy for employees to input expenses and allow for better tracking. With this information collected in our Google Sheet, we might want to know how much we are spending each month. 

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
        16,
        464
      ],
      "id": "b71ad580-effd-4eab-bec0-b1ba49eab754",
      "name": "Schedule Trigger"
    },
    {
      "parameters": {
        "documentId": {
          "__rl": true,
          "value": "1zMdQ5iWJ4Eyl6nkJ36Iw2XpIOomoVqkCHjN4pTZd5O8",
          "mode": "list",
          "cachedResultName": "Expenses Spreadsheet",
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
        224,
        464
      ],
      "id": "1b0c3d27-fb2e-435b-ac85-a99e9986b1fc",
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
              "leftValue": "={{ $json.Date }}",
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
        416,
        464
      ],
      "id": "d49bcc85-ec18-4814-8429-3f0f0e8e84fa",
      "name": "Filter"
    },
    {
      "parameters": {
        "fieldsToSummarize": {
          "values": [
            {
              "aggregation": "sum",
              "field": "Amount"
            }
          ]
        },
        "fieldsToSplitBy": "Category",
        "options": {}
      },
      "type": "n8n-nodes-base.summarize",
      "typeVersion": 1.1,
      "position": [
        624,
        464
      ],
      "id": "df52bb8a-e407-4d9b-87c4-2711dde12f77",
      "name": "Summarize"
    },
    {
      "parameters": {
        "sendTo": "alexjensenaiml901@gmail.com",
        "subject": "Monthly Expense Report",
        "emailType": "text",
        "message": "=Here are your expenses for the previous month:\n\n{{ $json.data[0].Category }}: ${{ $json.data[0].sum_Amount }}\n\n{{ $json.data[1].Category }}: ${{ $json.data[1].sum_Amount }}\n\n{{ $json.data[2].Category }}: ${{ $json.data[2].sum_Amount }}\n\n{{ $json.data[3].Category }}: ${{ $json.data[3].sum_Amount }}\n\n",
        "options": {}
      },
      "type": "n8n-nodes-base.gmail",
      "typeVersion": 2.1,
      "position": [
        1024,
        464
      ],
      "id": "1448f511-66f8-42c8-9d53-b4b6b8db8631",
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
        832,
        464
      ],
      "id": "008e018c-b413-4849-a76f-157386e11b05",
      "name": "Aggregate"
    },
    {
      "parameters": {
        "content": "## Exploratory content: monthly budget updates",
        "height": 256,
        "width": 1280
      },
      "type": "n8n-nodes-base.stickyNote",
      "typeVersion": 1,
      "position": [
        -48,
        384
      ],
      "id": "a815465a-e0f5-41a3-9988-9855d9078f1c",
      "name": "Sticky Note1"
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
	- Choose the `Expenses Spreadsheet` from before

---
## Step 3: Filtering

We now want to only look at expenses from the past month.

- **Add node:** `Filter`
- For the first value, choose
```JSON
{{ $json.Date }}
```
- Choose `Date & Time → is after`
- For the second value, choose 
```JSON
{{ new Date(Date.now() - 30*24*60*60*1000).toISOString() }}
```
- This represents 30 days before the current time.

---
## Step 4: Summarizing

Now, we want to add up the expenses by category. `Summarize` lets us do operations such as summing, counting, and finding the minimum or maximum of a set of data

- **Add node:** `Summarize`
	- Aggregation: `Sum`
	- Field: `Amount`
	- Fields to Split By: `Category`
		- This means that we get one number for operations, one for client billable expenses, and so forth.

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
	- Subject: I chose something like "Monthly Expense Report"
	- Email Type: `Text`
	- Message:
```JSON
Here are your expenses for the previous month:

{{ $json.data[0].Category }}: ${{ $json.data[0].sum_Amount }}

{{ $json.data[1].Category }}: ${{ $json.data[1].sum_Amount }}

{{ $json.data[2].Category }}: ${{ $json.data[2].sum_Amount }}

{{ $json.data[3].Category }}: ${{ $json.data[3].sum_Amount }}
```

This is a relatively simple email structure, but just shows all of the expenses.
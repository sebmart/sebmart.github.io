---
title: Final Exam
author:
---

This document contains information about the final exam, including topics, credentials that will be needed, and the general structure.

The final exam will focus on your knowledge of n8n and your technical skills in building AI workflows. This is not designed to be a "gotcha" moment; if you attended and worked through the recitations, you should receive close to a full grade. 

---
## Structure

The exam will consist of several questions that ask you to either create a workflow or modify/improve an existing one. The questions will not depend on one another, so if you get stuck, make sure to try the other problems.

---
## Needed Credentials

In order to complete the exam and prevent technical issues, make sure that you have these credentials set up in n8n:

- Google Sheets
- Google Calendar
- Gmail
- Telegram

---
## Topics by Recitation

The following is a list of topics, from the recitations, that may appear on the final exam. The content of the exam will be representative of what you have seen in the recitations.
### Recitation 1
- System prompting
    - Changing the tone of an LLM
    - Providing instructions on using tools efficiently
- Use of the `Basic LLM Chain` and `AI Agent` nodes, along with tools
- n8n triggers 
	- `Trigger manually`
	- `On chat message`
	- `Telegram → On message`
- Use of the Google Calendar tools
### Recitation 2
- Use of core n8n nodes, including `If`, `Edit Fields (Set)`, `Date & Time`, and n8n forms
- Human-in-the-loop architecture
	- Routing with the `If` node
- RAG
- Using Google Sheets and Gmail with n8n
- Use of the `Structured Output Parser`
### Recitation 3
- Constructing sub-workflows to make custom tools
	- `When Executed by Another Workflow` trigger
- Human-in-the-loop architecture
	- Nodes that involve waiting for a response (`Human in the loop → Telegram` or  `Human in the loop → Respond to Chat`)
	- The `Merge` node
- Hierarchical agent architecture
### Recitation 4
- Creating evaluation pipelines for your agents
	- Use of the nodes `Set Outputs, Set Metrics,` and `Check if Evaluating` and the evaluation trigger `On new Evaluation event`
-  Timed triggers
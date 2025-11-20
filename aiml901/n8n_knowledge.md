---
title: n8n Knowledge and Resources
author:
  - Alex Jensen
---
# Overview

This document gives you many sources that will help you learn about and practice using n8n. 

---
# Recitations

## Recitation 1: Let's Built a Google Calendar Agent (Getting Started with n8n)

If you would like to work through the steps of the recitation, you can find them at [this link.](https://sebastienmartin.info/aiml901/recitation_1.html)

You can watch a video recording of the recitation here:
![Recitation 1 Recording](https://youtu.be/zn9OrCbJEdY)

---
## Recitation  2: Let's Build an Email Triage Agent (n8n Deep Dive)

If you would like to work through the steps of the recitation, you can find them at [this link.](https://sebastienmartin.info/aiml901/recitation_2.html)

You can watch a video recording of the recitation here:
![Recitation 2 Recording](https://www.youtube.com/watch?v=rqAwlg62Utw)

---
## Recitation 3: Let's Build a Bilingual Communications Agent (Advanced n8n Usage)

If you would like to work through the steps of the recitation, you can find them at [this link.](https://sebastienmartin.info/aiml901/recitation_3.html)

You can watch a video recording of the recitation here:
![Recitation 2 Recording](https://www.youtube.com/watch?v=tGdDLdCqQe8)

---
## Recitation 4: Let's Build an Expense Categorization Agent (Agent Evaluation)

If you would like to work through the steps of the recitation, you can find them at [this link.](https://sebastienmartin.info/aiml901/recitation_4.html)

You can watch a video recording of the recitation here:
![Recitation 4 Recording](https://youtu.be/q2JfRhAsp5A)

---
## Recitation 5: Building End-to-End Products with AI/Final Exam Prep

If you would like to work through the steps of the recitation, you can find them at [this link.](https://sebastienmartin.info/aiml901/recitation_5.html)

You can watch a video recording of the recitation here:
![Recitation 5 Recording](https://youtu.be/JeFV-Bu8Qeg)

---
# Other Resources

## n8n's Built-in AI Assistant

Within n8n, there is an AI assistant within your workspace. You are able to ask it questions about your specific workflow, errors you are facing, and different nodes/triggers that are available to you. 
## n8n Templates

[Here is a link](https://n8n.io/workflows/) to various workflows that others have made. You are free to use these as a starting point for your own projects.
## n8n Documentation

n8n provides pages that explain all of the options for each node. Some of these pages are more comprehensive than others, but they do give a good sense of what is possible.
## n8n Community

If you run into an error and you are unable to understand it using the AI Assistant and ChatGPT, it is likely that others have encountered this error, as well. n8n has an [extremely active community](https://community.n8n.io/) where people ask and answer questions. This is a great place to look for solutions, workarounds, and advice.
## YouTube

There are many YouTube tutorials on building different workflows. While many of them focus on automation and do not go in-depth on _why_ they are making certain decisions, this can still be useful in gaining practice with the interface and different types of nodes.

---
# Final Exam

## Structure

The exam will be posted on Canvas and will be available during finals week. **The exam will be untimed, though you should expect to take between 30 minutes and 1 hour on it if you have previously completed all of the recitations.**

This course has covered a huge amount of content for its length. In designing the final assessment, our goal is to reflect that shared commitment: if you have successfully gone through the Core Content in each recitation and can run the corresponding workflows, you should perform well.

**This exam will be entirely screenshot-based.** You will run several workflows and then screenshot specific node outputs to verify correct operation.

On macOS:
- Press `Shift + Command + 4`
- Drag to select the area to capture  
- Release to take the screenshot (saved to Desktop)
- Tip: Press `Space` after the shortcut to capture a specific window

On Windows (Win 10/11):
- Press `Windows + Shift + S`
- Screen dims → choose Rectangular Snip → drag to select 
- The screenshot is copied to the clipboard; paste or save from the notification
## Topics
- System prompting
    - Changing the tone of an LLM
    - Providing instructions on using tools efficiently
- Use of the `AI Agent` node
- `On chat message` trigger
- Use of the Google Calendar `Add Event` tool.
- JSON structure in n8n
- Node inputs and outputs
- `Edit Fields (Set)` and `If` node
- `Gmail` and `Google Sheets` nodes
- `n8n Form` trigger
- Constructing sub-workflows to make custom tools
	- `When Executed by Another Workflow` trigger
	- `Call n8n Workflow Tool`
- Human-in-the-loop architecture
	- `Wait` and `Merge` nodes
- Hierarchical agent architecture
- Creating evaluation pipelines for your agents
	- Use of the nodes `Set Outputs, Set Metrics,` and `Check if Evaluating` and the evaluation trigger `On new Evaluation event`
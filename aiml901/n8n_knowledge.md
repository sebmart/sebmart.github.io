---
title: Recitation Topics, Final Exam, and n8n Extensions
---
# Overview

This document contains information about the recitation topics, n8n knowledge, and the final exam. This should serve as a repository of knowledge that you can reference if you are unsure where/when we covered certain material, but also a resource for you beyond the course on where you can go to learn more.

---
# Recitations

## Final Exam

The final exam will focus on your knowledge of n8n and your technical skills in building AI workflows. This is not designed to trick you; if you attended and worked through the recitations, you should receive close to a full grade. **Only topics covered in the recitations will be a part of the final exam.**
## Needed Credentials

For this course and for the final exam, we will connect to several different sources outside of n8n. Make sure that you have these credentials set up in n8n:

- OpenAI
- Google Sheets
- Google Calendar
- Gmail
- Telegram

Instructions on how to get set up with these services can be found [here](n8n_access_instructions.md).
## Topics by Recitation
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
### Recitation 5
- Connecting n8n to Lovable and other sources using a `webhook`

---
# Beyond Recitations

Since this is only a 5 week course, we cannot cover all of n8n's functionalities in-depth. Here are some high-value nodes that you may want to consider either for your project or for any future workflows.
### `Schedule Trigger`

This allows you to run workflows at specific times, such as every day or every month. For example, you might want to have a summary of your calendar for the day each morning.
### `HTTP Request` node

 n8n has many built-in connections to other systems, such as Google products, OpenAI, Telegram, Slack, and much more. However, if n8n does not have this native connection or you want to do something that is more technical than the default options available to you, this node lets you receive and/or send information to almost any service that has a public endpoint, such as APIs from tools, custom company systems, and even simple URLs that return data. 
### `Code` node

Use this node to write custom JavaScript or Python. This gives you maximum control over your workflow, but it's also one of the most complex tools; it could even be used to replace most other nodes!
### `Filter` node

This lets us only keep items that meet a certain condition. For example, if we have a dataset of customers, what they order, and how much they paid, we could filter to only look at orders that are over $100. 
### `Summarize` node

Use summarize to group items together. There are many different ways to do so, including summing or averaging values and combining values (such as taking the strings "apple" and "orange" and concatenating them into "apple orange").
### `Aggregate` node

Aggregating lets us take multiple items of data and group them into a single item. This is useful to "package" your results and make them easier to reference in future steps. For example, let's say that we just used the `Summarize` node to calculate the total expenses of a business in several different categories. `Aggregate` lets us process these subtotals into a single list, which actually makes it easier to reference each individual value if we want to send an email with these expense reports.

---
# Useful Links and Resources

- [ n8n documentation](https://docs.n8n.io/): provides information on all of the nodes and triggers in n8n.
- [n8n community](https://community.n8n.io/): if you have a question, it's possible that someone else has had it, too! This is a great place to troubleshoot.
- [n8n templates](https://n8n.io/workflows/): see what other people have built
- There are many content creators making great videos on n8n workflows. One excellent example is [Nate Herk](https://www.youtube.com/@nateherk), but feel free to check out the (many) videos that exist on YouTube.
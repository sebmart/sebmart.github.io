---
Author: Alex Jensen
title: Recitation 5
---


> **Important – No Core Content**  
> This recitation contains **no core content**. Everything in this document is **exploratory only** and will **not be directly tested** on the final exam.  
> That said, the patterns you see here (webhooks, front-ends, logging, and verifiable workflows) are highly relevant for both:
> - your **final exam**, and  
> - your **individual project**.

---

## 1. Goals for this recitation

By the end of this session, you should be able to:

- Explain what a **webhook** is and how webhooks work in **n8n**.
- Describe how to connect **n8n** to a front-end tool such as **Lovable** (or another app that can send HTTP requests).
- Understand the architecture of an **end-to-end interview prep product**:
  - Front-end form (company, role, job description, resume)
  - n8n workflow (webhooks, AI agent, memory, logging in Sheets)
  - Optional analysis workflow at the end.
- Work through **final-exam-style problems** that require you to:
  - Inspect JSON inputs/outputs  
  - Reason about node behavior  
  - Identify verifiable answers that depend on running the workflow.

Remember: today is about **design patterns** and **mental models**, not about memorizing syntax.

---

## 2. High-level overview: the interview prep product

Our running example is an **interview coach bot**:

1. A user fills in a form with:
   - Interviewee name  
   - Company name  
   - Job title  
   - Job description  
   - (Optional) resume upload  

2. When they submit the form:
   - The front end sends the data to **n8n** via a **webhook**.
   - n8n:
     - Creates a `session_id` for this user and interview.
     - Extracts text from the resume if present (or notes “No resume included”).
     - Calls an **AI Agent** that plays the role of the interviewer.
     - Logs the generated question into a **Google Sheet** for future reference.
     - Returns the first interview question to the front end.

3. The user answers each question:
   - Their response is sent back to n8n through a second webhook.
   - n8n logs each answer and generates the **next question**, forming a chat-like conversation.

4. At the end, the user can click **“Analyze conversation”**:
   - n8n pulls the full conversation from the sheet.
   - Builds a combined transcript.
   - Sends that to an **Analysis Agent**, which returns feedback on their performance.

This pattern is a template for many products:
- Intake → Orchestration → Logging → Feedback.

---

## 3. What is a webhook (in n8n)?

A **webhook** is a URL that another service can call to trigger your workflow.

In n8n, a Webhook node:

- Has a **method** (`GET`, `POST`, etc.).
- Has a **path** (e.g., `"39706c09-..."`).
- Exposes a derived URL like:

  ```text
  https://<your-n8n-instance>/webhook/<path>

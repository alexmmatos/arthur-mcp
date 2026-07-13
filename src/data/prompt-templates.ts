
import type { PromptTemplate } from './promptTemplate.interface'
export type { PromptTemplate } from './promptTemplate.interface'


export const PROMPT_TEMPLATE_CATEGORIES = [
  'Summarization',
  'Code',
  'Analysis',
  'Writing',
  'Customer Support',
  'Data Extraction',
  'Research',
  'SEO & Marketing',
  'HR & Recruiting',
  'Finance',
  'Legal',
  'Education',
  'Social Media',
  'Product Management',
  'Sales',
  'DevOps',
] as const

export const PROMPT_TEMPLATES: PromptTemplate[] = [

  // ─── Summarization ──────────────────────────────────────────────────────────

  {
    id: 'executive-summary',
    name: 'Executive Summary',
    tagline: 'Condense any document into a structured executive brief',
    description: 'Transforms long documents into concise executive summaries with key findings and recommendations.',
    category: 'Summarization',
    emoji: '📋',
    tags: ['summarization', 'business', 'executive'],
    content: `You are a business analyst. Summarize the following document into an executive summary.

Structure your response as:
1. **Overview** (2-3 sentences)
2. **Key Findings** (3-5 bullet points)
3. **Recommendations** (2-3 actionable next steps)
4. **Risks & Considerations**

Keep the tone professional and concise. Target audience: senior executives.

Document:
{{document}}`,
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes Distiller',
    tagline: 'Turn meeting transcripts into structured notes and action items',
    description: 'Converts raw meeting transcripts into organized notes with decisions, action items, and follow-ups.',
    category: 'Summarization',
    emoji: '📝',
    tags: ['summarization', 'meetings', 'productivity'],
    content: `Transform the following meeting transcript into structured notes.

**Date:** {{date}}
**Attendees:** {{attendees}}

## Key Decisions
-

## Action Items
| Task | Owner | Due Date |
|------|-------|----------|

## Discussion Points
-

## Next Steps
-

---
Transcript:
{{transcript}}`,
  },
  {
    id: 'article-key-points',
    name: 'Article Key Points',
    tagline: 'Extract essential insights from any article',
    description: 'Reads through articles and surfaces the most important takeaways in a scannable format.',
    category: 'Summarization',
    emoji: '🗞️',
    tags: ['summarization', 'reading', 'research'],
    content: `Extract the most important insights from the article below.

**TL;DR** (one sentence)

**Key Points**
1.
2.
3.
4.
5.

**Notable Quotes**
>

**Implications**

---
Article:
{{article}}`,
  },
  {
    id: 'podcast-summary',
    name: 'Podcast / Video Summary',
    tagline: 'Summarize spoken-word content into structured notes',
    description: 'Turns podcast transcripts or video captions into a clean summary with timestamps and highlights.',
    category: 'Summarization',
    emoji: '🎙️',
    tags: ['summarization', 'podcast', 'video'],
    content: `Summarize the following podcast or video transcript.

**Episode/Video:** {{title}}
**Guest(s):** {{guests}}
**Duration:** {{duration}}

## One-Paragraph Summary

## Key Topics Covered
1.
2.
3.

## Best Quotes
> (timestamp if available)

## Actionable Takeaways
-

## Resources Mentioned
-

---
Transcript:
{{transcript}}`,
  },
  {
    id: 'legal-doc-summary',
    name: 'Legal Document Summary',
    tagline: 'Translate dense legal text into plain English',
    description: 'Summarizes contracts, agreements, and legal filings in plain language for non-lawyers.',
    category: 'Summarization',
    emoji: '⚖️',
    tags: ['summarization', 'legal', 'contracts'],
    content: `Summarize the following legal document in plain English for a non-lawyer.

**Document type:** {{doc_type}}
**Parties involved:** {{parties}}

## What This Document Does
(2-3 sentence plain-language explanation)

## Key Terms & Obligations
| Party | Key Obligation |
|-------|---------------|

## Important Dates & Deadlines
-

## Rights Granted / Restrictions
-

## Red Flags or Unusual Clauses
-

## Recommended Next Steps
-

---
Document:
{{document}}`,
  },
  {
    id: 'financial-report-summary',
    name: 'Financial Report Summary',
    tagline: 'Distill earnings reports and financial statements',
    description: 'Extracts the key numbers, trends, and signals from financial reports into a concise brief.',
    category: 'Summarization',
    emoji: '📈',
    tags: ['summarization', 'finance', 'earnings'],
    content: `Summarize the following financial report for an investor audience.

**Company:** {{company}}
**Period:** {{period}}

## Financial Highlights
- Revenue:
- Net Income / Loss:
- EPS:
- YoY Growth:

## Key Positives
-

## Key Concerns
-

## Management Guidance
-

## Analyst Takeaway
(1-2 sentences on what this means for investors)

---
Report:
{{report}}`,
  },

  // ─── Code ───────────────────────────────────────────────────────────────────

  {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    tagline: 'Thorough code review covering quality, security, and performance',
    description: 'Performs a structured code review across correctness, security, performance, readability, and best practices.',
    category: 'Code',
    emoji: '🔍',
    tags: ['code', 'review', 'security', 'quality'],
    content: `You are a senior software engineer. Review the following code across these dimensions:

- **Correctness**: Logic errors, edge cases
- **Security**: Injection, XSS, insecure dependencies
- **Performance**: Inefficient algorithms, memory issues
- **Readability**: Naming, structure, comments
- **Best Practices**: Language/framework conventions
- **Test Coverage**: Gaps in testability

For each issue:
- Severity: 🔴 Critical / 🟠 High / 🟡 Medium / 🟢 Low
- Location and explanation
- Suggested fix

Language: {{language}}

Code:
{{code}}`,
  },
  {
    id: 'code-explainer',
    name: 'Code Explainer',
    tagline: 'Explain code in plain English for any audience',
    description: 'Translates technical code into clear, jargon-free explanations.',
    category: 'Code',
    emoji: '💬',
    tags: ['code', 'documentation', 'explanation'],
    content: `Explain the following code in plain English for a non-technical audience.

1. What it does at a high level (1-2 sentences)
2. Main steps in simple terms
3. Inputs and outputs
4. Important concepts (no jargon; use analogies if helpful)

Code:
{{code}}`,
  },
  {
    id: 'unit-test-generator',
    name: 'Unit Test Generator',
    tagline: 'Generate comprehensive unit tests for any function',
    description: 'Creates thorough unit tests covering happy paths, edge cases, and error conditions.',
    category: 'Code',
    emoji: '✅',
    tags: ['code', 'testing', 'quality'],
    content: `Generate comprehensive unit tests for the following function.

Requirements:
- Happy path (expected inputs/outputs)
- Edge cases (empty, null, boundary)
- Error cases (invalid inputs, exceptions)
- Descriptive test names
- Arrange-Act-Assert pattern

Framework: {{framework}}
Language: {{language}}

Code:
{{code}}`,
  },
  {
    id: 'bug-report-analyzer',
    name: 'Bug Report Analyzer',
    tagline: 'Diagnose bug reports and generate investigation plans',
    description: 'Analyzes bug reports and stack traces to produce structured investigation plans with fix suggestions.',
    category: 'Code',
    emoji: '🐛',
    tags: ['code', 'debugging', 'analysis'],
    content: `Analyze the following bug report and provide a structured investigation plan.

**Bug Summary**

**Root Cause Hypothesis**

**Investigation Steps**
1.
2.
3.

**Potential Fixes**
(most to least likely, with implementation notes)

**Prevention**

---
Bug Report:
{{bug_report}}

Stack Trace:
{{stack_trace}}`,
  },
  {
    id: 'refactoring-advisor',
    name: 'Refactoring Advisor',
    tagline: 'Identify and prioritize refactoring opportunities',
    description: 'Analyzes code for refactoring opportunities and produces a prioritized improvement plan.',
    category: 'Code',
    emoji: '♻️',
    tags: ['code', 'refactoring', 'architecture'],
    content: `Analyze the following code and identify refactoring opportunities.

For each opportunity:
- **Issue**: What is wrong or could be improved
- **Impact**: Why it matters (maintainability, performance, readability)
- **Refactoring**: Specific change to make with before/after example
- **Effort**: Low / Medium / High
- **Priority**: 1 (highest) to 5 (lowest)

Also identify:
- Design patterns that could be applied
- Dead code or duplication to eliminate
- Abstractions that are missing or leaking

Language/Framework: {{language}}

Code:
{{code}}`,
  },
  {
    id: 'api-docs-generator',
    name: 'API Documentation Generator',
    tagline: 'Generate OpenAPI-style docs from code or spec',
    description: 'Produces structured API documentation with endpoints, parameters, request/response examples.',
    category: 'Code',
    emoji: '📡',
    tags: ['code', 'documentation', 'api'],
    content: `Generate complete API documentation for the following endpoint(s).

For each endpoint include:
- **Method & Path**
- **Description**
- **Authentication** required
- **Request Parameters** (path, query, body) — name, type, required, description
- **Request Body** example (JSON)
- **Response Codes** — status, meaning, response body example
- **Error Responses** — common errors and their meaning
- **Rate Limits** (if applicable)
- **Code Example** (curl or the specified language)

Language: {{language}}

Code/Spec:
{{code}}`,
  },
  {
    id: 'sql-optimizer',
    name: 'SQL Query Optimizer',
    tagline: 'Optimize slow SQL queries for performance',
    description: 'Analyzes SQL queries for performance issues and rewrites them with indexing and optimization suggestions.',
    category: 'Code',
    emoji: '🗃️',
    tags: ['code', 'sql', 'database', 'performance'],
    content: `Optimize the following SQL query for performance.

Analysis steps:
1. **Identify bottlenecks**: missing indexes, full table scans, N+1 patterns, Cartesian products
2. **Rewrite the query** with optimizations applied
3. **Explain changes**: what was changed and why
4. **Indexing recommendations**: which indexes to add and on which columns
5. **Alternative approaches**: CTEs, window functions, materialized views if applicable

Database: {{database}} (e.g., PostgreSQL, MySQL, SQLite)
Table schema (if known): {{schema}}

Query:
{{query}}`,
  },
  {
    id: 'security-scanner',
    name: 'Security Vulnerability Scanner',
    tagline: 'Scan code for OWASP Top 10 and common vulnerabilities',
    description: 'Reviews code for security vulnerabilities including injection, auth issues, and data exposure risks.',
    category: 'Code',
    emoji: '🔒',
    tags: ['code', 'security', 'owasp'],
    content: `Perform a security vulnerability scan on the following code, focusing on the OWASP Top 10:

1. **Injection** (SQL, command, LDAP)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

For each vulnerability found:
- OWASP category
- Severity: Critical / High / Medium / Low
- Affected code location
- Attack scenario
- Remediation with secure code example

Language: {{language}}

Code:
{{code}}`,
  },
  {
    id: 'code-migration',
    name: 'Code Migration Guide',
    tagline: 'Plan and execute framework or language migrations',
    description: 'Creates a step-by-step migration plan from one technology to another with risk assessment.',
    category: 'Code',
    emoji: '🚀',
    tags: ['code', 'migration', 'architecture'],
    content: `Create a migration guide for the following code/codebase.

**From:** {{source_technology}}
**To:** {{target_technology}}

## Migration Assessment
- Scope and complexity
- Breaking changes
- Estimated effort

## Pre-Migration Checklist
-

## Migration Steps
1.
2.
3.

## Risk Areas
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|

## Testing Strategy
-

## Rollback Plan
-

Code/Description:
{{code}}`,
  },

  // ─── Analysis ───────────────────────────────────────────────────────────────

  {
    id: 'swot-analysis',
    name: 'SWOT Analysis',
    tagline: 'Structured strengths, weaknesses, opportunities, and threats',
    description: 'Generates a complete SWOT analysis with strategic recommendations.',
    category: 'Analysis',
    emoji: '🧭',
    tags: ['analysis', 'strategy', 'business'],
    content: `Perform a comprehensive SWOT analysis.

## SWOT Analysis: {{subject}}

### 💪 Strengths
-

### ⚠️ Weaknesses
-

### 🚀 Opportunities
-

### 🔴 Threats
-

### Strategic Recommendations
(2-3 priorities based on the SWOT)

---
Context:
{{context}}`,
  },
  {
    id: 'sentiment-analyzer',
    name: 'Sentiment Analyzer',
    tagline: 'Classify sentiment and emotional tone of any text',
    description: 'Analyzes text for overall sentiment, emotional tones, and key phrases driving the score.',
    category: 'Analysis',
    emoji: '📊',
    tags: ['analysis', 'sentiment', 'nlp'],
    content: `Analyze the sentiment of the following text.

**Overall Sentiment:** [Very Positive / Positive / Neutral / Negative / Very Negative]
**Confidence:** [High / Medium / Low]
**Score:** X/10

**Emotional Tones:**
- Primary:
- Secondary:

**Key Phrases:**
- Positive signals:
- Negative signals:

**Nuances:** (sarcasm, irony, mixed sentiment)

---
Text:
{{text}}`,
  },
  {
    id: 'root-cause-analysis',
    name: 'Root Cause Analysis',
    tagline: 'Identify root causes using the 5 Whys methodology',
    description: 'Guides a structured 5 Whys root cause analysis for incidents or business problems.',
    category: 'Analysis',
    emoji: '🔎',
    tags: ['analysis', 'incident', 'process'],
    content: `Conduct a root cause analysis using the 5 Whys methodology.

## Problem Statement
{{problem}}

## Timeline
{{timeline}}

## 5 Whys

**Why 1:** →

**Why 2:** →

**Why 3:** →

**Why 4:** →

**Why 5:** →

## Root Cause

## Corrective Actions
| Action | Owner | Priority | Due |
|--------|-------|----------|-----|

## Preventive Measures`,
  },
  {
    id: 'user-feedback-classifier',
    name: 'User Feedback Classifier',
    tagline: 'Categorize and extract themes from user feedback',
    description: 'Processes raw user feedback into structured categories, themes, and actionable insights.',
    category: 'Analysis',
    emoji: '🗣️',
    tags: ['analysis', 'feedback', 'product', 'ux'],
    content: `Analyze and classify the following user feedback.

## Feedback Summary
**Total items:** {{count}}
**Product/Feature:** {{product}}

## Sentiment Distribution
- Positive: %
- Neutral: %
- Negative: %

## Top Themes
| Theme | Frequency | Sentiment | Example Quote |
|-------|-----------|-----------|---------------|

## Top Feature Requests
1.
2.
3.

## Critical Issues (need immediate attention)
-

## Recommended Actions
1.
2.
3.

---
Feedback:
{{feedback}}`,
  },
  {
    id: 'risk-assessment',
    name: 'Risk Assessment Matrix',
    tagline: 'Identify, score, and prioritize project risks',
    description: 'Produces a structured risk register with likelihood, impact, and mitigation strategies.',
    category: 'Analysis',
    emoji: '⚠️',
    tags: ['analysis', 'risk', 'project management'],
    content: `Create a risk assessment for the following project or initiative.

**Project:** {{project}}
**Scope:** {{scope}}

## Risk Register
| # | Risk | Category | Likelihood (1-5) | Impact (1-5) | Score | Mitigation Strategy | Owner |
|---|------|----------|-----------------|-------------|-------|-------------------|-------|

## Top Priority Risks
(Score ≥ 15)
-

## Risk Response Plan
-

## Early Warning Indicators
-

Context:
{{context}}`,
  },
  {
    id: 'gap-analysis',
    name: 'Gap Analysis',
    tagline: 'Identify the distance between current and desired state',
    description: 'Maps the gap between where you are and where you want to be, with a roadmap to close it.',
    category: 'Analysis',
    emoji: '📐',
    tags: ['analysis', 'strategy', 'improvement'],
    content: `Conduct a gap analysis for the following scenario.

**Subject:** {{subject}}
**Current State:** {{current_state}}
**Desired State:** {{desired_state}}

## Gap Summary

## Detailed Gap Analysis
| Dimension | Current State | Desired State | Gap | Priority |
|-----------|--------------|--------------|-----|---------|

## Root Causes of Gaps
-

## Recommended Actions to Close Gaps
1.
2.
3.

## Resources Required
-

## Timeline Estimate
-`,
  },

  // ─── Writing ────────────────────────────────────────────────────────────────

  {
    id: 'professional-email',
    name: 'Professional Email',
    tagline: 'Draft polished, purpose-driven business emails',
    description: 'Creates professional emails with clear subject lines and appropriate tone.',
    category: 'Writing',
    emoji: '✉️',
    tags: ['writing', 'email', 'communication'],
    content: `Draft a professional email.

Context: {{context}}
Recipient: {{recipient}}
Purpose: {{purpose}}
Tone: {{tone}}
Key points: {{key_points}}

Output the complete email including subject line.`,
  },
  {
    id: 'product-description',
    name: 'Product Description',
    tagline: 'Benefit-focused e-commerce copy that converts',
    description: 'Writes compelling product descriptions with headlines, bullet points, and SEO keywords.',
    category: 'Writing',
    emoji: '🛍️',
    tags: ['writing', 'ecommerce', 'marketing'],
    content: `Write a compelling product description.

Product: {{product_name}}
Category: {{category}}
Features: {{features}}
Target audience: {{target_audience}}
USP: {{usp}}

Create:
1. **Headline** (8-12 words)
2. **Short Description** (2-3 sentences)
3. **Full Description** (150-200 words)
4. **Bullet Points** (5 key benefits)
5. **SEO Keywords** (10 terms)`,
  },
  {
    id: 'technical-documentation',
    name: 'Technical Documentation',
    tagline: 'Clear, structured docs for any component or API',
    description: 'Produces complete technical documentation with overview, usage, parameters, and troubleshooting.',
    category: 'Writing',
    emoji: '📖',
    tags: ['writing', 'documentation', 'technical'],
    content: `Write technical documentation for the following.

Subject: {{subject}}
Audience: {{audience}}
Context: {{context}}

## Overview
## Prerequisites
## How It Works
## Usage / Reference
## Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
## Examples
## Troubleshooting
## Related Resources`,
  },
  {
    id: 'press-release',
    name: 'Press Release Writer',
    tagline: 'Craft newsworthy press releases in AP style',
    description: 'Writes professional press releases following AP style with quotes, boilerplate, and contact info.',
    category: 'Writing',
    emoji: '📰',
    tags: ['writing', 'pr', 'marketing', 'news'],
    content: `Write a press release in AP style.

**Company:** {{company}}
**Announcement:** {{announcement}}
**Key Facts:** {{key_facts}}
**Quote from executive:** {{quote}}
**Release date:** {{date}}
**Embargo:** {{embargo}}

Structure:
- FOR IMMEDIATE RELEASE header
- City, Date dateline
- Headline (active voice, present tense)
- Lead paragraph (who, what, when, where, why)
- Body paragraphs with supporting details
- Executive quote
- About the company boilerplate
- Media contact information

Tone: Professional, newsworthy, factual`,
  },
  {
    id: 'job-description',
    name: 'Job Description Writer',
    tagline: 'Write inclusive, compelling job postings',
    description: 'Creates clear, inclusive job descriptions that attract top talent and set accurate expectations.',
    category: 'Writing',
    emoji: '💼',
    tags: ['writing', 'hr', 'recruiting'],
    content: `Write a job description for the following role.

**Role title:** {{title}}
**Department:** {{department}}
**Level:** {{level}} (e.g., junior, mid, senior)
**Location:** {{location}}
**Key responsibilities:** {{responsibilities}}
**Required qualifications:** {{required}}
**Nice-to-have:** {{preferred}}
**Compensation range:** {{compensation}}

Include:
- Compelling intro paragraph about the role and impact
- Clear responsibilities (5-8 bullet points)
- Requirements split into "must have" and "nice to have"
- What we offer (benefits section)
- Inclusive language — avoid gendered terms and unnecessary jargon`,
  },
  {
    id: 'blog-post-outline',
    name: 'Blog Post Outline',
    tagline: 'Create structured outlines for long-form content',
    description: 'Generates a detailed blog post outline with headings, subpoints, and SEO optimization notes.',
    category: 'Writing',
    emoji: '✍️',
    tags: ['writing', 'blog', 'content', 'seo'],
    content: `Create a detailed blog post outline.

**Topic:** {{topic}}
**Target audience:** {{audience}}
**Tone:** {{tone}} (e.g., educational, conversational, authoritative)
**Target word count:** {{word_count}}
**Primary keyword:** {{keyword}}
**Secondary keywords:** {{secondary_keywords}}

Outline structure:
- SEO title (under 60 chars, includes primary keyword)
- Meta description (under 155 chars)
- Intro hook
- H2 sections with H3 subpoints
- Key statistics or data to include (research suggestions)
- Call to action
- Internal link suggestions`,
  },
  {
    id: 'case-study',
    name: 'Case Study Writer',
    tagline: 'Write compelling customer success stories',
    description: 'Structures customer wins into persuasive case studies following the challenge-solution-result framework.',
    category: 'Writing',
    emoji: '🏆',
    tags: ['writing', 'marketing', 'case study'],
    content: `Write a customer case study.

**Customer:** {{customer}}
**Industry:** {{industry}}
**Challenge:** {{challenge}}
**Solution:** {{solution}}
**Results/Metrics:** {{results}}
**Quote from customer:** {{quote}}

Structure:
## About {{customer}}
## The Challenge
## The Solution
## Results
(Include specific metrics: %, time saved, revenue, etc.)
## What {{customer}} Says
> {{quote}}
## Key Takeaways`,
  },
  {
    id: 'faq-generator',
    name: 'FAQ Generator',
    tagline: 'Generate comprehensive FAQ sections from any content',
    description: 'Creates thorough FAQ sections anticipating real user questions from a topic or document.',
    category: 'Writing',
    emoji: '❓',
    tags: ['writing', 'documentation', 'support'],
    content: `Generate a comprehensive FAQ section for the following topic or product.

**Topic/Product:** {{topic}}
**Target audience:** {{audience}}
**Tone:** {{tone}}

Generate at least 15 questions covering:
- Basic "what is" and "how does it work" questions
- Pricing and plans (if applicable)
- Technical requirements or compatibility
- Common troubleshooting questions
- Privacy and security questions
- Getting started questions
- Advanced usage questions

For each question, provide:
- **Q:** Clear, natural-language question a user would actually ask
- **A:** Concise, helpful answer (2-4 sentences)

Context:
{{context}}`,
  },

  // ─── Customer Support ────────────────────────────────────────────────────────

  {
    id: 'ticket-classifier',
    name: 'Support Ticket Classifier',
    tagline: 'Triage and categorize incoming support tickets',
    description: 'Classifies tickets by category, priority, and sentiment and extracts key diagnostic info.',
    category: 'Customer Support',
    emoji: '🎫',
    tags: ['support', 'classification', 'triage'],
    content: `Classify the following support ticket.

**Category:** [Technical / Billing / Account / Feature Request / Bug / General]
**Subcategory:**
**Priority:** [P1 Critical / P2 High / P3 Medium / P4 Low]
**Sentiment:** [Frustrated / Neutral / Positive]
**Escalation Needed:** [Yes / No]

**Key Info:**
- Feature affected:
- Impact scope:
- Error messages:

**Suggested Team:** [Tech Support / Billing / Engineering / Account Mgmt]

---
Ticket:
{{ticket_content}}`,
  },
  {
    id: 'support-response',
    name: 'Support Response Generator',
    tagline: 'Draft empathetic, solution-oriented customer replies',
    description: 'Creates helpful, empathetic customer support responses with clear next steps.',
    category: 'Customer Support',
    emoji: '💌',
    tags: ['support', 'response', 'customer'],
    content: `Draft a helpful, empathetic customer support response.

Guidelines:
- Acknowledge the concern first
- Be empathetic but professional
- Provide a clear, actionable solution
- Avoid jargon
- Set clear expectations if you cannot resolve immediately
- End with an offer to help further

Tone: {{tone}}
Customer plan: {{plan}}
Context: {{context}}

Customer message:
{{customer_message}}`,
  },
  {
    id: 'escalation-detector',
    name: 'Escalation Detector',
    tagline: 'Identify tickets that need immediate escalation',
    description: 'Scans messages for escalation signals like legal threats, VIP accounts, or critical issues.',
    category: 'Customer Support',
    emoji: '🚨',
    tags: ['support', 'escalation', 'risk'],
    content: `Analyze this message for escalation triggers.

Triggers to check: legal threats, regulatory complaints (GDPR/CCPA), financial impact, social media threats, VIP/enterprise customer, safety concerns, repeated failures.

**Escalation Required:** [YES / NO]
**Urgency:** [Immediate <1h / High <4h / Medium same day / Low standard SLA]
**Reason:**
**Escalation Path:**
**Key Quotes:**
**Immediate Action:**

---
Message:
{{customer_message}}`,
  },
  {
    id: 'churn-risk-analyzer',
    name: 'Churn Risk Analyzer',
    tagline: 'Detect early signals of customer churn',
    description: 'Analyzes customer communication and behavior signals to predict and prevent churn.',
    category: 'Customer Support',
    emoji: '📉',
    tags: ['support', 'churn', 'retention'],
    content: `Analyze the following customer interaction history for churn risk signals.

**Customer:** {{customer}}
**Plan:** {{plan}}
**Tenure:** {{tenure}}
**Usage trend:** {{usage_trend}}

**Churn Risk:** [High / Medium / Low]
**Confidence:** [High / Medium / Low]

**Risk Signals Detected:**
-

**Contributing Factors:**
-

**Recommended Intervention:**
| Action | Channel | Timing | Owner |
|--------|---------|--------|-------|

**Retention Offer Suggestion:**
-

---
Interaction history:
{{history}}`,
  },
  {
    id: 'knowledge-base-article',
    name: 'Knowledge Base Article',
    tagline: 'Write self-service help articles from support tickets',
    description: 'Transforms resolved support tickets or feature explanations into polished KB articles.',
    category: 'Customer Support',
    emoji: '📚',
    tags: ['support', 'documentation', 'knowledge base'],
    content: `Write a knowledge base article for the following topic.

**Topic:** {{topic}}
**Audience:** {{audience}} (e.g., end users, administrators)
**Product/Feature:** {{product}}

Structure:
# {{Title}}

## Overview
(What this article covers — 1-2 sentences)

## Before You Begin
(Prerequisites or requirements)

## Step-by-Step Instructions
1.
2.
3.

## Screenshots / Visuals
(Note where to add visuals)

## Common Issues
| Issue | Cause | Solution |
|-------|-------|---------|

## Related Articles
-

## Was this helpful?
(Feedback prompt)

---
Source content:
{{source}}`,
  },
  {
    id: 'nps-analyzer',
    name: 'NPS Response Analyzer',
    tagline: 'Extract insights from Net Promoter Score responses',
    description: 'Analyzes NPS survey responses to surface themes, segment detractors/promoters, and recommend actions.',
    category: 'Customer Support',
    emoji: '⭐',
    tags: ['support', 'nps', 'feedback', 'analysis'],
    content: `Analyze the following NPS survey responses.

**Product:** {{product}}
**Survey period:** {{period}}
**Total responses:** {{count}}

## Score Distribution
- Promoters (9-10):
- Passives (7-8):
- Detractors (0-6):
- **NPS Score:**

## Promoter Themes
(What promoters love)
-

## Detractor Themes
(Main complaints)
-

## Quick Wins
(Issues that can be fixed quickly with high impact)
-

## Strategic Actions
1.
2.
3.

---
Responses:
{{responses}}`,
  },

  // ─── Data Extraction ─────────────────────────────────────────────────────────

  {
    id: 'entity-extractor',
    name: 'Entity Extractor',
    tagline: 'Pull names, dates, locations, and amounts from any text',
    description: 'Identifies and categorizes all named entities in unstructured text in structured format.',
    category: 'Data Extraction',
    emoji: '🏷️',
    tags: ['data', 'extraction', 'nlp', 'entities'],
    content: `Extract all named entities from the text below, organized by category.

Categories:
- **People** (with roles/titles)
- **Organizations**
- **Locations**
- **Dates & Times**
- **Financial Amounts**
- **Products & Services**
- **Events**
- **Technical Terms**

For each entity, note the context in which it appears.
Output as JSON for downstream processing.

---
Text:
{{text}}`,
  },
  {
    id: 'structured-data-parser',
    name: 'Structured Data Parser',
    tagline: 'Convert unstructured text to JSON using a schema',
    description: 'Parses free-form text and maps it to a defined JSON schema with confidence scoring.',
    category: 'Data Extraction',
    emoji: '⚙️',
    tags: ['data', 'extraction', 'json', 'parsing'],
    content: `Convert the following unstructured text into structured JSON.

Schema:
{{schema}}

Rules:
- Extract only explicitly stated information — do not infer
- Use null for missing fields
- Normalize dates to ISO 8601 (YYYY-MM-DD)
- Normalize phone numbers to E.164
- Use arrays for multiple values
- Add "confidence": "high"|"medium"|"low" for ambiguous fields

Return valid JSON only.

---
Text:
{{text}}`,
  },
  {
    id: 'invoice-extractor',
    name: 'Invoice & Receipt Extractor',
    tagline: 'Extract structured data from invoices and receipts',
    description: 'Pulls vendor, line items, totals, and payment terms from invoice text or OCR output.',
    category: 'Data Extraction',
    emoji: '🧾',
    tags: ['data', 'extraction', 'finance', 'invoices'],
    content: `Extract all data from the following invoice or receipt.

Output as JSON with this structure:
{
  "vendor": { "name": "", "address": "", "tax_id": "" },
  "invoice_number": "",
  "invoice_date": "",
  "due_date": "",
  "line_items": [{ "description": "", "quantity": 0, "unit_price": 0, "total": 0 }],
  "subtotal": 0,
  "tax": { "rate": 0, "amount": 0 },
  "total": 0,
  "currency": "",
  "payment_terms": "",
  "notes": ""
}

Use null for any field not present. Return valid JSON only.

---
Invoice text:
{{invoice_text}}`,
  },
  {
    id: 'contract-extractor',
    name: 'Contract Key Terms Extractor',
    tagline: 'Pull critical clauses and obligations from contracts',
    description: 'Extracts parties, obligations, dates, payment terms, and risk clauses from contract text.',
    category: 'Data Extraction',
    emoji: '📜',
    tags: ['data', 'extraction', 'legal', 'contracts'],
    content: `Extract key terms from the following contract.

Output as JSON:
{
  "parties": [{ "name": "", "role": "" }],
  "effective_date": "",
  "expiration_date": "",
  "auto_renewal": false,
  "payment_terms": { "amount": "", "frequency": "", "due_date": "" },
  "termination_notice_days": null,
  "governing_law": "",
  "dispute_resolution": "",
  "confidentiality_obligations": "",
  "key_obligations": [],
  "liability_cap": "",
  "unusual_clauses": []
}

Note any clauses that appear unusual or especially favorable/unfavorable to one party.

---
Contract:
{{contract}}`,
  },
  {
    id: 'resume-parser',
    name: 'Resume / CV Parser',
    tagline: 'Extract structured data from resumes and CVs',
    description: 'Parses resume text into structured JSON with contact info, experience, skills, and education.',
    category: 'Data Extraction',
    emoji: '📄',
    tags: ['data', 'extraction', 'hr', 'resume'],
    content: `Parse the following resume/CV into structured data.

Output as JSON:
{
  "personal": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "" },
  "summary": "",
  "experience": [{ "company": "", "title": "", "start": "", "end": "", "description": "" }],
  "education": [{ "institution": "", "degree": "", "field": "", "year": "" }],
  "skills": { "technical": [], "soft": [], "languages": [], "certifications": [] },
  "projects": [{ "name": "", "description": "", "technologies": [] }],
  "total_experience_years": 0
}

---
Resume:
{{resume_text}}`,
  },
  {
    id: 'survey-analyzer',
    name: 'Survey Response Analyzer',
    tagline: 'Extract themes and insights from survey open-ends',
    description: 'Processes open-ended survey responses to identify patterns, themes, and sentiment.',
    category: 'Data Extraction',
    emoji: '📋',
    tags: ['data', 'extraction', 'survey', 'analysis'],
    content: `Analyze the following open-ended survey responses.

**Question asked:** {{question}}
**Number of responses:** {{count}}

## Thematic Analysis
| Theme | Frequency | % | Representative Quote |
|-------|-----------|---|---------------------|

## Sentiment Breakdown
- Positive: %
- Neutral: %
- Negative: %

## Subgroup Differences
(Note any notable differences if demographic data is available)

## Key Insights
1.
2.
3.

## Verbatim Highlights
(Top 5 most insightful responses)
-

---
Responses:
{{responses}}`,
  },

  // ─── Research ────────────────────────────────────────────────────────────────

  {
    id: 'comparative-analysis',
    name: 'Comparative Analysis',
    tagline: 'Systematically compare options and produce a recommendation',
    description: 'Evaluates multiple options against defined criteria and produces a comparison matrix with a final recommendation.',
    category: 'Research',
    emoji: '⚖️',
    tags: ['research', 'analysis', 'decision'],
    content: `Provide a thorough comparative analysis.

Options: {{options}}
Context: {{context}}
Criteria: {{criteria}}

## Overview
## Comparison Matrix
| Criteria | Option 1 | Option 2 | Option 3 |
|----------|----------|----------|----------|
## Strengths & Weaknesses
## Best Fit Scenarios
## Recommendation
## Caveats`,
  },
  {
    id: 'research-summary',
    name: 'Research Paper Summary',
    tagline: 'Distill academic or technical papers into actionable insights',
    description: 'Summarizes research papers with methodology, findings, practical implications, and limitations.',
    category: 'Research',
    emoji: '🔬',
    tags: ['research', 'summarization', 'academic'],
    content: `Summarize the following research paper for a technical audience.

**Title:**
**Authors:**
**Published:**
**Contribution:** (one sentence)

## Problem Statement
## Methodology
## Key Findings
1.
2.
3.
## Results & Evidence
## Limitations
## Practical Implications
## Related Work

---
Paper:
{{paper}}`,
  },
  {
    id: 'market-research',
    name: 'Market Research Report',
    tagline: 'Synthesize market data into a structured research report',
    description: 'Compiles market size, trends, players, and opportunities into a structured research brief.',
    category: 'Research',
    emoji: '🌍',
    tags: ['research', 'market', 'business'],
    content: `Create a market research report for the following market.

**Market:** {{market}}
**Geography:** {{geography}}
**Time horizon:** {{horizon}}

## Market Overview
- Market size (current):
- Market size (projected):
- CAGR:

## Key Trends
1.
2.
3.

## Market Segmentation
-

## Competitive Landscape
| Player | Market Share | Strengths | Weaknesses |
|--------|-------------|-----------|-----------|

## Customer Segments
-

## Opportunities & White Space
-

## Barriers to Entry
-

## Outlook
-

Sources used:
{{sources}}`,
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis',
    tagline: 'Deep-dive competitive intelligence on a specific rival',
    description: 'Researches and structures competitive intelligence on a specific company or product.',
    category: 'Research',
    emoji: '🕵️',
    tags: ['research', 'competitive', 'business'],
    content: `Conduct a competitive analysis on the following competitor.

**Competitor:** {{competitor}}
**Our company:** {{our_company}}
**Market:** {{market}}

## Company Overview
## Products / Services
## Pricing Strategy
## Target Customers
## Marketing & Positioning
## Tech Stack (if known)
## Strengths
-
## Weaknesses
-
## Recent Moves
(Recent launches, hires, funding, news)
-
## Threats to Us
-
## Opportunities This Creates
-

Sources:
{{sources}}`,
  },
  {
    id: 'tech-trend-report',
    name: 'Technology Trend Report',
    tagline: 'Analyze and forecast trends in a technology domain',
    description: 'Structures an analysis of emerging technology trends with adoption curves and strategic implications.',
    category: 'Research',
    emoji: '💡',
    tags: ['research', 'technology', 'trends'],
    content: `Create a technology trend report for the following domain.

**Domain:** {{domain}}
**Audience:** {{audience}}
**Horizon:** {{horizon}} (e.g., 1 year, 3-5 years)

## Executive Summary

## Trends Overview
| Trend | Maturity | Adoption Pace | Strategic Impact |
|-------|----------|--------------|-----------------|

## Deep Dive: Top 3 Trends
For each: what it is, why it matters, who is leading, real-world applications, timeline

## Risks & Challenges
-

## Strategic Recommendations
1.
2.
3.

## Companies to Watch
-

Sources:
{{sources}}`,
  },

  // ─── SEO & Marketing ─────────────────────────────────────────────────────────

  {
    id: 'seo-meta-tags',
    name: 'SEO Meta Tags Generator',
    tagline: 'Generate optimized title tags and meta descriptions',
    description: 'Creates SEO-optimized title tags, meta descriptions, and Open Graph tags for web pages.',
    category: 'SEO & Marketing',
    emoji: '🔖',
    tags: ['seo', 'marketing', 'meta'],
    content: `Generate SEO meta tags for the following page.

**Page topic:** {{topic}}
**Primary keyword:** {{keyword}}
**Secondary keywords:** {{secondary}}
**Page type:** {{page_type}} (e.g., blog post, product page, homepage)

Output:
- **Title tag** (50-60 chars, includes primary keyword near the start)
- **Meta description** (150-155 chars, compelling, includes keyword, has a CTA)
- **Open Graph title**
- **Open Graph description**
- **Twitter card title**
- **Twitter card description**
- **Canonical URL suggestion**
- **5 related long-tail keyword ideas**`,
  },
  {
    id: 'ad-copy',
    name: 'Ad Copy Writer',
    tagline: 'Write high-converting ad copy for any platform',
    description: 'Creates multiple ad copy variants for Google, Meta, LinkedIn, and display ads.',
    category: 'SEO & Marketing',
    emoji: '📣',
    tags: ['marketing', 'advertising', 'copywriting'],
    content: `Write ad copy for the following campaign.

**Product/Service:** {{product}}
**Target audience:** {{audience}}
**Platform:** {{platform}} (Google / Meta / LinkedIn / Display)
**Objective:** {{objective}} (awareness / clicks / conversions)
**Key benefit:** {{benefit}}
**CTA:** {{cta}}

Generate 3 variants for each format:
- **Headline** (max chars per platform)
- **Description/Body**
- **CTA**

Also include:
- Emotional hooks
- Power words used
- A/B test recommendation`,
  },
  {
    id: 'email-newsletter',
    name: 'Email Newsletter Writer',
    tagline: 'Craft engaging newsletters that drive opens and clicks',
    description: 'Writes full email newsletters with subject lines, preheader, body, and CTAs optimized for engagement.',
    category: 'SEO & Marketing',
    emoji: '📧',
    tags: ['marketing', 'email', 'newsletter'],
    content: `Write an email newsletter.

**Brand:** {{brand}}
**Audience:** {{audience}}
**Main topic:** {{topic}}
**Secondary topics:** {{secondary_topics}}
**Primary CTA:** {{cta}}
**Tone:** {{tone}}

Output:
- **Subject line** (3 variants, under 50 chars)
- **Preheader text** (under 90 chars)
- **Email body** (sections with headers, short paragraphs, bullet points)
- **Primary CTA button text**
- **P.S. line** (optional, high-engagement tactic)

Keep paragraphs short. Use second person ("you"). Avoid spam trigger words.`,
  },
  {
    id: 'landing-page-copy',
    name: 'Landing Page Copy',
    tagline: 'Conversion-optimized copy for landing pages',
    description: 'Writes full landing page copy following the AIDA framework with social proof and objection handling.',
    category: 'SEO & Marketing',
    emoji: '🎯',
    tags: ['marketing', 'landing page', 'copywriting', 'conversion'],
    content: `Write conversion-optimized landing page copy following the AIDA framework.

**Product/Service:** {{product}}
**Target audience:** {{audience}}
**Primary offer:** {{offer}}
**Key benefits (3-5):** {{benefits}}
**Social proof available:** {{social_proof}}
**Main objections:** {{objections}}
**CTA:** {{cta}}

Sections:
1. **Hero headline** + subheadline
2. **Problem statement** (agitate the pain)
3. **Solution** (your product as the answer)
4. **Benefits section** (3 benefit blocks with headline + 2-line description)
5. **Social proof** (testimonials, logos, numbers)
6. **Objection handling** (FAQ-style)
7. **CTA section** (urgency + clear action)`,
  },
  {
    id: 'content-brief',
    name: 'Content Brief Generator',
    tagline: 'Create detailed briefs for content writers',
    description: 'Generates comprehensive content briefs with SEO requirements, structure, and messaging guidelines.',
    category: 'SEO & Marketing',
    emoji: '📝',
    tags: ['marketing', 'content', 'seo', 'brief'],
    content: `Create a detailed content brief for a writer.

**Topic:** {{topic}}
**Content type:** {{content_type}} (blog post, whitepaper, guide, etc.)
**Target audience:** {{audience}}
**Primary keyword:** {{keyword}}
**Search intent:** {{intent}} (informational / commercial / transactional)
**Competitor URLs to beat:** {{competitors}}

Brief includes:
- **Goal & KPIs**
- **Target audience persona**
- **SEO requirements** (keyword, secondary terms, internal links)
- **Recommended structure** (H1, H2s, H3s with guidance)
- **Word count range**
- **Tone and style guidelines**
- **Key points to cover**
- **Points of differentiation** (what competitors miss)
- **Sources to cite**
- **Visuals needed**`,
  },

  // ─── HR & Recruiting ─────────────────────────────────────────────────────────

  {
    id: 'resume-screener',
    name: 'Resume Screener',
    tagline: 'Score and rank candidates against job requirements',
    description: 'Evaluates resumes against job criteria and produces a structured scorecard with hire/no-hire recommendation.',
    category: 'HR & Recruiting',
    emoji: '🗂️',
    tags: ['hr', 'recruiting', 'screening'],
    content: `Screen the following resume against the job requirements.

**Job title:** {{title}}
**Must-have requirements:** {{must_have}}
**Nice-to-have requirements:** {{nice_to_have}}
**Years of experience required:** {{experience}}

## Candidate Scorecard
| Requirement | Met? | Evidence |
|-------------|------|---------|

**Total Score:** X/10
**Recommendation:** [Strong Yes / Yes / Maybe / No]
**Reasoning:**
**Green flags:**
-
**Red flags:**
-
**Suggested interview questions** (based on gaps):
-

---
Resume:
{{resume}}`,
  },
  {
    id: 'interview-questions',
    name: 'Interview Question Generator',
    tagline: 'Create targeted interview questions for any role',
    description: 'Generates behavioral, technical, and situational interview questions tailored to a specific role.',
    category: 'HR & Recruiting',
    emoji: '🎤',
    tags: ['hr', 'recruiting', 'interviews'],
    content: `Generate interview questions for the following role.

**Role:** {{role}}
**Level:** {{level}}
**Key competencies to assess:** {{competencies}}
**Technical areas to test:** {{technical_areas}}

Generate:

## Behavioral Questions (STAR format)
(5 questions, each probing a specific competency)

## Technical / Skills Questions
(5 questions with what a good answer looks like)

## Situational Questions
(3 hypothetical scenarios)

## Culture Fit Questions
(3 questions)

## Candidate Questions to Ask Us
(3 questions the candidate should ask — assess if they do)

For each question, note: **What you're assessing** and **Green/Red flag answers**`,
  },
  {
    id: 'performance-review',
    name: 'Performance Review Writer',
    tagline: 'Draft balanced, constructive performance reviews',
    description: 'Writes structured performance reviews with achievements, areas for growth, and development goals.',
    category: 'HR & Recruiting',
    emoji: '📊',
    tags: ['hr', 'performance', 'management'],
    content: `Write a performance review for the following employee.

**Employee:** {{employee}}
**Role:** {{role}}
**Review period:** {{period}}
**Manager:** {{manager}}
**Accomplishments:** {{accomplishments}}
**Areas needing improvement:** {{improvements}}
**Goals for next period:** {{goals}}
**Overall rating:** {{rating}} (e.g., Exceeds Expectations)

Structure:
## Overall Performance Summary
## Key Accomplishments
-
## Core Competency Ratings
| Competency | Rating | Notes |
|-----------|--------|-------|
## Areas for Development
-
## Goals for Next Period
| Goal | Success Metric | Timeline |
|------|---------------|---------|
## Manager's Closing Remarks`,
  },
  {
    id: 'onboarding-plan',
    name: 'Employee Onboarding Plan',
    tagline: 'Create structured 30-60-90 day onboarding plans',
    description: 'Generates detailed onboarding plans with milestones, activities, and success metrics.',
    category: 'HR & Recruiting',
    emoji: '🤝',
    tags: ['hr', 'onboarding', 'management'],
    content: `Create a 30-60-90 day onboarding plan.

**Role:** {{role}}
**Department:** {{department}}
**Manager:** {{manager}}
**Team context:** {{team_context}}
**Key tools/systems:** {{tools}}

## Day 1-7: Orientation
- Administrative setup
- Key introductions
- Culture and values

## 30-Day Goals
**Focus:** Learn
- Objectives:
- Key meetings to schedule:
- Resources to review:
- **Success looks like:**

## 60-Day Goals
**Focus:** Contribute
- Objectives:
- First deliverables:
- **Success looks like:**

## 90-Day Goals
**Focus:** Own
- Objectives:
- Independent projects:
- **Success looks like:**

## Check-in Schedule
| Day | Type | Agenda |
|-----|------|--------|`,
  },
  {
    id: 'offer-letter',
    name: 'Job Offer Letter',
    tagline: 'Generate professional, legally-aware offer letters',
    description: 'Drafts complete job offer letters with compensation details, start date, and standard contingencies.',
    category: 'HR & Recruiting',
    emoji: '📨',
    tags: ['hr', 'recruiting', 'offer'],
    content: `Draft a job offer letter.

**Company:** {{company}}
**Candidate:** {{candidate_name}}
**Role:** {{role}}
**Department:** {{department}}
**Manager:** {{manager}}
**Start date:** {{start_date}}
**Base salary:** {{salary}}
**Bonus:** {{bonus}}
**Equity:** {{equity}}
**Benefits:** {{benefits}}
**Offer expiry:** {{expiry}}

Include:
- Warm opening congratulating the candidate
- Role and reporting structure
- Compensation breakdown
- Benefits summary
- Start date and onboarding logistics
- At-will employment statement (if applicable)
- Contingencies (background check, I-9, etc.)
- How to accept
- Closing with enthusiasm

Note: This is a draft template — consult legal counsel before sending.`,
  },

  // ─── Finance ─────────────────────────────────────────────────────────────────

  {
    id: 'financial-statement-analyzer',
    name: 'Financial Statement Analyzer',
    tagline: 'Analyze P&L, balance sheets, and cash flow statements',
    description: 'Reviews financial statements to surface trends, ratios, and red flags for business health.',
    category: 'Finance',
    emoji: '💰',
    tags: ['finance', 'analysis', 'accounting'],
    content: `Analyze the following financial statement.

**Company:** {{company}}
**Statement type:** {{type}} (P&L / Balance Sheet / Cash Flow / All three)
**Period:** {{period}}
**Prior period for comparison:** {{prior_period}}

## Key Metrics
| Metric | Current | Prior | Change |
|--------|---------|-------|--------|

## Key Ratios
(Liquidity, Profitability, Leverage, Efficiency — as applicable)

## Trends & Highlights
-

## Red Flags / Concerns
-

## Strengths
-

## Recommendations
-

---
Financial data:
{{financial_data}}`,
  },
  {
    id: 'budget-variance',
    name: 'Budget Variance Explainer',
    tagline: 'Explain budget vs actual variances in business terms',
    description: 'Analyzes budget variances and explains them with root causes and corrective actions.',
    category: 'Finance',
    emoji: '📊',
    tags: ['finance', 'budgeting', 'analysis'],
    content: `Analyze and explain the following budget variances.

**Department:** {{department}}
**Period:** {{period}}

## Variance Summary
| Line Item | Budget | Actual | Variance | % |
|-----------|--------|--------|---------|---|

## Favorable Variances
(What went better than planned and why)
-

## Unfavorable Variances
(What went over budget and why)
-

## Root Cause Analysis
-

## Corrective Actions
-

## Forecast Adjustment
(Revised full-year projection based on current trends)

---
Data:
{{budget_data}}`,
  },
  {
    id: 'investment-thesis',
    name: 'Investment Thesis Writer',
    tagline: 'Structure an investment thesis for any asset or company',
    description: 'Creates a structured investment thesis with bull/bear cases, valuation, and risk factors.',
    category: 'Finance',
    emoji: '📈',
    tags: ['finance', 'investment', 'analysis'],
    content: `Write an investment thesis for the following.

**Asset/Company:** {{asset}}
**Asset class:** {{asset_class}}
**Investment horizon:** {{horizon}}
**Current price/valuation:** {{price}}

## Executive Summary
(1-paragraph bull case)

## Business Overview
## Competitive Advantage / Moat
## Growth Drivers
1.
2.
3.

## Financial Overview
## Valuation
- Current:
- Target:
- Upside/Downside:

## Bull Case
## Bear Case
## Key Risks
| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|

## Catalysts to Watch
-

## Conclusion: [Buy / Hold / Sell]`,
  },
  {
    id: 'expense-categorizer',
    name: 'Expense Categorizer',
    tagline: 'Auto-categorize expense line items for accounting',
    description: 'Categorizes raw expense data into standard accounting categories with tax treatment notes.',
    category: 'Finance',
    emoji: '💳',
    tags: ['finance', 'accounting', 'expenses'],
    content: `Categorize the following expense items for accounting purposes.

**Company type:** {{company_type}}
**Accounting standard:** {{standard}} (GAAP / IFRS / Cash basis)
**Currency:** {{currency}}

For each expense, assign:
- Category (e.g., Travel, Software, Marketing, COGS, R&D, G&A)
- Subcategory
- Deductible: Yes / No / Partial
- Tax treatment notes
- Reimbursable: Yes / No

Output as a table with columns: Date | Vendor | Amount | Category | Subcategory | Deductible | Notes

Flag any expenses that need further review or receipts.

---
Expense list:
{{expenses}}`,
  },
  {
    id: 'cash-flow-forecast',
    name: 'Cash Flow Forecast',
    tagline: 'Project cash flow based on historical data and assumptions',
    description: 'Builds a structured cash flow forecast with scenario analysis for planning purposes.',
    category: 'Finance',
    emoji: '💵',
    tags: ['finance', 'forecasting', 'cash flow'],
    content: `Create a cash flow forecast based on the following data.

**Company:** {{company}}
**Forecast period:** {{period}}
**Historical data provided:** {{historical_period}}

## Assumptions
| Assumption | Value | Basis |
|-----------|-------|-------|

## Monthly Cash Flow Projection
| Month | Opening Cash | Inflows | Outflows | Net | Closing Cash |
|-------|-------------|---------|---------|-----|-------------|

## Scenario Analysis
| Scenario | Key Assumption | 3-Month Cash Position |
|---------|---------------|----------------------|
| Base    | | |
| Bull    | | |
| Bear    | | |

## Cash Runway
- Current runway:
- Break-even month:

## Key Risks to Forecast
-

---
Historical data:
{{data}}`,
  },

  // ─── Legal ───────────────────────────────────────────────────────────────────

  {
    id: 'contract-review',
    name: 'Contract Review Checklist',
    tagline: 'Review contracts for missing or risky clauses',
    description: 'Evaluates contracts against a standard checklist of clauses, flagging gaps and risks.',
    category: 'Legal',
    emoji: '📑',
    tags: ['legal', 'contracts', 'compliance'],
    content: `Review the following contract against standard requirements.

**Contract type:** {{contract_type}}
**Our role:** {{our_role}} (buyer/seller/licensor/licensee/etc.)

## Clause Checklist
| Clause | Present? | Risk Level | Notes |
|--------|---------|-----------|-------|
| Parties and definitions | | | |
| Scope of work / deliverables | | | |
| Payment terms | | | |
| Intellectual property ownership | | | |
| Confidentiality / NDA | | | |
| Limitation of liability | | | |
| Indemnification | | | |
| Warranties and representations | | | |
| Termination rights | | | |
| Governing law and jurisdiction | | | |
| Dispute resolution | | | |
| Force majeure | | | |
| Amendment process | | | |

## High-Risk Items
-

## Missing Critical Clauses
-

## Negotiation Priorities
1.
2.
3.

Note: This is a preliminary review — engage qualified legal counsel before signing.

---
Contract:
{{contract}}`,
  },
  {
    id: 'privacy-policy-analyzer',
    name: 'Privacy Policy Analyzer',
    tagline: 'Check privacy policies for GDPR and CCPA compliance',
    description: 'Reviews privacy policies against GDPR, CCPA, and general best practices, flagging gaps and risks.',
    category: 'Legal',
    emoji: '🔏',
    tags: ['legal', 'privacy', 'gdpr', 'compliance'],
    content: `Analyze the following privacy policy for compliance and clarity.

**Company type:** {{company_type}}
**Applicable regulations:** {{regulations}} (GDPR / CCPA / LGPD / PIPEDA / other)
**Data types collected:** {{data_types}}

## Compliance Checklist
| Requirement | Present? | Compliant? | Gap |
|------------|---------|-----------|-----|
| Legal basis for processing (GDPR) | | | |
| Data categories collected | | | |
| Third-party sharing disclosure | | | |
| Data retention periods | | | |
| User rights (access, deletion, portability) | | | |
| Cookie policy | | | |
| Contact information for DPO/privacy team | | | |
| Breach notification process | | | |
| Children's data handling (COPPA if applicable) | | | |

## Critical Gaps
-

## Unclear or Misleading Language
-

## Recommended Additions
-

---
Policy:
{{policy}}`,
  },
  {
    id: 'terms-summarizer',
    name: 'Terms of Service Summarizer',
    tagline: 'Translate lengthy ToS into plain English bullet points',
    description: 'Extracts the key user rights, restrictions, and risky clauses from Terms of Service documents.',
    category: 'Legal',
    emoji: '📋',
    tags: ['legal', 'terms', 'consumer'],
    content: `Summarize the following Terms of Service in plain English.

**Service:** {{service}}
**User type:** {{user_type}} (consumer / business)

## What You Agree To
(Key obligations and usage rules)
-

## What the Company Can Do
-

## What You Cannot Do
-

## Data and Privacy
-

## Payment and Cancellation
-

## Your IP Rights
-

## Their Liability Limitations
-

## How to Cancel / Delete Account
-

## Red Flags
(Clauses unusually favorable to the company or restrictive for users)
-

**Risk Rating:** [Low / Medium / High] — explanation

---
Terms of Service:
{{tos}}`,
  },
  {
    id: 'legal-memo',
    name: 'Legal Memo Writer',
    tagline: 'Structure legal analysis in standard memo format',
    description: 'Drafts legal memos with question presented, brief answer, facts, analysis, and conclusion.',
    category: 'Legal',
    emoji: '⚖️',
    tags: ['legal', 'memo', 'analysis'],
    content: `Draft a legal memo on the following matter.

**To:** {{to}}
**From:** {{from}}
**Date:** {{date}}
**Re:** {{subject}}
**Jurisdiction:** {{jurisdiction}}

## Question Presented
(The specific legal question to be answered)

## Brief Answer
(One-paragraph direct answer)

## Relevant Facts
-

## Analysis
### Applicable Law
### Application to Facts
### Counterarguments

## Conclusion
(Recommendation and reasoning)

## Caveats
(Limitations of this analysis)

---
Background:
{{background}}

Note: This memo is for informational purposes only and does not constitute legal advice.`,
  },

  // ─── Education ───────────────────────────────────────────────────────────────

  {
    id: 'lesson-plan',
    name: 'Lesson Plan Creator',
    tagline: 'Design structured lesson plans with objectives and activities',
    description: 'Creates detailed lesson plans with learning objectives, activities, assessment, and materials.',
    category: 'Education',
    emoji: '🎓',
    tags: ['education', 'teaching', 'curriculum'],
    content: `Create a detailed lesson plan.

**Topic:** {{topic}}
**Subject:** {{subject}}
**Grade level / Age group:** {{level}}
**Duration:** {{duration}}
**Learning standards addressed:** {{standards}}
**Prior knowledge assumed:** {{prior_knowledge}}

## Learning Objectives
By the end of this lesson, students will be able to:
1. (Knowledge)
2. (Comprehension/Application)
3. (Analysis/Synthesis)

## Materials Needed
-

## Lesson Structure
| Phase | Duration | Activity | Teacher Actions | Student Actions |
|-------|---------|---------|----------------|----------------|
| Hook/Warm-up | | | | |
| Instruction | | | | |
| Guided Practice | | | | |
| Independent Practice | | | | |
| Closure | | | | |

## Assessment
-

## Differentiation
- For advanced students:
- For struggling students:
- For ELL students:

## Homework / Extension
-`,
  },
  {
    id: 'quiz-generator',
    name: 'Quiz Generator',
    tagline: 'Create quizzes with multiple formats from any content',
    description: 'Generates multiple choice, true/false, and short answer questions from educational content.',
    category: 'Education',
    emoji: '❓',
    tags: ['education', 'assessment', 'quiz'],
    content: `Generate a quiz from the following content.

**Topic:** {{topic}}
**Level:** {{level}}
**Number of questions:** {{count}}
**Question types:** {{types}} (multiple choice, true/false, short answer, matching)
**Difficulty distribution:** {{difficulty}} (e.g., 40% easy, 40% medium, 20% hard)

For multiple choice questions:
- 4 options (A-D)
- One clearly correct answer
- Plausible distractors
- No "all of the above" or "none of the above"

Include:
- Answer key at the end
- Brief explanation for each correct answer
- Bloom's taxonomy level for each question

---
Source content:
{{content}}`,
  },
  {
    id: 'learning-objectives',
    name: 'Learning Objective Writer',
    tagline: 'Write SMART learning objectives using Bloom\'s taxonomy',
    description: 'Creates measurable learning objectives at all levels of Bloom\'s taxonomy for courses and modules.',
    category: 'Education',
    emoji: '🎯',
    tags: ['education', 'curriculum', 'instructional design'],
    content: `Write learning objectives for the following course or module.

**Course/Module:** {{course}}
**Topic:** {{topic}}
**Target audience:** {{audience}}
**Level:** {{level}} (introductory / intermediate / advanced)

Write 2 objectives at each level of Bloom's taxonomy:

**Remember** (recall facts)
-

**Understand** (explain concepts)
-

**Apply** (use in new situations)
-

**Analyze** (break down and compare)
-

**Evaluate** (make judgments)
-

**Create** (produce something new)
-

Each objective should be:
- Specific and measurable
- Start with an action verb
- Include a condition and criterion where appropriate`,
  },
  {
    id: 'explainer-for-beginners',
    name: 'Concept Explainer for Beginners',
    tagline: 'Explain any complex concept to a complete beginner',
    description: 'Breaks down complex concepts using the Feynman Technique with analogies and examples.',
    category: 'Education',
    emoji: '🧠',
    tags: ['education', 'explanation', 'learning'],
    content: `Explain the following concept to a complete beginner using the Feynman Technique.

**Concept:** {{concept}}
**Beginner's background:** {{background}}
**Analogy universe to draw from:** {{analogy_domain}} (e.g., cooking, sports, everyday life)

Structure:
1. **The Core Idea** (1-2 sentences, zero jargon)
2. **The Analogy** (map the concept to something familiar)
3. **How It Actually Works** (step by step, simple language)
4. **A Concrete Example** (real-world scenario)
5. **Common Misconceptions** (what people often get wrong)
6. **Why It Matters** (practical relevance)
7. **If You Want to Learn More** (logical next step)`,
  },
  {
    id: 'course-outline',
    name: 'Course Outline Generator',
    tagline: 'Structure a full course curriculum from a topic',
    description: 'Creates a complete course outline with modules, lessons, learning objectives, and assessments.',
    category: 'Education',
    emoji: '📚',
    tags: ['education', 'curriculum', 'course design'],
    content: `Create a complete course outline.

**Course title:** {{title}}
**Subject:** {{subject}}
**Target audience:** {{audience}}
**Total duration:** {{duration}}
**Format:** {{format}} (self-paced, instructor-led, blended)
**Prerequisite knowledge:** {{prerequisites}}

## Course Overview
## Learning Outcomes (5-7)
## Module Structure

For each module:
### Module X: {{Module Title}}
**Duration:** | **Learning objectives:**
| Lesson | Topics | Activities | Assessment |
|--------|--------|-----------|-----------|

## Final Assessment / Capstone Project
## Recommended Resources
## Certification / Completion Criteria`,
  },

  // ─── Social Media ─────────────────────────────────────────────────────────────

  {
    id: 'social-media-post',
    name: 'Social Media Post Generator',
    tagline: 'Create platform-native posts for any social network',
    description: 'Generates optimized posts for LinkedIn, Twitter/X, Instagram, and Facebook with platform-specific formatting.',
    category: 'Social Media',
    emoji: '📱',
    tags: ['social media', 'content', 'marketing'],
    content: `Create social media posts for the following content.

**Topic/Announcement:** {{topic}}
**Brand voice:** {{voice}} (e.g., professional, playful, inspirational)
**Target audience:** {{audience}}
**Goal:** {{goal}} (awareness / engagement / traffic / leads)

Generate one optimized post for each platform:

**LinkedIn:**
(Professional tone, 1200-1500 chars, paragraph format, 3-5 hashtags)

**Twitter/X:**
(Punchy, under 280 chars, 1-2 hashtags, strong hook)

**Instagram:**
(Visual-first caption, conversational, 2-3 sentences + hashtag block of 10-15 tags)

**Facebook:**
(Conversational, question-driven for engagement, 1-3 short paragraphs)

Also suggest:
- Best posting time for each platform
- Emoji recommendations
- Content type for visual (photo / video / carousel / infographic)`,
  },
  {
    id: 'hashtag-strategy',
    name: 'Hashtag Strategy',
    tagline: 'Research and tier hashtags for maximum reach',
    description: 'Develops a tiered hashtag strategy with high, medium, and niche tags for content amplification.',
    category: 'Social Media',
    emoji: '#️⃣',
    tags: ['social media', 'hashtags', 'reach'],
    content: `Develop a hashtag strategy for the following.

**Brand/Creator:** {{brand}}
**Industry:** {{industry}}
**Content theme:** {{theme}}
**Platform:** {{platform}}
**Account size:** {{followers}} followers

## Hashtag Tiers

**Tier 1 — High volume (>1M posts)** (use 2-3)
(Broad, competitive, awareness play)

**Tier 2 — Medium volume (100K-1M posts)** (use 5-7)
(Industry-specific, good reach-to-competition ratio)

**Tier 3 — Niche/Long-tail (<100K posts)** (use 5-8)
(Highly targeted, easier to rank, engaged community)

**Branded hashtags** (use 1-2)

## Content-Type Hashtag Sets
(Rotating sets for different post types)

## Hashtags to Avoid
(Banned, overused, or irrelevant ones)

## Testing Strategy
(How to A/B test hashtag performance)`,
  },
  {
    id: 'content-calendar',
    name: 'Content Calendar Planner',
    tagline: 'Plan a month of social content around themes and events',
    description: 'Creates a structured content calendar with themes, post types, and copy ideas for a full month.',
    category: 'Social Media',
    emoji: '📅',
    tags: ['social media', 'content', 'planning'],
    content: `Create a monthly content calendar.

**Brand:** {{brand}}
**Month:** {{month}}
**Platforms:** {{platforms}}
**Content pillars:** {{pillars}} (e.g., education, product, culture, user stories)
**Upcoming events/launches:** {{events}}
**Posting frequency:** {{frequency}}

## Content Calendar

| Date | Day | Platform | Pillar | Format | Topic/Hook | Caption Notes | CTA |
|------|-----|---------|--------|--------|-----------|--------------|-----|

## Campaign Ideas for the Month
-

## Repurposing Opportunities
(How to reuse one piece of content across platforms)

## Key Dates & Moments to Leverage
-

## KPIs to Track
-`,
  },
  {
    id: 'community-response',
    name: 'Community Response Writer',
    tagline: 'Craft authentic replies to comments and DMs',
    description: 'Generates on-brand, authentic responses to social media comments, DMs, and reviews.',
    category: 'Social Media',
    emoji: '💬',
    tags: ['social media', 'community', 'engagement'],
    content: `Write a response to the following social media interaction.

**Brand:** {{brand}}
**Platform:** {{platform}}
**Brand voice:** {{voice}}
**Context/thread:** {{context}}

Interaction type: {{type}} (comment / DM / review / complaint / compliment / question)

Response guidelines:
- Match platform norms (casual for Instagram, professional for LinkedIn)
- Use brand voice consistently
- Be genuine — avoid corporate-speak
- For complaints: acknowledge, empathize, offer solution/next step
- For compliments: thank sincerely, reinforce brand value
- For questions: answer fully, invite further conversation
- Keep it concise

Generate 2 variants (different tones/approaches) so you can choose.

---
Interaction:
{{interaction}}`,
  },
  {
    id: 'influencer-brief',
    name: 'Influencer Brief',
    tagline: 'Create detailed briefs for influencer partnerships',
    description: 'Produces comprehensive influencer briefs with campaign goals, content requirements, and dos and don\'ts.',
    category: 'Social Media',
    emoji: '🌟',
    tags: ['social media', 'influencer', 'marketing'],
    content: `Create an influencer campaign brief.

**Brand:** {{brand}}
**Product/Campaign:** {{campaign}}
**Influencer:** {{influencer}}
**Platform(s):** {{platforms}}
**Campaign dates:** {{dates}}
**Budget/Compensation:** {{compensation}}
**Deliverables:** {{deliverables}} (e.g., 2 posts, 5 stories, 1 reel)

## Campaign Overview
## Brand Background
## Campaign Goal & KPIs
## Target Audience
## Messaging & Key Points
(3-5 talking points to include)
## Creative Direction
(Tone, aesthetics, do's)
## Content Requirements
| Deliverable | Format | Due Date | Caption Length | Required Tags |
|------------|--------|---------|---------------|--------------|
## Mandatory Disclosures
(#ad, #sponsored, FTC requirements)
## Approval Process
## Do's and Don'ts
## Contact`,
  },

  // ─── Product Management ───────────────────────────────────────────────────────

  {
    id: 'user-story',
    name: 'User Story Writer',
    tagline: 'Write well-structured user stories with acceptance criteria',
    description: 'Creates user stories in standard format with acceptance criteria, edge cases, and story points guidance.',
    category: 'Product Management',
    emoji: '📌',
    tags: ['product', 'agile', 'user stories'],
    content: `Write user stories for the following feature.

**Feature:** {{feature}}
**Product:** {{product}}
**User persona(s):** {{personas}}
**Business goal:** {{business_goal}}

For each user story:

**As a** [persona],
**I want to** [action],
**So that** [benefit].

**Acceptance Criteria:**
- GIVEN [context]
- WHEN [action]
- THEN [expected outcome]

**Edge Cases:**
-

**Out of Scope:**
-

**Dependencies:**
-

**Story Points estimate:** S / M / L / XL
**Priority:** Must-have / Should-have / Could-have

Generate 3-5 user stories covering the core flows.`,
  },
  {
    id: 'feature-spec',
    name: 'Feature Specification',
    tagline: 'Write detailed product specs for engineering teams',
    description: 'Creates comprehensive feature specifications with requirements, flows, edge cases, and success metrics.',
    category: 'Product Management',
    emoji: '🗺️',
    tags: ['product', 'specification', 'engineering'],
    content: `Write a feature specification.

**Feature name:** {{feature}}
**Product:** {{product}}
**Author:** {{author}}
**Date:** {{date}}
**Status:** Draft / In Review / Approved

## Overview
(What this feature does and why we're building it)

## Problem Statement
## Goals & Non-Goals
## Success Metrics
| Metric | Current | Target | How Measured |
|--------|---------|--------|-------------|

## User Stories
(Link or summarize)

## Requirements
### Functional Requirements
-
### Non-Functional Requirements
(Performance, security, accessibility)
-

## User Flows
(Description or link to Figma)

## Edge Cases
-

## Technical Considerations
(For the engineering team)

## Open Questions
-

## Launch Plan & Rollout
-`,
  },
  {
    id: 'roadmap-prioritizer',
    name: 'Roadmap Prioritizer',
    tagline: 'Score and rank features using RICE or MoSCoW',
    description: 'Evaluates a list of features using prioritization frameworks to produce a ranked roadmap.',
    category: 'Product Management',
    emoji: '🗓️',
    tags: ['product', 'roadmap', 'prioritization'],
    content: `Prioritize the following feature backlog.

**Product:** {{product}}
**Team size:** {{team}}
**Timeframe:** {{timeframe}}
**Strategic goals:** {{goals}}
**Prioritization framework:** {{framework}} (RICE / ICE / MoSCoW / Value vs Effort)

Features to evaluate:
{{features}}

## RICE Scoring (if selected)
| Feature | Reach | Impact | Confidence | Effort | RICE Score |
|---------|-------|--------|-----------|--------|-----------|

## MoSCoW Breakdown (if selected)
**Must Have:**
**Should Have:**
**Could Have:**
**Won't Have (this cycle):**

## Recommended Roadmap
| Quarter | Features | Rationale |
|---------|---------|-----------|

## Dependencies & Risks
-

## What We're Not Building (and why)
-`,
  },
  {
    id: 'stakeholder-update',
    name: 'Stakeholder Update',
    tagline: 'Write concise product updates for leadership',
    description: 'Produces clear stakeholder updates with progress, blockers, decisions needed, and next steps.',
    category: 'Product Management',
    emoji: '📢',
    tags: ['product', 'communication', 'stakeholders'],
    content: `Write a stakeholder update for the following product/project.

**Product/Project:** {{project}}
**Period:** {{period}}
**Author:** {{author}}
**Audience:** {{audience}} (e.g., executives, board, cross-functional partners)

## Summary
(3-sentence executive summary)

## Progress vs Plan
| Milestone | Target | Status | Notes |
|----------|--------|--------|-------|

## Highlights
-

## Risks & Blockers
| Issue | Impact | Mitigation | Owner | Due |
|-------|--------|-----------|-------|-----|

## Decisions Needed
-

## Key Metrics
| Metric | Last Period | This Period | Trend |
|--------|-----------|------------|-------|

## Next Period Plan
-

---
Context:
{{context}}`,
  },
  {
    id: 'product-requirements',
    name: 'Product Requirements Document',
    tagline: 'Create a full PRD for a new product or feature',
    description: 'Produces a complete Product Requirements Document with context, user needs, requirements, and success criteria.',
    category: 'Product Management',
    emoji: '📄',
    tags: ['product', 'prd', 'requirements'],
    content: `Write a Product Requirements Document (PRD).

**Product/Feature:** {{feature}}
**Author:** {{author}}
**Version:** 1.0
**Date:** {{date}}

## 1. Overview & Context
## 2. Problem Statement
## 3. Target Users
## 4. Goals
| Goal | Metric | Target |
|------|--------|--------|
## 5. Non-Goals
## 6. Assumptions & Constraints
## 7. User Stories
## 8. Detailed Requirements
### 8.1 Functional Requirements
### 8.2 Non-Functional Requirements
### 8.3 Design Requirements
## 9. Technical Considerations
## 10. Dependencies
## 11. Timeline & Milestones
## 12. Open Questions
## 13. Appendix / References`,
  },

  // ─── Sales ───────────────────────────────────────────────────────────────────

  {
    id: 'cold-outreach',
    name: 'Cold Outreach Email',
    tagline: 'Write personalized cold emails that get replies',
    description: 'Creates compelling, personalized cold outreach emails with high-converting subject lines and CTAs.',
    category: 'Sales',
    emoji: '🎣',
    tags: ['sales', 'outreach', 'email'],
    content: `Write a cold outreach email.

**Sender:** {{sender}}
**Company:** {{our_company}}
**Prospect:** {{prospect}}
**Prospect company:** {{prospect_company}}
**Role:** {{prospect_role}}
**Value proposition:** {{value_prop}}
**Specific hook/trigger:** {{trigger}} (e.g., recent news, mutual connection, their job posting)
**CTA:** {{cta}}

Guidelines:
- Subject line: specific, intriguing, personalized (under 50 chars)
- First line: personalized to them (not "I hope this email finds you well")
- Body: focus on their pain/outcome, not our features
- Social proof: one relevant customer or stat
- CTA: low friction (15-min call, quick question), not "buy now"
- Length: under 150 words

Generate 3 variants (different angles/hooks).`,
  },
  {
    id: 'objection-handler',
    name: 'Objection Handler',
    tagline: 'Craft responses to common sales objections',
    description: 'Prepares polished, empathetic responses to the most common objections in your sales cycle.',
    category: 'Sales',
    emoji: '🛡️',
    tags: ['sales', 'objections', 'negotiation'],
    content: `Create objection handling responses for the following sales scenario.

**Product/Service:** {{product}}
**Price point:** {{price}}
**Target market:** {{market}}
**Objections to address:** {{objections}}

For each objection, provide:
1. **Acknowledge** (validate the concern)
2. **Reframe** (shift perspective)
3. **Respond** (address the substance)
4. **Confirm** (check if resolved)

Example format:
**Objection:** "It's too expensive."
**Response:** "I hear you — budget is always a real constraint. [Reframe] Many of our customers felt the same way initially, but when we calculated the time saved per week, the ROI typically pays for itself in under 90 days. [Ask] What would need to be true for this to make sense for your budget?"

Objections:
{{objections}}`,
  },
  {
    id: 'sales-proposal',
    name: 'Sales Proposal Writer',
    tagline: 'Create compelling, customized sales proposals',
    description: 'Writes professional sales proposals with problem framing, solution, pricing, and social proof.',
    category: 'Sales',
    emoji: '📊',
    tags: ['sales', 'proposal', 'business development'],
    content: `Write a sales proposal.

**Our company:** {{our_company}}
**Prospect:** {{prospect}}
**Decision maker:** {{decision_maker}}
**Problem/Need identified:** {{problem}}
**Our solution:** {{solution}}
**Key differentiators:** {{differentiators}}
**Pricing:** {{pricing}}
**Timeline:** {{timeline}}
**Case studies/references:** {{case_studies}}

## Executive Summary
(3 sentences: their problem, our solution, expected outcome)

## Understanding Your Challenge
(Demonstrate you understand their specific situation)

## Our Proposed Solution
## Why {{our_company}}
## Investment
| Package | Price | Includes |
|---------|-------|---------|
## Expected ROI / Outcomes
## Implementation Timeline
## Case Study
## Next Steps
## Terms & Validity`,
  },
  {
    id: 'followup-sequence',
    name: 'Follow-Up Email Sequence',
    tagline: 'Write a multi-touch follow-up cadence that converts',
    description: 'Creates a 5-7 email follow-up sequence with varied hooks, value adds, and breakup email.',
    category: 'Sales',
    emoji: '🔄',
    tags: ['sales', 'email', 'sequence'],
    content: `Write a follow-up email sequence.

**Context:** {{context}} (e.g., after demo, after proposal, after no-reply to cold email)
**Prospect:** {{prospect}}
**Product:** {{product}}
**Objection to address (if known):** {{objection}}

## Sequence (5-7 emails)

**Email 1 (Day 1):** Immediate follow-up
Subject:
Body:

**Email 2 (Day 3):** Add value (insight, resource, case study)
Subject:
Body:

**Email 3 (Day 7):** Different angle / address objection
Subject:
Body:

**Email 4 (Day 14):** Social proof or urgency
Subject:
Body:

**Email 5 (Day 21):** "Last attempt" with a twist
Subject:
Body:

**Email 6 (Day 30):** Breakup email
Subject:
Body:

Keep each email under 100 words. One CTA per email. Vary the hooks.`,
  },
  {
    id: 'win-loss-analysis',
    name: 'Win/Loss Analysis',
    tagline: 'Extract insights from won and lost deals',
    description: 'Structures post-deal analysis to surface patterns in wins and losses for sales improvement.',
    category: 'Sales',
    emoji: '🏅',
    tags: ['sales', 'analysis', 'strategy'],
    content: `Conduct a win/loss analysis for the following deal.

**Deal:** {{deal}}
**Outcome:** {{outcome}} (Won / Lost)
**Competitor (if lost to):** {{competitor}}
**Deal size:** {{deal_size}}
**Sales cycle length:** {{cycle}}
**Decision maker:** {{decision_maker}}

## Deal Summary

## Why We Won / Lost
### Our Strengths in This Deal
-
### Our Weaknesses
-
### Buyer's Decision Criteria
| Criterion | Weight | Our Score | Competitor Score |
|-----------|--------|-----------|-----------------|

## What We Could Have Done Differently
-

## Competitive Intelligence Gained
-

## Recommendations
1. (For sales process)
2. (For product/pricing)
3. (For marketing messaging)

---
Notes/CRM data:
{{notes}}`,
  },

  // ─── DevOps ──────────────────────────────────────────────────────────────────

  {
    id: 'incident-postmortem',
    name: 'Incident Postmortem',
    tagline: 'Write blameless postmortems for production incidents',
    description: 'Creates structured blameless postmortem documents with timeline, impact, root cause, and action items.',
    category: 'DevOps',
    emoji: '🚒',
    tags: ['devops', 'incident', 'sre', 'postmortem'],
    content: `Write a blameless incident postmortem.

**Incident ID:** {{incident_id}}
**Date:** {{date}}
**Severity:** {{severity}} (SEV1 / SEV2 / SEV3)
**Duration:** {{duration}}
**Services affected:** {{services}}
**Incident commander:** {{commander}}

## Summary
(2-3 sentence plain-language description of what happened and the impact)

## Impact
- Users affected:
- Revenue impact:
- SLA breach:

## Timeline
| Time | Event |
|------|-------|

## Root Cause
(Technical root cause — no blame, focus on systems)

## Contributing Factors
-

## What Went Well
-

## What Went Poorly
-

## Action Items
| Action | Owner | Priority | Due Date | Status |
|--------|-------|---------|---------|--------|

## Lessons Learned
-`,
  },
  {
    id: 'runbook',
    name: 'Runbook Writer',
    tagline: 'Create step-by-step operational runbooks',
    description: 'Produces clear, actionable runbooks for operational procedures, deployments, and incident response.',
    category: 'DevOps',
    emoji: '📗',
    tags: ['devops', 'runbook', 'operations', 'sre'],
    content: `Write an operational runbook for the following procedure.

**Procedure:** {{procedure}}
**System:** {{system}}
**Trigger:** {{trigger}} (when to run this)
**Author:** {{author}}
**Last updated:** {{date}}

## Overview
(What this runbook accomplishes)

## Prerequisites
- Access/permissions required:
- Tools required:
- Estimated duration:

## Steps
1. **Step title**
   - Command/action:
   \`\`\`
   {{command}}
   \`\`\`
   - Expected output:
   - If this fails:

## Verification
(How to confirm the procedure succeeded)

## Rollback Procedure
-

## Escalation Path
If you cannot complete this runbook, contact:
-

## Common Issues
| Issue | Symptoms | Resolution |
|-------|---------|-----------|`,
  },
  {
    id: 'architecture-decision-record',
    name: 'Architecture Decision Record',
    tagline: 'Document architectural decisions with context and consequences',
    description: 'Creates an ADR documenting the context, decision, alternatives considered, and consequences.',
    category: 'DevOps',
    emoji: '🏗️',
    tags: ['devops', 'architecture', 'documentation', 'adr'],
    content: `Write an Architecture Decision Record (ADR).

**Title:** {{title}}
**Date:** {{date}}
**Status:** Proposed / Accepted / Deprecated / Superseded
**Deciders:** {{deciders}}

## Context
(What situation or problem is driving this decision? Include technical and business constraints.)

## Decision
(The chosen approach, stated as a complete sentence: "We will...")

## Rationale
(Why this option was chosen)

## Alternatives Considered
| Option | Pros | Cons | Reason Not Chosen |
|--------|------|------|-----------------|

## Consequences
### Positive
-
### Negative
-
### Risks
-

## Implementation Notes
-

## Related Decisions
-

## References
-`,
  },
  {
    id: 'deployment-checklist',
    name: 'Deployment Checklist',
    tagline: 'Generate pre/post deployment checklists for safe releases',
    description: 'Creates comprehensive deployment checklists tailored to the service and deployment type.',
    category: 'DevOps',
    emoji: '🚢',
    tags: ['devops', 'deployment', 'checklist', 'release'],
    content: `Generate a deployment checklist for the following release.

**Service:** {{service}}
**Environment:** {{environment}} (staging / production)
**Deployment type:** {{type}} (rolling / blue-green / canary / big bang)
**Risk level:** {{risk}} (Low / Medium / High)

## Pre-Deployment (T-24h)
- [ ] Code review complete and approved
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security scan clean
- [ ] Performance benchmarks acceptable
- [ ] Database migrations tested on staging
- [ ] Rollback plan documented and tested
- [ ] On-call engineer notified
- [ ] Customer comms drafted (if applicable)

## Pre-Deployment (T-1h)
- [ ] Deployment window confirmed with team
- [ ] Monitoring dashboards open
- [ ] Alerts configured for anomalies
- [ ] Feature flags set correctly

## During Deployment
- [ ] Deployment started: Time:
- [ ] Health checks passing
- [ ] Error rate nominal
- [ ] Latency nominal

## Post-Deployment (first 30 min)
- [ ] Smoke tests passed
- [ ] Key flows verified end-to-end
- [ ] Metrics stable
- [ ] No spike in error logs

## Rollback Triggers
(Define thresholds: if X happens, roll back)
-`,
  },
  {
    id: 'on-call-alert-triage',
    name: 'On-Call Alert Triage',
    tagline: 'Classify and prioritize production alerts',
    description: 'Structures the investigation and classification of production alerts for on-call engineers.',
    category: 'DevOps',
    emoji: '📟',
    tags: ['devops', 'oncall', 'sre', 'monitoring'],
    content: `Triage the following production alert.

**Alert name:** {{alert_name}}
**Service:** {{service}}
**Severity:** {{severity}}
**Time triggered:** {{time}}
**Environment:** {{environment}}

## Initial Classification
**Real or Noise?** [Real / False Positive / Flapping]
**Severity Assessment:** [SEV1 / SEV2 / SEV3 / No Action]

## Impact Assessment
- Users affected:
- Revenue impact:
- Degraded vs. down:

## Immediate Actions
1.
2.
3.

## Investigation Checklist
- [ ] Check recent deployments
- [ ] Check dependent services
- [ ] Check infrastructure health
- [ ] Review error logs
- [ ] Check external dependencies

## Escalation Decision
**Escalate?** [Yes / No]
**Escalate to:**
**Communication needed?** [Yes / No — customer-facing?]

---
Alert details:
{{alert_details}}`,
  },
]

# AI Agent Architecture: SerialSense 🤖

This document outlines the behavior, prompts, and operational constraints of the AI agents powering the **SerialSense** inspection pipeline.

By offloading unstructured image analysis to a dedicated vision-capable agent, the application automates industrial data entry with high reliability.

---

## 1. The Data Extraction Agent

### 📋 Agent Profile

- **Identity:** SerialSense Data Entry Specialist
- **Underlying Model:** `gpt-4o-mini`
- **Core Directive:** Parse incoming field inspection photos to extract metadata without human intervention.
- **Input:** Unstructured container images (via Twilio/S3).
- **Output:** Structured, machine-readable JSON.

### 🛠️ System Instructions (The "Prompt")

```text
You are an autonomous industrial data extraction agent for SerialSense. Your sole task is to analyze images of electrical battery containers and return structured data with 100% precision.

Look for two primary data points:
1. Serial Number: Alphanumeric codes located on barcodes, engraved metal plates, or asset tags.
2. Inspection Status: Labels, text, handwritten marks, or stickers indicating "Pass", "Fail", "OK", or "Damaged".

Rules:
- Never guess. If an element is missing or completely unreadable, return null.
- Evaluate your own certainty and provide a confidence score between 0.0 and 1.0.
- You must output strictly valid JSON matching the schema below. Do not wrap the JSON in markdown formatting or include conversational text.

```

### 📊 Expected Output Schema

The agent is forced to respond using OpenAI's `response_format: { type: "json_object" }` to guarantee compatibility with our Node.js backend.

```json
{
  "serial_number": "string or null",
  "inspection_status": "pass" | "fail" | "unknown",
  "confidence_score": 0.85
}

```

---

## 2. Agent Decision Tree & Logic Flow

When an image enters the backend, the agent's output triggers specific systemic behaviors:

```
[Inspector Image] ➔ [Data Extraction Agent]
                           │
                           ▼
                 Is Confidence > 0.80?
                 ├── YES ➔ Upsert to MongoDB (Auto-Approve)
                 └── NO  ➔ Flag Record as "Pending Manual Review"

```

1. **High Confidence Pass/Fail:** If `confidence_score` $\ge$ 0.80, the system automatically writes the record to MongoDB and updates the dashboard.
2. **Low Confidence / Unreadable:** If `confidence_score` $<$ 0.80 or `serial_number` is `null`, the system creates a "Flagged" record, alerting the manager on the React frontend to manually view the image and override the data.

---

## 3. Performance & Cost Optimization

- **Token Mitigation:** Images are passed using the `low` detail setting where possible to compress image analysis down to **85 tokens** per request, keeping operating costs under $0.0002 per inspection.
- **Deterministic Output:** Temperature is set to `0.0` to eliminate creative variance and ensure consistent, repeatable extractions across identical photos.

---

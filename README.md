# SerialSense AI ⚡

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: MERN](https://img.shields.io/badge/Stack-MERN-blue)](https://www.mongodb.com/mern-stack)
[![AI: OpenAI-GPT--4o--mini](https://img.shields.io/badge/AI-GPT--4o--mini-green)](https://openai.com/)

**SerialSense AI** is an intelligent battery container inspection system designed to bridge the gap between field hardware testing and digital record-keeping. It automates the extraction of serial numbers and test results from field photos using Computer Vision.

## 📖 The Problem

In industrial settings, inspectors often manually relay container data to managers via messaging apps. This leads to:

- **Data Entry Errors:** Manual transcription of long alphanumeric serial numbers.
- **Lost Records:** Vital inspection photos buried in chat histories.
- **Duplicate Testing:** No real-time way for an inspector to know if a container was already processed.

## 🚀 The Solution

SerialSense AI allows inspectors to simply snap a photo and send it. The application:

1.  **Ingests** the image via a messaging gateway (Twilio).
2.  **Analyzes** the image using **GPT-4o-mini** to extract the Serial Number and Pass/Fail status.
3.  **Logs** the data into a **MongoDB** database, recording the inspector's ID (phone number) and timestamps.
4.  **Visualizes** the results on a **React** dashboard for management review.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite) + Vanilla CSS (Glassmorphism UI)
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **AI Engine:** OpenAI GPT-4o-mini (Vision)
- **Image Handling:** Twilio API + AWS S3

---

## 🏗️ Architecture

1.  **Mobile Intake:** Field inspector sends a photo of a battery container via Twilio, OR an Admin uploads a photo directly from the web dashboard.
2.  **AI Extraction:** The backend sends the image to OpenAI with a structured prompt.
3.  **Validation Logic:** 
    - If confidence score >= 0.80 and all data is present, the record is saved directly as **Approved**.
    - If the AI is uncertain, the record is flagged as **Pending Manual Review**.
4.  **Web Portal:** The manager views the live feed of inspections, inspects flagged photos, and overrides AI data manually via an interactive Image Viewer.

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas Account
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/SerialSense.git
   cd SerialSense
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` folder and add your credentials:
   ```env
   OPENAI_API_KEY=your_key_here
   MONGO_URI=your_mongodb_uri
   PORT=5001
   ```
   Start the backend server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**:
   Open a new terminal window and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Test the App**:
   Navigate to `http://localhost:5173` in your browser. Click **"Upload Photo"** to submit a battery container image and watch the AI process it in real-time!

---

## 📸 Demo & Use Case

_This project was built as part of a technical deep-dive for my YouTube channel to demonstrate practical AI implementation in industrial workflows._

**Key Feature Demonstrated:** Structured JSON data extraction from unstructured image uploads.

---



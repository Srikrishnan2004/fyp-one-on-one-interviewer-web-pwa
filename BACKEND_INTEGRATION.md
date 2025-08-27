# Backend Integration Guide - Expected Response Format

## 📋 **Updated Flow (No More Chat Route for Questions!)**

### ✅ **What Changed:**

- **No more `/chat` calls** for question audio generation
- **Questions come with audio/lipsync** directly from `/interview/generate`
- **Only user responses** go through `/chat` route
- **Sequential question flow** as requested

## 🔄 **Expected Response Format**

### 1. `/interview/generate` Response

Your backend should return questions **with audio and lipsync data**:

```json
{
  "success": true,
  "template": "frameworks.nodejs",
  "questions": [
    {
      "text": "What is the purpose of the Event Loop in Node.js?",
      "difficulty": "beginner",
      "category": "Event Loop and Non-blocking I/O",
      "followUp": "Can you provide more details?",
      "audio": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj...",
      "lipsync": {
        "metadata": {
          "soundFile": "question1.wav",
          "duration": 3.2
        },
        "mouthCues": [
          { "start": 0.0, "end": 0.15, "value": "X" },
          { "start": 0.15, "end": 0.25, "value": "A" },
          { "start": 0.25, "end": 0.35, "value": "B" }
        ]
      },
      "facialExpression": "default",
      "animation": "Talking_1"
    },
    {
      "text": "How do you handle errors in a Node.js application?",
      "difficulty": "intermediate",
      "category": "Error Handling and debugging",
      "followUp": "Can you provide more details?",
      "audio": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj...",
      "lipsync": {
        "metadata": {
          "soundFile": "question2.wav",
          "duration": 2.8
        },
        "mouthCues": [
          { "start": 0.0, "end": 0.12, "value": "H" },
          { "start": 0.12, "end": 0.22, "value": "A" },
          { "start": 0.22, "end": 0.32, "value": "O" }
        ]
      },
      "facialExpression": "default",
      "animation": "Talking_2"
    }
  ],
  "count": 2
}
```

### 2. `/chat` Response (For User Answers Only)

Only user responses go through chat route:

```json
{
  "messages": [
    {
      "text": "Great explanation! You mentioned the call stack. Can you elaborate on how it interacts with the Event Loop?",
      "audio": "UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj...",
      "lipsync": {
        "metadata": {
          "soundFile": "response1.wav",
          "duration": 4.1
        },
        "mouthCues": [
          { "start": 0.0, "end": 0.18, "value": "G" },
          { "start": 0.18, "end": 0.28, "value": "R" }
        ]
      },
      "facialExpression": "smile",
      "animation": "Talking_1"
    }
  ]
}
```

## 🎯 **Frontend Flow**

### **Step 1: Template Selection**

```
User selects "Node.js Interview" → Frontend calls:
POST /interview/generate
{
  "template": "frameworks.nodejs",
  "context": "Interview for Node.js Interview position"
}
```

### **Step 2: Question Display**

```
Backend returns 3 questions with audio/lipsync data →
Frontend shows:
1. Welcome message (text-only)
2. First question (with audio from backend)
```

### **Step 3: User Response**

```
User speaks: "The Event Loop handles asynchronous operations..." →
Frontend sends to chat:
POST /chat
{
  "message": "The Event Loop handles asynchronous operations...",
  "context": {
    "template": "frameworks.nodejs",
    "interviewMode": true,
    "currentQuestion": "What is the purpose of the Event Loop in Node.js?",
    "questionIndex": 0,
    "totalQuestions": 3
  }
}
```

### **Step 4: AI Response + Next Question**

```
Backend returns AI response with audio/lipsync →
Frontend plays AI response →
After 2 seconds delay →
Frontend shows next question (already has audio from step 1)
```

### **Step 5: Repeat Until Complete**

```
Continue cycle: User Answer → AI Response → Next Question
Until all questions are completed
```

## 🔧 **Required Backend Changes**

### **Update `/interview/generate`:**

```javascript
// Generate questions with audio for each question
const questions = generateQuestions(template);

for (let question of questions) {
  // Generate audio using Piper TTS
  const audio = await generateAudio(question.text);

  // Generate lipsync using Rhubarb
  const lipsync = await generateLipsync(audio);

  question.audio = audio; // base64 encoded
  question.lipsync = lipsync;
  question.facialExpression = "default";
  question.animation = "Talking_1";
}

return { success: true, questions, count: questions.length };
```

### **Keep `/chat` for user responses:**

```javascript
// Only process user responses and generate AI feedback
app.post('/chat', (req, res) => {
  const { message, context } = req.body;

  // Generate AI response to user's answer
  const response = await generateAIResponse(message, context);

  // Generate audio for AI response
  const audio = await generateAudio(response);
  const lipsync = await generateLipsync(audio);

  res.json({
    messages: [{
      text: response,
      audio: audio,
      lipsync: lipsync,
      facialExpression: "smile",
      animation: "Talking_1"
    }]
  });
});
```

## ✅ **Benefits of This Approach**

1. **⚡ Faster Loading**: Questions are pre-generated with audio
2. **🔄 Cleaner Flow**: No redundant audio generation calls
3. **📱 Better UX**: Immediate question playback
4. **🎯 Focused Chat**: Chat route only handles user interactions
5. **🛠️ Easier Debug**: Clear separation of concerns

## 🎵 **Audio Requirements**

- **Format**: Base64 encoded audio (WAV/MP3)
- **Quality**: Clear speech for interview context
- **Duration**: Metadata should include audio duration
- **Lipsync**: Rhubarb-generated viseme timing
- **Expressions**: Default/smile/concerned based on content

This approach gives you exactly what you requested: questions with pre-generated audio, sequential flow, and only user responses going through the chat route! 🎉

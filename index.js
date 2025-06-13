require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { fetch } = require('undici');

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post("/generate", async (req, res) => {
  const { userText } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: userText }
            ]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      res.json({ result: data.candidates[0].content.parts[0].text });
    } else {
      throw new Error("응답이 없습니다.");
    }

  } catch (err) {
    console.error("Gemini API 오류:", err);
    res.status(500).json({ error: "Gemini 호출 실패" });
  }
});

app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});

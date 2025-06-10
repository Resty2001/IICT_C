require("dotenv").config();
const express = require("express");
const cors =require("cors");
const { fetch } = require('undici');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());

// JSON 요청 본문을 파싱하고, 용량 제한을 넉넉하게 설정합니다.
// 이 설정은 한 번만 해주면 됩니다.
app.use(express.json({ limit: '50mb' }));

// 'public' 폴더의 파일들을 외부에서 접근 가능하게 합니다.
app.use(express.static('public'));

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 1. 텍스트 생성을 위한 API
app.post("/generate", async (req, res) => {
  const { userText } = req.body;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
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
        console.error("Gemini 응답에 'candidates'가 없습니다:", data);
        throw new Error("응답이 없습니다.");
    }

  } catch (err) {
    console.error("Gemini API 오류:", err);
    res.status(500).json({ error: "Gemini 호출 실패" });
  }
});


// 2. 이미지 저장을 위한 API
// [수정] /generate 라우터와 같은 레벨로 분리했습니다.
app.post("/save-image", (req, res) => {
    const { imageData } = req.body;
    if (!imageData) {
        return res.status(400).json({ error: "이미지 데이터가 없습니다." });
    }

    try {
        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        const filename = `constellation_${Date.now()}.png`;
        const filePath = path.join(publicDir, filename);

        fs.writeFileSync(filePath, base64Data, 'base64');

        const imageUrl = `http://localhost:3000/${filename}`;
        
        console.log(`이미지 저장 성공: ${imageUrl}`);
        res.json({ imageUrl });

    } catch (err) {
        console.error("이미지 저장 오류:", err);
        res.status(500).json({ error: "이미지 저장에 실패했습니다." });
    }
});


// 서버 실행
app.listen(3000, () => {
  console.log("서버 실행 중: http://localhost:3000");
});
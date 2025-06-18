require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ⭐ 추가: 파일 시스템(fs) 및 경로(path) 모듈
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// ⭐ 수정: 이미지 데이터(Base64)가 매우 크므로, 요청 크기 제한을 넉넉하게 늘려줍니다.
app.use(express.json({ limit: '50mb' }));

// ⭐ 추가: 'public' 폴더를 정적 파일 제공 폴더로 설정합니다.
// 이렇게 하면 'http://localhost:3000/cards/이미지이름.png' 같은 URL로 브라우저에서 직접 접근할 수 있습니다.
app.use(express.static('public'));

// 'public/cards' 폴더가 없으면 생성하는 로직
const cardsDir = path.join(__dirname, 'public', 'cards');
if (!fs.existsSync(cardsDir)) {
    fs.mkdirSync(cardsDir, { recursive: true });
}

// --- Gemini API 설정 (기존 코드) ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("환경 변수 GEMINI_API_KEY가 설정되지 않았습니다.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- Gemini 텍스트 생성 엔드포인트 (기존 코드) ---
app.post("/generate", async (req, res) => {
    const { userText } = req.body;
    try {
        // gemini-1.5-flash 모델이 안정적입니다.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(userText);
        const response = await result.response;
        const text = response.text();

        if (text) {
            res.json({ result: text });
        } else {
            throw new Error("Gemini API에서 빈 응답을 받았습니다.");
        }
    } catch (err) {
        console.error("Gemini API 오류:", err.message || err);
        res.status(500).json({ error: "Gemini 호출 실패", details: err.message || err.toString() });
    }
});

// ⭐ --- 새로 추가된 이미지 저장 엔드포인트 --- ⭐
app.post('/save-image', (req, res) => {
    try {
        const { imageData } = req.body;
        if (!imageData) {
            return res.status(400).json({ error: '이미지 데이터가 없습니다.' });
        }

        const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
        const fileName = `constellation-${Date.now()}-${Math.floor(Math.random() * 1000)}.png`;
        const filePath = path.join(cardsDir, fileName);

        fs.writeFile(filePath, base64Data, 'base64', (err) => {
            if (err) {
                console.error("파일 저장 실패:", err);
                return res.status(500).json({ error: '파일 저장에 실패했습니다.' });
            }

            const imageUrl = `http://192.168.0.113:3000/cards/${fileName}`; // 테스트 시 본인 IP 주소 넣기.
            console.log("파일 저장 성공:", imageUrl);
            res.status(200).json({ imageUrl });
        });
    } catch (error) {
        console.error("이미지 저장 중 오류:", error);
        res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
    }
});

// --- 서버 실행 (기존 코드) ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Loaded" : "Not Loaded");
});
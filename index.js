require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const { fetch } = require('undici'); // Undici는 이제 필요 없습니다.

// Gemini 라이브러리 import
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Gemini API 초기화
// GEMINI_API_KEY가 없는 경우를 대비한 방어 코드 추가
if (!GEMINI_API_KEY) {
    console.error("환경 변수 GEMINI_API_KEY가 설정되지 않았습니다.");
    process.exit(1); // 서버 시작을 중단
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
    const { userText } = req.body;

    try {
        // 사용할 모델 지정 (gemini-pro 또는 gemini-1.5-flash 등)
        // 만약 프리뷰 모델을 사용하려면, 해당 모델이 현재 API 키와 엔드포인트에서 사용 가능한지 확인해야 합니다.
        // gemini-pro가 가장 일반적이고 안정적입니다.
        // 'gemini-1.5-flash' 또는 'gemini-1.5-pro'는 아직 프리뷰 단계이므로 사용 가능한지 확인해야 합니다.
        // 현재 에러 메시지에서 'gemini-pro'를 찾지 못했다고 했으므로,
        // 가장 안정적인 모델 중 하나인 'gemini-1.5-flash'를 사용해보고,
        // 그래도 안되면 'gemini-pro'로 다시 시도해보는 것이 좋습니다.
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // 또는 "gemini-pro"

        const result = await model.generateContent(userText);
        const response = await result.response;
        const text = response.text(); // 응답 텍스트를 바로 가져옴

        if (text) {
            res.json({ result: text });
        } else {
            // 이 throw는 이제 generateContent 호출 자체에서 에러가 발생하면 catch 블록으로 갈 것이므로
            // 실제 응답 텍스트가 비어있는 경우에 대비하여 추가
            throw new Error("Gemini API에서 빈 응답을 받았습니다.");
        }

    } catch (err) {
        // Gemini API 라이브러리가 던지는 오류는 좀 더 상세합니다.
        console.error("Gemini API 오류:", err.message || err); // 에러 메시지를 더 자세히 출력
        // 클라이언트에게 500 에러와 함께 상세 메시지를 전달 (개발 단계에서 디버깅 용이)
        res.status(500).json({ error: "Gemini 호출 실패", details: err.message || err.toString() });
    }
});

app.listen(3000, () => {
    console.log("서버 실행 중: http://localhost:3000");
    console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Loaded" : "Not Loaded"); // API 키 로드 여부 확인
});
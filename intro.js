// --- 상수 정의 ---
const CANVAS_WIDTH = 1920; // 캔버스 너비
const CANVAS_HEIGHT = 1080; // 캔버스 높이
const TRANSITION_DURATION = 3000; // 화면 전환 효과 시간 (밀리초)
const CONSTELLATION_MOVE_SPEED_X = 0.1; // 별자리/별 가로 이동 속도
const CONSTELLATION_MOVE_SPEED_Y = 0.03; // 별자리/별 세로 이동 속도
const NUM_GENERAL_STARS = 250; // 일반 별 개수
const TYPING_SPEED = 50; // 대화 타이핑 속도 (밀리초)
const ARROW_FADE_SPEED = 10; // 대화창 화살표 나타나는 속도
const KEEPER_FADE_IN_SPEED = 7; // 공방지기 나타나는 속도

// --- 전역 변수 선언 ---
// 이미지 에셋
let mainBackground, subBackground, workshopImg, workshopInsideImg, keeperImg;
// UI 요소 위치/크기 정보
let workshopRect, dialogueBoxRect, arrowRect, keeperRect;

// 게임 상태 관리
let gameState = 'MAIN_MENU'; // 현재 게임 상태 (MAIN_MENU, TRANSITION_TO_INTRO, INTRO)
let dialogueIndex = 0;       // 현재 대화 순서

// 대화 내용 배열
const dialogues = [
    { speaker: "공방지기", text: "어서 오세요. 당신을 기다리고 있었습니다. 많이 놀라셨을 테지요?" },
    { speaker: "나", text: "..." },
    { speaker: "공방지기", text: "당신은 삶의 긴 여정을 마치고 이곳, 영혼들이 머무는 사후세계에 도착했습니다." },
    { speaker: "나", text: "아... 그렇군요... 그럼 여기는... 대체 뭐하는 곳이죠?" },
    { speaker: "공방지기", text: "이곳은 '별자리 공방', 이 공방은 아무에게나 모습을 드러내지 않습니다." },
    { speaker: "공방지기", text: "당신을 그리워하는 이들의 간절한 마음이 모여 비로소 이곳의 불을 밝히지요." },
    { speaker: "공방지기", text: "당신이 여기 있다는 건, 그만큼 당신이 빛나는 존재였다는 뜻입니다." },
    { speaker: "나", text: "제가... 빛나는 존재였다고요? ...그럼 이 공방에서는 무엇을 하나요?" },
    { speaker: "공방지기", text: "이곳에서는 당신의 소중한 삶의 조각들을 모아, 밤하늘에 영원히 빛날 이야기를 만든답니다." },
    { speaker: "공방지기", text: "바로 별자리를 통해서요." },
    { speaker: "나", text: "그렇군요... 저도 별자리가 될 수 있는 건가요?" },
    { speaker: "공방지기", text: "네, 그렇습니다. 당신의 삶에는 분명 밤하늘을 수놓을 아름다운 빛이 있었을 겁니다." },
    { speaker: "공방지기", text: "제가 그 빛들을 모아, 당신만의 영원한 별자리를 만들어 드릴게요." },
    { speaker: "시스템", text: "인트로 종료. (클릭하여 메인으로)" }
];

// 전환 애니메이션 관련 변수
let transitionStartTime = 0; // 전환 시작 시간
let targetScale = 10.0;      // 공방 이미지 확대 배율

// 하늘 요소 (별, 별자리) 관련 변수
let constellations = []; // 별자리 데이터 배열
let generalStars = [];   // 일반 별 데이터 배열
let skyOffsetX = 0;      // 하늘 요소 전체 가로 이동 오프셋
let skyOffsetY = 0;      // 하늘 요소 전체 세로 이동 오프셋

// 대화 시스템 관련 변수
let currentCharIndex = 0; // 현재 타이핑된 글자 인덱스
let isTyping = false;     // 현재 타이핑 중인지 여부
let lastCharTime = 0;     // 마지막 글자 타이핑된 시간
let arrowAlpha = 0;       // 대화창 화살표 투명도

// 공방지기 등장 관련 변수
let keeperAlpha = 0;      // 공방지기 이미지 투명도 (페이드 인 효과용)


// --- p5.js 핵심 함수 ---

// preload(): 프로그램 시작 전 이미지 등 에셋 미리 로드
function preload() {
    mainBackground = loadImage('assets/Nightsky_Blank(2).png');
    subBackground = loadImage('assets/subBackground.png');
    workshopImg = loadImage('assets/workshop.png');``
    workshopInsideImg = loadImage('assets/workshopBackground (1).png');
    keeperImg = loadImage('assets/keeperBlank(3).png');
}

// setup(): 프로그램 시작 시 한 번만 실행되는 초기 설정 함수
function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT); // 캔버스 생성
    imageMode(CENTER); // 이미지 그리기 기준을 중앙으로 설정
    textAlign(LEFT, TOP); // 텍스트 정렬 기준 설정
    textFont('Malgun Gothic, Apple SD Gothic Neo, sans-serif'); // 기본 한글 폰트 설정

    setupUIElements();        // UI 요소들(공방, 공방지기, 대화창 위치/크기) 설정
    generateConstellations(); // 별자리 데이터 생성
    generateGeneralStars();   // 일반 별 데이터 생성
}

// draw(): 매 프레임 반복 실행되는 메인 그리기 함수
function draw() {
    background(0); // 매번 검은색으로 배경 초기화

    // 현재 게임 상태(gameState)에 따라 다른 함수 호출
    switch (gameState) {
        case 'MAIN_MENU':
            updateSkyMovement(); // 하늘 요소(별, 별자리) 위치 업데이트
            drawMainMenu();      // 메인 메뉴 화면 그리기
            break;
        case 'TRANSITION_TO_INTRO':
            drawTransition();    // 메인 메뉴 -> 인트로 전환 효과 그리기
            break;
        case 'INTRO':
            drawIntroScene();    // 인트로 장면(공방 내부, 공방지기, 대화) 그리기
            break;
    }
}

// mousePressed(): 마우스 클릭 시 호출되는 함수
function mousePressed() {
    if (gameState === 'MAIN_MENU') {
        // 메인 메뉴에서 공방 클릭 시 인트로로 전환
        if (isMouseOver(workshopRect)) {
            gameState = 'TRANSITION_TO_INTRO';
            transitionStartTime = millis(); // 전환 시작 시간 기록
        }
    } else if (gameState === 'INTRO') {
        // 인트로에서 대화창 클릭 시 로직 처리
        if (isMouseOver(dialogueBoxRect)) {
            if (isTyping) { // 타이핑 중이면
                currentCharIndex = dialogues[dialogueIndex].text.length; // 즉시 텍스트 완료
                isTyping = false;
            } else { // 타이핑 완료 후면
                dialogueIndex++; // 다음 대화로
                if (dialogueIndex >= dialogues.length) { // 모든 대화 종료 시
                    gameState = 'MAIN_MENU'; // 메인 메뉴로
                    dialogueIndex = 0;       // 대화 인덱스 초기화
                } else { // 다음 대화 준비
                    currentCharIndex = 0;
                    isTyping = true;
                    arrowAlpha = 0;
                    lastCharTime = millis();
                }
            }
        }
    }
}

// --- 설정 함수 ---

// setupUIElements(): 화면 요소들의 초기 위치와 크기 설정
function setupUIElements() {
    // 공방(workshopImg)의 화면 내 위치(cx, cy) 및 크기(w, h), 클릭 영역(x, y) 설정
    let workshopW = 570; let workshopH = 510;
    let workshopCX = width / 2; let workshopCY = 840;
    workshopRect = { cx: workshopCX, cy: workshopCY, w: workshopW, h: workshopH, x: workshopCX - workshopW / 2, y: workshopCY - workshopH / 2 };

    // 공방지기(keeperImg)의 화면 내 위치 및 크기 설정
    let keeperW = 600; let keeperH = 900;
    keeperRect = { x: width / 2, y: height / 2 + 150, w: keeperW, h: keeperH };

    // 대화창(dialogueBox)의 화면 내 위치 및 크기 설정
    dialogueBoxRect = { x: 50, y: height - 330, w: width - 100, h: 300 };
    // 대화창 다음 화살표(arrow)의 화면 내 위치 및 크기 설정
    arrowRect = { x: dialogueBoxRect.x + dialogueBoxRect.w - 80, y: dialogueBoxRect.y + dialogueBoxRect.h - 80, w: 40, h: 40 };
}

// generateConstellations(): 별자리들의 초기 데이터(별 위치, 연결선) 생성
function generateConstellations() {
    constellations = [ // 각 별자리는 { stars: [[x,y], ...], connections: [[idx1, idx2], ...] } 형태
        { stars: [[200, 150], [300, 180], [400, 160], [500, 200], [480, 280], [400, 300], [350, 250]], connections: [[0, 1], [1, 2], [2, 3], [3, 4], [3, 6], [5, 6]] },
        { stars: [[1600, 100], [1650, 150], [1700, 130], [1750, 160], [1800, 140]], connections: [[0, 1], [1, 2], [2, 3], [3, 4]] },
        { stars: [[1000, 400], [1050, 450], [1100, 400], [1050, 550], [1000, 600], [1100, 600]], connections: [[0, 1], [1, 2], [1, 3], [3, 4], [3, 5]] },
        { stars: [[100, 400], [150, 450], [120, 500]], connections: [[0, 1], [1, 2], [2, 0]] },
        { stars: [[600, 50], [700, 100], [800, 150], [700, 50], [700, 150]], connections: [[0, 1], [1, 2], [3, 4]] },
        { stars: [[1200, 50], [1250, 150], [1300, 250], [1350, 350]], connections: [[0, 1], [1, 2], [2, 3]] },
        { stars: [[1500, 500], [1550, 530], [1600, 510], [1620, 560], [1580, 590]], connections: [[0, 1], [1, 2], [2, 3], [3, 4]] },
        { stars: [[500, 600], [550, 650], [600, 630], [650, 680]], connections: [[0, 1], [1, 2], [2, 3]] },
        { stars: [[50, 650], [100, 650], [100, 700], [50, 700]], connections: [[0, 1], [1, 2], [2, 3], [3, 0]] },
        { stars: [[1700, 300], [1750, 350], [1700, 400], [1800, 310], [1850, 360], [1800, 410]], connections: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4]] },
        { stars: [[800, 600], [830, 650], [890, 640], [850, 700]], connections: [[0, 1], [1, 2], [0, 2], [1, 3]] },
    ];
}

// generateGeneralStars(): 일반 별들의 초기 데이터(무작위 위치, 크기, 밝기) 생성
function generateGeneralStars() {
    generalStars = [];
    for (let i = 0; i < NUM_GENERAL_STARS; i++) {
        generalStars.push({ x: random(0, width), y: random(0, height), size: random(1, 3.5), alpha: random(80, 200) });
    }
}

// --- 업데이트 함수 ---

// updateSkyMovement(): 하늘 요소(별, 별자리)의 위치를 매 프레임 업데이트 (이동 효과)
function updateSkyMovement() {
    skyOffsetX += CONSTELLATION_MOVE_SPEED_X;
    skyOffsetY += CONSTELLATION_MOVE_SPEED_Y;
    // 화면 밖으로 벗어나면 반대편에서 나타나도록 좌표 조정 (루핑 효과)
    skyOffsetX = (skyOffsetX % width + width) % width;
    skyOffsetY = (skyOffsetY % height + height) % height;
}

// --- 그리기 함수 ---

// drawMainMenu(): 메인 메뉴 화면 구성요소 그리기
function drawMainMenu() {
    image(mainBackground, width / 2, height / 2, width, height); // 밤하늘 배경
    drawMovingSkyElements(); // 움직이는 별/별자리 그리기
    image(subBackground, width / 2, height / 2, width, height);  // 지상 배경(나무 등)
    drawWorkshopGlow();      // 공방 주변 빛 효과
    image(workshopImg, workshopRect.cx, workshopRect.cy, workshopRect.w, workshopRect.h); // 공방 이미지
}

// drawMovingSkyElements(): 움직이는 하늘 요소(일반 별, 별자리)를 타일 형태로 그려 끊김 없는 효과 연출
function drawMovingSkyElements() {
    push(); // 현재 그리기 설정(좌표계 등) 저장
    translate(skyOffsetX, skyOffsetY); // 전체 하늘 이동 적용
    // 3x3 격자로 그려 화면 가장자리에서 자연스럽게 이어지도록 함
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            push();
            translate(i * width, j * height); // 각 격자 위치로 이동
            drawGeneralStarsSet();  // 일반 별들 그리기
            drawConstellationSet(); // 별자리들 그리기
            pop();
        }
    }
    pop(); // 초기 그리기 설정 복원
}

// drawGeneralStarsSet(): 일반 별들을 그림
function drawGeneralStarsSet() {
    noStroke(); // 테두리 없이
    for (let star of generalStars) {
        fill(255, 255, 255, star.alpha); // 흰색, 무작위 밝기
        ellipse(star.x, star.y, star.size, star.size); // 무작위 크기
    }
}

// drawConstellationSet(): 별자리들을 그림 (별, 연결선, 빛 효과)
function drawConstellationSet() {
    for (let constellation of constellations) {
        // 별 연결선
        stroke(180, 210, 255, 100); strokeWeight(1);
        for (let connection of constellation.connections) {
            let start = constellation.stars[connection[0]];
            let end = constellation.stars[connection[1]];
            line(start[0], start[1], end[0], end[1]);
        }
        // 별 자체와 빛
        noStroke();
        for (let star of constellation.stars) {
            fill(210, 225, 255, 220); ellipse(star[0], star[1], 4, 4); // 중심 별
            fill(180, 210, 255, 40); ellipse(star[0], star[1], 10, 10); // 주변 빛
        }
    }
}

// drawWorkshopGlow(): 공방 주변에 마우스 거리에 따라 빛 효과 그리기
function drawWorkshopGlow() {
    let cx = workshopRect.cx; let cy = workshopRect.cy; let baseW = workshopRect.w;
    let d = dist(mouseX, mouseY, cx, cy); // 마우스와 공방 중심 사이 거리
    // 거리에 따라 빛의 밝기(alpha)와 크기(glowSizeFactor) 계산
    let maxDist = 350; let maxAlpha = 30; let minAlpha = 0;
    let glowAlpha = map(d, 0, maxDist, maxAlpha, minAlpha);
    glowAlpha = constrain(glowAlpha, minAlpha, maxAlpha);
    if (glowAlpha > 0) { // 빛이 있을 때만 그림
        let maxGlowSizeFactor = 1.3; let minGlowSizeFactor = 1.0;
        let glowSizeFactor = map(d, 0, maxDist, maxGlowSizeFactor, minGlowSizeFactor);
        glowSizeFactor = constrain(glowSizeFactor, minGlowSizeFactor, maxGlowSizeFactor);
        let glowSize = baseW * glowSizeFactor;
        let layers = 6; noStroke(); // 여러 겹으로 부드럽게
        for (let i = layers; i > 0; i--) {
            let layerRatio = i / layers;
            let currentAlpha = glowAlpha * pow(layerRatio, 3); // 안쪽이 더 밝고 바깥쪽은 투명하게
            let currentSize = lerp(baseW * 0.8, glowSize, layerRatio); // 크기 변화
            fill(255, 255, 220, currentAlpha); ellipse(cx, cy, currentSize, currentSize);
        }
    }
}

// drawTransition(): 메인 메뉴에서 인트로로 넘어가는 화면 전환 효과 그리기
function drawTransition() {
    let elapsedTime = millis() - transitionStartTime; // 전환 시작 후 경과 시간
    let progress = constrain(elapsedTime / TRANSITION_DURATION, 0, 1); // 진행도 (0~1)
    let easedProgress = 1 - pow(1 - progress, 3); // 부드러운 움직임을 위한 이징(easing)

    // workshopImg는 사라지고(alphaOut), workshopInsideImg는 나타남(alphaIn)
    let alphaOut = lerp(255, 0, easedProgress);
    let alphaIn = lerp(0, 255, easedProgress);
    let currentScale = lerp(1, targetScale, easedProgress); // workshopImg 확대 배율
    let workshopCenterX = workshopRect.cx;
    let workshopCenterY = workshopRect.cy;

    // 1. 고정 배경 그리기
    image(mainBackground, width / 2, height / 2, width, height);
    image(subBackground, width / 2, height / 2, width, height);

    // 2. 확대되며 사라지는 공방 외부(workshopImg) 그리기
    push();
    translate(workshopCenterX, workshopCenterY); // 공방 원래 중심으로 이동
    scale(currentScale);                       // 확대
    tint(255, alphaOut);                       // 투명도 적용 (점점 사라짐)
    image(workshopImg, 0, 0, workshopRect.w, workshopRect.h); // (0,0)에 그림
    noTint();                                  // 다른 이미지에 영향 없도록 tint 해제
    pop();

    // 3. 나타나는 공방 내부(workshopInsideImg) 그리기
    tint(255, alphaIn);
    image(workshopInsideImg, width / 2, height / 2, width, height);
    noTint();

    // 전환 완료 시 INTRO 상태로 변경 및 관련 변수 초기화
    if (progress >= 1) {
        gameState = 'INTRO';
        dialogueIndex = 0;
        currentCharIndex = 0;
        isTyping = true; // 인트로 시작 시 바로 타이핑 시작
        arrowAlpha = 0;
        lastCharTime = millis();
        keeperAlpha = 0; // 공방지기 페이드 인 시작
    }
}

// drawIntroScene(): 인트로 장면(공방 내부, 공방지기, 대화창) 그리기
function drawIntroScene() {
    image(workshopInsideImg, width / 2, height / 2, width, height); // 공방 내부 배경

    // 공방지기 페이드 인 효과
    if (keeperAlpha < 255) {
        keeperAlpha = min(255, keeperAlpha + KEEPER_FADE_IN_SPEED);
    }
    tint(255, keeperAlpha); // 투명도 적용
    image(keeperImg, keeperRect.x, keeperRect.y, keeperRect.w, keeperRect.h); // 공방지기
    noTint();

    drawDialogueBox(); // 대화창 그리기 (타이핑 시작)
}

// drawDialogueBox(): 대화창과 대화 내용(타이핑 효과, 화살표) 그리기
function drawDialogueBox() {
    let d = dialogueBoxRect; // 대화창 영역
    fill(0, 0, 0, 180); stroke(255); strokeWeight(3); // 검은 반투명 배경, 흰 테두리
    rect(d.x, d.y, d.w, d.h, 15); // 모서리 둥근 사각형

    if (dialogueIndex < dialogues.length) { // 현재 대화가 있으면
        let currentDialogue = dialogues[dialogueIndex];
        let fullText = currentDialogue.text;

        // 타이핑 효과 처리
        if (isTyping && millis() - lastCharTime > TYPING_SPEED) {
            currentCharIndex++;
            lastCharTime = millis();
            if (currentCharIndex >= fullText.length) {
                currentCharIndex = fullText.length;
                isTyping = false; // 타이핑 완료
            }
        }
        let textToShow = fullText.substring(0, currentCharIndex); // 현재까지 타이핑된 텍스트

        // 화자 이름 표시
        fill(255, 215, 0); textSize(40); textAlign(LEFT, TOP); noStroke();
        text(currentDialogue.speaker + ":", d.x + 40, d.y + 40);
        // 대화 내용 표시
        fill(255); textSize(36);
        text(textToShow, d.x + 40, d.y + 100, d.w - 80, d.h - 140); // 자동 줄바꿈 지원

        // 화살표 페이드 인 효과
        if (!isTyping) { // 타이핑이 끝나면
            arrowAlpha = min(255, arrowAlpha + ARROW_FADE_SPEED); // 화살표 서서히 나타남
        } else {
            arrowAlpha = 0; // 타이핑 중에는 숨김
        }
        if (arrowAlpha > 0) { // 화살표가 보일 때만 그림
            fill(255, arrowAlpha); noStroke(); // 투명도 적용
            let ar = arrowRect; // 화살표 영역
            triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h); // 삼각형 그리기
        }
    }
}

// --- 유틸리티 함수 ---

// isMouseOver(): 마우스가 특정 사각 영역 위에 있는지 확인
function isMouseOver(rectObj) {
    return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w &&
            mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h);
}
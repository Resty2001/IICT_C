const starNames = ["조각가자리", "직조가자리","대장장이자리","음유시인자리","연금술사자리","정원사자리","건축가자리","항해사자리","치유사자리","서기관자리","몽상가자리","수호자자리"]
const keeperDialogue = ["당신에게 어울리는 별자리를 소개해줄게요.",
    "좋아! 이제 별을 연결하러 가시죠!",
    "....................",
    "이런... 선을 이을 에너지가 부족하구만...\n도움이 필요합니다.\n당신이 선택한 카드 중에서 가장 소중한 가치를 선택해주세요",
    "이럴수가.. 카드가 당신과 공명하고 있습니다!!\n방금 생성된 별을 마음껏 움직여 별자리를 완성해주세요",
    "아... 참! 별 사이가 너무 가까우면 위험하니 조심하세요",
    "정말 아름다운 별자리구만... 내 생에 걸작입니다."
]
const minDist = 50;

class Connecting{
    // ⭐ constructor 설정 수정: onConstellationCompleteCallback 추가 ⭐
    constructor(selectedCard, nameResult, storyResult, keeperImages, textBoxImage, updateSceneNumberCallback, onConstellationCompleteCallback, starImages){
        this.selectedCard = selectedCard;
        this.nameResult = nameResult;
        this.storyResult = storyResult;
        this.textBoxImage = textBoxImage;
        this.updateSceneNumber = updateSceneNumberCallback; // 씬 넘버 업데이트 콜백
        this.onConstellationComplete = onConstellationCompleteCallback; // 별자리 완성 시 이미지/URL 전달 콜백 ⭐ 추가 ⭐
        this.cardWidth = windowWidth / 11;
        this.cardHeight = windowHeight / 4;
        this.extraStarPositions = [];
        this.interval = 3;
        this.starImage = null;
        this.starColor = 255;
        this.starNickname = "";
        this.myStar = null;
        this.myStarURL = ""; // ⭐ 추가: Base64 URL 저장 변수 ⭐
        this.starPositions = [];
        this.cardsFullyVisible = false;
        this.cardAlpha = 0;
        this.keeperAlpha = 0;
        this.keeperIndex = 0;
        this.index = 0;
        this.keeperText = "";
        this.keeperState = "showing";
        this.keeperImages = keeperImages;
        this.keeperFadeInSpeed = 2;
        this.draggingStar = null;
        this.initialStarPosition = { x: 0, y: 0 }; // 드래그 시작 시 별의 초기 위치 저장
        this.starImages = starImages;
        this.storyText = "";
        this.storyIndex = "";

        this.isCardSelected = false;
        this.favoriteCard = [];
        
        for (let i = 0; i<this.selectedCard.length; i++)
            this.starPositions.push({
                x: this.selectedCard[i].star.x,
                y: this.selectedCard[i].star.y,
                alpha: 0,
                sparkleTimer: 0,
            });
    }

    update(){
        for (let i = 0; i < this.starPositions.length; i++) {
            this.starPositions[i].alpha = min(255, this.starPositions[i].alpha + 2);
        }
    }
    set(nameResult,storyResult,selectedCard){
        this.nameResult = nameResult;
        this.storyResult = storyResult;
        this.selectedCard = selectedCard;
        for (let i = 0; i<starNames.length; i++){
            if(nameResult == starNames[i]){
                this.starImage = this.starImages[i];
            }
        }
}

    show() {
        // console.log(this.index); // 디버깅 용도, 필요 없으면 제거하세요.
        // console.log(this.keeperState); // 디버깅 용도, 필요 없으면 제거하세요.

        // 카드 그리기 (Index 3에서만 활성화)
        this.cardRects = [];
        if (this.index == 3) {
            if (!this.cardsFullyVisible && this.cardAlpha < 255) {
                this.cardAlpha += 10;
            }
            if (this.cardAlpha >= 255) {
                this.cardsFullyVisible = true;
            }
            for (let i = 0; i < this.selectedCard.length; i++) {
                let x = windowWidth / 30 + (windowWidth / 7) * (i%3);
                let y = windowHeight - this.cardHeight - windowHeight/10;
                let w = this.cardWidth;
                let h = this.cardHeight;
                if (i > 2) { // 카드가 3개 이상일 때 두 번째 줄로 이동
                    y = y - this.cardHeight - windowHeight / 10;
                }
                this.cardRects.push({ x, y, w, h, index: i });
                
                push();
                    translate(x + w / 2, y + h / 2);
    scale(1);
                let card = this.selectedCard[i];
                tint(255, this.cardAlpha);
                this.drawCardFront(0, 0, w, h, card.image, card.text, this.cardAlpha);
                pop();
            }
        }

        // Index 1 이상일 때 별자리 관련 요소 표시
        if (this.index >= 1) {
            this.displayStory();
            push();
            imageMode(CENTER);
            tint(255, 200);
            image(this.starImage, windowWidth * 3 / 4, windowHeight / 2, windowWidth * 13 / 30, windowHeight * 3 / 4);
            pop();

            // 기본 별들 위치 시각화
            for (let i = 0; i < this.starPositions.length; i++) {
                let s = this.starPositions[i];
                push();
                noStroke();
                fill(this.starColor, s.alpha);
                ellipse(s.x, s.y, 15);
                pop();
            }
            // 별자리 선 그리기
            this.drawLines();

            this.displayStarName();

            // 추가된 별 시각화 (카드를 선택했을 때)
            if (this.isCardSelected === true) {
                for (let i = 0; i < this.extraStarPositions.length; i++) {
                    fill(this.starColor);
                    ellipse(this.extraStarPositions[i].x, this.extraStarPositions[i].y, 30);
                }
            }

            // Index 1에서 키퍼 대화 상태 전환
            if (this.index === 1 && this.starPositions.every(s => s.alpha >= 255)) {
                this.keeperState = "showing";
            }
        }

        // "별자리 완성" 버튼 (Index 5에서만 등장)
        if (this.index === 5) {
            push();
            fill(255, 180);
            stroke(255);
            rectMode(CENTER); // 버튼을 중앙 정렬로 그리기 위해 추가
            rect(windowWidth * 5 / 6, windowHeight * 12 / 13, 160, 100, 10);
            fill(0);
            textAlign(CENTER, CENTER);
            noStroke();
            textSize(20);
            text("별자리 완성", windowWidth * 5/ 6, windowHeight * 12 / 13);
            pop();
        }

        // 키퍼 상호작용
        if (this.keeperState != "done") {
            if (this.keeperState === "showing") {
                this.keeperAlpha = min(255, this.keeperAlpha + this.keeperFadeInSpeed);
                if (this.keeperAlpha === 255 && this.keeperText === keeperDialogue[this.index]) {
                    this.keeperState = "waiting";
                }
            }
            this.keeperInteraction();
        }
    }

    handleMousePressed() {
        // 👉 1. keeper 안내 문구 클릭 시 다음으로 넘어감
        if (this.keeperState === "waiting") {
            // Index 3, 5는 카드 선택, 별자리 완성 버튼 클릭 등으로 인해 index가 증가해야 하므로 여기서 처리하지 않습니다.
            if (this.index === 0 || this.index === 1 || this.index === 2 || this.index === 4) {
                this.keeperState = "showing";
                this.index++;
            }
            else{
                this.keeperState = "done";
                if (this.index === 6){
                    if (this.updateSceneNumber) { // 콜백 함수가 존재하는지 확인
                        console.log(this.selectedCard.length);
                this.updateSceneNumber(); // 외부 sceneNumber 증가 함수 호출
            }
                }
            }
            this.keeperText = "";
            this.keeperIndex = 0;
            this.keeperAlpha = 0;
            return; // keeper가 진행 중이므로 다른 로직은 막음
        }
        if(this.keeperState == "done"){
            // 👉 2. 카드 선택 (index 3에서 보여지고 선택 가능)
        if (this.index === 3 && !this.isCardSelected && this.cardRects) {
            for (let i = 0; i < this.cardRects.length; i++) {
                const rect = this.cardRects[i];
                // rectMode(CENTER)로 카드를 그렸으므로 클릭 영역도 맞춰줍니다.
                if (
                    mouseX >= rect.x + rect.w/2 - this.cardWidth/2 &&
                    mouseX <= rect.x + rect.w/2 + this.cardWidth/2 &&
                    mouseY >= rect.y + rect.h/2 - this.cardHeight/2 &&
                    mouseY <= rect.y + rect.h/2 + this.cardHeight/2
                ) {
                    this.favoriteCard.push(this.selectedCard[rect.index]);
                    this.isCardSelected = true;

                    this.changeStarColor();
                    let newStar;
                    let maxTries = 100;
                    for(let i = 0; i<4; i++){
                    for (let tries = 0; tries < maxTries; tries++) {
                        let tempStar = {
                            x: random((windowWidth * 9) / 17, (windowWidth * 29) / 30),
                            y: random(windowHeight / 8, (windowHeight * 7) / 8),
                        };

                        let tooCloseToMain = this.starPositions.some(
                            (s) => dist(s.x, s.y, tempStar.x, tempStar.y) < minDist
                        );

                        let tooCloseToExtra = this.extraStarPositions.some(
                            (s) => dist(s.x, s.y, tempStar.x, tempStar.y) < minDist
                        );

                        if (!tooCloseToMain && !tooCloseToExtra) {
                            newStar = tempStar;
                            this.extraStarPositions.push(newStar);
                            break;
                        }
                    }
                    }
                    this.index++; // 카드 선택 후 다음 단계로 이동
                    this.keeperState = "showing";
                    break;
                }
            }
        }
        }
        
        // 👉 3. "별자리 완성" 버튼 클릭 (mouseReleased에서 처리)
        // 이 로직은 `mouseReleased`에서 처리하는 것이 더 일반적이지만,
        // 사용자 클릭 패턴에 따라 `mousePressed`에서 한 번만 처리하는 것도 가능합니다.
        // 현재는 `mouseReleased`에 있으므로 여기서는 제거합니다.
        // 대신 `mouseReleased`에서 버튼 클릭 로직을 처리하겠습니다.
    }

    // ⭐ mouseDragged() 함수 수정: 드래그 중인 별 위치 실시간 업데이트 ⭐
    mouseDragged() {
        if (this.index === 5 && this.isCardSelected) { // Index 5에서만 드래그 가능
            if (this.draggingStar !== null) { // 이미 드래그 중인 별이 있다면
                this.extraStarPositions[this.draggingStar].x = mouseX;
                this.extraStarPositions[this.draggingStar].y = mouseY;
            } else { // 새로운 별을 드래그 시작할 때
                for (let i = 0; i < this.extraStarPositions.length; i++) {
                    let s = this.extraStarPositions[i];
                    // 별의 크기가 30px이므로 반지름 15px. 클릭 영역을 좀 더 넓게 줍니다.
                    if (dist(mouseX, mouseY, s.x, s.y) < 20) { // 20px 반경 내 클릭 시 드래그 시작
                        this.draggingStar = i;
                        // 드래그 시작 시 초기 위치 저장
                        this.initialStarPosition = { x: s.x, y: s.y };
                        break;
                    }
                }
            }
        }
    }

    // ⭐ mouseReleased() 함수 수정: 유효성 검사 및 위치 복귀 로직 및 캡처 로직 ⭐
    mouseReleased() {
        if (this.index === 5) { // Index 5에서만 작동
            if (this.draggingStar != null) {
                let dragged = this.extraStarPositions[this.draggingStar];
                let isValidPosition = true;

                // 1. 별자리 영역 내에 있는지 검사
                let withinX = dragged.x >= (windowWidth * 9) / 17 && dragged.x <= (windowWidth * 29) / 30;
                let withinY = dragged.y >= windowHeight / 8 && dragged.y <= (windowHeight * 7) / 8;
                if (!withinX || !withinY) {
                    isValidPosition = false;
                }

                // 2. 다른 별들과 minDist 이상 떨어져 있는지 검사
                if (isValidPosition) { // 이미 경계 내에 있을 경우에만 다른 별과의 거리 검사
                    const allStars = [...this.starPositions]; // 기존 별들
                    for (let i = 0; i < this.extraStarPositions.length; i++) {
                        if (i !== this.draggingStar) { // 현재 드래그 중인 별 자신은 제외
                            allStars.push(this.extraStarPositions[i]);
                        }
                    }

                    for (let s of allStars) {
                        if (dist(s.x, s.y, dragged.x, dragged.y) < minDist) {
                            isValidPosition = false; // minDist보다 가까우면 유효하지 않음
                            break;
                        }
                    }
                }

                // 위치가 유효하지 않으면 초기 위치로 되돌림
                if (!isValidPosition) {
                    this.extraStarPositions[this.draggingStar].x = this.initialStarPosition.x;
                    this.extraStarPositions[this.draggingStar].y = this.initialStarPosition.y;
                }

                this.draggingStar = null; // 드래그 상태 해제
            }

            // "별자리 완성" 버튼 클릭 로직
            let bx = windowWidth * 5 / 6; // 버튼의 중심 x 좌표
            let by = windowHeight * 12 / 13; // 버튼의 중심 y 좌표
            let bw = 160;
            let bh = 100;

            // 마우스가 버튼 클릭 영역 안에 있는지 확인
            if (mouseX >= bx - bw / 2 && mouseX <= bx + bw / 2 &&
                mouseY >= by - bh / 2 && mouseY <= by + bh / 2) {
                
                // ⭐ 메인 캔버스에서 별자리 영역 (배경, starImage, 별, 선 포함)을 직접 캡처 ⭐
                const captureX = (windowWidth * 9) / 17;
                const captureY = windowHeight / 8;
                const captureW = (windowWidth * 29) / 30 - captureX;
                const captureH = (windowHeight * 7) / 8 - captureY;

                // get() 함수는 p5.Image 객체를 반환합니다.
                this.myStar = get(captureX, captureY, captureW, captureH);
                
                // p5.Image 객체의 내부 canvas 엘리먼트에서 toDataURL()을 호출합니다.
                // 이 방법은 P5.js 문서에서 권장하는 방식이며, 안정적으로 작동합니다.
                this.myStarURL = this.myStar.canvas.toDataURL('image/png');
                const bgColor = this.myStar.get(5, 5);
                const constellationWithoutBg = removeBackgroundByColor(this.myStar, bgColor, 80);
                
                // ⭐ 별자리 이미지와 URL을 외부로 전달하는 콜백 함수 호출 ⭐
                if (this.onConstellationComplete) {
                    this.onConstellationComplete(constellationWithoutBg, this.myStarURL);
                }

                this.index++; // 다음 단계로 이동
                this.keeperState = "showing"; // 다음 키퍼 대화 시작
            }
        }
    }
    // 이펙트는 추후에 구현
    handleMouseOver(){
        // 마우스가 카드 위에 있으면 빛이 남
        // 마우스가 별 위에 있으면 별이 더 밝아짐
    }

    keeperInteraction(){
        push();
        tint(255, this.keeperAlpha);
        imageMode(CENTER);
        image(
            this.keeperImages[this.index+4], // 이미지 인덱스 조정 필요성을 다시 확인해 보세요.
            windowWidth / 2,
            windowHeight / 2,
            windowWidth / 3,
            (windowHeight * 10) / 11
        );
        pop();

        // 텍스트 박스
        const boxWidth = (windowWidth * 18) / 19;
        const boxHeight = windowHeight / 4;
        const boxX = windowWidth / 2;
        const boxY = windowHeight - boxHeight / 2 - 50;

        imageMode(CENTER);
        image(this.textBoxImage, boxX, boxY, boxWidth, boxHeight);

        // 텍스트 출력
        const textX = windowWidth / 13;
        const textY = windowHeight - (boxHeight * 9) / 10;
        // `textSize`를 `wrapText` 호출 전에 설정하여 정확한 너비 계산을 보장합니다.
        textSize(50); 
        if (
            frameCount % this.interval === 0 &&
            this.keeperIndex < keeperDialogue[this.index].length
        ) {
            this.keeperText += keeperDialogue[this.index][this.keeperIndex];
            this.keeperIndex++;
        }

        fill(255, this.keeperAlpha);
        noStroke();
        textAlign(LEFT, TOP);
        let wrapped = this.wrapText(this.keeperText, boxWidth- 40);
        text(wrapped, textX, textY);
    }

    drawLines() {
        let existingLines = [];
        // 기본 별들과 추가 별들을 모두 포함
        const allCurrentStars = [...this.starPositions, ...this.extraStarPositions];

        for (let i = 0; i < allCurrentStars.length; i++) {
            for (let j = i + 1; j < allCurrentStars.length; j++) {
                let a = allCurrentStars[i];
                let b = allCurrentStars[j];

                let d = dist(a.x, a.y, b.x, b.y);
                if (d < 500) { // 선을 연결할 최대 거리
                    // 교차 확인 로직 (선이 겹치지 않도록)
                    let intersects = false;
                    for (let k = 0; k < existingLines.length; k++) {
                        let l1 = existingLines[k];
                        if (this.linesIntersect(a, b, l1.a, l1.b)) {
                            intersects = true;
                            break;
                        }
                    }

                    if (!intersects) {
                        existingLines.push({ a, b });
                        push();
                        stroke(this.starColor, 180);
                        strokeWeight(10);
                        line(a.x, a.y, b.x, b.y);
                        pop();
                    }
                }
            }
        }
    }

    // 두 선분이 교차하는지 판단하는 헬퍼 함수
    linesIntersect(p1, p2, p3, p4) {
        function ccw(A, B, C) {
            return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
        }

        return (
            ccw(p1, p3, p4) !== ccw(p2, p3, p4) &&
            ccw(p1, p2, p3) !== ccw(p1, p2, p4)
        );
    }

    cardAnimation(){
        // 카드 선택 시 애니메이션 관리 (구현 예정)
    }

    changeStarColor(){
        this.starColor = this.favoriteCard[0].colour;
    }

    displayStarName() {
        // this.starNickname이 초기 null일 때만 업데이트
        if (this.index === 4 && this.starNickname === "") { // null 대신 빈 문자열로 비교
            this.updateStarName();
        }
        push();
        textAlign(CENTER, BOTTOM);
        textSize(24);
        fill(255, 220);
        text(
            this.nameResult,
            windowWidth * 3 / 4,
            windowHeight * 7 / 8
        );
        pop();
    }

    updateStarName() {
        this.starNickname = this.favoriteCard[0].nickName;
        this.nameResult = this.starNickname + " " + this.nameResult;
    }

    displayStory(){
        push();
        const textX = windowWidth/20;
        const textY = windowHeight/8;
        // `textSize`를 `wrapText` 호출 전에 설정하여 정확한 너비 계산을 보장합니다.
        textSize(50); 
        if (
            frameCount % this.interval === 0 &&
            this.storyIndex < this.storyResult.length
        ) {
            this.storyText += this.storyResult[this.storyIndex];
            this.storyIndex++;
        }

        fill(255);
        noStroke();
        textAlign(LEFT, TOP);
        let wrapped = this.wrapText(this.storyText, windowWidth*7/15);
        text(wrapped, textX, textY);
        pop();
    }

    drawCardFront(x, y, w, h, img, label, alpha) {
        push();
        // translate(x, y); // 이미 show()에서 translate 되어있으므로 여기서는 제거
        rectMode(CENTER);

        fill(16, 17, 60, alpha);
        stroke(160, 120, 80, alpha);
        strokeWeight(4);
        rect(0, 0, w, h, 8); // translate(x,y) 대신 (0,0)에 그립니다.

        noStroke();
        imageMode(CENTER);
        tint(255, alpha);
        image(img, 0, -h * 0.1, w * 0.9, h * 0.7);

        noTint();
        fill(230, alpha);
        textAlign(CENTER, CENTER);
        textSize(h * 0.07);
        text(label, 0, h * 0.35);

        pop();
    }

    // Connecting.js - wrapText 함수 수정
wrapText(txt, maxWidth) {
    let words = txt.split(" "); // 스페이스 기준으로 단어를 쪼갭니다.
    let lines = "";
    let currentLine = "";

    // textSize가 함수 외부에서 설정되어야 정확합니다. keeperInteraction을 참고하세요.
    // 예를 들어 textSize(this.fontSize); 가 이미 설정되어 있다고 가정합니다.

    for (let i = 0; i < words.length; i++) {
        let testLine = currentLine + (i > 0 ? " " : "") + words[i]; // 첫 단어가 아니면 앞에 공백 추가
        if (textWidth(testLine) > maxWidth) {
            lines += currentLine + "\n";
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines += currentLine; // 마지막 줄 추가
    return lines;
}
}
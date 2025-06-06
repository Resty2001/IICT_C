// outro.js (이 코드로 파일 전체를 교체해주세요)

class OutroScene {
    constructor(images, onComplete) {
        this.images = images;
        this.onComplete = onComplete;

        // --- 상수 (IntroScene.js와 동일하게) ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.TYPING_SPEED = 50;
        this.TEXT_BOX_ALPHA = 220;
        this.FADE_DURATION = 2000;
        this.KEEPER_FADE_DURATION = 500; // ★★★ 1. 디졸브를 위한 상수 추가

        // --- 상태 관리 ---
        this.sceneState = 'INITIAL_DIALOGUE';
        this.dialogueIndex = 0;
        
        // ★★★ 2. 타이핑 효과를 위한 변수 (IntroScene과 동일하게) ★★★
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
        
        this.fadeStartTime = 0;

        // --- UI 요소 ---
        this.dialogueBoxRect = {};
        this.yesButtonRect = {};
        this.noButtonRect = {};
        this.endButtonRect = {};
        this.keeperRect = {};
        this.qrCodeRect = {};

        // ★★★ 1. 디졸브를 위한 변수 추가 ★★★
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;

        // ★★★ 6. 엔딩 배경을 위한 변수 추가 ★★★
        this.constellations = [];
        this.generalStars = [];
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
        this.CONSTELLATION_MOVE_SPEED_X_RATIO = 0.1 / this.ORIGINAL_WIDTH;
        this.CONSTELLATION_MOVE_SPEED_Y_RATIO = 0.03 / this.ORIGINAL_HEIGHT;
        this.NUM_GENERAL_STARS = 250;
        this.constellationMoveSpeedX = 0;
        this.constellationMoveSpeedY = 0;

        // --- 대화 내용 ---
        this.initialDialogues = [
            { speaker: "나", text: "와... 이게 바로... 저의 별자리군요." },
            { speaker: "공방지기", text: "그렇습니다. 이승의 사람들이 밤하늘을 올려다볼 때마다, 그들은 당신을, 당신의 빛나는 이야기를 기억하고, 또 위로받게 될 거예요.", image: 'keeper_smile2' },
            { speaker: "나", text: "아..." },
            { speaker: "공방지기", text: "당신의 별자리는 이제 영원히 저 하늘에 빛나겠지만... 그 기억을 당신의 영혼에도 깊이 새기고 싶지 않으신가요? 원하신다면, 이 별자리를 당신의 마음에 간직할 수 있도록 도와드리겠습니다.", image: 'keeper_talk2' }
        ];
        this.qrDialogue = { speaker: "공방지기", text: "좋습니다. 이제 당신의 이야기는 당신의 영혼 속에, 그리고 저 밤하늘에 영원히 함께할 것입니다.", image: 'keeper_smile1' };
        this.noDialogue = { speaker: "공방지기", text: "괜찮습니다. 때로는 그저 밤하늘을 올려다보는 것으로 충분한 분들도 계시지요. 어떤 선택이든, 당신의 빛은 영원히 빛날겁니다.", image: 'keeper_talk3' };
        this.endingMonologue = { speaker: "공방지기", text: "이제 이곳에서의 당신의 역할은 끝났습니다. 당신의 별자리는 밤하늘에서 제 몫을 다할 것이고, 당신은 이제 새로운 여정을 떠나야 합니다. 부디 평안하세요. 당신의 이야기가 많은 이들에게 오랫동안 따뜻한 빛이 되기를... 진심으로 응원하겠습니다." };

        this.setup();
    }
    
    // --- 초기 설정 ---
    setup() {
        this.setupUIElements();
        // ★★★ 6. 엔딩 배경을 위한 별 생성 ★★★
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.generateConstellations();
        this.generateGeneralStars();
    }

    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        let avgScale = (scaleX + scaleY) / 2;

        this.keeperRect = { x: width / 2, y: height / 2 + (150 * scaleY), w: 600 * scaleX, h: 900 * scaleX };
        this.dialogueBoxRect = { x: 50 * scaleX, y: height - 300 * scaleY - 30 * scaleY, w: width - (100 * scaleX), h: 300 * scaleY };
        this.qrCodeRect = { x: width / 2, y: height / 2 - 100 * scaleY, w: 300 * avgScale, h: 300 * avgScale };
        
        // ★★★ 4. 선택지 버튼 위치 조정 ★★★
        let buttonW = 300 * scaleX;
        let buttonH = 100 * scaleY;
        let buttonY = height / 2 - buttonH / 2; // 대화창이 없으므로 화면 중앙으로 이동
        let buttonGap = 50 * scaleX;
        this.yesButtonRect = { x: width / 2 - buttonW - buttonGap, y: buttonY, w: buttonW, h: buttonH };
        this.noButtonRect = { x: width / 2 + buttonGap, y: buttonY, w: buttonW, h: buttonH };
        
        this.endButtonRect = { x: width / 2 - (100 * scaleX), y: height - (150 * scaleY), w: 200 * scaleX, h: 80 * scaleY };
    }

    // --- 메인 그리기 함수 ---
    draw() {
        // 배경 그리기
        if (this.sceneState === 'ENDING_MONOLOGUE' || this.sceneState.startsWith('FADING') || this.sceneState === 'FINAL_SCREEN') {
            image(this.images.mainBackground, width / 2, height / 2, width, height);
            // ★★★ 6. 움직이는 별 배경 그리기 ★★★
            this.updateSkyMovement();
            this.drawMovingSkyElements();
        } else {
            this.drawWorkshopBackground();
        }

        // 상태별 내용 그리기
        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE':
                this.drawDialogueScene(this.initialDialogues, true);
                break;
            case 'CHOICE':
                // ★★★ 4. 대화창 없이 공방지기와 버튼만 표시 ★★★
                this.drawKeeperImage(); 
                this.drawChoiceButtons();
                break;
            case 'QR_CODE_PATH':
                this.drawQRCodeScene();
                break;
            case 'NO_THANKS_PATH':
                this.drawDialogueScene([this.noDialogue], true);
                break;
            case 'ENDING_MONOLOGUE':
                this.drawDialogueScene([this.endingMonologue], false);
                break;
            case 'FADING_TO_WHITE':
                this.drawFadeToWhite(false);
                break;
            case 'FINAL_SCREEN':
                this.drawFinalScreen();
                break;
            case 'FADING_OUT_TO_WHITE': // ★★★ 3. 종료 시 페이드 아웃 상태 추가 ★★★
                this.drawFadeToWhite(true);
                break;
        }
    }

    // --- 마우스 클릭 처리 ---
    handleMousePressed() {
        // ★★★ 2. 타이핑 스킵 로직 (IntroScene과 동일하게) ★★★
        if (this.isTyping) {
            this.isTyping = false;
            return;
        }

        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE':
                this.advanceDialogue(this.initialDialogues, 'CHOICE');
                break;
            case 'CHOICE':
                if (this.isMouseOver(this.yesButtonRect)) {
                    this.sceneState = 'QR_CODE_PATH';
                    this.resetTyping(this.qrDialogue);
                } else if (this.isMouseOver(this.noButtonRect)) {
                    this.sceneState = 'NO_THANKS_PATH';
                    this.resetTyping(this.noDialogue);
                }
                break;
            case 'QR_CODE_PATH':
                this.advanceDialogue([this.qrDialogue], 'ENDING_MONOLOGUE');
                break;
            case 'NO_THANKS_PATH':
                this.advanceDialogue([this.noDialogue], 'ENDING_MONOLOGUE');
                break;
            case 'ENDING_MONOLOGUE':
                this.advanceDialogue([this.endingMonologue], 'FADING_TO_WHITE');
                break;
            case 'FINAL_SCREEN':
                let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
                 // ★★★ 3. 종료 버튼 누르면 페이드 아웃 상태로 변경 ★★★
                if (progress >= 1 && this.isMouseOver(this.endButtonRect)) {
                    this.sceneState = 'FADING_OUT_TO_WHITE';
                    this.fadeStartTime = millis();
                }
                break;
        }
    }
    
    // --- 헬퍼 함수들 ---

    drawWorkshopBackground() {
        let bgImg = this.images.workshopInsideImg;
        if (bgImg) {
            let canvasRatio = width / height;
            let imgRatio = bgImg.width / bgImg.height;
            let imgW, imgH;
            if (canvasRatio > imgRatio) { imgW = width; imgH = imgW / imgRatio; } 
            else { imgH = height; imgW = imgH * imgRatio; }
            image(bgImg, width / 2, height / 2, imgW, imgH);
        } else {
            background(10, 0, 20);
        }
    }
    
    // ★★★ 1. 디졸브 로직을 포함한 공방지기 이미지 그리기 ★★★
    drawKeeperImage() {
        let keeperFadeProgress = constrain((millis() - this.keeperFadeStartTime) / this.KEEPER_FADE_DURATION, 0, 1);

        if (keeperFadeProgress >= 1) {
            this.previousKeeperImg = null;
        }
        if (this.previousKeeperImg) {
            tint(255, lerp(255, 0, keeperFadeProgress));
            image(this.previousKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        if (this.currentKeeperImg) {
            tint(255, lerp(0, 255, keeperFadeProgress));
            image(this.currentKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        noTint();
    }

    drawDialogueScene(dialogues, drawKeeper) {
        if (drawKeeper) {
            this.drawKeeperImage();
        }
        this.drawDialogueBox(dialogues[this.dialogueIndex]);
    }
    
    drawChoiceButtons() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let textSizeVal = 32 * scaleX;

        fill(this.isMouseOver(this.yesButtonRect) ? color(255, 255, 200, 50) : color(0, 150));
        stroke(255);
        rect(this.yesButtonRect.x, this.yesButtonRect.y, this.yesButtonRect.w, this.yesButtonRect.h, 10);
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(textSizeVal);
        text("좋아요", this.yesButtonRect.x + this.yesButtonRect.w / 2, this.yesButtonRect.y + this.yesButtonRect.h / 2);

        fill(this.isMouseOver(this.noButtonRect) ? color(255, 255, 200, 50) : color(0, 150));
        stroke(255);
        rect(this.noButtonRect.x, this.noButtonRect.y, this.noButtonRect.w, this.noButtonRect.h, 10);
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(textSizeVal);
        text("괜찮습니다", this.noButtonRect.x + this.noButtonRect.w / 2, this.noButtonRect.y + this.noButtonRect.h / 2);
    }
    
    drawQRCodeScene() {
        this.drawDialogueScene([this.qrDialogue], true);
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        tint(255, lerp(0, 255, progress));
        image(this.images.qrCode, this.qrCodeRect.x, this.qrCodeRect.y, this.qrCodeRect.w, this.qrCodeRect.h);
        noTint();
    }
    
    drawFadeToWhite(isFadingOut) {
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        if (isFadingOut) {
            this.drawFinalScreen(0); // 종료 화면을 그리고 그 위에 흰색 오버레이
            background(255, lerp(0, 255, progress));
            if (progress >= 1) this.onComplete(); // 페이드 아웃 끝나면 게임 재시작
        } else {
            this.drawDialogueScene([this.endingMonologue], false);
            background(255, lerp(0, 255, progress));
            if (progress >= 1) {
                this.sceneState = 'FINAL_SCREEN';
                this.fadeStartTime = millis();
            }
        }
    }

    drawFinalScreen(overrideAlpha) {
        let progress = (overrideAlpha !== undefined) ? overrideAlpha : constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        
        if (this.images.finalConstellationTest) {
            let glow = 150 + sin(millis() * 0.002) * 105;
            tint(255, glow * progress); // 나타날 때 같이 밝아지도록
            image(this.images.finalConstellationTest, width / 2, height / 2 - 50, this.images.finalConstellationTest.width * (width/this.ORIGINAL_WIDTH), this.images.finalConstellationTest.height * (height/this.ORIGINAL_HEIGHT));
            noTint();
        }

        let buttonAlpha = lerp(0, 255, progress);
        let textSizeVal = 32 * (width / this.ORIGINAL_WIDTH);
        fill(0, 0, 0, 150 * progress);
        stroke(255, buttonAlpha);
        rect(this.endButtonRect.x, this.endButtonRect.y, this.endButtonRect.w, this.endButtonRect.h, 10);
        fill(255, buttonAlpha);
        noStroke(); textAlign(CENTER, CENTER); textSize(textSizeVal);
        text("종료하기", this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2);

        background(255, lerp(255, 0, progress));
    }

    advanceDialogue(dialogues, nextState) {
        this.dialogueIndex++;
        if (this.dialogueIndex >= dialogues.length) {
            this.sceneState = nextState;
            this.dialogueIndex = 0;
            this.fadeStartTime = millis();
            this.resetTyping(nextState === 'ENDING_MONOLOGUE' ? this.endingMonologue : null);
        } else {
            this.resetTyping(dialogues[this.dialogueIndex]);
        }
    }

    resetTyping(currentDialogue) {
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
        if (currentDialogue && currentDialogue.image) {
            // ★★★ 1. 디졸브 로직 실행 ★★★
            if(currentDialogue.image !== this.lastKeeperImgKey){
                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                this.currentKeeperImg = this.images[currentDialogue.image];
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = currentDialogue.image;
            }
        }
    }
    
    drawDialogueBox(dialogue) {
        let d = this.dialogueBoxRect;
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        let avgScale = (scaleX + scaleY) / 2;

        tint(255, this.TEXT_BOX_ALPHA);
        image(this.images.textBox, d.x + d.w / 2, d.y + d.h / 2, d.w, d.h);
        noTint();
        
        if (!dialogue) return;

        let fullText = dialogue.text;
        
        // ★★★ 2. 타이핑 로직 (IntroScene과 동일하게) ★★★
        if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
            if(this.currentCharIndex < fullText.length) {
               this.currentCharIndex++;
               this.lastCharTime = millis();
            } else {
                this.isTyping = false;
            }
        }
        let textToShow = fullText.substring(0, this.currentCharIndex);

        let speakerTextSize = 40 * avgScale;
        let dialogueTextSize = 36 * avgScale;
        let paddingX = 100 * scaleX;
        let paddingY = 70 * scaleY;

        textSize(speakerTextSize); textAlign(LEFT, TOP); noStroke();
        fill(dialogue.speaker === "나" ? color(255, 215, 0) : color(255));
        text(dialogue.speaker + ":", d.x + paddingX, d.y + paddingY);

        fill(255); textSize(dialogueTextSize);
        text(textToShow, d.x + paddingX, d.y + paddingY + speakerTextSize * 1.5, d.w - (paddingX * 2), d.h - (paddingY * 2 + speakerTextSize * 1.5));
    }

    isMouseOver(rectObj) {
        return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w &&
                mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h);
    }

    handleMouseMoved() {}
    handleWindowResized() {
        this.setupUIElements();
    }
    
    // ★★★ 6. IntroScene에서 가져온 하늘 배경 관련 함수들 ★★★
   generateConstellations() {
        const originalConstellations = [
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
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        this.constellations = [];
        for (let c of originalConstellations) {
            let newConstellation = { stars: [], connections: c.connections };
            for (let star of c.stars) {
                newConstellation.stars.push([star[0] * scaleX, star[1] * scaleY]);
            }
            this.constellations.push(newConstellation);
        }
    }

    generateGeneralStars() {
        this.generalStars = [];
        let scale = Math.min(width / this.ORIGINAL_WIDTH, height / this.ORIGINAL_HEIGHT);
        for (let i = 0; i < this.NUM_GENERAL_STARS; i++) {
            this.generalStars.push({ x: random(0, width), y: random(0, height), size: random(1, 3.5) * scale, alpha: random(80, 200) });
        }
    }

    updateSkyMovement() {
        this.skyOffsetX += this.constellationMoveSpeedX;
        this.skyOffsetY += this.constellationMoveSpeedY;
        this.skyOffsetX = (this.skyOffsetX % width + width) % width;
        this.skyOffsetY = (this.skyOffsetY % height + height) % height;
    }

    drawMainMenu() {
        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.drawMovingSkyElements();
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);
        this.drawWorkshopGlow();
        if (this.images.workshopImg) image(this.images.workshopImg, this.workshopRect.cx, this.workshopRect.cy, this.workshopRect.w, this.workshopRect.h);
    }

    drawMovingSkyElements() {
        push();
        translate(this.skyOffsetX, this.skyOffsetY);
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                push();
                translate(i * width, j * height);
                this.drawGeneralStarsSet();
                this.drawConstellationSet();
                pop();
            }
        }
        pop();
    }

    drawGeneralStarsSet() {
        noStroke();
        for (let star of this.generalStars) {
            fill(255, 255, 255, star.alpha);
            ellipse(star.x, star.y, star.size, star.size);
        }
    }

    drawConstellationSet() {
        let scale = Math.min(width / this.ORIGINAL_WIDTH, height / this.ORIGINAL_HEIGHT);
        for (let constellation of this.constellations) {
            stroke(180, 210, 255, 100); strokeWeight(1 * scale);
            for (let connection of constellation.connections) {
                let start = constellation.stars[connection[0]];
                let end = constellation.stars[connection[1]];
                line(start[0], start[1], end[0], end[1]);
            }
            noStroke();
            for (let star of constellation.stars) {
                fill(210, 225, 255, 220); ellipse(star[0], star[1], 4 * scale, 4 * scale);
                fill(180, 210, 255, 40); ellipse(star[0], star[1], 10 * scale, 10 * scale);
            }
        }
    }
}
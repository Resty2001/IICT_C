// IntroScene.js (이 코드로 파일 전체를 교체해주세요)

class IntroScene {
    // --- 생성자 ---
    constructor(images, onComplete) {
        this.images = images;
        this.onComplete = onComplete;

        // --- 상수 정의 ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.TRANSITION_DURATION = 3000;
        this.CONSTELLATION_MOVE_SPEED_X_RATIO = 0.1 / this.ORIGINAL_WIDTH;
        this.CONSTELLATION_MOVE_SPEED_Y_RATIO = 0.03 / this.ORIGINAL_HEIGHT;
        this.NUM_GENERAL_STARS = 250;
        this.TYPING_SPEED = 50;
        this.ARROW_FADE_SPEED = 10;
        this.TEXT_BOX_ALPHA = 220;
        this.KEEPER_FADE_DURATION = 500;

        // --- UI 요소 위치/크기 정보 ---
        this.workshopRect = {};
        this.dialogueBoxRect = {};
        this.arrowRect = {};
        this.keeperRect = {};

        // --- 게임 상태 관리 ---
        this.gameState = 'MAIN_MENU';
        this.dialogueIndex = 0;

        // --- 대화 내용 배열 ---
        this.dialogues = [
            { speaker: "나", text: "계세요...? 저... 실례합니다만...", image: null },
            { speaker: "공방지기", text: "어서 오세요. 당신을 기다리고 있었습니다. 많이 놀라셨을 테지요?", image: 'keeper_normal' },
            { speaker: "나", text: "여긴... 대체 어디죠? 저는 분명... 눈을 떠보니 낯선 곳에... 별빛이 가득하네요...", image: null },
            { speaker: "공방지기", text: "당신은 삶의 여정을 마친 영혼들이 쉬어가는 곳, 사후세계에 도착했습니다.", image: 'keeper_normal' },
            { speaker: "나", text: "아... 그렇군요... 그럼 저는 역시...", image: null },
            { speaker: "나", text: "하지만 이곳은... 제가 상상했던 사후세계와는 조금 다른 것 같은데요. 이 반짝이는 것들은 다 뭐죠?", image: null },
            { speaker: "공방지기", text: "이곳은 '별자리 공방', 이 공방은 아무에게나 모습을 드러내지 않습니다. 당신을 그리워하는 이들의 간절한 마음이 모여 비로소 이곳의 불을 밝히지요.", image: 'keeper_talk1' },
            { speaker: "공방지기", text: "당신이 여기 있다는 건, 그만큼 당신이 빛나는 존재였다는 뜻입니다.", image: 'keeper_talk1' },
            { speaker: "나", text: "제가... 빛나는 존재였다고요? ...그럼 이 공방에서는 무엇을 하나요?", image: null },
            { speaker: "공방지기", text: "이곳에서는 당신의 삶, 그 소중한 기억의 조각들을 모읍니다. 당신의 웃음과 눈물, 사랑과 꿈...", image: 'keeper_smile2' },
            { speaker: "공방지기", text: "그 모든 빛나는 순간들을 모아서, 밤하늘에 영원히 빛날 당신만의 별자리를 만들어 드린답니다.", image: 'keeper_smile2' },
            { speaker: "나", text: "제 삶으로도... 그렇게 아름다운 별자리를 만들 수 있을까요?", image: null },
            { speaker: "공방지기", text: "물론입니다. 허허. 아무리 평범해 보이는 삶이라도, 그 안에는 반드시 밤하늘을 수놓을 고유한 빛이 있지요.", image: 'keeper_talk3' },
            { speaker: "공방지기", text: "제가 그 빛을 찾도록 도와드릴 테니, 염려 마십시오.", image: 'keeper_talk3' },
            { speaker: "나", text: "저만의 별자리라... 저는 그럼 어떻게 하면 될까요...?", image: null },
            { speaker: "공방지기", text: "어려울 것 없습니다. 제가 드리는 몇 가지 질문에 당신의 마음이 이끄는 대로 답해주시겠습니까?", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "각 질문에 제시된 선택지 중, 당신의 삶을 가장 잘 나타낸다고 생각하는 하나를 골라주시면 됩니다.", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "완벽할 필요는 없습니다. 당신의 진실된 이야기가 곧 별이 될 테니까요.", image: 'keeper_smile2' }
        ];

        // --- 기타 변수 ---
        this.transitionStartTime = 0;
        this.targetScale = 10.0;
        this.constellations = [];
        this.generalStars = [];
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
        this.constellationMoveSpeedX = 0;
        this.constellationMoveSpeedY = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.lastCharTime = 0;
        this.arrowAlpha = 0;

        // --- 공방지기 이미지 상태 관리 변수 ---
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;

        // --- 초기 설정 호출 ---
        this.setup();

        
    }

    setup() {
        imageMode(CENTER);
        textAlign(LEFT, TOP);
        textFont('Malgun Gothic, Apple SD Gothic Neo, sans-serif');
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.setupUIElements();
        this.generateConstellations();
        this.generateGeneralStars();
    }

    draw() {
        background(0);
        switch (this.gameState) {
            case 'MAIN_MENU':
                this.updateSkyMovement();
                this.drawMainMenu();
                break;
            case 'TRANSITION_TO_INTRO':
                this.drawTransition();
                break;
            case 'INTRO':
                this.drawIntroScene();
                break;
        }
    }

    
    handleMousePressed() {
        if (this.gameState === 'MAIN_MENU') {
            if (this.isMouseOver(this.workshopRect)) {
                this.gameState = 'TRANSITION_TO_INTRO';
                this.transitionStartTime = millis();
            }
        } else if (this.gameState === 'INTRO') {
            if (this.isMouseOver(this.dialogueBoxRect)) {
                if (this.isTyping) {
                    this.currentCharIndex = this.dialogues[this.dialogueIndex].text.length;
                    this.isTyping = false;
                } else {
                    this.dialogueIndex++;
                    if (this.dialogueIndex >= this.dialogues.length) {
                        if (this.onComplete) {
                            this.onComplete();
                        }
                        this.gameState = 'MAIN_MENU';
                        this.dialogueIndex = 0;
                        this.currentKeeperImg = null;
                        this.previousKeeperImg = null;
                        this.lastKeeperImgKey = null;
                    } else {
                        const currentDialogue = this.dialogues[this.dialogueIndex];

                        if (currentDialogue.speaker === '공방지기') {
                            const newImgKey = currentDialogue.image;
                            if (newImgKey !== this.lastKeeperImgKey) {
                                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                                this.currentKeeperImg = this.images[newImgKey];
                                this.keeperFadeStartTime = millis();
                                this.lastKeeperImgKey = newImgKey;
                            }
                        }

                        this.currentCharIndex = 0;
                        this.isTyping = true;
                        this.arrowAlpha = 0;
                        this.lastCharTime = millis();
                    }
                }
            }
        }
    }

    handleWindowResized() {
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.setupUIElements();
        this.generateConstellations();
        this.generateGeneralStars();
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
    }

    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;

        let workshopOriginalW = 570;
        let workshopOriginalH = 510;
        let workshopW = workshopOriginalW * scaleX;
        let workshopH = workshopW * (workshopOriginalH / workshopOriginalW);
        let workshopCX = width / 2;
        let workshopCY = height * (840 / this.ORIGINAL_HEIGHT);
        this.workshopRect = { cx: workshopCX, cy: workshopCY, w: workshopW, h: workshopH, x: workshopCX - workshopW / 2, y: workshopCY - workshopH / 2 };

        let keeperOriginalW = 600;
        let keeperOriginalH = 900;
        let keeperW = keeperOriginalW * scaleX;
        let keeperH = keeperW * (keeperOriginalH / keeperOriginalW);
        this.keeperRect = { x: width / 2, y: height / 2 + (150 * scaleY), w: keeperW, h: keeperH };

        let dialogueBoxMargin = 50 * scaleX;
        let dialogueBoxH = 300 * scaleY;
        let dialogueBoxW = width - (2 * dialogueBoxMargin);
        this.dialogueBoxRect = { x: dialogueBoxMargin, y: height - dialogueBoxH - (30 * scaleY), w: dialogueBoxW, h: dialogueBoxH };

        let arrowSize = 40 * Math.min(scaleX, scaleY);
        this.arrowRect = { x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (80 * scaleX), y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (80 * scaleY), w: arrowSize, h: arrowSize };
    }

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

    drawWorkshopGlow() {
        let cx = this.workshopRect.cx; let cy = this.workshopRect.cy; let baseW = this.workshopRect.w;
        let d = dist(mouseX, mouseY, cx, cy);
        let maxDist = 350 * (baseW / (570 * (width / this.ORIGINAL_WIDTH)));
        let maxAlpha = 30; let minAlpha = 0;
        let glowAlpha = map(d, 0, maxDist, maxAlpha, minAlpha);
        glowAlpha = constrain(glowAlpha, minAlpha, maxAlpha);
        if (glowAlpha > 0) {
            let maxGlowSizeFactor = 1.3; let minGlowSizeFactor = 1.0;
            let glowSizeFactor = map(d, 0, maxDist, maxGlowSizeFactor, minGlowSizeFactor);
            glowSizeFactor = constrain(glowSizeFactor, minGlowSizeFactor, maxGlowSizeFactor);
            let glowSize = baseW * glowSizeFactor;
            let layers = 6; noStroke();
            for (let i = layers; i > 0; i--) {
                let layerRatio = i / layers;
                let currentAlpha = glowAlpha * pow(layerRatio, 3);
                let currentSize = lerp(baseW * 0.8, glowSize, layerRatio);
                fill(255, 255, 220, currentAlpha); ellipse(cx, cy, currentSize, currentSize);
            }
        }
    }

    drawTransition() {
        let elapsedTime = millis() - this.transitionStartTime;
        let progress = constrain(elapsedTime / this.TRANSITION_DURATION, 0, 1);
        let easedProgress = 1 - pow(1 - progress, 3);
        let alphaOut = lerp(255, 0, easedProgress);
        let alphaIn = lerp(0, 255, easedProgress);
        let currentScale = lerp(1, this.targetScale, easedProgress);
        let workshopCenterX = this.workshopRect.cx;
        let workshopCenterY = this.workshopRect.cy;

        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);

        push();
        translate(workshopCenterX, workshopCenterY);
        scale(currentScale);
        tint(255, alphaOut);
        if (this.images.workshopImg) image(this.images.workshopImg, 0, 0, this.workshopRect.w / currentScale, this.workshopRect.h / currentScale);
        noTint();
        pop();

        let bgImg = this.images.workshopInsideImg;
        if (bgImg && bgImg.width > 0) {
            let canvasRatio = width / height;
            let imgRatio = bgImg.width / bgImg.height;
            let imgW, imgH;
            if (canvasRatio > imgRatio) {
                imgW = width;
                imgH = imgW / imgRatio;
            } else {
                imgH = height;
                imgW = imgH * imgRatio;
            }
            tint(255, alphaIn);
            image(bgImg, width / 2, height / 2, imgW, imgH);
            noTint();
        } else {
            fill(0, alphaIn);
            rectMode(CORNER);
            rect(0, 0, width, height);
            imageMode(CENTER);
        }

        if (progress >= 1) {
            this.gameState = 'INTRO';
            this.dialogueIndex = 0;
            this.currentCharIndex = 0;
            this.isTyping = true;
            this.arrowAlpha = 0;
            this.lastCharTime = millis();
            
            const firstDialogue = this.dialogues[0];
            const firstImgKey = firstDialogue.speaker === '공방지기' ? firstDialogue.image : null;
            if (firstImgKey) {
                this.currentKeeperImg = this.images[firstImgKey];
                this.previousKeeperImg = null;
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = firstImgKey;
            } else {
                this.currentKeeperImg = null;
                this.previousKeeperImg = null;
                this.lastKeeperImgKey = null;
            }
        }
    }

// IntroScene.js 파일에서 이 함수를 찾아 교체해주세요.

drawIntroScene() {
    let bgImg = this.images.workshopInsideImg;
    if (bgImg && bgImg.width > 0) {
        let canvasRatio = width / height;
        let imgRatio = bgImg.width / bgImg.height;
        let imgW, imgH;
        if (canvasRatio > imgRatio) {
            imgW = width;
            imgH = imgW / imgRatio;
        } else {
            imgH = height;
            imgW = imgH * imgRatio;
        }
        image(bgImg, width / 2, height / 2, imgW, imgH);
    } else {
        background(10, 0, 20);
        fill(255);
        textAlign(CENTER, CENTER);
        text("배경 이미지 로딩 중...", width / 2, height / 2);
        textAlign(LEFT, TOP);
    }
    
    let fadeElapsedTime = millis() - this.keeperFadeStartTime;
    let fadeProgress = constrain(fadeElapsedTime / this.KEEPER_FADE_DURATION, 0, 1);

    if (fadeProgress >= 1) {
        this.previousKeeperImg = null;
    }

    // 사라지는 이전 이미지 그리기
    if (this.previousKeeperImg) {
        let alphaOut = lerp(255, 0, fadeProgress);
        tint(255, alphaOut);
        image(this.previousKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        noTint();
    }

    // 나타나는 현재 이미지 그리기
    if (this.currentKeeperImg) {
        // ★★★ 바로 이 부분이 수정되었습니다! ★★★
        // 이전 이미지가 있든 없든, 페이드가 시작되면 항상 0부터 투명도를 올립니다.
        let alphaIn = lerp(0, 255, fadeProgress);
        
        tint(255, alphaIn);
        image(this.currentKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        noTint();
    }
    
    this.drawDialogueBox();
}
    
    drawDialogueBox() {
        let d = this.dialogueBoxRect;
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        let avgScale = (scaleX + scaleY) / 2;

        if (this.images.textBox) {
            tint(255, this.TEXT_BOX_ALPHA);
            image(this.images.textBox, d.x + d.w / 2, d.y + d.h / 2, d.w, d.h);
            noTint();
        } else {
            fill(0, 0, 0, 180); stroke(255); strokeWeight(3 * avgScale);
            rectMode(CORNER);
            rect(d.x, d.y, d.w, d.h, 15 * avgScale);
            imageMode(CENTER);
        }
        
        if (this.dialogueIndex < this.dialogues.length) {
            let currentDialogue = this.dialogues[this.dialogueIndex];
            let fullText = currentDialogue.text;

            if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
                this.currentCharIndex++;
                this.lastCharTime = millis();
                if (this.currentCharIndex >= fullText.length) {
                    this.currentCharIndex = fullText.length;
                    this.isTyping = false;
                }
            }
            let textToShow = fullText.substring(0, this.currentCharIndex);

            let speakerTextSize = 40 * avgScale;
            let dialogueTextSize = 36 * avgScale;
            let paddingX = 100 * scaleX;
            let paddingY = 70 * scaleY;

            textSize(speakerTextSize); textAlign(LEFT, TOP); noStroke();
            fill(currentDialogue.speaker === "나" ? color(255, 215, 0) : color(255));
            text(currentDialogue.speaker + ":", d.x + paddingX, d.y + paddingY);

            fill(255); textSize(dialogueTextSize);
            text(textToShow, d.x + paddingX, d.y + paddingY + speakerTextSize * 1.5, d.w - (paddingX * 2), d.h - (paddingY * 2 + speakerTextSize * 1.5));

            if (!this.isTyping) {
                this.arrowAlpha = min(255, this.arrowAlpha + this.ARROW_FADE_SPEED);
            } else {
                this.arrowAlpha = 0;
            }
            if (this.arrowAlpha > 0) {
                fill(255, this.arrowAlpha); noStroke();
                let ar = this.arrowRect;
                ar.x = d.x + d.w - (80 * scaleX);
                ar.y = d.y + d.h - (80 * scaleY);
                triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
            }
        }
    }

    isMouseOver(rectObj) {
        let rX = rectObj.x !== undefined ? rectObj.x : rectObj.cx - rectObj.w / 2;
        let rY = rectObj.y !== undefined ? rectObj.y : rectObj.cy - rectObj.h / 2;
        return (mouseX >= rX && mouseX <= rX + rectObj.w &&
                mouseY >= rY && mouseY <= rY + rectObj.h);
    }
    
    reset() {
    this.gameState = 'MAIN_MENU';
    this.dialogueIndex = 0;
    // 필요한 다른 변수들도 여기서 초기화해줍니다.
    this.currentKeeperImg = null;
    this.previousKeeperImg = null;
    this.lastKeeperImgKey = null;
    this.skyOffsetX = 0;
    this.skyOffsetY = 0;
}
}


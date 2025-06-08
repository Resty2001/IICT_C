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
        // 이 값을 조절하여 마지막 페이드아웃 시간을 변경할 수 있습니다 (1500 = 1.5초)
        this.FADE_OUT_DURATION = 1500;

        // --- UI 요소 및 상태 관리 변수 ---
        this.workshopRect = {};
        this.dialogueBoxRect = {};
        this.arrowRect = {};
        this.keeperRect = {};
        this.gameState = 'MAIN_MENU';
        this.dialogueIndex = 0;
        
        // --- 애니메이션 및 기타 변수 ---
        this.transitionStartTime = 0;
        this.targetScale = 10.0;
        this.fadeOutStartTime = 0; 
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
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;

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
            case 'FADING_OUT_WHITE':
                this.drawFadeOutWhite();
                break;
        }
    }
    
    handleMousePressed() {
        if (this.gameState === 'MAIN_MENU' && this.isMouseOver(this.workshopRect)) {
            this.gameState = 'TRANSITION_TO_INTRO';
            this.transitionStartTime = millis();
        } else if (this.gameState === 'INTRO' && this.isMouseOver(this.dialogueBoxRect)) {
            if (this.isTyping) {
                this.currentCharIndex = this.dialogues[this.dialogueIndex].text.length;
                this.isTyping = false;
            } else {
                this.dialogueIndex++;
                if (this.dialogueIndex >= this.dialogues.length) {
                    this.gameState = 'FADING_OUT_WHITE';
                    this.fadeOutStartTime = millis();
                } else {
                    this.startNextDialogue();
                }
            }
        }
    }
    
    startNextDialogue() {
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
        let workshopH = (workshopOriginalW * scaleX) * (510 / workshopOriginalW);
        this.workshopRect = { cx: width / 2, cy: height * (840 / this.ORIGINAL_HEIGHT), w: workshopOriginalW * scaleX, h: workshopH, x: width / 2 - (workshopOriginalW * scaleX) / 2, y: height * (840 / this.ORIGINAL_HEIGHT) - workshopH / 2 };

        let keeperOriginalW = 600;
        let keeperH = (keeperOriginalW * scaleX) * (900 / keeperOriginalW);
        this.keeperRect = { x: width / 2, y: height / 2 + (150 * scaleY), w: keeperOriginalW * scaleX, h: keeperH };

        let dialogueBoxMargin = 50 * scaleX;
        let dialogueBoxH = 300 * scaleY;
        this.dialogueBoxRect = { x: dialogueBoxMargin, y: height - dialogueBoxH - (30 * scaleY), w: width - (2 * dialogueBoxMargin), h: dialogueBoxH };

        let arrowSize = 40 * Math.min(scaleX, scaleY);
        this.arrowRect = { x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (80 * scaleX), y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (80 * scaleY), w: arrowSize, h: arrowSize };
    }
    
    // --- 그리기 함수들 ---

    drawMainMenu() {
        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.drawMovingSkyElements();
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);
        this.drawWorkshopGlow();
        if (this.images.workshopImg) image(this.images.workshopImg, this.workshopRect.cx, this.workshopRect.cy, this.workshopRect.w, this.workshopRect.h);
    }
    
    drawTransition() {
        let elapsedTime = millis() - this.transitionStartTime;
        let progress = constrain(elapsedTime / this.TRANSITION_DURATION, 0, 1);
        let easedProgress = 1 - pow(1 - progress, 3);
        let alphaIn = lerp(0, 255, easedProgress);
        let currentScale = lerp(1, this.targetScale, easedProgress);
    
        // 1. 이전 장면(하늘, 별, 확대되는 공방)을 모두 그립니다.
        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.drawMovingSkyElements();
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);
        
        push();
        translate(this.workshopRect.cx, this.workshopRect.cy);
        scale(currentScale);
        if (this.images.workshopImg) {
            image(this.images.workshopImg, 0, 0, this.workshopRect.w / currentScale, this.workshopRect.h / currentScale);
        }
        pop();
    
        // 2. 이전 장면 위를 어둡게 덮어주면서 자연스럽게 사라지게 합니다.
        fill(0, alphaIn * 0.9);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);
    
        // 3. 새로운 장면(공방 내부)을 서서히 나타나게 합니다.
        let bgImg = this.images.workshopInsideImg;
        if (bgImg && bgImg.width > 0) {
            const dims = this._calculateImageDimensions(bgImg);
            tint(255, alphaIn);
            image(bgImg, width / 2, height / 2, dims.w, dims.h);
            noTint();
        }
    
        // 4. 전환이 끝나면 상태를 변경합니다.
        if (progress >= 1) {
            this.gameState = 'INTRO';
            this.dialogueIndex = 0;
            const firstDialogue = this.dialogues[0];
            const firstImgKey = firstDialogue.speaker === '공방지기' ? firstDialogue.image : null;
            this.lastKeeperImgKey = firstImgKey;
            this.startNextDialogue();
        }
    }

    drawIntroScene() {
        let bgImg = this.images.workshopInsideImg;
        if (bgImg && bgImg.width > 0) {
            const dims = this._calculateImageDimensions(bgImg);
            image(bgImg, width / 2, height / 2, dims.w, dims.h);
        } else {
            background(10, 0, 20);
            fill(255);
            textAlign(CENTER, CENTER);
            text("배경 이미지 로딩 중...", width / 2, height / 2);
            textAlign(LEFT, TOP);
        }

        let fadeElapsedTime = millis() - this.keeperFadeStartTime;
        let fadeProgress = constrain(fadeElapsedTime / this.KEEPER_FADE_DURATION, 0, 1);

        if (fadeProgress >= 1) this.previousKeeperImg = null;

        if (this.previousKeeperImg) {
            tint(255, lerp(255, 0, fadeProgress));
            image(this.previousKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        if (this.currentKeeperImg) {
            tint(255, lerp(0, 255, fadeProgress));
            image(this.currentKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        noTint();
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
            rectMode(CORNER); rect(d.x, d.y, d.w, d.h, 15 * avgScale);
        }

        if (this.dialogueIndex < this.dialogues.length) {
            let currentDialogue = this.dialogues[this.dialogueIndex];
            if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
                if (++this.currentCharIndex >= currentDialogue.text.length) {
                    this.isTyping = false;
                }
                this.lastCharTime = millis();
            }
            let textToShow = currentDialogue.text.substring(0, this.currentCharIndex);

            let speakerTextSize = 40 * avgScale;
            let dialogueTextSize = 36 * avgScale;
            let paddingX = 100 * scaleX;
            let paddingY = 70 * scaleY;
            let textY = d.y + paddingY + speakerTextSize * 1.5;

            noStroke();
            textSize(speakerTextSize);
            textAlign(LEFT, TOP);
            fill(currentDialogue.speaker === "나" ? color(255, 215, 0) : color(255));
            text(currentDialogue.speaker + ":", d.x + paddingX, d.y + paddingY);

            fill(255);
            textSize(dialogueTextSize);
            text(textToShow, d.x + paddingX, textY, d.w - (paddingX * 2), d.h - (paddingY * 2 + speakerTextSize * 1.5));

            this.arrowAlpha = this.isTyping ? 0 : min(255, this.arrowAlpha + this.ARROW_FADE_SPEED);
            if (this.arrowAlpha > 0) {
                fill(255, this.arrowAlpha);
                let ar = this.arrowRect;
                triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
            }
        }
        imageMode(CENTER);
    }
    
    updateSkyMovement() {
        this.skyOffsetX = (this.skyOffsetX + this.constellationMoveSpeedX + width) % width;
        this.skyOffsetY = (this.skyOffsetY + this.constellationMoveSpeedY + height) % height;
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
            stroke(180, 210, 255, 100);
            strokeWeight(1 * scale);
            for (let connection of constellation.connections) {
                let start = constellation.stars[connection[0]];
                let end = constellation.stars[connection[1]];
                line(start[0], start[1], end[0], end[1]);
            }
            noStroke();
            for (let star of constellation.stars) {
                fill(210, 225, 255, 220);
                ellipse(star[0], star[1], 4 * scale, 4 * scale);
                fill(180, 210, 255, 40);
                ellipse(star[0], star[1], 10 * scale, 10 * scale);
            }
        }
    }

    drawWorkshopGlow() {
        let cx = this.workshopRect.cx;
        let cy = this.workshopRect.cy;
        let baseW = this.workshopRect.w;
        let d = dist(mouseX, mouseY, cx, cy);
        let maxDist = 350 * (baseW / (570 * (width / this.ORIGINAL_WIDTH)));
        let maxAlpha = 30;
        let minAlpha = 0;
        let glowAlpha = map(d, 0, maxDist, maxAlpha, minAlpha);
        glowAlpha = constrain(glowAlpha, minAlpha, maxAlpha);
        if (glowAlpha > 0) {
            let maxGlowSizeFactor = 1.3;
            let minGlowSizeFactor = 1.0;
            let glowSizeFactor = map(d, 0, maxDist, maxGlowSizeFactor, minGlowSizeFactor);
            glowSizeFactor = constrain(glowSizeFactor, minGlowSizeFactor, maxGlowSizeFactor);
            let glowSize = baseW * glowSizeFactor;
            let layers = 6;
            noStroke();
            for (let i = layers; i > 0; i--) {
                let layerRatio = i / layers;
                let currentAlpha = glowAlpha * pow(layerRatio, 3);
                let currentSize = lerp(baseW * 0.8, glowSize, layerRatio);
                fill(255, 255, 220, currentAlpha);
                ellipse(cx, cy, currentSize, currentSize);
            }
        }
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
    
    _calculateImageDimensions(img) {
        let canvasRatio = width / height;
        let imgRatio = img.width / img.height;
        if (canvasRatio > imgRatio) return { w: width, h: width / imgRatio };
        return { w: height * imgRatio, h: height };
    }
    
    drawFadeOutWhite() {
        this.drawIntroScene();
        let elapsedTime = millis() - this.fadeOutStartTime;
        let progress = constrain(elapsedTime / this.FADE_OUT_DURATION, 0, 1);
        fill(255, lerp(0, 255, progress));
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);
        if (progress >= 1) {
            if (this.onComplete) this.onComplete();
            this.reset();
        }
    }

    isMouseOver(rectObj) {
        return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w &&
                mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h);
    }
    
    reset() {
        this.gameState = 'MAIN_MENU';
        this.dialogueIndex = 0;
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.lastKeeperImgKey = null;
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
    }
}
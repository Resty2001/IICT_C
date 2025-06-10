class OutroScene {
    constructor(images, sounds, onComplete) {
        this.images = images;
        this.sounds = sounds; // 사운드 객체 저장
        this.onComplete = onComplete;

        // --- 상수 ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.TYPING_SPEED = 50;
        this.TEXT_BOX_ALPHA = 240;
        this.FADE_DURATION = 2000;
        this.KEEPER_FADE_DURATION = 500;

        // --- 상태 관리 ---
        this.sceneState = 'INITIAL_DIALOGUE';
        this.dialogueIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = 0;
        this.fadeStartTime = 0;

        // --- UI 요소 ---
        this.dialogueBoxRect = {};
        this.yesButtonRect = {};
        this.noButtonRect = {};
        this.endButtonRect = {};
        this.keeperRect = {};
        this.arrowRect = {};

        // --- 디졸브 및 배경 효과 변수 ---
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;
        this.constellations = [];
        this.generalStars = [];
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
        this.CONSTELLATION_MOVE_SPEED_X_RATIO = 0.01 / this.ORIGINAL_WIDTH;
        this.CONSTELLATION_MOVE_SPEED_Y_RATIO = 0.003 / this.ORIGINAL_HEIGHT;
        this.NUM_GENERAL_STARS = 250;
        this.constellationMoveSpeedX = 0;
        this.constellationMoveSpeedY = 0;
        
        // --- 마우스 꼬리 효과 변수 (사용자 예제 기반) --- // <<< 로직 전체 변경
        this.xpos = [];
        this.ypos = [];
        this.TAIL_LENGTH = 50; // 꼬리 길이 (사용자 예제의 num)

        this.qrCodeDownloadUrl = null;
        this.generatedQRImage = null;

        // --- 대화 내용 ---
        this.initialDialogues = [
            { speaker: "나", text: "와... 이게 바로... 저의 별자리군요." },
            { speaker: "공방지기", text: "그렇습니다. 사람들이 밤하늘을 올려다볼 때마다, 그들은 당신의 빛나는 이야기를 기억하고, 또 위로받게 될 거예요.", image: 'keeper_smile2' },
            { speaker: "나", text: "아..." },
            { speaker: "공방지기", text: "당신의 별자리는 이제 영원히 저 하늘에 빛나겠지만... 그 기억을 당신의 영혼에도 깊이 새기고 싶지 않으신가요?", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "원하신다면, 이 별자리를 당신의 마음에 간직할 수 있도록 도와드리겠습니다.", image: 'keeper_talk2' }
        ];
        this.qrDialogue = { speaker: "공방지기", text: "이제 당신의 이야기는 당신의 영혼 속에, 그리고 저 밤하늘에 영원히 함께할 것입니다.", image: 'keeper_smile1' };
        this.noDialogue = { speaker: "공방지기", text: "때로는 그저 밤하늘을 올려다보는 것으로 충분한 분들도 계시지요.", image: 'keeper_talk3' };
        this.endingMonologue = [
            { speaker: "공방지기", text: "이제 이곳에서의 당신의 역할은 끝났습니다." },
            { speaker: "공방지기", text: "당신의 별자리는 밤하늘에서 제 몫을 다할 것이고, 당신은 이제 새로운 여정을 떠나야 합니다." },
            { speaker: "공방지기", text: "부디 평안하세요." }
        ];

        this.setup();
    }
    
setQRCodeUrl(url) {
    this.qrCodeDownloadUrl = url;
    this.generateQRCode();
}

generateQRCode() {
    if (!this.qrCodeDownloadUrl) return;
    try {
        const typeNumber = 4;
        const errorCorrectionLevel = 'L';
        const qr = qrcode(typeNumber, errorCorrectionLevel);
        qr.addData(this.qrCodeDownloadUrl);
        qr.make();
        const qrDataUrl = qr.createDataURL(5, 5);

        loadImage(qrDataUrl,
            img => {
                this.generatedQRImage = img;
            },
            err => {
                console.error("QR 이미지 로딩 실패:", err);
                this.generatedQRImage = null; // 또는 fallback 이미지 사용
            }
        );
    } catch (err) {
        console.error("QR 코드 생성 실패:", err);
    }
}


    setup() {
        this.setupUIElements();
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.generateConstellations();
        this.generateGeneralStars();
        
        const firstKeeperDialogue = this.initialDialogues.find(d => d.image);
        if (firstKeeperDialogue) {
            this.currentKeeperImg = this.images[firstKeeperDialogue.image];
            this.lastKeeperImgKey = firstKeeperDialogue.image;
        }
        this.lastCharTime = millis();
    }

    // <<< 마우스 꼬리 초기화 함수 추가
    initMouseTrail() {
        for (let i = 0; i < this.TAIL_LENGTH; i++) {
            this.xpos[i] = -999; // 화면 밖에 위치시켜 시작 시 보이지 않게 함
            this.ypos[i] = -999;
        }
    }

    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH, scaleY = height / this.ORIGINAL_HEIGHT, avgScale = (scaleX + scaleY) / 2;
        this.keeperRect = { x: width / 2, y: height*5 / 11 + (150 * scaleY), w: 600 * scaleX, h: 900 * scaleX };
        this.dialogueBoxRect = { x: 50 * scaleX, y: height - 330 * scaleY, w: width - (100 * scaleX), h: 300 * scaleY };
        let buttonW = 300 * scaleX, buttonH = 100 * scaleY, buttonY = this.dialogueBoxRect.y + this.dialogueBoxRect.h / 2 - buttonH / 2, buttonGap = 50 * scaleX;
        this.yesButtonRect = { x: width / 2 - buttonW - buttonGap, y: buttonY, w: buttonW, h: buttonH };
        this.noButtonRect = { x: width / 2 + buttonGap, y: buttonY, w: buttonW, h: buttonH };
        let endButtonW = 220 * scaleX;
        this.endButtonRect = { x: width / 2 - (endButtonW / 2), y: height - (150 * scaleY), w: endButtonW, h: 80 * scaleY };
        let arrowSize = 40 * avgScale;
        this.arrowRect = { x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (125 * scaleX), y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (90 * scaleY), w: arrowSize, h: arrowSize };
    }

    draw() {
        const isFinalScene = this.sceneState === 'FINAL_SCREEN' || this.sceneState === 'FADING_OUT_TO_WHITE';
        if (!isFinalScene) {
            if (this.sounds.bgm3 && !this.sounds.bgm3.isPlaying()) {
                this.sounds.bgm3.loop();
            }
        }

        isFinalScene ? this.drawNightSkyBackground() : this.drawWorkshopBackground();

        // <<< 여기서 마우스 꼬리를 그림
        if (isFinalScene) {
            //this.updateAndDrawMouseTrail();
        }

        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE': this.drawDialogueScene(this.initialDialogues, true); break;
            case 'CHOICE':
                this.drawKeeperImage();
                this.drawDialogueBoxBackground();
                this.drawChoiceButtons();
                break;
            case 'QR_CODE_PATH': this.drawQRCodeScene(); break;
            case 'NO_THANKS_PATH': this.drawDialogueScene([this.noDialogue], true); break;
            case 'ENDING_MONOLOGUE': this.drawDialogueScene(this.endingMonologue, true); break;
            case 'FADING_TO_WHITE': this.drawFadeToWhite(); break;
            case 'FINAL_SCREEN':
            case 'FADING_OUT_TO_WHITE': this.drawFinalScreen(); break;
        }
        
        if (this.sceneState === 'FINAL_SCREEN') {
            let progress = constrain((millis() - this.fadeStartTime) / (this.FADE_DURATION / 1.5), 0, 1);
            if (progress < 1) {
                fill(255, lerp(255, 0, progress)); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
            }
        } 
        else if (this.sceneState === 'FADING_OUT_TO_WHITE') {
            this.drawFadeOverlay(true);
        }
    }

    handleMousePressed() {
        if (this.isTyping) { this.currentCharIndex = 999; this.isTyping = false; return; }
        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE': this.advanceDialogue(this.initialDialogues, 'CHOICE'); break;
            case 'CHOICE':
                if (this.isMouseOver(this.yesButtonRect)) { this.sceneState = 'QR_CODE_PATH'; this.resetTyping(this.qrDialogue); } 
                else if (this.isMouseOver(this.noButtonRect)) { this.sceneState = 'NO_THANKS_PATH'; this.resetTyping(this.noDialogue); }
                break;
            case 'QR_CODE_PATH':
            case 'NO_THANKS_PATH':
                this.sceneState = 'ENDING_MONOLOGUE'; this.resetTyping(this.endingMonologue[0]); break;
            case 'ENDING_MONOLOGUE': this.advanceDialogue(this.endingMonologue, 'FADING_TO_WHITE'); break;
            case 'FINAL_SCREEN':
                if (this.isMouseOver(this.endButtonRect)) { this.sceneState = 'FADING_OUT_TO_WHITE'; this.fadeStartTime = millis(); }
                break;
        }
    }

    // <<< 사용자 예제 코드를 클래스 함수로 변환
    updateAndDrawMouseTrail() {
        // 1. 배열의 위치를 한 칸씩 뒤로 민다.
        for (let i = 0; i < this.TAIL_LENGTH - 1; i++) {
            this.xpos[i] = this.xpos[i + 1];
            this.ypos[i] = this.ypos[i + 1];
        }

        // 2. 배열의 마지막에 현재 마우스 위치를 추가한다.
        this.xpos[this.TAIL_LENGTH - 1] = mouseX;
        this.ypos[this.TAIL_LENGTH - 1] = mouseY;

        // 3. 배열에 저장된 위치에 원을 그린다.
        noStroke();
        for (let i = 0; i < this.TAIL_LENGTH; i++) {
            // i가 0에 가까울수록(오래된 위치) 더 투명하고 커짐
            // i가 끝에 가까울수록(최신 위치) 더 불투명하고 작아짐
            let alpha = map(i, 0, this.TAIL_LENGTH, 0, 200); // 투명도 조절
            let size = map(i, 0, this.TAIL_LENGTH, this.TAIL_LENGTH, 2); // 크기 조절
            
            fill(255, alpha);
            ellipse(this.xpos[i], this.ypos[i], size, size);
        }
    }
    
 drawFadeOverlay(isFadingOut) {
    let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
    let alpha = lerp(0, 255, progress);
    fill(255, alpha);
    noStroke();
    rectMode(CORNER);
    rect(0, 0, width, height);

    // 페이드 인/아웃이 완료되었을 때
    if (progress >= 1) {
        if (isFadingOut) {
            // '종료하기'를 눌러서 페이드 아웃될 때
            this.onComplete();
        } else { 
            // FINAL_SCREEN으로 페이드 인될 때
            
            // --- ★ 여기가 누락된 핵심 로직입니다 ★ ---
            // BGM3을 멈춥니다.
            if (this.sounds.bgm3 && this.sounds.bgm3.isPlaying()) {
                this.sounds.bgm3.stop();
            }
            // BGM4를 반복 재생합니다.
            if (this.sounds.bgm4 && !this.sounds.bgm4.isPlaying()) {
                this.sounds.bgm4.loop();
            }
            // --- 로직 추가 끝 ---

            this.sceneState = 'FINAL_SCREEN'; 
            this.fadeStartTime = millis();
            this.initMouseTrail();
        }
    }
}
    // --- 그리기 헬퍼 함수들 ---

    drawWorkshopBackground() {
        let bgImg = this.images.workshopInsideImg2;
        if (bgImg) {
            let canvasRatio = width / height, imgRatio = bgImg.width / bgImg.height;
            let imgW, imgH;
            if (canvasRatio > imgRatio) { imgW = width; imgH = imgW / imgRatio; } 
            else { imgH = height; imgW = imgH * imgRatio; }
            image(bgImg, width / 2, height / 2, imgW, imgH);
        } else { background(10, 0, 20); }
    }

    drawNightSkyBackground() {
        image(this.images.mainBackground2, width / 2, height / 2, width, height);
        this.updateSkyMovement();
        this.drawMovingSkyElements();
        image(this.images.subBackground, width / 2, height / 2, width, height);
    }
    
    drawKeeperImage() {
        let keeperFadeProgress = constrain((millis() - this.keeperFadeStartTime) / this.KEEPER_FADE_DURATION, 0, 1);
        if (this.previousKeeperImg) {
            tint(255, lerp(255, 0, keeperFadeProgress));
            image(this.previousKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        if (this.currentKeeperImg) {
            tint(255, lerp(this.previousKeeperImg ? 0 : 255, 255, keeperFadeProgress));
            image(this.currentKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        noTint();
    }

    drawDialogueScene(dialogues, drawKeeper) {
        if (drawKeeper) this.drawKeeperImage();
        this.drawDialogueBox(dialogues[this.dialogueIndex]);
    }
    
    drawChoiceButtons() {
        let scaleX = width / this.ORIGINAL_WIDTH, textSizeVal = 32 * scaleX;
        textAlign(CENTER, CENTER);
        
        push();
        tint(255, this.isMouseOver(this.yesButtonRect) ? 255 : 220);
        image(this.images.buttonBg, this.yesButtonRect.x + this.yesButtonRect.w / 2, this.yesButtonRect.y + this.yesButtonRect.h / 2, this.yesButtonRect.w, this.yesButtonRect.h);
        pop();
        fill(255); noStroke(); textSize(textSizeVal);
        text("좋아요", this.yesButtonRect.x + this.yesButtonRect.w / 2, this.yesButtonRect.y + this.yesButtonRect.h / 2);

        push();
        tint(255, this.isMouseOver(this.noButtonRect) ? 255 : 220);
        image(this.images.buttonBg, this.noButtonRect.x + this.noButtonRect.w / 2, this.noButtonRect.y + this.noButtonRect.h / 2, this.noButtonRect.w, this.noButtonRect.h);
        pop();
        fill(255); noStroke(); textSize(textSizeVal);
        text("괜찮습니다", this.noButtonRect.x + this.noButtonRect.w / 2, this.noButtonRect.y + this.noButtonRect.h / 2);
        
        textAlign(LEFT, TOP);
    }
    
    drawQRCodeScene() {
        this.drawKeeperImage();
        fill(0, 180); noStroke(); rectMode(CORNER); rect(0, 0, width, height);

        let scaleX = width/this.ORIGINAL_WIDTH, scaleY = height/this.ORIGINAL_HEIGHT;
        let popupW = 800 * scaleX, popupH = 900 * scaleY;
        let popupX = width / 2 - popupW / 2, popupY = height / 2 - popupH / 2;
        fill(20, 20, 30, 240); stroke(255, 100); strokeWeight(2);
        rect(popupX, popupY, popupW, popupH, 20);

        let qrSize = 400 * Math.min(scaleX, scaleY);
        if (this.generatedQRImage) {
    image(this.generatedQRImage, width / 2, popupY + popupH / 2 - 120 * scaleY, qrSize, qrSize);
} else {
    image(this.images.qrCode, width / 2, popupY + popupH / 2 - 120 * scaleY, qrSize, qrSize);
    fill(255);
    textAlign(CENTER, CENTER);
    text("QR 코드 생성 중...", width/2, popupY + popupH / 2 - 120 * scaleY);
    fill(255);
    text("QR 코드 생성 중이거나 실패했습니다.", width / 2, height / 2);
}

        textAlign(CENTER, TOP); noStroke();
        fill(255); textSize(32 * Math.min(scaleX, scaleY));
        text(this.qrDialogue.text, width / 2 - popupW/2 * 0.8, popupY + popupH * 0.7, popupW * 0.8);

        textSize(24 * Math.min(scaleX, scaleY));
        fill(255, 150 + sin(millis() * 0.005) * 105);
        text("화면을 클릭하여 계속하기", width/2, popupY + popupH - 60 * scaleY);
        textAlign(LEFT, TOP);
        
    }
    
    drawFadeToWhite() {
        this.drawWorkshopBackground();
        this.drawKeeperImage(); 
        this.drawDialogueBox(this.endingMonologue[this.endingMonologue.length - 1]);
        this.drawFadeOverlay(false);
    }
    
    drawFadeOverlay(isFadingOut) {
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        let alpha = lerp(0, 255, progress);
        fill(255, alpha); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
        if (progress >= 1) {
            if (isFadingOut) this.onComplete();
            else { 
                this.sceneState = 'FINAL_SCREEN'; 
                this.fadeStartTime = millis();
                this.lightParticles = []; // <<< 파티클 배열 초기화
            }
        }
    }

    drawFinalConstellation() {
        if (!this.images.finalConstellationTest) return;
        let scale = width / this.ORIGINAL_WIDTH, elapsedTime = millis() - this.fadeStartTime;
        let img = this.images.finalConstellationTest;
        let imgWidth = width / 4, imgHeight = imgWidth * (img.height / img.width);
        let imgX = width / 2, imgY = height / 3;
        
        let fadeInProgress = constrain(elapsedTime / 1500, 0, 1);
        let floatingY = sin(millis() * 0.0005) * 15 * scale;
        let glow = map(sin(millis() * 0.0008), -1, 1, 180, 255);
        let twinkleSize = 1 + sin(millis() * 0.003) * 0.02;
        
        tint(255, glow * fadeInProgress);
        image(img, imgX, imgY + floatingY, imgWidth * twinkleSize, imgHeight * twinkleSize);
        noTint();
    }

    drawFinalScreen() {
        let elapsedTime = millis() - this.fadeStartTime;
        let scale = width / this.ORIGINAL_WIDTH;
        const buttonDelay = 5000, buttonFadeDuration = 1500;
        let buttonAlpha = 0;

        if (elapsedTime > buttonDelay) {
            buttonAlpha = lerp(0, 255, constrain((elapsedTime - buttonDelay) / buttonFadeDuration, 0, 1));
        }
        
        if (buttonAlpha > 0) {
            let textSizeVal = 32 * scale;
            push();
            tint(255, buttonAlpha);
            image(this.images.buttonBg, this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2, this.endButtonRect.w, this.endButtonRect.h);
            pop();
            fill(255, buttonAlpha); 
            noStroke(); textAlign(CENTER, CENTER); textSize(textSizeVal);
            text("종료하기", this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2);
            textAlign(LEFT, TOP);
        }
    }

    advanceDialogue(dialogues, nextState) {
        this.dialogueIndex++;
        if (this.dialogueIndex >= dialogues.length) {
            this.sceneState = nextState;
            this.dialogueIndex = 0;
            this.fadeStartTime = millis();
            this.resetTyping(null);
                       if (nextState === 'FADING_TO_WHITE') {
                if (this.sounds.transition) {
                    this.sounds.transition.play();
                }
            }

        } else {
            this.resetTyping(dialogues[this.dialogueIndex]);
        }
    }

    resetTyping(currentDialogue) {
        if (currentDialogue) { 
            this.currentCharIndex = 0;
            this.isTyping = true;
            this.lastCharTime = millis();
            if (currentDialogue.image && currentDialogue.image !== this.lastKeeperImgKey) {
                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                this.currentKeeperImg = this.images[currentDialogue.image];
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = currentDialogue.image;
            }
        }
    }
    
    drawDialogueBoxBackground() {
        let d = this.dialogueBoxRect;
        tint(255, this.TEXT_BOX_ALPHA);
        image(this.images.textBox, d.x + d.w / 2, d.y + d.h / 2, d.w, d.h);
        noTint();
    }

    drawDialogueBox(dialogue) {
        this.drawDialogueBoxBackground();
        if (!dialogue) return;
        let d=this.dialogueBoxRect, sX=width/this.ORIGINAL_WIDTH, sY=height/this.ORIGINAL_HEIGHT, aS=(sX+sY)/2;
        let fullText = dialogue.text;
        if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
            this.currentCharIndex = min(this.currentCharIndex + 1, fullText.length);
            if(this.currentCharIndex === fullText.length) this.isTyping = false;
            this.lastCharTime = millis();
        }
        let textToShow = fullText.substring(0, this.currentCharIndex);
        let speakerSize=40*aS, dialogueSize=36*aS, pX=100*sX, pY=70*sY, tY=d.y+pY+speakerSize*1.5;
        noStroke(); textSize(speakerSize);
        fill(dialogue.speaker === "나" ? color(255, 215, 0) : color(255));
        text(dialogue.speaker + ":", d.x + pX, d.y + pY);
        fill(255); textSize(dialogueSize); 
        text(textToShow, d.x + pX, tY, d.w - (pX * 2), d.h - (pY * 2.5));
        if (!this.isTyping) {
            let arrowAlpha = map(sin(millis() * 0.005), -1, 1, 90, 220);
            fill(255, arrowAlpha); noStroke();
            let ar = this.arrowRect;
            triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
        }
    }

    // --- 빛의 꼬리 효과 함수 --- // <<< 로직 전체 변경
    updateAndDrawLightTrail() {
        // 1. 매 프레임 마우스 위치에 새로운 파티클 생성
        // 꼬리를 더 풍성하게 하려면 for 반복 횟수를 늘리세요 (예: for (let i = 0; i < 3; i++))
        for (let i = 0; i < 2; i++) {
            let p = {
                x: mouseX + random(-10, 10), // 약간의 무작위성을 줘서 더 자연스럽게
                y: mouseY + random(-10, 10),
                vx: random(-0.5, 0.5), // 약간 퍼져나가는 효과
                vy: random(-0.5, 0.5),
                life: this.PARTICLE_LIFESPAN,
                initialLife: this.PARTICLE_LIFESPAN,
            };
            this.lightParticles.push(p);
        }

        // 2. 모든 파티클 업데이트 및 그리기
        // 배열을 뒤에서부터 순회해야 삭제 시에도 인덱스 문제가 발생하지 않습니다.
        noStroke();
        for (let i = this.lightParticles.length - 1; i >= 0; i--) {
            let p = this.lightParticles[i];

            // 수명 감소 및 위치 업데이트
            p.life--;
            p.x += p.vx;
            p.y += p.vy;

            // 수명이 다하면 배열에서 제거
            if (p.life <= 0) {
                this.lightParticles.splice(i, 1);
                continue; // 다음 파티클로 넘어감
            }

            // 남은 수명 비율 (1.0 -> 0.0)
            let lifeRatio = p.life / p.initialLife;

            // 수명 비율에 따라 크기와 투명도 계산
            let currentSize = this.PARTICLE_INITIAL_SIZE * lifeRatio;
            let currentAlpha = 255 * lifeRatio;

            // 파티클 그리기
            fill(255, currentAlpha);
            ellipse(p.x, p.y, currentSize, currentSize);
        }
    }

    isMouseOver(rectObj) { return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w && mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h); }
    handleWindowResized() { this.setupUIElements(); }
    generateConstellations() {
        const oC = [[{s:[[200,150],[300,180],[400,160],[500,200],[480,280],[400,300],[350,250]],c:[[0,1],[1,2],[2,3],[3,4],[3,6],[5,6]]}, {s:[[1600,100],[1650,150],[1700,130],[1750,160],[1800,140]],c:[[0,1],[1,2],[2,3],[3,4]]}, {s:[[1000,400],[1050,450],[1100,400],[1050,550],[1000,600],[1100,600]],c:[[0,1],[1,2],[1,3],[3,4],[3,5]]}]];
        let sX=width/this.ORIGINAL_WIDTH,sY=height/this.ORIGINAL_HEIGHT; this.constellations=[];
        for(let c of oC[0]){let nC={stars:[],connections:c.c};for(let s of c.s)nC.stars.push([s[0]*sX,s[1]*sY]);this.constellations.push(nC);}
    }
    generateGeneralStars() {
        this.generalStars=[];let s=Math.min(width/this.ORIGINAL_WIDTH,height/this.ORIGINAL_HEIGHT);
        for(let i=0;i<this.NUM_GENERAL_STARS;i++)this.generalStars.push({x:random(width),y:random(height),size:random(1,3.5)*s,alpha:random(80,200)});
    }
    updateSkyMovement() {
        this.skyOffsetX=(this.skyOffsetX+this.constellationMoveSpeedX+width)%width;
        this.skyOffsetY=(this.skyOffsetY+this.constellationMoveSpeedY+height)%height;
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
        if (this.sceneState === 'FINAL_SCREEN' || this.sceneState === 'FADING_OUT_TO_WHITE') {
            this.drawFinalConstellation();
        }
        pop();
    }
    drawGeneralStarsSet() {
        noStroke();
        for (let s of this.generalStars) { fill(255, s.alpha); ellipse(s.x, s.y, s.size, s.size); }
    }
    drawConstellationSet() {
        let s = Math.min(width / this.ORIGINAL_WIDTH, height / this.ORIGINAL_HEIGHT);
        for (let c of this.constellations) {
            stroke(180, 210, 255, 100); strokeWeight(1 * s);
            for (let conn of c.connections) { line(c.stars[conn[0]][0], c.stars[conn[0]][1], c.stars[conn[1]][0], c.stars[conn[1]][1]); }
            noStroke();
            for (let star of c.stars) {
                fill(210, 225, 255, 220); ellipse(star[0], star[1], 4 * s, 4 * s);
                fill(180, 210, 255, 40); ellipse(star[0], star[1], 10 * s, 10 * s);
            }
        }
    }
}
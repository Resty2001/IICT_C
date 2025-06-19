/**
 * =======================================================================================
 * OutroScene.js
 * * 엔딩 시퀀스를 관리하는 클래스입니다.
 * 주요 기능:
 * 1. 메인 대화 진행 (공방지기와의 마지막 대화)
 * 2. 화면 전환 효과 (흰색으로 페이드 인/아웃)
 * 3. 최종 결과 화면 표시 (완성된 별자리 카드, QR 코드, 종료 버튼)
 * 4. 배경 효과 (밤하늘, 별, 마우스 궤적)
 * =======================================================================================
 */
class OutroScene {
    constructor(images, sounds, onComplete) {
        // --- 의존성 주입 ---
        this.images = images;
        this.sounds = sounds;
        this.onComplete = onComplete; // 씬 종료 시 호출될 콜백 함수

        // --- 기본 상수 ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.TYPING_SPEED = 50;         // 타이핑 효과 속도 (ms)
        this.TEXT_BOX_ALPHA = 240;      // 대화 상자 투명도
        this.FADE_DURATION = 2000;      // 화면 전환 페이드 지속 시간 (ms)
        this.KEEPER_FADE_DURATION = 500;  // 공방지기 이미지 교체 시 페이드 지속 시간 (ms)

        // --- 상태 관리 변수 ---
        this.sceneState = 'MAIN_DIALOGUE'; // 현재 씬의 상태 (MAIN_DIALOGUE, FADING_TO_WHITE, FINAL_SCREEN, FADING_OUT_TO_WHITE)
        this.dialogueIndex = 0;            // 현재 대화 인덱스
        this.currentCharIndex = 0;         // 현재 타이핑 중인 글자 인덱스
        this.isTyping = true;              // 타이핑 애니메이션 진행 여부
        this.lastCharTime = 0;             // 마지막 글자 타이핑 시간
        this.fadeStartTime = 0;            // 페이드 시작 시간

        // --- UI 요소 및 위치 변수 ---
        this.dialogueBoxRect = {};
        this.endButtonRect = {};
        this.keeperRect = {};
        this.arrowRect = {};

        // --- 배경 및 효과 관련 변수 ---
        // 공방지기 이미지 디졸브 효과
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;
        // 밤하늘 배경 스크롤 효과
        this.constellations = [];
        this.generalStars = [];
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
        this.CONSTELLATION_MOVE_SPEED_X_RATIO = 0.1 / this.ORIGINAL_WIDTH;
        this.CONSTELLATION_MOVE_SPEED_Y_RATIO = 0.03 / this.ORIGINAL_HEIGHT;
        this.NUM_GENERAL_STARS = 250;
        this.constellationMoveSpeedX = 0;
        this.constellationMoveSpeedY = 0;
        // 마우스 꼬리 효과
        this.lightParticles = [];
        this.PARTICLE_LIFESPAN = 60; // 파티클 수명 (프레임)
        this.PARTICLE_INITIAL_SIZE = 8; // 파티클 초기 크기

        // --- 데이터 변수 ---
        this.finalConstellationImage = null; // 최종 별자리 카드 이미지
        this.qrCodeDownloadUrl = null;       // QR 코드에 담길 URL
        this.generatedQRImage = null;        // 생성된 QR 코드 이미지 객체

        // --- 대화 내용 ---
        this.mainDialogue = [
            { speaker: "나", text: "와... 이게 바로... 저의 별자리군요." },
            { speaker: "공방지기", text: "그렇습니다. 사람들이 밤하늘을 올려다볼 때마다, 그들은 당신의 빛나는 이야기를 기억하고, 또 위로받게 될 거예요.", image: 'keeper_smile2' },
            { speaker: "나", text: "아… 이렇게라도 모두와 이어져 있게 해주셔서, 정말 감사합니다." },
            { speaker: "공방지기", text: "이제 이곳에서의 당신의 역할은 끝났습니다.", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "당신의 별자리는 밤하늘에서 제 몫을 다할 것이고, 당신은 이제 새로운 여정을 떠나야 합니다.", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "부디 평안하세요.", image: 'keeper_smile1' }
        ];

        // 초기 설정 실행
        this.setup();
    }

    /**
     * 최종 별자리 카드 이미지를 설정합니다.
     * @param {p5.Image} img - 표시할 별자리 카드 이미지
     */
    setFinalConstellationImage(img) {
        this.finalConstellationImage = img;
    }

    /**
     * QR 코드 생성을 위한 URL을 설정하고, QR 코드 생성을 시작합니다.
     * @param {string} url - QR 코드에 인코딩할 다운로드 URL
     */
    setQRCodeUrl(url) {
        this.qrCodeDownloadUrl = url;
        this.generateQRCode();
    }
    
    // ⭐ 2. 요청하신 대로 교체된 함수입니다.
    /**
     * qrcode.js 라이브러리를 사용하여 QR 코드를 생성하고 p5.Image 객체로 변환합니다.
     * URL이 짧아졌으므로 라이브러리 기본 설정으로도 안정적으로 생성됩니다.
     */
    generateQRCode() {
        console.log("[QR 생성 시작]");
        if (!this.qrCodeDownloadUrl) {
            console.error("QR 생성을 위한 URL이 없습니다.");
            return;
        }
        console.log("QR에 인코딩될 URL:", this.qrCodeDownloadUrl);

        try {
            const typeNumber = 4; // 짧은 URL이므로 type 4면 충분합니다.
            const errorCorrectionLevel = 'L';
            const qr = qrcode(typeNumber, errorCorrectionLevel);
            
            qr.addData(this.qrCodeDownloadUrl);
            qr.make();
            
            const qrDataUrl = qr.createDataURL(5, 5);
            console.log("QR 코드 데이터 URL 생성 성공. 이미지 로드를 시작합니다.");

            loadImage(
                qrDataUrl,
                img => {
                    this.generatedQRImage = img;
                    console.log("QR 이미지 로딩 성공!", img);
                },
                err => {
                    console.error("QR 이미지 로딩 실패:", err);
                }
            );
        } catch (err) {
            console.error("QR 코드 생성 중 오류 발생:", err);
        }
    }

    /**
     * 씬 시작 시 필요한 초기 설정을 수행합니다.
     * UI 요소, 배경 효과, 첫 대화 이미지 등을 설정합니다.
     */
    setup() {
        this.setupUIElements();
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.generateConstellations();
        this.generateGeneralStars();

        // 첫 번째 공방지기 이미지를 설정합니다.
        const firstKeeperDialogue = this.mainDialogue.find(d => d.image);
        if (firstKeeperDialogue) {
            this.currentKeeperImg = this.images[firstKeeperDialogue.image];
            this.lastKeeperImgKey = firstKeeperDialogue.image;
        }
        this.lastCharTime = millis();
    }

    /**
     * 씬을 처음 상태로 초기화합니다.
     * 게임을 다시 시작하거나 다른 씬으로 전환했다가 돌아올 때 사용됩니다.
     */
    reset() {
        this.sceneState = 'MAIN_DIALOGUE';
        this.dialogueIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
        this.fadeStartTime = 0;
        
        // 데이터 관련 변수 초기화
        this.finalConstellationImage = null;
        this.generatedQRImage = null;
        this.qrCodeDownloadUrl = null;

        // 공방지기 이미지 초기화
        const firstKeeperDialogue = this.mainDialogue.find(d => d.image);
        if (firstKeeperDialogue) {
            this.currentKeeperImg = this.images[firstKeeperDialogue.image];
            this.lastKeeperImgKey = firstKeeperDialogue.image;
            this.previousKeeperImg = null;
        }
        
        this.setupUIElements();
        console.log("OutroScene 상태가 초기화되었습니다.");
    }

    /**
     * 화면 크기에 맞춰 UI 요소들의 크기와 위치를 동적으로 계산합니다.
     */
    setupUIElements() {
        const scaleX = width / this.ORIGINAL_WIDTH;
        const scaleY = height / this.ORIGINAL_HEIGHT;
        const avgScale = (scaleX + scaleY) / 2;

        this.keeperRect = { x: width / 2, y: height * 5 / 11 + (150 * scaleY), w: 600 * scaleX, h: 900 * scaleX };
        this.dialogueBoxRect = { x: 50 * scaleX, y: height - 330 * scaleY, w: width - (100 * scaleX), h: 300 * scaleY };
        
        const arrowSize = 40 * avgScale;
        this.arrowRect = { 
            x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (125 * scaleX), 
            y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (90 * scaleY), 
            w: arrowSize, 
            h: arrowSize 
        };
    }

    /**
     * 매 프레임 호출되는 메인 드로잉 함수입니다.
     * 현재 씬 상태에 따라 적절한 그리기 함수를 호출합니다.
     */
    draw() {
        const isFinalScene = this.sceneState === 'FINAL_SCREEN' || this.sceneState === 'FADING_OUT_TO_WHITE';
    

        // 배경 그리기
        isFinalScene ? this.drawNightSkyBackground() : this.drawWorkshopBackground();

        // 최종 화면에서 마우스 꼬리 효과 그리기
        if (isFinalScene) {
            this.updateAndDrawLightTrail();
        }

        // 씬 상태에 따른 분기 처리
        switch (this.sceneState) {
            case 'MAIN_DIALOGUE':
                this.drawDialogueScene(this.mainDialogue, true);
                break;
            case 'FADING_TO_WHITE':
                this.drawFadeToWhite();
                break;
            case 'FINAL_SCREEN':
            case 'FADING_OUT_TO_WHITE':
                this.drawFinalScreen();
                break;
        }
        
        // 페이드 효과 처리
        if (this.sceneState === 'FINAL_SCREEN') {
            // 최종 화면이 나타날 때 흰색에서 부드럽게 전환
            const progress = constrain((millis() - this.fadeStartTime) / (this.FADE_DURATION / 1.5), 0, 1);
            if (progress < 1) {
                fill(255, lerp(255, 0, progress));
                noStroke();
                rectMode(CORNER);
                rect(0, 0, width, height);
            }
        } else if (this.sceneState === 'FADING_OUT_TO_WHITE') {
            // 종료 시 흰색으로 페이드 아웃
            this.drawFadeOverlay(true);
        }
    }

    /**
     * 마우스 클릭 이벤트를 처리합니다.
     */
    handleMousePressed() {
        // 타이핑 중일 경우, 텍스트를 즉시 완성시킵니다.
        if (this.isTyping) {
            this.currentCharIndex = 999; // 텍스트 길이보다 충분히 큰 값
            this.isTyping = false;
            return;
        }
        
        switch (this.sceneState) {
            case 'MAIN_DIALOGUE':
                this.advanceDialogue(this.mainDialogue, 'FADING_TO_WHITE');
                break;
            case 'FINAL_SCREEN':
                if (this.isMouseOver(this.endButtonRect)) {
                    this.sceneState = 'FADING_OUT_TO_WHITE';
                    this.fadeStartTime = millis();
                }
                break;
        }
    }

    /**
     * 화면을 흰색으로 덮는 페이드 효과를 그립니다.
     * @param {boolean} isFadingOut - true면 페이드 아웃(종료), false면 페이드 인(전환)
     */
    drawFadeOverlay(isFadingOut) {
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        let alpha = lerp(0, 255, progress);
        
        fill(255, alpha);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);

        if (progress >= 1) {
            if (isFadingOut) {
                this.onComplete(); // 콜백 호출하여 씬 종료
            } else { 
                
                this.sceneState = 'FINAL_SCREEN'; 
                this.fadeStartTime = millis();
                this.lightParticles = []; // 마우스 꼬리 효과 초기화
            }
        }
    }

    // --- 그리기 헬퍼 함수들 ---

    drawWorkshopBackground() {
        const bgImg = this.images.workshopInsideImg2;
        if (bgImg) {
            imageMode(CENTER);
            const canvasRatio = width / height;
            const imgRatio = bgImg.width / bgImg.height;
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
            background(10, 0, 20); // 이미지가 없을 경우 대비
        }
    }

    drawNightSkyBackground() {
        imageMode(CENTER);
        image(this.images.mainBackground2, width / 2, height / 2, width, height);
        this.updateSkyMovement();
        this.drawMovingSkyElements();
        image(this.images.subBackground, width / 2, height / 2, width, height);
    }
    
    drawKeeperImage() {
        imageMode(CENTER);
        // 이미지가 교체될 때 부드러운 디졸브 효과 적용
        const keeperFadeProgress = constrain((millis() - this.keeperFadeStartTime) / this.KEEPER_FADE_DURATION, 0, 1);
        
        if (this.previousKeeperImg) {
            tint(255, lerp(255, 0, keeperFadeProgress));
            image(this.previousKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        if (this.currentKeeperImg) {
            // 이전 이미지가 있으면 0부터, 없으면 255부터 시작
            const startAlpha = this.previousKeeperImg ? 0 : 255;
            tint(255, lerp(startAlpha, 255, keeperFadeProgress));
            image(this.currentKeeperImg, this.keeperRect.x, this.keeperRect.y, this.keeperRect.w, this.keeperRect.h);
        }
        noTint();
    }

    drawDialogueScene(dialogues, drawKeeper) {
        if (drawKeeper) this.drawKeeperImage();
        this.drawDialogueBox(dialogues[this.dialogueIndex]);
    }

    drawFadeToWhite() {
        this.drawWorkshopBackground();
        this.drawKeeperImage(); 
        this.drawDialogueBox(this.mainDialogue[this.mainDialogue.length - 1]); // 마지막 대사로 고정
        this.drawFadeOverlay(false); // 페이드 인 효과
    }
    
    // ⭐ [전면 수정] 요청하신 대로 교체된, 마지막 화면 그리기 함수입니다.
    drawFinalScreen() {
    const elapsedTime = millis() - this.fadeStartTime;
    imageMode(CENTER);
    rectMode(CENTER);

    // --- [수정] 빛 효과 계산 로직 ---
    // 일관된 속도의 느린 시간 변수를 만듭니다.
    const pulseTime = millis() * 0.0008; 

    // 화면 콘텐츠의 알파값(투명도)을 계산합니다.
    const fadeInStart = 1000;
    const fadeInDuration = 2000;
    let contentAlpha = (elapsedTime > fadeInStart) ? lerp(0, 255, constrain((elapsedTime - fadeInStart) / fadeInDuration, 0, 1)) : 0;

    // 버튼의 알파값을 계산합니다.
    const buttonDelay = 3000;
    const buttonFadeDuration = 1500;
    let buttonAlpha = (elapsedTime > buttonDelay) ? lerp(0, 255, constrain((elapsedTime - buttonDelay) / buttonFadeDuration, 0, 1)) : 0;

    if (this.sceneState === 'FADING_OUT_TO_WHITE') {
        contentAlpha = 255;
        buttonAlpha = 255;
    }

    if (contentAlpha > 0) {
        fill(0, 0, 0, contentAlpha * 0.4);
        rect(width / 2, height / 2, width, height);
    }

    // --- 1. 왼쪽: 별자리 카드 그리기 ---
    if (this.finalConstellationImage && contentAlpha > 0) {
        // [수정] 일관된 pulseTime을 사용하여 빛의 떨림을 없애고 부드럽게 만듭니다.
        const cardGlowPulse = map(sin(pulseTime), -1, 1, 0.6, 1.1);
        const cardShadowBlur = 40 * cardGlowPulse;
        const cardGlowColor = color(255, 255, 220, contentAlpha * 0.6);

        const cardAspectRatio = this.finalConstellationImage.width / this.finalConstellationImage.height;
        let cardW = width * 0.4;
        let cardH = cardW / cardAspectRatio;
        if (cardH > height * 0.8) {
            cardH = height * 0.8;
            cardW = cardH * cardAspectRatio;
        }
        const cardX = width / 4;
        const cardY = height / 2;

        push();
        drawingContext.shadowBlur = cardShadowBlur;
        drawingContext.shadowColor = cardGlowColor;
        tint(255, contentAlpha);
        image(this.finalConstellationImage, cardX, cardY, cardW, cardH);
        pop();
    }
    
    // --- 2. 오른쪽: QR 코드, 안내 문구, 종료 버튼 그리기 ---
    if (this.generatedQRImage && contentAlpha > 0) {
        const qrSize = min(width / 5, height / 3);
        const qrX = width * 3 / 4;
        const groupCenterY = height / 2 - 40;
        const spacing = 40;
        const totalGroupHeight = qrSize + spacing;
        const groupTopY = groupCenterY - totalGroupHeight / 2;
        const qrY = groupTopY + qrSize / 2;

        // [수정] 카드의 반대 위상으로 부드럽게 빛나도록 수정합니다. (pulseTime + PI)
        const qrGlowPulse = map(sin(pulseTime + PI), -1, 1, 0.8, 1.3);
        const qrShadowBlur = 60 * qrGlowPulse;
        const qrGlowColor = color(255, 255, 220, contentAlpha * 0.85);

        push();
        drawingContext.shadowBlur = qrShadowBlur;
        drawingContext.shadowColor = qrGlowColor;
        tint(255, contentAlpha);
        image(this.generatedQRImage, qrX, qrY, qrSize, qrSize);
        pop();
        
        const textHeight = width * 0.012;
        const textY = qrY + qrSize / 2 + spacing;
        
        push();
        fill(255, contentAlpha);
        textAlign(CENTER, CENTER);
        textSize(textHeight);
        textStyle(BOLD);
        text("별자리 카드를 다운로드 받으세요", qrX, textY);
        pop();
        
        if (buttonAlpha > 0) {
            const scale = width / this.ORIGINAL_WIDTH;
            const btnW = 220 * scale * 0.9;
            const btnH = 80 * scale * 0.85;
            const btnX = qrX - btnW / 2;
            const btnY = textY + textHeight / 2 + 40;
            this.endButtonRect = { x: btnX, y: btnY, w: btnW, h: btnH };
            const isHovering = this.isMouseOver(this.endButtonRect);
            
            push();
            tint(255, isHovering ? buttonAlpha : buttonAlpha * 0.85);
            image(this.images.buttonBg, this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2, this.endButtonRect.w, this.endButtonRect.h);
            pop();

            fill(isHovering ? 255 : 220, buttonAlpha);
            textAlign(CENTER, CENTER);
            textSize(32 * scale);
            textStyle(NORMAL);
            text("종료하기", this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2);
        }
    }
    
    rectMode(CORNER);
}
    
    /**
     * 배경에 움직이는 별과 별자리를 그립니다.
     * 최종 별자리 카드가 화면 중앙에 그려지므로, 배경의 별자리들은 계속 움직입니다.
     */
    drawMovingSkyElements() {
        push();
        translate(this.skyOffsetX, this.skyOffsetY);
        // 화면을 벗어나도 끊김 없이 보이도록 3x3 그리드로 그립니다.
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


    /**
     * 다음 대사로 넘어가는 로직을 처리합니다.
     * @param {Array} dialogues - 대화 스크립트 배열
     * @param {string} nextState - 대화가 끝나면 전환될 다음 씬 상태
     */
    advanceDialogue(dialogues, nextState) {
        this.dialogueIndex++;
        if (this.dialogueIndex >= dialogues.length) {
            // 대화가 모두 끝났을 경우
            this.sceneState = nextState;
            this.dialogueIndex = 0; // 인덱스 초기화
            this.fadeStartTime = millis();
            this.resetTyping(null);
            if (nextState === 'FADING_TO_WHITE' && this.sounds.transition) {
                this.sounds.transition.play();
            }
        } else {
            // 다음 대사로
            this.resetTyping(dialogues[this.dialogueIndex]);
        }
    }

    /**
     * 새 대사를 위해 타이핑 관련 상태를 초기화합니다.
     * @param {object | null} currentDialogue - 새로 시작할 대화 객체
     */
    resetTyping(currentDialogue) {
        if (currentDialogue) { 
            this.currentCharIndex = 0;
            this.isTyping = true;
            this.lastCharTime = millis();
            // 공방지기 이미지가 변경되어야 할 경우, 디졸브 효과를 준비합니다.
            if (currentDialogue.image && currentDialogue.image !== this.lastKeeperImgKey) {
                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                this.currentKeeperImg = this.images[currentDialogue.image];
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = currentDialogue.image;
            }
        }
    }
    
    drawDialogueBoxBackground() {
        const d = this.dialogueBoxRect;
        imageMode(CORNER);
        tint(255, this.TEXT_BOX_ALPHA);
        image(this.images.textBox, d.x, d.y, d.w, d.h);
        noTint();
    }

    drawDialogueBox(dialogue) {
        this.drawDialogueBoxBackground();
        if (!dialogue) return;

        // 타이핑 효과 업데이트
        if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
            this.currentCharIndex = min(this.currentCharIndex + 1, dialogue.text.length);
            if (this.currentCharIndex === dialogue.text.length) {
                this.isTyping = false;
            }
            this.lastCharTime = millis();
        }
        const textToShow = dialogue.text.substring(0, this.currentCharIndex);
        
        // 텍스트 스타일 및 위치 계산
        const d = this.dialogueBoxRect;
        const scaleX = width / this.ORIGINAL_WIDTH;
        const scaleY = height / this.ORIGINAL_HEIGHT;
        const avgScale = (scaleX + scaleY) / 2;
        
        const speakerSize = 40 * avgScale;
        const dialogueSize = 36 * avgScale;
        const paddingX = 100 * scaleX;
        const paddingY = 70 * scaleY;
        const speakerY = d.y + paddingY;
        const textY = speakerY + speakerSize * 1.5;

        // 텍스트 그리기
        textAlign(LEFT, TOP);
        noStroke();
        
        // 화자 이름
        textSize(speakerSize);
        fill(dialogue.speaker === "나" ? color(255, 215, 0) : color(255));
        text(dialogue.speaker + ":", d.x + paddingX, speakerY);
        
        // 대사 내용
        fill(255);
        textSize(dialogueSize); 
        text(textToShow, d.x + paddingX, textY, d.w - (paddingX * 2), d.h - (paddingY * 2.5));
        
        // 타이핑 완료 시 다음으로 넘어갈 수 있음을 알리는 화살표 표시
        if (!this.isTyping) {
            const arrowAlpha = map(sin(millis() * 0.005), -1, 1, 90, 220);
            fill(255, arrowAlpha);
            const ar = this.arrowRect;
            triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
        }
    }

    updateAndDrawLightTrail() {
        // 마우스가 움직일 때만 새 파티클 생성
        if (dist(mouseX, mouseY, pmouseX, pmouseY) > 1) {
            for (let i = 0; i < 2; i++) {
                this.lightParticles.push({
                    x: mouseX + random(-10, 10),
                    y: mouseY + random(-10, 10),
                    vx: random(-0.5, 0.5),
                    vy: random(-0.5, 0.5),
                    life: this.PARTICLE_LIFESPAN,
                    initialLife: this.PARTICLE_LIFESPAN,
                });
            }
        }

        noStroke();
        for (let i = this.lightParticles.length - 1; i >= 0; i--) {
            let p = this.lightParticles[i];
            p.life--;
            p.x += p.vx;
            p.y += p.vy;

            if (p.life <= 0) {
                this.lightParticles.splice(i, 1);
                continue;
            }

            const lifeRatio = p.life / p.initialLife;
            const currentSize = this.PARTICLE_INITIAL_SIZE * lifeRatio;
            const currentAlpha = 255 * lifeRatio;
            fill(255, currentAlpha);
            ellipse(p.x, p.y, currentSize, currentSize);
        }
    }

    // --- 유틸리티 함수 ---

    isMouseOver(rectObj) {
        return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w && 
                mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h);
    }

    handleWindowResized() {
        this.setupUIElements();
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
    }

    // --- 배경 요소 생성 및 그리기 함수 ---

    generateConstellations() {
        const originalConstellations = [[{s:[[200,150],[300,180],[400,160],[500,200],[480,280],[400,300],[350,250]],c:[[0,1],[1,2],[2,3],[3,4],[3,6],[5,6]]}, {s:[[1600,100],[1650,150],[1700,130],[1750,160],[1800,140]],c:[[0,1],[1,2],[2,3],[3,4]]}, {s:[[1000,400],[1050,450],[1100,400],[1050,550],[1000,600],[1100,600]],c:[[0,1],[1,2],[1,3],[3,4],[3,5]]}]];
        const scaleX = width / this.ORIGINAL_WIDTH;
        const scaleY = height / this.ORIGINAL_HEIGHT;
        this.constellations = [];
        for (const c of originalConstellations[0]) {
            let newConstellation = { stars: [], connections: c.c };
            for (const s of c.s) {
                newConstellation.stars.push([s[0] * scaleX, s[1] * scaleY]);
            }
            this.constellations.push(newConstellation);
        }
    }

    generateGeneralStars() {
        this.generalStars = [];
        const scale = Math.min(width / this.ORIGINAL_WIDTH, height / this.ORIGINAL_HEIGHT);
        for (let i = 0; i < this.NUM_GENERAL_STARS; i++) {
            this.generalStars.push({
                x: random(width),
                y: random(height),
                size: random(1, 3.5) * scale,
                alpha: random(80, 200)
            });
        }
    }

    updateSkyMovement() {
        this.skyOffsetX = (this.skyOffsetX + this.constellationMoveSpeedX + width) % width;
        this.skyOffsetY = (this.skyOffsetY + this.constellationMoveSpeedY + height) % height;
    }

    drawGeneralStarsSet() {
        noStroke();
        for (const s of this.generalStars) {
            fill(255, s.alpha);
            ellipse(s.x, s.y, s.size, s.size);
        }
    }

    drawConstellationSet() {
        const scale = Math.min(width / this.ORIGINAL_WIDTH, height / this.ORIGINAL_HEIGHT);
        for (const c of this.constellations) {
            stroke(180, 210, 255, 100);
            strokeWeight(1 * scale);
            for (const conn of c.connections) {
                line(c.stars[conn[0]][0], c.stars[conn[0]][1], c.stars[conn[1]][0], c.stars[conn[1]][1]);
            }
            noStroke();
            for (const star of c.stars) {
                fill(210, 225, 255, 220);
                ellipse(star[0], star[1], 4 * scale, 4 * scale);
                fill(180, 210, 255, 40); // Glow effect
                ellipse(star[0], star[1], 10 * scale, 10 * scale);
            }
        }
    }

    // ⭐ 3. 요청하신 대로 클래스 맨 마지막에 추가된 함수입니다.
    /**
     * 마우스 움직임 이벤트를 처리합니다.
     * 현재는 특별한 기능이 없지만, 추후 확장을 위해 자리를 마련해 둡니다.
     */
    handleMouseMoved() {
        // 현재는 마우스 움직임에 반응할 기능이 없으므로 비워둡니다.
    }
}
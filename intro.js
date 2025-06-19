class IntroScene {
    // --- 생성자 ---
    constructor(images, sounds, onComplete) {
        this.images = images;
        this.sounds = sounds;
        this.onComplete = onComplete;

        // ─────── 1. 상수 (Constants) ────────
        // 원본 캔버스 크기
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;

        // 애니메이션 및 전환 시간 (밀리초)
        this.FADE_DURATION = 1500;
        this.TRANSITION_DURATION = 3000;
        this.KEEPER_FADE_DURATION = 500;
        this.FADE_OUT_DURATION = 1500;

        // 타이핑 속도
        this.MONOLOGUE_TYPING_SPEED = 80;
        this.DIALOGUE_TYPING_SPEED = 50;

        // 하늘 배경 요소 관련
        this.CONSTELLATION_MOVE_SPEED_X_RATIO = 0.1 / this.ORIGINAL_WIDTH;
        this.CONSTELLATION_MOVE_SPEED_Y_RATIO = 0.03 / this.ORIGINAL_HEIGHT;
        this.NUM_GENERAL_STARS = 250;

        // 타이틀 화면 빛 효과 상수
        this.TITLE_GLOW_PULSE_SPEED = 2000;
        this.TITLE_GLOW_MIN_BLUR = 7;
        this.TITLE_GLOW_MAX_BLUR = 15;
        this.TITLE_GLOW_MIN_ALPHA = 150;
        this.TITLE_GLOW_MAX_ALPHA = 210;
        
        // UI 투명도
        this.TEXT_BOX_ALPHA = 220;
        this.AURA_FADE_IN_DURATION = 2000;

        // ─────── 2. 상태 관리 (State Management) ────────
        this.gameState = 'TITLE'; // 시작 상태: TITLE, MONOLOGUE, MAIN_MENU, INTRO 등
        this.isFading = false;
        this.isTyping = false;
        this.showInstruction = true; // 독백 장면의 안내 문구 표시 여부

        // ─────── 3. UI 요소 위치/크기 (UI Rectangles) ────────
        this.titleRect = {};
        this.startButtonRect = {};
        this.workshopRect = {};
        this.dialogueBoxRect = {};
        this.arrowRect = {};
        this.keeperRect = {};

        // ─────── 4. 애니메이션 및 효과 변수 (Animation & Effects) ────────
        this.fadeAlpha = 0;
        this.fadeStartTime = 0;
        this.transitionStartTime = 0;
        this.fadeOutStartTime = 0;
        this.auraFadeInStartTime = 0;

        // 하늘 및 별
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
        this.constellationMoveSpeedX = 0;
        this.constellationMoveSpeedY = 0;
        this.constellations = [];
        this.generalStars = [];
        this.shootingStars = [];

        // 빛 효과
        this.glowNoiseSeed = random(1000);
        this.glowNoiseSpeed = 0.009;

        // 독백/대화 진행
        this.monologueStartTime = 0;
        this.monologueIndex = 0;
        this.dialogueIndex = 0;
        this.currentCharIndex = 0;
        this.lastCharTime = 0;

        // 독백 안내 문구 애니메이션
        this.instructionAlpha = 0;
        this.instructionY = 0;
        
        // 공방지기 이미지 전환
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;

        // ─────── 5. 콘텐츠 (Content) ────────
        this.monologueDialogues = [
        "눈을 뜨니... 온통 칠흑 같은 어둠과 별 뿐이다.",
        "내가 왜 여기에 있는 거지? 나는... 분명히...",
        "저 멀리 희미한 불빛이... 작은 오두막인가?"
        ];

        this.dialogues = [
            { speaker: "나", text: "계세요...? 저... 실례합니다만...", image: null },
            { speaker: "공방지기", text: "어서 오세요. 당신을 기다리고 있었습니다. 많이 놀라셨을 테지요?", image: 'keeper_normal' },
            { speaker: "나", text: "여긴... 대체 어디죠? 저는 분명... 눈을 떠보니 낯선 곳에... 별빛이 가득하네요...", image: null },
            { speaker: "공방지기", text: "당신은 삶의 여정을 마친 영혼들이 쉬어가는 곳, 사후세계에 도착했습니다.", image: 'keeper_normal' },
            { speaker: "나", text: "아... 그렇군요... 하지만 이곳은... 제가 상상했던 사후세계와는 조금 다른 것 같은데요. 이 반짝이는 것들은 다 뭐죠?", image: null },
            { speaker: "공방지기", text: "이곳은 '별자리 공방', 당신을 그리워하는 이들의 간절한 마음이 모여 비로소 이곳의 불을 밝히지요.", image: 'keeper_talk1' },
            { speaker: "공방지기", text: "당신이 여기 있다는 건, 그만큼 당신이 빛나는 존재였다는 뜻입니다.", image: 'keeper_talk1' },
            { speaker: "나", text: "제가... 빛나는 존재였다고요? ...그럼 이 공방에서는 무엇을 하나요?", image: null },
            { speaker: "공방지기", text: "이곳에서는 당신의 삶, 그 소중한 기억의 조각들을 모읍니다. 당신의 웃음과 눈물, 사랑과 꿈...", image: 'keeper_talk1' },
            { speaker: "공방지기", text: "그 모든 빛나는 순간들을 모아서, 밤하늘에 영원히 빛날 당신만의 별자리를 만들어 드린답니다.", image: 'keeper_talk1' },
            { speaker: "나", text: "저만의 별자리라... 저는 그럼 어떻게 하면 될까요...?", image: null },
            { speaker: "공방지기", text: "어려울 것 없습니다. 제가 드리는 질문에 당신의 삶을 가장 잘 나타낸다고 생각하는 답을 골라주시면 됩니다.", image: 'keeper_talk3' },
            { speaker: "공방지기", text: "완벽할 필요는 없습니다. 당신의 진실된 이야기가 곧 별이 될 테니까요.", image: 'keeper_talk3' }
        ];

        this.setup();
    }

    /**
     * Scene 초기 설정을 담당합니다.
     * UI 요소, 별, 효과음 등을 설정합니다.
     */
    setup() {
        imageMode(CENTER);
        textAlign(LEFT, TOP);
        textFont('Malgun Gothic, Apple SD Gothic Neo, sans-serif');
        
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        
        this.setupUIElements();
        this.generateConstellations();
        this.generateGeneralStars();
        
        if (this.images.workshopImg) {
            this.images.workshopImg.loadPixels();
        }
    }

    /**
     * 게임의 메인 드로잉 루프입니다. gameState에 따라 적절한 화면을 그립니다.
     */
    draw() {
        switch (this.gameState) {
            case 'TITLE':
                this.glowNoiseSeed += this.glowNoiseSpeed;
                if (this.sounds.bgm1 && !this.sounds.bgm1.isPlaying()) {
                    this.sounds.bgm1.loop();
                    this.sounds.bgm1.setVolume(1);
                }
                this.drawTitleScreen();
                break;
            case 'FADE_TO_MONOLOGUE':
                this.drawFade('TITLE_FADE_OUT');
                break;
            case 'MONOLOGUE':
                if (this.sounds.bgm1) this.sounds.bgm1.setVolume(0.3, 0.5); // 0.5초에 걸쳐 부드럽게 조절
                this.drawMonologueScreen();
                break;
            case 'FADE_TO_MAIN':
                this.drawFade('MONOLOGUE_FADE_OUT');
                break;
             case 'MAIN_MENU_FADE_IN':
                if (this.sounds.bgm1) this.sounds.bgm1.setVolume(1, 0.5);
                this.updateSkyMovement();
                this.drawMainMenu();    
                this.drawFade('MAIN_MENU_FADE_IN');
                break;
            case 'MAIN_MENU':
                if (this.sounds.bgm1) this.sounds.bgm1.setVolume(1, 0.5);
                this.updateSkyMovement();
                this.drawMainMenu();
                break;
            case 'TRANSITION_TO_INTRO':
                this.drawTransition();
                break;
            case 'INTRO':
                textAlign(LEFT, TOP);
                this.drawIntroScene();
                break;
            case 'FADING_OUT_WHITE':
                textAlign(LEFT, TOP);
                this.drawFadeOutWhite();
                break;
        }
    }

    // --- 입력 처리 (Input Handlers) ---

// intro.js 파일의 handleMousePressed 함수를 아래 코드로 교체해주세요.

    handleMousePressed() {
        switch (this.gameState) {
            case 'TITLE':
                if (this.isMouseOver(this.startButtonRect)) {
                    if (this.sounds.click) this.sounds.click.play();
                    this.startFade('FADE_TO_MONOLOGUE');
                } 
                else { 
                    this.shootingStars.push(new ShootingStar());
                
                    if (this.sounds.shootingStar) {
                        this.sounds.shootingStar.play();
                    }
                }
                break;
            case 'MONOLOGUE':
                this._advanceMonologue();
                break;
            case 'MAIN_MENU':
                if (this.isMouseOverPixelPerfect(this.images.workshopImg, this.workshopRect)) {
                    if (this.sounds.door) this.sounds.door.play();
                    if (this.sounds.aura && this.sounds.aura.isPlaying()) this.sounds.aura.stop();
                    if (this.sounds.bgm1) this.sounds.bgm1.fade(0, this.TRANSITION_DURATION / 1000);
                    this.gameState = 'TRANSITION_TO_INTRO';
                    this.transitionStartTime = millis();
                }
                break;
            case 'INTRO':
                if (this.isMouseOver(this.dialogueBoxRect)) {
                    this._advanceDialogue();
                }
                break;
        }
    }
    
    handleKeyPressed() {
        if (keyCode !== 32) return; // 스페이스바가 아니면 무시

        switch (this.gameState) {
            case 'MONOLOGUE':
                this._advanceMonologue();
                break;
            case 'INTRO':
                this._advanceDialogue();
                break;
        }
    }

    // --- 그리기 함수 (Drawing Functions) ---

    /**
     * 타이틀 화면을 그립니다. (배경, 빛나는 타이틀, 시작 버튼)
     */
    drawTitleScreen() {
        image(this.images.startBg, width / 2, height / 2, width, height);
        this.updateAndDrawShootingStars();
        this.drawTitleGlow();
        image(this.images.title, this.titleRect.x, this.titleRect.y, this.titleRect.w, this.titleRect.h);

        // 마우스 오버 효과
        if (this.isMouseOver(this.startButtonRect)) {
            cursor(HAND);
            tint(255, 255);
        } else {
            cursor(ARROW);
            tint(255, 220);
        }
        image(this.images.startButton, this.startButtonRect.x + this.startButtonRect.w / 2, this.startButtonRect.y + this.startButtonRect.h / 2, this.startButtonRect.w, this.startButtonRect.h);
        noTint();
        
        fill(230);
        textSize(height * 0.035);
        textAlign(CENTER, CENTER);
        text("시작하기", this.startButtonRect.x + this.startButtonRect.w / 2, this.startButtonRect.y + this.startButtonRect.h / 2);
    }
    
    /**
     * 타이틀 이미지의 부드러운 빛 효과를 그립니다.
     */
    drawTitleGlow() {
        // sin() 함수와 millis()를 사용해 시간에 따라 부드럽게 반복되는 값을 생성 (-1 ~ 1)
        let pulse = sin(millis() / this.TITLE_GLOW_PULSE_SPEED);

        // pulse 값에 따라 빛의 번짐(blur)과 투명도(alpha)를 조절
        let blurAmount = map(pulse, -1, 1, this.TITLE_GLOW_MIN_BLUR, this.TITLE_GLOW_MAX_BLUR);
        let alphaValue = map(pulse, -1, 1, this.TITLE_GLOW_MIN_ALPHA, this.TITLE_GLOW_MAX_ALPHA);

        // 빛 배경 그리기
        push();
        drawingContext.filter = `blur(${blurAmount}px)`;
        tint(255, 230, 180, alphaValue);
        // 여러 번 겹쳐 그려 풍부한 빛 효과 생성
        for (let i = 0; i < 4; i++) {
            image(this.images.title, this.titleRect.x, this.titleRect.y, this.titleRect.w, this.titleRect.h);
        }
        pop();
    }
    
    /**
     * 독백 장면을 그립니다. (타이핑 효과, 안내 문구)
     */
      drawMonologueScreen() {
        background(0);

        // 1.25초 딜레이 타이머
        if (this.monologueStartTime > 0 && millis() - this.monologueStartTime > 1250) {
            if (!this.isTyping) {
                this.isTyping = true;
                this.lastCharTime = millis();
                this.monologueStartTime = 0;
            }
        }

        // 안내 문구 애니메이션
        if (this.showInstruction) {
            if(this.monologueStartTime === 0) {
                 this.instructionAlpha = lerp(this.instructionAlpha, 255, 0.05);
                 let targetY = height * 0.9;
                 this.instructionY = lerp(this.instructionY, targetY, 0.05);
            }
        } else {
            this.instructionAlpha = lerp(this.instructionAlpha, 0, 0.1);
        }

        if (this.instructionAlpha > 1) {
            fill(200, this.instructionAlpha);
            textSize(height * 0.025);
            textAlign(CENTER, CENTER);
            text("스페이스바를 누르거나 클릭하세요", width / 2, this.instructionY);
        }

        if (this.isTyping && millis() - this.lastCharTime > this.MONOLOGUE_TYPING_SPEED) {
            if (this.monologueDialogues[this.monologueIndex] && this.currentCharIndex < this.monologueDialogues[this.monologueIndex].length) {
                this.currentCharIndex++;
                this.lastCharTime = millis();
            } else {
                this.isTyping = false;
            }
        }
        
        let textToShow = "";
        if (this.monologueDialogues[this.monologueIndex]) {
            textToShow = this.monologueDialogues[this.monologueIndex].substring(0, this.currentCharIndex);
        }

        fill(255);
        textSize(height * 0.04);
        textAlign(CENTER, CENTER);
        text(textToShow, width / 2, height / 2);
    }
    
    /**
     * 메인 메뉴 화면을 그립니다. (움직이는 하늘, 별, 공방)
     */
    drawMainMenu() {
        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.drawMovingSkyElements();
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);
        this.drawWorkshopGlow();
        if (this.images.workshopImg) image(this.images.workshopImg, this.workshopRect.cx, this.workshopRect.cy, this.workshopRect.w, this.workshopRect.h);
    }

    /**
     * 공방으로 확대되는 전환 효과를 그립니다.
     */
    drawTransition() {
        let elapsedTime = millis() - this.transitionStartTime;
        let progress = constrain(elapsedTime / this.TRANSITION_DURATION, 0, 1);
        let easedProgress = 1 - pow(1 - progress, 3); // EaseOutCubic
        
        let currentScale = lerp(1, 10.0, easedProgress);
        let alphaIn = lerp(0, 255, easedProgress);
    
        // 1. 기존 메인 메뉴 화면을 그립니다.
        if (this.images.mainBackground) image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.drawMovingSkyElements();
        if (this.images.subBackground) image(this.images.subBackground, width / 2, height / 2, width, height);
        
        // 2. 공방 이미지를 확대합니다.
        push();
        translate(this.workshopRect.cx, this.workshopRect.cy);
        scale(currentScale);
        if (this.images.workshopImg) {
            image(this.images.workshopImg, 0, 0, this.workshopRect.w / currentScale, this.workshopRect.h / currentScale);
        }
        pop();
    
        // 3. 화면을 어둡게 덮어 장면 전환을 부드럽게 합니다.
        fill(0, alphaIn * 0.9);
        noStroke();
        rectMode(CORNER);
        rect(0, 0, width, height);
    
        // 4. 새로운 장면(공방 내부)을 서서히 나타나게 합니다.
        let bgImg = this.images.workshopInsideImg;
        if (bgImg && bgImg.width > 0) {
            const dims = this._calculateImageDimensions(bgImg);
            tint(255, alphaIn);
            image(bgImg, width / 2, height / 2, dims.w, dims.h);
            noTint();
        }
    
        // 5. 전환이 완료되면 다음 상태로 넘어갑니다.
 if (progress >= 1) {

        
        // 새로운 BGM(bgm_1)을 재생합니다.
        if (this.sounds.bgm_1 && !this.sounds.bgm_1.isPlaying()) {
            this.sounds.bgm_1.setVolume(2.5); // 볼륨을 1.3배로 설정
            this.sounds.bgm_1.loop();
        }

            this.gameState = 'INTRO';
            this.dialogueIndex = 0;
            const firstDialogue = this.dialogues[0];
            const firstImgKey = firstDialogue.speaker === '공방지기' ? firstDialogue.image : null;
            this.lastKeeperImgKey = firstImgKey;
            this.startNextDialogue();
        }
    }

    /**
     * 공방 내부 대화 장면을 그립니다.
     */
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

        // 공방지기 이미지 페이드 효과
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
    
    /**
     * 대화창과 대화 내용을 그립니다.
     */
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
        
        if (this.dialogueIndex >= this.dialogues.length) return;

        // 타이핑 효과
        let currentDialogue = this.dialogues[this.dialogueIndex];
        
        if (this.isTyping && millis() - this.lastCharTime > this.DIALOGUE_TYPING_SPEED) {
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
        
        if (!this.isTyping) {
            let arrowAlpha = map(sin(millis() * 0.005), -1, 1, 90, 220);
            fill(255, arrowAlpha);
            noStroke();
            let ar = this.arrowRect;
            triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
        }
        imageMode(CENTER);
    }

    /**
     * 상태에 따른 화면 전환 페이드 효과를 처리합니다.
     */
     drawFade(fadeType) {
        let elapsedTime = millis() - this.fadeStartTime;
        let progress = constrain(elapsedTime / this.FADE_DURATION, 0, 1);
        
        if (fadeType === 'TITLE_FADE_OUT') {
            this.drawTitleScreen();
            this.fadeAlpha = lerp(0, 255, progress);
            fill(0, this.fadeAlpha);
            rect(0, 0, width, height);
             if (progress >= 1) {
                this.isFading = false;
                this.gameState = 'MONOLOGUE';
                this.currentCharIndex = 0;
                this.isTyping = false; // 딜레이를 위해 false로 설정
                this.monologueStartTime = millis();
            }
        } else if (fadeType === 'MONOLOGUE_FADE_OUT') {
            background(0);

            let textAlpha = lerp(255, 0, progress);

            let lastMonologue = this.monologueDialogues[this.monologueDialogues.length - 1];
            fill(255, textAlpha);
            textSize(height * 0.04);
            textAlign(CENTER, CENTER);
            text(lastMonologue, width / 2, height / 2);

            if (progress >= 1) {
                this.isFading = false;
                this.startFade('MAIN_MENU_FADE_IN');
            }
        } else if (fadeType === 'MAIN_MENU_FADE_IN') {
             this.drawMainMenu();
             this.fadeAlpha = lerp(255, 0, progress);
             fill(0, this.fadeAlpha);
             rect(0, 0, width, height);
             if (progress >= 1) {
                this.isFading = false;
                this.gameState = 'MAIN_MENU';
                this.auraFadeInStartTime = millis();
             }
        }
    }
    
    /**
     * 인트로 종료 시 하얗게 밝아지는 페이드 아웃 효과를 그립니다.
     */
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
    
    // --- 유틸리티 및 헬퍼 함수 (Utilities & Helpers) ---

    /**
     * 독백을 다음 단계로 진행시킵니다. (타이핑 스킵 또는 다음 독백)
     */
    _advanceMonologue() {
        if (this.isTyping) {
            this.currentCharIndex = this.monologueDialogues[this.monologueIndex].length;
            this.isTyping = false;
        } else {
            if (this.monologueIndex === 0) {
                this.showInstruction = false;
            }

            this.monologueIndex++;
            if (this.monologueIndex >= this.monologueDialogues.length) {
                this.startFade('FADE_TO_MAIN');
            } else {
                this.currentCharIndex = 0;
                this.isTyping = true;
                this.lastCharTime = millis();
            }
        }
    }
    
    /**
     * 대화를 다음 단계로 진행시킵니다. (타이핑 스킵 또는 다음 대화)
     */
    _advanceDialogue() {
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
    
    /**
     * 페이드 상태 전환을 시작합니다.
     * @param {string} fadeType - 시작할 페이드의 종류
     */
    startFade(fadeType) {
        this.isFading = true;
        this.fadeStartTime = millis();
        this.gameState = fadeType;
    }
    
    /**
     * 다음 대화를 시작하기 위해 변수들을 초기화합니다.
     */
    startNextDialogue() {
        const currentDialogue = this.dialogues[this.dialogueIndex];
        if (currentDialogue.speaker === '공방지기') {
            const newImgKey = currentDialogue.image;
            if (newImgKey !== this.lastKeeperImgKey) {
                if (this.lastKeeperImgKey === null && this.sounds.smallLaugh) {
                    this.sounds.smallLaugh.play();
                }
                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                this.currentKeeperImg = this.images[newImgKey];
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = newImgKey;
            }
        }
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
    }
    
    /**
     * 화면 크기가 변경될 때 UI 요소와 별들의 위치/크기를 재설정합니다.
     */
    handleWindowResized() {
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.setupUIElements();
        this.generateConstellations();
        this.generateGeneralStars();
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
    }
    
    /**
     * 화면 크기에 맞춰 UI 요소들의 위치와 크기를 설정합니다.
     */
    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;

        let titleW = width * 0.425;
        let titleH = titleW * (this.images.title.height / this.images.title.width);
        this.titleRect = { x: width / 2, y: height * 0.4, w: titleW, h: titleH };

        let buttonW = width * 0.154; 
        let buttonH = buttonW * (this.images.startButton.height / this.images.startButton.width);
        this.startButtonRect = { x: width / 2 - buttonW / 2, y: height * 0.7, w: buttonW, h: buttonH };
        
        this.instructionY = height * 0.9 + 30;
        
        let workshopOriginalW = 570;
        let workshopH = (workshopOriginalW * scaleX) * (510 / workshopOriginalW);
        this.workshopRect = { 
            w: workshopOriginalW * scaleX, 
            h: workshopH, 
            cx: width / 2, 
            cy: height * (840 / this.ORIGINAL_HEIGHT),
            x: width / 2 - (workshopOriginalW * scaleX) / 2, 
            y: height * (840 / this.ORIGINAL_HEIGHT) - workshopH / 2 
        };

        let keeperOriginalW = 600;
        let keeperH = (keeperOriginalW * scaleX) * (900 / keeperOriginalW);
        this.keeperRect = { x: width / 2, y: height * 5 / 11 + (150 * scaleY), w: keeperOriginalW * scaleX, h: keeperH };

        let dialogueBoxMargin = 50 * scaleX;
        let dialogueBoxH = 300 * scaleY;
        this.dialogueBoxRect = { x: dialogueBoxMargin, y: height - dialogueBoxH - (30 * scaleY), w: width - (2 * dialogueBoxMargin), h: dialogueBoxH };

        let arrowSize = 40 * Math.min(scaleX, scaleY);
        this.arrowRect = { x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (125 * scaleX), y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (90 * scaleY), w: arrowSize, h: arrowSize };
    }
    
    // --- 하늘 배경 관련 함수 ---

    updateSkyMovement() {
        this.skyOffsetX = (this.skyOffsetX + this.constellationMoveSpeedX + width) % width;
        this.skyOffsetY = (this.skyOffsetY + this.constellationMoveSpeedY + height) % height;
    }
    
    updateAndDrawShootingStars() {
        for (let i = this.shootingStars.length - 1; i >= 0; i--) {
            let star = this.shootingStars[i];
            star.update();
            star.draw();
            if (star.isFinished()) {
                this.shootingStars.splice(i, 1);
            }
        }
    }

    drawMovingSkyElements() {
        push();
        translate(this.skyOffsetX, this.skyOffsetY);
        // 화면을 벗어나도 별이 끊기지 않도록 주변에 복사하여 그립니다.
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
        
        // 마우스 거리에 따른 빛 효과
        let glowAlpha = constrain(map(d, 0, maxDist, 30, 0), 0, 30);
        if (glowAlpha > 0) {
            let glowSizeFactor = constrain(map(d, 0, maxDist, 1.3, 1.0), 1.0, 1.3);
            let glowSize = baseW * glowSizeFactor;
            noStroke();
            for (let i = 6; i > 0; i--) {
                let ratio = i / 6;
                fill(255, 255, 220, glowAlpha * pow(ratio, 3));
                ellipse(cx, cy, lerp(baseW * 0.8, glowSize, ratio), lerp(baseW * 0.8, glowSize, ratio));
            }
        }
        
        if (this.sounds.aura) {
            if (this.gameState !== 'MAIN_MENU') {
                if (this.sounds.aura.isPlaying()) this.sounds.aura.stop();
                return;
            }

            let targetVolume = constrain(map(d, 0, maxDist, 0.8, 0.0), 0.0, 1.4);
            let finalVolume = targetVolume;

            if (this.auraFadeInStartTime > 0) {
                let fadeElapsedTime = millis() - this.auraFadeInStartTime;
                let fadeProgress = constrain(fadeElapsedTime / this.AURA_FADE_IN_DURATION, 0, 1);
                
                finalVolume = targetVolume * fadeProgress;

                if (fadeProgress >= 1) {
                    this.auraFadeInStartTime = 0; 
                }
            }

            if (!this.sounds.aura.isPlaying()) {
                this.sounds.aura.setVolume(finalVolume, 0); 
                this.sounds.aura.loop();
            } else {
                this.sounds.aura.setVolume(finalVolume, 0.15);
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
    
    isMouseOver(rectObj) {
        return (mouseX >= rectObj.x && mouseX <= rectObj.x + rectObj.w &&
                mouseY >= rectObj.y && mouseY <= rectObj.y + rectObj.h);
    }

    /**
     * 이미지의 투명한 부분을 제외하고 픽셀 단위로 마우스오버를 감지합니다.
     */
    isMouseOverPixelPerfect(img, rect) {
        if (!this.isMouseOver(rect)) return false;
        if (!img || !img.pixels || img.pixels.length === 0) return false;

        const localX = mouseX - rect.x;
        const localY = mouseY - rect.y;
        const originalX = Math.floor(map(localX, 0, rect.w, 0, img.width));
        const originalY = Math.floor(map(localY, 0, rect.h, 0, img.height));
        const alphaIndex = (originalY * img.width + originalX) * 4 + 3;
        const alpha = img.pixels[alphaIndex];

        return alpha > 10;
    }
    
    /**
     * Scene의 상태를 초기화하여 다시 시작할 수 있도록 합니다.
     */
    reset() {
        if (this.sounds.bgm1 && this.sounds.bgm1.isPlaying()) this.sounds.bgm1.stop();
        if (this.sounds.bgm2 && this.sounds.bgm2.isPlaying()) this.sounds.bgm2.stop();
        
        this.gameState = 'TITLE';
        this.dialogueIndex = 0;
        this.monologueIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = false;
        this.showInstruction = true;
        this.instructionAlpha = 0;
        this.instructionY = height * 0.9 + 30;
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.lastKeeperImgKey = null;
        this.skyOffsetX = 0;
        this.skyOffsetY = 0;
    }
}


/**
 * 타이틀 화면에 나타나는 별똥별 효과를 담당하는 클래스입니다.
 */
// intro.js 파일의 ShootingStar 클래스를 찾아 아래 내용으로 교체해주세요.

/**
 * 타이틀 화면에 나타나는 별똥별 효과를 담당하는 클래스입니다.
 */
class ShootingStar {
    constructor() {
        // 1. 시작점을 화면의 위쪽 또는 왼쪽 가장자리에서 무작위로 선택
        if (random() > 0.5) {
            // 위쪽 가장자리에서 시작
            this.x = random(width);
            this.y = -10;
        } else {
            // 왼쪽 가장자리에서 시작
            this.x = -10;
            this.y = random(height);
        }

        // ⭐ [핵심 수정] 끝점은 항상 시작점 기준으로 오른쪽 아래를 향하도록 설정
        // 이렇게 하면 모든 별똥별의 방향이 일관되게 유지됩니다.
        const travelDistanceX = random(width * 0.8, width * 1.5);
        const travelDistanceY = random(height * 0.8, height * 1.5);
        this.endX = this.x + travelDistanceX;
        this.endY = this.y + travelDistanceY;

        this.speed = random(12, 22);
        this.history = [];
        this.trailLength = 25;
    }

    update() {
        let dirX = this.endX - this.x;
        let dirY = this.endY - this.y;
        let d = dist(this.x, this.y, this.endX, this.endY);

        if (d > 1) {
            this.x += (dirX / d) * this.speed;
            this.y += (dirY / d) * this.speed;
        }

        this.history.push(createVector(this.x, this.y));
        if (this.history.length > this.trailLength) {
            this.history.splice(0, 1);
        }
    }

    draw() {
        // 꼬리 그리기
        for (let i = 1; i < this.history.length; i++) {
            let pos1 = this.history[i-1];
            let pos2 = this.history[i];
            let alpha = map(i, 0, this.history.length, 0, 150);
            stroke(180, 210, 255, alpha);
            strokeWeight(map(i, 0, this.history.length, 1, 3));
            line(pos1.x, pos1.y, pos2.x, pos2.y);
        }

        // 머리 그리기
        noStroke();
        fill(255, 255, 255, 255);
        ellipse(this.x, this.y, 8, 8);
        
        fill(180, 210, 255, 200);
        rectMode(CENTER);
        rect(this.x, this.y, 20, 4);
        rect(this.x, this.y, 4, 20);
        rectMode(CORNER);
    }
    
    isFinished() {
        // 별똥별이 화면 밖으로 완전히 벗어났는지 확인
        return this.x > width + 50 || this.y > height + 50 || this.x < -50 || this.y < -50;
    }
}
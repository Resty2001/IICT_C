class OutroScene {
    constructor(images, sounds, onComplete) {
        this.images = images;
        this.sounds = sounds;
        this.onComplete = onComplete;

        // --- 상수 ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
        this.TYPING_SPEED = 50;
        this.TEXT_BOX_ALPHA = 240;
        this.FADE_DURATION = 2000;
        this.KEEPER_FADE_DURATION = 500;

        // --- ★ [수정] 상태 관리 단순화 ---
        this.sceneState = 'MAIN_DIALOGUE'; // 시작 상태를 MAIN_DIALOGUE로 변경
        this.dialogueIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = 0;
        this.fadeStartTime = 0;

        // --- UI 요소 ---
        this.dialogueBoxRect = {};
        this.endButtonRect = {}; // Yes/No 버튼은 더 이상 필요 없으므로 제거
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
        
        // --- 마우스 꼬리 효과 변수 ---
        this.lightParticles = [];
        this.PARTICLE_LIFESPAN = 60; // 파티클 수명 (프레임)
        this.PARTICLE_INITIAL_SIZE = 8; // 파티클 초기 크기

        this.finalConstellationImage = null;
        this.qrCodeDownloadUrl = null;
        this.generatedQRImage = null;

        // --- ★ [수정] 새로운 통합 대화 내용 ---
        this.mainDialogue = [
            { speaker: "나", text: "와... 이게 바로... 저의 별자리군요." },
            { speaker: "공방지기", text: "그렇습니다. 사람들이 밤하늘을 올려다볼 때마다, 그들은 당신의 빛나는 이야기를 기억하고, 또 위로받게 될 거예요.", image: 'keeper_smile2' },
            { speaker: "나", text: "아… 이렇게라도 모두와 이어져 있게 해주셔서, 정말 감사합니다." },
            { speaker: "공방지기", text: "이제 이곳에서의 당신의 역할은 끝났습니다.", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "당신의 별자리는 밤하늘에서 제 몫을 다할 것이고, 당신은 이제 새로운 여정을 떠나야 합니다.", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "부디 평안하세요.", image: 'keeper_smile1' }
        ];

        this.setup();
    }
    
    setFinalConstellationImage(img) {
        this.finalConstellationImage = img;
    }
    
    setQRCodeUrl(url) {
        this.qrCodeDownloadUrl = url;
        this.generateQRCode();
    }

// ⭐ 2. 이 함수 전체를 교체해주세요.
generateQRCode() {
    console.log("[QR 생성 시작]");
    if (!this.qrCodeDownloadUrl) {
        console.error("QR 생성을 위한 URL이 없습니다.");
        return;
    }
    // 이제 URL이 짧아졌으므로 길이는 문제가 되지 않습니다.
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

    setup() {
        this.setupUIElements();
        this.constellationMoveSpeedX = width * this.CONSTELLATION_MOVE_SPEED_X_RATIO;
        this.constellationMoveSpeedY = height * this.CONSTELLATION_MOVE_SPEED_Y_RATIO;
        this.generateConstellations();
        this.generateGeneralStars();
        
        const firstKeeperDialogue = this.mainDialogue.find(d => d.image);
        if (firstKeeperDialogue) {
            this.currentKeeperImg = this.images[firstKeeperDialogue.image];
            this.lastKeeperImgKey = firstKeeperDialogue.image;
        }
        this.lastCharTime = millis();
    }

     reset() {
        this.sceneState = 'MAIN_DIALOGUE';
        this.dialogueIndex = 0;
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
        this.fadeStartTime = 0;
        
        // 이미지 및 URL 정보도 깨끗하게 초기화
        this.finalConstellationImage = null;
        this.generatedQRImage = null;
        this.qrCodeDownloadUrl = null;

        // 공방지기 이미지도 첫 번째 상태로 초기화
        const firstKeeperDialogue = this.mainDialogue.find(d => d.image);
        if (firstKeeperDialogue) {
            this.currentKeeperImg = this.images[firstKeeperDialogue.image];
            this.lastKeeperImgKey = firstKeeperDialogue.image;
            this.previousKeeperImg = null;
        }
        this.setupUIElements();
        console.log("OutroScene 상태가 초기화되었습니다.");
    }

    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH, scaleY = height / this.ORIGINAL_HEIGHT, avgScale = (scaleX + scaleY) / 2;
        this.keeperRect = { x: width / 2, y: height * 5 / 11 + (150 * scaleY), w: 600 * scaleX, h: 900 * scaleX };
        this.dialogueBoxRect = { x: 50 * scaleX, y: height - 330 * scaleY, w: width - (100 * scaleX), h: 300 * scaleY };
        
        // --- ★ [수정] 종료 버튼만 설정 ---
        let endButtonW = 220 * scaleX * 0.9;
        let endButtonH = 80 * scaleY * 0.85;
        this.endButtonRect = { x: width / 2 - (endButtonW / 2), y: height - (150 * scaleY), w: endButtonW, h: endButtonH };
        
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

        if (isFinalScene) {
            this.updateAndDrawLightTrail();
        }

        // --- ★ [수정] switch 문 단순화 ---
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
        
        if (this.sceneState === 'FINAL_SCREEN') {
            let progress = constrain((millis() - this.fadeStartTime) / (this.FADE_DURATION / 1.5), 0, 1);
            if (progress < 1) {
                fill(255, lerp(255, 0, progress)); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
            }
        } else if (this.sceneState === 'FADING_OUT_TO_WHITE') {
            this.drawFadeOverlay(true);
        }
    }

    handleMousePressed() {
        if (this.isTyping) { this.currentCharIndex = 999; this.isTyping = false; return; }
        
        // --- ★ [수정] 마우스 클릭 로직 단순화 ---
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

    drawFadeOverlay(isFadingOut) {
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        let alpha = lerp(0, 255, progress);
        fill(255, alpha); noStroke(); rectMode(CORNER); rect(0, 0, width, height);

        if (progress >= 1) {
            if (isFadingOut) {
                this.onComplete();
            } else { 
                if (this.sounds.bgm3 && this.sounds.bgm3.isPlaying()) this.sounds.bgm3.stop();
                if (this.sounds.bgm4 && !this.sounds.bgm4.isPlaying()) this.sounds.bgm4.loop();
                
                this.sceneState = 'FINAL_SCREEN'; 
                this.fadeStartTime = millis();
                this.lightParticles = [];
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

    drawFadeToWhite() {
        this.drawWorkshopBackground();
        this.drawKeeperImage(); 
        // 마지막 대사로 고정
        this.drawDialogueBox(this.mainDialogue[this.mainDialogue.length - 1]);
        this.drawFadeOverlay(false);
    }
    
    // --- ★ [전면 수정] 마지막 화면 그리기 함수 ---
    drawFinalScreen() {
    let elapsedTime = millis() - this.fadeStartTime;
    imageMode(CENTER);

    // --- 1. 왼쪽 중앙에 별자리 카드(스크린샷) 그리기 ---
    if (this.finalConstellationImage) {
        const cardFadeInStart = 1000;
        const cardFadeInDuration = 2000;
        let cardAlpha = 0;
        if (elapsedTime > cardFadeInStart) {
            cardAlpha = lerp(0, 255, constrain((elapsedTime - cardFadeInStart) / cardFadeInDuration, 0, 1));
        }

        if (cardAlpha > 0) {
            // --- [수정된 부분] 카드 크기 계산 로직 ---
            const availableWidth = width * 0.4;
            const availableHeight = height * 0.8;
            const cardAspectRatio = this.finalConstellationImage.width / this.finalConstellationImage.height;
            
            let cardW = availableWidth;
            let cardH = cardW / cardAspectRatio;

            if (cardH > availableHeight) {
                cardH = availableHeight;
                cardW = cardH * cardAspectRatio;
            }
            // --- 여기까지가 수정된 부분 ---

            let cardX = width / 4;
            let cardY = height / 2;

            tint(255, cardAlpha);
            image(this.finalConstellationImage, cardX, cardY, cardW, cardH);
            noTint();
        }
    }
    
    // --- 2. 오른쪽 중앙에 QR 코드 그리기 ---
    if (this.generatedQRImage) {
        const qrFadeInStart = 1500;
        const qrFadeInDuration = 2000;
        let qrAlpha = 0;
        if (elapsedTime > qrFadeInStart) {
            qrAlpha = lerp(0, 255, constrain((elapsedTime - qrFadeInStart) / qrFadeInDuration, 0, 1));
        }
        
        if (qrAlpha > 0) {
            let qrSize = min(width / 5, height / 3);
            let qrX = width * 3 / 4;
            let qrY = height / 2;

            tint(255, qrAlpha);
            image(this.generatedQRImage, qrX, qrY, qrSize, qrSize);
            noTint();
        }
    }

    // --- 3. 하단에 종료 버튼 그리기 ---
    const buttonDelay = 4000;
    const buttonFadeDuration = 1500;
    let buttonAlpha = 0;
    if (elapsedTime > buttonDelay) {
        buttonAlpha = lerp(0, 255, constrain((elapsedTime - buttonDelay) / buttonFadeDuration, 0, 1));
    }
    
    if (buttonAlpha > 0) {
        let scale = width / this.ORIGINAL_WIDTH;
        let textSizeVal = 32 * scale;
        let isHovering = this.isMouseOver(this.endButtonRect);
        let imageTint = isHovering ? buttonAlpha : buttonAlpha * 0.85; 
        let textBrightness = isHovering ? 255 : 220;
        
        push();
        tint(255, imageTint);
        image(this.images.buttonBg, this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2, this.endButtonRect.w, this.endButtonRect.h);
        pop();

        fill(textBrightness, buttonAlpha);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(textSizeVal);
        text("종료하기", this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2);
        textAlign(LEFT, TOP);
    }
    rectMode(CORNER);
}
    
    // --- ★ [수정] 부유하는 별자리 제거 ---
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
        // 아래 if문에서 drawFinalConstellation() 호출을 제거했습니다.
        pop();
    }


    advanceDialogue(dialogues, nextState) {
        this.dialogueIndex++;
        if (this.dialogueIndex >= dialogues.length) {
            this.sceneState = nextState;
            this.dialogueIndex = 0; // 혹시 모르니 초기화
            this.fadeStartTime = millis();
            this.resetTyping(null);
            if (nextState === 'FADING_TO_WHITE' && this.sounds.transition) {
                this.sounds.transition.play();
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

    updateAndDrawLightTrail() {
        if (dist(mouseX, mouseY, pmouseX, pmouseY) > 1) {
            for (let i = 0; i < 2; i++) {
                this.lightParticles.push({
                    x: mouseX + random(-10, 10), y: mouseY + random(-10, 10),
                    vx: random(-0.5, 0.5), vy: random(-0.5, 0.5),
                    life: this.PARTICLE_LIFESPAN, initialLife: this.PARTICLE_LIFESPAN,
                });
            }
        }

        noStroke();
        for (let i = this.lightParticles.length - 1; i >= 0; i--) {
            let p = this.lightParticles[i];
            p.life--; p.x += p.vx; p.y += p.vy;
            if (p.life <= 0) { this.lightParticles.splice(i, 1); continue; }
            let lifeRatio = p.life / p.initialLife;
            let currentSize = this.PARTICLE_INITIAL_SIZE * lifeRatio;
            let currentAlpha = 255 * lifeRatio;
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
    // ⭐ 3. 클래스 맨 마지막에 이 함수를 추가해주세요.
    handleMouseMoved() {
        // 현재는 마우스 움직임에 반응할 기능이 없으므로 비워둡니다.
    }
}


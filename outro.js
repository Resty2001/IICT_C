class OutroScene {
    constructor(images, onComplete) {
        this.images = images;
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

        // --- 디졸브 효과 변수 ---
        this.currentKeeperImg = null;
        this.previousKeeperImg = null;
        this.keeperFadeStartTime = 0;
        this.lastKeeperImgKey = null;

        // --- 엔딩 배경 변수 ---
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
            { speaker: "공방지기", text: "그렇습니다. 사람들이 밤하늘을 올려다볼 때마다, 그들은 당신의 빛나는 이야기를 기억하고, 또 위로받게 될 거예요.", image: 'keeper_smile2' },
            { speaker: "나", text: "아..." },
            { speaker: "공방지기", text: "당신의 별자리는 이제 영원히 저 하늘에 빛나겠지만... 그 기억을 당신의 영혼에도 깊이 새기고 싶지 않으신가요?", image: 'keeper_talk2' },
            { speaker: "공방지기", text: "원하신다면, 이 별자리를 당신의 마음에 간직할 수 있도록 도와드리겠습니다.", image: 'keeper_talk2' }
        ];
        this.qrDialogue = { speaker: "공방지기", text: "좋습니다. 이제 당신의 이야기는 당신의 영혼 속에, 그리고 저 밤하늘에 영원히 함께할 것입니다.", image: 'keeper_smile1' };
        this.noDialogue = { speaker: "공방지기", text: "괜찮습니다. 때로는 그저 밤하늘을 올려다보는 것으로 충분한 분들도 계시지요.", image: 'keeper_talk3' };
        this.endingMonologue = [
            { speaker: "공방지기", text: "이제 이곳에서의 당신의 역할은 끝났습니다." },
            { speaker: "공방지기", text: "당신의 별자리는 밤하늘에서 제 몫을 다할 것이고, 당신은 이제 새로운 여정을 떠나야 합니다." },
            { speaker: "공방지기", text: "부디 평안하세요." }
        ];

        this.setup();
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

    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        let avgScale = (scaleX + scaleY) / 2;

        this.keeperRect = { x: width / 2, y: height / 2 + (150 * scaleY), w: 600 * scaleX, h: 900 * scaleX };
        this.dialogueBoxRect = { x: 50 * scaleX, y: height - 330 * scaleY, w: width - (100 * scaleX), h: 300 * scaleY };
        
        // 4. 선택지 버튼 위치를 대화창 위로 조정
        let buttonW = 300 * scaleX;
        let buttonH = 100 * scaleY;
        let buttonY = this.dialogueBoxRect.y - buttonH - 20 * scaleY;
        let buttonGap = 50 * scaleX;
        this.yesButtonRect = { x: width / 2 - buttonW - buttonGap, y: buttonY, w: buttonW, h: buttonH };
        this.noButtonRect = { x: width / 2 + buttonGap, y: buttonY, w: buttonW, h: buttonH };
        
        let endButtonW = 220 * scaleX;
        this.endButtonRect = { x: width / 2 - (endButtonW / 2), y: height - (150 * scaleY), w: endButtonW, h: 80 * scaleY };
        
        // 1. 화살표 위치를 왼쪽으로 조금 이동
        let arrowSize = 40 * avgScale;
        this.arrowRect = { 
            x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (120 * scaleX), 
            y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (80 * scaleY), 
            w: arrowSize, 
            h: arrowSize 
        };
    }

    draw() {
        if (this.sceneState === 'FINAL_SCREEN' || this.sceneState === 'FADING_OUT_TO_WHITE') {
            this.drawNightSkyBackground();
        } else {
            this.drawWorkshopBackground();
        }

        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE':
                this.drawDialogueScene(this.initialDialogues, true); break;
            case 'CHOICE':
                // 4. 선택지 UI 개선
                this.drawDialogueScene(this.initialDialogues, true);
                this.drawChoiceButtons();
                break;
            case 'QR_CODE_PATH':
                this.drawQRCodeScene(); break;
            case 'NO_THANKS_PATH':
                this.drawDialogueScene([this.noDialogue], true); break;
            case 'ENDING_MONOLOGUE':
                this.drawDialogueScene(this.endingMonologue, false); break;
            case 'FADING_TO_WHITE':
                this.drawFadeToWhite(false); break;
            case 'FINAL_SCREEN':
                this.drawFinalScreen(); break;
            case 'FADING_OUT_TO_WHITE':
                this.drawFadeToWhite(true); break;
        }
    }

    handleMousePressed() {
        if (this.isTyping) {
            this.currentCharIndex = 999;
            this.isTyping = false;
            return;
        }

        switch (this.sceneState) {
            case 'INITIAL_DIALOGUE':
                this.advanceDialogue(this.initialDialogues, 'CHOICE'); break;
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
            case 'NO_THANKS_PATH':
                this.sceneState = 'ENDING_MONOLOGUE';
                this.resetTyping(this.endingMonologue[0]);
                break;
            case 'ENDING_MONOLOGUE':
                this.advanceDialogue(this.endingMonologue, 'FADING_TO_WHITE'); break;
            case 'FINAL_SCREEN':
                if (this.isMouseOver(this.endButtonRect)) {
                    this.sceneState = 'FADING_OUT_TO_WHITE';
                    this.fadeStartTime = millis();
                }
                break;
        }
    }
    
    drawWorkshopBackground() {
        let bgImg = this.images.workshopInsideImg;
        if (bgImg) {
            let canvasRatio = width / height;
            let imgRatio = bgImg.width / bgImg.height;
            let imgW, imgH;
            if (canvasRatio > imgRatio) { imgW = width; imgH = imgW / imgRatio; } 
            else { imgH = height; imgW = imgH * imgRatio; }
            image(bgImg, width / 2, height / 2, imgW, imgH);
        } else { background(10, 0, 20); }
    }

    drawNightSkyBackground() {
        image(this.images.mainBackground, width / 2, height / 2, width, height);
        this.updateSkyMovement();
        this.drawMovingSkyElements();
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
        // 4. 선택지 화면에서 마지막 대사가 계속 보이도록 처리
        let dialogueToShow = this.sceneState === 'CHOICE' ? dialogues[dialogues.length - 1] : dialogues[this.dialogueIndex];
        this.drawDialogueBox(dialogueToShow);
    }
    
    drawChoiceButtons() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let textSizeVal = 32 * scaleX;
        textAlign(CENTER, CENTER);
        
        fill(this.isMouseOver(this.yesButtonRect) ? color(255, 255, 200, 50) : color(0, 150));
        stroke(255); rect(this.yesButtonRect.x, this.yesButtonRect.y, this.yesButtonRect.w, this.yesButtonRect.h, 10);
        fill(255); noStroke(); textSize(textSizeVal);
        text("좋아요", this.yesButtonRect.x + this.yesButtonRect.w / 2, this.yesButtonRect.y + this.yesButtonRect.h / 2);

        fill(this.isMouseOver(this.noButtonRect) ? color(255, 255, 200, 50) : color(0, 150));
        stroke(255); rect(this.noButtonRect.x, this.noButtonRect.y, this.noButtonRect.w, this.noButtonRect.h, 10);
        fill(255); noStroke(); textSize(textSizeVal);
        text("괜찮습니다", this.noButtonRect.x + this.noButtonRect.w / 2, this.noButtonRect.y + this.noButtonRect.h / 2);
        
        textAlign(LEFT, TOP);
    }
    
    drawQRCodeScene() {
        // 2. 공방지기가 팝업창 뒤에 계속 보이도록 수정
        this.drawKeeperImage();
        
        fill(0, 180); noStroke(); rectMode(CORNER); rect(0, 0, width, height);

        let scaleX = width / this.ORIGINAL_WIDTH, scaleY = height/this.ORIGINAL_HEIGHT;
        let popupW = 800 * scaleX, popupH = 900 * scaleY;
        let popupX = width / 2 - popupW / 2, popupY = height / 2 - popupH / 2;
        fill(20, 20, 30, 240); stroke(255, 100); strokeWeight(2);
        rect(popupX, popupY, popupW, popupH, 20);

        let qrSize = 400 * Math.min(scaleX, scaleY);
        image(this.images.qrCode, width / 2, popupY + popupH / 2 - 120 * scaleY, qrSize, qrSize);

        textAlign(CENTER, TOP); noStroke();
        fill(255); textSize(32 * Math.min(scaleX, scaleY));
        text(this.qrDialogue.text, width / 2 - popupW/2 * 0.8, popupY + popupH * 0.7, popupW * 0.8);

        textSize(24 * Math.min(scaleX, scaleY));
        fill(255, 150 + sin(millis() * 0.005) * 105);
        text("화면을 클릭하여 계속하기", width/2, popupY + popupH - 60 * scaleY);
        textAlign(LEFT, TOP);
    }
    
    drawFadeToWhite(isFadingOut) {
        let progress = constrain((millis() - this.fadeStartTime) / this.FADE_DURATION, 0, 1);
        let alpha = lerp(0, 255, progress);

        if (isFadingOut) {
            this.drawFinalScreen();
            fill(255, alpha); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
            if (progress >= 1) this.onComplete();
        } else {
            // 3. 전환 시 대사가 재시작되지 않도록 수정
            this.drawWorkshopBackground();
            this.drawDialogueBox(this.endingMonologue[this.endingMonologue.length - 1]);

            fill(255, alpha); noStroke(); rectMode(CORNER); rect(0, 0, width, height);
            if (progress >= 1) {
                this.sceneState = 'FINAL_SCREEN';
                this.fadeStartTime = millis();
            }
        }
    }

    drawFinalScreen() {
        if (this.images.finalConstellationTest) {
            let scale = width / this.ORIGINAL_WIDTH;
            let floatingY = sin(millis() * 0.0005) * 15 * scale;
            let glow = 180 + sin(millis() * 0.002) * 75;
            tint(255, glow);
            image(this.images.finalConstellationTest, width / 2, height / 2 - 50*scale + floatingY, this.images.finalConstellationTest.width * scale, this.images.finalConstellationTest.height * scale);
            noTint();
        }

        let scaleX = width / this.ORIGINAL_WIDTH, textSizeVal = 32 * scaleX;
        fill(this.isMouseOver(this.endButtonRect) ? color(255, 255, 200, 50) : color(0, 150));
        stroke(255); rect(this.endButtonRect.x, this.endButtonRect.y, this.endButtonRect.w, this.endButtonRect.h, 10);
        fill(255); noStroke(); textAlign(CENTER, CENTER); textSize(textSizeVal);
        text("종료하기", this.endButtonRect.x + this.endButtonRect.w / 2, this.endButtonRect.y + this.endButtonRect.h / 2);
        textAlign(LEFT, TOP);
    }

    advanceDialogue(dialogues, nextState) {
        this.dialogueIndex++;
        if (this.dialogueIndex >= dialogues.length) {
            this.sceneState = nextState;
            this.dialogueIndex = 0;
            this.fadeStartTime = millis();
            this.resetTyping(null);
        } else {
            this.resetTyping(dialogues[this.dialogueIndex]);
        }
    }

    resetTyping(currentDialogue) {
        this.currentCharIndex = 0;
        this.isTyping = true;
        this.lastCharTime = millis();
        if (currentDialogue && currentDialogue.image) {
            if(currentDialogue.image !== this.lastKeeperImgKey){
                this.previousKeeperImg = this.images[this.lastKeeperImgKey];
                this.currentKeeperImg = this.images[currentDialogue.image];
                this.keeperFadeStartTime = millis();
                this.lastKeeperImgKey = currentDialogue.image;
            }
        }
    }
    
    drawDialogueBox(dialogue) {
        if (!dialogue) return;
        let d=this.dialogueBoxRect, sX=width/this.ORIGINAL_WIDTH, sY=height/this.ORIGINAL_HEIGHT, aS=(sX+sY)/2;

        tint(255, this.TEXT_BOX_ALPHA); image(this.images.textBox, d.x + d.w / 2, d.y + d.h / 2, d.w, d.h); noTint();
        
        let fullText = dialogue.text;
        
        if (this.isTyping && millis() - this.lastCharTime > this.TYPING_SPEED) {
            this.currentCharIndex = min(this.currentCharIndex + 1, fullText.length);
            this.lastCharTime = millis();
            if(this.currentCharIndex === fullText.length) this.isTyping = false;
        }
        let textToShow = fullText.substring(0, this.currentCharIndex);

        let speakerSize = 40*aS, dialogueSize = 36*aS, pX = 100*sX, pY = 70*sY, tY = d.y + pY + speakerSize*1.5;

        noStroke(); textSize(speakerSize);
        fill(dialogue.speaker === "나" ? color(255, 215, 0) : color(255));
        text(dialogue.speaker + ":", d.x + pX, d.y + pY);

        fill(255); textSize(dialogueSize); text(textToShow, d.x + pX, tY, d.w - (pX * 2), d.h - (pY * 2.5));
        
        // 2. 깜빡이는 화살표
        if (!this.isTyping) {
            let arrowAlpha = map(sin(millis() * 0.005), -1, 1, 180, 255);
            fill(255, arrowAlpha); noStroke();
            let ar = this.arrowRect;
            triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
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
        push();translate(this.skyOffsetX,this.skyOffsetY);
        for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){push();translate(i*width,j*height);this.drawGeneralStarsSet();this.drawConstellationSet();pop();}
        pop();
    }
    drawGeneralStarsSet() {noStroke();for(let s of this.generalStars){fill(255,s.alpha);ellipse(s.x,s.y,s.size,s.size);}}
    drawConstellationSet() {
        let s=Math.min(width/this.ORIGINAL_WIDTH,height/this.ORIGINAL_HEIGHT);
        for(let c of this.constellations){
            stroke(180,210,255,100);strokeWeight(1*s);
            for(let conn of c.connections)line(c.stars[conn[0]][0],c.stars[conn[0]][1],c.stars[conn[1]][0],c.stars[conn[1]][1]);
            noStroke();
            for(let star of c.stars){fill(210,225,255,220);ellipse(star[0],star[1],4*s,4*s);fill(180,210,255,40);ellipse(star[0],star[1],10*s,10*s);}
        }
    }
}
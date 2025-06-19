const starNames = ["조각가", "직조가","대장장이","음유시인","연금술사","정원사","건축가","항해사","치유사","서기관","몽상가","수호자"];
const starStories = ["본질을 인내로 파고들어, 무형의 아이디어를 형태로 드러내는 현실적이면서도 섬세한 구현자",
"관계의 흐름을 읽고 인연을 엮어, 세상에 조화로운 패턴을 만들어내는 연결 중심의 조율자",
"불굴의 의지로 시련을 이겨내며, 무형의 가능성을 단단한 현실로 단련하는 강인한 창조자",
"감정과 이야기를 언어로 풀어내며, 사람들의 마음을 울리고 이어주는 감성의 전달자",
"끊임없는 탐구로 진리를 추구하고, 일상을 신비롭게 변화시키는 내면의 혁신가",
"섬세한 돌봄으로 생명을 키우며, 긴 시간을 인내해 결실을 기다리는 성숙한 양육자",
"치밀한 설계로 질서를 세우고, 아름다움과 안정이 공존하는 세계를 그려내는 구조의 창조자",
"미지의 영역에 도전하며, 누구도 가보지 않은 길을 나아가는 방향감각 뛰어난 개척자",
"고통을 공감하고, 따뜻한 손길로 회복을 이끄는 섬세하고 헌신적인 치유의 조력자",
"세상의 지혜와 기억을 글로 담아, 시대를 이어주는 진실된 기록의 수호자",
"현실의 틀을 넘어 상상의 날개로 미래를 그리고, 가능성을 꿈꾸는 창조적 비전가",
"소중한 것을 지키기 위해 헌신하며, 책임감과 충성심으로 공동체를 보호하는 믿음직한 방어자"
];

class Connecting{
    // ⭐ constructor 설정 수정: onConstellationCompleteCallback 추가 ⭐
    constructor(selectedCard, nameResult, keeperImages, textBoxImage, updateSceneNumberCallback, onConstellationCompleteCallback, starImages, newStarImage, sounds, button){
        this.selectedCard = selectedCard;
        this.newStarImage = newStarImage;
        this.nameResult = nameResult;
        this.button = button;
        this.storyResult = "";
        this.textBox = textBoxImage;
        this.updateSceneNumber = updateSceneNumberCallback; // 씬 넘버 업데이트 콜백
        this.onConstellationComplete = onConstellationCompleteCallback; // 별자리 완성 시 이미지/URL 전달 콜백 ⭐ 추가 ⭐
        this.cardWidth = windowWidth / 9;
        this.cardHeight = this.cardWidth*3/2;
        this.extraStarPositions = [];
        this.interval = 2;
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
        this.isTypingKeeper = true; 
        this.fontSize = 36; // Base font size, will be scaled
        this.textPaddingX = 100; // Base padding, will be scaled
        this.textPaddingY = 60; // Base padding, will be scaled
        this.textInterval = 2;
        this.sounds = sounds; // sounds 객체 저장
        this.starbgm = null; // 선택된 카드의 BGM 키를 저장할 변수
        this.hoveredCardTargetScale = 1;      // 호버된 카드의 목표 스케일
        this.hoveredCardCurrentScale = 1;     // 호버된 카드의 현재 스케일
        this.hoveredCardTargetOffsetY = 0;    // 호버된 카드의 목표 Y축 이동 (위로 올라오는 효과)
        this.hoveredCardCurrentOffsetY = 0;   // 호버된 카드의 현재 Y축 이동
        this.hoverAnimationSpeed = 0.1;       // 애니메이션 속도 (0에 가까울수록 느림)
        this.hoverScaleAmount = 1.1;          // 확대될 크기 (원래 크기의 1.1배)
        this.hoverOffsetYAmount = 30;  
        this.cardFlyParticle = null;
this.isCardFlyAnimationPlaying = false;
this.cardFlyY = 0;
this.cardFlyStartX = 0;
this.cardFlyStartY = 0;

this.isLightRainPlaying = false;
this.lightRainParticles = [];
this.rainEndCallbackCalled = false;

        // --- References for scaling ---
        this.ORIGINAL_WIDTH = 1920;
        this.ORIGINAL_HEIGHT = 1080;
this.minDist = windowWidth*windowHeight/50000;
        // ---

        // UI 요소들의 rect 객체를 선언합니다.
        this.dialogueBoxRect = {}; // keeper 대화창
        this.arrowRect = {};       // keeper 대화창 아래 삼각형
        this.keeperRect = {};      // keeper 이미지
        this.storyTextBoxRect = {}; // 스토리 텍스트 박스
        this.starImageRect = {};   // 별 이미지 영역
this.hoveredCardIndex = -1;
        this.hoveredExtraStarIndex = -1;
        this.glowAlpha = 0;
        this.glowSpeed = 3;
        this.maxGlowAlpha = 100;

        this.isCardSelected = false;
        this.favoriteCard = [];
        const trimmedNameResult = this.nameResult.trim();
        let matchedIndex = -1;
        for (let i = 0; i < starNames.length; i++) {
            if (trimmedNameResult === starNames[i]) {
                matchedIndex = i;
                break;
            }
        }

        // ⭐ Fix 2: Assign a default image/story if no match is found ⭐
        if (matchedIndex !== -1) {
            this.starImage = this.starImages[matchedIndex];
            this.storyResult = starStories[matchedIndex];
        }

        for (let i = 0; i < this.selectedCard.length; i++) {
            this.starPositions.push({
                x: this.selectedCard[i].star.x,
                y: this.selectedCard[i].star.y,
                alpha: 0,
                sparkleTimer: random(0, 500), // 각 별의 반짝임 시작 타이밍을 다르게 설정
                isExtra: false
            });
        }
        this.keeperDialogue = ["당신의 기억들이 빚어낸 밑그림이 완성됐습니다.\n희미한 빛 속에서도 " + this.nameResult + "의 영혼이 선명하게 느껴지는군요. ",
    "자, 이제 밤하늘의 별자리를 완성해 볼까요?",
    "....................",
    "이런… 별들의 중심을 잡아줄 빛이 부족하군요.\n당신이 선택한 카드 중에서 가장 의미있는 기억을 골라주시겠어요?\n그 기억이 별자리를 지탱할 심장이 될겁니다.",
    "오오… 방금 탄생한 저 커다란 별이 별자리의 심장이랍니다.\n이제 저 빛을 움직여 별들의 균형을 맞춰주세요.",
    "아, 잊을 뻔했군요! 별들도 각자의 공간이 필요하답니다.\n너무 가까워지면 서로의 빛을 가릴 수 있으니 조심하세요.",
    "정말 아름답군요... 당신의 이야기가 그대로 담긴, 단 하나뿐인 걸작입니다."
];
        // UI 요소들의 크기와 위치를 설정합니다.
        this.setupUIElements();
    }

    // --- UI 요소들의 크기와 위치를 설정하는 메서드 ---
    setupUIElements() {
        let scaleX = width / this.ORIGINAL_WIDTH;
        let scaleY = height / this.ORIGINAL_HEIGHT;
        let avgScale = (scaleX + scaleY) / 2;

        // Keeper 대화 박스 (drawKeeperInteraction에서 사용)
        let dialogueBoxMargin = 50 * scaleX;
        let dialogueBoxH = 300 * scaleY;
        this.dialogueBoxRect = {
    x: dialogueBoxMargin,
    y: height - dialogueBoxH - (30 * scaleY),
    w: width - (2 * dialogueBoxMargin),
    h: dialogueBoxH
  };

        // Keeper 대화창 아래 삼각형 (drawKeeperInteraction에서 사용)
        let arrowSize = 40 * Math.min(scaleX, scaleY);
  this.arrowRect = {
    x: this.dialogueBoxRect.x + this.dialogueBoxRect.w - (125 * scaleX),
    y: this.dialogueBoxRect.y + this.dialogueBoxRect.h - (90 * scaleY),
    w: arrowSize,
    h: arrowSize
  };

        // Keeper 이미지 (drawKeeperInteraction에서 사용)
         let keeperOriginalW = 600;
  let keeperH = (keeperOriginalW * scaleX) * (900 / keeperOriginalW); // Maintain aspect ratio
  this.keeperRect = {
    x: width / 2, // Central alignment
    y: height * 5 / 11 + (150 * scaleY),
    w: keeperOriginalW * scaleX,
    h: keeperH
  };

        // 스토리 텍스트 박스 (displayStory에서 사용)
         this.storyTextBoxRect = {
    x: width / 2, // Center of the screen for the box itself
    y: height * 3/4, // Vertical position
    w: width * 0.8, // 80% of screen width
    h: 160 * scaleY // Scaled height
  };
        // 별 이미지 영역 (show에서 사용)
        // Based on choosing.js star generation: x = (windowWidth / 2 - windowHeight / 4, windowWidth / 2 + windowHeight / 4), y = (windowHeight / 30, windowHeight / 2)
        let starBaseX = width / 2;
        let starBaseY = (height / 30 + height / 2) / 2; // Midpoint of y range
        let starAreaWidth = (height / 2 - height / 30); // Approximate width based on y range
        let starAreaHeight = height / 2 - height / 30;

        this.starImageRect = {
            x: starBaseX, 
            y: starBaseY + height/50, // Shift slightly up
            w: starAreaWidth * 1.2, // Slightly larger than choosing.js range
            h: starAreaHeight * 1.2 // Slightly larger than choosing.js range
        };

        // 텍스트 관련 속성
        this.fontSize = 36 * avgScale; // 메인 텍스트 폰트 크기 (keeper 대화, 스토리 텍스트)
        this.textPaddingX = 100 * scaleX; // 텍스트 박스 좌우 패딩
        this.textPaddingY = 60 * scaleY; // 텍스트 박스 상하 패딩
        this.starNameTextSize = this.fontSize * 1.5; // 별 이름 폰트 크기 (스토리 텍스트의 1.5배)
this.activeLines = []; // 활성화된 선의 상태(연결된 별, alpha값)를 저장할 배열
        this.lineFadeInSpeed = 5;
    }
    


    update() {
    this.setupUIElements();
    if (this.isCardFlyAnimationPlaying) {
  this.cardFlyY -= height/200; // 위로 올라감
  particleManager.add(this.cardFlyStartX, this.cardFlyY, 7, 5); // 반짝이 효과
  if (this.cardFlyY < -50) {
    this.isCardFlyAnimationPlaying = false;

    // 0.5초 뒤에 빛의 비 애니메이션 시작
    setTimeout(() => {
      this.startLightRain();
    }, 500);
  }
}

// --- 빛의 비 애니메이션 ---
if (this.isLightRainPlaying) {
  for (let rain of this.lightRainParticles) {
    rain.y += rain.speed;
    rain.alpha -= 2;
  }

  // 파티클 렌더링
  this.lightRainParticles = this.lightRainParticles.filter(r => r.alpha > 0);
  for (let rain of this.lightRainParticles) {
    noStroke();
    fill(255, 255, 200, rain.alpha);
    ellipse(rain.x, rain.y, 5, 20);
  }

  // 애니메이션 종료 시 다음 진행 허용
  if (this.lightRainParticles.length === 0 && !this.rainEndCallbackCalled) {
    this.rainEndCallbackCalled = true;
    this.preventNextAction = false; // 다음 로직 허용
    if (this.sounds.firework && this.sounds.firework.isPlaying()) {
            this.sounds.firework.stop();
        }
        if (this.sounds.switchingBgm && this.sounds.switchingBgm.isLoaded()) {
        this.sounds.switchingBgm.play();
        }
              this.index++; // Move to next stage after card selection
          this.keeperState = "showing"; // Show keeper dialogue for next stage
  }
}

    if (this.keeperState === "showing") {
        this.keeperAlpha = min(255, this.keeperAlpha + this.keeperFadeInSpeed);
        if (this.keeperAlpha === 255 && this.keeperText === this.keeperDialogue[this.index]) {
            this.keeperState = "waiting";
        }
    }

    // ⭐ 수정된 부분: 모든 별에 대해 반짝임 및 파티클 효과를 적용합니다.
    const allStars = [...this.starPositions, ...this.extraStarPositions];
        if(this.index>=1){
    for (let star of allStars) {
        // 드래그 중인 별은 반짝이지 않도록 처리
        const isDraggingThis = this.draggingStar !== null && this.extraStarPositions[this.draggingStar] === star;

        if (!isDraggingThis) {
            star.sparkleTimer++; // 타이머 증가
            // sin 함수를 이용해 alpha값을 주기적으로 변경하여 반짝임 효과 구현
            star.alpha = map(sin(star.sparkleTimer * 0.05), -1, 1, 100, 255);

            // 주기적으로 파티클 생성
            if (star.sparkleTimer % 10 === 0) {
                particleManager.add(star.x, star.y, 1);
            }
        }
      }
      particleManager.updateAndShow();
    }

    if (this.hoveredCardIndex !== -1 || this.hoveredExtraStarIndex !== -1) {
        this.glowAlpha = min(this.maxGlowAlpha, this.glowAlpha + this.glowSpeed);
    } else {
        this.glowAlpha = max(0, this.glowAlpha - this.glowSpeed);
    }
    this.hoveredCardCurrentScale = lerp(
            this.hoveredCardCurrentScale,
            this.hoveredCardTargetScale,
            this.hoverAnimationSpeed
        );
        // 현재 Y 오프셋을 목표 Y 오프셋으로 부드럽게 보간
        this.hoveredCardCurrentOffsetY = lerp(
            this.hoveredCardCurrentOffsetY,
            this.hoveredCardTargetOffsetY,
            this.hoverAnimationSpeed
        );

    // ⭐ 추가된 부분: 파티클 매니저를 업데이트하고 화면에 표시합니다.
}

    show() {
        this.cardRects = [];
        if (this.index == 3 && this.keeperState == "done") {
  if(!this.preventNextAction){
            if (!this.cardsFullyVisible && this.cardAlpha < 255) {
                this.cardAlpha += 10;
            }
            if (this.cardAlpha >= 255) {
                this.cardsFullyVisible = true;
            }
  }
  else{
    this.cardAlpha -= 1;
  }
            for (let i = 0; i < this.selectedCard.length; i++) {
                let x = this.cardWidth/4 + (this.cardWidth * 1.5) * i;
      let y = windowHeight - this.cardHeight - windowHeight / 20;
      let w = this.cardWidth;
      let h = this.cardHeight;
                this.cardRects.push({ x, y, w, h, index: i });
                
                push();
                    if (this.hoveredCardIndex === i) {
                    translate(x + w / 2, y + h / 2 + this.hoveredCardCurrentOffsetY); // Y 오프셋 적용
                    scale(this.hoveredCardCurrentScale); // 스케일 적용
                } else {
                    translate(x + w / 2, y + h / 2); // 원래 위치
                    scale(1); // 원래 스케일
                }
                    let card = this.selectedCard[i];
                    tint(255, this.cardAlpha);
                    this.drawCardFront(0, 0, w, h, card.image, card.text, this.cardAlpha);
                pop();
            }
        }

        // Index 1 이상일 때 별자리 관련 요소 표시
        if (this.index >= 1) {
            push();
            imageMode(CENTER);
            tint(255, 200);
            image(
                this.starImage,
                this.starImageRect.x,
                this.starImageRect.y,
                this.starImageRect.w,
                this.starImageRect.h
            );
            pop();

            // 기본 별들 위치 시각화
            for (let i = 0; i < this.starPositions.length; i++) {
                let s = this.starPositions[i];
                push();
                // ⭐ 수정된 부분: tint에 고정값 대신 별의 alpha 속성을 사용합니다.
                tint(255, s.alpha);
                image(this.newStarImage,s.x, s.y, windowWidth * windowHeight / 30000,windowWidth * windowHeight / 30000);
                pop();
            }
            // 별자리 선 그리기
            this.drawLines();
            if(this.keeperState === "done"){
              this.displayStarName();
            }

            // 추가된 별 시각화 (카드를 선택했을 때)
            if (this.isCardSelected === true ) {
  if(this.preventNextAction === false){
      this.displayStory(); 
  }
                for (let i = 0; i < this.extraStarPositions.length; i++) {
                    let extraStar = this.extraStarPositions[i];
if (this.hoveredExtraStarIndex === i && this.glowAlpha > 0) {
                        push();
                        fill(255, this.glowAlpha);
                        noStroke();
                        ellipse(extraStar.x, extraStar.y, windowWidth * windowHeight / 40000);
                        pop();
                    }
                    // ⭐ 수정된 부분: 새로 추가된 별도 alpha값을 적용하여 tint 처리합니다.
                    push();
                    tint(255, extraStar.alpha);
                    image(this.newStarImage, extraStar.x, extraStar.y, windowWidth*windowHeight/20000, windowWidth*windowHeight/20000);
                    pop();
                }
            }

        }

        // "별자리 완성" 버튼 (Index 5에서만 등장)
        if (this.index === 5) {
            push();
            imageMode(CENTER); // 버튼을 중앙 정렬로 그리기 위해 추가
            image(this.textBox, width/2, height*12/13, width/13, height/12);
            fill(255, 215, 0);
            textAlign(CENTER, CENTER);
            noStroke();
            textSize(this.fontSize*0.6);
            text("별자리 완성", width /2, height * 12 / 13);
            pop();
        }

        // 키퍼 상호작용
        if (this.keeperState != "done") {
            if (this.keeperState === "showing") {
                this.keeperAlpha = min(255, this.keeperAlpha + this.keeperFadeInSpeed);
                if (this.keeperAlpha === 255 && this.keeperText === this.keeperDialogue[this.index]) {
                    this.keeperState = "waiting";
                }
            }
            this.drawKeeperInteraction();
        }
    }

    // Inside the Connecting class
handleMousePressed() {
  this.setupUIElements(); // Ensure UI elements are correctly sized and positioned

  // Define the keeper's text box area
  const textBoxRect = {
    x: this.dialogueBoxRect.x,
    y: this.dialogueBoxRect.y,
    w: this.dialogueBoxRect.w,
    h: this.dialogueBoxRect.h
  };
  if (this.preventNextAction) return; // 애니메이션 중이면 무시

if(this.keeperState != "done"){
  // Check if the click is within the keeper's text box
  if (mouseX > textBoxRect.x && mouseX < textBoxRect.x + textBoxRect.w &&
      mouseY > textBoxRect.y && mouseY < textBoxRect.y + textBoxRect.h) {

    // Logic for instant text display or advancing dialogue
    if (this.keeperState === "showing" || this.keeperState === "waiting") {
      if (this.isTypingKeeper) {
        // If text is currently typing, skip to the end immediately
        this.keeperText = this.keeperDialogue[this.index]; // Display full text
        this.keeperIndex = this.keeperDialogue[this.index].length; // Set index to end
        this.isTypingKeeper = false; // Stop typing animation
        this.keeperAlpha = 200; // Maintain visibility of the keeper's box
      } else if (this.keeperState === "waiting") {
        // If typing is finished and keeper is waiting for a click to advance
        // 👉 1. keeper 안내 문구 클릭 시 다음으로 넘어감
        if (this.index === 0 || this.index === 1 || this.index === 2 || this.index === 4) {
                    this.index++; // Increment dialogue index
          if (this.index === 1) {
            this.keeperState = "done";
               setTimeout(() => {
                this.keeperState = "showing";
               }, 500);
            }else{
this.keeperState = "showing"; // Transition to showing to fade in next text

}
        } else {
          this.keeperState = "done"; // All keeper dialogues for this stage are done
          if (this.index === 6) { // Assuming this is the final index for a scene transition
            if (this.updateSceneNumber) { // Check if callback exists
              console.log(this.selectedCard.length);
              this.updateSceneNumber(); // Call external scene number increment function
            }
          }
        }
        this.keeperText = ""; // Clear current keeper text
        this.keeperIndex = 0; // Reset typing index for next dialogue
        this.keeperAlpha = 0; // Start fade-in from 0 for the next keeper dialogue
        this.isTypingKeeper = true; // Start typing for the next dialogue
      }
    }
    return; // Consume the click, do not process other mousePressed logic below
  }
}

  // --- Existing Logic for Card Selection (only processed if keeperState is "done") ---
  if (this.keeperState == "done") {
    // 👉 2. 카드 선택 (index 3에서 보여지고 선택 가능)
    if (!this.isCardSelected && this.cardRects) {
       for(let card of this.cardRects){
                // rectMode(CENTER)로 카드를 그렸으므로 클릭 영역도 맞춰줍니다.
                    if (mouseX >= card.x && mouseX <= card.x + card.w&&
                mouseY >= card.y && mouseY <= card.y + card.h) {
          this.favoriteCard.push(this.selectedCard[card.index]);
          this.isCardSelected = true;
          this.startCardFlyAnimation(mouseX, mouseY);

          this.changeStarColor(); // Call your star color change function
          this.changeBGM();

          let newStar;
          let maxTries = 100;

          for(let k = 0; k < 4; k++) { // Loop to generate 4 extra stars
            for (let tries = 0; tries < maxTries; tries++) {
              // ⭐ 수정된 부분: tempStar 객체에 alpha와 sparkleTimer 속성을 추가합니다.
              let tempStar = {
                x: random(this.starImageRect.x - this.starImageRect.w / 2 + 50, this.starImageRect.x + this.starImageRect.w / 2 - 50),
                y: random(this.starImageRect.y - this.starImageRect.h / 2 + 50, this.starImageRect.y + this.starImageRect.h / 2 - 50),
                alpha: 255, // 새로 생긴 별은 바로 보이도록 설정
                sparkleTimer: random(0, 500), // 반짝임 시작 타이밍 무작위 설정
                isExtra: true
              };

              let tooCloseToMain = this.starPositions.some(
                (s) => dist(s.x, s.y, tempStar.x, tempStar.y) < this.minDist
              );

              let tooCloseToExtra = this.extraStarPositions.some(
                (s) => dist(s.x, s.y, tempStar.x, tempStar.y) < this.minDist
              );

              if (!tooCloseToMain && !tooCloseToExtra) {
                newStar = tempStar;
                this.extraStarPositions.push(newStar);
                break; // Found a valid position, break from inner tries loop
              }
            }
          }
          break; // Card was selected, exit loop
        }
      }
    }
  }
}
startCardFlyAnimation(startX, startY) {
  this.isCardFlyAnimationPlaying = true;
  this.cardFlyStartX = startX;
  this.cardFlyStartY = startY;
  this.cardFlyY = startY;

  // 카드 선택 이후 다음 로직 일시 정지 (예: 2초 후 계속되도록)
  this.preventNextAction = true;
}
startLightRain() {
  this.isLightRainPlaying = true;
  this.lightRainParticles = [];

  let rainCount = 50;
  for (let i = 0; i < rainCount; i++) {
    this.lightRainParticles.push({
      x: random(width),
      y: random(-200, -10),
      speed: random(4, 8),
      alpha: 255
    });
  }
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
                    if (dist(mouseX, mouseY, s.x, s.y) < windowWidth*windowHeight/40000) { // 20px 반경 내 클릭 시 드래그 시작
                        this.draggingStar = i;
                        // 드래그 시작 시 초기 위치 저장
                        this.initialStarPosition = { x: s.x, y: s.y };
                        break;
                    }
                }
            }
        }
    }


handleKeyPressed() {
    if (keyCode !== 32) return; // 스페이스바가 아니면 무시

    if (this.keeperState === "showing" || this.keeperState === "waiting") {
        if (this.isTypingKeeper) {
            // 타이핑 중이면 즉시 완료
            this.keeperText = this.keeperDialogue[this.index];
            this.keeperIndex = this.keeperDialogue[this.index].length;
            this.isTypingKeeper = false;
        } else if (this.keeperState === "waiting") {
            // 타이핑 완료 상태면 다음으로
            if (this.index === 0 || this.index === 1 || this.index === 2 || this.index === 4) {
                this.keeperState = "showing";
                this.index++;
            } else {
                this.keeperState = "done";
                if (this.index === 6) {
                    if (this.updateSceneNumber) {
                        this.updateSceneNumber();
                    }
                }
            }
            this.keeperText = "";
            this.keeperIndex = 0;
            this.keeperAlpha = 0;
            this.isTypingKeeper = true;
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
            let captureBox = {
                x: this.starImageRect.x - this.starImageRect.w / 2,
                y: this.starImageRect.y - this.starImageRect.h / 2,
                w: this.starImageRect.w,
                h: this.starImageRect.h
            };
            if (dragged.x < captureBox.x || dragged.x > captureBox.x + captureBox.w ||
                dragged.y < captureBox.y || dragged.y > captureBox.y + captureBox.h) {
                isValidPosition = false;
            }

            // 2. 다른 별들과 minDist 이상 떨어져 있는지 검사
            if (isValidPosition) {
                const allStars = [...this.starPositions];
                this.extraStarPositions.forEach((star, i) => {
                    if (i !== this.draggingStar) allStars.push(star);
                });
                for (let s of allStars) {
                    if (dist(s.x, s.y, dragged.x, dragged.y) < this.minDist) {
                        isValidPosition = false;
                        break;
                    }
                }
            }

            // 위치가 유효하지 않으면 초기 위치로 되돌립니다.
            if (!isValidPosition) {
                this.extraStarPositions[this.draggingStar].x = this.initialStarPosition.x;
                this.extraStarPositions[this.draggingStar].y = this.initialStarPosition.y;
            }
            this.draggingStar = null; // 드래그 상태 해제
        }

        // "별자리 완성" 버튼 클릭 로직
        const btnBox = {
             x: width /2, y: height * 12 / 13,
             w: width/13, h: height/12
        };

        if (mouseX >= btnBox.x - btnBox.w / 2 && mouseX <= btnBox.x + btnBox.w / 2 &&
            mouseY >= btnBox.y - btnBox.h / 2 && mouseY <= btnBox.y + btnBox.h / 2) {

            // ⭐ [핵심 수정] 투명한 그래픽 버퍼에 별자리 요소를 직접 그려 완벽하게 캡처합니다.
            
            const captureW = this.starImageRect.w;
            const captureH = this.starImageRect.h;
            const captureX = this.starImageRect.x - captureW / 2;
            const captureY = this.starImageRect.y - captureH / 2;

            // 1. 투명한 도화지(버퍼) 생성
            const buffer = createGraphics(captureW, captureH);
            const guideImageAlpha = 100;
            
            // 2. 버퍼에 희미한 가이드 이미지 그리기
            buffer.imageMode(CENTER);
            buffer.tint(255, guideImageAlpha);
            buffer.image(this.starImage, captureW / 2, captureH / 2, captureW, captureH);
            buffer.noTint();

            // 3. 버퍼에 별과 선 그리기
            const allStars = [...this.starPositions, ...this.extraStarPositions];
            
            // 선 그리기
           buffer.stroke('#FDBB53'); // 선 색상을 황금빛으로 변경
           buffer.strokeWeight(1);      // 선 두께를 10에서 3으로 변경
            const existingLines = []; // 교차하지 않는 선만 그리기 위한 배열
            for (let i = 0; i < allStars.length; i++) {
                for (let j = i + 1; j < allStars.length; j++) {
                    let a = allStars[i];
                    let b = allStars[j];
                    
                    if (dist(a.x, a.y, b.x, b.y) < 500) {
                        // 별의 절대 좌표를 버퍼의 상대 좌표로 변환
                        let p1 = { x: a.x - captureX, y: a.y - captureY };
                        let p2 = { x: b.x - captureX, y: b.y - captureY };

                        let intersects = existingLines.some(line => this.linesIntersect(p1, p2, line.p1, line.p2));
                        if (!intersects) {
                            existingLines.push({ p1, p2 });
                            buffer.line(p1.x, p1.y, p2.x, p2.y);
                        }
                    }
                }
            }
            
            // 별 그리기
            buffer.imageMode(CENTER);
            allStars.forEach(star => {
                const starSize = (star.isExtra ? width * height / 20000 : width * height / 30000);
                 // 별의 절대 좌표를 버퍼의 상대 좌표로 변환
                buffer.image(this.newStarImage, star.x - captureX, star.y - captureY, starSize, starSize);
            });

            // 4. 완성된 버퍼(투명 배경의 별자리 이미지)를 콜백으로 전달
            if (this.onConstellationComplete) {
                this.onConstellationComplete(buffer);
            }

            this.index++;
            this.keeperState = "showing";
        }
    }
}


    // 이펙트는 추후에 구현
    handleMouseOver(){
        // 마우스가 카드 위에 있으면 빛이 남
        let cardHovered = false;
        if (this.index === 3 && this.keeperState === "done" && this.cardRects) {
            for (let i = 0; i < this.cardRects.length; i++) {
                const rect = this.cardRects[i];
                if (
                    mouseX >= rect.x &&
                    mouseX <= rect.x + this.cardWidth &&
                    mouseY >= rect.y &&
                    mouseY <= rect.y + this.cardHeight
                ) {
                    this.hoveredCardIndex = i;
                    cardHovered = true;
                    // ⭐ 마우스 오버 시 목표 스케일 및 오프셋 설정 ⭐
                    this.hoveredCardTargetScale = this.hoverScaleAmount;
                    this.hoveredCardTargetOffsetY = -this.hoverOffsetYAmount; // 위로 이동 (-Y)
                    break;
                }
            }
        }
        if (!cardHovered) {
            this.hoveredCardIndex = -1;
            this.hoveredCardTargetScale = 1;
            this.hoveredCardTargetOffsetY = 0;
        }

        // 마우스가 별 위에 있으면 별이 더 밝아짐
        let starHovered = false;
        if (this.index === 5 && this.isCardSelected && !this.draggingStar) {
            for (let i = 0; i < this.extraStarPositions.length; i++) {
                let s = this.extraStarPositions[i];
                if (dist(mouseX, mouseY, s.x, s.y) < windowWidth*windowHeight/40000) { // 20px radius for hover detection
                    this.hoveredExtraStarIndex = i;
                    starHovered = true;
                    break;
                }
            }
        }
        if (!starHovered) {
            this.hoveredExtraStarIndex = -1;
        }
    }

    // --- Updated drawKeeperInteraction method ---
    drawKeeperInteraction() {
  // keeper image (fade-in)
  push();
  tint(255, this.keeperAlpha);
  imageMode(CENTER);
  image(
    this.keeperImages[this.index], // Use current dialogue index for keeper image
    this.keeperRect.x,
    this.keeperRect.y,
    this.keeperRect.w,
    this.keeperRect.h
  );
  pop();

  // Text box image
 imageMode(CENTER);
tint(255, 255);
image(
        this.textBox,
        this.dialogueBoxRect.x + this.dialogueBoxRect.w / 2,
        this.dialogueBoxRect.y + this.dialogueBoxRect.h / 2,
        this.dialogueBoxRect.w,
        this.dialogueBoxRect.h
    );
    noTint();

    const textX = this.dialogueBoxRect.x + this.textPaddingX;
    const textBoxContentWidth = this.dialogueBoxRect.w - (this.textPaddingX * 2);
    const textBoxContentHeight = this.dialogueBoxRect.h - (this.textPaddingY * 2);
    const d = this.dialogueBoxRect;

    const fullText = this.keeperDialogue[this.index];
    const fullWrappedText = this.wrapText(fullText, textBoxContentWidth);
    const numLines = (fullWrappedText.match(/\n/g) || []).length + 1;
    const textBlockHeight = numLines * (this.fontSize * 1.5); // textLeading 값(1.5)을 곱해 전체 높이 계산

    // 2. 텍스트 블록이 세로 중앙에 오도록 시작 Y 좌표를 고정합니다.
    const startY = d.y + this.textPaddingY + (textBoxContentHeight - textBlockHeight) / 2;

  if (this.isTypingKeeper) {
    if (frameCount % this.textInterval === 0 && this.keeperIndex < this.keeperDialogue[this.index].length) {
      this.keeperText += this.keeperDialogue[this.index][this.keeperIndex];
      this.keeperIndex++;
    } else if (this.keeperIndex >= this.keeperDialogue[this.index].length) {
      this.isTypingKeeper = false; // Typing finished
    }
  }

fill(255, this.keeperAlpha);
    noStroke();
    textSize(this.fontSize);
    textLeading(this.fontSize * 1.5);
    // ⭐ [수정] 정렬을 다시 TOP 기준으로 변경합니다.
    textAlign(LEFT, TOP);
    let wrapped = this.wrapText(this.keeperText, textBoxContentWidth);
    // ⭐ [수정] 미리 계산된 Y좌표에서 텍스트를 그립니다.
    text(wrapped, textX, startY);

  // Show pulsing triangle when typing is finished
  if (!this.isTypingKeeper) {
    let arrowAlpha = map(sin(millis() * 0.005), -1, 1, 90, 220); // Pulsing effect
    fill(255, arrowAlpha);
    noStroke();
    let ar = this.arrowRect;
    triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
  }
}
    drawLines() {
        let existingLines = [];
const num = 3;
        // 기본 별들과 추가 별들을 모두 포함
        const allCurrentStars = [...this.starPositions, ...this.extraStarPositions];

        for (let i = 0; i < allCurrentStars.length; i++) {
            for (let j = i + 1; j < allCurrentStars.length; j++) {
                let a = allCurrentStars[i];
                let b = allCurrentStars[j];

                let d = dist(a.x, a.y, b.x, b.y);
                if (d < this.minDist*5) { // 선을 연결할 최대 거리
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
                        strokeWeight(windowWidth*windowHeight/1500000);
                        line(a.x, a.y, b.x, b.y);
for (let i = 0; i <= num; i++) {
    let t = i / num; // 0부터 1 사이의 값 (선 위에서의 위치)
    let pointX = lerp(a.x, b.x, t);
    let pointY = lerp(a.y, b.y, t);
    particleManager.add(pointX, pointY, 1, 1);
}
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

    changeStarColor(){
        this.starColor = this.favoriteCard[0].colour;
    }

      changeBGM() {
    // 1. 🔥 firework 효과음은 즉시 재생
    if (this.sounds.firework && this.sounds.firework.isLoaded()) {
        this.sounds.firework.setVolume(0.7);
        this.sounds.firework.play();
    }

    // 2. 🔉 기존 bgm_1은 자연스럽게 페이드 아웃
    if (this.sounds.bgm_1 && this.sounds.bgm_1.isPlaying()) {
        let bgm = this.sounds.bgm_1;
        let currentVolume = 1.0;
        let fadeOutInterval = setInterval(() => {
            currentVolume -= 0.05;
            currentVolume = max(0, currentVolume);
            bgm.setVolume(currentVolume);

            if (currentVolume <= 0) {
                clearInterval(fadeOutInterval);
                bgm.stop();
            }
        }, 100); // 약 2초 페이드 아웃
    }

    // 3. 🎵 8초 후 starbgm 재생 (볼륨 0 → 1로 페이드 인)
    setTimeout(() => {
        this.starbgm = this.favoriteCard[0].bgm;

        if (this.starbgm && this.sounds[this.starbgm]) {
            const newBgm = this.sounds[this.starbgm];

            if (newBgm.isLoaded()) {
                newBgm.setVolume(0); // 처음엔 무음으로 시작
                newBgm.loop(); // 반복 재생

                // 페이드 인: 0 → 1 볼륨
                let fadeVolume = 0;
                const fadeInInterval = setInterval(() => {
                    fadeVolume += 0.05;
                    fadeVolume = min(1.0, fadeVolume);
                    newBgm.setVolume(fadeVolume);

                    if (fadeVolume >= 1.0) {
                        clearInterval(fadeInInterval);
                    }
                }, 100); // 약 2초 페이드 인
            } else {
                console.error("starbgm 로드 실패:", this.starbgm);
            }
        } else {
            console.error("BGM 키를 찾을 수 없거나 존재하지 않습니다:", this.starbgm);
        }
    }, 8000); // 8초 딜레이 후 starbgm 재생
}

    displayStarName() {
        // this.starNickname이 초기 null일 때만 업데이트
        if (this.index === 4 && this.starNickname === "") { // null 대신 빈 문자열로 비교
            this.updateStarName();
        }
        push();
         fill(255);
    noStroke();
    textSize(this.fontSize); // Adjust size as needed relative to main font
    textAlign(CENTER, TOP); // Or whatever alignment you prefer for the name

    // Position the name within or near the story text box.
    // For example, slightly above the story text box or as a heading within it.
    let nameX = this.keeperRect.x;
    let nameY = this.keeperRect.y*9/10;
    if (this.index >= 4){
      nameY = this.keeperRect.y;
    }
        text(
            this.nameResult.trim() + "자리",
            nameX,
            nameY // Above story box with some margin
        );
        pop();
    }

    updateStarName() {
        this.starNickname = this.favoriteCard[0].nickName;
        this.nameResult = this.starNickname + " " + this.nameResult;
    }

    displayStory(){
        if (this.keeperState === "done") { // Only display if keeper dialogue is done
    push();
    fill(255);
    noStroke();
    textSize(this.fontSize*1.2); // Use the scaled font size
    // Use the storyTextBoxRect for drawing
    textAlign(CENTER, CENTER); // 스토리 텍스트는 중앙 정렬 유지

      let textDrawX = this.storyTextBoxRect.x - this.storyTextBoxRect.w/2;
      let textDrawY = this.storyTextBoxRect.y - this.storyTextBoxRect.h/2;
      let textDrawWidth = this.storyTextBoxRect.w;
      let textDrawHeight = this.storyTextBoxRect.h;

    let wrapped = this.wrapText(this.storyResult, textDrawWidth);
    text(wrapped, textDrawX, textDrawY, textDrawWidth, textDrawHeight);
    pop();
  }
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
// Inside the Connecting class
wrapText(txt, maxWidth) {
  let words = txt.split(""); // Split by characters for precise control, or by space if words are enough
  let lines = "";
  let line = "";

  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i];
    if (textWidth(testLine) > maxWidth) {
      lines += line + "\n";
      line = words[i];
    } else {
      line = testLine;
    }
  }
  lines += line;
  return lines;
}
}
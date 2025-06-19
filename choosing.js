class Particle {
  constructor(x, y, radius = random(3,5))  {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.alpha = 255;
    this.vx = random(-1, 1);
    this.vy = random(-1, 1);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 3;
  }

  isDead() {
    return this.alpha <= 0;
  }

  show() {
    noStroke();
    fill(255, this.alpha);
    ellipse(this.x, this.y, this.radius * 2);
  }
}

function createParticleManager() {
  return {
    particles: [],

    add(x, y, count = 5, radius = null) {
      for (let i = 0; i < count; i++) {
        const r = radius ?? random(3, 5);
        this.particles.push(new Particle(x, y,r));
      }
    },

    updateAndShow() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.update();
        p.show();
        if (p.isDead()) {
          this.particles.splice(i, 1);
        }
      }
    }
  };
}

const particleManager = createParticleManager();
const texts = [
  "자, 그럼 당신의 이야기부터 시작해볼까요?\n당신의 이야기가 시작된 탄생의 빛은 어떤 풍경이었나요?\n당신의 유년의 빛은 어떤 기억으로 반짝였나요?",
  "당신의 삶에서 가장 빛나는 성장의 빛은 어떤 가치와 시련 속에서 피어났을까요?\n당신에게 가장 큰 가치는 무엇이었고, 또 가장 넘기 힘들었던 시련은 무엇이었나요?",
  "이제 마지막입니다.\n당신의 육신은 어디에 잠들었나요?\n또 당신을 그리는 이들에게 어떤 마지막 빛을 전하고 싶으신가요?",
  "이야기를 모두 선택하셨습니다. 이제 별을 이으러 가시죠."
];

class Choosing {
  constructor(selectedCard, keeperImages, textBox, sceneTransitionCallback, newStarImage) {
    this.sceneTransitionCallback = sceneTransitionCallback;
    this.cardSet = null;
    this.storyText = "";
    this.selectedCard = selectedCard;
    this.cardWidth = windowWidth / 9;
    this.cardHeight = this.cardWidth * 3 / 2;
    this.newStarImage = newStarImage;
    this.starGlowing = false;
    this.sounds = sounds;
    this.isCardFrontShowing = [];

    this.displayedText = "";
    this.charIndex = 0;
    this.interval = 2;
    // this.fontSize는 setupUIElements에서 설정됩니다.

    // --- References for scaling ---
    this.ORIGINAL_WIDTH = 1920;
    this.ORIGINAL_HEIGHT = 1080;
    // ---

    this.cardRects = [];
    this.hoveredIndex = -1;
    this.hoverAngles = [];

    this.animating = false;
    this.animationStart = 0;
    this.fadeDuration = 120;
    this.blankIndex = 0;

    this.cardImages = [];
    this.cardBackImage = null;

    this.starPositions = [];
    this.selectedIndex = -1;

    this.animatingCard = null;

    this.keeperImages = keeperImages;
    this.keeperState = null;
    this.keeperAlpha = 0;
    this.keeperFadeInSpeed = 2;

    this.showKeeperTextBox = false;
    this.keeperTextBoxClicked = false;
    this.textBox = textBox;
    this.idx = 0;
    this.keeperText = "";
    this.keeperIndex = 0;
    this.isTypingKeeper = false;

    // UI 요소들의 rect 객체를 선언합니다.
    this.dialogueBoxRect = {}; // keeper 대화창
    this.arrowRect = {};       // keeper 대화창 아래 삼각형
    this.keeperRect = {};      // keeper 이미지
    this.storyTextBoxRect = {}; // 카드 선택 후 스토리 텍스트 박스

    // UI 요소들의 크기와 위치를 설정하는 함수를 호출합니다.
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
    let keeperH = (keeperOriginalW * scaleX) * (900 / keeperOriginalW);
    this.keeperRect = {
      x: width / 2, // 중앙 정렬
      y: height * 5 / 11 + (150 * scaleY),
      w: keeperOriginalW * scaleX,
      h: keeperH
    };

    // **새로운 스토리 텍스트 박스 (displayText에서 사용)**
    // 이전에 고정된 this.boxX, this.boxY, this.boxW, this.boxH를 대체합니다.
    this.storyTextBoxRect = {
      // 텍스트 박스 자체를 중앙에 위치시키기 위한 x, y (text()의 중앙정렬과 별개)
      x: width / 2,
      y: height * 5 / 9, // 원본 코드의 this.boxY와 동일한 비율로 유지
      w: width * 0.8,    // 화면 너비의 80%를 사용 (조절 가능)
      h: 160 * scaleY   // 원본 높이 160px을 화면 비율에 맞게 스케일
    };


    // 텍스트 관련 속성 (Keeper 대화와 스토리 텍스트 모두에 적용될 수 있도록)
    this.fontSize = 36 * avgScale; // 메인 텍스트 폰트 크기
    this.textPaddingX = 100 * scaleX; // 텍스트 박스 좌우 패딩
    this.textPaddingY = 60 * scaleY; // 텍스트 박스 상하 패딩 (실제 텍스트 시작 위치에 영향)
    this.speakerTextSize = 40 * avgScale; // 화자 이름 폰트 크기 (현재는 사용 안 함)
  }
  // ---

  set(cardSet, cardBackImages) {
    this.cardSet = cardSet;
    this.storyText = cardSet.storyText;
    this.displayedText = "";
    this.charIndex = 0;
    this.cardRects = [];
    this.hoveredIndex = -1;
    this.animating = false;
    this.blankIndex = 0;
    this.cardBackImages = cardBackImages;
    this.hoverAngles = new Array(cardSet.blanks[0].options.length).fill(0);
    this.isCardFrontShowing = new Array(cardSet.blanks[0].options.length).fill(false);
    this.selectedIndex = -1;
    this.animatingCard = null;
    if (this.selectedCard.length === 0) {
      this.keeperState = "showing";
      this.keeperAlpha = 0;
      this.isTypingKeeper = true; // Start typing when keeper appears
      this.keeperText = ""; // Clear keeper text for new dialogue
      this.keeperIndex = 0; // Reset keeper typing index
    }
  }

  update() {
    // Re-calculate UI elements if window size changes (optional, but good for responsiveness)
    this.setupUIElements();
    if(this.keeperState === "done"){

    for (let i = 0; i < this.hoverAngles.length; i++) {
      let target = (i === this.hoveredIndex) ? PI : 0;
      this.hoverAngles[i] = lerp(this.hoverAngles[i], target, 0.07);
    }

    for (let star of this.starPositions) {
        star.sparkleTimer++; // 각 별의 타이머를 독립적으로 증가

        // 알파 값을 사인 함수로 조절하여 반짝임 효과 구현
        // 0.05는 반짝임 속도를 조절하는 값, 50은 최소 알파, 255는 최대 알파
        star.alpha = map(sin(star.sparkleTimer * 0.05), -1, 1, 50, 255);

        // 별 생성 시점에서 파티클 추가하는 로직 (기존과 동일)
        if (star.sparkleTimer % 10 === 0) {
          particleManager.add(star.x, star.y, 2);
        }
      }

      // **카드 애니메이션 중일 때 Trail 파티클 생성**
      if (this.animating && this.animatingCard) {
        const anim = this.animatingCard;
        const t = constrain(
          (frameCount - this.animationStart) / this.fadeDuration,
          0,
          1
        );

        // 현재 카드의 위치 계산
        let currentCardX = lerp(anim.startX, anim.targetX - anim.cardW / 2, t);
        let currentCardY =
          lerp(anim.startY, anim.targetY - anim.cardH / 2, t) -
          anim.arcHeight * sin(t * PI);

        // 주기적으로 파티클 생성 (프레임 단위로 조절 가능)
        if (frameCount % 3 === 0) { // 3프레임마다 파티클 1개 생성
          // 파티클 생성 위치를 카드의 중심 또는 약간 뒤쪽으로 조절
          particleManager.add(currentCardX + anim.cardW / 2, currentCardY + anim.cardH / 2, 1);
        }
      }
    } // end of if(this.keeperState === "done")

    // Particle Manager는 keeperState와 관계없이 항상 업데이트되고 그려집니다.
    // 이는 이펙트가 다른 UI 요소 위에 독립적으로 존재해야 하기 때문입니다.
    particleManager.updateAndShow();
  }

  show() {
    let currentBlank = this.cardSet.blanks[this.blankIndex];
    let options = currentBlank.options;
    let images = currentBlank.images;

    this.cardRects = [];
    if (this.keeperState !== "done") {
      if (this.keeperState === "showing") {
        this.keeperAlpha = min(255, this.keeperAlpha + this.keeperFadeInSpeed);
         if (this.keeperAlpha === 255 && this.keeperText === texts[this.idx]) {
           this.keeperState = "waiting";
        }
      }
      this.drawKeeperInteraction();
      return;
    }

    for (let c = 0; c < options.length; c++) {
      let x = this.cardWidth + (this.cardWidth * 2) * c;
      let baseY = windowHeight - this.cardHeight - windowHeight / 20;
      let w = this.cardWidth;
      let h = this.cardHeight;

      let y = baseY;
      let alpha = 255;
      let scaleAmt = 1;
      let angle = this.hoverAngles[c];
      let showFront = angle > HALF_PI;

 if (!this.animating) {
        if (showFront && !this.isCardFrontShowing[c]) {
            if (this.sounds && this.sounds.cardFlip) {
                this.sounds.cardFlip.play();
            }
            this.isCardFrontShowing[c] = true; // 상태를 '앞면'으로 변경
        } else if (!showFront) {
            // 카드가 다시 뒷면으로 돌아가면 상태 초기화 (효과음 재생 안 함)
            this.isCardFrontShowing[c] = false;
        }
    }


      if (this.animating) {
        let t = constrain(
          (frameCount - this.animationStart) / this.fadeDuration,
          0,
          1
        );

        if (c === this.selectedIndex) {
          const anim = this.animatingCard;
          if (anim) {
            // 카드의 최종 위치가 anim.targetX, anim.targetY 이므로,
            // image() 함수에 적합하도록 (중앙 정렬이면 -w/2, -h/2 가 필요) 보정합니다.
            x = lerp(anim.startX, anim.targetX - w / 2, t);
            y =
              lerp(anim.startY, anim.targetY - h / 2, t) -
              anim.arcHeight * sin(t * PI);
            scaleAmt = lerp(1, 0.08, t);
            alpha = 255 * (1 - t);
          }
          showFront = true;
        } else {
          alpha = 255 * (1 - t);
        }
      }

      let rectInfo = { x, y: baseY, w, h, index: c };
      this.cardRects.push(rectInfo);

      push();
      translate(x + w / 2, y + h / 2);
      scale(scaleAmt);

      if (!showFront) {
        scale(cos(angle), 1);
      }

      tint(255, alpha);

      if (showFront) {
        this.drawCardFront(0, 0, w, h, images[c], options[c], alpha);
      } else {
        drawingContext.save();
        rectMode(CENTER);
        drawingContext.beginPath();
        drawingContext.roundRect(-w / 2, -h / 2, w, h, 8);
        drawingContext.clip();
        image(this.cardBackImages[c], 0, 0, w, h);
        drawingContext.restore();
      }

      noTint();
      pop();
    }

    for (let star of this.starPositions) {
      push();
      translate(star.x, star.y);
      imageMode(CENTER); // 이미지 중앙 정렬

      // Draw the core star
      noStroke();
      tint(255, star.alpha); // update()에서 계산된 star.alpha 적용
      image(this.newStarImage, 0, 0, windowWidth * windowHeight / 30000, windowWidth * windowHeight / 30000);
      noTint();

      // Glow effect (이미지 외곽 글로우)
      // 별 이미지가 밝을 때만 글로우 효과를 나타내도록 조건 변경
      if (star.alpha > 100) { // 알파 값이 100 이상일 때만 글로우 표시
        let glowSize = 10 + sin(star.sparkleTimer * 0.3) * 5;
        // 글로우의 알파 값도 star.alpha에 비례하도록 조절하여 함께 반짝이도록
        stroke(255, 255, 255, map(star.alpha, 50, 255, 0, 150));
        strokeWeight(1.5);
        noFill();
        ellipse(0, 0, glowSize * 2, glowSize * 1.5);
        ellipse(0, 0, glowSize * 1.2, glowSize * 2.3);
      }

      pop();
    }
  }

  drawCardFront(x, y, w, h, img, label, alpha) {
    push();
    translate(x, y);
    rectMode(CENTER);

    fill(16, 17, 60, alpha);
    stroke(160, 120, 80, alpha);
    strokeWeight(4);
    rect(0, 0, w, h, 8);

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

  drawKeeperInteraction() {
    let scaleX = width / this.ORIGINAL_WIDTH;
    let scaleY = height / this.ORIGINAL_HEIGHT;

    // keeper 이미지 (페이드인)
    push();
    tint(255, this.keeperAlpha);
    imageMode(CENTER);
    image(
      this.keeperImages[this.idx],
      this.keeperRect.x,
      this.keeperRect.y,
      this.keeperRect.w,
      this.keeperRect.h
    );
    pop();

    // 텍스트 박스
imageMode(CENTER);
tint(255, 255);
image(this.textBox, this.dialogueBoxRect.x + this.dialogueBoxRect.w / 2,
    this.dialogueBoxRect.y + this.dialogueBoxRect.h / 2,
    this.dialogueBoxRect.w, this.dialogueBoxRect.h);
noTint();

const textX = this.dialogueBoxRect.x + this.textPaddingX;
const textBoxContentWidth = this.dialogueBoxRect.w - (this.textPaddingX * 2);

// ⭐ [수정 1] 텍스트의 y 좌표를 대화 상자 세로 중앙으로 설정합니다.
const fullDialogue = texts[this.idx]; // connecting.js의 경우: const fullDialogue = this.keeperDialogue[this.index];


    if (this.isTypingKeeper) {
        if (frameCount % this.interval === 0 && this.keeperIndex < fullDialogue.length) {
            this.keeperIndex++;
        } else if (this.keeperIndex >= fullDialogue.length) {
            this.isTypingKeeper = false;
        }
        this.keeperText = fullDialogue.substring(0, this.keeperIndex);
    }

// 3. 전체 텍스트를 기준으로 최종 높이를 계산합니다.
    textLeading(this.fontSize * 1.5);
    const fullWrappedText = this.wrapText(fullDialogue, textBoxContentWidth);
    const numLines = (fullWrappedText.match(/\n/g) || []).length + 1;
    const totalTextHeight = numLines * textLeading();

    // 4. 최종 높이를 기준으로 텍스트 블록의 시작 y 좌표를 고정합니다.
    const contentBoxTop = this.dialogueBoxRect.y + this.textPaddingY;
    const contentBoxHeight = this.dialogueBoxRect.h - (this.textPaddingY * 2);
    const startY = contentBoxTop + (contentBoxHeight - totalTextHeight) / 2;

    // 5. 현재까지 타이핑된 텍스트를 고정된 y 좌표에 그립니다.
    fill(255, this.keeperAlpha);
    noStroke();
    textSize(this.fontSize);
    textAlign(LEFT, TOP); // 정렬을 TOP으로 해야 y좌표가 기준이 됩니다.
    let currentWrappedText = this.wrapText(this.keeperText, textBoxContentWidth);
    text(currentWrappedText, textX, startY);

    // Show pulsing triangle when typing is finished
    if (!this.isTypingKeeper) {
      let arrowAlpha = map(sin(millis() * 0.005), -1, 1, 90, 220); // Pulsing effect
      fill(255, arrowAlpha);
      noStroke();
      let ar = this.arrowRect;
      triangle(ar.x, ar.y, ar.x + ar.w, ar.y, ar.x + ar.w / 2, ar.y + ar.h);
    }
  }

  displayText() {
 if (this.keeperState === "done") {
        if (
            frameCount % this.interval === 0 &&
            this.charIndex < this.storyText.length
        ) {
            this.displayedText += this.storyText[this.charIndex];
            this.charIndex++;
        }

      
        
        // ⭐ [수정] 폰트를 danjo.ttf로 변경하고, 크기를 약간 조절합니다.
        if (fontDanjo) {
            textFont(fontDanjo);
        }
        const currentTextSize = this.fontSize;
        textSize(currentTextSize);

         const textW = textWidth(this.displayedText); // 현재 텍스트의 너비 계산
        const textH = textAscent() + textDescent();  // 현재 폰트의 높이 계산
        
        const scale = width / this.ORIGINAL_WIDTH;
        const paddingX = 60 * scale; // 좌우 여백
        const paddingY = 30 * scale; // 상하 여백
        const cornerRadius = 20 * scale; // 모서리 둥글기

        // 텍스트가 한 글자라도 있을 때만 배경을 표시
        if (textW > 0) {
            const rectX = this.storyTextBoxRect.x;
            const rectY = this.storyTextBoxRect.y;
            const rectW = textW + paddingX;
            const rectH = textH + paddingY/2;

            push();
            rectMode(CENTER);
            noStroke();
            fill(0, 0, 0, 100); // 반투명한 검은색 배경
            rect(rectX, rectY, rectW, rectH, cornerRadius);
            pop();
        }

        fill(255);
        noStroke();
        textAlign(CENTER, CENTER);
        const yOffset = currentTextSize * 0.1; 
        text(this.displayedText, this.storyTextBoxRect.x, this.storyTextBoxRect.y - yOffset);

        // 다른 UI에 영향을 주지 않도록 기본 폰트로 되돌립니다.
        textFont('sans-serif');
    }
}

  wrapText(txt, maxWidth) {
    let words = txt.split("");
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

  handleMouseMoved() {
    this.hoveredIndex = -1;
    for (let card of this.cardRects) {
      if (
        mouseX > card.x &&
        mouseX < card.x + card.w &&
        mouseY > card.y &&
        mouseY < card.y + card.h
      ) {
        this.hoveredIndex = card.index;
        break;
      }
    }
  }

handleKeyPressed() {
    if (keyCode !== 32) return; // 스페이스바가 아니면 무시

    if (this.keeperState === "showing" || this.keeperState === "waiting") {
        if (this.isTypingKeeper) {
            // 타이핑 중이면 즉시 완료
            this.keeperText = texts[this.idx];
            this.keeperIndex = texts[this.idx].length;
            this.isTypingKeeper = false;
            // ⭐ [수정] 타이핑을 건너뛴 후, 바로 다음 입력을 받을 수 있도록 상태를 'waiting'으로 변경합니다.
            this.keeperState = "waiting"; 
        } else if (this.keeperState === "waiting") {
            // 타이핑이 끝났으면 대화창 닫기
            this.keeperAlpha = 0;
            if (this.selectedCard.length === 6 && this.idx === (texts.length - 1)) {
                if (this.sceneTransitionCallback) {
                    this.sceneTransitionCallback();
                }
            }
            this.keeperState = "done";
        }
    }
}

  handleMousePressed(callbackForNextSet) {
    // Re-calculate UI elements on mouse press in case of dynamic resizing
    this.setupUIElements();

    // Check if the click is within the keeper's text box when keeper is active
    const textBoxRect = {
      x: this.dialogueBoxRect.x,
      y: this.dialogueBoxRect.y,
      w: this.dialogueBoxRect.w,
      h: this.dialogueBoxRect.h
    };

    if (this.keeperState === "showing" || this.keeperState === "waiting") {
      if (mouseX > textBoxRect.x && mouseX < textBoxRect.x + textBoxRect.w &&
        mouseY > textBoxRect.y && mouseY < textBoxRect.y + textBoxRect.h) {
        if (this.isTypingKeeper) {
          // Skip typing animation
          this.keeperText = texts[this.idx];
          this.keeperIndex = texts[this.idx].length;
          this.isTypingKeeper = false;
          this.keeperAlpha = 255;
          this.keeperState = "waiting";
        } 
        else if (this.keeperState === "waiting") {
          // Advance dialogue after typing is complete
          this.keeperAlpha = 0;
          if (this.selectedCard.length === 6 && this.idx === (texts.length - 1)) {
            if (this.sceneTransitionCallback) {
              this.sceneTransitionCallback();
            }
          }
          this.keeperState = "done";
        }
      }
      return;
    }

    if (this.animating) return;

    for (let card of this.cardRects) {
      if (
        mouseX > card.x &&
        mouseX < card.x + card.w &&
        mouseY > card.y &&
        mouseY < card.y + card.h
      ) {
        if (this.sounds && this.sounds.cardFly) {
            this.sounds.cardFly.play();
        }
        this.selectedIndex = card.index;
        this.animating = true;
        this.animationStart = frameCount;

        const currentBlank = this.cardSet.blanks[this.blankIndex];
        const selectedWord = currentBlank.options[card.index];

        const startX = card.x + card.w / 2;
        const startY = card.y + card.h / 2;

        // 별 생성 위치 (카드 중심 기준)
        let newStar;
        let maxTries = 100;
        let minDist = 50;
        for (let tries = 0; tries < maxTries; tries++) {
          let tempStar = {
            x: random(windowWidth / 2 - windowHeight / 4, windowWidth / 2 + windowHeight / 4),
            y: random(windowHeight / 30, windowHeight / 2),
          };
          let tooClose = this.starPositions.some(
            (s) => dist(s.x, s.y, tempStar.x, tempStar.y) < minDist
          );
          if (!tooClose) {
            newStar = tempStar;
            break;
          }
        }
        if (!newStar) newStar = { x: startX, y: startY }; // fallback

        this.animatingCard = {
          startX,
          startY,
          targetX: newStar.x,
          targetY: newStar.y,
          arcHeight: 80,
          cardW: card.w, // 애니메이션 중인 카드의 너비를 저장
          cardH: card.h
        };

        setTimeout(() => {
          const questionBlank = "[ ? ]";
          const normalBlank = "[ ]";
          const word = selectedWord;

          // 현재 선택할 차례인 [ ? ] 찾기
          let questionIndex = this.storyText.indexOf(questionBlank);
          if (questionIndex !== -1) {
            // [ ? ] → 선택된 단어로 대체
            this.storyText =
              this.storyText.slice(0, questionIndex) +
              word +
              this.storyText.slice(questionIndex + questionBlank.length);

            // 다음 [ ] → [ ? ]로 변경
            let nextBlankIndex = this.storyText.indexOf(normalBlank, questionIndex + word.length);
            if (nextBlankIndex !== -1) {
              this.storyText =
                this.storyText.slice(0, nextBlankIndex) +
                questionBlank +
                this.storyText.slice(nextBlankIndex + normalBlank.length);
            }

            // 텍스트 갱신
            this.displayedText = this.storyText.substring(0, this.charIndex);
          }

          this.starPositions.push({
            x: newStar.x,
            y: newStar.y,
            alpha: 0,
            sparkleTimer: 0,
          });
          this.selectedCard.push({
            text: selectedWord,
            image: currentBlank.images[card.index],
            star: {
              x: newStar.x,
              y: newStar.y,
              alpha: 0,
              sparkleTimer: 0,
            },
            bgm: currentBlank.bgms[card.index],
            nickName: currentBlank.nickNames[card.index],
            colour: currentBlank.colors[card.index],
          });
          console.log(this.selectedCard[this.selectedCard.length - 1].star.x)

          if (this.blankIndex === 0) {
            this.blankIndex = 1;
            this.isCardFrontShowing = new Array(this.cardSet.blanks[1].options.length).fill(false);
            this.hoverAngles = new Array(
              this.cardSet.blanks[1].options.length
            ).fill(0);
            this.selectedIndex = -1;
            this.animating = false;
          } else {
            setTimeout(() => {
              this.keeperState = "showing";
              this.keeperIndex = 0;
              this.keeperText = "";
              this.idx = this.selectedCard.length / 2;
              this.isTypingKeeper = true; // Start typing for the next keeper dialogue
              this.animating = false;
              this.selectedIndex = -1;
              callbackForNextSet();
            }, 1500);
          }
        }, 2000);
        break;
      }
    }
  }
}

function easeOutCubic(t) {
  return 1 - pow(1 - t, 3);
}
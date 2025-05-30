class Choosing {
    constructor(selectedCard) {
        this.cardSet = null;
        this.storyText = "";
        this.selectedCard = selectedCard || []; // 선택된 카드 정보 저장
        this.cardWidth = windowWidth / 11;
        this.cardHeight = windowHeight / 4;

        // 텍스트 출력 관련 변수들
        this.displayedText = "";
        this.charIndex = 0;
        this.interval = 3;
        this.fontSize = 50;

        // 텍스트 박스 위치
        this.boxX = windowWidth / 20;
        this.boxY = windowHeight / 6;
        this.boxW = windowWidth * 2/5;
        this.boxH = 160;

        this.cardRects = [];
        this.hoveredIndex = -1;
        this.hoverAngles = [];

        this.animating = false;
        this.animationStart = 0;
        this.fadeDuration = 120;
        this.blankIndex = 0; // 현재 선택 중인 빈칸 인덱스

        this.cardImages = [];
        this.cardBackImage = null;

        this.starPositions = [];
        this.selectedIndex = -1;
    }

    set(cardSet, cardBackImage) {
        this.cardSet = cardSet;
        this.storyText = cardSet.storyText;
        this.displayedText = "";
        this.charIndex = 0;
        this.cardRects = [];
        this.hoveredIndex = -1;
        this.animating = false;
        this.blankIndex = 0;
        this.cardBackImage = cardBackImage;
        this.hoverAngles = new Array(cardSet.blanks[0].options.length).fill(0);
        this.selectedIndex = -1;
    }

    update() {
        for (let i = 0; i < this.hoverAngles.length; i++) {
            let target = (i === this.hoveredIndex) ? PI : 0;
            this.hoverAngles[i] = lerp(this.hoverAngles[i], target, 0.07);
        }
    }
show() {
    let currentBlank = this.cardSet.blanks[this.blankIndex];
    let options = currentBlank.options;
    let images = currentBlank.images;

    this.cardRects = [];

    for (let c = 0; c < options.length; c++) {
        let x = windowWidth / 30 + windowWidth / 9 * c;
        let baseY = windowHeight - this.cardHeight - windowHeight / 10;
        let w = this.cardWidth;
        let h = this.cardHeight;

        let y = baseY;
        let fadeAmt = 255;
        let offsetY = 0;

        if (this.animating) {
            let t = constrain((frameCount - this.animationStart) / this.fadeDuration, 0, 1);
            if (c === this.selectedIndex) {
                let targetY = this.boxY + this.boxH + 20;
                offsetY = (targetY - baseY) * easeOutQuad(t);
                fadeAmt = 255;
            } else {
                fadeAmt = 255 * (1 - t);
            }
        }

        let flipAngle = this.hoverAngles[c];
let showFront = flipAngle > HALF_PI;

// 애니메이션 중이면 무조건 앞면 표시
if (this.animating && c === this.selectedIndex) {
    showFront = true;
}


        push();
        translate(x + w / 2, y + offsetY + h / 2);

        if (!showFront) {
            scale(cos(flipAngle), 1);
        }

        tint(255, fadeAmt);

        if (showFront) {
            this.drawCardFront(0, 0, w, h, images[c], options[c]);
        } else {
            drawingContext.save();
            rectMode(CENTER);
            drawingContext.beginPath();
            drawingContext.roundRect(-w / 2, -h / 2, w, h, 8);
            drawingContext.clip();
            image(this.cardBackImage, 0, 0, w, h);
            drawingContext.restore();
        }

        noTint();
        pop();

        this.cardRects.push({ x, y: baseY, w, h, index: c });
    }

    for (let star of this.starPositions) {
        fill(255);
        noStroke();
        ellipse(star.x, star.y, 20, 20);
    }
}


    drawCardFront(x, y, w, h, img, label) {
    push();
    translate(x, y);

    stroke(160, 120, 80);
    strokeWeight(4);
    fill(255);
    rectMode(CENTER);
    rect(0, 0, w, h, 8);

    noStroke();
    imageMode(CENTER);
    image(img, 0, -h * 0.1, w * 0.9, h * 0.7);

    // 🔻 텍스트 배경 제거 (stroke/rect 없앰)
    noStroke();
    fill(100); // 회색 텍스트
    textAlign(CENTER, CENTER);
    textSize(h * 0.07); // 원래대로 줄임
    text(label, 0, h * 0.35);

    pop();
}

    displayText() {
        if (frameCount % this.interval === 0 && this.charIndex < this.storyText.length) {
            this.displayedText += this.storyText[this.charIndex];
            this.charIndex++;
        }

        fill(255, 254, 180);
        noStroke();
        textSize(this.fontSize);
        textAlign(LEFT, TOP);

        let wrapped = this.wrapText(this.displayedText, this.boxW);
        text(wrapped, this.boxX, this.boxY);
    }

    wrapText(txt, maxWidth) {
        let words = txt.split('');
        let lines = '';
        let line = '';

        for (let i = 0; i < words.length; i++) {
            let testLine = line + words[i];
            if (textWidth(testLine) > maxWidth) {
                lines += line + '\n';
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
                mouseX > card.x && mouseX < card.x + card.w &&
                mouseY > card.y && mouseY < card.y + card.h
            ) {
                this.hoveredIndex = card.index;
                break;
            }
        }
    }

    handleMousePressed(callbackForNextSet) {
    if (this.animating) return;

    for (let card of this.cardRects) {
        if (
            mouseX > card.x && mouseX < card.x + card.w &&
            mouseY > card.y && mouseY < card.y + card.h
        ) {
            this.selectedIndex = card.index;
            this.animating = true;
            this.animationStart = frameCount;

            const currentBlank = this.cardSet.blanks[this.blankIndex];
            const selectedWord = currentBlank.options[card.index];

            this.selectedCard.push({
                text: selectedWord,
                image: currentBlank.images[card.index]
            });

            // 별 추가
            let starX = random(windowWidth * 9 / 17, windowWidth * 29 / 30);
            let starY = random(windowHeight / 8, windowHeight * 7 / 8);
            this.starPositions.push({ x: starX, y: starY });

            // 2초 후 카드 애니메이션 완료 → 텍스트 삽입
            setTimeout(() => {
                const blankPlaceholder = "___";
                let blankPos = this.storyText.indexOf(blankPlaceholder);
                if (blankPos !== -1) {
                    this.storyText = this.storyText.slice(0, blankPos) + `[${selectedWord}]` + this.storyText.slice(blankPos + blankPlaceholder.length);
                    this.displayedText = this.storyText.substring(0, this.charIndex);
                }

                // 빈칸이 더 있다면 다음 카드 세트로 가지 않고 계속 진행
                if (this.blankIndex === 0) {
                    this.blankIndex = 1;
                    this.hoverAngles = new Array(this.cardSet.blanks[1].options.length).fill(0);
                    this.selectedIndex = -1;
                    this.animating = false;
                } else {
                    // 문장 완성 후 2초간 보여주고 다음 카드 세트 호출
                    setTimeout(() => {
                        this.animating = false;
                        this.selectedIndex = -1;
                        callbackForNextSet();
                    }, 1500);
                }

            }, 2000); // 카드 애니메이션 지속 시간

            break;
        }
    }
    }
}

function easeOutQuad(t) {
    return t * (2 - t);
}

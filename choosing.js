class Choosing {
    constructor(selectedCard) {
        this.cardList = [];
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
        this.boxW = windowWidth * 7 / 15;
        this.boxH = 160;

        this.cardRects = [];
        this.hoveredIndex = -1;
        this.hoverAngles = [];

        this.animating = false;
        this.animationStart = 0;
        this.fadeDuration = 120;
        this.selectedIndex = -1;
        this.onTransitionComplete = null;

        this.cardImages = [];
        this.cardBackImage = null;

        this.starPositions = [];
    }

    set(cardList, storyText, cardImages, cardBackImage) {
        this.cardList = cardList;
        this.storyText = storyText;
        this.cardImages = cardImages;
        this.cardBackImage = cardBackImage;
        this.displayedText = "";
        this.charIndex = 0;
        this.cardRects = [];
        this.hoveredIndex = -1;
        this.animating = false;
        this.selectedIndex = -1;
        this.hoverAngles = new Array(cardList.length).fill(0);
    }

    update() {
        if (this.animating) {
            let t = (frameCount - this.animationStart) / this.fadeDuration;
            if (t >= 1) {
                this.animating = false;
                if (this.onTransitionComplete) this.onTransitionComplete();
            }
        }

        for (let i = 0; i < this.hoverAngles.length; i++) {
            let target = (i === this.hoveredIndex || i === this.selectedIndex) ? PI : 0;
            this.hoverAngles[i] = lerp(this.hoverAngles[i], target, 0.07);
        }
    }

    show() {
        this.cardRects = [];

        for (let c = 0; c < this.cardList.length; c++) {
            let x = windowWidth / 30 + windowWidth / 9 * c;
            let y = windowHeight - this.cardHeight - windowHeight / 10;
            let w = this.cardWidth;
            let h = this.cardHeight;

            let fadeAmt = 255;
            let offsetY = 0;

            if (this.animating) {
                let t = constrain((frameCount - this.animationStart) / this.fadeDuration, 0, 1);
                if (c === this.selectedIndex) {
                    let targetY = this.boxY + this.boxH + 20;
                    offsetY = (targetY - y) * easeOutQuad(t);
                    fadeAmt = 255;
                } else {
                    fadeAmt = 255 * (1 - t);
                }
            }

            let flipAngle = this.hoverAngles[c];
            let showFront = flipAngle > HALF_PI;

            push();
            translate(x + w / 2, y + offsetY + h / 2);

            // 좌우 반전은 하되, 앞면일 때는 다시 원래대로 돌려줌
            if (!showFront) {
            scale(cos(flipAngle), 1); // 뒷면만 뒤집기 적용
            }

            tint(255, fadeAmt);

            if (showFront) {
                this.drawCardFront(0, 0, w, h, this.cardImages[c], this.cardList[c]);
            } else {
                drawingContext.save();
                beginShape();
                rectMode(CENTER);
                drawingContext.beginPath();
                drawingContext.roundRect(-w/2, -h/2, w, h, 8); // 둥근 모서리
                drawingContext.clip();

                // 이미지 그리기 (둥근 테두리 안에만 보임)
                image(this.cardBackImage, 0, 0, w, h);

                drawingContext.restore();
            }

            noTint();
            pop();

            this.cardRects.push({ x, y, w, h, index: c });
        }

        for (let star of this.starPositions) {
            fill(255, 255, 0);
            noStroke();
            ellipse(star.x, star.y, 30, 30);
        }
    }

    drawCardFront(x, y, w, h, img, label) {
        push();
        translate(x, y);

        // 카드 테두리 (갈색)
        stroke(160, 120, 80);
        strokeWeight(4);
        fill(255);
        rectMode(CENTER);
        rect(0, 0, w, h, 8);

        // 이미지
        noStroke();
        imageMode(CENTER);
        image(img, 0, -h * 0.1, w * 0.9, h * 0.7);

        // 하단 텍스트 박스
        strokeWeight(2);
        stroke(100,100,220);
        fill(255);
        rect(0, h * 0.35, w * 0.9, h * 0.25, 4);
        noStroke();

        // 텍스트
        fill(100);
        textAlign(CENTER, CENTER);
        textSize(h * 0.1);
        text(label, 0, h * 0.35);

        pop();
    }

    displayText() {
        if (frameCount % this.interval === 0 && this.charIndex < this.storyText.length) {
            this.displayedText += this.storyText[this.charIndex];
            this.charIndex++;
        }

        fill(0);
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
                this.onTransitionComplete = callbackForNextSet;

                let starX = random(windowWidth * 9 / 17, windowWidth * 29 / 30);
                let starY = random(windowHeight / 8, windowHeight * 7 / 8);
                this.starPositions.push({ x: starX, y: starY });

                this.selectedCard.push({
                    text: this.cardList[card.index],
                    image: this.cardImages[card.index]
                });

                break;
            }
        }
    }
}

function easeOutQuad(t) {
    return t * (2 - t);
}

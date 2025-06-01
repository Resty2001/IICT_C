class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = random(1, 3);
        this.alpha = 255;
        this.vx = random(-0.5, 0.5);
        this.vy = random(-0.5, 0.5);
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
        fill(255, 255, 200, this.alpha);
        ellipse(this.x, this.y, this.radius * 2);
    }
}

function createParticleManager() {
    return {
        particles: [],

        add(x, y, count = 5) {
            for (let i = 0; i < count; i++) {
                this.particles.push(new Particle(x, y));
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

class Choosing {
    constructor(selectedCard) {
        this.cardSet = null;
        this.storyText = "";
        this.selectedCard = selectedCard || [];
        this.cardWidth = windowWidth / 11;
        this.cardHeight = windowHeight / 4;

        this.displayedText = "";
        this.charIndex = 0;
        this.interval = 3;
        this.fontSize = 50;

        this.boxX = windowWidth / 20;
        this.boxY = windowHeight / 6;
        this.boxW = windowWidth * 2 / 5;
        this.boxH = 160;

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
    }

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
        this.selectedIndex = -1;
        this.animatingCard = null;
    }

    update() {
        for (let i = 0; i < this.hoverAngles.length; i++) {
            let target = (i === this.hoveredIndex) ? PI : 0;
            this.hoverAngles[i] = lerp(this.hoverAngles[i], target, 0.07);
        }

        for (let star of this.starPositions) {
    star.alpha = min(255, star.alpha + 4);
    if (star.alpha === 255) {
        star.sparkleTimer++;
        if (star.sparkleTimer % 10 === 0) {
            particleManager.add(star.x, star.y, 2);
        }
    }
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
            let alpha = 255;
            let scaleAmt = 1;
            let angle = this.hoverAngles[c];
            let showFront = angle > HALF_PI;

            if (this.animating) {
                let t = constrain((frameCount - this.animationStart) / this.fadeDuration, 0, 1);

                if (c === this.selectedIndex) {
                    const anim = this.animatingCard;
                    if (anim) {
                        let progress = easeOutCubic(t);
                        x = lerp(anim.startX, anim.targetX - w/2, progress);
                        y = lerp(anim.startY, anim.targetY - h/2, progress) - anim.arcHeight * sin(progress * PI);
                        scaleAmt = lerp(1, 0.08, progress);
                        alpha = 255 * (1 - progress);
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

    // Draw the core star
    noStroke();
    fill(255, star.alpha);
    ellipse(0, 0, 10);

    // Glow effect
    if (star.alpha === 255) {
        let glowSize = 10 + sin(star.sparkleTimer * 0.3) * 5;
        stroke(255, 255, 255, 100 + 50 * sin(star.sparkleTimer * 0.4));
        strokeWeight(1.5);
        noFill();
        ellipse(0, 0, glowSize * 2, glowSize * 1.5);
        ellipse(0, 0, glowSize * 1.2, glowSize * 2.3);
    }

    pop();
}

particleManager.updateAndShow();
    }

    drawCardFront(x, y, w, h, img, label, alpha) {
        push();
        translate(x, y);
        rectMode(CENTER);

        fill(255, alpha);
        stroke(160, 120, 80, alpha);
        strokeWeight(4);
        rect(0, 0, w, h, 8);

        noStroke();
        imageMode(CENTER);
        tint(255, alpha);
        image(img, 0, -h * 0.1, w * 0.9, h * 0.7);

        noTint();
        fill(100, alpha);
        textAlign(CENTER, CENTER);
        textSize(h * 0.07);
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

                const startX = card.x + card.w / 2;
                const startY = card.y + card.h / 2;

                // 별 생성 위치 (카드 중심 기준)
                let newStar;
                let maxTries = 100;
                let minDist = 50;
                for (let tries = 0; tries < maxTries; tries++) {
                    let tempStar = {
                        x: random(windowWidth * 9 / 17, windowWidth * 29 / 30),
                        y: random(windowHeight / 8, windowHeight * 7 / 8)
                    };
                    let tooClose = this.starPositions.some(s => dist(s.x, s.y, tempStar.x, tempStar.y) < minDist);
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
                    arcHeight: 80
                };

                this.selectedCard.push({
                    text: selectedWord,
                    image: currentBlank.images[card.index]
                });

                // 2초 후 텍스트 반영
                setTimeout(() => {
                    const blankPlaceholder = "___";
                    let blankPos = this.storyText.indexOf(blankPlaceholder);
                    if (blankPos !== -1) {
                        this.storyText = this.storyText.slice(0, blankPos) + `[${selectedWord}]` + this.storyText.slice(blankPos + blankPlaceholder.length);
                        this.displayedText = this.storyText.substring(0, this.charIndex);
                    }

                    this.starPositions.push({
    x: newStar.x,
    y: newStar.y,
    alpha: 0,
    sparkleTimer: 0
});

                    if (this.blankIndex === 0) {
                        this.blankIndex = 1;
                        this.hoverAngles = new Array(this.cardSet.blanks[1].options.length).fill(0);
                        this.selectedIndex = -1;
                        this.animating = false;
                    } else {
                        setTimeout(() => {
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

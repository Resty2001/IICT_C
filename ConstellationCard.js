class ConstellationCard {
    constructor(width, height, fonts) {
        this.cardWidth = width;
        this.cardHeight = height;
        this.fonts = fonts; 
    }


// ConstellationCard.js 파일의 createCardImage 함수를 아래 코드로 교체해주세요.

createCardImage(bgImage, constellationImage, name, story) {
        let card = createGraphics(this.cardWidth, this.cardHeight);
        
        card.push();

        // 1. 배경 이미지 그리기
        card.imageMode(CORNER);
        card.image(bgImage, 0, 0, this.cardWidth, this.cardHeight);

        // 2. 캡처된 별자리 이미지 그리기
        if (constellationImage) {
            let imgWidth = this.cardWidth * 0.8;
            let imgHeight = imgWidth * (constellationImage.height / constellationImage.width);
            let imgX = (this.cardWidth - imgWidth) / 2;
            // ⭐ [수정 1] 별자리 이미지 위치를 위로 올립니다. (0.12 -> 0.10)
            let imgY = this.cardHeight * 0.10; 
            card.imageMode(CORNER);
            card.image(constellationImage, imgX, imgY, imgWidth, imgHeight);
        }
        
        // 3. 별자리 이름("치유사 자리") 텍스트 그리기
        card.textAlign(CENTER, CENTER);
        card.noStroke();
        if (this.fonts && this.fonts.title) {
            card.textFont(this.fonts.title);
        }
        card.fill('#FDBB53'); 
        // ⭐ [수정 2] 이름이 한 줄에 표시되도록 폰트 크기를 미세 조정합니다. (0.075 -> 0.07)
        card.textSize(this.cardWidth * 0.07);
        card.textStyle(BOLD);
        // ⭐ [수정 3] 이름 텍스트 위치를 위로 올립니다. (0.67 -> 0.65)
        card.text(name, this.cardWidth / 2, this.cardHeight * 0.65);

        // 4. 별자리 이야기 텍스트 그리기
        if (this.fonts && this.fonts.story) {
            card.textFont(this.fonts.story);
        }
        card.fill('#FDBB53');
        card.textSize(this.cardWidth * 0.05);
        card.textStyle(NORMAL);
        
        card.textAlign(CENTER, TOP); 
        let storyMaxWidth = this.cardWidth * 0.75;
        let storyX = this.cardWidth * 0.125;
        // ⭐ [수정 4] 이야기 텍스트 위치를 위로 올립니다. (0.75 -> 0.73)
        let storyY = this.cardHeight * 0.73;
        let storyH = this.cardHeight * 0.2;
        card.text(story, storyX, storyY, storyMaxWidth, storyH);

        card.pop();

        return card;
    }
}
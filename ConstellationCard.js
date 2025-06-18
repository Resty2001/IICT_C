class ConstellationCard {
    constructor(width, height, fonts) {
        this.cardWidth = width;
        this.cardHeight = height;
        this.fonts = fonts; 
    }


// ConstellationCard.js 파일의 createCardImage 함수를 아래 코드로 교체해주세요.

    createCardImage(bgImage, constellationImage, story, name) {
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
            // ⭐ 1. [수정] 이미지 위치를 아래로 더 내립니다.
            let imgY = this.cardHeight * 0.12; 
            card.imageMode(CORNER);
            card.image(constellationImage, imgX, imgY, imgWidth, imgHeight);
        }
        
        // 3. 별자리 이름("치유사자리") 텍스트 그리기
        card.textAlign(CENTER, CENTER);
        card.noStroke();
        // ⭐ 2. [수정] 이름 글꼴과 색상을 지정합니다.
        if (this.fonts && this.fonts.title) {
            card.textFont(this.fonts.title);
        }
        card.fill('#FDBB53'); 
        card.textSize(this.cardWidth * 0.075);
        card.textStyle(BOLD);
        card.text(name, this.cardWidth / 2, this.cardHeight * 0.67);

        // 4. 별자리 이야기 텍스트 그리기
        // ⭐ 3. [수정] 이야기 글꼴과 색상을 지정합니다.
        if (this.fonts && this.fonts.story) {
            card.textFont(this.fonts.story);
        }
        card.fill('#FDBB53');
        card.textSize(this.cardWidth * 0.05); // 폰트 크기 미세 조정
        card.textStyle(NORMAL);
        
        // ⭐ 4. [수정] 텍스트를 왼쪽 정렬하고, 위치를 좌측으로 크게 이동시킵니다.
        card.textAlign(CENTER, TOP); 
        let storyMaxWidth = this.cardWidth * 0.75;
        let storyX = this.cardWidth * 0.125; // 카드 왼쪽 끝에서 10% 떨어진 위치
        let storyY = this.cardHeight * 0.75;
        let storyH = this.cardHeight * 0.2;
        card.text(story, storyX, storyY, storyMaxWidth, storyH);

        card.pop();

        return card;
    }
}
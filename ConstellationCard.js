class ConstellationCard {
    constructor(width, height, fonts) {
        this.cardWidth = width;
        this.cardHeight = height;
        this.fonts = fonts; 
    }

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
            let imgY = this.cardHeight * 0.12;
            card.imageMode(CORNER);
            card.image(constellationImage, imgX, imgY, imgWidth, imgHeight);
        }
        
        // 텍스트 스타일 설정
        card.textAlign(CENTER, CENTER);
        card.fill(230, 230, 240);
        card.noStroke();

        // 3. 별자리 이름 텍스트 그리기
        card.textSize(this.cardWidth * 0.075);
        card.textStyle(BOLD);
        card.text(name, this.cardWidth / 2, this.cardHeight * 0.65);

        // 4. 별자리 이야기 텍스트 그리기
        card.textSize(this.cardWidth * 0.035);
        card.textStyle(NORMAL);
        let storyMaxWidth = this.cardWidth * 0.8;
        
        // ⭐ 수정된 부분: 텍스트 영역을 명확히 지정하여 중앙 정렬 문제를 해결합니다.
        let storyY = this.cardHeight * 0.72; // 텍스트 영역 시작 Y 위치
        let storyH = this.cardHeight * 0.25; // 텍스트 영역 높이
        // card.text 함수에 높이(storyH) 인자를 추가합니다.
        card.text(story, this.cardWidth / 2, storyY, storyMaxWidth, storyH);

        card.pop();

        return card;
    }
}
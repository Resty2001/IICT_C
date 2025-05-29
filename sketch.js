let currentIndex = 0;
let storyText = "";
let cardBackImage, choosing, backGroundImage;
let imgList = [];
let cardList = [];
let cardImages = [];
let cardSets = [];
let selectedCard = [];
let sceneNumber = 1;
let introScene;      
let introImages = {}; 


function preload() {
  for (let i = 0; i <= 7; i++) {
    imgList.push(loadImage("assets/anim" + i + ".png"));
  }
  cardBackImage = loadImage("assets/dog.jpg")
  backGroundImage = loadImage("assets/Nightsky_Blank.png");
  introImages.mainBackground = loadImage('assets/Nightsky_Blank(2).png');
    introImages.subBackground = loadImage('assets/subBackground.png');
    introImages.workshopImg = loadImage('assets/workshop.png');
    introImages.workshopInsideImg = loadImage('assets/workshopBackground (1).png');
    introImages.keeperImg = loadImage('assets/keeperBlank(3).png');
    introImages.textBox = loadImage('assets/textBox.png');
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
// --- 인트로 씬 완료 시 호출될 함수 정의 ---
    const goNextScene = () => {
        sceneNumber = 2;};

// --- IntroScene 객체 생성 ---
 introScene = new IntroScene(introImages, goNextScene);

  cardSets = [
  {
    cardList: ["사랑", "정의", "평화", "바다"],
    storyText: "당신의 기억은 어디서부터 시작되었나요?",
    cardImages: [imgList[0], imgList[1], imgList[2], imgList[3]]
  },
  {
    cardList: ["꿈", "빛", "고난", "약속"],
    storyText: "그 기억은 당신의 마음에 어떤 흔적을 남겼나요?",
    cardImages: [imgList[4], imgList[5], imgList[6], imgList[7]]
  },
  // 더 많은 세트 추가 가능
  ];

  choosing = new Choosing(selectedCard);
  let set = cardSets[currentIndex];
  choosing.set(set.cardList, set.storyText, set.cardImages, cardBackImage);
  imageMode(CENTER);
}

function draw() {
  background(255);
  // sceneNumber가 3이면 main game scene (3은 임의의 값 변경 가능능)
 if (sceneNumber === 1) {
        introScene.draw(); // 인트로 씬 그리기
    } else if (sceneNumber === 2) {
        // 기존 카드 씬 그리기 (배경 이미지가 인트로와 다를 경우 여기서 그려야 함)
        image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
        choosing.update();
        choosing.show();
        choosing.displayText();
    }
    // 다른 씬 번호가 있다면 여기에 추가...
}

function mouseMoved() {
  if (sceneNumber === 2 && choosing) {
    choosing.handleMouseMoved();
  }
}

function mousePressed() {
if (sceneNumber === 1) {
        introScene.handleMousePressed(); // 인트로 씬 마우스 처리
    } else if (sceneNumber === 2 && choosing) {
        choosing.handleMousePressed(() => {
            let next = ++currentIndex;
            if (next < cardSets.length) {
                let set = cardSets[next];
                choosing.set(set.cardList, set.storyText, set.cardImages, cardBackImage);
            } else {
                // 모든 카드 선택 완료 후 다른 씬으로 전환 등
                console.log("모든 카드 선택 완료!");
                // sceneNumber = 3; // 예를 들어 결과 씬으로 전환
            }
        });
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (introScene) {
        introScene.handleWindowResized();
    }}

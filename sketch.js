let currentIndex = 0;
let storyText = "";
let cardBackImage, choosing, backGroundImage;
let imgList = [];
let cardList = [];
let cardImages = [];
let cardSets = [];
let selectedCard = [];
let sceneNumber = 3;
function preload() {
  for (let i = 0; i <= 7; i++) {
    imgList.push(loadImage("assets/anim" + i + ".png"));
  }
  cardBackImage = loadImage("assets/dog.jpg")
  backGroundImage = loadImage("assets/Nightsky_Blank.png");
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
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
  if (sceneNumber === 3){
    image(backGroundImage, width/2, height/2, windowWidth, windowHeight);
    choosing.update();
    choosing.show();
    choosing.displayText();
  }
}

function mouseMoved() {
  if (choosing) {
    choosing.handleMouseMoved();
  }
}

function mousePressed() {
  choosing.handleMousePressed(() => {
    let next = ++currentIndex;
    if (next < cardSets.length) {
      let set = cardSets[next];
      choosing.set(set.cardList, set.storyText, set.cardImages, cardBackImage);
    }
  });
}


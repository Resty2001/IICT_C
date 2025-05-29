let currentIndex = 0;
let storyText = "";
let cardBackImage, choosing, backGroundImage, fadeManager;
let imgList = [];
let cardSets = [];
let selectedCard = [];
let sceneNumber = 1;
let introScene;      
let introImages = {}; 


function preload() {
  for (let i = 0; i <= 39; i++) {
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
      storyText: "나는 ___ 날, 모두의 축하를 받으며 ___에서 태어났다.",
      blanks: [
        {
          options: ["꽃이 만개하던", "햇살이 타오르던", "낙엽이 물들던", "함박눈이 내리던"],
          images: [imgList[0], imgList[1], imgList[2], imgList[3]]
        },
        {
          options: ["북적이는 대도시", "정겨운 소도시", "한적한 시골", "머나먼 타지"],
          images: [imgList[4], imgList[5], imgList[6], imgList[7]]
        }
      ]
    },
    {
      storyText: "어린 시절 ___이었던 나는 훗날 ___ 꿈꾸었다.",
      blanks: [
        {
          options: ["당돌찬 모험가", "인기 많은 사교가", "부끄러운 사색가", "꿈 많은 몽상가"],
          images: [imgList[8], imgList[9], imgList[10], imgList[11]]
        },
        {
          options: ["세상을 이끌길", "진리를 탐구하길", "사랑을 전하길", "나만의 길을 찾길"],
          images: [imgList[12], imgList[13], imgList[14], imgList[15]]
        }
      ]
    },
    {
      storyText: "나의 마음을 가득 채웠던 것은 ___이었고, 그것은 내 삶의 ___이 되었다.",
      blanks: [
        {
          options: ["소중한 인연", "세상의 인정", "간절했던 꿈", "몸과 맘의 평화"],
          images: [imgList[16], imgList[17], imgList[18], imgList[19]]
        },
        {
          options: ["든든한 뿌리", "멈추지 않는 힘", "길잡이 별", "빛나는 보람"],
          images: [imgList[20], imgList[21], imgList[22], imgList[23]]
        }
      ]
    },
    {
      storyText: "나는 ___이라는 어둠 속에서 길을 잃었지만, 결국 ___이라는 빛을 얻었다.",
      blanks: [
        {
          options: ["예상 못한 실패", "뼈아픈 이별", "깊은 외로움", "내면의 불신"],
          images: [imgList[24], imgList[25], imgList[26], imgList[27]]
        },
        {
          options: ["세상을 보는 눈", "포기 않는 마음", "타인을 향한 마음", "나 자신의 수용"],
          images: [imgList[28], imgList[29], imgList[30], imgList[31]]
        }
      ]
    },
    {
      storyText: "남겨진 이들에게 ___라고 속삭이며, 나의 빛이 그들에게 ___으로 닿기를 바란다.",
      blanks: [
        {
          options: ["고마웠어요", "미안해요", "잊지 말아요", "다시 만나요"],
          images: [imgList[32], imgList[33], imgList[34], imgList[35]]
        },
        {
          options: ["따뜻한 위로", "함께한 웃음", "빛나는 길잡이", "살아갈 힘"],
          images: [imgList[36], imgList[37], imgList[38], imgList[39]]
        }
      ]
    }
  ];

  choosing = new Choosing(selectedCard);
  let set = cardSets[currentIndex];
  choosing.set(set, cardBackImage);
  imageMode(CENTER);
}

function draw() {
  background(255);
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
          choosing.set(set, cardBackImage);
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

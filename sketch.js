let currentIndex = 0;
let storyText = "";
let choosing, backGroundImage;
let imgList = [];
let cardSets = [];
let selectedCard = [];
let cardBackImages = [];
let sceneNumber = 1;
let introScene, outroScene;      
let introImages = {};
let fade = 0;
let fadeSpeed = 4;


function preload() {
    for (let i = 0; i <= 39; i++) {
        imgList.push(loadImage("assets/anim" + i + ".png"));
    }
    cardBackImages = [
        loadImage("assets/card.green.png"),
        loadImage("assets/card.purple.png"),
        loadImage("assets/card.red.png"),
        loadImage("assets/card.yellow.png")
    ]
    backGroundImage = loadImage("assets/Nightsky_Blank.png");
    introImages.mainBackground = loadImage('assets/Nightsky_Blank(2).png');
    introImages.subBackground = loadImage('assets/subBackground.png');
    introImages.workshopImg = loadImage('assets/workshop.png');
    introImages.workshopInsideImg = loadImage('assets/workshopBackground (1).png');
    introImages.textBox = loadImage('assets/textBox.png');

    // --- 공방지기 이미지들 ---
    introImages.keeper_normal = loadImage('assets/keeper1.png');
    introImages.keeper_smile1 = loadImage('assets/keepersmile1.png');
    introImages.keeper_smile2 = loadImage('assets/keepersmile2.png');
    introImages.keeper_surprised1 = loadImage('assets/keepersurprised1.png');
    introImages.keeper_talk1 = loadImage('assets/keepertalk1.png');
    introImages.keeper_talk2 = loadImage('assets/keepertalk2.png');
    introImages.keeper_talk3 = loadImage('assets/keepertalk3.png');
    
    // --- 아웃트로용 이미지 로드 추가 ---
    introImages.qrCode = loadImage('assets/qrTest.png'); 
    introImages.finalConstellationTest = loadImage('assets/finalConstellationTest.jpg'); 
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont("sans-serif");
    
    const goNextScene = () => {
        sceneNumber = 2;
        currentIndex = 0;
        selectedCard = [];
        choosing.set(cardSets[currentIndex], cardBackImages);
        fade = 0;
    };

    const returnToStart = () => {
        sceneNumber = 1;
        if(introScene) introScene.reset();
    };

    // --- 각 씬 객체 생성 ---
    introScene = new IntroScene(introImages, goNextScene);
    
    // ★★★ 이 부분만 수정되었습니다 ★★★
    // OutroScene은 첫 번째 인자로 모든 이미지를 받으므로, 두 번째 인자는 필요 없습니다.
    outroScene = new OutroScene(introImages, returnToStart);

    cardSets = [
    {
      storyText: "___ 날에 태어난 나는 어릴 적부터 ___ 꿈꾸었다.",
      blanks: [
        {
          options: ["꽃이 만개하던", "햇살이 타오르던", "낙엽이 물들던", "함박눈이 내리던"],
          images: [imgList[0], imgList[1], imgList[2], imgList[3]]
        },
        {
          options: ["세상을 이끌길", "진리를 탐구하길", "사랑을 전하길", "나만의 길을 가길"],
            images: [imgList[4], imgList[5], imgList[6], imgList[7]]
        }
      ]
    },
    {
      storyText: "나에게 가장 큰 가치는 ___이었고, 삶의 가장 큰 시련은 ___이었다.",
      blanks: [
        {
          options: ["소중한 인연", "세상의 인정", "간절했던 꿈", "몸과 마음의 안정"],
          images: [imgList[8], imgList[9], imgList[10], imgList[11]]
        },
        {
          options: ["예상 못한 실패", "뼈아픈 이별", "깊은 외로움", "내면의 불신"],
          images: [imgList[12], imgList[13], imgList[14], imgList[15]]
        }
      ]
    },
    {
      storyText: "나의 육신은 ___ 잠들지만,  나의 별자리는 ___ 남아 그들에게 닿기를 바란다.",
      blanks: [
        {
          options: ["푸른 나무로", "한줌 흙으로", "깊은 바다에", "뜨거운 불꽃으로"],
          images: [imgList[16], imgList[17], imgList[18], imgList[19]]
        },
        {
          options: ["따뜻한 위로로", "함께한 웃음으로", "빛나는 길잡이로", "살아갈 힘으로"],
          images: [imgList[20], imgList[21], imgList[22], imgList[23]]
        }
      ]
    }
  ];

    choosing = new Choosing(selectedCard);
    let set = cardSets[currentIndex];
    choosing.set(set, cardBackImages);
    imageMode(CENTER);
}

function draw() {
    background(255);
    if (sceneNumber === 1) {
        introScene.draw();
    } else if (sceneNumber === 2) {
        if (fade < 255) {
            tint(255, fade);
            image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
            noTint();
            fade += fadeSpeed;
        } else {
            image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
            choosing.update();
            choosing.show();
            choosing.displayText();
        }
    } else if (sceneNumber === 3) {
        outroScene.draw();
    }
}

function mouseMoved() {
    if (sceneNumber === 2 && choosing) {
        choosing.handleMouseMoved();
    } else if (sceneNumber === 3) {
        outroScene.handleMouseMoved();
    }
}

function mousePressed() {
    if (sceneNumber === 1) {
        introScene.handleMousePressed();
    } else if (sceneNumber === 2 && choosing) {
        choosing.handleMousePressed(() => {
            let next = ++currentIndex;
            if (next < cardSets.length) {
                let set = cardSets[next];
                choosing.set(set, cardBackImages);
            } else {
                console.log("모든 카드 선택 완료!");
                sceneNumber = 3;
            }
        });
    } else if (sceneNumber === 3) {
        outroScene.handleMousePressed();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (introScene) {
        introScene.handleWindowResized();
    }
    if (outroScene) {
        outroScene.handleWindowResized();
    }
}
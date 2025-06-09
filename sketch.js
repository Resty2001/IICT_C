let currentIndex = 0;
let storyText = "";
let nameResult = null;
let storyResult = null;
let isGenerating = false;
let choosing, backGroundImage, textBoxImage, keeperImage;
let selectedWords = [];
let imgList = [];
let cardSets = [];
let selectedCard = [];
let cardBackImages = [];
let sceneNumber = 1;
let introScene, outroScene;
let keeperImages = [];     
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
    keeperImage = loadImage('assets/grandpa.first.png')
    backGroundImage = loadImage("assets/Nightsky_Blank.png");
    introImages.mainBackground = loadImage('assets/Nightsky_Blank(2).png');
    introImages.mainBackground2 = loadImage('assets/Nightsky_Blank.png');
    introImages.subBackground = loadImage('assets/subBackground.png');
    introImages.workshopImg = loadImage('assets/workshop.png');
    introImages.workshopInsideImg = loadImage('assets/workshopBackground (1).png');
    introImages.workshopInsideImg2 = loadImage('assets/workshopBackground (3).png');
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
    introImages.buttonBg = loadImage('assets/button.png'); // 버튼 배경 이미지 로드
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
          images: [imgList[0], imgList[1], imgList[2], imgList[3]],
          bgms: [0,0,0,0],
          nickNames: [0,0,0,0],
          colors: [0,0,0,0]
        },
        {
          options: ["세상을 이끌길", "진리를 탐구하길", "사랑을 전하길", "나만의 길을 가길"],
            images: [imgList[4], imgList[5], imgList[6], imgList[7]],
            bgms: [0,0,0,0],
            nickNames: [0,0,0,0],
            colors: [0,0,0,0]
        }
      ]
    },
    {
      storyText: "나에게 가장 큰 가치는 ___이었고, 삶의 가장 큰 시련은 ___이었다.",
      blanks: [
        {
          options: ["소중한 인연", "세상의 인정", "간절했던 꿈", "몸과 마음의 안정"],
          images: [imgList[8], imgList[9], imgList[10], imgList[11]],
          bgms: [0,0,0,0],
          nickNames: [0,0,0,0],
          colors: [0,0,0,0]
        },
        {
          options: ["예상 못한 실패", "뼈아픈 이별", "깊은 외로움", "내면의 불신"],
          images: [imgList[12], imgList[13], imgList[14], imgList[15]],
          bgms: [0,0,0,0],
          nickNames: [0,0,0,0],
          colors: [0,0,0,0]
        }
      ]
    },
    {
      storyText: "나의 육신은 ___ 잠들지만,  나의 별자리는 ___ 남아 그들에게 닿기를 바란다.",
      blanks: [
        {
          options: ["푸른 나무로", "한줌 흙으로", "깊은 바다에", "뜨거운 불꽃으로"],
          images: [imgList[16], imgList[17], imgList[18], imgList[19]],
          bgms: [0,0,0,0],
          nickNames: [0,0,0,0],
          colors: [0,0,0,0]
        },
        {
          options: ["따뜻한 위로로", "함께한 웃음으로", "빛나는 길잡이로", "살아갈 힘으로"],
          images: [imgList[20], imgList[21], imgList[22], imgList[23]],
          bgms: [0,0,0,0],
          nickNames: [0,0,0,0],
          colors: [0,0,0,0]
        }
      ]
    }
  ];

    keeperImages.push(introImages.keeper_talk3);
    keeperImages.push(introImages.keeper_smile1);
    keeperImages.push(introImages.keeper_talk1);
    keeperImages.push(keeperImage);
    textBoxImage = introImages.textBox;

    choosing = new Choosing(selectedCard, keeperImages,textBoxImage, sceneNumber);
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
    } 
    else if (sceneNumber === 3) {
    if (isGenerating || !nameResult || !storyResult) {
        // 로딩 UI
        background(0);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("별자리를 생성하는 중입니다...", width / 2, height / 2);
    } else {
        backGround(0); //별을 잇는 scene
        console.log(nameResult);
        console.log(storyResult);
    }
}else if (sceneNumber === 4) {
        outroScene.draw();
    }
}


function mouseMoved() {
    if (sceneNumber === 2 && choosing) {
        choosing.handleMouseMoved();
    } else if (sceneNumber === 4) {
        outroScene.handleMouseMoved();
    }
}

function mousePressed() {
    if (sceneNumber === 1) {
        introScene.handleMousePressed();
    } else if (sceneNumber === 2 && choosing) {
        choosing.handleMousePressed(() => {
            if (selectedCard.length === 6 && choosing.keeperState === "waiting") {
    sceneNumber = 3;
    isGenerating = true;

    // selectedWords 추출: 선택된 카드의 text
    selectedWords = selectedCard.map(card => card.text);

    // 이름과 신화 생성 요청
    createName(selectedWords).then(result => {
        nameResult = result;
    });
    createStory(selectedWords).then(result => {
        storyResult = result;
        isGenerating = false;
    });
}
 else {
        let next = ++currentIndex;
        if (next < cardSets.length) {
            let set = cardSets[next];
            choosing.set(set, cardBackImages);
        }
    }
        });
    } else if (sceneNumber === 4) {
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


async function createName() {
  const prompt = `다음 단어들을 이용해 신화를 만들고 신화를 기반으로 별자리 이름을 1가지만 정해줘.
  별자리 이름은 반드시 하나의 명사로 이루어진 형식으로 정해줘.
  예를 들어 사자자리, 물병자리처럼 ~자리로 끝나게 만들어주고 너가 만든 신화 이야기는 출력할 필요 없고
  별자리 이름 외에 다른 부가적인 설명도 필요 없으니 오로지 별자리 이름만 출력해줘: ${selectedWords.join(", ")}`;

  try {
    const res = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userText: prompt })
    });

    const data = await res.json();
    return data.result;
  } catch (err) {
    return undefined; 
  }
}

async function createStory() {
  const prompt = `다음 단어들은 하나의 신화를 창조하기 위한 영감의 재료일 뿐입니다.  
절대로 제시된 단어를 이야기에 포함하지 말고고, 단어들의 의미와 분위기를 직관적으로 해석한 뒤  
그 느낌에 어울리는 신화를 10단어 이내로 간단하게 창작해 주세요.  
단어를 그대로 나열하거나 단순히 줄거리를 요약하지 말고,  
상징과 은유를 활용하여 상상력 있는 신화를 만들어 주세요: ${selectedWords.join(", ")}`;

  try {
    const res = await fetch("http://localhost:3000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userText: prompt })
    });

    const data = await res.json();
    return data.result;
  } catch (err) {
    return undefined; 
  }
}
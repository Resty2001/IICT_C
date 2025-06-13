let currentIndex = 0;
let storyText = "";
let nameResult = "조각가자리";
let storyResult = "안녕";
let isGenerating = false;
let choosing,connecting, backGroundImage, textBoxImage, keeperImage;
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
let sounds = {};
let starImages = [];

let bgmExample1, doorOpenSound, bgmExample2;
let bgmExample3, bgmExample4, transitionSound;
let auraHumSound;

// ⭐ 추가: 별자리 이미지와 URL을 저장할 외부 변수 ⭐
let capturedConstellationImage = null; // p5.Graphics 객체 또는 p5.Image 객체가 저장될 변수
let capturedConstellationURL = null;   // Base64 URL 문자열이 저장될 변수

function preload() {
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 4; j++){
            imgList.push(loadImage("assets/" + i + "-" + j + ".png"));
        }
    }
    for (let i = 1; i <= 12; i++){
      starImages.push(loadImage("assets/starB1-1.png"));
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
    introImages.workshopInsideImg = loadImage('assets/workshopBackground (1) extend.png');
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

    soundFormats('mp3');
    sounds.bgm1 = loadSound('assets/bgmExample1.mp3');
    sounds.door = loadSound('assets/doorOpen.mp3');
    sounds.bgm2 = loadSound('assets/bgmExample2Test.mp3');
    sounds.bgm3 = loadSound('assets/bgmExample1.mp3'); // 아웃트로 BGM
    sounds.bgm4 = loadSound('assets/bgmExample2Test.mp3'); // 아웃트로 BGM
    sounds.transition = loadSound('assets/transition(2).mp3');
    sounds.aura = loadSound('assets/auraHum.mp3');
    sounds.smallLaugh = loadSound('assets/smallLaugh.mp3'); 
}


function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont("sans-serif");
    userStartAudio();
    const eachColor = [color(204, 0, 0),color(255, 222, 173),color(70, 80, 150),color(180, 130, 80),color(144, 238, 144),color(220, 220, 220)];
    
    const goNextScene = () => {
        if (bgmExample2 && bgmExample2.isPlaying()) {
            bgmExample2.stop();
        }
        sceneNumber = 2;
        currentIndex = 0;
        selectedCard = [];
        choosing.set(cardSets[currentIndex], cardBackImages);
        fade = 0;
    };

    const returnToStart = () => {
        // OutroScene에서 사용된 모든 BGM을 sounds 객체를 통해 정지시킵니다.
        if (sounds.bgm3 && sounds.bgm3.isPlaying()) {
            sounds.bgm3.stop();
        }
        if (sounds.bgm4 && sounds.bgm4.isPlaying()) {
            sounds.bgm4.stop();
        }
        sceneNumber = 1;
        if(introScene) introScene.reset(true);
    };

      const introSounds = {
        bgm1: bgmExample1,
        door: doorOpenSound,
        bgm2: bgmExample2,
        aura: auraHumSound
    };
    introScene = new IntroScene(introImages, sounds, goNextScene);

    const outroSounds = {
        bgm3: bgmExample3,
        bgm4: bgmExample4,
        transition: transitionSound
    };
    outroScene = new OutroScene(introImages, sounds, returnToStart); 

    cardSets = [
    {
      storyText: "[ ] 날에 태어난 나는 어릴 적부터 [ ] 꿈꾸었다.",
      blanks: [
        {
          options: ["꽃이 만개하던", "햇살이 타오르던", "낙엽이 물들던", "함박눈이 내리던"],
          images: [imgList[0], imgList[1], imgList[2], imgList[3]],
          bgms: [0,0,0,0],
          nickNames: ["희망찬", "정오의", "성숙한", "고요한"],
          colors: [eachColor[1],eachColor[0],eachColor[3],eachColor[2]]
        },
        {
          options: ["세상을 이끌길", "진리를 탐구하길", "사랑을 전하길", "나만의 길을 가길"],
            images: [imgList[4], imgList[5], imgList[6], imgList[7]],
            bgms: [0,0,0,0],
            nickNames: ["선구적인","지혜로운","사랑의","자유로운"],
            colors: [eachColor[0],eachColor[5],eachColor[1],eachColor[5]]
        }
      ]
    },
    {
      storyText: "나에게 가장 큰 가치는 [ ]이었고, 삶의 가장 큰 시련은 [ ]이었다.",
      blanks: [
        {
          options: ["소중한 인연", "세상의 인정", "간절했던 꿈", "몸과 마음의 안정"],
          images: [imgList[8], imgList[9], imgList[10], imgList[11]],
          bgms: [0,0,0,0],
          nickNames: ["믿음의","찬란한","갈망하는","평화로운"],
          colors: [eachColor[1],eachColor[0],eachColor[4],eachColor[3]]
        },
        {
          options: ["예상 못한 실패", "뼈아픈 이별", "깊은 외로움", "내면의 불신"],
          images: [imgList[12], imgList[13], imgList[14], imgList[15]],
          bgms: [0,0,0,0],
          nickNames: ["불굴의","아련한","고독한","고뇌하는"],
          colors: [eachColor[5],eachColor[3],eachColor[2],eachColor[2]]
        }
      ]
    },
    {
      storyText: "나의 육신은 [ ] 잠들지만,   나의 별자리는 [ ] 남아 그들에게 닿기를 바란다.",
      blanks: [
        {
          options: ["푸른 나무로", "한줌 흙으로", "깊은 바다에", "뜨거운 불꽃으로"],
          images: [imgList[16], imgList[17], imgList[18], imgList[19]],
          bgms: [0,0,0,0],
          nickNames: ["생명의","대지의","심연의","불멸의"],
          colors: [eachColor[4],eachColor[3],eachColor[2],eachColor[0]]
        },
        {
          options: ["따뜻한 위로로", "함께한 웃음으로", "빛나는 길잡이로", "살아갈 힘으로"],
          images: [imgList[20], imgList[21], imgList[22], imgList[23]],
          bgms: [0,0,0,0],
          nickNames: ["따스한","행복한","눈부신","담대한"],
          colors: [eachColor[1],eachColor[4],eachColor[5],eachColor[4]]
        }
      ]
    }
  ];

    keeperImages.push(introImages.keeper_talk3);
    keeperImages.push(introImages.keeper_smile1);
    keeperImages.push(introImages.keeper_talk1);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
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
        if (fade < 255) {
            tint(255, fade);
            image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
            noTint();
            fade += fadeSpeed;
        } else {
            image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
            connecting.update();
            connecting.show();
        }
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
choosing.handleMousePressed(async () => { // async 추가
    if (selectedCard.length === 6 && choosing.keeperState === "waiting") {
        sceneNumber = 3;
        fade = 0;
        isGenerating = true;
        nameResult = "조각가자리";
        storyResult = "hello world";
        isGenerating = false;
        console.log(selectedCard[0].star.x);
        // ⭐ Connecting 객체 생성 시 콜백 함수 추가 ⭐
        connecting = new Connecting(
            selectedCard, 
            nameResult, 
            storyResult, 
            keeperImages, 
            textBoxImage, 
            // sceneNumber를 업데이트하는 콜백
            () => { sceneNumber++; console.log("sceneNumber updated to:", sceneNumber); }, 
            // ⭐ 별자리 완성 시 이미지/URL을 외부 변수에 저장하는 콜백 ⭐
            (img, url) => {
        capturedConstellationImage = img; // p5.Image 객체 저장
        capturedConstellationURL = url;   // Base64 URL 저장
        console.log("별자리 완성! 이미지와 URL이 외부 변수에 저장되었습니다.");
        console.log("URL (일부):", capturedConstellationURL.substring(0, 50) + "...");
            },
            starImages
        );

    //     createName(selectedWords).then(result => {
    //     nameResult = result;
    // });
    // createStory(selectedWords).then(result => {
    //     storyResult = result;
    //     isGenerating = false;
    // });


    } else {
        let next = ++currentIndex;
        if (next < cardSets.length) {
            let set = cardSets[next];
            choosing.set(set, cardBackImages);
        }
    }
});
    } 
    else if(sceneNumber === 3){
      connecting.handleMousePressed();
    }else if (sceneNumber === 4) {
        outroScene.handleMousePressed();
    }
}

function mouseDragged(){
  if(sceneNumber === 3){
    connecting.mouseDragged();
  }
}
function mouseReleased(){
  if(sceneNumber === 3){
    connecting.mouseReleased();
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

// async function saveCanvasAndGetUrl() { // 이 함수는 Connecting 클래스 내부에서 처리되므로 주석 처리하거나 제거 가능
//     const dataUrl = canvas.toDataURL('image/png');
//     try {
//         const res = await fetch("http://localhost:3000/save-image", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ imageData: dataUrl })
//         });
//         if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
//         const data = await res.json();
//         return data.imageUrl;
//     } catch (err) {
//         console.error("캔버스 저장 실패:", err);
//         return null;
//     }
// }


// [테스트용 임시 코드]
async function keyPressed() {
    // 키보드의 't' 또는 'T' 키를 누르면
    if (key === 't' || key === 'T') {
        console.log("테스트 시작: 캔버스 저장 및 QR 생성");

        // ⭐ 이미 Connecting 클래스에서 capturedConstellationImage와 URL을 외부에 저장했으므로,
        // 이 테스트 코드에서는 해당 외부 변수를 직접 사용합니다. ⭐
        if (capturedConstellationImage && capturedConstellationURL) {
            console.log("테스트 성공: 이미지 URL 받음 ->", capturedConstellationURL);
            // 받은 URL로 OutroScene의 QR코드를 설정합니다.
            outroScene.setQRCodeUrl(capturedConstellationURL);
            outroScene.setFinalConstellationImage(capturedConstellationImage); // OutroScene에 이미지도 전달

            // 강제로 Scene 4 (아웃트로)로 전환합니다.
            sceneNumber = 4;
            outroScene.sceneState = 'QR_CODE_PATH'; 
            console.log("테스트: Scene 4로 전환합니다.");
        } else {
            console.error("테스트 실패: 캡처된 별자리 이미지 또는 URL이 없습니다. 먼저 '별자리 완성' 버튼을 눌러주세요.");
            // 임시로 아무 이미지나 QR로 설정하고 싶다면 아래 주석을 해제하세요.
            // outroScene.setQRCodeUrl('https://example.com/some_default_image.png');
            // sceneNumber = 4;
            // outroScene.sceneState = 'QR_CODE_PATH'; 
        }
    }
}
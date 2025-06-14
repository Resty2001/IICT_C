let currentIndex = 0;
let storyText = "";
let nameResult = "";
let storyResult = "";
let isGenerating = false;
let choosing,connecting, backGroundImage, textBoxImage, keeperImage;
let selectedWords = [];
let imgList = [];
let cardSets = [];
let selectedCard = []; // 이 변수에 선택된 카드들이 저장됩니다.
let cardBackImages = [];
let sceneNumber = 2;
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
let capturedConstellationURL = null;   // Base64 URL 문자열이 저장될 변수

function preload() {
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 4; j++){
            imgList.push(loadImage("assets/" + i + "-" + j + ".png"));
        }
    }
    starImages.push(loadImage("assets/hammer.png"));
    starImages.push(loadImage("assets/loom.png"));
    starImages.push(loadImage("assets/anvil.png"));
    starImages.push(loadImage("assets/mandolin.png"));
    starImages.push(loadImage("assets/still.png"));
    starImages.push(loadImage("assets/wateringcan.png"));
    starImages.push(loadImage("assets/compass.png"));
    starImages.push(loadImage("assets/rudder.png"));
    starImages.push(loadImage("assets/caduceus.png"));
    starImages.push(loadImage("assets/quill.png"));
    starImages.push(loadImage("assets/cloud.png"));
    starImages.push(loadImage("assets/shield.png"));
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
        selectedCard = []; // 씬 전환 시 selectedCrad 초기화
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

        // 씬 번호를 1로 바꾸고 인트로 씬을 리셋합니다.
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
      storyText: "나의 육신은 [ ] 잠들지만,   나의 별자리는 [ ] 남아 그들에게 닿기를 바란다.",
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
  const updateSceneToConnecting = () => {
    sceneNumber = 3;
    fade = 0; // 페이드 효과를 위해 fade 값 초기화
    
    // ⭐ 여기에서 selectedCard에 임시 기본값 할당 ⭐
    if (selectedCard.length === 0) {
        console.warn("selectedCard가 비어있습니다. 랜덤한 기본값을 할당합니다.");
        
        let allPossibleCards = [];
        // cardSets의 모든 옵션을 하나의 배열로 모읍니다.
        cardSets.forEach(set => {
            set.blanks.forEach(blank => {
                blank.options.forEach((option, i) => {
                    allPossibleCards.push({
                        text: option,
                        image: blank.images[i],
                        nickName: blank.nickNames[i],
                        colour: blank.colors[i],
                        star: { x: 0, y: 0 } // star 위치는 Connecting 클래스에서 초기화하므로 여기서는 임의값
                    });
                });
            });
        });

        // 모든 가능한 카드 중에서 6개를 랜덤하게 선택 (중복 없이)
        // Fisher-Yates (Knuth) 셔플 알고리즘
        for (let i = allPossibleCards.length - 1; i > 0; i--) {
            const j = floor(random(i + 1));
            [allPossibleCards[i], allPossibleCards[j]] = [allPossibleCards[j], allPossibleCards[i]];
        }
        
        // 셔플된 배열에서 앞의 6개를 선택하여 selectedCard에 할당
        selectedCard = allPossibleCards.slice(0, 6);

        // 선택된 카드들의 초기 별 위치를 랜덤하게 지정
        // 이 위치는 Connecting 클래스에서 사용되므로 적절한 범위를 설정합니다.
        // 예를 들어, 화면의 20% ~ 80% 범위 내에서 랜덤하게 배치
        selectedCard.forEach(card => {
            card.star.x = random((windowWidth * 9) / 17, (windowWidth * 29) / 30);
            card.star.y = random(windowHeight / 8, (windowHeight * 7) / 8);
        });
    }

    selectedWords = selectedCard.map(card => card.text);
    isGenerating = true;

    // AI API 호출 (비동기 처리)
    createName(selectedWords).then(result => {
        nameResult = result;
    });
    createStory(selectedWords).then(result => {
        storyResult = result;
        isGenerating = false;
    });
    console.log("모든 카드 선택 완료, Connecting 씬으로 전환 시도:", sceneNumber);

    // Connecting 객체는 모든 카드 데이터가 준비된 후 한 번만 생성
      
    connecting = new Connecting(
        selectedCard,
        nameResult,
        storyResult,
        keeperImages,
        textBoxImage,
        // Connecting 씬에서 '별자리 완성' 버튼 클릭 시 다음 씬(Outro)으로 넘어가는 콜백
        () => { sceneNumber = 4; console.log("sceneNumber updated to:", sceneNumber); },
        // 별자리 완성 시 이미지/URL을 외부 변수에 저장하는 콜백
        (img, url) => {
            capturedConstellationImage = img;
            capturedConstellationURL = url;
            console.log(typeof(nameResult));
            console.log("별자리 완성! 이미지와 URL이 외부 변수에 저장되었습니다.");
            console.log("URL (일부):", capturedConstellationURL.substring(0, 50) + "...");
        },
        starImages
    );
};

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
    choosing = new Choosing(selectedCard, keeperImages, textBoxImage, updateSceneToConnecting);

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
            connecting.set(nameResult,storyResult,selectedCard);
        } else {
          console.log(storyResult);
          console.log(nameResult);
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
      choosing.handleMousePressed(() => {
        if(selectedCard.length === 6 && choosing.keeperState === "waiting"){
        choosing.mousePressed(updateSceneToConnecting);
      }
    else{
        
    //     createName(selectedWords).then(result => {
    //     nameResult = result;
    // });
    // createStory(selectedWords).then(result => {
    //     storyResult = result;
    //     isGenerating = false;
    // });
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
    const prompt = `다음 단어들의 분위기와 의미를 종합하여, 아래 12가지 별자리 이름 중 가장 잘 어울리는 하나를 선택해주세요.
    **출력 형식은 반드시 "~자리" 로만 구성되어야 합니다. 다른 모든 문자(공백, 특수문자, 문장 부호 등)는 제외하고 순수한 별자리 이름만 출력해주세요.**
    예시: "조각가자리", "수호자자리"

    다음 별자리 목록에서 선택:
    조각가자리: 형태를 만들고 본질을 드러내는 예술가. 가치: 인내, 변형, 실체화
    직조가자리: 관계와 운명의 실을 엮어 패턴을 만드는 연결자. 가치: 연결, 조화, 인연
    대장장이자리: 강인한 의지와 열정으로 원재료를 단련시키는 변혁가. 가치: 단련, 창조, 힘
    음유시인자리: 이야기, 노래, 시로 감정과 지혜를 전달하는 전달자. 가치: 영감, 소통, 감동
    연금술사자리: 평범한 것을 비범한 것으로 변화시키고 깨달음을 추구하는 탐구자. 가치: 변환, 탐구, 지혜
    정원사자리: 생명을 키우고 돌보며 성장과 결실을 기다리는 양육자. 가치: 성장, 양육, 결실
    건축가자리: 견고하고 아름다운 구조물을 설계하고 질서와 안정을 창조하는 설계자. 가치: 구조, 안정, 비전
    항해사자리: 미지의 세계를 탐험하고 새로운 길을 개척하는 길잡이. 가치: 탐험, 방향, 개척
    치유사자리: 상처 입은 몸과 마음을 돌보고 회복을 돕는 조력자. 가치: 회복, 균형, 연민
    서기관자리: 지식과 역사를 기록하고 보존하며 지혜를 전달하는 기록자. 가치: 지식, 보존, 진실
    몽상가자리: 현실 너머의 가능성을 보고 상상력으로 새로운 세계를 그리는 영감의 원천. 가치: 상상, 영감, 가능성
    수호자자리: 소중한 가치, 사람들, 영역을 헌신적으로 보호하고 지키는 방어자. 가치: 보호, 책임, 충성

    사용자 선택 단어: ${selectedWords.join(", ")}`;

    try {
        const res = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userText: prompt })
        });

        const data = await res.json();
        // ⭐ 추가: AI 응답에 대해 최종 정제 ⭐
        let result = data.result;
        if (typeof result === 'string') {
            result = result.replace(/[^가-힣a-zA-Z가-힣자리]/g, '').trim(); // 한글, 영어, '자리'만 남기고 제거
            if (!result.endsWith("자리") && starNames.includes(result + "자리")) { // '조각가'만 왔을 경우 '조각가자리'로 완성
                 result += "자리";
            }
             if (result.length === 0) { // 혹시라도 빈 문자열이 될 경우 대비
                 result = "조각가자리"; // 기본값 설정
             }
        } else {
             result = "조각가자리"; // 응답이 string이 아닐 경우 기본값 설정
        }
        return result;

    } catch (err) {
        console.error("Error creating name:", err);
        return "조각가자리"; // 오류 발생 시 기본값 반환
    }
}

async function createStory() {
    const prompt = `다음 단어들은 신화 창조를 위한 영감의 재료입니다.
    **제시된 단어를 이야기에 절대로 포함하지 마세요.**
    **단어들의 의미와 분위기를 직관적으로 해석한 뒤, 그 느낌에 어울리는 신화를 15단어 이내로 간결하게 창작해주세요.**

    **출력 시 다음 사항을 반드시 지켜주세요:**
    1. **양 끝에 공백을 포함하지 않습니다.**
    2. **문장 부호는 마침표(.), 쉼표(,), 느낌표(!), 물음표(?)만 허용합니다. 이 외의 모든 특수 기호(예: *, #, @ 등)는 절대로 포함하지 않습니다.**
    3. **단어를 그대로 나열하거나 단순히 줄거리를 요약하지 말고, 상징과 은유를 활용하여 상상력 있는 신화를 만들어주세요.**
    4. **결과물은 반드시 단일 문자열이어야 합니다.**
    5. **단어를 연결한 형식이 아니라 완전한 문장을 완성해주세요.**

    사용자 선택 단어: ${selectedWords.join(", ")}`;

    try {
        const res = await fetch("http://localhost:3000/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userText: prompt })
        });

        const data = await res.json();
        // ⭐ 추가: AI 응답에 대해 최종 정제 ⭐
        let result = data.result;
        if (typeof result === 'string') {
            // 허용된 기호(.,!?, 한글, 영어, 공백)를 제외한 모든 문자 제거
            // 공백을 허용하여 단어 사이를 띄울 수 있게 합니다.
            result = result.replace(/[^가-힣a-zA-Z0-9\s\.\,\!\?]/g, '').trim();
            if (result.length === 0) { // 혹시라도 빈 문자열이 될 경우 대비
                result = "별들의 속삭임이 새로운 운명을 엮었다."; // 기본값 설정
            }
        } else {
            result = "별들의 속삭임이 새로운 운명을 엮었다."; // 응답이 string이 아닐 경우 기본값 설정
        }
        return result;

    } catch (err) {
        console.error("Error creating story:", err);
        return "별들의 속삭임이 새로운 운명을 엮었다."; // 오류 발생 시 기본값 반환
    }
}
// async function saveCanvasAndGetUrl() { // 이 함수는 Connecting 클래스 내부에서 처리되므로 주석 처리하거나 제거 가능
//     const dataUrl = canvas.toDataURL('image/png');
//     try {
//         const res = await fetch("http://localhost:3000/save-image", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ imageData: dataUrl })
//         });
//         if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
//         const data = await res.json();
//         return data.imageUrl;
//     } catch (err) {
//         console.error("캔버스 저장 실패:", err);
//         return null;
//     }
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
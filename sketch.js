let currentIndex = 0;
let storyText = "";
let nameResult = "";
let isGenerating = false;
let choosing,connecting, backGroundImage, textBoxImage, keeperImage, newStarImage;
let selectedWords = [];
let imgList = [];
let cardSets = [];
let selectedCard = []; // 이 변수에 선택된 카드들이 저장됩니다.
let cardBackImages = [];
let sceneNumber = 1;
let introScene, outroScene;
let keeperImages = [];
let introImages = {};
let fade = 0;
let fadeSpeed = 4;
let sounds = {};
let currentBGM = null; // 현재 재생 중인 BGM을 추적하는 변수
let starImages = [];

let constellationCardGenerator; // ConstellationCard 클래스의 인스턴스
let finalCardImage = null; // 생성된 최종 카드 이미지(p5.Graphics)
let finalCardURL = null;   // 최종 카드 이미지의 데이터 URL

let bgmExample1, doorOpenSound, bgmExample2;
let bgmExample3, bgmExample4, transitionSound;
let auraHumSound;

let fontHSBombaram, fontOgR; // 글꼴을 저장할 변수
let isCardDesignTestMode = true;

// ⭐ 추가: 별자리 이미지와 URL을 저장할 외부 변수 ⭐
let capturedConstellationImage = null; // p5.Graphics 객체 또는 p5.Image 객체가 저장될 변수
let capturedConstellationURL = null;   // Base64 URL 문자열이 저장될 변수

let cardClickSound; // 전역 변수로 사운드 객체 선언

function preload() {
    for (let i = 1; i <= 6; i++) {
        for (let j = 1; j <= 4; j++){
            imgList.push(loadImage("assets/" + i + "-" + j + ".png"));
        }
    }
    newStarImage = loadImage('assets/Star_nobackground.png');
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
    introImages.startBg = loadImage('assets/startBg.png');
    introImages.title = loadImage('assets/title.png');
    introImages.startButton = loadImage('assets/button.png');
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
    fontHSBombaram = loadFont('assets/HSBombaram.ttf');
    fontOgR = loadFont('assets/ogR.ttf');
    introImages.qrCode = loadImage('assets/qrTest.png'); 
    introImages.finalConstellationTest = loadImage('assets/captureTest.png'); 
    introImages.buttonBg = loadImage('assets/button.png'); // 버튼 배경 이미지 로드
    introImages.taroBg = loadImage('assets/taro.png');

    soundFormats('mp3');
    sounds.bgm1 = loadSound('assets/bgmExample1.mp3');
    sounds.door = loadSound('assets/doorOpen.mp3');
    sounds.bgm2 = loadSound('assets/bgmExample2Test.mp3');
    sounds.bgm3 = loadSound('assets/bgmExample1.mp3'); // 아웃트로 BGM
    sounds.bgm4 = loadSound('assets/bgmExample2Test.mp3'); // 아웃트로 BGM
    sounds.transition = loadSound('assets/transition(2).mp3');
    sounds.aura = loadSound('assets/auraHum.mp3');
    sounds.smallLaugh = loadSound('assets/smallLaugh.mp3'); 
    sounds.click = loadSound('assets/click.mp3');
    sounds.shootingStar = loadSound('assets/shootingStar.mp3');

    sounds.bgm_1 = loadSound('assets/BGM_1.mp3'); // 공방 내부 BGM
    sounds.hero = loadSound('assets/hero.1.mp3');
    sounds.hopeful = loadSound('assets/hopeful.mp3');
    sounds.silent = loadSound('assets/silent.mp3');
    sounds.mature = loadSound('assets/mature.mp3');
    sounds.happy = loadSound('assets/happy.mp3');
    sounds.wise = loadSound('assets/wise.mp3');



}


function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont("sans-serif");
    userStartAudio();
    const eachColor = [color(204, 0, 0),color(255, 222, 173),color(70, 80, 150),color(180, 130, 80),color(144, 238, 144),color(220, 220, 220)];
    // 카드 크기는 taro.png 원본 비율에 맞춰 설정하는 것이 좋습니다.
    const cardAspectRatio = 1200 / 800;
     const cardFonts = {
        title: fontHSBombaram,
        story: fontOgR
    };

    const cardWidth = 400;
    const cardHeight = cardWidth * cardAspectRatio;
    constellationCardGenerator = new ConstellationCard(cardWidth, cardHeight, cardFonts);


    const goNextScene = () => {
        if (bgmExample2 && bgmExample2.isPlaying()) {
            bgmExample2.stop();
        }
        sceneNumber = 2;
        currentIndex = 0;
        selectedCard.length = 0; // 씬 전환 시 selectedCrad 초기화
        choosing.set(cardSets[currentIndex], cardBackImages);
        fade = 0;
    };

const returnToStart = () => {
        // ⭐ [수정] 모든 것을 초기화하는 가장 확실한 방법은 페이지를 새로고침하는 것입니다.
        window.location.reload();
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
      storyText: "[ ? ] 날에 태어난 나는 어릴 적부터 [ ] 꿈꾸었다.",
      blanks: [
        {
          options: ["꽃이 만개하던", "햇살이 타오르던", "낙엽이 물들던", "함박눈이 내리던"],
          images: [imgList[0], imgList[1], imgList[2], imgList[3]],
          bgms: ['hopeful', 'hero', 'mature', 'silent'], // BGM 키 할당
          nickNames: ["희망찬", "정오의", "성숙한", "고요한"],
          colors: [eachColor[1],eachColor[0],eachColor[3],eachColor[2]]
        },
        {
          options: ["세상을 이끌길", "진리를 탐구하길", "사랑을 전하길", "나만의 길을 가길"],
            images: [imgList[4], imgList[5], imgList[6], imgList[7]],
            bgms: ['hero', 'wise', 'hopeful', 'wise'], // BGM 키 할당
            nickNames: ["선구적인","지혜로운","사랑의","자유로운"],
            colors: [eachColor[0],eachColor[5],eachColor[1],eachColor[5]]
        }
      ]
    },
    {
      storyText: "나에게 가장 큰 가치는 [ ? ]이었고, 삶의 가장 큰 시련은 [ ]이었다.",
      blanks: [
        {
          options: ["소중한 인연", "세상의 인정", "간절했던 꿈", "몸과 마음의 안정"],
          images: [imgList[8], imgList[9], imgList[10], imgList[11]],
          bgms: ['hopeful', 'hero', 'happy', 'mature'], // BGM 키 할당
          nickNames: ["믿음의","찬란한","갈망하는","평화로운"],
          colors: [eachColor[1],eachColor[0],eachColor[4],eachColor[3]]
        },
        {
          options: ["예상 못한 실패", "뼈아픈 이별", "깊은 외로움", "내면의 불신"],
          images: [imgList[12], imgList[13], imgList[14], imgList[15]],
          bgms: ['wise', 'mature', 'silent', 'silent'], // BGM 키 할당
          nickNames: ["불굴의","아련한","고독한","고뇌하는"],
          colors: [eachColor[5],eachColor[3],eachColor[2],eachColor[2]]
        }
      ]
    },
    {
      storyText: "나의 육신은 [ ? ] 잠들지만, 나의 별자리는 [ ] 남아 그들에게 닿기를 바란다.",
      blanks: [
        {
          options: ["푸른 나무에", "한줌 흙으로", "깊은 바다에", "뜨거운 불꽃으로"],
          images: [imgList[16], imgList[17], imgList[18], imgList[19]],
          bgms: ['happy', 'mature', 'silent', 'hero'], // BGM 키 할당
          nickNames: ["생명의","대지의","심연의","불멸의"],
          colors: [eachColor[4],eachColor[3],eachColor[2],eachColor[0]]
        },
        {
          options: ["따뜻한 위로로", "함께한 웃음으로", "빛나는 길잡이로", "살아갈 힘으로"],
          images: [imgList[20], imgList[21], imgList[22], imgList[23]],
          bgms: ['hopeful', 'happy', 'wise', 'happy'], // BGM 키 할당
          nickNames: ["따스한","행복한","눈부신","담대한"],
          colors: [eachColor[1],eachColor[4],eachColor[5],eachColor[4]]
        }
      ]
    }
  ];

// ⭐ 2. 이 함수(상수) 전체를 교체해주세요.
const updateSceneToConnecting = () => {
    sceneNumber = 3;
    fade = 0;
  // ⭐ 추가된 안전장치 코드 시작 ⭐
    // 만약 카드 선택 과정에서 문제가 생겨 selectedCard가 비어있다면,
    // 테스트를 위해 랜덤한 6개의 카드를 강제로 채워줍니다.
    if (selectedCard.length === 0) {
        console.warn("selectedCard가 비어있어, 테스트용 랜덤 카드를 생성합니다.");
        
        let allPossibleCards = [];
        cardSets.forEach(set => {
            set.blanks.forEach(blank => {
                blank.options.forEach((option, i) => {
                    allPossibleCards.push({
                        text: option,
                        image: blank.images[i],
                        nickName: blank.nickNames[i],
                        colour: blank.colors[i],
                        star: { x: 0, y: 0 }
                    });
                });
            });
        });

        // 모든 카드 중에서 6개를 랜덤하게 셔플하여 선택합니다.
        for (let i = allPossibleCards.length - 1; i > 0; i--) {
            const j = floor(random(i + 1));
            [allPossibleCards[i], allPossibleCards[j]] = [allPossibleCards[j], allPossibleCards[i]];
        }
        selectedCard = allPossibleCards.slice(0, 6);

        // 선택된 카드의 초기 별 위치를 랜덤하게 지정합니다.
        selectedCard.forEach(card => {
            card.star.x = random((windowWidth * 9) / 17, (windowWidth * 29) / 30);
            card.star.y = random(windowHeight / 8, (windowHeight * 7) / 8);
        });
        console.log("디폴트로 선택됨");
    }
    // ⭐ 추가된 안전장치 코드 끝 ⭐

    selectedWords = selectedCard.map(card => card.text);
    isGenerating = true;

    Promise.all([createName(selectedWords)])
        .then(([generatedName]) => {
            nameResult = generatedName.replace(/(\r\n|\n|\r)/gm, "").trim();
            isGenerating = false;
            console.log("AI 생성 완료:", nameResult);

            connecting = new Connecting(
                selectedCard, nameResult, keeperImages, textBoxImage,
                () => { /* 이 콜백은 더 이상 사용되지 않습니다. */ },
                // '별자리 완성' 버튼 클릭 시 실행될 콜백
 async (capturedImg) => {
                    console.log("별자리 캡처 완료! 최종 카드 생성 및 업로드를 시작합니다.");

                    // 별자리 특성 문장을 가져옵니다. (이전과 동일)
                    const constellationCharacteristic = connecting.storyResult;
                    
                    // [핵심 수정] 별자리 이름 생성 로직 변경
                    // 기존에는 수식어가 없는 'nameResult'를 사용했지만,
                    // 이제는 connecting 객체 내부에서 수식어가 합쳐진 'connecting.nameResult'를 사용합니다.
                    const finalConstellationName = connecting.nameResult.trim() + " 자리";
                    
                    // 최종 카드 이미지 생성
                    const finalCardImage = constellationCardGenerator.createCardImage(
                        introImages.taroBg,
                        capturedImg,
                        finalConstellationName,       // ⭐ 수식어가 포함된 이름으로 전달
                        constellationCharacteristic
                    );
                    
                    // 카드 이미지를 Data URL로 변환
                    const longDataURL = finalCardImage.canvas.toDataURL('image/png');
                    
                    // 서버에 업로드하고 짧은 URL 받기
                    console.log("이미지 업로드 시도...");
                    const shareableURL = await uploadAndGetUrl(longDataURL);

                    // 성공 시 Outro 씬 설정 및 전환
                    if (shareableURL) {
                        console.log("업로드 성공! 공유 URL:", shareableURL);
                        outroScene.setFinalConstellationImage(finalCardImage);
                        outroScene.setQRCodeUrl(shareableURL);
                        sceneNumber = 4;
                    } else {
                        console.error("최종 카드 업로드에 실패했습니다. Outro 씬으로 전환할 수 없습니다.");
                    }
                },
                starImages,
                newStarImage,
                sounds
            );
        });
};

    keeperImages.push(introImages.keeper_talk3);
    keeperImages.push(introImages.keeper_smile1);
    keeperImages.push(introImages.keeper_talk1);
    keeperImages.push(introImages.keeper_talk2);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    keeperImages.push(keeperImage);
    textBoxImage = introImages.textBox;
    choosing = new Choosing(selectedCard, keeperImages, textBoxImage, updateSceneToConnecting, newStarImage);

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
    if (isGenerating || !nameResult) {
        // 로딩 UI
        image(introImages.workshopInsideImg2, width/2, height/2, windowWidth, windowHeight);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(windowWidth*windowHeight/70000);
        text("별을 연결하러 가는 중...", width / 2, height / 2);
    } else {
        if (fade < 255) {
            tint(255, fade);
            image(backGroundImage, width / 2, height / 2, windowWidth, windowHeight);
            noTint();
            fade += fadeSpeed;
        } else {
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
    } else if (sceneNumber === 3 && connecting){
        connecting.handleMouseOver();
    }
    
    else if (sceneNumber === 4) {
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
        let next = ++currentIndex;
        if (next < cardSets.length) {
            let set = cardSets[next];
            choosing.set(set, cardBackImages);
        }
    }
  });
}
    else if(sceneNumber === 3 && connecting){ // connecting 객체 존재 여부 확인
        connecting.handleMousePressed();
    }else if (sceneNumber === 4) {
        outroScene.handleMousePressed();
    }
}

function mouseDragged(){
    // ⭐ 수정된 부분: connecting이 존재할 때만 호출 ⭐
    if(sceneNumber === 3 && connecting){ // connecting 객체 존재 여부 확인
        connecting.mouseDragged();
    }
    // ⭐ 수정된 부분 끝 ⭐
}
function mouseReleased(){
    // ⭐ 수정된 부분: connecting이 존재할 때만 호출 ⭐
    if(sceneNumber === 3 && connecting){ // connecting 객체 존재 여부 확인
        connecting.mouseReleased();
    }
    // ⭐ 수정된 부분 끝 ⭐
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
    **다른 모든 문자(공백, 특수문자, 문장 부호 등)는 제외하고 순수한 별자리 이름만 출력해주세요.**
    예시: "조각가", "수호자"

    다음 별자리 목록에서 선택:
    조각가: 형태를 만들고 본질을 드러내는 예술가. 가치: 인내, 변형, 실체화
    직조가: 관계와 운명의 실을 엮어 패턴을 만드는 연결자. 가치: 연결, 조화, 인연
    대장장이: 강인한 의지와 열정으로 원재료를 단련시키는 변혁가. 가치: 단련, 창조, 힘
    음유시인: 이야기, 노래, 시로 감정과 지혜를 전달하는 전달자. 가치: 영감, 소통, 감동
    연금술사: 평범한 것을 비범한 것으로 변화시키고 깨달음을 추구하는 탐구자. 가치: 변환, 탐구, 지혜
    정원사: 생명을 키우고 돌보며 성장과 결실을 기다리는 양육자. 가치: 성장, 양육, 결실
    건축가: 견고하고 아름다운 구조물을 설계하고 질서와 안정을 창조하는 설계자. 가치: 구조, 안정, 비전
    항해사: 미지의 세계를 탐험하고 새로운 길을 개척하는 길잡이. 가치: 탐험, 방향, 개척
    치유사: 상처 입은 몸과 마음을 돌보고 회복을 돕는 조력자. 가치: 회복, 균형, 연민
    서기관: 지식과 역사를 기록하고 보존하며 지혜를 전달하는 기록자. 가치: 지식, 보존, 진실
    몽상가: 현실 너머의 가능성을 보고 상상력으로 새로운 세계를 그리는 영감의 원천. 가치: 상상, 영감, 가능성
    수호자: 소중한 가치, 사람들, 영역을 헌신적으로 보호하고 지키는 방어자. 가치: 보호, 책임, 충성

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
             if (result.length === 0) { // 혹시라도 빈 문자열이 될 경우 대비
                 result = "조각가"; // 기본값 설정
             }
        } else {
             result = "조각가"; // 응답이 string이 아닐 경우 기본값 설정
        }
        return result;

    } catch (err) {
        console.error("Error creating name:", err);
        return "조각가"; // 오류 발생 시 기본값 반환
    }
}
// ⭐ 1. 이 함수를 새로 추가해주세요.
async function uploadAndGetUrl(dataUrl) {
    try {
        const response = await fetch("http://localhost:3000/save-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ imageData: dataUrl }),
        });

        if (!response.ok) {
            throw new Error(`서버 오류: ${response.statusText}`);
        }

        const data = await response.json();
        return data.imageUrl; // 서버가 보내준 짧은 URL 반환
    } catch (error) {
        console.error("이미지 업로드 실패:", error);
        return null; // 실패 시 null 반환
    }
}


async function keyPressed() {
    if (sceneNumber === 1 && introScene) {
        introScene.handleKeyPressed();
    }
    
    // ==================================================================
    // ⭐ 아웃트로 씬 테스트를 위한 단축키 (T) ⭐
    // ==================================================================
    if (key === 't' || key === 'T') {
        console.warn("--- 테스트 모드 실행: 아웃트로 씬으로 강제 이동 ---");
        const testConstellationName = "연금술사자리";
        const testConstellationStory = "영원한 겨울, 진실을 찾는 불꽃 속에서 깨달음을 얻고, 웃음소리는 메아리가 되었다.";
        const testConstellationImage = introImages.finalConstellationTest;
        
        if (!testConstellationImage || !introImages.taroBg) {
            console.error("테스트에 필요한 이미지가 로드되지 않았습니다.");
            return;
        }

        const testBgColor = testConstellationImage.get(5, 5);
        const processedTestImage = removeBackgroundByColor(testConstellationImage, testBgColor, 80);

        const finalCardImage = constellationCardGenerator.createCardImage(
            introImages.taroBg, processedTestImage, testConstellationName, testConstellationStory
        );
        const longDataURL = finalCardImage.canvas.toDataURL('image/png');
        
        console.log("테스트용 이미지 업로드 시도...");
        const shareableURL = await uploadAndGetUrl(longDataURL);

        if (shareableURL) {
            console.log("테스트 업로드 성공! 공유 URL:", shareableURL);
            outroScene.setFinalConstellationImage(finalCardImage);
            outroScene.setQRCodeUrl(shareableURL);
            sceneNumber = 4;
            console.warn("--- 테스트 모드 설정 완료 ---");
        } else {
            console.error("테스트 실패: 이미지 업로드 후 URL을 받아오지 못했습니다.");
        }
    }
    // ==================================================================
    // ⭐ 테스트 코드 블록 끝 ⭐
    // ==================================================================
}




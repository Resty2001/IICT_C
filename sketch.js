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
let capturedConstellationURL = null;   // Base64 URL 문자열이 저장될 변수

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
  const updateSceneToConnecting = () => {
    sceneNumber = 3;
    fade = 0; // 페이드 효과를 위해 fade 값 초기화
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
            connecting.set(nameResult,storyResult);
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
  const prompt = `다음 단어를 통해 얻을 수 있는 분위기, 단어의 의미 등을 종합해서 아래의 12가지 별자리 이름 중에서 가장 잘 어울리는 별자리 이름을 골라줘. 출력은 반드시 "~자리"만 해줘. 예를 들어, "조각가자리", "수호자자리" 등: ${selectedWords.join(", ")}
  조각가자리
이미지: 망치
원형: 형태를 만들고 본질을 드러내는 예술가. 원석에서 아름다움을 발견하고 다듬어냅니다.
성격: 인내심이 강하고, 집중력이 뛰어나며, 현실적인 감각을 지녔습니다. 때로는 완벽주의적인 성향을 보일 수 있습니다.
가치: 인내, 변형, 실체화

직조가자리
이미지: 베틀 또는 실타래
원형: 관계와 운명의 실을 엮어 복잡하고 아름다운 패턴을 만들어내는 연결자.
성격: 섬세하고, 관계 지향적이며, 전체적인 그림을 볼 줄 압니다. 때로는 우유부단하거나 너무 많은 것을 고려하려 할 수 있습니다.
가치: 연결, 조화, 인연

대장장이자리
이미지: 모루
원형: 강인한 의지와 열정으로 원재료를 단련시켜 강력한 도구나 무기를 만드는 변혁가.
성격: 강인하고, 열정적이며, 목표 지향적입니다. 때로는 고집이 세거나 충동적일 수 있습니다
가치: 단련, 창조, 힘

음유시인자리
이미지: 만돌린 또는 두루마리
원형: 이야기, 노래, 시를 통해 감정과 지혜를 전달하고 영감을 주는 전달자.
성격: 표현력이 풍부하고, 감수성이 예민하며, 사람들을 매료시키는 매력이 있습니다. 때로는 현실 감각이 부족하거나 감정에 치우칠 수 있습니다.
가치: 영감, 소통, 감동

연금술사자리
이미지: 증류기 
원형: 평범한 것을 비범한 것으로 변화시키려 하며, 본질적인 변화와 깨달음을 추구하는 탐구자.
성격: 지적 호기심이 강하고, 실험적이며, 비밀스러운 면이 있습니다. 때로는 비현실적이거나 강박적인 모습을 보일 수 있습니다.
가치: 변환, 탐구, 지혜

정원사자리
이미지: 물뿌리개
원형: 생명을 키우고 돌보며, 성장과 결실을 인내심 있게 기다리는 양육자.
성격: 온화하고, 인내심이 많으며, 헌신적입니다. 때로는 지나치게 보호적이거나 변화를 두려워할 수 있습니다.
이미지: 성장, 양육, 결실

건축가자리
이미지: 컴퍼스
원형: 견고하고 아름다운 구조물을 설계하고 건설하여 질서와 안정을 창조하는 설계자.
성격: 논리적이고, 계획적이며, 미래를 내다보는 통찰력이 있습니다. 때로는 융통성이 없거나 지나치게 비판적일 수 있습니다.
가치: 구조, 안정, 비전

항해사자리
이미지: 나침반 또는 방향타
원형: 미지의 세계를 탐험하고 새로운 길을 개척하며, 목표를 향해 나아가는 길잡이.
성격: 모험심이 강하고, 직관력이 뛰어나며, 자유를 사랑합니다. 때로는 무모하거나 안정을 찾기 어려워할 수 있습니다.
가치: 탐험, 방향, 개척

치유사자리
이미지: 약초 다발 또는 카두케우스
원형: 상처 입은 몸과 마음을 돌보고, 균형과 회복을 돕는 조력자.
성격: 공감 능력이 뛰어나고, 자비로우며, 헌신적입니다. 때로는 타인의 고통에 너무 깊이 동화되거나 자신을 돌보지 못할 수 있습니다.
가치: 회복, 균형, 연민

서기관자리
이미지: 깃펜 또는 잉크병
원형: 지식과 역사를 기록하고 보존하며, 지혜를 다음 세대로 전달하는 기록자.
성격: 지적이고, 꼼꼼하며, 객관성을 중시합니다. 때로는 지나치게 분석적이거나 감정 표현에 서툴 수 있습니다.
가치: 지식, 보존, 진실

몽상가자리
이미지: 구름 또는 반짝이는 안개
원형: 현실 너머의 가능성을 보고, 상상력과 창의력으로 새로운 세계를 그리는 영감의 원천.
성격: 상상력이 풍부하고, 이상주의적이며, 독창적입니다. 때로는 현실 도피적이거나 실현 가능성이 낮은 아이디어를 추구할 수 있습니다.
가치: 상상, 영감, 가능성

수호자자리
이미지: 방패 
원형: 소중한 가치, 사람들, 또는 영역을 헌신적으로 보호하고 지키는 방어자.
성격: 책임감이 강하고, 용감하며, 충성스럽습니다. 때로는 배타적이거나 변화에 저항적일 수 있습니다
가치: 보호, 책임, 충성`;

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
그 느낌에 어울리는 신화를 10단어 이내로 간단하게 창작해 주세요. '*'이 기호는 절대로 포함하지 마시오  
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
let selectedWords = ["새벽 호숫가", "막연한 불안감", "거인들의 산맥", "말하는 신비로운 동물", "절망적인 눈보라", "불굴의 의지", "벼락 맞은 고목나무", "잊혀진 신들의 지도", "장엄한 오로라가 펼쳐진 밤", "영원한 방랑자"];
let starName, starStory;
let myth;
let prompt = "";
let introScene = true;
let mainScene, talkingScene, drawStarScene = false;

// function preload(){
//   // 이미지나 bgm 불러오기기
// }

async function setup() {
  createCanvas(600, 400);
  background(30);
  fill(255);
  textSize(16);
  
  // 서버로 전송
  //starName = await createName();
  starMyth = await createMyth();
}

function draw() {
  background(30);
  text("AI 응답:", 20, 50);
  text(starName, 20, 80, width - 40);
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

async function createMyth() {
  const prompt = `다음 이야기를 기반으로 3줄 이내의 신화를 생성해줘.
  절대로 이야기를 단순히 요약하는 방식으로 신화를 만들지 말고 이야기의 맥락과 분위기에 맞춰서
  어울리는 신화를 새로 만들어줘줘: ${selectedWords.join(", ")}`;

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



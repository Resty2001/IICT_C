let selectedWords = ["새벽 호숫가", "막연한 불안감", "거인들의 산맥", "말하는 신비로운 동물", "절망적인 눈보라", "불굴의 의지", "벼락 맞은 고목나무", "잊혀진 신들의 지도", "장엄한 오로라가 펼쳐진 밤", "영원한 방랑자"];
let starName, starMyth;
let myth;
let prompt = "";
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
  //text(starName, 20, 80, width - 40);
  text(starMyth, 20, 80, width - 40);

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



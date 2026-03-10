/*
 * Middlemist
 *
 * 무분별한 개입과 무관심 모두 생명에게 위협이 된다.
 * 개입은 단순한 행동이 아니라 이해와 책임을 동반해야 한다.
 *
 * 일정 시간이 지나면, 꽃은 '삽목' 기능이 활성화된다.
 * 사용자는 줄기를 잘라 삽목을 시도하거나, 꽃을 그대로 두는 선택을 할 수 있다.
 *
 * 환경을 방치하거나 잘못된 인터랙션으로 온도, 습도, 빛, pH 조절 실패 시
 * 꽃은 시들거나 병들어 죽어버린다.
 *
 * */

let started = false;
let buttonX, buttonY, buttonW, buttonH;

// 배경, 화분
let w = 1200,
  h = 800;
let c1, c2;
let colsC1, colsC2;
let startX, startY;
let col = [15, 24.5, 165, 110, 248];

// 날씨
let weather = "normal";
let rains = [];
let clouds = [];

// 꽃
let stemPalette1 = [];
let stemPoints = [];
let branches = [];
let mount;
let condition = "alive";

// 물뿌리개
let wateringCan;
let mouseDragging = false;
let waters = [];

// 석회제
let lime;
let limeDragging = false;

// 냉난방 버튼
let mode = "none";
let heatBtn, coolBtn, stopBtn;
let winds = [];
let windC;

// 조명 버튼
let ledMode = "off";
let onOffBtn;

// 상태창
let temperature = 50;
let humidity = 40;
let light = 60;
let pH = 50;
let effect = 0.05;

// alive, death
let stemState = 1.0; // 1: alive, 0: death
let targetStemState = 1.0;

// 시들기
let reason = temperature;
let amtC = 1; // 초기화
let interC = 0; // 초기화
let cold, brown, yellow;
let deathColor;
let amtTemp, amtHumid, amtPH, amtLight; // temp<20, humid,pH >80
let amtHumidLow, amtPHLow;

// 죽음 후 안내창
let alert = false;
let alertAfterCut = false;

// 게임 클리어
let survivalFrame = 0;
let successAlert = false;
let successAnswered = false;
let cuttingStarted = false;
let cuttingTimerStarted = false;
let cuttingAccepted = false;

let noActionFrame = 0;
let passiveEndingTriggered = false;

// 페이드 아웃
let fadeAlpha = 0;
let fadingOut = false;
let endingAlpha = 0;
let fadeSpeed = 2;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textFont("Courier New");
  startX = width / 2 - w / 2;
  startY = height / 2 - h / 2;
  buttonW = 120;
  buttonH = 40;
  buttonX = width / 2;
  buttonY = height / 2 + 100;

  onOffBtn = createButton("&nbsp;&nbsp;&nbsp;&nbsp;");
  onOffBtn.position(width / 2 - 265, startY + 60);
  onOffBtn.style("color", "#cccccc");
  onOffBtn.style("background", "#2d4554");
  onOffBtn.style("border-radius", "12px");
  onOffBtn.mousePressed(() => {
    if (ledMode === "on") {
      ledMode = "off";
    } else {
      ledMode = "on";
    }
    //console.log("ledMode is now:", ledMode);
  });

  heatBtn = createButton("&nbsp;&nbsp;&nbsp;");
  heatBtn.position(width / 2 + 180, startY + 60);
  heatBtn.style("background", "#ca4e43");
  heatBtn.style("border-radius", "12px");
  heatBtn.mousePressed(() => (mode = "heat"));

  coolBtn = createButton("&nbsp;&nbsp;&nbsp;");
  coolBtn.position(width / 2 + 210, startY + 60);
  coolBtn.style("background", "#4580c9");
  coolBtn.style("border-radius", "12px");
  coolBtn.mousePressed(() => (mode = "cool"));

  stopBtn = createButton("&nbsp;&nbsp;&nbsp;");
  stopBtn.position(width / 2 + 240, startY + 60);
  stopBtn.style("background", "#white");
  stopBtn.style("border-radius", "12px");
  stopBtn.mousePressed(() => (mode = "none"));

  // 꽃 색상 팔레트
  stemPalette1 = [color(48, 97, 109, 20), color(19, 45, 60, 30), color(8, 25, 33)];
  cold = color(120, 160, 220); // 차가운 색상
  brown = color(33, 31, 28); // 갈색
  yellow = color(0);

  // 날씨 비, 구름
  for (let i = 0; i < 500; i++) {
    rains[i] = new Rain();
  }
  for (let i = 0; i < 5; i++) {
    clouds[i] = new Cloud();
  }

  // 물뿌리개
  wateringCan = new WateringCan(width - startX - 230, height - startY - 150);
  for (let i = 0; i < 2; i++) {
    waters[i] = new Water();
  }

  // 석화제
  lime = new pHLime(width - startX - 60, height - startY - 130);

  // 날씨 변경
  setInterval(() => {
    let rand = floor(random(6));
    if (rand === 0) weather = "normal";
    else if (rand === 1) weather = "rainy";
    else if (rand === 2) weather = "sunny";
    else if (rand === 3) weather = "cloudy";
    else if (rand === 4) weather = "snow";
    else weather = "blue";
  }, 8000);
}

function draw() {
  rectMode(CENTER);
  background(18, 18, 18);

  if (!started) {
    showIntro();
    heatBtn.hide();
    coolBtn.hide();
    stopBtn.hide();
    onOffBtn.hide();
  } else {
    heatBtn.show();
    coolBtn.show();
    stopBtn.show();
    onOffBtn.show();
    amtTemp = map(temperature, 0, 20, 0, 1);
    amtTemp = constrain(amtTemp, 0.6, 1);
    amtHumid = map(humidity, 80, 100, 1, 0);
    amtHumid = constrain(amtHumid, 0.6, 1);
    amtPH = map(pH, 80, 100, 1, 0);
    amtPH = constrain(amtPH, 0.6, 1);
    amtHumidLow = map(humidity, 0, 20, 0, 1);
    amtHumidLow = constrain(amtHumidLow, 0.6, 1);
    amtPHLow = map(pH, 0, 20, 0, 1);
    amtPHLow = constrain(amtPHLow, 0.6, 1);
    amtLight = map(light, 0, 20, 0, 1);
    amtLight = constrain(amtLight, 0.6, 1);

    // 줄기 계산 (alive-death 혼합)
    stemPoints.length = 0;
    branches.length = 0;

    let stemLength = floor(lerp(250, 300, stemState));
    for (let x = 0; x < stemLength; x++) {
      let amt = map(x, 0, stemLength, 0, 1);

      // alive 상태 줄기 y값 (살랑살랑)
      let aliveY = -sin(x * 0.8) * sin(frameCount * 0.5) * 15;

      // death 상태 줄기 y값 (숙임)
      let bend = map(x, 0, stemLength, 0, 3);
      let angle = pow(bend, 3) * 0.5;
      let deathY = x * sin(angle) * 2;

      // 상태값 기반으로 둘을 부드럽게 혼합
      let mixX = lerp(deathY, aliveY, stemState);
      let mixY = -x;

      stemPoints.push({ x: mixX, y: mixY });
    }

    // 가지 생성
    branches.length = 0;

    // 분모 상태에 따라 혼합
    let divisor = lerp(4, 5, stemState);
    let interval = floor(stemPoints.length / divisor);

    for (let i = 0; i < 3; i++) {
      let ptIndex = (i + 1) * interval;
      let pt = stemPoints[ptIndex];

      // alive 상태의 각도와 death 상태의 각도 정의
      let aliveAngle = map(i, 0, 2, 70, 45); // 위로 퍼짐
      let deathAngle = 110; // 아래로 축 처짐
      let angle = lerp(deathAngle, aliveAngle, stemState);

      let t = 1.5; // 두께
      let len = map(i, 0, 2, 75, 80); // 길이

      branches[i] = new Petals(pt.x, pt.y, angle, t, len);
      branches[i + 3] = new Petals(pt.x, pt.y, -angle, t, len);
    }

    stemState = lerp(stemState, targetStemState, 0.03);

    drawBackground();
    drawFlower();
    drawRed();
    drawPot();

    wateringCan.display();
    lime.display();

    for (let i = waters.length - 1; i >= 0; i--) {
      waters[i].show();
      if (waters[i].alph <= 0) waters.splice(i, 1);
    }

    if (!successAlert && !alert && !passiveEndingTriggered) {
      // 온도 변화
      if (mode === "heat") temperature += effect * 5;
      else if (mode === "cool") temperature -= effect * 5;

      // 빛 변화
      if (ledMode === "on") light += effect * 5;
      else if (ledMode === "off") light -= effect * 5;
    }
    LED();
    drawStatusPanel();

    //console.log(condition);

    if (condition === "death") {
      alert = true;
    }

    if (alert) {
      drawReset();
    }

    if (condition === "alive" && !alert && !successAnswered) {
      survivalFrame++;
      if (survivalFrame > 60 * 20) { // 삽목까지 소요시간
        // 30초 이상
        successAlert = true;
      }
    } else {
      survivalFrame = 0; // 중간에 death 되면 초기화
    }

    if (successAlert && !successAnswered) {
      drawSuccessPopup();
    }

    if (cuttingAccepted && successAnswered && !successAlert) {
      background(0);
      heatBtn.hide();
      coolBtn.hide();
      stopBtn.hide();
      onOffBtn.hide();

      if (!cuttingTimerStarted) {
        cuttingTimerStarted = true;
        setTimeout(() => {
          cuttingStarted = true;
        }, 3000);
      }

      if (cuttingStarted) {
        cuttings();
      }
    }

    if (
      successAnswered && // 팝업에 응답
      !cuttingAccepted && // 삽목 시도 X
      condition === "alive" && // 꽃은 살아 있고
      !passiveEndingTriggered // 이미 트리거된 적 X
    ) {
      noActionFrame++;

      if (noActionFrame > 60 * 5) { // 삽목 후 엔딩까지 소요시간
        // 30초 경과
        passiveEndingTriggered = true;
        noIntervention();
      }
    } else {
      noActionFrame = 0;
    }

    if (fadingOut) {
      fadeAlpha += 2;
      fadeAlpha = constrain(fadeAlpha, 0, 255);

      fill(18, 18, 18, fadeAlpha);
      noStroke();
      rect(0, 0, width, height);

      if (fadeAlpha >= 255) {
        heatBtn.hide();
        coolBtn.hide();
        stopBtn.hide();
        onOffBtn.hide();
        //fadingOut = false;

        showEnding();
        if (endingAlpha < 255) {
          endingAlpha += fadeSpeed;
        }
      }
    }

    frame();
  }
}

function showIntro() {
  // 텍스트
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text("Middlemist", width / 2, height / 2);
  textSize(12);
  text("Click to Start", width / 2, height - 100);
  textSize(15);
}

function showEnding() {
  fill(255, endingAlpha);
  textAlign(CENTER);
  textSize(15);
  text("We’ve kept it alive — for now, that’s enough.", width / 2, height / 2);
}

function noIntervention() {
  //console.log("We don’t know how to go on yet — but that’s okay.");
  fadingOut = true;
  fadeAlpha = 0;
}

function cuttings() {
  background(18, 18, 18);
  if (weather === "normal") {
    c1 = color(29, 76, 85);
    c2 = color(186, 183, 149);
    colsC1 = color(25, 58, 74);
    colsC2 = color(128, 142, 135);
  } else if (weather === "rainy") {
    c1 = color(69, 78, 79);
    c2 = color(140, 139, 129);
    colsC1 = color(107, 119, 124);
    colsC2 = color(128, 142, 135);
  } else if (weather === "sunny") {
    c1 = color(239, 236, 203);
    c2 = color(186, 183, 149);
    colsC1 = color(178, 172, 125);
    colsC2 = color(128, 142, 135);
  } else if (weather === "cloudy") {
    c1 = color(69, 78, 79);
    c2 = color(140, 139, 129);
    colsC1 = color(107, 119, 124);
    colsC2 = color(128, 142, 135);
  } else if (weather === "snow") {
    c1 = color(220, 230, 240);
    c2 = color(140, 139, 129);
    colsC1 = color(200, 210, 230);
    colsC2 = color(90, 102, 96);
  } else if (weather === "blue") {
    c1 = color(120, 160, 210);
    c2 = color(186, 183, 149);
    colsC1 = color(15, 45, 80);
    colsC2 = color(128, 142, 135);
  }

  resetMatrix();
  for (let i = 0; i < h; i++) {
    let inter = map(i, 0, h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(width / 2 - w / 2, height / 2 - h / 2 + i, width / 2 + w / 2, height / 2 - h / 2 + i);
  }

  if (condition === "death") {
    alert = true;
    alertAfterCut = true;
  }

  if (alert) {
    drawReset();
  }

  // 줄기 계산 (alive-death 혼합)
  stemPoints.length = 0;
  branches.length = 0;

  let stemLength = floor(lerp(250, 300, stemState));
  for (let x = 0; x < stemLength; x++) {
    let amt = map(x, 0, stemLength, 0, 1);

    // alive 상태 줄기 y값
    let aliveY = -sin(x * 0.8) * sin(frameCount * 0.5) * 15;

    // death 상태 줄기 y값
    let bend = map(x, 0, stemLength, 0, 3);
    let angle = pow(bend, 3) * 0.5;
    let deathY = x * sin(angle) * 2;

    let mixX = lerp(deathY, aliveY, stemState);
    let mixY = -x;

    stemPoints.push({ x: mixX, y: mixY });
  }

  branches.length = 0;

  let divisor = lerp(4, 5, stemState);
  let interval = floor(stemPoints.length / divisor);

  for (let i = 0; i < 3; i++) {
    let ptIndex = (i + 1) * interval;
    let pt = stemPoints[ptIndex];

    let aliveAngle = map(i, 0, 2, 70, 45); // 위로 퍼짐
    let deathAngle = 110; // 아래로 축 처짐
    let angle = lerp(deathAngle, aliveAngle, stemState);

    let t = 1.5; // 두께
    let len = map(i, 0, 2, 75, 80); // 길이

    branches[i] = new Petals(pt.x, pt.y, angle, t, len);
    branches[i + 3] = new Petals(pt.x, pt.y, -angle, t, len);
  }

  stemState = lerp(stemState, targetStemState, 0.03);
  drawFlower();
  drawRed();

  noStroke();
  fill(21, 86, 86);
  ellipse(width - startX, height - startY + 100, 1200, 700);
  ellipse(startX, height - startY + 100, 1200, 700);
  fill(8, 67, 72);
  ellipse(width - startX, height - startY + 100, 1200, 500);
  ellipse(startX, height - startY + 100, 1200, 500);
  fill(4, 54, 65);
  ellipse(width / 2, height - startY + 100, 1500, 500);
}

function drawReset() {
  push();
  rectMode(CENTER);
  textAlign(CENTER);
  textSize(20);
  fill(0, 200);
  rect(width / 2, height / 2 - 10, 600, 100);

  if (alertAfterCut) {
    fill(255);
    text("They are too fragile to survive on their own.", width / 2, height / 2 - 15);
    text("Press Enter to reset.", width / 2, height / 2 + 15);
    pop();
  } else {
    fill(255);
    text("Press Enter to reset.", width / 2, height / 2);
    pop();
  }
}

function drawSuccessPopup() {
  push();
  rectMode(CENTER);
  textAlign(CENTER);
  textSize(20);
  fill(0, 200);
  rect(width / 2, height / 2 - 10, 450, 150, 20);

  fill(255);
  text("cutting", width / 2, height / 2 - 20);

  fill(255);
  text("yes", width / 2 - 80, height / 2 + 30);

  fill(255);
  text("no", width / 2 + 80, height / 2 + 30);
  pop();
}

function frame() {
  rectMode(CENTER);
  fill(18, 18, 18);
  //fill(255);
  rect(width / 2, startY - (height - h) / 2, width, height - h);
  rect(width / 2, height - (startY - (height - h) / 2), width, height - h);
  if (width - w > 0) {
    rect(startX - (width - w) / 2, height / 2, width - w, height);
    rect(width - startX + (width - w) / 2, height / 2, width - w, height);
  }
}

function drawRed() {
  angleMode(DEGREES);

  let startX = width / 2;
  let startY = height / 2 + h / 2 - 120;

  let tip = stemPoints[stemPoints.length - 1];
  let cx = startX + tip.x;
  let cy = startY + tip.y;
  let angle = 15;
  let aliveAngle = map(tip.x, -15, 15, 5, -10);
  let deathAngle = 150;
  angle = lerp(deathAngle, aliveAngle, stemState);

  if (temperature <= 20) {
    amtC = map(temperature, 0, 20, 0, 1);
    amtC = constrain(amtC, 0.6, 1);
    interC = cold; // 블루톤
  } else if (humidity <= 20) {
    amtC = map(humidity, 0, 20, 0, 1);
    amtC = constrain(amtC, 0.4, 1);
    interC = brown; // 갈색
  } else if (pH <= 20) {
    amtC = map(pH, 0, 20, 0, 1);
    amtC = constrain(amtC, 0.5, 1);
    interC = yellow; // 검정색
  } else if (humidity >= 80) {
    amtC = map(humidity, 80, 100, 1, 0);
    amtC = constrain(amtC, 0.4, 1);
    interC = yellow;
  } else if (pH >= 80) {
    amtC = map(pH, 80, 100, 1, 0);
    amtC = constrain(amtC, 0.4, 1);
    interC = brown;
  } else if (light <= 20) {
    amtC = amtLight;
    interC = yellow;
  } else {
    amtC = 1;
    interC = color(112, 20, 42); // 기본 빨간색
  }

  noStroke();
  push();
  resetMatrix();
  translate(cx, cy);
  scale(0.5);
  rotate(angle);

  // 1. 맨 아래 잎 3개
  fill(lerpColor(interC, color(112, 20, 42), amtC));
  push();
  translate(-80, -30);
  rotate(20);
  ellipse(0, 0, 170, 120);
  pop();
  push();
  translate(80, -30);
  rotate(-20);
  ellipse(0, 0, 170, 120);
  pop();

  fill(lerpColor(interC, color(154, 24, 41), amtC));
  ellipse(0, 0, 150, 100);

  // 2. 후면 잎 3개
  fill(lerpColor(interC, color(209, 43, 49), amtC));
  ellipse(0, -130, 140, 160);
  push();
  translate(70, -110);
  rotate(-15);
  ellipse(0, 0, 150, 120);
  pop();
  push();
  translate(-70, -110);
  rotate(15);
  ellipse(0, 0, 150, 120);
  pop();

  // 3. 후면 잎 2개
  fill(lerpColor(interC, color(175, 28, 43), amtC));
  push();
  translate(0, -130);
  push();
  translate(-50, 0);
  rotate(-20);
  ellipse(0, 0, 90, 160);
  pop();
  push();
  translate(50, 0);
  rotate(20);
  ellipse(0, 0, 90, 160);
  pop();
  pop();

  // 4~9 중앙 잎들
  push();
  translate(0, -130);

  fill(lerpColor(interC, color(143, 20, 40), amtC));
  ellipse(0, 10, 130, 120);
  push();
  translate(55, 20);
  rotate(20);
  ellipse(0, 0, 50, 100);
  pop();
  push();
  translate(-55, 20);
  rotate(-20);
  ellipse(0, 0, 50, 100);
  pop();

  fill(lerpColor(interC, color(196, 38, 46), amtC));
  ellipse(0, 25, 120, 90);

  fill(lerpColor(interC, color(142, 21, 40), amtC));
  ellipse(0, 30, 90, 80);

  fill(lerpColor(interC, color(173, 30, 42), amtC));
  ellipse(0, 40, 70, 70);

  fill(lerpColor(interC, color(209, 42, 48), amtC));
  push();
  translate(30, 55);
  rotate(45);
  ellipse(0, 0, 60, 100);
  pop();
  push();
  translate(-30, 55);
  rotate(-45);
  ellipse(0, 0, 60, 100);
  pop();

  fill(lerpColor(interC, color(140, 23, 38), amtC));
  push();
  translate(-55, 80);
  rotate(30);
  ellipse(0, 0, 130, 50);
  pop();
  push();
  translate(55, 80);
  rotate(-30);
  ellipse(0, 0, 130, 50);
  pop();

  pop(); // 중앙 잎 그룹
  pop(); // 전체 스케일 & 위치
}

function drawFlower() {
  resetMatrix();
  angleMode(DEGREES);
  let startX = width / 2;
  let startY = height / 2 + h / 2 - 120;
  let d = 22;

  // 줄기 그리기
  push();
  resetMatrix();
  translate(startX, startY);

  for (let i = 0; i < stemPoints.length; i++) {
    let pt = stemPoints[i];
    let amt = map(i, 0, stemPoints.length, 0, 1);
    let baseC = lerpColor(stemPalette1[0], stemPalette1[1], amt);
    let finalC = lerpColor(cold, baseC, amtTemp);
    if (temperature <= 20) {
      finalC = lerpColor(cold, baseC, amtTemp);
    } else if (humidity <= 20) {
      finalC = lerpColor(brown, baseC, amtHumidLow);
    } else if (pH <= 20) {
      finalC = lerpColor(yellow, baseC, amtPHLow);
    } else if (humidity >= 80) {
      finalC = lerpColor(yellow, baseC, amtHumid);
    } else if (pH >= 80) {
      finalC = lerpColor(brown, baseC, amtPH);
    } else if (light <= 20) {
      finalC = lerpColor(yellow, baseC, amtLight);
    }

    fill(finalC);
    noStroke();
    circle(pt.x, pt.y, d);
  }
  pop();

  // 가지 그리기
  for (let i = 0; i < branches.length; i++) {
    if (branches[i]) {
      push();
      translate(startX, startY);
      branches[i].display(1);
      pop();
    }
  }
}

class Petals {
  constructor(tx, ty, angle = 45, thickness = 1.5, leafLength = 85) {
    this.tx = tx;
    this.ty = ty;
    this.angle = angle;
    this.h = 15;
    this.leafLength = leafLength;
    this.thickness = thickness;
    this.inter1 = stemPalette1[0];
    this.inter2 = stemPalette1[1];
    this.inter3 = stemPalette1[2];
  }

  display(progress = 1) {
    push();
    translate(this.tx, this.ty);
    rotate(this.angle);
    noStroke();

    let len1 = floor(this.leafLength * constrain(progress * 3, 0, 1));
    let len2 = floor(8 * constrain((progress - 0.33) * 3, 0, 1));
    let len3 = floor(this.leafLength * constrain((progress - 0.66) * 3, 0, 1));

    deathColor = cold;
    if (temperature <= 20) {
      deathColor = cold; // 차가운 색상
      amtC = amtTemp;
    } else if (humidity <= 20) {
      deathColor = brown;
      amtC = map(humidity, 0, 20, 0, 1);
    } else if (pH <= 20) {
      deathColor = yellow;
      amtC = map(pH, 0, 20, 0, 1);
    } else if (humidity >= 80) {
      deathColor = yellow;
      amtC = amtHumid;
    } else if (pH >= 80) {
      deathColor = brown;
      amtC = amtPH;
    } else if (light <= 20) {
      deathColor = yellow;
      amtC = amtLight;
    }

    // 첫 번째 그라데이션 구간
    for (let i = 0; i < len1; i++) {
      let amt = map(i, 0, this.leafLength, 0, 1);
      let baseColor = lerpColor(this.inter1, this.inter2, amt);
      let finalColor = lerpColor(deathColor, baseColor, amtC);
      fill(finalColor);
      circle(0, 0 - i, i / this.thickness);
    }

    // 중앙 고정 컬러 구간
    for (let i = 0; i < len2; i++) {
      let baseColor = this.inter2;
      let finalColor = lerpColor(deathColor, baseColor, amtC);
      fill(finalColor);
      circle(0, 0 - this.leafLength - i, this.leafLength / this.thickness);
    }

    // 끝 그라데이션 구간
    for (let i = 0; i < len3; i++) {
      let amt = map(i, 0, this.leafLength, 0, 1);
      let baseColor = lerpColor(this.inter2, this.inter3, amt);
      let finalColor = lerpColor(deathColor, baseColor, amtC);
      fill(finalColor);
      circle(0, 0 - this.leafLength - 8 - i, this.leafLength / this.thickness - i / this.thickness);
    }

    pop();
  }
}

function drawStatusPanel() {
  let x = startX + 200;
  let y = height - startY - 150;
  let pannelW = 275;
  let pannelH = 150;
  let w = 50;
  let h = 100;

  // 상태값에 따른 죽음 조건
  if (temperature <= 0 || humidity <= 0 || humidity >= 100 || pH <= 0 || pH >= 100) {
    targetStemState = 0;
    condition = "death";
  }

  // 제한
  temperature = constrain(temperature, 0, 100);
  humidity = constrain(humidity, 0, 100);
  light = constrain(light, 0, 100);
  pH = constrain(pH, 0, 100);

  // 배경 패널
  rectMode(CENTER);
  fill(255, 150);
  rect(x, y, pannelW, pannelH, 10);

  // 온도 게이지
  noStroke();
  rectMode(CORNER);
  fill(255, 100, 100, 200);
  let tempHeight = map(temperature, 0, 100, 0, h);
  rect(x - pannelW / 2 + 15, y - pannelH / 3 + h - tempHeight, w, tempHeight);
  fill(255);
  textAlign(CENTER);
  textSize(15);
  text("temp", x - pannelW / 2 + 40, y + h / 2 + 15);

  // 습도 게이지
  fill(100, 150, 255, 200);
  let humidHeight = map(humidity, 0, 100, 0, h);
  rect(x - pannelW / 2 + w + 30, y - pannelH / 3 + h - humidHeight, w, humidHeight);
  fill(255);
  text("humid", x - pannelW / 2 + 105, y + h / 2 + 15);

  // 빛 게이지
  fill(255, 230, 100, 200);
  let lightHeight = map(light, 0, 100, 0, h);
  rect(x - pannelW / 2 + 2 * w + 45, y - pannelH / 3 + h - lightHeight, w, lightHeight);
  fill(255);
  text("light", x - pannelW / 2 + 170, y + h / 2 + 15);

  // 산성도 게이지
  fill(50, 200);
  let pHHeight = map(pH, 0, 100, 0, h);
  rect(x - pannelW / 2 + 3 * w + 60, y - pannelH / 3 + h - pHHeight, w, pHHeight);
  fill(255);
  text("pH", x - pannelW / 2 + 235, y + h / 2 + 15);

  if (!successAlert && !alert && !passiveEndingTriggered) {
    // 날씨에 따른 상태값 설정
    effect = 0.03;
    if (weather === "normal") {
      temperature += effect;
      humidity -= effect;
      light += effect;
      pH -= effect;
    } else if (weather === "rainy") {
      temperature -= effect * 3;
      humidity += effect;
      light -= effect * 2;
      pH -= effect * 2;
    } else if (weather === "sunny") {
      temperature += effect * 5;
      humidity -= effect * 4;
      light += effect * 4;
      pH -= effect;
    } else if (weather === "cloudy") {
      temperature -= effect * 3;
      humidity -= effect;
      light -= effect * 3;
      pH -= effect;
    } else if (weather === "snow") {
      temperature -= effect * 5;
      humidity -= effect;
      light += effect;
      pH -= effect;
    } else if (weather === "blue") {
      temperature -= effect;
      humidity -= effect * 2;
      light += effect;
      pH -= effect;
    }
  }

  if (temperature >= 99) {
    humidity -= 0.5;
  }
  if (light >= 99) {
    temperature += 0.3;
  }
}

function resetAll() {
  temperature = 50;
  humidity = 40;
  pH = 50;
  light = 60;

  stemState = 1.0;
  targetStemState = 1.0;

  condition = "alive";
  alert = false;
  alertAfterCut = false;

  survivalFrame = 0;
  successAlert = false;
  successAnswered = false;
  cuttingAccepted = false;
  cuttingStarted = false;
  cuttingTimerStarted = false;

  heatBtn.show();
  coolBtn.show();
  stopBtn.show();
  onOffBtn.show();
}

function keyPressed() {
  if (keyCode === ENTER) {
    if (alert) {
      resetAll();
      alert = false;
      return;
    }
  }
}

function collidePointRect(px, py, rx, ry, rw, rh) {
  return px > rx && px < rx + rw && py > ry && py < ry + rh;
}

function mousePressed() {
  if (!started) {
    started = true;
  }
  if (wateringCan.contains(mouseX, mouseY)) {
    mouseDragging = true;
  }
  if (lime.contains(mouseX, mouseY)) {
    limeDragging = true;
  }

  if (successAlert && !successAnswered) {
    let yesBtn = collidePointRect(mouseX, mouseY, width / 2 - 120, height / 2 + 10, 80, 40);
    let noBtn = collidePointRect(mouseX, mouseY, width / 2 + 40, height / 2 + 10, 80, 40);

    if (yesBtn) {
      successAnswered = true;
      successAlert = false;
      cuttingAccepted = true; // 예를 누른 경우에만 true
      console.log("삽목 시작!");
    } else if (noBtn) {
      successAnswered = true;
      successAlert = false;
      cuttingAccepted = false;
      //console.log("삽목 거부됨");
    }
  }
}

function mouseReleased() {
  if (mouseDragging) {
    mouseDragging = false;
    wateringCan.returnToDefault();
  }
  if (limeDragging) {
    limeDragging = false;
    lime.returnToDefault();
  }
}

function mouseDragged() {
  if (mouseDragging) {
    wateringCan.setPosition(mouseX, mouseY, -40);

    let waterX = mouseX - 180;
    let waterY = mouseY + 35;
    waters.push(new Water(waterX, waterY));
    humidity += effect * 8;
  }

  if (limeDragging) {
    lime.setPosition(mouseX, mouseY, -50);

    let waterX = mouseX - 80;
    let waterY = mouseY - 15;
    waters.push(new Water(waterX, waterY));
    pH += effect * 5;
  }
}

class pHLime {
  constructor(x, y, scale = 1) {
    this.x = x;
    this.y = y;
    this.defaultX = x;
    this.defaultY = y;
    this.defaultAngle = 0;
    this.s = scale;
    this.w = 80;
    this.h = 120;
    this.algle = 0;
  }

  contains(px, py) {
    return (
      px > this.x - (this.w / 2) * this.s &&
      px < this.x + (this.w / 2) * this.s &&
      py > this.y - (this.h / 2) * this.s &&
      py < this.y + (this.h / 2) * this.s
    );
  }

  setPosition(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  returnToDefault() {
    this.x = this.defaultX;
    this.y = this.defaultY;
    this.angle = this.defaultAngle;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    scale(this.s);

    rectMode(CENTER);
    fill(18, 34, 64);
    rect(0, 0, this.w, this.h, 15); // 몸통 뒷면
    rect(-this.w / 3 + 3, -this.h / 2, 15); // 입구 아래

    noFill();
    stroke(18, 34, 64);
    strokeWeight(10);
    rect(this.w / 6 + 1.5, -this.h / 8, this.w / 2, this.h, 10); // 손잡이

    noStroke();
    fill(27, 64, 99);
    rect(-5, -4, this.w - 10, this.h - 8, 5); // 몸통 앞면
    if (!limeDragging) rect(-this.w / 3 + 3, -this.h / 2 - 10, 20, 12); // 뚜껑

    fill(238, 224, 199);
    rect(-5, -4, this.w - 40, this.h - 60, 5); // 표지 노란 배경
    fill(151, 162, 146);
    rect(-5, 20, this.w - 40, 20, 5); // 표지 초록
    rect(-5, 10, this.w - 40, 10);

    noFill();
    stroke(18, 34, 64);
    strokeWeight(1.5);
    circle(6, -10, 12);
    circle(1, -17, 15);
    strokeWeight(1);
    text("pH", -12, 0);

    pop();
  }
}

class WateringCan {
  constructor(x, y, scale = 1) {
    this.x = x;
    this.y = y;
    this.defaultX = x;
    this.defaultY = y;
    this.defaultAngle = 0;
    this.s = scale;
    this.w = 140;
    this.h = 140;
    this.angle = 0;
  }

  contains(px, py) {
    return (
      px > this.x - (this.w / 2) * this.s &&
      px < this.x + (this.w / 2) * this.s &&
      py > this.y - (this.h / 2) * this.s &&
      py < this.y + (this.h / 2) * this.s
    );
  }

  setPosition(x, y, angle) {
    this.x = x;
    this.y = y;
    this.angle = angle;
  }

  returnToDefault() {
    this.x = this.defaultX;
    this.y = this.defaultY;
    this.angle = this.defaultAngle;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle);
    scale(this.s);

    // 위쪽 손잡이
    noFill();
    stroke(10, 45, 51);
    strokeWeight(12);
    ellipse(0, -75, 110, 90);

    // 오른쪽 손잡이
    rectMode(CORNER);
    rect(this.w / 4, -65, this.w / 2, this.h - 40, 20);

    // 몸통 (직사각형)
    rectMode(CENTER);
    noStroke();
    fill(48, 97, 109);
    rect(0, 0, this.w, this.h);

    // 뚜껑, 바닥
    fill(10, 45, 51);
    rect(0, -75, 150, 10, 3);
    rect(0, 75, 150, 10, 3);

    // 주둥이 (왼쪽)
    noStroke();
    push();
    translate(-this.w / 2, -10);
    fill(10, 45, 51);
    triangle(0, 0, -100, -50, 0, 50);
    triangle(0, 0, -100, -50, -100, -70);
    //pop();

    // 분사구 (끝부분 타원)
    push();
    translate(-100, -60);
    rotate(40);
    fill(48, 97, 109);
    ellipse(0, 0, 40, 50);

    //분사구 구멍 (작은 원들)
    fill(0, 50);
    for (let a = -10; a <= 10; a += 10) {
      for (let b = -15; b <= 15; b += 10) {
        ellipse(a, b, 3, 3);
      }
    }

    pop();
    pop();
    pop();
  }
}

class Water {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.alph = 50;
    this.d = random(3, 5);
  }

  display() {
    if (mouseDragging) {
      let c = color(188, 206, 211, this.alph);
      noStroke();
      for (let i = 0; i < 20; i++) {
        fill(c);
        circle(this.x, this.y + i, 1 + i);
      }
    } else if (limeDragging) {
      let c = color(255, 255, 255, this.alph);
      fill(c);
      noStroke();
      circle(this.x, this.y, this.d);
    }
  }

  move() {
    this.y += 10;
    this.alph -= 3;
    this.alph = max(this.alph, 0);
  }

  show() {
    this.display();
    this.move();
  }
}

class Rain {
  constructor() {
    this.x = random(startX, width - startX);
    this.y = random(startY, height - startY);
    this.len = random(20, 30);
    this.speed = 1;
    this.d = random(10, 15);
  }
  display() {
    noStroke();
    if (weather === "snow") {
      fill(255, 150);
      ellipse(this.x, this.y, this.d);
    } else {
      stroke(200, 100);
      strokeWeight(1);
      line(this.x, this.y, this.x, this.y + this.len);
    }
  }
  move() {
    if (weather === "snow") {
      this.y += this.speed / 2;
    } else {
      this.y += this.speed;
    }

    if (this.x < startX || this.y > height - startY) {
      this.x = random(0, width * 3);
      this.y = startY - 50;
    }
  }
  show() {
    this.display();
    this.move();
  }
}

function drawBackground() {
  if (weather === "normal") {
    c1 = color(29, 76, 85);
    c2 = color(186, 183, 149);
    colsC1 = color(25, 58, 74);
    colsC2 = color(128, 142, 135);
  } else if (weather === "rainy") {
    c1 = color(69, 78, 79);
    c2 = color(140, 139, 129);
    colsC1 = color(107, 119, 124);
    colsC2 = color(128, 142, 135);
  } else if (weather === "sunny") {
    c1 = color(239, 236, 203);
    c2 = color(186, 183, 149);
    colsC1 = color(178, 172, 125);
    colsC2 = color(128, 142, 135);
  } else if (weather === "cloudy") {
    c1 = color(69, 78, 79);
    c2 = color(140, 139, 129);
    colsC1 = color(107, 119, 124);
    colsC2 = color(128, 142, 135);
  } else if (weather === "snow") {
    c1 = color(220, 230, 240);
    c2 = color(140, 139, 129);
    colsC1 = color(200, 210, 230);
    colsC2 = color(90, 102, 96);
  } else if (weather === "blue") {
    c1 = color(120, 160, 210);
    c2 = color(186, 183, 149);
    colsC1 = color(15, 45, 80);
    colsC2 = color(128, 142, 135);
  }

  resetMatrix();
  for (let i = 0; i < h; i++) {
    let inter = map(i, 0, h, 0, 1);
    let c = lerpColor(c1, c2, inter);
    stroke(c);
    line(width / 2 - w / 2, height / 2 - h / 2 + i, width / 2 + w / 2, height / 2 - h / 2 + i);
  }

  if (weather === "rainy" || weather === "snow") {
    for (let i = 0; i < rains.length; i++) {
      rains[i].show();
    }
  }

  //for (let i = 0; i < clouds.length; i++) {
  //  clouds[i].show();
  //}

  if (weather === "blue") {
    for (let i = 0; i < clouds.length; i++) {
      clouds[i].show();
    }
  }

  // 배경 격자
  cols(startX + col[1] + col[0] / 2, startY);
  cols(startX + col[1] + col[0] + col[2] + col[0] / 2, startY);
  cols(startX + col[1] + col[0] * 2 + col[2] + col[3] + col[0] / 2, startY);
  cols(width / 2, startY);
  cols(width / 2 + col[0] + col[4], startY);
  cols(width / 2 + col[0] + col[4] + col[3] + col[0], startY);
  cols(width / 2 + w / 2 - col[1] - col[0] / 2, startY);
  let gap = 136;
  rows(startY + gap - 6);
  rows(startY + 2 * gap - 6);
  rows(startY + 3 * gap - 6);
  rows(startY + 4 * gap - 6);
}

class Cloud {
  constructor() {
    this.x = random(startX - 100, width + 100);
    this.difX = random(10, 40);
    this.y = random(startY + 150, height - startY - 150);
    this.w = random(300, 300);
    this.h = random(60, 60);
    this.speed = random(1, 2);
  }
  display() {
    fill(255);
    noStroke();
    rect(this.x, this.y, this.w + 20, this.h, 100);
    rect(this.x + this.difX, this.y - this.h / 2, this.w - 120, this.h, 100);
    rect(this.x - 30, this.y - this.h, this.w - 180, this.h - 30, 100);
    rect(this.x + this.difX, this.y + this.h / 2 + 20, this.w - 50, this.h - 10, 100);
  }
  move() {
    this.x -= this.speed;
    if (this.x < startX - this.w - 100) {
      this.x = width - startX + this.w;
      this.y = random(0, height);
    }
  }
  show() {
    this.display();
    this.move();
  }
}

function LED() {
  let alph = 150;
  for (let i = 0; i < 1000; i++) {
    let c = color(29, 42, 53, alph);
    let shadowH = 10;
    rectMode(CENTER);
    fill(c);
    rect(width / 2, startY + shadowH / 2 + i * shadowH, w, shadowH);
    alph -= 5;
  }

  let ledC = color(237, 232, 192);
  if (mode === "heat") ledC = color(255, 224, 220);
  else if (mode === "cool") ledC = color(233, 252, 255);
  fill(ledC);
  ellipse(width / 2, startY + 90, 580, 70);

  alph = 10;
  if (ledMode === "on") {
    for (let i = 0; i < 500; i++) {
      let c = color(237, 232, 192, alph);
      if (mode === "heat") c = color(234, 126, 108, alph);
      else if (mode === "cool") c = color(233, 252, 255, alph);
      noStroke();
      fill(c);
      ellipse(width / 2, startY + 100 + i, 580 + i / 2, 30);
      alph -= 0.05;
    }
  }
  resetMatrix();
  rectMode(CENTER);
  noStroke();

  fill(13, 31, 40);
  rect(width / 2, startY + 70, 600, 50, 10);
  rect(width / 2 - 300, startY + 40, 30, 80);
  rect(width / 2 + 300, startY + 40, 30, 80);
  if (ledMode === "off") {
    alph = 250;
    for (let i = 0; i < 150; i++) {
      let c = color(29, 42, 53, alph);
      let shadowW = 10;
      rectMode(CENTER);
      fill(c);
      rect(startX + shadowW / 2 + i * shadowW, height / 2, shadowW, h);
      rect(width - startX - shadowW / 2 - i * shadowW, height / 2, shadowW, h);
      alph -= 3;
    }
  }
}

function drawPot() {
  rectMode(CENTER);
  noStroke();
  fill(33, 67, 78);
  rect(width / 2, height / 2 + h / 2 - 50, w, 100);

  fill(26, 53, 69); // 화분 몸통
  rect(width / 2, height / 2 + h / 2 - 60, 350, 120);
  fill(25, 43, 59); // 화분 그림자
  rect(width / 2, height / 2 + h / 2 - 120, 350, 30);
  fill(32, 67, 76);
  rect(width / 2, height / 2 + h / 2 - 140, 380, 40);

  fill(24, 42, 61);
  rect(width / 2, height / 2 + h / 2 - 25, w, 50);
}

function cols(_x, _y) {
  resetMatrix();
  rectMode(CENTER);
  for (let i = 0; i < h; i++) {
    let inter = map(i, startY, startY + h, 0, 1);
    let c = lerpColor(colsC1, colsC2, inter);
    noStroke();
    fill(c);
    rect(_x, _y + i, 15, 1);
  }
}

function rows(_y) {
  resetMatrix();
  let rowThickness = 15;
  let yStart = _y;

  for (let j = 0; j < rowThickness; j++) {
    let y = yStart + j;

    let inter = map(y, startY, startY + h, 0, 1);
    let c = lerpColor(colsC1, colsC2, inter);

    strokeWeight(1);
    stroke(c);
    line(startX, y, startX + w, y);
  }
}

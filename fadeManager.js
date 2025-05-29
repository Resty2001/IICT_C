class FadeManager {
  constructor() {
    this.fadeAlpha = 0;
    this.isFading = false;
    this.fadeSpeed = 10;
    this.targetScene = null;
    this.onFadeComplete = null;
    this.lastSceneFrame = null;
    this.nextSceneFrame = null;
    this.transitionReady = false;
    this.captureNextScene = null;
  }

  startFade(targetScene, captureNextScene, onComplete = null) {
    if (this.isFading) return;

    this.isFading = true;
    this.fadeAlpha = 0;
    this.targetScene = targetScene;
    this.onFadeComplete = onComplete;
    this.transitionReady = false;
    this.lastSceneFrame = get(); // 캡처 현재 장면
    this.captureNextScene = captureNextScene; // 다음 장면 그릴 함수
    this.nextSceneFrame = null;
  }

  update(currentSceneSetter) {
    if (!this.isFading) return;

    this.fadeAlpha += this.fadeSpeed;
    this.fadeAlpha = constrain(this.fadeAlpha, 0, 255);

    // 중간쯤에서 다음 장면 준비
    if (this.fadeAlpha >= 128 && !this.transitionReady) {
      if (typeof currentSceneSetter === 'function') {
        currentSceneSetter(this.targetScene);
      }

      // 실제로 다음 씬을 한 프레임 그린 후 캡처
      if (typeof this.captureNextScene === 'function') {
        this.captureNextScene(); // → draw()에 이 함수 호출되게 해야 함
        this.nextSceneFrame = get();
      }

      this.transitionReady = true;
    }

    if (this.fadeAlpha >= 255) {
      this.isFading = false;
      if (this.onFadeComplete) this.onFadeComplete();
    }
  }

  drawOverlay() {
    if (!this.isFading || !this.lastSceneFrame || !this.nextSceneFrame) return;

    // 1. 이전 장면 전체 그리기
    image(this.lastSceneFrame, 0, 0, width, height);

    // 2. 다음 장면을 fadeAlpha에 비례해 서서히 올리기
    push();
    tint(255, this.fadeAlpha); // 알파값으로 점점 선명해짐
    image(this.nextSceneFrame, 0, 0, width, height);
    pop();
  }

  isActive() {
    return this.isFading;
  }
}

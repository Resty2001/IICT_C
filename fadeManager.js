class FadeManager {
  constructor() {
    this.fadeAlpha = 0;
    this.isFading = false;
    this.fadeSpeed = 5;
    this.onFadeComplete = null;

    this.currentSceneDraw = null;
    this.nextSceneDraw = null;
    this.phase = 'idle'; // 'fadingOut' → 'switch' → 'fadingIn'
  }

  startFade(currentSceneDraw, nextSceneDraw, onComplete = null) {
    if (this.isFading) return;

    this.isFading = true;
    this.fadeAlpha = 0;
    this.onFadeComplete = onComplete;

    this.currentSceneDraw = currentSceneDraw;
    this.nextSceneDraw = nextSceneDraw;
    this.phase = 'fadingOut';
  }

  update() {
    if (!this.isFading) return;

    if (this.phase === 'fadingOut') {
      this.fadeAlpha += this.fadeSpeed;
      if (this.fadeAlpha >= 255) {
        this.fadeAlpha = 255;
        this.phase = 'switch';
      }
    } else if (this.phase === 'switch') {
      this.phase = 'fadingIn';
    } else if (this.phase === 'fadingIn') {
      this.fadeAlpha -= this.fadeSpeed;
      if (this.fadeAlpha <= 0) {
        this.fadeAlpha = 0;
        this.isFading = false;
        this.phase = 'idle';
        if (this.onFadeComplete) this.onFadeComplete();
      }
    }
  }

  draw() {
    if (!this.isFading) return;

    // draw current or next scene
    if (this.phase === 'fadingOut') {
      if (this.currentSceneDraw) this.currentSceneDraw();
    } else {
      if (this.nextSceneDraw) this.nextSceneDraw();
    }

    // overlay fade
    push();
    noStroke();
    fill(0, this.fadeAlpha);
    rect(0, 0, width, height);
    pop();
  }

  isActive() {
    return this.isFading;
  }
}

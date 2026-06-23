const FINAL_GIFT_IMAGE = "img.png";
const FINAL_GIFT_PAGE = "gift.html";

const screens = [
  "start",
  "sparks",
  "memory",
  "phrase",
  "promises",
  "final",
];

const state = {
  screen: 0,
  foundSparks: new Set(),
  memorySequence: [1, 3, 0, 2],
  memoryInput: [],
  phraseInput: [],
  promises: new Set(),
};

const sparkPositions = [
  { left: "18%", top: "24%" },
  { left: "72%", top: "20%" },
  { left: "50%", top: "42%" },
  { left: "26%", top: "68%" },
  { left: "79%", top: "66%" },
];

const memoryLabels = ["Sabr", "Kulgu", "Mehr", "Orzu"];
const phrase = ["Men", "seni", "har kuni", "tanlayman"];
const shuffledPhrase = ["har kuni", "Men", "tanlayman", "seni"];
const promiseLabels = [
  "Bugun vaqtim faqat sen uchun",
  "Ko'proq tinglayman, kamroq shoshilaman",
  "Har kuni kichik quvonch yarataman",
];

const gamePanel = document.querySelector("#gamePanel");
const progress = document.querySelector("#progress");

function renderProgress() {
  progress.innerHTML = screens
    .map((_, index) => {
      const status = index < state.screen ? "is-done" : index === state.screen ? "is-active" : "";
      return `<span class="progress-step ${status}">${index + 1}</span>`;
    })
    .join("");
}

function setScreen(index) {
  state.screen = index;
  render();
}

function nextScreen() {
  setScreen(Math.min(state.screen + 1, screens.length - 1));
}

function render() {
  renderProgress();
  const name = screens[state.screen];

  if (name === "start") renderStart();
  if (name === "sparks") renderSparks();
  if (name === "memory") renderMemory();
  if (name === "phrase") renderPhrase();
  if (name === "promises") renderPromises();
  if (name === "final") renderFinal();
}

function baseScreen({ title, text, stage, actions = "", toast = "" }) {
  gamePanel.innerHTML = `
    <div class="screen">
      <div class="screen-copy">
        <h2>${title}</h2>
        <p>${text}</p>
        <div class="toast" id="toast">${toast}</div>
        <div class="action-row">${actions}</div>
      </div>
      <div class="stage">${stage}</div>
    </div>
  `;
}

function renderStart() {
  baseScreen({
    title: "Bugun hammasi sen uchun",
    text: "Kichkina sinovlardan o'tsang, oxirida men tayyorlagan sovg'a ochiladi.",
    stage: `
      <div class="gift-visual">
        <div class="gift-box"><div class="bow"></div></div>
      </div>
      <p class="note">Har bosqichda bizning kichik sirlarimiz bor.</p>
    `,
    actions: `<button class="btn" id="startBtn">Boshlash</button>`,
  });

  document.querySelector("#startBtn").addEventListener("click", nextScreen);
}

function renderSparks() {
  const sparks = sparkPositions
    .map(
      (pos, index) =>
        `<button class="spark-target ${state.foundSparks.has(index) ? "is-found" : ""}" style="left:${pos.left}; top:${pos.top}" data-spark="${index}" aria-label="Nur ${index + 1}"></button>`,
    )
    .join("");
  const foundCount = state.foundSparks.size;

  baseScreen({
    title: "Besh nur",
    text: "Stol atrofidagi beshta nurli belgini top.",
    stage: `
      ${sparks}
      <div class="counter">${foundCount}/5 topildi</div>
    `,
    toast: foundCount === 5 ? "Ajoyib, keyingi eshik ochildi." : "",
    actions: foundCount === 5 ? `<button class="btn" id="nextBtn">Davom etish</button>` : "",
  });

  document.querySelectorAll("[data-spark]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.spark);
      state.foundSparks.add(index);
      renderSparks();
    });
  });

  const nextBtn = document.querySelector("#nextBtn");
  if (nextBtn) nextBtn.addEventListener("click", nextScreen);
}

function renderMemory() {
  const buttons = memoryLabels
    .map((label, index) => `<button class="memory-btn" data-memory="${index}">${label}</button>`)
    .join("");

  baseScreen({
    title: "Esda saqla",
    text: "Yorishgan so'zlar ketma-ketligini aynan shu tartibda bos.",
    stage: `
      <div class="memory-grid">${buttons}</div>
      <div class="counter">${state.memoryInput.length}/4</div>
    `,
    actions: `
      <button class="btn secondary" id="showSequence">Ko'rsatish</button>
      ${state.memoryInput.length === 4 ? `<button class="btn" id="memoryNext">Davom etish</button>` : ""}
    `,
  });

  document.querySelector("#showSequence").addEventListener("click", playSequence);
  document.querySelectorAll("[data-memory]").forEach((button) => {
    button.addEventListener("click", () => chooseMemory(Number(button.dataset.memory)));
  });

  const memoryNext = document.querySelector("#memoryNext");
  if (memoryNext) memoryNext.addEventListener("click", nextScreen);
}

function playSequence() {
  const buttons = [...document.querySelectorAll("[data-memory]")];
  state.memorySequence.forEach((item, order) => {
    window.setTimeout(() => {
      buttons[item].classList.add("is-lit");
      window.setTimeout(() => buttons[item].classList.remove("is-lit"), 460);
    }, order * 650);
  });
}

function chooseMemory(index) {
  const expected = state.memorySequence[state.memoryInput.length];
  const button = document.querySelector(`[data-memory="${index}"]`);

  if (index !== expected) {
    state.memoryInput = [];
    button.classList.add("is-wrong");
    window.setTimeout(renderMemory, 520);
    return;
  }

  state.memoryInput.push(index);
  button.classList.add("is-lit");

  if (state.memoryInput.length === state.memorySequence.length) {
    window.setTimeout(renderMemory, 420);
  }
}

function renderPhrase() {
  const slots = phrase
    .map((_, index) => `<div class="word-slot">${state.phraseInput[index] || ""}</div>`)
    .join("");
  const choices = shuffledPhrase
    .map(
      (word) =>
        `<button class="choice ${state.phraseInput.includes(word) ? "is-used" : ""}" data-word="${word}">${word}</button>`,
    )
    .join("");
  const isDone = phrase.every((word, index) => state.phraseInput[index] === word);

  baseScreen({
    title: "Gapni yig'",
    text: "So'zlarni to'g'ri tartibga qo'y.",
    stage: `
      <div class="phrase-area">
        <div class="selected-words">${slots}</div>
        <div class="word-bank">${choices}</div>
      </div>
      <div class="counter">${state.phraseInput.length}/4</div>
    `,
    toast: isDone ? "Shu gap bugungi sovg'aning kaliti." : "",
    actions: `
      <button class="btn secondary" id="phraseReset">Qayta yig'ish</button>
      ${isDone ? `<button class="btn" id="phraseNext">Davom etish</button>` : ""}
    `,
  });

  document.querySelectorAll("[data-word]").forEach((button) => {
    button.addEventListener("click", () => {
      const word = button.dataset.word;
      if (state.phraseInput.includes(word)) return;
      state.phraseInput.push(word);
      renderPhrase();
    });
  });

  document.querySelector("#phraseReset").addEventListener("click", () => {
    state.phraseInput = [];
    renderPhrase();
  });

  const phraseNext = document.querySelector("#phraseNext");
  if (phraseNext) phraseNext.addEventListener("click", nextScreen);
}

function renderPromises() {
  const list = promiseLabels
    .map(
      (label, index) =>
        `<button class="promise ${state.promises.has(index) ? "is-on" : ""}" data-promise="${index}">${label}</button>`,
    )
    .join("");
  const isDone = state.promises.size === promiseLabels.length;

  baseScreen({
    title: "Uch va'da",
    text: "Bu safar topshiriq senga emas, menga. Uchalasini ham belgilayman.",
    stage: `
      <div class="promise-list">${list}</div>
      <div class="counter">${state.promises.size}/3</div>
    `,
    toast: isDone ? "Va'dalar muhrlandi." : "",
    actions: isDone ? `<button class="btn" id="promiseNext">Sovg'ani ochish</button>` : "",
  });

  document.querySelectorAll("[data-promise]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.promise);
      if (state.promises.has(index)) state.promises.delete(index);
      else state.promises.add(index);
      renderPromises();
    });
  });

  const promiseNext = document.querySelector("#promiseNext");
  if (promiseNext) promiseNext.addEventListener("click", nextScreen);
}

function renderFinal() {
  baseScreen({
    title: "Sovg'a tayyor",
    text: "Bu kichik sayohat tugadi. Endi asosiy sovg'a rasmini ochish vaqti.",
    stage: `
      <div class="gift-preview">
        <img src="${FINAL_GIFT_IMAGE}" alt="Sovg'a rasmi" />
      </div>
      <p class="note">Rasmni to'liq ko'rish uchun sovg'ani oching.</p>
    `,
    actions: `
      <button class="btn" id="openGift">Sovg'ani ochish</button>
      <button class="btn secondary" id="restart">Qaytadan</button>
    `,
  });

  document.querySelector("#openGift").addEventListener("click", () => {
    window.location.href = FINAL_GIFT_PAGE;
  });

  document.querySelector("#restart").addEventListener("click", () => {
    state.screen = 0;
    state.foundSparks.clear();
    state.memoryInput = [];
    state.phraseInput = [];
    state.promises.clear();
    render();
  });
}

render();

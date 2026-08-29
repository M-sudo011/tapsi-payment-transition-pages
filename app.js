const content = {
  redirect: {
    normal: {
      title: "در حال انتقال به درگاه پرداخت",
      description: "لطفاً چند لحظه منتظر بمانید.",
    },
    slow: {
      title: "اتصال به درگاه کمی طول کشیده است",
      description: "همچنان در حال برقراری ارتباط با درگاه پرداخت هستیم.",
    },
    note: {
      icon: "!",
      title: "فیلترشکن را خاموش کنید",
      description: "برای اتصال بهتر به درگاه پرداخت، فیلترشکن (VPN) خود را خاموش کنید.",
    },
    journey: {
      origin: "تپسی",
      destination: "درگاه",
      first: "آماده‌سازی پرداخت",
      second: "اتصال به درگاه",
    },
  },
  capture: {
    normal: {
      title: "در حال تکمیل پرداخت",
      description: "لطفاً تا نمایش نتیجه پرداخت منتظر بمانید.",
    },
    slow: {
      title: "تکمیل پرداخت کمی بیشتر طول کشیده است",
      description: "پرداخت شما همچنان در حال ثبت است. لطفاً منتظر بمانید.",
    },
    note: {
      icon: "!",
      title: "این صفحه را نبندید",
      description: "بستن صفحه یا بازگشت به عقب می‌تواند فرایند پرداخت را ناقص کند.",
    },
    journey: {
      origin: "درگاه",
      destination: "تپسی",
      first: "بازگشت از درگاه",
      second: "ثبت نتیجه پرداخت",
    },
  },
  result: {
    success: {
      title: "پرداخت با موفقیت انجام شد",
      description: "مبلغ پرداخت در تپسی ثبت شد.",
      noteTitle: "پرداخت ثبت شد",
      noteDescription: "می‌توانید با خیال راحت به اپ تپسی برگردید.",
      symbol: "✓",
    },
    failure: {
      title: "پرداخت ناموفق بود",
      description: "مبلغی در تپسی ثبت نشد.",
      noteTitle: "اگر مبلغی از حساب شما کم شده است",
      noteDescription: "برگشت وجه طبق فرایند بانکی انجام می‌شود. پیش از پرداخت دوباره، وضعیت تراکنش را در تپسی بررسی کنید.",
      symbol: "×",
    },
  },
};

const validValues = {
  screen: new Set(["redirect", "capture", "result"]),
  variant: new Set(["a", "b", "c"]),
  result: new Set(["success", "failure"]),
};

const elements = {
  title: document.getElementById("state-title"),
  description: document.getElementById("state-description"),
  note: document.getElementById("status-note"),
  noteIcon: document.getElementById("note-icon"),
  noteTitle: document.getElementById("note-title"),
  noteDescription: document.getElementById("note-description"),
  resultMarkSymbol: document.getElementById("result-mark-symbol"),
  returnButton: document.getElementById("return-button"),
  journeyOrigin: document.getElementById("journey-origin"),
  journeyDestination: document.getElementById("journey-destination"),
  stepOneText: document.getElementById("step-one-text"),
  stepTwoText: document.getElementById("step-two-text"),
  slowToggle: document.getElementById("slow-toggle"),
  resultController: document.getElementById("result-controller"),
  controls: document.getElementById("demo-controls"),
  controlsLauncher: document.getElementById("controls-launcher"),
  controlsClose: document.getElementById("controls-close"),
  toast: document.getElementById("toast"),
};

const query = new URLSearchParams(window.location.search);
const initialScreen = validValues.screen.has(query.get("screen")) ? query.get("screen") : "redirect";
const initialVariant = validValues.variant.has(query.get("variant")) ? query.get("variant") : "a";
const initialResult = validValues.result.has(query.get("result")) ? query.get("result") : "success";

const state = {
  screen: initialScreen,
  variant: initialVariant,
  result: initialResult,
  slow: initialScreen === "result" ? false : query.get("slow") === "1",
};

let autoSlowTimer = null;
let toastTimer = null;

function updatePressedButtons(controller, value) {
  document.querySelectorAll(`[data-controller="${controller}"] button`).forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.value === value));
  });
}

function updateUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set("screen", state.screen);
  params.set("variant", state.variant);
  params.set("result", state.result);

  if (state.screen !== "result" && state.slow) {
    params.set("slow", "1");
  } else {
    params.delete("slow");
  }

  const nextUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
}

function applyState({ updateHistory = true } = {}) {
  document.body.dataset.screen = state.screen;
  document.body.dataset.variant = state.variant;
  document.body.dataset.slow = String(state.slow);
  document.body.dataset.result = state.result;

  const isResult = state.screen === "result";
  elements.slowToggle.disabled = isResult;
  elements.slowToggle.checked = !isResult && state.slow;
  elements.resultController.disabled = !isResult;
  elements.returnButton.hidden = !isResult;

  if (isResult) {
    const resultContent = content.result[state.result];
    elements.title.textContent = resultContent.title;
    elements.description.textContent = resultContent.description;
    elements.noteIcon.textContent = resultContent.symbol;
    elements.noteTitle.textContent = resultContent.noteTitle;
    elements.noteDescription.textContent = resultContent.noteDescription;
    elements.resultMarkSymbol.textContent = resultContent.symbol;
  } else {
    const pageContent = content[state.screen];
    const timingContent = state.slow ? pageContent.slow : pageContent.normal;
    elements.title.textContent = timingContent.title;
    elements.description.textContent = timingContent.description;
    elements.noteIcon.textContent = pageContent.note.icon;
    elements.noteTitle.textContent = pageContent.note.title;
    elements.noteDescription.textContent = pageContent.note.description;
    elements.journeyOrigin.textContent = pageContent.journey.origin;
    elements.journeyDestination.textContent = pageContent.journey.destination;
    elements.stepOneText.textContent = pageContent.journey.first;
    elements.stepTwoText.textContent = pageContent.journey.second;
  }

  updatePressedButtons("screen", state.screen);
  updatePressedButtons("variant", state.variant);
  updatePressedButtons("result", state.result);

  if (updateHistory) updateUrl();
}

function setScreen(screen) {
  if (!validValues.screen.has(screen)) return;
  state.screen = screen;
  if (screen === "result") state.slow = false;
  applyState();
}

function setVariant(variant) {
  if (!validValues.variant.has(variant)) return;
  state.variant = variant;
  applyState();
}

function setResult(result) {
  if (!validValues.result.has(result)) return;
  state.result = result;
  applyState();
}

function setSlow(slow) {
  if (state.screen === "result") return;
  state.slow = Boolean(slow);
  applyState();
}

function startAutoSlow(delayMs = 7000) {
  window.clearTimeout(autoSlowTimer);
  if (state.screen === "result") return;

  autoSlowTimer = window.setTimeout(() => {
    setSlow(true);
  }, Math.max(0, Number(delayMs) || 0));
}

function stopAutoSlow() {
  window.clearTimeout(autoSlowTimer);
  autoSlowTimer = null;
}

function openControls() {
  elements.controls.hidden = false;
  elements.controlsLauncher.hidden = true;
  elements.controlsLauncher.setAttribute("aria-expanded", "true");
}

function closeControls() {
  elements.controls.hidden = true;
  elements.controlsLauncher.hidden = false;
  elements.controlsLauncher.setAttribute("aria-expanded", "false");
}

function showToast() {
  window.clearTimeout(toastTimer);
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 2800);
}

document.querySelectorAll("[data-controller] button").forEach((button) => {
  button.addEventListener("click", () => {
    const controller = button.closest("[data-controller]").dataset.controller;
    const value = button.dataset.value;

    if (controller === "screen") setScreen(value);
    if (controller === "variant") setVariant(value);
    if (controller === "result") setResult(value);
  });
});

elements.slowToggle.addEventListener("change", () => setSlow(elements.slowToggle.checked));
elements.controlsLauncher.addEventListener("click", openControls);
elements.controlsClose.addEventListener("click", closeControls);

elements.returnButton.addEventListener("click", () => {
  const returnUrl = new URLSearchParams(window.location.search).get("returnUrl");
  const isAllowedDeepLink = returnUrl && /^tapsi:\/\//i.test(returnUrl);

  if (isAllowedDeepLink) {
    window.location.assign(returnUrl);
    return;
  }
  showToast();
});

window.addEventListener("beforeunload", (event) => {
  const guardEnabled = new URLSearchParams(window.location.search).get("guard") === "1";
  if (guardEnabled && state.screen === "capture") {
    event.preventDefault();
    event.returnValue = "";
  }
});

window.paymentTransition = Object.freeze({
  setScreen,
  setVariant,
  setResult,
  setSlow,
  startAutoSlow,
  stopAutoSlow,
  getState: () => ({ ...state }),
});

applyState({ updateHistory: false });

const autoSlowMs = Number(query.get("autoSlow"));
if (Number.isFinite(autoSlowMs) && autoSlowMs > 0) startAutoSlow(autoSlowMs);

if (window.matchMedia("(min-width: 900px)").matches) openControls();

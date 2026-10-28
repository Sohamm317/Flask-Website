/* Flask Blog chat helper widget.
   Loaded only for logged-in users. Injects its own CSS and HTML.
   Talks to: POST /chat/message  and  POST /chat/reset */
(function () {
  "use strict";

  var MAX_CHARS = 2000;

  /* ---------- Styles (all prefixed with .fbc- to avoid clashing with Bootstrap) ---------- */
  var css = `
  .fbc-toggle {
    position: fixed; right: 20px; bottom: 20px; z-index: 1050;
    width: 56px; height: 56px; border-radius: 50%; border: 0; cursor: pointer;
    background: #5f788a; color: #fff; font-size: 24px; line-height: 1;
    box-shadow: 0 4px 14px rgba(0,0,0,.25);
  }
  .fbc-toggle:hover { background: #4d6373; }
  .fbc-panel {
    position: fixed; right: 20px; bottom: 90px; z-index: 1050;
    width: 360px; max-width: calc(100vw - 40px); height: 480px; max-height: calc(100vh - 120px);
    display: none; flex-direction: column; overflow: hidden;
    background: #fff; color: #333; border: 1px solid #ddd; border-radius: 10px;
    box-shadow: 0 8px 28px rgba(0,0,0,.25); font-size: 15px; line-height: 1.45;
  }
  .fbc-panel.fbc-open { display: flex; }
  .fbc-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; background: #5f788a; color: #fff; font-weight: 600;
  }
  .fbc-head button {
    background: transparent; border: 0; color: #fff; cursor: pointer;
    font-size: 13px; opacity: .85; padding: 2px 6px;
  }
  .fbc-head button:hover { opacity: 1; text-decoration: underline; }
  .fbc-log {
    flex: 1; overflow-y: auto; padding: 12px; background: #fafafa;
    display: flex; flex-direction: column; gap: 8px;
  }
  .fbc-row { display: flex; }
  .fbc-row.fbc-user { justify-content: flex-end; }
  .fbc-bubble {
    max-width: 82%; padding: 8px 12px; border-radius: 14px;
    white-space: pre-wrap; overflow-wrap: anywhere;
  }
  .fbc-bot .fbc-bubble { background: #e9edf0; border-bottom-left-radius: 4px; }
  .fbc-user .fbc-bubble { background: #5f788a; color: #fff; border-bottom-right-radius: 4px; }
  .fbc-err .fbc-bubble { background: #fde8e8; color: #8a1c1c; }
  .fbc-dots { display: inline-flex; gap: 4px; padding: 4px 0; }
  .fbc-dots i {
    width: 7px; height: 7px; border-radius: 50%; background: #7a8791;
    animation: fbc-blink 1.1s infinite;
  }
  .fbc-dots i:nth-child(2) { animation-delay: .15s; }
  .fbc-dots i:nth-child(3) { animation-delay: .3s; }
  @keyframes fbc-blink { 0%, 80%, 100% { opacity: .25; } 40% { opacity: 1; } }
  .fbc-form {
    display: flex; gap: 8px; padding: 10px; border-top: 1px solid #ddd; background: #fff;
    align-items: flex-end;
  }
  .fbc-input {
    flex: 1; resize: none; min-height: 38px; max-height: 110px; padding: 8px 10px;
    border: 1px solid #ccc; border-radius: 8px; font: inherit; color: inherit;
  }
  .fbc-send {
    border: 0; border-radius: 8px; padding: 8px 14px; cursor: pointer;
    background: #5f788a; color: #fff; font: inherit; font-weight: 600;
  }
  .fbc-send:disabled, .fbc-input:disabled { opacity: .55; cursor: not-allowed; }
  .fbc-toggle:focus-visible, .fbc-send:focus-visible, .fbc-input:focus-visible,
  .fbc-head button:focus-visible { outline: 3px solid #428bca; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) { .fbc-dots i { animation: none; opacity: .6; } }
  `;
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- DOM ---------- */
  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  var toggle = el("button", "fbc-toggle", "\uD83D\uDCAC");
  toggle.type = "button";
  toggle.setAttribute("aria-label", "Open chat helper");
  toggle.setAttribute("aria-expanded", "false");

  var panel = el("section", "fbc-panel");
  panel.setAttribute("aria-label", "Chat helper");

  var head = el("div", "fbc-head");
  head.appendChild(el("span", "", "Blog helper"));
  var resetBtn = el("button", "", "New chat");
  resetBtn.type = "button";
  head.appendChild(resetBtn);

  var log = el("div", "fbc-log");
  log.setAttribute("aria-live", "polite");

  var form = el("div", "fbc-form");
  var input = el("textarea", "fbc-input");
  input.rows = 1;
  input.maxLength = MAX_CHARS;
  input.placeholder = "Ask me anything about the site";
  input.setAttribute("aria-label", "Message");
  var sendBtn = el("button", "fbc-send", "Send");
  sendBtn.type = "button";
  form.appendChild(input);
  form.appendChild(sendBtn);

  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(form);
  document.body.appendChild(panel);
  document.body.appendChild(toggle);

  /* ---------- Messages ---------- */
  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addRow(kind, text) {
    var row = el("div", "fbc-row fbc-" + kind);
    var bubble = el("div", "fbc-bubble");
    bubble.textContent = text;          // textContent prevents XSS from model output
    row.appendChild(bubble);
    log.appendChild(row);
    scrollDown();
    return row;
  }

  function addTyping() {
    var row = addRow("bot", "");
    var bubble = row.querySelector(".fbc-bubble");
    var dots = el("span", "fbc-dots");
    dots.appendChild(document.createElement("i"));
    dots.appendChild(document.createElement("i"));
    dots.appendChild(document.createElement("i"));
    bubble.appendChild(dots);
    return row;
  }

  function greet() {
    addRow("bot", "Hi! I can help with registering, posting, editing your account, and anything else on this site.");
  }

  /* ---------- Network ---------- */
  async function postJSON(url, body) {
    var res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
      credentials: "same-origin"
    });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      // A redirect to the login page (session expired) is not JSON, so data is empty.
      throw new Error(data.error || "Something went wrong. Try again.");
    }
    return data;
  }

  /* ---------- Actions ---------- */
  var busy = false;

  async function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    busy = true;
    sendBtn.disabled = true;
    addRow("user", text);
    input.value = "";
    autoGrow();
    var typing = addTyping();
    try {
      var data = await postJSON("/chat/message", { message: text });
      typing.remove();
      addRow("bot", data.reply);
    } catch (e) {
      typing.remove();
      addRow("err", e.message);
    } finally {
      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  async function resetChat() {
    if (busy) return;
    try { await postJSON("/chat/reset"); } catch (e) { /* clear the UI anyway */ }
    log.innerHTML = "";
    greet();
    input.focus();
  }

  function autoGrow() {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 110) + "px";
  }

  function setOpen(open) {
    panel.classList.toggle("fbc-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close chat helper" : "Open chat helper");
    if (open) input.focus();
  }

  /* ---------- Events ---------- */
  toggle.addEventListener("click", function () {
    setOpen(!panel.classList.contains("fbc-open"));
  });
  sendBtn.addEventListener("click", send);
  resetBtn.addEventListener("click", resetChat);
  input.addEventListener("input", autoGrow);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("fbc-open")) setOpen(false);
  });

  greet();
})();

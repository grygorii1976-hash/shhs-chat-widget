(() => {
 const API_URL = "https://shhs-chat-backend.onrender.com/chat"; // потом заменим на прод-URL

  // UI
  const btn = document.createElement("button");
  btn.innerText = "Chat";
  btn.style.cssText =
    "position:fixed;right:20px;bottom:20px;z-index:999999;padding:12px 16px;border-radius:999px;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.2);";

  const box = document.createElement("div");
  box.style.cssText =
    "position:fixed;right:20px;bottom:80px;z-index:999999;width:340px;max-width:90vw;height:420px;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.2);display:none;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;";

  box.innerHTML = `
    <div style="padding:12px 14px;font-weight:600;border-bottom:1px solid #eee;display:flex;justify-content:space-between;align-items:center;">
      <span>Skillful Hands Chat</span>
      <button id="shhsClose" style="border:none;background:transparent;font-size:18px;cursor:pointer;">✕</button>
    </div>
    <div id="shhsMsgs" style="padding:12px;height:310px;overflow:auto;background:#fafafa;"></div>
    <form id="shhsForm" style="display:flex;gap:8px;padding:10px;border-top:1px solid #eee;background:#fff;">
      <input id="shhsInput" placeholder="Type your message..." style="flex:1;padding:10px;border:1px solid #ddd;border-radius:10px;" />
      <button style="padding:10px 12px;border:none;border-radius:10px;cursor:pointer;">Send</button>
    </form>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(box);

  const msgs = box.querySelector("#shhsMsgs");
  const form = box.querySelector("#shhsForm");
  const input = box.querySelector("#shhsInput");
  const closeBtn = box.querySelector("#shhsClose");

  function addMsg(text, who) {
    const p = document.createElement("div");
    p.style.cssText =
      "margin:8px 0;display:flex;" + (who === "user" ? "justify-content:flex-end;" : "justify-content:flex-start;");
    const bubble = document.createElement("div");
    bubble.innerText = text;
    bubble.style.cssText =
      "max-width:80%;padding:10px 12px;border-radius:14px;white-space:pre-wrap;" +
      (who === "user"
        ? "background:#111;color:#fff;border-bottom-right-radius:4px;"
        : "background:#fff;color:#111;border:1px solid #eee;border-bottom-left-radius:4px;");
    p.appendChild(bubble);
    msgs.appendChild(p);
    msgs.scrollTop = msgs.scrollHeight;
  }

  let threadId = localStorage.getItem("shhs_thread_id") || null;

  async function send(text) {
    addMsg(text, "user");
    input.value = "";
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed");
      threadId = data.threadId || threadId;
      if (threadId) localStorage.setItem("shhs_thread_id", threadId);
      addMsg(data.reply || "(no reply)", "bot");
    } catch (e) {
      addMsg("Error: " + e.message, "bot");
    }
  }

  btn.onclick = () => (box.style.display = box.style.display === "none" ? "block" : "none");
  closeBtn.onclick = () => (box.style.display = "none");

  form.onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    send(text);
  };

  // стартовое сообщение
  addMsg("Hi! 👋 What can we help you with today?", "bot");
})();

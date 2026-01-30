// Wait for page to load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initChat);
} else {
  initChat();
}

function initChat() {
  const API_URL = "https://shhs-chat-backend.onrender.com/chat";
  
  // Generate unique session ID for this user
  let sessionId = localStorage.getItem('shhs_chat_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('shhs_chat_session', sessionId);
  }
  
  // Create chat button
  const btn = document.createElement("button");
  btn.innerText = "💬 Chat";
  btn.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:999999;padding:12px 20px;background:#6366f1;color:#fff;border:none;border-radius:50px;font-size:16px;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);font-weight:600;transition:transform 0.2s;";
  
  btn.onmouseenter = () => btn.style.transform = "scale(1.05)";
  btn.onmouseleave = () => btn.style.transform = "scale(1)";
  
  // Create chat window
  const box = document.createElement("div");
  box.style.cssText = "position:fixed;right:20px;bottom:80px;z-index:999999;width:380px;max-width:calc(100vw - 40px);height:500px;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,0.15);display:none;flex-direction:column;";
  
  box.innerHTML = `
    <div style="padding:16px;background:#6366f1;color:#fff;border-radius:16px 16px 0 0;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-weight:600;font-size:16px;">Skillful Hands</div>
        <div style="font-size:12px;opacity:0.9;">Usually replies instantly</div>
      </div>
      <button id="shhsClose" style="border:none;background:transparent;color:#fff;font-size:24px;cursor:pointer;padding:0;width:28px;height:28px;">×</button>
    </div>
    <div id="shhsMsgs" style="padding:16px;flex:1;overflow:auto;background:#f9fafb;"></div>
    <form id="shhsForm" style="display:flex;gap:8px;padding:12px;border-top:1px solid #e5e7eb;background:#fff;">
      <input id="shhsInput" placeholder="Type your message..." style="flex:1;padding:10px 14px;border:1px solid #e5e7eb;border-radius:20px;outline:none;font-size:14px;" />
      <button type="submit" style="padding:10px 16px;border:none;border-radius:20px;background:#6366f1;color:#fff;cursor:pointer;font-weight:600;transition:opacity 0.2s;">Send</button>
    </form>
  `;
  
  document.body.appendChild(btn);
  document.body.appendChild(box);
  
  const msgs = box.querySelector("#shhsMsgs");
  const form = box.querySelector("#shhsForm");
  const input = box.querySelector("#shhsInput");
  const closeBtn = box.querySelector("#shhsClose");
  const sendBtn = form.querySelector("button[type='submit']");
  
  function addMsg(text, who) {
    const p = document.createElement("div");
    p.style.cssText = "margin:12px 0;display:flex;" + (who === "user" ? "justify-content:flex-end;" : "");
    
    const bubble = document.createElement("div");
    bubble.innerText = text;
    bubble.style.cssText = "max-width:75%;padding:10px 14px;border-radius:16px;font-size:14px;line-height:1.5;white-space:pre-wrap;" + 
      (who === "user" 
        ? "background:#6366f1;color:#fff;border-bottom-right-radius:4px;" 
        : "background:#fff;color:#111;border:1px solid #e5e7eb;border-bottom-left-radius:4px;");
    
    p.appendChild(bubble);
    msgs.appendChild(p);
    msgs.scrollTop = msgs.scrollHeight;
  }
  
  async function send(text) {
    addMsg(text, "user");
    input.value = "";
    input.disabled = true;
    sendBtn.disabled = true;
    sendBtn.style.opacity = "0.5";
    
    // Add typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing";
    typingDiv.style.cssText = "margin:12px 0;";
    typingDiv.innerHTML = '<div style="padding:10px 14px;background:#fff;border:1px solid #e5e7eb;border-radius:16px;display:inline-block;"><span style="animation:pulse 1.5s infinite;">●●●</span></div>';
    msgs.appendChild(typingDiv);
    msgs.scrollTop = msgs.scrollHeight;
    
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text,
          sessionId: sessionId
        }),
      });
      
      const data = await res.json();
      
      // Remove typing indicator
      const typing = document.getElementById("typing");
      if (typing) typing.remove();
      
      if (!res.ok) throw new Error(data.error || "Request failed");
      
      // Update session ID if provided
      if (data.sessionId) {
        sessionId = data.sessionId;
        localStorage.setItem('shhs_chat_session', sessionId);
      }
      
      addMsg(data.reply || "Sorry, I didn't get that.", "bot");
    } catch (e) {
      const typing = document.getElementById("typing");
      if (typing) typing.remove();
      addMsg("Sorry, I'm having trouble right now. Please try again or call us directly.", "bot");
      console.error("Chat error:", e);
    } finally {
      input.disabled = false;
      sendBtn.disabled = false;
      sendBtn.style.opacity = "1";
      input.focus();
    }
  }
  
  btn.onclick = () => {
    const isHidden = box.style.display === "none";
    box.style.display = isHidden ? "flex" : "none";
    if (isHidden && msgs.children.length === 0) {
      addMsg("Hi! 👋 I'm here to help you with any handyman services. What can we help you with today?", "bot");
    }
    if (isHidden) {
      input.focus();
    }
  };
  
  closeBtn.onclick = () => (box.style.display = "none");
  
  form.onsubmit = (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    send(text);
  };
}
```

---

## 🚀 Деплой обновлений

### 1. Обновляем backend (через GitHub Desktop):

1. Откройте **GitHub Desktop**
2. Выберите репозиторий **SHHS-chat-backend**
3. Слева увидите изменённый файл `server.js`
4. Внизу слева введите:
   - Summary: `Add conversation memory`
5. **Commit to main**
6. **Push origin** (кнопка вверху)

Render автоматически подхватит изменения и передеплоит (2-3 минуты).

### 2. Обновляем frontend (на GitHub):

1. Откройте https://github.com/grygorii1976-hash/shhs-chat-widget
2. Файл `widget.js` → Edit
3. Замените код
4. **Commit changes**

---

## 🧪 Тест (через 3 минуты)

1. Откройте сайт
2. Жёсткое обновление: `Cmd + Shift + R`
3. Откройте чат
4. Протестируйте диалог:
```
Вы: Hi, I need help with plumbing
AI: [спросит что именно]
Вы: Fix a leaky faucet
AI: [спросит где вы находитесь]
Вы: Orlando, 32801
AI: [НЕ должен спрашивать снова про услугу! Должен спросить имя или телефон]

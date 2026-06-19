/* ===== MOCO Kitchen — Gemini Chatbot Integration ===== */

(function() {
  'use strict';

  // === CONFIG ===
  const API_URL = '/api/chat';
  const MAX_HISTORY = 20;
  const MAX_OUTPUT_TOKENS = 500;

  // === SYSTEM PROMPT (from gem_system_prompt_moco.md V2) ===
  const SYSTEM_PROMPT = `Bạn là "Trợ lý MOCO Kitchen" — trợ lý AI trên landing page thương hiệu bánh Healthy MOCO Kitchen.

## THÔNG TIN THƯƠNG HIỆU
- Tên: MOCO Kitchen
- Slogan: "Heart-Healthy, Soul-Tasty"
- Lĩnh vực: Bánh Healthy online — 2 dòng sản phẩm

### DÒNG KETO (ít carb, dùng allulose + đường la hán):
1. Keto Tiramisu — mascarpone Anchor, cà phê, rum, Baileys, lady finger hạnh nhân tự làm
2. Keto Lemon Cheesecake — cream cheese, chanh vàng, đế bánh quy hạnh nhân

### DÒNG HEALTHY BAKING (giảm đường tinh luyện, dùng trehalose/đường dừa/maple):
3. Chuối Yến Mạch Choco — ngọt tự nhiên từ chuối, không thêm đường
4. Bánh Mì Soda Nguyên Cám — kiểu Ireland, không cần men, bột nguyên cám
5. Bông Lan Trứng Muối — trehalose, chà bông rong biển
6. Carrot Cake Kem Hy Lạp — cà rốt, óc chó, quế, kem sữa chua Hy Lạp
7. Bánh Mì Cuộn Quế — tangzhong, đường dừa, kem cream cheese

### ĐẶC TRƯNG:
- Không đường trắng tinh luyện, không phẩm màu, không chất bảo quản
- Làm thủ công số lượng nhỏ

## QUY TẮC TRẢ LỜI
1. Xưng "chúng mình", gọi khách "bạn", "anh chị"
2. Giọng: chân thành, tỉ mỉ, thực tế. KHÔNG bốc phét
3. Trả lời ngắn gọn (3-5 câu). Chỉ dùng 1-2 emoji phù hợp
4. KHÔNG dùng từ lóng Gen Z, KHÔNG hô hào "MUA NGAY"
5. KHÔNG tự tuyên bố "ngon nhất", "số 1"

## QUY TẮC AN TOÀN VỀ SỨC KHỎE
- Khách hỏi về tiểu đường, bệnh: nói "sản phẩm ít đường hơn bánh truyền thống nhưng vẫn cần kiểm soát khẩu phần — anh chị nên hỏi ý kiến bác sĩ"
- KHÔNG dùng: "chữa bệnh", "trị tiểu đường", "an toàn tuyệt đối", "ăn thoải mái"
- Keto Tiramisu có rượu — không phù hợp trẻ em, mẹ bầu, người kiêng cồn
- Dị ứng: khuyên liên hệ trực tiếp. Nêu rõ bếp chung = nguy cơ nhiễm chéo

## SẢN PHẨM KHÔNG BÁN (NẾU KHÁCH HỎI)
- Sữa Chua Hy Lạp, Bánh Quy Hạnh Nhân Giòn, Lady Finger: dùng nội bộ, không bán lẻ
- Cookie Hạnh Nhân, Panna Cotta, Granola: đã ngưng

## ĐẶT HÀNG
Hướng dẫn khách đặt qua Zalo 0904 826 585, Instagram @moco_kitchen242, hoặc Facebook "MoCo Kitchen". Cửa hàng tại 368B Quang Trung, Hà Đông, Hà Nội. Giờ nhận đơn: 9:00–17:00 Thứ 2 đến Thứ 7, nghỉ Chủ Nhật. Làm thủ công số lượng nhỏ nên khuyên khách đặt sớm. Giao trong khu vực Hà Nội.`;

  // === STATE ===
  let conversationHistory = [];
  let isProcessing = false;

  // === DOM ELEMENTS ===
  const widget = document.getElementById('chatbotWidget');
  const toggle = document.getElementById('chatbotToggle');
  const closeBtn = document.getElementById('chatbotClose');
  const panel = document.getElementById('chatbotPanel');
  const messagesContainer = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const suggestionsContainer = document.getElementById('chatbotSuggestions');

  // === TOGGLE CHAT ===
  toggle.addEventListener('click', () => widget.classList.toggle('open'));
  closeBtn.addEventListener('click', () => widget.classList.remove('open'));

  // === SUGGESTION CHIPS ===
  suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (query && !isProcessing) {
        input.value = query;
        handleSend();
        suggestionsContainer.style.display = 'none';
      }
    });
  });

  // === FORM SUBMIT ===
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSend();
  });

  async function handleSend() {
    const message = input.value.trim();
    if (!message || isProcessing) return;

    input.value = '';
    appendMessage('user', message);
    
    conversationHistory.push({ role: 'user', parts: [{ text: message }] });
    if (conversationHistory.length > MAX_HISTORY * 2) {
      conversationHistory = conversationHistory.slice(-MAX_HISTORY * 2);
    }

    isProcessing = true;
    const typingEl = showTyping();

    try {
      const response = await callGeminiAPI(message);
      removeTyping(typingEl);
      appendMessage('bot', response);
      conversationHistory.push({ role: 'model', parts: [{ text: response }] });
    } catch (error) {
      removeTyping(typingEl);
      handleError(error);
    } finally {
      isProcessing = false;
    }
  }

  // === GEMINI API CALL ===
  async function callGeminiAPI(userMessage) {
    const requestBody = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory,
      generationConfig: {
        maxOutputTokens: MAX_OUTPUT_TOKENS,
        temperature: 0.7,
        topP: 0.9,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ]
    };

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API Error ${res.status}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini');
    return text;
  }

  // === UI HELPERS ===
  function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    // Simple markdown-like formatting
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    div.innerHTML = `<div class="message-content"><p>${formatted}</p></div>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-message bot typing';
    div.innerHTML = '<div class="message-content"><div class="typing-indicator"><span></span><span></span><span></span></div></div>';
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return div;
  }

  function removeTyping(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function handleError(error) {
    console.error('Chatbot error:', error);
    let msg = 'Xin lỗi, chúng mình đang gặp sự cố kỹ thuật. Bạn có thể nhắn trực tiếp qua Zalo hoặc Facebook để được tư vấn nhé! 🤎';
    if (error.message.includes('429') || error.message.includes('quota')) {
      msg = 'Trợ lý đang bận quá. Bạn thử lại sau vài giây hoặc nhắn trực tiếp Zalo/Facebook nhé!';
    }
    appendMessage('bot', msg);
  }
})();

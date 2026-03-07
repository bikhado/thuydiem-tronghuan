document.addEventListener('DOMContentLoaded', () => {
    // === CẤU HÌNH GOOGLE SHEET ===
    // Dán đường link Web App của Google Apps Script bạn vừa tạo vào giữa hai dấu nháy kép dưới đây:
    const GOOGLE_APP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUj5y_0U8_vTb22ru-C5_Vr1-SiK6tmrBNNovpcnk23cDq-0g7P6lQ3v2i-DoRZW6eMg/exec";

    // 1. Inject CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .interactive-container {
            position: fixed;
            bottom: 20px;
            right: 0;
            left: 0;
            margin: auto;
            max-width: 480px;
            pointer-events: none;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-end;
            padding: 0 16px;
            font-family: Arial, sans-serif;
            opacity: 0;
            transition: opacity 1s ease-in-out;
        }
        .interactive-container.show {
            opacity: 1;
        }
        .wishes-stream {
            width: 100%;
            height: 220px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            align-items: flex-start;
            gap: 10px;
            margin-bottom: 20px;
            pointer-events: none;
            mask-image: linear-gradient(to top, black 60%, transparent 100%);
            -webkit-mask-image: linear-gradient(to top, black 60%, transparent 100%);
        }
        .wish-pill {
            background-color: rgba(223, 158, 158, 0.85); /* Slightly darker/pinkish transparent */
            backdrop-filter: blur(4px);
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            display: inline-block;
            max-width: 85%;
            word-wrap: break-word;
            animation: slideInUp 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            line-height: 1.4;
        }
        .wish-pill span.name {
            font-weight: 800;   
        }
        .actions-bar {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            pointer-events: auto; /* Allow clicking buttons */
        }
        .action-btn {
            background-color: rgba(0,0,0,0.25);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 20px;
            color: white;
            padding: 8px 16px;
            font-family: Arial, sans-serif;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: background-color 0.2s, transform 0.1s;
        }
        .action-btn:active {
            transform: scale(0.95);
        }
        .action-round-btn {
            background-color: rgba(0,0,0,0.25);
            backdrop-filter: blur(4px);
            border: 1px solid rgba(255,255,255,0.2);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            font-size: 20px;
            transition: transform 0.1s;
        }
        .action-round-btn:active {
            transform: scale(0.9);
        }
        .badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #ff4d6d;
            color: white;
            font-size: 11px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 12px;
            pointer-events: none;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .floating-heart {
            position: fixed;
            font-size: 24px;
            pointer-events: none;
            animation: floatUp 2s ease-in forwards;
            z-index: 1001;
            opacity: 1;
            text-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        /* Modals */
        .wish-modal-overlay {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(5px);
            z-index: 2000;
            display: none;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .wish-modal-overlay.show {
            display: flex;
            opacity: 1;
        }
        .wish-modal {
            background: #fff;
            padding: 24px;
            border-radius: 20px;
            width: 90%;
            max-width: 360px;
            font-family: Arial, sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .wish-modal-overlay.show .wish-modal {
            transform: translateY(0);
        }
        .wish-modal h3 {
            margin-top: 0;
            color: #baa58a;
            text-align: center;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .wish-modal input, .wish-modal textarea {
            width: 100%;
            padding: 12px;
            margin-bottom: 12px;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-family: inherit;
            box-sizing: border-box;
            background: #f9f9f9;
            outline: none;
        }
        .wish-modal input:focus, .wish-modal textarea:focus {
            border-color: #baa58a;
            background: #fff;
        }
        .wish-modal textarea {
            resize: none;
            height: 90px;
        }
        .wish-modal .btn-row {
            display: flex;
            gap: 12px;
            margin-top: 8px;
        }
        .wish-modal button {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: bold;
            font-size: 15px;
            transition: opacity 0.2s;
        }
        .wish-modal button:active { opacity: 0.8; }
        .btn-cancel { background: #f0f0f0; color: #555; }
        .btn-send { background: #baa58a; color: #fff; }

        @keyframes slideInUp {
            from { transform: translateY(20px) scale(0.95); opacity: 0; }
            to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes floatUp {
            0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 1; margin-left: 0; }
            50% { opacity: 1; margin-left: 20px; }
            100% { transform: translateY(-400px) scale(1.5) rotate(30deg); opacity: 0; margin-left: -20px; }
        }
        @keyframes popHeart {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .gift-tooltip {
            position: absolute;
            bottom: 56px;
            right: -5px;
            background: #ff4d6d;
            color: white;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            animation: bounceTooltip 1.5s infinite;
            pointer-events: none;
        }
        .gift-tooltip::after {
            content: '';
            position: absolute;
            bottom: -5px;
            right: 15px;
            border-width: 6px 6px 0;
            border-style: solid;
            border-color: #ff4d6d transparent transparent transparent;
        }
        @keyframes bounceTooltip {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
        }
    `;
    document.head.appendChild(style);

    // 2. Inject HTML Container
    const container = document.createElement('div');
    container.className = 'interactive-container';

    // Stream
    const stream = document.createElement('div');
    stream.className = 'wishes-stream';

    // Actions Bar
    const actionsBar = document.createElement('div');
    actionsBar.className = 'actions-bar';

    const btnWish = document.createElement('button');
    btnWish.className = 'action-btn';
    btnWish.style.flex = "1";
    btnWish.style.justifyContent = 'flex-start';
    btnWish.style.color = 'rgba(255,255,255,0.8)';
    btnWish.innerHTML = 'Gửi lời chúc... 💬';

    const btnHeartText = document.createElement('button');
    btnHeartText.className = 'action-btn';
    btnHeartText.innerHTML = 'Bắn tim 🐾';

    const btnGift = document.createElement('button');
    btnGift.className = 'action-round-btn';
    btnGift.innerHTML = '🎁<div class="gift-tooltip">Ting ting 👇</div>';

    const btnLike = document.createElement('button');
    btnLike.className = 'action-round-btn';
    const likeBadge = document.createElement('div');
    likeBadge.className = 'badge';
    likeBadge.innerText = '0';
    btnLike.innerHTML = '👍';
    btnLike.appendChild(likeBadge);

    actionsBar.appendChild(btnWish);
    actionsBar.appendChild(btnHeartText);
    actionsBar.appendChild(btnGift);
    actionsBar.appendChild(btnLike);

    container.appendChild(stream);
    container.appendChild(actionsBar);

    document.body.appendChild(container);

    // Modal Wish
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'wish-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="wish-modal">
            <h3>Gửi lời chúc hạnh phúc</h3>
            <input type="text" id="wish-name" placeholder="Tên của bạn">
            <textarea id="wish-text" placeholder="Những lời chức tốt đẹp nhất gửi đến cô dâu, chú rể..."></textarea>
            <div class="btn-row">
                <button class="btn-cancel" id="btn-cancel-wish">Hủy</button>
                <button class="btn-send" id="btn-send-wish">Gửi lời chúc</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    // Gift Modal
    const giftModalOverlay = document.createElement('div');
    giftModalOverlay.className = 'wish-modal-overlay';
    giftModalOverlay.innerHTML = `
        <div class="wish-modal" style="text-align:center">
            <h3>Gửi Quà Tặng</h3>
            <p style="color:#5d4b46; font-size:14px; margin-bottom:15px; line-height:1.5;">Cô dâu - Chú rể xin chân thành cảm ơn những tình cảm, món quà và lời chúc từ phía mọi người!</p>
            <div style="background:#fcfbfc; padding:20px; border-radius:12px; margin-bottom:20px; border: 1px solid #e8e0d5;">
                <img src="images/ngan-hang.png" alt="QR Code Ngân Hàng" style="width:100%; max-width:260px; margin-bottom:15px; border-radius:8px;">
                <p style="margin:5px 0"><strong>Ngân hàng:</strong> VietinBank</p>
                <p style="margin:5px 0; font-size:22px; color:#baa58a">STK: <strong>100872738649</strong></p>
                <p style="margin:5px 0"><strong>Tên:</strong> PHẠM THỊ THUÝ DIỄM</p>
            </div>
            <button class="btn-cancel" style="width:100%" id="btn-close-gift">Đóng</button>
        </div>
    `;
    document.body.appendChild(giftModalOverlay);

    // 3. Logic & State
    let wishesList = [];
    let currentIdx = 0;

    // Modal events
    const closeModal = (overlay) => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.style.display = 'none', 300);
    };

    btnWish.onclick = () => {
        modalOverlay.style.display = 'flex';
        setTimeout(() => modalOverlay.classList.add('show'), 10);
    };

    document.getElementById('btn-cancel-wish').onclick = () => closeModal(modalOverlay);

    document.getElementById('btn-send-wish').onclick = () => {
        const name = document.getElementById('wish-name').value.trim() || 'Khách';
        const txt = document.getElementById('wish-text').value.trim();
        if (txt === '') return;

        const newWish = { name: name, message: txt, icon: '💌', type: 'wish' };
        wishesList.unshift(newWish);
        currentIdx = 0; // reset index to show new wish next
        displayWish(newWish);

        // Save locally first
        let localWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
        localWishes.unshift(newWish);
        localStorage.setItem('wedding_wishes', JSON.stringify(localWishes));

        // Save to Google Sheet if setup
        if (GOOGLE_APP_SCRIPT_URL && GOOGLE_APP_SCRIPT_URL !== "") {
            fetch(GOOGLE_APP_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(newWish)
            }).catch(console.error);
        }

        closeModal(modalOverlay);
        document.getElementById('wish-text').value = '';
    };

    // RSVP Logic Handle
    const rsvpForm = document.getElementById('rsvp-submit-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = rsvpForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = 'Đang gửi...';
            submitBtn.disabled = true;

            const name = rsvpForm.querySelector('input[name="rsvp-name"]').value;
            const attendance = rsvpForm.querySelector('input[name="rsvp-attendance"]:checked').value === 'yes' ? 'Có tham dự' : 'Không thể tham dự';
            const count = rsvpForm.querySelector('#rsvp-attendee-count').value;

            const rsvpData = {
                type: 'rsvp',
                name: name,
                attendance: attendance,
                count: attendance.includes('Không') ? '0' : count
            };

            if (GOOGLE_APP_SCRIPT_URL && GOOGLE_APP_SCRIPT_URL !== "") {
                fetch(GOOGLE_APP_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(rsvpData)
                }).then(() => {
                    alert('Cảm ơn bạn! Thông tin xác nhận đã được gửi thành công.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }).catch(err => {
                    alert('Đã gửi thông tin dự phòng cục bộ thành công! (Lỗi gửi sheet)');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
            } else {
                alert('Khách đã xác nhận tham dự thành công (Lưu tạm bộ nhớ)! Vui lòng điền link Google Sheet để lưu online.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    btnGift.onclick = () => {
        giftModalOverlay.style.display = 'flex';
        setTimeout(() => giftModalOverlay.classList.add('show'), 10);
    };
    document.getElementById('btn-close-gift').onclick = () => closeModal(giftModalOverlay);

    // Shoot Heart Logic
    const shootHeart = (x, y) => {
        const h = document.createElement('div');
        h.className = 'floating-heart';
        const emotes = ['❤️', '💖', '✨', '💕', '🥰', '🐾', '🥂'];
        h.innerText = emotes[Math.floor(Math.random() * emotes.length)];
        h.style.left = (x - 10 + Math.random() * 20) + 'px';
        h.style.bottom = y + 'px';
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 2000);
    };

    btnHeartText.onclick = (e) => {
        const rect = btnHeartText.getBoundingClientRect();
        for (let i = 0; i < 3; i++) {
            setTimeout(() => shootHeart(rect.left + rect.width / 2, window.innerHeight - rect.top), i * 150);
        }
    };

    btnLike.onclick = (e) => {
        const rect = btnLike.getBoundingClientRect();
        shootHeart(rect.left + rect.width / 2, window.innerHeight - rect.top);

        btnLike.style.animation = 'none';
        void btnLike.offsetWidth; // trigger reflow
        btnLike.style.animation = 'popHeart 0.3s ease';

        // Update badge
        let likes = parseInt(localStorage.getItem('wedding_likes') || likeBadge.innerText);
        likes++;
        localStorage.setItem('wedding_likes', likes);
        likeBadge.innerText = likes;
    };

    // Auto display wish function
    function displayWish(wish) {
        const el = document.createElement('div');
        el.className = 'wish-pill';
        el.innerHTML = `<span class="name">${wish.name}:</span> ${wish.icon} ${wish.message}`;
        stream.appendChild(el);

        // Limit stream children to 3 to prevent overcrowding
        if (stream.childElementCount > 3) {
            const first = stream.firstElementChild;
            first.style.transition = 'opacity 0.3s, transform 0.3s';
            first.style.opacity = '0';
            first.style.transform = 'translateY(-10px)';
            setTimeout(() => { if (first.parentNode) first.remove(); }, 300);
        }
    }

    // Fetch Data from Google Sheet
    try {
        let localWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');

        let initialLikes = parseInt(localStorage.getItem('wedding_likes')) || 154;
        likeBadge.innerText = initialLikes;

        const startStream = (wishes) => {
            wishesList = wishes.length > 0 ? wishes : localWishes;
            if (wishesList.length > 0) {
                displayWish(wishesList[currentIdx]);
                currentIdx = (currentIdx + 1) % wishesList.length;

                setInterval(() => {
                    if (wishesList.length > 0 && Math.random() > 0.3) {
                        displayWish(wishesList[currentIdx]);
                        currentIdx = (currentIdx + 1) % wishesList.length;
                    }
                }, 3500);
            }
        };

        if (GOOGLE_APP_SCRIPT_URL && GOOGLE_APP_SCRIPT_URL !== "") {
            fetch(GOOGLE_APP_SCRIPT_URL)
                .then(res => res.json())
                .then(data => {
                    startStream(data.wishes || []);
                })
                .catch(err => {
                    console.error('Lỗi khi tải từ Google Sheet: ', err);
                    startStream(localWishes);
                });
        } else {
            startStream(localWishes);
        }

    } catch (err) {
        console.error('Lỗi khi xử lý dữ liệu: ', err);
    }

    // === COUNTDOWN LOGIC ===
    const cdContainer = document.getElementById('wedding-countdown-timer');
    if (cdContainer) {
        // Target Date: March 22, 2026 at 10:00:00 AM 
        // Note: Months in JS Date are 0-indexed (0 = Jan, 2 = Mar)
        const weddingDate = new Date(2026, 2, 22, 10, 0, 0).getTime();

        const elDays = document.getElementById('cd-days');
        const elHours = document.getElementById('cd-hours');
        const elMins = document.getElementById('cd-minutes');
        const elSecs = document.getElementById('cd-seconds');

        const updateTimer = setInterval(() => {
            const now = new Date().getTime();
            const distance = weddingDate - now;

            if (distance < 0) {
                clearInterval(updateTimer);
                if (elDays) elDays.innerText = "0";
                if (elHours) elHours.innerText = "0";
                if (elMins) elMins.innerText = "0";
                if (elSecs) elSecs.innerText = "0";
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            if (elDays) elDays.innerText = days;
            if (elHours) elHours.innerText = hours;
            if (elMins) elMins.innerText = minutes;
            if (elSecs) elSecs.innerText = seconds;
        }, 1000);
    }

    // Reveal UI logic
    const showInteractiveUI = () => {
        container.classList.add('show');
    };

    // We only want to show the container once the user has somewhat interacted or the envelope is opened
    // A simple approach is scrolling down a bit (since envelope opens and page scrolls)
    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            showInteractiveUI();
        }
    }, { passive: true });

    // Fallback timer
    setTimeout(showInteractiveUI, 5000);
});

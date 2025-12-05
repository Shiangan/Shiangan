// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V3.1
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (不變)
    // ===========================================
    document.addEventListener('copy', function() {
        console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
    });

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const NAV_ACTIVE_CLASS = 'active'; 

    if (mobileMenuBtn && mainNav) {
        
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            const isActive = mainNav.classList.contains(NAV_ACTIVE_CLASS);
            
            // 切換按鈕圖標和文字
            this.innerHTML = isActive 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
            this.setAttribute('aria-expanded', isActive);
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // 確保只在選單展開時執行關閉動作
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    // 使用 setTimeout 稍微延遲，確保點擊連結的預設行為先執行
                    setTimeout(() => {
                        mainNav.classList.remove(NAV_ACTIVE_CLASS);
                        mobileMenuBtn.innerHTML = initialBtnHtml; 
                        mobileMenuBtn.setAttribute('aria-expanded', false);
                    }, 50); 
                }
            });
        });
    }

    // 頁面導航高亮邏輯
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // 確保首頁也能取得名稱
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        
        // 移除所有 active 狀態
        item.classList.remove(NAV_ACTIVE_CLASS); 

        if (itemHref === currentPath) {
             item.classList.add(NAV_ACTIVE_CLASS);
        } else if (currentPath === 'index.html' && itemHref === currentPath) {
             item.classList.add(NAV_ACTIVE_CLASS);
        }
        // 注意：對於多頁面網站，這裡只需檢查 href 是否與當前頁面名稱匹配即可。
    });


    // ===========================================
    // 區塊 3: 喪禮花禮訂購表單互動邏輯 (UX/驗證優化)
    // ===========================================

    const orderForm = document.querySelector('.order-form');
    // 確保所有表單元素 ID 都能正確獲取 (假設這些 ID 在 order.html 裡)
    const funeralHallSelect = document.getElementById('funeral-hall-select');
    const hallDateInput = document.getElementById('hall-date-input');
    const hallSelect = document.getElementById('hall-select');
    const deceasedNameInput = document.getElementById('deceased-name-input');
    const officialQueryButton = document.getElementById('official-query-btn');
    
    // --- 模擬殯儀館檔期資料庫 ---
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [{ hall: '至真二廳', deceased: '李府老夫人 李○○' }, { hall: '至善二廳', deceased: '張公大人 張○○' }],
            '2025-12-11': [{ hall: '至真二廳', deceased: '王公大人 王○○' }, { hall: '至善一廳', deceased: '林公大人 林○○' }],
            '2025-12-12': []
        },
        '台北市立第一殯儀館': { 
            '2025-12-10': [{ hall: '景行廳', deceased: '陳府老夫人 陳○○' }]
        },
        '新北市立板橋殯儀館': {
            '2025-12-11': [{ hall: '追遠廳', deceased: '周公大人 周○○' }]
        }
    };
    // -----------------------------------------------
    
    // 只有在表單元素存在時才執行邏輯
    if (orderForm && funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput) {
        
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
            // 初始狀態隱藏非二殯按鈕
            officialQueryButton.style.display = 'none'; 
        }
        
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            const isTaipei2 = (this.value === '台北市立第二殯儀館');
            if (officialQueryButton) {
                officialQueryButton.style.display = isTaipei2 ? 'block' : 'none';
            }
            hallDateInput.disabled = (this.value === ''); 
        });

        hallDateInput.addEventListener('change', function() {
            if (!this.value || !funeralHallSelect.value) {
                hallSelect.innerHTML = '<option value="">-- 請先選擇殯儀館和日期 --</option>';
                return; 
            }
            
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
            }

            // 模擬 API 查詢延遲
            setTimeout(() => {
                updateHallOptions();
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                }
            }, 800);
        });
        
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') {
                    deceasedNameInput.focus(); // 手動輸入時讓逝者姓名欄位獲得焦點
                }
                return; 
            }
            
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
            
            if (selectedDeceased?.deceased) {
                // 自動帶入逝者名稱
                deceasedNameInput.value = selectedDeceased.deceased;
            } else {
                 deceasedNameInput.value = ''; 
            }
        });

        function updateHallOptions() {
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            hallSelect.innerHTML = ''; 
            deceasedNameInput.value = '';

            const dateSchedule = mockScheduleDB[selectedHallName]?.[selectedDate];

            let options = '<option value="">-- 請選擇或手動輸入禮廳 --</option>';
            
            if (dateSchedule && dateSchedule.length > 0) {
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            } else if (selectedHallName && selectedDate) {
                 // 當日期有選，但沒有排程時
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 deceasedNameInput.focus();
                 return; 
            } else {
                 options = '<option value="">-- 請先選擇日期 --</option>';
            }
            
            hallSelect.innerHTML = options;
        }
        
        // 官方查詢按鈕點擊事件 (用於二殯官方連結)
        if (officialQueryButton) {
            officialQueryButton.addEventListener('click', function(e) {
                e.preventDefault();
                const externalUrl = this.getAttribute('href'); 
                if (externalUrl) {
                    window.open(externalUrl, '_blank');
                }
            });
        }
        
        // 核心邏輯：將表單數據編碼至 LINE 訊息
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const senderName = document.getElementById('sender-name')?.value.trim();
            const senderPhone = document.getElementById('sender-phone')?.value.trim();
            const hallValue = funeralHallSelect.value.trim();
            const dateValue = hallDateInput.value.trim();
            const deceasedValue = deceasedNameInput.value.trim();
            const product = document.getElementById('product-select')?.value.trim() || '未選擇花禮/罐頭塔';
            const remark = document.getElementById('remark')?.value.trim() || '無';


            if (!hallValue || !dateValue || !deceasedValue || !senderName || !senderPhone) {
                alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                return;
            }
            
            const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
            
            if (confirmed) {
                
                // 1. 建立預設訊息文本
                const lineMessage = `【網站花禮訂單】\n` + 
                                    `* 訂購人姓名：${senderName}\n` +
                                    `* 訂購人電話：${senderPhone}\n` +
                                    `* 訂購產品：${product}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 殯儀館：${hallValue}\n` +
                                    `* 告別式日期：${dateValue}\n` +
                                    `* 逝者姓名：${deceasedValue}\n` +
                                    `* 備註：${remark}`;
                
                // 2. 獲取 LINE 連結
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                let lineLink = lineLinkElement?.getAttribute('href'); 
                
                // 3. 編碼訊息並附加到 LINE 連結
                const encodedMessage = encodeURIComponent(lineMessage);
                
                if (lineLink && lineLink.includes('line.me/ti/p')) {
                     // 替換 lineLink 中的 '?' 以確保 text 參數能正確附加
                     // 假設原始連結是 line.me/ti/p/[ID]?utm_source=...
                     // 我們要將它變成 line.me/ti/p/[ID]?text=...&utm_source=...
                     lineLink = lineLink.replace('?', `?text=${encodedMessage}&`); 
                     
                     alert('訂單已暫存！即將引導至 LINE 專員，請將預設訊息發送給我們，以確認最終訂購細節與付款。');
                     window.location.href = lineLink;

                } else {
                     alert('LINE 連結未設置或格式不正確，請手動複製以下資訊並聯繫客服：\n\n' + lineMessage);
                }
            }
        });
    }
    
    // ===========================================
    // 區塊 4: 手風琴 (Accordion) 功能 (適用於任何頁面)
    // ===========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        const currentItem = header.parentElement;
        const content = header.nextElementSibling;
        
        // **優化 1: 確保初始狀態正確展開/收合**
        // 如果項目初始有 active 類別，則計算高度並展開
        if (currentItem.classList.contains(NAV_ACTIVE_CLASS)) {
             // 延遲執行，確保 DOM 內容已被渲染，scrollHeight 值正確
             setTimeout(() => {
                 content.style.maxHeight = content.scrollHeight + "px";
             }, 50); 
        } else {
             content.style.maxHeight = null;
        }
        
        // 點擊事件
        header.addEventListener('click', () => {
            
            // **優化 2: 關閉所有非當前項目的內容 (單一展開模式)**
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem && item.classList.contains(NAV_ACTIVE_CLASS)) {
                    item.classList.remove(NAV_ACTIVE_CLASS);
                    item.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // **優化 3: 切換當前項目的狀態**
            currentItem.classList.toggle(NAV_ACTIVE_CLASS);

            if (currentItem.classList.contains(NAV_ACTIVE_CLASS)) {
                // 展開內容：設定高度為內容的實際高度 (scrollHeight)
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // 收合內容：高度設為 null，觸發 CSS transition
                content.style.maxHeight = null;
            }
        });

        // 區塊 3: 喪禮花籃訂購表單處理 (Order Form Line Notify)
document.addEventListener('DOMContentLoaded', function() {
    const flowerOrderForm = document.getElementById('flowerOrderForm');

    if (flowerOrderForm && flowerOrderForm.getAttribute('action') === '#order-success') {
        flowerOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const form = e.target;
            const formElements = form.elements;
            const lineId = '您的LINE ID'; // !!! 請替換為您的實際 LINE ID !!!

            // 收集表單資料
            let formData = {};
            for (let i = 0; i < formElements.length; i++) {
                const element = formElements[i];
                // 排除按鈕和沒有 name 屬性的元素
                if (element.name && element.type !== 'submit') {
                    if (element.type === 'radio' && !element.checked) {
                        continue; // 跳過未選中的 radio
                    }
                    
                    // 排除未選擇的下拉式選單 (若有空值)
                    if (element.tagName === 'SELECT' && element.value === '') {
                        continue; 
                    }

                    // 使用 input 的 name 作為 key，value 作為值
                    let key = element.name; 
                    let value = element.value.trim();

                    // 處理 Radio Button: payment-method
                    if (element.type === 'radio' && element.name === 'payment-method') {
                        key = '支付方式';
                        value = element.value;
                    }
                    
                    // 將所有欄位加入 formData
                    formData[key] = value;
                }
            }
            
            // 確保所有必填欄位都有值（基本檢查）
            const requiredFields = ['產品選擇', '收件殯儀館/地點', '送達日期', '禮廳/廳室名稱', '致意對象姓名', '輓詞/卡片內容', '訂購人姓名/公司名稱', '訂購人聯絡電話', '支付方式'];
            for (const field of requiredFields) {
                if (!formData[field]) {
                    alert(`請填寫所有必填欄位：【${field}】`);
                    return;
                }
            }

            // === 構建 LINE 訊息內容 ===
            let message = `【網站花禮訂單通知】\n\n`;
            message += `==============================\n`;
            message += `🛒 訂單摘要\n`;
            message += `產品：${formData['產品選擇']}\n`;
            message += `金額：${formData['產品選擇'].match(/\$(\d+,?\d+)/)?.[0] || '未定'}\n`;
            message += `支付方式：${formData['支付方式']}\n`;
            message += `==============================\n`;
            message += `📍 禮廳資訊\n`;
            message += `收件地點：${formData['收件殯儀館/地點']}\n`;
            message += `送達日期：${formData['送達日期']}\n`;
            message += `廳室名稱：${formData['禮廳/廳室名稱']}\n`;
            message += `致意對象：${formData['致意對象姓名']}\n`;
            message += `------------------------------\n`;
            message += `💌 輓詞內容：\n`;
            message += `${formData['輓詞/卡片內容']}\n`;
            message += `------------------------------\n`;
            message += `👤 訂購人\n`;
            message += `姓名/公司：${formData['訂購人姓名/公司名稱']}\n`;
            message += `電話：${formData['訂購人聯絡電話']}\n`;

            // 將訊息編碼
            const lineMessage = encodeURIComponent(message);
            
            // 生成 LINE 連結
            const lineUrl = `https://line.me/ti/p/${lineId}?text=${lineMessage}`;

            // 跳轉到 LINE
            window.open(lineUrl, '_blank');
            
            // 提示用戶並清空表單
            alert('訂單細節已傳送！請務必前往 LINE 聯繫專員，確認訂單與付款事宜。');
            form.reset();
        });
    }
});

    });
});

/* =========================================== */
/* 網站核心互動腳本 (script.js) */
/* =========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ------------------------------------------
    // 1. 手機選單切換邏輯 (Mobile Menu Toggle)
    // ------------------------------------------
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.getElementById('main-nav');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true' || false;
            
            // 切換 CSS 類和 ARIA 屬性
            nav.classList.toggle('active');
            menuBtn.setAttribute('aria-expanded', !isExpanded);
            
            // 切換按鈕圖標
            const icon = menuBtn.querySelector('i');
            if (icon) {
                if (!isExpanded) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-times'); // 漢堡選單變 X 
                } else {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // ------------------------------------------
    // 2. 手風琴功能邏輯 (Accordion Logic) - 匹配 Services Page
    // ------------------------------------------
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // 找到對應的 accordion-item
            const item = header.closest('.accordion-item');
            // 找到內容區塊 (使用 data-content 標記)
            const content = item.querySelector('.accordion-content[data-content]');
            
            if (!item || !content) return;

            // 檢查當前狀態
            const isExpanded = header.getAttribute('aria-expanded') === 'true';

            if (isExpanded) {
                // 關閉
                item.classList.remove('active');
                header.setAttribute('aria-expanded', 'false');
                content.style.maxHeight = null; // 讓 CSS 的 max-height: 0 生效
                content.classList.remove('active');
            } else {
                // 關閉所有其他的 (實現單一展開)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    const activeHeader = activeItem.querySelector('.accordion-header');
                    const activeContent = activeItem.querySelector('.accordion-content[data-content]');

                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        activeHeader.setAttribute('aria-expanded', 'false');
                        activeContent.style.maxHeight = null;
                        activeContent.classList.remove('active');
                    }
                });

                // 展開當前
                item.classList.add('active');
                header.setAttribute('aria-expanded', 'true');
                // 設置 max-height 為內容的實際高度，觸發 CSS 過渡
                content.style.maxHeight = content.scrollHeight + 40 + "px"; // +40px 確保內容 padding 完整顯示
                content.classList.add('active');
            }
        });
    });

    // ------------------------------------------
    // 3. 確保浮動按鈕在頁面頂部被遮擋
    // ------------------------------------------
    // (此處不需要額外 JS，因為您已經使用 CSS Sticky Header 和 z-index 處理)
});


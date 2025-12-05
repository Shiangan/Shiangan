// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V3.1
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    const NAV_ACTIVE_CLASS = 'active'; 

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX)
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    
    if (mobileMenuBtn && mainNav) {
        
        // 儲存原始按鈕內容，用於收合時復原
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        
        // 1.1 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            const isActive = mainNav.classList.contains(NAV_ACTIVE_CLASS);
            
            // 切換按鈕圖標和文字 (使用 X 符號)
            this.innerHTML = isActive 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
            this.setAttribute('aria-expanded', isActive);
        });
        
        // 1.2 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    // 延遲關閉，確保點擊連結的預設跳轉行為先執行
                    setTimeout(() => {
                        mainNav.classList.remove(NAV_ACTIVE_CLASS);
                        mobileMenuBtn.innerHTML = initialBtnHtml; 
                        mobileMenuBtn.setAttribute('aria-expanded', false);
                    }, 50); 
                }
            });
        });
    }

    // 1.3 頁面導航高亮邏輯
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; 
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        
        item.classList.remove(NAV_ACTIVE_CLASS); // 確保移除舊的 active 狀態

        if (itemHref === currentPath) {
             item.classList.add(NAV_ACTIVE_CLASS);
        } else if (currentPath === '' && itemHref === 'index.html') {
             // 處理根路徑直接導向首頁的情況
             item.classList.add(NAV_ACTIVE_CLASS);
        }
    });


    // ===========================================
    // 區塊 2: 喪禮花禮訂購表單互動邏輯 (Order Form)
    // ===========================================

    const orderForm = document.querySelector('.order-form');
    // 獲取所有表單元素
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
    
    if (orderForm && funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput) {
        
        // 初始狀態設置
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
            officialQueryButton.style.display = (funeralHallSelect.value === '台北市立第二殯儀館') ? 'block' : 'none'; 
        }
        hallDateInput.disabled = (funeralHallSelect.value === ''); 

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
                    deceasedNameInput.focus(); 
                }
                return; 
            }
            
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
            
            if (selectedDeceased?.deceased) {
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
                
                // 建立預設訊息文本
                const lineMessage = `【網站花禮訂單】\n` + 
                                    `* 訂購人姓名：${senderName}\n` +
                                    `* 訂購人電話：${senderPhone}\n` +
                                    `* 訂購產品：${product}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 殯儀館：${hallValue}\n` +
                                    `* 告別式日期：${dateValue}\n` +
                                    `* 逝者姓名：${deceasedValue}\n` +
                                    `* 備註：${remark}`;
                
                // 獲取 LINE 連結 (從浮動按鈕或設定的 LINE ID 獲取)
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                let lineLink = lineLinkElement?.getAttribute('href'); 
                
                // 編碼訊息並附加到 LINE 連結
                const encodedMessage = encodeURIComponent(lineMessage);
                
                if (lineLink && lineLink.includes('line.me/ti/p')) {
                     // 確保 text 參數能正確附加 (處理已有 query string 的情況)
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
    // 區塊 3: 手風琴 (Accordion) 功能 (適用於 Services/Blog/Plans 等任何頁面)
    // ===========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        const currentItem = header.closest('.accordion-item');
        const content = header.nextElementSibling; // 假設 content 緊跟在 header 後面
        
        if (!currentItem || !content) return; // 安全性檢查

        // 3.1 確保初始狀態正確展開/收合
        if (currentItem.classList.contains(NAV_ACTIVE_CLASS)) {
             setTimeout(() => {
                 content.style.maxHeight = content.scrollHeight + "px";
             }, 50); 
        } else {
             // 確保所有未展開的項目 max-height 初始為 null (CSS 會轉譯為 0)
             content.style.maxHeight = null; 
        }
        
        // 3.2 點擊事件
        header.addEventListener('click', () => {
            
            // 關閉所有非當前項目的內容 (單一展開模式)
            document.querySelectorAll('.accordion-item').forEach(item => {
                const otherHeader = item.querySelector('.accordion-header');
                const otherContent = item.querySelector('.accordion-content');

                if (item !== currentItem && item.classList.contains(NAV_ACTIVE_CLASS)) {
                    item.classList.remove(NAV_ACTIVE_CLASS);
                    // 確保使用 style.maxHeight = null 來觸發 CSS 過渡到 0
                    if (otherContent) otherContent.style.maxHeight = null; 
                    if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                }
            });

            // 切換當前項目的狀態
            currentItem.classList.toggle(NAV_ACTIVE_CLASS);
            const isExpanding = currentItem.classList.contains(NAV_ACTIVE_CLASS);
            
            header.setAttribute('aria-expanded', isExpanding);

            if (isExpanding) {
                // 展開內容：設定高度為內容的實際高度 (scrollHeight)
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // 收合內容：高度設為 null，觸發 CSS transition
                content.style.maxHeight = null;
            }
        });
    });

    // ===========================================
    // 區塊 4: 隱私與智慧財產保護 (不變)
    // ===========================================
    document.addEventListener('copy', function() {
        console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
    });
});

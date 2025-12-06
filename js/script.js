// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V3.2
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // 統一管理 CSS Class 名稱
    const NAV_ACTIVE_CLASS = 'active'; 
    const ACCORDION_ITEM_SELECTOR = '.accordion-item';

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX)
    // ===========================================

    function initializeNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.getElementById('main-nav');
        
        if (!mobileMenuBtn || !mainNav) return;

        // 儲存原始按鈕內容，用於收合時復原
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        const navLinks = mainNav.querySelectorAll('a');

        // 1.1 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            const isToggling = mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            
            // 切換按鈕圖標和文字 (使用 X 符號)
            this.innerHTML = isToggling 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
            this.setAttribute('aria-expanded', isToggling);
            // 修正：同時處理 body 上的 overflow，防止滾動穿透
            document.body.classList.toggle('menu-open', isToggling);
        });
        
        // 1.2 點擊選單項目後自動關閉
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    // 修正：使用 requestAnimationFrame 或 0ms 延遲確保瀏覽器優先處理導航
                    setTimeout(() => {
                        mainNav.classList.remove(NAV_ACTIVE_CLASS);
                        mobileMenuBtn.innerHTML = initialBtnHtml; 
                        mobileMenuBtn.setAttribute('aria-expanded', false);
                        document.body.classList.remove('menu-open'); // 修正：關閉時移除 body class
                    }, 0); 
                }
            });
        });
        
        // 1.3 頁面導航高亮邏輯
        highlightActiveLink(navLinks);
    }
    
    /**
     * 根據當前 URL 匹配並高亮導航連結
     * @param {NodeList} navLinks - 所有導航連結元素
     */
    function highlightActiveLink(navLinks) {
        // 修正：處理 URL 中的查詢參數 (?id=123) 或 Hash (#section)
        const currentPath = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html'; 
        
        navLinks.forEach(item => {
            const itemHref = item.getAttribute('href')?.split('?')[0].split('#')[0]; // 也對 href 進行清理
            
            item.classList.remove(NAV_ACTIVE_CLASS);

            if (itemHref === currentPath) {
                 item.classList.add(NAV_ACTIVE_CLASS);
            } else if ((currentPath === '' || currentPath === 'index.html') && itemHref === 'index.html') {
                 // 確保根路徑或明確的首頁都能高亮首頁連結
                 item.classList.add(NAV_ACTIVE_CLASS);
            }
        });
    }

    // ===========================================
    // 區塊 2: 喪禮花禮訂購表單互動邏輯 (Order Form)
    // ===========================================

    // --- 模擬殯儀館檔期資料庫 --- (與 V3.1 相同，不再重複)
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
    
    function initializeOrderForm() {
        // 統一獲取所有表單元素，減少重複查詢
        const orderForm = document.querySelector('.order-form');
        const funeralHallSelect = document.getElementById('funeral-hall-select');
        const hallDateInput = document.getElementById('hall-date-input');
        const hallSelect = document.getElementById('hall-select');
        const deceasedNameInput = document.getElementById('deceased-name-input');
        const officialQueryButton = document.getElementById('official-query-btn');
        const senderName = document.getElementById('sender-name');
        const senderPhone = document.getElementById('sender-phone');
        const productSelect = document.getElementById('product-select');
        const remarkInput = document.getElementById('remark');

        if (!orderForm || !funeralHallSelect || !hallDateInput || !hallSelect || !deceasedNameInput || !senderName || !senderPhone) return;
        
        // 初始狀態設置
        if(officialQueryButton) {
            // 修正：統一處理官方查詢按鈕的顯示/隱藏，並存儲初始 HTML
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
            toggleOfficialQueryButton(funeralHallSelect.value);
        }
        hallDateInput.disabled = (funeralHallSelect.value === ''); 

        /**
         * 根據選定的殯儀館切換官方查詢按鈕的顯示狀態
         * @param {string} hallName - 殯儀館名稱
         */
        function toggleOfficialQueryButton(hallName) {
            if (officialQueryButton) {
                const isTaipei2 = (hallName === '台北市立第二殯儀館');
                officialQueryButton.style.display = isTaipei2 ? 'block' : 'none';
            }
        }

        /**
         * 根據選定的殯儀館和日期更新禮廳選項
         */
        function updateHallOptions() {
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            hallSelect.innerHTML = ''; 
            deceasedNameInput.value = '';

            const dateSchedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            let options = '<option value="">-- 請選擇禮廳 --</option>'; // 修正：調整選項文案
            
            if (dateSchedule && dateSchedule.length > 0) {
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            } else if (selectedHallName && selectedDate) {
                 // 修正：當無檔期時，直接預設為手動輸入，並聚焦逝者姓名欄位
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

        // 監聽 殯儀館 變更
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            toggleOfficialQueryButton(this.value);
            hallDateInput.disabled = (this.value === ''); 
        });

        // 監聽 日期 變更
        hallDateInput.addEventListener('change', function() {
            if (!this.value || !funeralHallSelect.value) {
                hallSelect.innerHTML = '<option value="">-- 請先選擇殯儀館和日期 --</option>';
                return; 
            }
            
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
                // 修正：禁用按鈕防止重複點擊
                officialQueryButton.disabled = true;
            }

            // 模擬 API 查詢延遲
            setTimeout(() => {
                updateHallOptions();
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                    officialQueryButton.disabled = false; // 啟用按鈕
                }
            }, 800);
        });
        
        // 監聽 禮廳 變更
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') {
                    // 修正：確保聚焦在逝者姓名欄位
                    deceasedNameInput.focus(); 
                }
                return; 
            }
            
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
            
            deceasedNameInput.value = selectedDeceased?.deceased || ''; // 簡化判斷
        });

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
            
            const senderNameValue = senderName.value.trim();
            const senderPhoneValue = senderPhone.value.trim();
            const hallValue = funeralHallSelect.value.trim();
            const dateValue = hallDateInput.value.trim();
            const deceasedValue = deceasedNameInput.value.trim();
            const productValue = productSelect?.value.trim() || '未選擇花禮/罐頭塔';
            const remarkValue = remarkInput?.value.trim() || '無';

            // 修正：更精確的空值檢查
            if (!hallValue || !dateValue || !deceasedValue || !senderNameValue || !senderPhoneValue) {
                alert('請務必填寫所有標記 * 的關鍵資訊（訂購人/電話、殯儀館/日期/逝者姓名），確保訂單準確！');
                return;
            }
            
            const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
            
            if (confirmed) {
                
                // 建立預設訊息文本
                const lineMessage = `【網站花禮訂單】\n` + 
                                    `* 訂購人姓名：${senderNameValue}\n` +
                                    `* 訂購人電話：${senderPhoneValue}\n` +
                                    `* 訂購產品：${productValue}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 殯儀館：${hallValue}\n` +
                                    `* 告別式日期：${dateValue}\n` +
                                    `* 逝者姓名：${deceasedValue}\n` +
                                    `* 備註：${remarkValue}`;
                
                // 獲取 LINE 連結
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"], a[href*="line.me/ti/p"]');
                let lineLink = lineLinkElement?.getAttribute('href'); 
                
                const encodedMessage = encodeURIComponent(lineMessage);

                if (lineLink) {
                    // 修正：使用固定的 LINE Message API 格式 (line://ti/p/@lineid?text=...)
                    // 並確保 text 參數能正確附加 (處理已有 query string 的情況)
                    lineLink = lineLink.split('?')[0]; // 清理掉舊的 query string
                    lineLink = `${lineLink}?text=${encodedMessage}`;
                     
                    alert('訂單已暫存！即將引導至 LINE 專員，請將預設訊息發送給我們，以確認最終訂購細節與付款。');
                    window.location.href = lineLink;

                } else {
                     alert('LINE 連結未設置或格式不正確，請手動複製以下資訊並聯繫客服：\n\n' + lineMessage);
                }
            }
        });
    }


    // ===========================================
    // 區塊 3: 手風琴 (Accordion) 功能
    // ===========================================
    
    function initializeAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            const currentItem = header.closest(ACCORDION_ITEM_SELECTOR);
            const content = header.nextElementSibling; 
            
            if (!currentItem || !content) return;

            /**
             * 設置或清除內容區塊的高度
             * @param {HTMLElement} element - 內容元素
             * @param {boolean} shouldExpand - 是否應該展開
             */
            function setContentHeight(element, shouldExpand) {
                 if (shouldExpand) {
                     // 展開：設定高度為內容的實際高度
                     element.style.maxHeight = element.scrollHeight + "px";
                 } else {
                     // 收合：高度設為 null，觸發 CSS transition
                     element.style.maxHeight = null;
                 }
            }

            // 3.1 確保初始狀態正確展開/收合
            setContentHeight(content, currentItem.classList.contains(NAV_ACTIVE_CLASS));
            header.setAttribute('aria-expanded', currentItem.classList.contains(NAV_ACTIVE_CLASS));
            
            // 3.2 點擊事件
            header.addEventListener('click', () => {
                
                // 關閉所有非當前項目的內容 (單一展開模式)
                document.querySelectorAll(ACCORDION_ITEM_SELECTOR).forEach(item => {
                    const otherHeader = item.querySelector('.accordion-header');
                    const otherContent = item.querySelector('.accordion-content');

                    if (item !== currentItem && item.classList.contains(NAV_ACTIVE_CLASS)) {
                        item.classList.remove(NAV_ACTIVE_CLASS);
                        if (otherContent) setContentHeight(otherContent, false); 
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });

                // 切換當前項目的狀態
                currentItem.classList.toggle(NAV_ACTIVE_CLASS);
                const isExpanding = currentItem.classList.contains(NAV_ACTIVE_CLASS);
                
                header.setAttribute('aria-expanded', isExpanding);
                setContentHeight(content, isExpanding);
            });
        });
    }

    // ===========================================
    // 區塊 4: 隱私與智慧財產保護 (不變)
    // ===========================================
    function initializeCopyrightProtection() {
        document.addEventListener('copy', function() {
            console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
        });
    }
    
    // ===========================================
    // 區塊 5: 初始化所有功能
    // ===========================================
    initializeNavigation();
    initializeOrderForm();
    initializeAccordion();
    initializeCopyrightProtection();
});

// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V3.3
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // 統一管理 CSS Class 名稱
    const CLASS_ACTIVE = 'active'; 
    const ACCORDION_ITEM_SELECTOR = '.accordion-item';

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX)
    // ===========================================

    function initializeNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.getElementById('main-nav');
        
        if (!mobileMenuBtn || !mainNav) return;

        // 儲存原始按鈕內容
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        const navLinks = mainNav.querySelectorAll('a');

        // 1.1 行動選單切換邏輯
        function toggleMobileMenu(isToggling) {
             const shouldOpen = isToggling !== undefined ? isToggling : !mainNav.classList.contains(CLASS_ACTIVE);

             mainNav.classList.toggle(CLASS_ACTIVE, shouldOpen);
             document.body.classList.toggle('menu-open', shouldOpen); // 防止滾動穿透
             
             // 更新按鈕圖標、文字和 ARIA 屬性
             mobileMenuBtn.innerHTML = shouldOpen 
                 ? '<i class="fas fa-times"></i> 關閉' 
                 : initialBtnHtml;
             mobileMenuBtn.setAttribute('aria-expanded', shouldOpen);
        }

        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
        
        // 1.2 點擊選單項目後自動關閉
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // 如果是錨點連結 (例如 #section-id)，確保先平滑滾動，再關閉選單
                if (mainNav.classList.contains(CLASS_ACTIVE) && this.hash) {
                    // 使用 0ms 延遲確保點擊行為優先完成
                    setTimeout(() => toggleMobileMenu(false), 0); 
                } else if (mainNav.classList.contains(CLASS_ACTIVE)) {
                    // 對於外部連結或非錨點，直接關閉
                    toggleMobileMenu(false);
                }
            });
        });
        
        // 1.3 頁面導航高亮邏輯
        highlightActiveLink(navLinks);
        
        // 額外優化： ESC 鍵關閉選單 (無障礙性)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains(CLASS_ACTIVE)) {
                toggleMobileMenu(false);
            }
        });
    }
    
    /**
     * 根據當前 URL 匹配並高亮導航連結
     * @param {NodeList} navLinks - 所有導航連結元素
     */
    function highlightActiveLink(navLinks) {
        // 清理 URL：移除查詢參數 (?) 和 hash (#)
        const cleanPath = (url) => url?.split('?')[0].split('#')[0] || 'index.html';
        const currentPath = cleanPath(window.location.pathname.split('/').pop()); 
        
        navLinks.forEach(item => {
            const itemHref = cleanPath(item.getAttribute('href'));
            
            item.classList.remove(CLASS_ACTIVE);

            // 判斷是否為當前頁面
            if (itemHref === currentPath) {
                 item.classList.add(CLASS_ACTIVE);
            // 特殊處理：根路徑或空路徑導向首頁
            } else if ((currentPath === 'index.html' || currentPath === '') && itemHref === 'index.html') {
                 item.classList.add(CLASS_ACTIVE);
            }
        });
    }


    // ===========================================
    // 區塊 2: 喪禮花禮訂購表單互動邏輯 (Order Form)
    // ===========================================

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
    
    function initializeOrderForm() {
        // 統一獲取所有表單元素 (更安全地使用可選鏈 ?. 以防 DOM 元素不存在)
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

        if (!orderForm || !funeralHallSelect || !hallDateInput || !hallSelect || !deceasedNameInput) return;
        
        // 初始狀態設置
        if(officialQueryButton) {
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
                officialQueryButton.disabled = false; // 確保按鈕隨時可用，除非正在載入
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
            let options = '<option value="">-- 請選擇禮廳 --</option>'; 
            
            if (dateSchedule && dateSchedule.length > 0) {
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            } else if (selectedHallName && selectedDate) {
                 // 無檔期時
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 // 確保立即觸發 UI 更新和聚焦
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 deceasedNameInput.focus();
                 return; 
            } else {
                 // 尚未選擇場館或日期時
                 options = '<option value="">-- 請先選擇日期 --</option>';
            }
            
            hallSelect.innerHTML = options;
        }

        // 監聽 殯儀館 變更
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            // 重置禮廳選項
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            toggleOfficialQueryButton(this.value);
            // 修正：如果場館選擇為空，則禁用日期輸入
            hallDateInput.disabled = (this.value === ''); 
            // 如果啟用日期輸入，則自動聚焦 (提升 UX)
            if (!hallDateInput.disabled) hallDateInput.focus();
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
                officialQueryButton.disabled = true;
            }

            // 模擬 API 查詢延遲
            setTimeout(() => {
                updateHallOptions();
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                    officialQueryButton.disabled = false; 
                }
            }, 800);
        });
        
        // 監聽 禮廳 變更
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            // 處理手動輸入或未選擇的情況
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') {
                    deceasedNameInput.focus(); 
                }
                return; 
            }
            
            // 查找逝者姓名並填入
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
            
            deceasedNameInput.value = selectedDeceased?.deceased || ''; 
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
            
            // 修正：使用 ?.value.trim() 處理可能不存在的元素 (如 productSelect, remarkInput)
            const senderNameValue = senderName?.value.trim() || '';
            const senderPhoneValue = senderPhone?.value.trim() || '';
            const hallValue = funeralHallSelect.value.trim();
            const dateValue = hallDateInput.value.trim();
            const deceasedValue = deceasedNameInput.value.trim();
            const productValue = productSelect?.value.trim() || '未選擇花禮/罐頭塔';
            const remarkValue = remarkInput?.value.trim() || '無';

            // 關鍵資訊驗證
            if (!hallValue || !dateValue || !deceasedValue || !senderNameValue || !senderPhoneValue) {
                alert('請務必填寫所有標記 * 的關鍵資訊（訂購人/電話、殯儀館/日期/逝者姓名），確保訂單準確！');
                return;
            }
            
            const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
            
            if (confirmed) {
                
                // 建立預設訊息文本 (更清晰的格式化)
                const lineMessage = `【網站花禮訂單 - 待處理】\n` + 
                                    `\n--- 訂購人資訊 ---\n` +
                                    `* 姓名：${senderNameValue}\n` +
                                    `* 電話：${senderPhoneValue}\n` +
                                    `* 產品：${productValue}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 場館：${hallValue}\n` +
                                    `* 日期：${dateValue}\n` +
                                    `* 逝者：${deceasedValue}\n` +
                                    `* 備註：${remarkValue}`;
                
                // 查找 LINE 連結 (優先查找特定 class 或 line.me/ti/p 連結)
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"], a[href*="line.me/ti/p"]');
                let lineLink = lineLinkElement?.getAttribute('href'); 
                
                const encodedMessage = encodeURIComponent(lineMessage);

                if (lineLink) {
                    // 確保使用正確的 URL 格式
                    lineLink = lineLink.split('?')[0]; // 清理舊的 query string
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
                     // 展開：使用 requestAnimationFrame 確保瀏覽器在計算 scrollHeight 前完成渲染
                     requestAnimationFrame(() => {
                         element.style.maxHeight = element.scrollHeight + "px";
                     });
                 } else {
                     element.style.maxHeight = null;
                 }
            }

            // 3.1 確保初始狀態正確
            const isInitiallyExpanded = currentItem.classList.contains(CLASS_ACTIVE);
            setContentHeight(content, isInitiallyExpanded);
            header.setAttribute('aria-expanded', isInitiallyExpanded);
            
            // 3.2 點擊事件
            header.addEventListener('click', () => {
                
                // 關閉所有非當前項目的內容 (單一展開模式)
                document.querySelectorAll(ACCORDION_ITEM_SELECTOR).forEach(item => {
                    const otherHeader = item.querySelector('.accordion-header');
                    const otherContent = item.querySelector('.accordion-content');

                    if (item !== currentItem && item.classList.contains(CLASS_ACTIVE)) {
                        item.classList.remove(CLASS_ACTIVE);
                        if (otherContent) setContentHeight(otherContent, false); 
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });

                // 切換當前項目的狀態
                currentItem.classList.toggle(CLASS_ACTIVE);
                const isExpanding = currentItem.classList.contains(CLASS_ACTIVE);
                
                header.setAttribute('aria-expanded', isExpanding);
                setContentHeight(content, isExpanding);
            });
        });
    }

    // ===========================================
    // 區塊 4: 隱私與智慧財產保護
    // ===========================================
    function initializeCopyrightProtection() {
        document.addEventListener('copy', function(e) {
            // 可選：在複製的內容後添加版權聲明
            const selection = document.getSelection();
            if (selection && selection.toString().length > 0) {
                 const copyrightText = "\n\n--- 聲明 ---\n© 版權所有 祥安生命有限公司。請尊重智慧財產權。";
                 e.clipboardData.setData('text/plain', selection.toString() + copyrightText);
                 e.preventDefault(); // 阻止瀏覽器預設的複製行為
            }
            console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
        });
    }
    
    // ===========================================
    // 區塊 5: 初始化所有功能 (僅在 DOM 準備好後執行)
    // ===========================================
    try {
        initializeNavigation();
        initializeOrderForm();
        initializeAccordion();
        initializeCopyrightProtection();
    } catch (error) {
         console.error("祥安生命核心腳本初始化失敗:", error);
    }
});

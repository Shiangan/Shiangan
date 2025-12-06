// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終極致版 V5.0
// --------------------------------------------------------

/**
 * 腳本入口：確保 DOM 完全載入後執行初始化
 */
document.addEventListener('DOMContentLoaded', function() {

    // 統一管理 CSS Class 名稱與選擇器 (集中化管理)
    const CONSTANTS = {
        CLASS_ACTIVE: 'active', 
        ACCORDION_ITEM_SELECTOR: '.accordion-item',
        MOBILE_BREAKPOINT: 900, // 與 CSS @media 斷點一致
        QUERY_DELAY_MS: 800,    // 模擬 API 查詢延遲時間
        LINE_UNIVERSAL_URL: 'https://line.me/R/oa/lineLink',
    };
    
    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX/A11Y)
    // ===========================================

    function initializeNavigation() {
        const { CLASS_ACTIVE, MOBILE_BREAKPOINT } = CONSTANTS;
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.getElementById('main-nav');
        
        if (!mobileMenuBtn || !mainNav) return; // 安全退出檢查

        // 元素快取與狀態管理
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        const navLinks = mainNav.querySelectorAll('a');
        const dropdownItems = document.querySelectorAll('.has-dropdown');

        /**
         * 1.1 行動選單切換邏輯
         * @param {boolean} isToggling - true: 開啟, false: 關閉, undefined: 切換
         */
        function toggleMobileMenu(isToggling) {
             const shouldOpen = isToggling ?? !mainNav.classList.contains(CLASS_ACTIVE); // 使用 Nullish 合併運算符

             mainNav.classList.toggle(CLASS_ACTIVE, shouldOpen);
             document.body.classList.toggle('menu-open', shouldOpen); // 鎖定 body 滾動穿透
             
             // 更新按鈕圖標和 ARIA 屬性
             mobileMenuBtn.innerHTML = shouldOpen 
                 ? '<i class="fas fa-times"></i> 關閉' 
                 : initialBtnHtml;
             mobileMenuBtn.setAttribute('aria-expanded', shouldOpen);

             // 關閉主選單時，收合所有子選單 (清爽化狀態)
             if (!shouldOpen) {
                dropdownItems.forEach(item => {
                    item.classList.remove(CLASS_ACTIVE);
                    const icon = item.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
             }
        }

        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
        
        // 1.2 點擊選單項目後自動關閉
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                // 僅在行動模式且選單開啟時處理
                if (window.innerWidth <= MOBILE_BREAKPOINT && mainNav.classList.contains(CLASS_ACTIVE)) { 
                    // 如果是 L1 下拉連結，跳過，交給手風琴邏輯處理
                    if (link.closest('.has-dropdown')?.parentElement.classList.contains('has-dropdown')) {
                        return; 
                    }
                    // 非下拉子項目，點擊後關閉選單
                    setTimeout(() => toggleMobileMenu(false), 0);
                }
            });
        });
        
        // 1.3 頁面導航高亮邏輯
        highlightActiveLink(navLinks);
        
        // 1.4 行動端下拉選單 (手風琴) 邏輯
        dropdownItems.forEach(item => {
            const dropdownLink = item.querySelector('a');
            const icon = item.querySelector('.fa-chevron-down');

            dropdownLink.addEventListener('click', function(e) {
                // 僅在行動模式下啟用手風琴效果
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    e.preventDefault(); 

                    // 實作單一展開模式 (收合其他已開啟的項目)
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains(CLASS_ACTIVE)) {
                            otherItem.classList.remove(CLASS_ACTIVE);
                            const otherIcon = otherItem.querySelector('.fa-chevron-down');
                            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                        }
                    });

                    // 切換當前項目的狀態
                    item.classList.toggle(CLASS_ACTIVE);
                    
                    // 旋轉箭頭圖標
                    if (icon) {
                        icon.style.transform = item.classList.contains(CLASS_ACTIVE) ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                }
            });
        });

        // 1.5 螢幕尺寸調整優化：切換桌面/手機模式時重置狀態
        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT) {
                if (mainNav.classList.contains(CLASS_ACTIVE)) {
                    toggleMobileMenu(false); // 桌面模式下確保選單關閉
                }
                // 清除所有手機手風琴狀態
                dropdownItems.forEach(item => {
                    item.classList.remove(CLASS_ACTIVE);
                    const icon = item.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }
        });

        // 1.6 無障礙性： ESC 鍵關閉選單
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
        const { CLASS_ACTIVE } = CONSTANTS;
        // Helper: 清理 URL 
        const cleanPath = (url) => url?.split('?')[0].split('#')[0] || 'index.html';
        const currentPath = cleanPath(window.location.pathname.split('/').pop() || 'index.html'); 
        
        navLinks.forEach(item => {
            const itemHref = cleanPath(item.getAttribute('href'));
            
            item.classList.remove(CLASS_ACTIVE);

            // 精確匹配當前頁面
            if (itemHref === currentPath) {
                 item.classList.add(CLASS_ACTIVE);
            // 模糊匹配：如果當前頁面是子頁面 (e.g., 'service-detail.html')，高亮父連結 (e.g., 'service.html')
            } else if (itemHref && currentPath.startsWith(itemHref.replace('.html', ''))) {
                const parentLi = item.closest('.has-dropdown');
                if (parentLi) {
                    item.classList.add(CLASS_ACTIVE); 
                }
            }
        });
    }


    // ===========================================
    // 區塊 2: 喪禮花禮訂購表單互動邏輯 (Order Form)
    // ===========================================

    // --- 模擬殯儀館檔期資料庫 (結構精簡) ---
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [{ hall: '至真二廳', deceased: '李府老夫人 李○○' }, { hall: '至善二廳', deceased: '張公大人 張○○' }],
            '2025-12-11': [{ hall: '至真二廳', deceased: '王公大人 王○○' }, { hall: '至善一廳', deceased: '林公大人 林○○' }],
            '2025-12-12': []
        },
        '台北市立第一殯儀館': { '2025-12-10': [{ hall: '景行廳', deceased: '陳府老夫人 陳○○' }] },
        '新北市立板橋殯儀館': { '2025-12-11': [{ hall: '追遠廳', deceased: '周公大人 周○○' }] }
    };
    
    function initializeOrderForm() {
        const { QUERY_DELAY_MS, LINE_UNIVERSAL_URL } = CONSTANTS;
        
        // 統一 DOM 元素獲取
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
        
        // 初始化：設置最小日期為今天，禁用日期輸入直到選擇場館
        const today = new Date().toISOString().split('T')[0];
        hallDateInput.setAttribute('min', today);
        hallDateInput.disabled = (funeralHallSelect.value === ''); 
        
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
            toggleOfficialQueryButton(funeralHallSelect.value);
        }

        /** 根據選定的殯儀館切換官方查詢按鈕的顯示狀態 (只顯示二殯的連結) */
        function toggleOfficialQueryButton(hallName) {
            if (officialQueryButton) {
                const isTaipei2 = (hallName === '台北市立第二殯儀館');
                officialQueryButton.style.display = isTaipei2 ? 'block' : 'none';
                officialQueryButton.disabled = false;
            }
        }

        /** 根據選定的殯儀館和日期更新禮廳選項 */
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
                hallSelect.innerHTML = options;
            } else if (selectedHallName && selectedDate) {
                 // 今日無公開檔期資料時，建議手動輸入
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 deceasedNameInput.focus();
                 return; 
            } else {
                 // 尚未選擇場館或日期
                 options = '<option value="">-- 請先選擇日期 --</option>';
                 hallSelect.innerHTML = options;
            }
        }

        // --- 監聽事件 ---

        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            toggleOfficialQueryButton(this.value);
            hallDateInput.disabled = (this.value === ''); 
            if (!hallDateInput.disabled) hallDateInput.focus();
        });

        hallDateInput.addEventListener('change', function() {
            if (!this.value || !funeralHallSelect.value) return; 
            
            // 載入狀態
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
                officialQueryButton.disabled = true;
            }

            // 模擬 API 查詢延遲後，更新禮廳選項
            setTimeout(() => {
                updateHallOptions();
                // 恢復按鈕狀態
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                    officialQueryButton.disabled = false; 
                }
            }, QUERY_DELAY_MS);
        });
        
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            // 處理手動輸入或未選擇的情況
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') deceasedNameInput.focus(); 
                return; 
            }
            
            // 根據選定的禮廳，從 mockScheduleDB 中查找並填入逝者姓名
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule?.find(item => item.hall === selectedHall);
            
            deceasedNameInput.value = selectedDeceased?.deceased || ''; 
        });

        // 官方查詢按鈕點擊事件 (導向外部連結)
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
            
            // 提取並清理所有欄位值
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
                
                // 建立清晰的 LINE 訊息文本
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
                
                // 查找 LINE 連結
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"], a[href*="line.me/ti/p"]');
                const encodedMessage = encodeURIComponent(lineMessage);

                if (lineLinkElement) {
                    // 使用 LINE 通用 API，確保訊息能被正確傳遞
                    const finalLineLink = `${LINE_UNIVERSAL_URL}?text=${encodedMessage}`;
                     
                    alert('訂單已暫存！即將引導至 LINE 專員，請將預設訊息發送給我們，以確認最終訂購細節與付款。');
                    window.location.href = finalLineLink;

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
        const { CLASS_ACTIVE, ACCORDION_ITEM_SELECTOR } = CONSTANTS;
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            const currentItem = header.closest(ACCORDION_ITEM_SELECTOR);
            const content = header.nextElementSibling; 
            
            if (!currentItem || !content) return;

            /** 設置或清除內容區塊的高度 (用於觸發 CSS 過渡動畫) */
            function setContentHeight(element, shouldExpand) {
                 if (shouldExpand) {
                     // 展開：使用 requestAnimationFrame 確保瀏覽器在計算 scrollHeight 前完成渲染
                     requestAnimationFrame(() => {
                         element.style.maxHeight = element.scrollHeight + "px"; 
                     });
                 } else {
                     // 關閉：必須設置 '0px' 才能觸發收合動畫
                     element.style.maxHeight = '0px'; 
                 }
            }

            // 3.1 確保初始狀態正確 (設置初始高度)
            const isInitiallyExpanded = currentItem.classList.contains(CLASS_ACTIVE);
            content.style.maxHeight = isInitiallyExpanded ? content.scrollHeight + "px" : '0px';
            header.setAttribute('aria-expanded', isInitiallyExpanded);
            
            // 3.2 點擊事件 (單一展開模式)
            header.addEventListener('click', () => {
                
                // 收合所有其他已展開的項目
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
        // 設定版權聲明文字
        const COPYRIGHT_TEXT = "\n\n--- 聲明 ---\n© 版權所有 祥安生命有限公司。請尊重智慧財產權。";
        
        document.addEventListener('copy', function(e) {
            const selection = document.getSelection();
            
            if (selection && selection.toString().length > 0) {
                 e.preventDefault(); // 阻止瀏覽器預設的複製行為
                 
                 // 獲取原始純文字內容
                 const originalText = selection.toString();
                 
                 // 將原始文字加上版權聲明後寫入剪貼簿
                 e.clipboardData.setData('text/plain', originalText + COPYRIGHT_TEXT);
            }
            console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
        });
    }
    
    // ===========================================
    // 區塊 5: 初始化所有功能
    // ===========================================
    try {
        initializeNavigation();
        initializeOrderForm();
        initializeAccordion();
        initializeCopyrightProtection();
        
        // 頁面底部的版權年份動態更新
        const currentYearIndex = document.getElementById('current-year-index');
        if (currentYearIndex) {
            currentYearIndex.textContent = new Date().getFullYear();
        }
    } catch (error) {
         console.error("祥安生命核心腳本初始化失敗:", error);
    }
});

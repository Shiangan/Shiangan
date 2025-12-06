// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終生產版 V4.0
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // 統一管理 CSS Class 名稱
    const CLASS_ACTIVE = 'active'; 
    const ACCORDION_ITEM_SELECTOR = '.accordion-item';

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX/A11Y)
    // ===========================================

    function initializeNavigation() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mainNav = document.getElementById('main-nav');
        
        if (!mobileMenuBtn || !mainNav) return;

        // 儲存原始按鈕內容
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        const navLinks = mainNav.querySelectorAll('a');
        const dropdownItems = document.querySelectorAll('.has-dropdown');

        /**
         * 1.1 行動選單切換邏輯
         * @param {boolean} isToggling - true: 開啟, false: 關閉, undefined: 切換
         */
        function toggleMobileMenu(isToggling) {
             const shouldOpen = isToggling !== undefined ? isToggling : !mainNav.classList.contains(CLASS_ACTIVE);

             mainNav.classList.toggle(CLASS_ACTIVE, shouldOpen);
             document.body.classList.toggle('menu-open', shouldOpen); 
             
             // 更新按鈕圖標、文字和 ARIA 屬性
             mobileMenuBtn.innerHTML = shouldOpen 
                 ? '<i class="fas fa-times"></i> 關閉' 
                 : initialBtnHtml;
             mobileMenuBtn.setAttribute('aria-expanded', shouldOpen);

             // 確保關閉主選單時，所有子選單都被收合 (保持狀態清爽)
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
            link.addEventListener('click', function(e) {
                // 僅在行動模式下執行關閉 (避免桌面模式誤關)
                if (window.innerWidth <= 900 && mainNav.classList.contains(CLASS_ACTIVE)) { 
                    // 檢查是否為 L1 下拉選單連結，如果是，不關閉
                    if (link.closest('.has-dropdown') && link.parentElement.classList.contains('has-dropdown')) {
                        // 讓手風琴邏輯處理
                        return; 
                    }
                    // 使用 0ms 延遲確保點擊行為優先完成
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
                // 判斷是否處於行動模式 (CSS 中斷點: 900px)
                if (window.innerWidth <= 900) {
                    e.preventDefault(); // 阻止 L1 連結在手機上的預設跳轉

                    // 收合其他已展開的下拉選單
                    dropdownItems.forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains(CLASS_ACTIVE)) {
                            otherItem.classList.remove(CLASS_ACTIVE);
                            const otherIcon = otherItem.querySelector('.fa-chevron-down');
                            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                        }
                    });

                    // 切換當前項目的展開狀態
                    item.classList.toggle(CLASS_ACTIVE);
                    
                    // 旋轉箭頭
                    if (icon) {
                        icon.style.transform = item.classList.contains(CLASS_ACTIVE) ? 'rotate(180deg)' : 'rotate(0deg)';
                    }
                }
            });
        });

        // 1.5 螢幕尺寸調整優化：切換桌面/手機模式時重置狀態
        window.addEventListener('resize', () => {
            if (window.innerWidth > 900) {
                // 如果切換到桌面模式，確保選單是關閉的
                if (mainNav.classList.contains(CLASS_ACTIVE)) {
                    toggleMobileMenu(false); 
                }
                // 確保所有手風琴狀態被清除 (回歸 CSS hover 狀態)
                dropdownItems.forEach(item => {
                    item.classList.remove(CLASS_ACTIVE);
                    const icon = item.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
            }
        });

        // 1.6 額外優化： ESC 鍵關閉選單 (無障礙性)
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
        // 確保獲取到 'index.html' 或 'about.html'
        const currentPath = cleanPath(window.location.pathname.split('/').pop() || 'index.html'); 
        
        navLinks.forEach(item => {
            const itemHref = cleanPath(item.getAttribute('href'));
            
            item.classList.remove(CLASS_ACTIVE);

            // 判斷是否為當前頁面
            if (itemHref === currentPath) {
                 item.classList.add(CLASS_ACTIVE);
            // 特殊處理：當前頁面是子選單頁面，則高亮 L1 父級
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
        // 優化：設定日期輸入框的最小日期為今天
        const today = new Date().toISOString().split('T')[0];
        hallDateInput.setAttribute('min', today);
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
                hallSelect.innerHTML = options;
            } else if (selectedHallName && selectedDate) {
                 // 無檔期時 (或不在 DB 內)
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 deceasedNameInput.focus();
                 return; 
            } else {
                 // 尚未選擇場館或日期時
                 options = '<option value="">-- 請先選擇日期 --</option>';
                 hallSelect.innerHTML = options;
            }
        }

        // 監聽 殯儀館 變更
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
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
            
            // 載入狀態
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
                officialQueryButton.disabled = true;
            }

            // 模擬 API 查詢延遲
            setTimeout(() => {
                updateHallOptions();
                // 恢復狀態
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
            
            // 確保設置值 (即便找不到，也應清除欄位)
            deceasedNameInput.value = selectedDeceased?.deceased || ''; 
        });

        // 官方查詢按鈕點擊事件 (用於二殯官方連結)
        if (officialQueryButton) {
            officialQueryButton.addEventListener('click', function(e) {
                e.preventDefault();
                const externalUrl = this.getAttribute('href'); 
                if (externalUrl) {
                    // 使用 Google Maps Tool 連結到外部網站 
                    // 實際應用中，使用 window.open(externalUrl, '_blank')
                    window.open(externalUrl, '_blank'); 
                }
            });
        }
        
        // 核心邏輯：將表單數據編碼至 LINE 訊息
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // 確保所有表單元素都存在
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
                    // 確保使用正確的 URL 格式 (line://ti/p/@{id} 或 https://line.me/ti/p/@{id})
                    lineLink = lineLink.split('?')[0]; // 清理舊的 query string
                    
                    // 判斷是 line.me 網頁版還是 line:// 應用程式版
                    if (lineLink.includes('line.me')) {
                        lineLink = `https://line.me/R/oa/lineLink?text=${encodedMessage}`; // 網頁版 LINE 官方帳號 API
                    } else if (lineLink.includes('line://')) {
                         // 這裡需要針對不同版本的 LINE 應用程式 API 進行調整，為保險起見，使用 line.me 的通用 API
                         // 避免因 LINE App 版本更新導致的訊息編碼問題
                         lineLink = `https://line.me/R/oa/lineLink?text=${encodedMessage}`; 
                    } else {
                        // 如果是普通網址，則使用通用 API
                        lineLink = `https://line.me/R/oa/lineLink?text=${encodedMessage}`; 
                    }

                     
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
    // (保留您的優化邏輯，確保 CSS 轉換效果)
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
                         // 關鍵：將內容的實際高度賦值給 maxHeight，觸發 CSS 過渡
                         element.style.maxHeight = element.scrollHeight + "px"; 
                     });
                 } else {
                     // 關閉：必須先將 maxHeight 設為 '0' 才能觸發收合動畫
                     element.style.maxHeight = '0px'; 
                 }
            }

            // 3.1 確保初始狀態正確
            const isInitiallyExpanded = currentItem.classList.contains(CLASS_ACTIVE);
            // 初始載入時，如果設定為 active，則給一個足夠大的高度，但最好是讓 CSS 處理初始狀態
            if (isInitiallyExpanded) {
                 content.style.maxHeight = content.scrollHeight + "px"; 
            } else {
                 content.style.maxHeight = '0px';
            }
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
            const selection = document.getSelection();
            if (selection && selection.toString().length > 0) {
                 const copyrightText = "\n\n--- 聲明 ---\n© 版權所有 祥安生命有限公司。請尊重智慧財產權。";
                 // 優化：處理 HTML 複製 (如果需要的話)，這裡只處理純文字
                 const data = e.clipboardData.getData('text/plain');
                 if (data) {
                    e.clipboardData.setData('text/plain', data + copyrightText);
                 } else {
                    e.clipboardData.setData('text/plain', selection.toString() + copyrightText);
                 }
                 e.preventDefault(); 
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
        
        // 頁面底部的年份更新
        const currentYearIndex = document.getElementById('current-year-index');
        if (currentYearIndex) {
            currentYearIndex.textContent = new Date().getFullYear();
        }
    } catch (error) {
         console.error("祥安生命核心腳本初始化失敗:", error);
    }
});

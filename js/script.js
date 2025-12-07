// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終極致版 V6.2 (導航修正版)
// --------------------------------------------------------

/**
 * 腳本入口：確保 DOM 完全載入後執行初始化
 * 使用 IIFE (立即調用函數表達式) 隔離作用域，防止全域污染
 */
(function() {
    'use strict'; // 啟用嚴格模式

    // 統一管理 CSS Class 名稱與選擇器 (集中化管理)
    const CONSTANTS = {
        CLASS_ACTIVE: 'active', 
        FAQ_ITEM_SELECTOR: '.faq-item', 
        DROPDOWN_SELECTOR: '.dropdown', 
        MOBILE_BREAKPOINT: 900, 
        QUERY_DELAY_MS: 800,    
        LINE_UNIVERSAL_URL: 'https://line.me/R/oa/lineLink',
        COPYRIGHT_TEXT: "\n\n--- 聲明 ---\n© 版權所有 祥安生命有限公司。請尊重智慧財產權。",
    };
    
    // --- 模擬殯儀館檔期資料庫 (結構精簡) ---
    // 用於表單互動時，模擬查詢禮廳及逝者姓名
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [{ hall: '至真二廳', deceased: '李府老夫人 李○○' }, { hall: '至善二廳', deceased: '張公大人 張○○' }],
            '2025-12-11': [{ hall: '至真二廳', deceased: '王公大人 王○○' }, { hall: '至善一廳', deceased: '林公大人 林○○' }],
            '2025-12-12': []
        },
        '台北市立第一殯儀館': { '2025-12-10': [{ hall: '景行廳', deceased: '陳府老夫人 陳○○' }] },
        '新北市立板橋殯儀館': { '2025-12-11': [{ hall: '追遠廳', deceased: '周公大人 周○○' }] }
    };

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX/A11Y)
    // ===========================================

    /** * 根據當前 URL 匹配並高亮導航連結 
     * 修正：確保高亮邏輯能兼容 L1 和 L2/L3 頁面
     * @param {NodeList} navLinks - 所有導航連結元素
     */
    function highlightActiveLink(navLinks) {
        const { CLASS_ACTIVE, DROPDOWN_SELECTOR } = CONSTANTS;
        // 清理路徑：移除查詢參數和哈希值
        const cleanPath = (url) => url?.split('?')[0].split('#')[0] || 'index.html';
        // 取得當前檔案名
        const currentPath = cleanPath(window.location.pathname.split('/').pop() || 'index.html'); 
        
        navLinks.forEach(item => {
            const itemHref = cleanPath(item.getAttribute('href'));
            item.classList.remove(CLASS_ACTIVE);

            // 1. 精確匹配當前頁面 (L1, L2, L3)
            if (itemHref === currentPath) {
                 item.classList.add(CLASS_ACTIVE);
                 
            } else {
                 // 2. 處理下拉選單子頁面的高亮 (L2/L3 反映到 L1)
                 const parentLi = item.closest('li');
                 if (parentLi && parentLi.classList.contains(DROPDOWN_SELECTOR)) {
                    // 找出此下拉選單的 L1 連結
                    const l1Link = parentLi.querySelector(':scope > a'); 
                    const l1Href = cleanPath(l1Link?.getAttribute('href'));

                    // 如果當前路徑是以 L1 連結路徑為基礎的前綴
                    if (currentPath.startsWith(l1Href.replace('.html', ''))) {
                        l1Link.classList.add(CLASS_ACTIVE);
                    }
                 }
            }
        });
    }

    function initializeNavigation() {
        const { CLASS_ACTIVE, MOBILE_BREAKPOINT, DROPDOWN_SELECTOR } = CONSTANTS;
        const mobileMenuBtn = document.querySelector('.menu-toggle'); 
        const mainNav = document.getElementById('main-nav');
        
        if (!mobileMenuBtn || !mainNav) return; 

        const initialBtnHtml = mobileMenuBtn.innerHTML;
        const navLinks = mainNav.querySelectorAll('a');
        const dropdownItems = document.querySelectorAll(DROPDOWN_SELECTOR); 

        /**
         * 1.1 行動選單切換邏輯
         * @param {boolean} isToggling - true: 開啟, false: 關閉, null/undefined: 切換
         */
        function toggleMobileMenu(isToggling) {
             const shouldOpen = isToggling ?? !mainNav.classList.contains(CLASS_ACTIVE); 

             mainNav.classList.toggle(CLASS_ACTIVE, shouldOpen);
             document.body.classList.toggle('menu-open', shouldOpen); 
             
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
                
                // 確保在關閉時清除行內樣式，讓 CSS 的 overflow: hidden; 生效 
                mainNav.style.overflowY = ''; 
                
             } else {
                 // 展開時允許滾動
                 mainNav.style.overflowY = 'auto';
             }
        }
        
        /**
         * 1.2 行動端下拉選單 (手風琴) 邏輯
         */
        function handleMobileDropdown(e, item, dropdownLink, icon) {
            // 僅在行動模式下啟用手風琴效果
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                
                // 如果 L1 連結是空的 (純粹的選單標籤)，則始終阻止跳轉
                if (dropdownLink.getAttribute('href') === '#') {
                    e.preventDefault();
                }

                const currentlyActive = item.classList.contains(CLASS_ACTIVE);
                
                // 實作單一展開模式 (收合其他已開啟的項目)
                dropdownItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains(CLASS_ACTIVE)) {
                        otherItem.classList.remove(CLASS_ACTIVE);
                        const otherIcon = otherItem.querySelector('.fa-chevron-down');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                // 切換當前項目的狀態
                item.classList.toggle(CLASS_ACTIVE, !currentlyActive);
                
                // 旋轉箭頭圖標
                if (icon) {
                    icon.style.transform = !currentlyActive ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                
                // 如果是帶有子選單的 L1 連結，阻止預設跳轉，優先展開子選單
                if (item.querySelector('.submenu')) {
                    e.preventDefault(); 
                }
            }
        }

        // --- 事件監聽 ---

        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
        
        /**
         * 1.3 點擊選單項目後自動關閉（L2/L3 點擊後關閉）
         */
        mainNav.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            // 僅在行動模式且選單開啟時處理
            if (window.innerWidth <= MOBILE_BREAKPOINT && mainNav.classList.contains(CLASS_ACTIVE)) { 
                const parentDropdown = link.closest(DROPDOWN_SELECTOR);
                
                // 判斷是否為 L1 連結 (即直接屬於 .dropdown 的 a 元素，且沒有父級 submenu)
                const isL1Link = parentDropdown && link.closest('.submenu') === null;

                // 如果點擊的不是 L1 連結 (即 L2 或 L3)，則關閉選單
                if (!isL1Link) {
                    setTimeout(() => toggleMobileMenu(false), 0);
                }
            }
        });
        
        // 1.4 行動端下拉選單事件
        dropdownItems.forEach(item => {
            const dropdownLink = item.querySelector('a');
            const icon = item.querySelector('.fa-chevron-down');
            
            if (dropdownLink) {
                 dropdownLink.addEventListener('click', (e) => handleMobileDropdown(e, item, dropdownLink, icon));
            }
        });

        // 1.5 螢幕尺寸調整優化 (桌面模式下清除行動選單狀態)
        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT && mainNav.classList.contains(CLASS_ACTIVE)) {
                toggleMobileMenu(false); 
            }
            // 清除所有手機手風琴狀態 (避免桌面模式時保留手風琴的 active class)
            dropdownItems.forEach(item => {
                item.classList.remove(CLASS_ACTIVE);
                const icon = item.querySelector('.fa-chevron-down');
                if (icon) icon.style.transform = 'rotate(0deg)';
            });
        });

        // 1.6 無障礙性： ESC 鍵關閉選單
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mainNav.classList.contains(CLASS_ACTIVE)) {
                e.preventDefault(); 
                toggleMobileMenu(false);
            }
        });
        
        // 1.7 頁面導航高亮
        highlightActiveLink(navLinks);
    }


    // ===========================================
    // 區塊 2: 喪禮花禮訂購表單互動邏輯 (Order Form)
    // ===========================================
    
    function initializeOrderForm() {
        const { QUERY_DELAY_MS, LINE_UNIVERSAL_URL } = CONSTANTS;
        
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
        
        const today = new Date().toISOString().split('T')[0];
        hallDateInput.setAttribute('min', today);
        
        if (funeralHallSelect.value === '') {
            hallDateInput.disabled = true; 
        } else {
             toggleOfficialQueryButton(funeralHallSelect.value);
        }
        
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
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
                // 載入從模擬 DB 查到的禮廳
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
                hallSelect.innerHTML = options;
            } else if (selectedHallName && selectedDate) {
                 // 該日無檔期資料 (強制選擇手動輸入)
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 deceasedNameInput.focus();
            } else {
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
            
            // 模擬載入狀態
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
                officialQueryButton.disabled = true;
            }

            // 模擬網路延遲
            setTimeout(() => {
                updateHallOptions();
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                    toggleOfficialQueryButton(funeralHallSelect.value); 
                }
            }, QUERY_DELAY_MS);
        });
        
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') deceasedNameInput.focus(); 
                return; 
            }
            
            // 從模擬 DB 中找到逝者姓名
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule?.find(item => item.hall === selectedHall);
            
            deceasedNameInput.value = selectedDeceased?.deceased || ''; 
        });

        if (officialQueryButton) {
            officialQueryButton.addEventListener('click', function(e) {
                e.preventDefault();
                const externalUrl = this.getAttribute('href'); 
                if (externalUrl) {
                    window.open(externalUrl, '_blank', 'noopener,noreferrer');
                }
            });
        }
        
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // 擷取並清理所有表單數據
            const senderNameValue = senderName?.value.trim() || '';
            const senderPhoneValue = senderPhone?.value.trim() || '';
            const hallValue = funeralHallSelect.value.trim();
            const dateValue = hallDateInput.value.trim();
            // 處理禮廳顯示：如果是手動輸入，則顯示逝者姓名 + 備註
            const hallDisplayValue = hallSelect.value === '手動輸入' ? deceasedNameInput.value.trim() + ' (禮廳手動輸入)' : hallSelect.value;
            const deceasedValue = deceasedNameInput.value.trim();
            const productValue = productSelect?.value.trim() || '未選擇花禮/罐頭塔';
            const remarkValue = remarkInput?.value.trim() || '無';

            // 簡易驗證
            if (!hallValue || !dateValue || !deceasedValue || !senderNameValue || !senderPhoneValue) {
                alert('請務必填寫所有標記 * 的關鍵資訊（訂購人/電話、殯儀館/日期/逝者姓名），確保訂單準確！');
                return;
            }
            
            const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
            
            if (confirmed) {
                
                // 結構化 LINE 訊息內容
                const lineMessage = `【網站花禮訂單 - 待處理】\n` + 
                                    `\n--- 訂購人資訊 ---\n` +
                                    `* 姓名：${senderNameValue}\n` +
                                    `* 電話：${senderPhoneValue}\n` +
                                    `* 產品：${productValue}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 場館：${hallValue}\n` +
                                    `* 日期：${dateValue}\n` +
                                    `* 禮廳：${hallDisplayValue}\n` + 
                                    `* 逝者：${deceasedValue}\n` +
                                    `* 備註：${remarkValue}`;
                
                const lineLinkElement = document.querySelector('.floating-cta a[href*="line"], a[href*="line.me/ti/p"]');
                const encodedMessage = encodeURIComponent(lineMessage);

                if (lineLinkElement) {
                    // 建構完整的 LINE Universal Link (包含預填訊息)
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
        const { FAQ_ITEM_SELECTOR } = CONSTANTS;
        const faqItems = document.querySelectorAll(FAQ_ITEM_SELECTOR); 
        
        faqItems.forEach(currentItem => {
            // 3.1 處理單一展開模式
            currentItem.addEventListener('toggle', (e) => {
                if (currentItem.open) { // 如果當前項目被打開
                    faqItems.forEach(otherItem => {
                        if (otherItem !== currentItem && otherItem.open) {
                            otherItem.open = false; // 關閉其他已開啟的項目
                        }
                    });
                }
            });
            
            // 3.2 A11Y 強化: 確保 summary 元素是可聚焦的
            const summary = currentItem.querySelector('summary');
            if (summary) {
                summary.setAttribute('tabindex', '0');
            }
        });
    }

    // ===========================================
    // 區塊 4: 隱私與智慧財產保護
    // ===========================================
    function initializeCopyrightProtection() {
        const { COPYRIGHT_TEXT } = CONSTANTS;
        
        // 4.1 複製事件：在複製內容後追加版權聲明
        document.addEventListener('copy', function(e) {
            const selection = document.getSelection();
            
            if (selection && selection.toString().length > 0) {
                 e.preventDefault(); 
                 
                 const originalText = selection.toString();
                 e.clipboardData.setData('text/plain', originalText + COPYRIGHT_TEXT);
            }
            console.info(COPYRIGHT_TEXT.replace('\n\n--- 聲明 ---\n', '')); 
        });
        
        // 4.2 頁面底部的版權年份動態更新
        const currentYearIndex = document.getElementById('current-year');
        if (currentYearIndex) {
            currentYearIndex.textContent = new Date().getFullYear();
        }
    }
    
    // ===========================================
    // 區塊 5: 初始化所有功能
    // ===========================================
    
    document.addEventListener('DOMContentLoaded', function() {
        try {
            initializeNavigation();
            initializeOrderForm();
            initializeAccordion();
            initializeCopyrightProtection();
            
            console.log("祥安生命核心腳本 (V6.2) 初始化完成。");
        } catch (error) {
             console.error("祥安生命核心腳本初始化失敗:", error);
        }
    });

})(); // 結束 IIFE

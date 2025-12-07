// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終極致版 V7.0
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
        DROPDOWN_SELECTOR: '.dropdown', 
        FAQ_ITEM_SELECTOR: '.faq-item', 
        MOBILE_BREAKPOINT: 900, 
        QUERY_DELAY_MS: 800,    
        LINE_UNIVERSAL_URL: 'https://line.me/R/oa/lineLink',
        COPYRIGHT_TEXT: "\n\n--- 聲明 ---\n© 版權所有 祥安生命有限公司。請尊重智慧財產權。本網站內容受版權保護，未經許可請勿轉載。",
    };
    
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

    // ===========================================
    // 區塊 1: 導航功能與使用者介面 (UX/A11Y)
    // ===========================================

    /** 根據當前 URL 匹配並高亮導航連結 */
    function highlightActiveLink(navLinks) {
        const { CLASS_ACTIVE } = CONSTANTS;
        // 清理路徑：移除查詢參數和哈希值
        const cleanPath = (url) => url?.split('?')[0].split('#')[0] || 'index.html';
        // 取得當前檔案名
        const currentPath = cleanPath(window.location.pathname.split('/').pop() || 'index.html'); 
        
        // 確保先清除所有 active 狀態
        navLinks.forEach(item => item.classList.remove(CLASS_ACTIVE));

        navLinks.forEach(item => {
            const itemHref = cleanPath(item.getAttribute('href'));
            
            // 1. 精確匹配當前頁面 (L1, L2, L3)
            if (itemHref === currentPath) {
                 item.classList.add(CLASS_ACTIVE);
            }
            
            // 2. 處理下拉選單子頁面的高亮 (L2/L3 反映到 L1，即父層 L1 連結也被高亮)
            const parentLi = item.closest(CONSTANTS.DROPDOWN_SELECTOR);
            if (parentLi) {
                const l1Link = parentLi.querySelector(':scope > a'); 
                const l1Href = cleanPath(l1Link?.getAttribute('href'));
                
                // 如果當前路徑是 L1 連結 (例如 plans.html)
                if (currentPath === l1Href) {
                    l1Link.classList.add(CLASS_ACTIVE);
                } 
                // 為了兼容服務業網站常有的結構，如果 L2/L3 連結指向的頁面是 L1 連結本身，則 L1 連結也應該被高亮
                if (itemHref === currentPath && item !== l1Link) {
                    l1Link.classList.add(CLASS_ACTIVE);
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

        /** 1.1 行動選單切換邏輯 */
        function toggleMobileMenu(shouldOpen) {
             const isOpening = shouldOpen ?? !mainNav.classList.contains(CLASS_ACTIVE); 

             mainNav.classList.toggle(CLASS_ACTIVE, isOpening);
             document.body.classList.toggle('menu-open', isOpening); 
             
             mobileMenuBtn.innerHTML = isOpening 
                 ? '<i class="fas fa-times"></i> 關閉' 
                 : initialBtnHtml;
             mobileMenuBtn.setAttribute('aria-expanded', isOpening);

             // 關閉時清理狀態
             if (!isOpening) {
                dropdownItems.forEach(item => {
                    item.classList.remove(CLASS_ACTIVE);
                    const icon = item.querySelector('.fa-chevron-down');
                    if (icon) icon.style.transform = 'rotate(0deg)';
                });
                mainNav.style.overflowY = ''; 
             } else {
                 mainNav.style.overflowY = 'auto';
             }
        }
        
        /** 1.2 行動端下拉選單 (手風琴) 邏輯 */
        function handleMobileDropdown(e, item, icon) {
            // 僅在行動模式下且螢幕寬度小於或等於斷點時處理
            if (window.innerWidth <= MOBILE_BREAKPOINT) {
                
                const isCurrentlyActive = item.classList.contains(CLASS_ACTIVE);
                
                // 實作單一展開模式 (收合其他已開啟的項目)
                dropdownItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains(CLASS_ACTIVE)) {
                        otherItem.classList.remove(CLASS_ACTIVE);
                        const otherIcon = otherItem.querySelector('.fa-chevron-down');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                // 切換當前項目的狀態
                item.classList.toggle(CLASS_ACTIVE, !isCurrentlyActive);
                
                // 旋轉箭頭圖標
                if (icon) {
                    icon.style.transform = !isCurrentlyActive ? 'rotate(180deg)' : 'rotate(0deg)';
                }
                
                // 如果是 L1 連結且它帶有子選單，阻止預設跳轉，優先展開子選單
                if (item.querySelector('.submenu')) {
                    e.preventDefault(); 
                }
            }
        }

        // --- 事件監聽 ---

        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu());
        
        /** 1.3 點擊 L2/L3 連結後自動關閉選單 */
        mainNav.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (!link) return;
            
            // 僅在行動模式且選單開啟時處理
            if (window.innerWidth <= MOBILE_BREAKPOINT && mainNav.classList.contains(CLASS_ACTIVE)) { 
                
                // 如果點擊的是 L2 或 L3 連結 (即屬於 .submenu 內的 a 元素)
                if (link.closest('.submenu')) {
                    // 使用 setTimeout 確保連結跳轉先執行，再關閉選單
                    setTimeout(() => toggleMobileMenu(false), 50); 
                }
                
                // 如果點擊的是 L1 連結但 href 不是 # 且沒有子選單，也應關閉
                const parentDropdown = link.closest(DROPDOWN_SELECTOR);
                if (parentDropdown && !parentDropdown.querySelector('.submenu') && link.getAttribute('href') !== '#') {
                     setTimeout(() => toggleMobileMenu(false), 50);
                }
            }
        });
        
        // 1.4 行動端下拉選單事件
        dropdownItems.forEach(item => {
            const dropdownLink = item.querySelector(':scope > a'); // 確保只選擇 L1 連結
            const icon = item.querySelector('.fa-chevron-down');
            
            if (dropdownLink) {
                 dropdownLink.addEventListener('click', (e) => handleMobileDropdown(e, item, icon));
            }
        });

        // 1.5 螢幕尺寸調整優化 (桌面模式下清除行動選單狀態)
        window.addEventListener('resize', () => {
            if (window.innerWidth > MOBILE_BREAKPOINT && mainNav.classList.contains(CLASS_ACTIVE)) {
                toggleMobileMenu(false); 
            }
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
        // --- 修正：使用 order.html 中定義的正確 ID ---
        const orderForm = document.getElementById('flower-order-form');
        if (!orderForm) return; // 確保只在 order.html 執行
        
        const { QUERY_DELAY_MS, LINE_UNIVERSAL_URL } = CONSTANTS;
        
        // 產品選擇按鈕邏輯 (從 order.html 程式碼中移植過來，確保互動性)
        const productSelectButtons = document.querySelectorAll('.select-product-btn');
        const productInput = document.getElementById('product-select');
        
        // 訂購人資訊
        const senderName = document.getElementById('name'); // 修正 ID
        const senderPhone = document.getElementById('phone'); // 修正 ID
        
        // 殯儀館資訊 (模擬)
        const funeralHallSelect = document.getElementById('delivery-address'); // 暫時用於輸入地址
        const hallDateInput = document.getElementById('delivery-date'); // 修正 ID
        const recipientName = document.getElementById('recipient-name'); // 逝者/告別式名稱
        const remarkInput = document.getElementById('message'); // 備註/輓詞
        
        // 由於您在 HTML 中沒有設計複雜的殯儀館/禮廳查詢下拉式選單，
        // 這裡將簡化邏輯，主要進行日期限制和 LINE 訊息建構。
        // （註：原本的 `mockScheduleDB` 邏輯被註釋掉，除非您在 HTML 中重建該結構）
        
        if (!hallDateInput) return; // 確保關鍵欄位存在
        
        const today = new Date().toISOString().split('T')[0];
        hallDateInput.setAttribute('min', today + 'T00:00'); // 限制日期不能早於今天

        // --- 產品選擇按鈕事件監聽 ---
        productSelectButtons.forEach(button => {
            button.addEventListener('click', function() {
                const productName = this.getAttribute('data-product');
                if (productInput) productInput.value = productName;
                
                // 視覺回饋
                document.querySelectorAll('.product-card').forEach(card => {
                    card.classList.remove('selected-product');
                });
                this.closest('.product-card').classList.add('selected-product');
                
                // 捲動到表單區塊
                document.getElementById('order-form-section')?.scrollIntoView({ behavior: 'smooth' });
            });
        });
        
        // --- 表單提交事件 ---
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            // 擷取並清理所有表單數據
            const productValue = productInput?.value.trim() || '未選擇花禮/罐頭塔';
            const senderNameValue = senderName?.value.trim() || '';
            const senderPhoneValue = senderPhone?.value.trim() || '';
            const recipientNameValue = recipientName?.value.trim() || '';
            const deliveryDateTime = hallDateInput?.value.trim() || '';
            const addressValue = funeralHallSelect?.value.trim() || '';
            const remarkValue = remarkInput?.value.trim() || '無';
            
            // 簡易驗證
            if (!productValue || !senderNameValue || !senderPhoneValue || !recipientNameValue || !deliveryDateTime || !addressValue) {
                alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                return;
            }

            const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
            
            if (confirmed) {
                // 結構化 LINE 訊息內容 (更友好的格式)
                const lineMessage = `【網站花禮訂單 - 待處理】\n` + 
                                    `\n--- 訂購產品 ---\n` +
                                    `* 產品：${productValue}\n` +
                                    `\n--- 告別式資訊 ---\n` +
                                    `* 逝者：${recipientNameValue}\n` +
                                    `* 日期：${deliveryDateTime.replace('T', ' ')}\n` + // 格式化日期時間
                                    `* 地址：${addressValue}\n` + 
                                    `* 備註：${remarkValue}\n` +
                                    `\n--- 訂購人資訊 ---\n` +
                                    `* 姓名：${senderNameValue}\n` +
                                    `* 電話：${senderPhoneValue}\n`;
                
                const encodedMessage = encodeURIComponent(lineMessage);

                // 尋找 LINE 聯繫連結 (從浮動 CTA 或 Footer 中尋找)
                const lineLinkElement = document.querySelector('a[href*="line.me/ti/p"]');

                if (lineLinkElement) {
                    // 確保 BASE URL 是正確的
                    const baseUrl = lineLinkElement.getAttribute('href').split('?')[0]; 
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
            const summary = currentItem.querySelector('summary');
            if (!summary) return;

            // 3.1 處理單一展開模式 (使用 toggle 事件是 MDN 推薦的現代作法)
            currentItem.addEventListener('toggle', () => {
                if (currentItem.open) { 
                    faqItems.forEach(otherItem => {
                        if (otherItem !== currentItem && otherItem.open) {
                            otherItem.open = false; 
                        }
                    });
                }
            });
            
            // 3.2 A11Y 強化: 確保 summary 元素是可聚焦的
            summary.setAttribute('tabindex', '0');
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
            // 在控制台輸出提示，告知使用者已附加聲明
            console.info("已複製內容。為了保障智慧財產權，已附加版權聲明：\n" + COPYRIGHT_TEXT.split('--- 聲明 ---')[1].trim()); 
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
            
            console.log("祥安生命核心腳本 (V7.0) 初始化完成：所有功能已啟動。");
        } catch (error) {
             console.error("祥安生命核心腳本初始化失敗，請檢查錯誤原因:", error);
        }
    });

})(); // 結束 IIFE

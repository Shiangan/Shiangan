// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V2.0
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (移除右鍵禁用，改為柔性提示)
    // ===========================================
    document.addEventListener('copy', function() {
        console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
    });

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    // 修正: 確保 mobile 選單容器與 nav 同步，或使用新的 class 讓選單出現
    const navContainer = document.querySelector('header'); 
    const NAV_ACTIVE_CLASS = 'active';
    const MOBILE_MENU_CLASS = 'mobile-menu'; // 配合 CSS 900px RWD 媒體查詢

    if (mobileMenuBtn && mainNav && navContainer) {
        
        // 將 #main-nav 設置為移動選單的容器，以便在 RWD 樣式中切換
        mainNav.classList.add(MOBILE_MENU_CLASS);
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            // 使用 active class 切換 display 狀態 (CSS 需配合)
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            const isActive = mainNav.classList.contains(NAV_ACTIVE_CLASS);
            
            // 修正: 切換按鈕圖標和文字
            this.innerHTML = isActive 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
            // 無障礙優化
            this.setAttribute('aria-expanded', isActive);
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    mainNav.classList.remove(NAV_ACTIVE_CLASS);
                    mobileMenuBtn.innerHTML = initialBtnHtml; 
                    mobileMenuBtn.setAttribute('aria-expanded', false);
                }
            });
        });
    }

    // 頁面導航高亮 (優化路徑檢查邏輯)
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        // 檢查 href 是否匹配當前路徑或首頁 ('', 'index.html')
        if (itemHref && currentPath && itemHref.endsWith(currentPath)) {
            item.classList.add(NAV_ACTIVE_CLASS);
        } else if ((!currentPath || currentPath === 'index.html' || currentPath === '') && (itemHref === '/' || itemHref === 'index.html')) {
             item.classList.add(NAV_ACTIVE_CLASS);
        }
    });


    // ===========================================
    // 區塊 3: 喪禮花禮訂購表單互動邏輯 (UX/驗證優化)
    // ===========================================

    const orderForm = document.querySelector('.order-form');
    const funeralHallSelect = document.getElementById('funeral-hall-select');
    const hallDateInput = document.getElementById('hall-date-input');
    const hallSelect = document.getElementById('hall-select');
    const deceasedNameInput = document.getElementById('deceased-name-input');
    const officialQueryButton = document.getElementById('official-query-btn');
    
    // --- 模擬殯儀館檔期資料庫 (保持不變) ---
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

    if (funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput) {
        
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
        }
        
        // 1. 監聽殯儀館選擇
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

        // 2. 監聽日期選擇 - 加入載入反饋
        hallDateInput.addEventListener('change', function() {
            if (!this.value || !funeralHallSelect.value) {
                hallSelect.innerHTML = '<option value="">-- 請先選擇殯儀館和日期 --</option>';
                return; 
            }
            
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
            }

            setTimeout(() => {
                updateHallOptions();
                if (officialQueryButton) {
                    officialQueryButton.classList.remove('loading-state');
                    officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text');
                }
            }, 800);
        });
        
        // 3. 監聽禮廳選擇
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

        // 4. 根據選擇更新禮廳選項
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
                 // 無資料時，自動選擇手動輸入
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 // 設置 HTML 後，觸發 change 確保 UX 提示
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 return; // 完成設定，提前返回
            } else {
                 options = '<option value="">-- 請先選擇日期 --</option>';
            }
            
            hallSelect.innerHTML = options;
        }
        
        // 5. 官方查詢按鈕點擊事件
        if (officialQueryButton) {
            officialQueryButton.addEventListener('click', function(e) {
                e.preventDefault();
                const externalUrl = this.getAttribute('href'); 
                if (externalUrl) {
                    window.open(externalUrl, '_blank');
                }
            });
        }
        
        // 6. 表單提交事件 (導向 LINE)
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault(); 
                
                // 獲取並清理輸入數據
                const senderName = document.getElementById('sender-name')?.value.trim();
                const senderPhone = document.getElementById('sender-phone')?.value.trim();
                const hallValue = funeralHallSelect.value.trim();
                const dateValue = hallDateInput.value.trim();
                const deceasedValue = deceasedNameInput.value.trim();

                // 修正: 檢查表單關鍵資訊是否為空
                if (!hallValue || !dateValue || !deceasedValue || !senderName || !senderPhone) {
                    alert('請務必填寫所有標記 * 的關鍵資訊（殯儀館、日期、逝者姓名、您的姓名與電話），確保訂單準確！');
                    return;
                }
                
                const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
                
                if (confirmed) {
                    console.log('--- 表單數據模擬發送成功 ---');
                    
                    const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                    const lineLink = lineLinkElement?.getAttribute('href'); 
                    
                    alert('訂單已暫存！即將引導至 LINE 專員，請務必聯繫以確認最終訂購細節與付款。');
                    
                    if (lineLink) {
                         window.location.href = lineLink;
                    } else {
                         alert('LINE 連結未設置，請手動聯繫客服。');
                    }
                }
            });
        }
    }
});

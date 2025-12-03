// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // 區塊 1: 隱私與智慧財產保護
    // ===========================================
    document.addEventListener('contextmenu', function(e) {
      console.warn("版權所有，請勿複製內容！"); 
    });

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // 關鍵修正: 統一使用 'active' 類別名稱
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const NAV_ACTIVE_CLASS = 'active'; // <--- 修正後的統一 Class 名稱

    if (mobileMenuBtn && mainNav) {
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle(NAV_ACTIVE_CLASS); // 使用 'active'
            
            // 根據狀態切換按鈕文字/圖標
            mobileMenuBtn.innerHTML = mainNav.classList.contains(NAV_ACTIVE_CLASS) 
                ? '<i class="fas fa-times"></i> 關閉' 
                : '<i class="fas fa-bars"></i> 選單';
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) { // 使用 'active'
                    mainNav.classList.remove(NAV_ACTIVE_CLASS);
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> 選單';
                }
            });
        });
    }

    // 頁面導航高亮
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; 
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref && currentPath && itemHref.includes(currentPath)) {
            item.classList.add('active');
        }
    });


    // ===========================================
    // 區塊 3: 喪禮花禮訂購表單互動邏輯
    // ===========================================

    const orderForm = document.querySelector('.order-form');
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

    if (funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput) {
        
        // 1. 監聽殯儀館選擇
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            officialQueryButton.style.display = (this.value === '台北市立第二殯儀館') ? 'block' : 'none';
            hallDateInput.disabled = (this.value === ''); 
        });

        // 2. 監聽日期選擇 - 加入載入反饋
        hallDateInput.addEventListener('change', function() {
            officialQueryButton.classList.add('loading-state');
            officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';

            setTimeout(() => {
                updateHallOptions();
                officialQueryButton.classList.remove('loading-state');
                const btnText = '<i class="fas fa-search"></i> 臺北市二殯官方檔期查詢';
                officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text') || btnText;
            }, 800);
        });
        
        // 3. 監聽禮廳選擇
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const hallData = mockScheduleDB[funeralHallSelect.value];
            const selectedDate = hallDateInput.value;
            
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') {
                    alert("您已選擇手動輸入，請在下方 '逝者姓名' 欄位填寫正確資訊。");
                }
                return; 
            }
            
            if (hallData && selectedDate) {
                const schedule = hallData[selectedDate];
                const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
                
                if (selectedDeceased) {
                    deceasedNameInput.value = selectedDeceased.deceased;
                } else {
                    deceasedNameInput.value = ''; 
                }
            } else {
                 deceasedNameInput.value = '';
            }
        });

        // 4. 根據選擇更新禮廳選項
        function updateHallOptions() {
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            hallSelect.innerHTML = '<option value="">-- 請手動輸入或選擇禮廳 --</option>'; 
            deceasedNameInput.value = '';

            const dateSchedule = mockScheduleDB[selectedHallName]?.[selectedDate];

            let options = '';
            if (dateSchedule && dateSchedule.length > 0) {
                options = '<option value="">-- 請選擇禮廳 (自動查詢結果) --</option>';
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
            } else if (selectedHallName && selectedDate) {
                 options = '<option value="">-- 今日無資料，請手動輸入禮廳 --</option>';
            }
            
            options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            hallSelect.innerHTML = options;
        }
        
        // 5. 官方查詢按鈕點擊事件 (導向外部連結)
        officialQueryButton.addEventListener('click', function(e) {
            e.preventDefault();
            const externalUrl = this.getAttribute('href'); 
            window.open(externalUrl, '_blank');
        });

        // 6. 表單提交事件 (導向 LINE)
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault(); 

                const senderName = document.getElementById('sender-name')?.value;
                const senderPhone = document.getElementById('sender-phone')?.value;

                if (!funeralHallSelect.value || !hallDateInput.value || !deceasedNameInput.value || !senderName || !senderPhone) {
                    alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                    return;
                }
                
                const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
                
                if (confirmed) {
                    console.log('--- 表單數據模擬發送成功 ---');
                    
                    const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                    const lineLink = lineLinkElement ? lineLinkElement.getAttribute('href') : null;

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

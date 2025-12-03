// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js)
// --------------------------------------------------------

// 修正：將 Document.addEventListener 修正為 document.addEventListener (小寫 d)
document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (反抄襲)
    // 建議：過度的反抄襲會影響正常的網頁使用體驗和 SEO 爬蟲，
    //       故保留 console.warn 提示，但移除影響核心操作的禁用鍵盤/右鍵。
    // ===========================================

    // 保留警示：禁用右鍵點擊，但允許使用者複製。
    document.addEventListener('contextmenu', function(e) {
      // e.preventDefault(); // 移除這行，允許右鍵操作
      console.warn("版權所有，請勿複製內容！"); 
    });

    // 建議：移除 F12/Ctrl+Shift+I 禁用。專業網站應相信內容價值，而不是阻止技術查看。

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // 修正：選單 Class 名稱從 'open' 統一為 CSS 中使用的 'active'。
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const NAV_ACTIVE_CLASS = 'active'; // 統一使用 CSS 中定義的 active Class

    if (mobileMenuBtn && mainNav) {
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            // 修正：使用統一的 NAV_ACTIVE_CLASS
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            
            // 優化：使用三元運算符更簡潔地設定按鈕內容
            mobileMenuBtn.innerHTML = mainNav.classList.contains(NAV_ACTIVE_CLASS) 
                ? '<i class="fas fa-times"></i> 關閉' 
                : '<i class="fas fa-bars"></i> 選單';
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    mainNav.classList.remove(NAV_ACTIVE_CLASS);
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> 選單';
                }
            });
        });
    }

    // 頁面導航高亮 (精確匹配當前頁面)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; 
    const navItems = document.querySelectorAll('#main-nav a');
    
    // 優化：使用 includes() 進行更寬鬆的匹配，適用於 /page 或 /page.html
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        // 確保 itemHref 存在且不為空字串，防止錯誤
        if (itemHref && currentPath && itemHref.includes(currentPath)) {
            item.classList.add('active');
        }
    });


    // ===========================================
    // 區塊 3: 喪禮花禮訂購表單互動邏輯 (強化精確度與使用者反饋)
    // ===========================================

    const orderForm = document.querySelector('.order-form');
    const funeralHallSelect = document.getElementById('funeral-hall-select');
    const hallDateInput = document.getElementById('hall-date-input');
    const hallSelect = document.getElementById('hall-select');
    const deceasedNameInput = document.getElementById('deceased-name-input');
    const officialQueryButton = document.getElementById('official-query-btn');
    
    // --- 模擬殯儀館檔期資料庫 (結構優化，更易讀) ---
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
            // 優化：使用 hallSelect.value = "" 避免覆寫選項
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            // 官方查詢按鈕邏輯
            officialQueryButton.style.display = (this.value === '台北市立第二殯儀館') ? 'block' : 'none';
            
            // 只有未選擇時才禁用日期輸入 (邏輯沒問題)
            hallDateInput.disabled = (this.value === ''); 
        });

        // 2. 監聽日期選擇 - 加入載入反饋
        hallDateInput.addEventListener('change', function() {
            // 視覺反饋：臨時變更按鈕樣式，模擬載入中
            officialQueryButton.classList.add('loading-state');
            officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';

            // 使用 setTimeout 模擬網路查詢延遲，增加真實感 (約 800ms)
            setTimeout(() => {
                updateHallOptions();
                officialQueryButton.classList.remove('loading-state');
                
                // 優化：查詢完成後，按鈕內容恢復
                const btnText = '<i class="fas fa-search"></i> 臺北市二殯官方檔期查詢';
                officialQueryButton.innerHTML = officialQueryButton.getAttribute('data-initial-text') || btnText;
            }, 800);
        });
        
        // 3. 監聽禮廳選擇
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            const hallData = mockScheduleDB[funeralHallSelect.value];
            const selectedDate = hallDateInput.value;
            
            // 優化：處理手動輸入選項，避免將 '手動輸入' 當作禮廳名稱查詢
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
                    // 自動帶入亡者姓名
                    deceasedNameInput.value = selectedDeceased.deceased;
                } else {
                    // 理論上不會發生，但在數據庫不完整時的備用處理
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

            const dateSchedule = mockScheduleDB[selectedHallName]?.[selectedDate]; // 使用可選鏈 (Optional Chaining)

            let options = '';
            if (dateSchedule && dateSchedule.length > 0) {
                options = '<option value="">-- 請選擇禮廳 (自動查詢結果) --</option>';
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
            } else if (selectedHallName && selectedDate) {
                 // 優化：明確告訴用戶無資料
                 options = '<option value="">-- 今日無資料，請手動輸入禮廳 --</option>';
            }
            
            // 最後才加入手動輸入選項
            options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            hallSelect.innerHTML = options;
        }
        
        // 5. 官方查詢按鈕點擊事件 (導向外部連結)
        officialQueryButton.addEventListener('click', function(e) {
            e.preventDefault();
            const externalUrl = this.getAttribute('href'); // 使用 this 更精確
            window.open(externalUrl, '_blank');
        });

        // 6. 表單提交事件 (防止惡意提交並導向 LINE)
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault(); 

                const senderName = document.getElementById('sender-name')?.value;
                const senderPhone = document.getElementById('sender-phone')?.value;

                // 執行基本驗證 (使用可選鏈更安全)
                if (!funeralHallSelect.value || !hallDateInput.value || !deceasedNameInput.value || !senderName || !senderPhone) {
                    alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                    return;
                }
                
                const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
                
                if (confirmed) {
                    console.log('--- 表單數據模擬發送成功 ---');
                    
                    // 取得 LINE 連結 (使用更精確的選擇器)
                    const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                    const lineLink = lineLinkElement ? lineLinkElement.getAttribute('href') : null;

                    alert('訂單已暫存！即將引導至 LINE 專員，請務必聯繫以確認最終訂購細節與付款。');
                    
                    // 導向 LINE 聯繫
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

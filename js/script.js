// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js)
// --------------------------------------------------------

Document.addEventListener('DOMContentLoaded', function() {
    
    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (反抄襲)
    // 提升網站智慧財產保護，防止未經授權的複製。
    // ===========================================

    // 禁用右鍵點擊（阻止查看原始碼選單）
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      console.warn("版權所有，請勿複製內容！"); 
    });

    // 禁用F12鍵及Ctrl+Shift+I/J（阻止開啟開發者工具）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.keyCode === 73 || e.keyCode === 74))) {
            e.preventDefault();
        }
    });

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // 確保行動裝置選單和導航高亮流暢。
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuBtn && mainNav) {
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            // 使用 FontAwesome 圖示或更簡潔的文字提示，增加質感
            mobileMenuBtn.innerHTML = mainNav.classList.contains('open') ? '<i class="fas fa-times"></i> 關閉' : '<i class="fas fa-bars"></i> 選單';
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('open')) {
                    mainNav.classList.remove('open');
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i> 選單';
                }
            });
        });
    }

    // 頁面導航高亮 (精確匹配當前頁面)
    const currentPath = window.location.pathname.split('/').pop() || 'index.html'; // 處理根目錄情況
    const navItems = document.querySelectorAll('#main-nav a');

    navItems.forEach(item => {
        const itemPath = item.getAttribute('href').split('/').pop();
        if (itemPath === currentPath) {
            item.classList.add('active');
        }
    });


    // ===========================================
    // 區塊 3: 喪禮花禮訂購表單互動邏輯
    // 專注於提升殯儀館、日期、禮廳選擇的精確度與使用者反饋。
    // ===========================================

    const orderForm = document.querySelector('.order-form');
    const funeralHallSelect = document.getElementById('funeral-hall-select');
    const hallDateInput = document.getElementById('hall-date-input');
    const hallSelect = document.getElementById('hall-select');
    const deceasedNameInput = document.getElementById('deceased-name-input');
    const officialQueryButton = document.getElementById('official-query-btn');
    
    // --- 模擬殯儀館檔期資料庫 (實際應透過 API 取得) ---
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [
                { hall: '至真二廳', deceased: '李府老夫人 李○○' },
                { hall: '至善二廳', deceased: '張公大人 張○○' }
            ],
            '2025-12-11': [
                { hall: '至真二廳', deceased: '王公大人 王○○' },
                { hall: '至善一廳', deceased: '林公大人 林○○' }
            ],
            '2025-12-12': [] // 模擬當日無告別式
        },
        '台北市立第一殯儀館': { 
            '2025-12-10': [
                { hall: '景行廳', deceased: '陳府老夫人 陳○○' },
            ]
        },
        '新北市立板橋殯儀館': {
            '2025-12-11': [
                { hall: '追遠廳', deceased: '周公大人 周○○' },
            ]
        }
    };
    // -----------------------------------------------

    if (funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput) {
        
        // 初始化狀態 (保持禮廳相關欄位開放，讓用戶可以手動填寫)
        hallDateInput.disabled = (funeralHallSelect.value === ''); 
        
        // 1. 監聽殯儀館選擇
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>';
            deceasedNameInput.value = '';
            
            // 只有選擇「台北市立第二殯儀館」時，顯示官方查詢連結
            officialQueryButton.style.display = (this.value === '台北市立第二殯儀館') ? 'block' : 'none';
            
            // 禁用邏輯反轉：只有未選擇殯儀館時才禁用日期，否則開放讓用戶手動輸入日期
            hallDateInput.disabled = (this.value === ''); 
        });

        // 2. 監聽日期選擇
        // 為增加質感，在查詢時加入視覺反饋
        hallDateInput.addEventListener('change', function() {
            // 視覺反饋：臨時變更按鈕樣式，模擬載入中
            officialQueryButton.classList.add('loading-state');
            officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';

            // 使用 setTimeout 模擬網路查詢延遲，增加真實感 (約 800ms)
            setTimeout(() => {
                updateHallOptions();
                officialQueryButton.classList.remove('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-search"></i> 臺北市二殯官方檔期查詢';
            }, 800);
        });
        
        // 3. 監聽禮廳選擇
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            // 只有當殯儀館在模擬數據庫中有數據時，才自動帶入亡者姓名
            const hallData = mockScheduleDB[funeralHallSelect.value];
            if (selectedHall && hallData) {
                const schedule = hallData[hallDateInput.value];
                const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
                
                if (selectedDeceased) {
                    deceasedNameInput.value = selectedDeceased.deceased;
                } else {
                    // 若禮廳是手動輸入 (不在 mockDB 內)，則清空亡者欄位，提示手動填寫
                    deceasedNameInput.value = ''; 
                    alert("請手動填寫逝者/家屬姓名，確保配送無誤！");
                }
            } else {
                 deceasedNameInput.value = '';
            }
        });

        // 4. 根據選擇更新禮廳選項
        function updateHallOptions() {
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            hallSelect.innerHTML = '<option value="">-- 請手動輸入或選擇禮廳 --</option>'; // 更改提示語
            deceasedNameInput.value = '';

            const dateSchedule = mockScheduleDB[selectedHallName] ? mockScheduleDB[selectedHallName][selectedDate] : null;
            
            if (dateSchedule && dateSchedule.length > 0) {
                let options = '<option value="">-- 請選擇禮廳 (自動查詢結果) --</option>';
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                // 增加一個手動填寫的選項 (讓用戶可以繞過模擬數據)
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
                hallSelect.innerHTML = options;
            } else if (selectedHallName && selectedDate) {
                 // 即使無資料，仍提供一個手動填寫的選項
                 hallSelect.innerHTML = '<option value="">-- 列表中無資料，請手動輸入禮廳 --</option>';
            }
        }
        
        // 5. 官方查詢按鈕點擊事件 (導向外部連結)
        officialQueryButton.addEventListener('click', function(e) {
            e.preventDefault();
            const externalUrl = officialQueryButton.getAttribute('href'); 
            window.open(externalUrl, '_blank');
        });

        // 6. 表單提交事件 (防止惡意提交並導向 LINE)
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault(); // 阻止表單預設提交

                // 執行基本驗證 (可以添加更多欄位驗證)
                if (!funeralHallSelect.value || !hallDateInput.value || !deceasedNameInput.value || !document.getElementById('sender-name').value || !document.getElementById('sender-phone').value) {
                    alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                    return;
                }
                
                const confirmed = confirm('確認送出訂單？請注意：送出後將立即引導您至 LINE 聯繫專員以完成付款與配送細節核對。');
                
                if (confirmed) {
                    // 模擬表單數據發送 (實際應使用 fetch/XMLHttpRequest)
                    console.log('--- 表單數據模擬發送成功 ---');
                    
                    // 取得 LINE 連結 (從 HTML 中的 CTA 獲取，此處假設已填入)
                    const lineLink = document.querySelector('.floating-cta a[title="LINE 即時諮詢"]').getAttribute('href');

                    alert('訂單已暫存！即將引導至 LINE 專員，請務必聯繫以確認最終訂購細節與付款。');
                    
                    // 導向 LINE 聯繫 (高轉化率的關鍵步驟)
                    window.location.href = lineLink;
                }
            });
        }
    }
});

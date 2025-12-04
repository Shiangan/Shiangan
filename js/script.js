// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V2.0
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (移除右鍵禁用，改為柔性提示)
    // ===========================================
    document.addEventListener('copy', function() {
        // 在使用者複製內容時，給予柔性提示
        console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
    });
    // 註解：建議不要禁用 contextmenu，會影響使用者體驗。

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // 關鍵修正: 優化 RWD 選單按鈕邏輯
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const NAV_ACTIVE_CLASS = 'active';

    if (mobileMenuBtn && mainNav) {
        
        // 儲存按鈕的初始圖標和文字，避免重複創建
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            
            // 使用更簡潔的方式切換按鈕狀態
            this.innerHTML = mainNav.classList.contains(NAV_ACTIVE_CLASS) 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
            // 修正：如果使用 CSS 的 visibility 隱藏選單，這裡也要調整
            mainNav.setAttribute('aria-expanded', mainNav.classList.contains(NAV_ACTIVE_CLASS));
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains(NAV_ACTIVE_CLASS)) {
                    mainNav.classList.remove(NAV_ACTIVE_CLASS);
                    mobileMenuBtn.innerHTML = initialBtnHtml; // 恢復初始文字
                    mainNav.setAttribute('aria-expanded', false);
                }
            });
        });
    }

    // 頁面導航高亮 (優化路徑檢查邏輯)
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        // 檢查 href 是否為空，以及是否匹配當前路徑或首頁 ('')
        if (itemHref && currentPath && itemHref.endsWith(currentPath)) {
            item.classList.add(NAV_ACTIVE_CLASS);
        } else if ((!currentPath || currentPath === 'index.html' || currentPath === '') && (itemHref === '/' || itemHref === 'index.html')) {
             item.classList.add(NAV_ACTIVE_CLASS); // 處理首頁匹配
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
    
    // --- 模擬殯儀館檔期資料庫 ---
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [{ hall: '至真二廳', deceased: '李府老夫人 李○○' }, { hall: '至善二廳', deceased: '張公大人 張○○' }],
            '2025-12-11': [{ hall: '至真二廳', deceased: '王公大人 王○○' }, { hall: '至善一廳', deceased: '林公大人 林○○' }],
            '2025-12-12': [] // 模擬無檔期
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
        
        // 儲存按鈕初始文字 (優化載入邏輯)
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
        }
        
        // 1. 監聽殯儀館選擇
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>'; 
            deceasedNameInput.value = '';
            
            // 使用 ternary operator 簡化判斷
            const isTaipei2 = (this.value === '台北市立第二殯儀館');
            if (officialQueryButton) {
                officialQueryButton.style.display = isTaipei2 ? 'block' : 'none';
            }
            hallDateInput.disabled = (this.value === ''); 
        });

        // 2. 監聽日期選擇 - 加入載入反饋
        hallDateInput.addEventListener('change', function() {
            if (!this.value) return; // 如果日期為空，不執行查詢
            
            if (officialQueryButton) {
                officialQueryButton.classList.add('loading-state');
                officialQueryButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在查詢檔期...';
            }

            // 模擬異步查詢
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
            
            // 處理手動輸入或空值
            if (selectedHall === '' || selectedHall === '手動輸入') {
                deceasedNameInput.value = '';
                if (selectedHall === '手動輸入') {
                    // 修正: 使用更柔性的訊息提示 (或直接讓用戶填寫，避免彈窗中斷流程)
                    // console.info("已選擇手動輸入，請在下方欄位填寫逝者姓名。");
                }
                deceasedNameInput.focus(); // 將焦點導向逝者姓名，提升 UX
                return; 
            }
            
            // 查詢逝者姓名
            const schedule = mockScheduleDB[selectedHallName]?.[selectedDate];
            const selectedDeceased = schedule ? schedule.find(item => item.hall === selectedHall) : null;
            
            // 防禦性檢查
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
            
            hallSelect.innerHTML = ''; // 清空選項
            deceasedNameInput.value = '';

            const dateSchedule = mockScheduleDB[selectedHallName]?.[selectedDate];

            let options = '<option value="">-- 請選擇或手動輸入禮廳 --</option>';
            
            if (dateSchedule && dateSchedule.length > 0) {
                dateSchedule.forEach(item => {
                    options += `<option value="${item.hall}">${item.hall}</option>`;
                });
                // 添加列表找不到的選項
                options += `<option value="手動輸入">-- 列表中找不到？請手動輸入禮廳 --</option>`;
            } else if (selectedHallName && selectedDate) {
                 // 修正 UX: 無資料時，直接引導至手動輸入
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 // 觸發一次 change 事件，自動清空逝者姓名並提示
                 hallSelect.value = '手動輸入';
            } else {
                 options = '<option value="">-- 請先選擇日期 --</option>';
            }
            
            hallSelect.innerHTML = options;
        }
        
        // 5. 官方查詢按鈕點擊事件 (導向外部連結)
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
                    const lineLink = lineLinkElement?.getAttribute('href'); // 使用可選鏈
                    
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

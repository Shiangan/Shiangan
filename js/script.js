document.addEventListener('DOMContentLoaded', function() {
    
    // -------------------------------------------
    // [反抄襲] 禁用右鍵點擊與 F12 鍵
    // -------------------------------------------

    // 禁用右鍵點擊（阻止查看原始碼選單）
    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      // alert("版權所有，請勿複製！"); 
    });

    // 禁用F12鍵（阻止開啟開發者工具）
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12') {
            e.preventDefault();
        }
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) {
            e.preventDefault();
        }
    });

    // -------------------------------------------
    // [原有功能] 行動選單邏輯與頁面高亮
    // -------------------------------------------
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuBtn && mainNav) {
        // 切換選單
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            mobileMenuBtn.textContent = mainNav.classList.contains('open') ? '關閉' : '選單';
        });
        
        // 點擊選單項目後自動關閉
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (mainNav.classList.contains('open')) {
                    mainNav.classList.remove('open');
                    mobileMenuBtn.textContent = '選單';
                }
            });
        });
    }

    // 頁面導航高亮
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('#main-nav a');

    navItems.forEach(item => {
        const itemPath = item.getAttribute('href').split('/').pop();
        if (itemPath === currentPath) {
            item.classList.add('active');
        } else if (currentPath === '' && itemPath === 'index.html') {
            item.classList.add('active');
        }
    });

    
    // -------------------------------------------
    // [花籃訂購頁面] 殯儀館檔期模擬 (已調整為以二殯為中心)
    // -------------------------------------------

    const funeralHallSelect = document.getElementById('funeral-hall-select');
    const hallDateInput = document.getElementById('hall-date-input');
    const hallSelect = document.getElementById('hall-select');
    const deceasedNameInput = document.getElementById('deceased-name-input');
    const officialQueryButton = document.getElementById('official-query-btn');
    
    // 模擬殯儀館檔期資料庫 (以二殯數據為範例)
    const mockScheduleDB = {
        '台北市立第二殯儀館': {
            '2025-12-10': [
                { hall: '至真二廳', deceased: '李府老夫人 李○○' },
                { hall: '至善二廳', deceased: '張公大人 張○○' }
            ],
            '2025-12-11': [
                { hall: '至真二廳', deceased: '王公大人 王○○' },
            ]
        },
        '台北市立第一殯儀館': { /* 備用數據 */
            '2025-12-10': [
                { hall: '景行廳', deceased: '陳府老夫人 陳○○' },
            ]
        }
    };

    if (funeralHallSelect && hallDateInput && hallSelect && deceasedNameInput && officialQueryButton) {
        
        // 初始化狀態
        hallSelect.disabled = true;
        hallDateInput.disabled = true;
        deceasedNameInput.disabled = true;
        officialQueryButton.style.display = 'none'; // 隱藏按鈕

        // 監聽殯儀館選擇
        funeralHallSelect.addEventListener('change', function() {
            hallDateInput.value = '';
            hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>';
            deceasedNameInput.value = '';
            
            const isTaipeiHall = (this.value === '台北市立第二殯儀館' || this.value === '台北市立第一殯儀館');
            
            hallDateInput.disabled = (this.value === ''); 
            hallSelect.disabled = true;
            deceasedNameInput.disabled = true;

            // 顯示或隱藏官方查詢按鈕
            officialQueryButton.style.display = (this.value === '台北市立第二殯儀館') ? 'block' : 'none';
        });

        // 監聽日期選擇
        hallDateInput.addEventListener('change', updateHallOptions);
        
        // 監聽禮廳選擇
        hallSelect.addEventListener('change', function() {
            const selectedHall = this.value;
            if (selectedHall) {
                const schedule = mockScheduleDB[funeralHallSelect.value][hallDateInput.value];
                const selectedDeceased = schedule.find(item => item.hall === selectedHall);
                if (selectedDeceased) {
                    deceasedNameInput.value = selectedDeceased.deceased;
                }
            } else {
                 deceasedNameInput.value = '';
            }
        });

        // 根據殯儀館和日期更新禮廳選項
        function updateHallOptions() {
            const selectedHallName = funeralHallSelect.value;
            const selectedDate = hallDateInput.value;
            
            hallSelect.innerHTML = '';
            deceasedNameInput.value = '';
            hallSelect.disabled = true;
            deceasedNameInput.disabled = true;

            if (selectedHallName && selectedDate) {
                const dateSchedule = mockScheduleDB[selectedHallName][selectedDate];
                
                if (dateSchedule && dateSchedule.length > 0) {
                    let options = '<option value="">-- 請選擇禮廳 --</option>';
                    dateSchedule.forEach(item => {
                        options += `<option value="${item.hall}">${item.hall}</option>`;
                    });
                    hallSelect.innerHTML = options;
                    hallSelect.disabled = false;
                    deceasedNameInput.disabled = false;
                } else {
                    hallSelect.innerHTML = '<option value="">-- 當日無告別式資訊 --</option>';
                }
            } else {
                hallSelect.innerHTML = '<option value="">-- 請先選擇日期 --</option>';
            }
        }
        
        // 官方查詢按鈕點擊事件 (導向外部連結)
        officialQueryButton.addEventListener('click', function() {
            // 替換為二殯實際的殯葬資訊查詢網址
            const externalUrl = 'https://www.tpa.gov.tw/News_Content.aspx?n=302&s=1345'; 
            window.open(externalUrl, '_blank');
        });
    }
});

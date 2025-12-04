// --------------------------------------------------------
// 祥安生命有限公司 - 核心腳本 (js/script.js) - 最終修正版 V3.0 (新增 Accordion 與 LINE 訊息編碼)
// --------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {

    // ===========================================
    // 區塊 1: 隱私與智慧財產保護 (不變)
    // ===========================================
    document.addEventListener('copy', function() {
        console.info("© 版權所有 祥安生命有限公司。請尊重智慧財產權。");
    });

    // ===========================================
    // 區塊 2: 導航功能與使用者介面 (UX)
    // ===========================================
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const NAV_ACTIVE_CLASS = 'active'; 

    if (mobileMenuBtn && mainNav) {
        
        const initialBtnHtml = mobileMenuBtn.innerHTML;
        
        // 行動選單切換邏輯
        mobileMenuBtn.addEventListener('click', function() {
            mainNav.classList.toggle(NAV_ACTIVE_CLASS);
            const isActive = mainNav.classList.contains(NAV_ACTIVE_CLASS);
            
            this.innerHTML = isActive 
                ? '<i class="fas fa-times"></i> 關閉' 
                : initialBtnHtml;
            
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

    // 頁面導航高亮
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('#main-nav a');
    
    navItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        
        if (itemHref && currentPath && itemHref.endsWith(currentPath)) {
            item.classList.add(NAV_ACTIVE_CLASS);
        } else if ((!currentPath || currentPath === 'index.html' || currentPath === '') && (itemHref === 'index.html')) {
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
        
        if(officialQueryButton) {
            officialQueryButton.setAttribute('data-initial-text', officialQueryButton.innerHTML);
        }
        
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
                 options = `<option value="">-- 今日無公開檔期資料 --</option>`;
                 options += `<option value="手動輸入" selected>-- 請手動輸入禮廳 --</option>`;
                 hallSelect.innerHTML = options;
                 hallSelect.value = '手動輸入';
                 return; 
            } else {
                 options = '<option value="">-- 請先選擇日期 --</option>';
            }
            
            hallSelect.innerHTML = options;
        }
        
        if (officialQueryButton) {
            officialQueryButton.addEventListener('click', function(e) {
                e.preventDefault();
                const externalUrl = this.getAttribute('href'); 
                if (externalUrl) {
                    window.open(externalUrl, '_blank');
                }
            });
        }
        
        // 關鍵優化：將表單數據編碼至 LINE 訊息
        if (orderForm) {
            orderForm.addEventListener('submit', function(e) {
                e.preventDefault(); 
                
                const senderName = document.getElementById('sender-name')?.value.trim();
                const senderPhone = document.getElementById('sender-phone')?.value.trim();
                const hallValue = funeralHallSelect.value.trim();
                const dateValue = hallDateInput.value.trim();
                const deceasedValue = deceasedNameInput.value.trim();
                const product = document.getElementById('product-select')?.value.trim() || '未選擇花禮/罐頭塔';
                const remark = document.getElementById('remark')?.value.trim() || '無';


                if (!hallValue || !dateValue || !deceasedValue || !senderName || !senderPhone) {
                    alert('請務必填寫所有標記 * 的關鍵資訊，確保訂單準確！');
                    return;
                }
                
                const confirmed = confirm('確認送出訂單？請注意：送出後將引導您至 LINE 聯繫專員，以完成付款與配送細節核對。');
                
                if (confirmed) {
                    
                    // 1. 建立預設訊息文本
                    const lineMessage = `【網站花禮訂單】\n` + 
                                        `* 訂購人姓名：${senderName}\n` +
                                        `* 訂購人電話：${senderPhone}\n` +
                                        `* 訂購產品：${product}\n` +
                                        `\n--- 告別式資訊 ---\n` +
                                        `* 殯儀館：${hallValue}\n` +
                                        `* 告別式日期：${dateValue}\n` +
                                        `* 逝者姓名：${deceasedValue}\n` +
                                        `* 備註：${remark}`;
                    
                    // 2. 獲取 LINE 連結
                    const lineLinkElement = document.querySelector('.floating-cta a[href*="line"]');
                    let lineLink = lineLinkElement?.getAttribute('href'); 
                    
                    // 3. 編碼訊息並附加到 LINE 連結
                    const encodedMessage = encodeURIComponent(lineMessage);
                    
                    if (lineLink && lineLink.includes('line.me/ti/p')) {
                         lineLink = lineLink.replace('?', `?text=${encodedMessage}&`); 
                         
                         alert('訂單已暫存！即將引導至 LINE 專員，請將預設訊息發送給我們，以確認最終訂購細節與付款。');
                         window.location.href = lineLink;

                    } else {
                         alert('LINE 連結未設置或格式不正確，請手動複製以下資訊並聯繫客服：\n\n' + lineMessage);
                    }
                }
            });
        }
    }
    
    // ===========================================
    // 區塊 4: 手風琴 (Accordion) 功能 (for service.html)
    // ===========================================
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;
            const content = header.nextElementSibling;
            
            // 關閉所有非當前項目的內容
            document.querySelectorAll('.accordion-item').forEach(item => {
                if (item !== currentItem && item.classList.contains('active')) {
                    item.classList.remove('active');
                    item.querySelector('.accordion-content').style.maxHeight = null;
                }
            });

            // 切換當前項目的狀態
            currentItem.classList.toggle('active');

            if (currentItem.classList.contains('active')) {
                // 展開內容：設定高度為內容的實際高度 (scrollHeight)
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                // 收合內容：高度設為 null
                content.style.maxHeight = null;
            }
        });
    });

    // 初始載入時，預設展開第一個項目
    const firstItem = document.querySelector('.accordion-item:first-child');
    if (firstItem && window.location.pathname.includes('services.html')) {
        firstItem.classList.add('active');
        // 確保內容已渲染才能計算 scrollHeight
        setTimeout(() => {
             const content = firstItem.querySelector('.accordion-content');
             if (content) {
                 content.style.maxHeight = content.scrollHeight + "px";
             }
        }, 0);
    }
});

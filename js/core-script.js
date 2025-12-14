'use strict';

/**
 * 處理 Tab 內容切換的函數
 * @param {string} tabId - 要開啟的 Tab ID (例如: 'comparison', 'united')
 */
window.openPlanTab = function(tabId) {
    // 🌟 優化: 使用更有效率的 querySelectorAll 
    const contents = document.querySelectorAll('.plan-tab-content');
    const buttons = document.querySelectorAll('.tab-button'); // 🌟 優化: 鎖定更精確的類名

    // 1. 隱藏所有內容 & 移除活躍狀態
    contents.forEach(content => {
        content.style.display = 'none';
    });
    buttons.forEach(button => {
        button.classList.remove('active');
        button.setAttribute('aria-selected', 'false');
    });

    // 2. 顯示目標內容區塊
    const targetContent = document.getElementById('content-' + tabId);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // 3. 滾動視窗到內容頂部 (考慮 Sticky Header)
        const directoryElement = document.querySelector('.plan-directory');
        const mainElement = document.querySelector('.plan-page-container');
        
        const directoryHeight = directoryElement ? directoryElement.offsetHeight : 100;
        const targetScrollPosition = mainElement.offsetTop - directoryHeight;

        window.scrollTo({
            top: targetScrollPosition > 0 ? targetScrollPosition : 0,
            behavior: 'smooth'
        });
    }

    // 4. 設置目標 Tab 按鈕為 'active'
    const targetButton = document.getElementById('tab-' + tabId);
    if (targetButton) {
        targetButton.classList.add('active');
        targetButton.setAttribute('aria-selected', 'true');
    }
};


/**
 * 處理 Modal 燈箱開關的函數
 */
window.openModal = function(modalId) {
    const modal = document.getElementById('modal-' + modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // 設置焦點到 Modal 內部 (例如關閉按鈕)
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
};

window.closeModal = function() {
    // 找到所有 active 的 modal
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    activeModals.forEach(modal => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });

    document.body.style.overflow = ''; // 解鎖背景滾動
};

// 點擊 Modal 外部時關閉
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        window.closeModal();
    }
});

// ESC 鍵關閉 Modal
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
        window.closeModal();
    }
});

// 初始化：確保頁面載入時 '服務比較' Tab 為活躍狀態
document.addEventListener('DOMContentLoaded', function() {
    // 確保頁面載入時 Tab 處於正確狀態
    window.openPlanTab('comparison'); 
    
    // 更新年份
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

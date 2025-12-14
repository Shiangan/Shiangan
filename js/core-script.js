'use strict';

// ===============================================
// 1. Tab 內容切換函數
// ===============================================

/**
 * 處理 Tab 內容切換的函數
 * @param {string} tabId - 要開啟的 Tab ID (例如: 'overview', 'united', 'fine', 'honor', 'religious')
 */
window.openPlanTab = function(tabId) {
    // 獲取所有內容區塊和按鈕
    const contents = document.querySelectorAll('.plan-tab-content');
    const buttons = document.querySelectorAll('.plan-tabs .tab-button'); // 更精確鎖定按鈕

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
    const targetButton = document.getElementById('tab-' + tabId);

    if (targetContent && targetButton) {
        targetContent.style.display = 'block';

        // 3. 滾動視窗到內容頂部 (考慮 Sticky Header 的補償)
        const directoryElement = document.querySelector('.plan-directory');
        const mainElement = document.querySelector('.plan-page-container');
        
        // 假設 .plan-directory 是粘性標題，計算其高度作為滾動補償
        const HEADER_HEIGHT_COMPENSATION = directoryElement ? directoryElement.offsetHeight + 10 : 100; // 額外加 10px 緩衝
        
        // 計算目標捲動位置：主容器頂部 - 粘性標題高度
        let targetScrollPosition = mainElement.offsetTop - HEADER_HEIGHT_COMPENSATION;
        
        // 確保捲動位置不小於 0
        targetScrollPosition = Math.max(0, targetScrollPosition);

        window.scrollTo({
            top: targetScrollPosition,
            behavior: 'smooth'
        });

        // 4. 設置目標 Tab 按鈕為 'active'
        targetButton.classList.add('active');
        targetButton.setAttribute('aria-selected', 'true');
    }
};


// ===============================================
// 2. Modal 燈箱控制函數
// ===============================================

/**
 * 處理 Modal 燈箱開啟的函數
 * @param {string} modalId - Modal ID 的後綴 (例如: 'reference-quote' 对应 'modal-reference-quote')
 */
window.openModal = function(modalId) {
    const modal = document.getElementById('modal-' + modalId);
    if (modal) {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // 鎖定背景滾動
        
        // 設置焦點到 Modal 內部 (關閉按鈕，便於無障礙操作)
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
};

/**
 * 處理 Modal 燈箱關閉的函數
 */
window.closeModal = function() {
    // 找到所有 active 的 modal
    const activeModals = document.querySelectorAll('.modal-overlay.active');
    activeModals.forEach(modal => {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
    });

    document.body.style.overflow = ''; // 解鎖背景滾動
};

// ===============================================
// 3. 全域事件監聽 (自動關閉)
// ===============================================

// 點擊 Modal 外部時關閉
document.addEventListener('click', function(e) {
    // 檢查點擊的目標是否是 Modal 的 Overlay 區塊本身
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

// ===============================================
// 4. 初始化函數
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 初始化 Tab 狀態：確保頁面載入時 '方案總覽比較' Tab 為活躍狀態
    // 原始 HTML 中 Tab ID 為 'tab-overview'，內容 ID 為 'content-overview'
    window.openPlanTab('overview'); 
    
    // 2. 更新頁腳年份
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

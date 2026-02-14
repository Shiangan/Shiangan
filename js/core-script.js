'use strict';

/**
 * 核心 JavaScript 邏輯：處理 Tab 切換、Modal 開啟/關閉及頁面初始化
 * 考慮了無障礙設計 (A11Y) 和使用者體驗 (UX)
 */

// ===============================================
// 1. Tab 內容切換函數
// ===============================================

// 使用 IIFE (立即調用函數表達式) 隔離變量，確保模塊化
(function() {
    /**
     * 處理 Tab 內容切換的函數
     * @param {string} tabId - 要開啟的 Tab ID (例如: 'overview')
     * @param {boolean} [scrollToContent=true] - 是否需要平滑滾動到內容區塊
     */
    window.openPlanTab = function(tabId, scrollToContent = true) {
        // 獲取所有相關元素
        const contents = document.querySelectorAll('.plan-tab-content');
        // 使用 data attribute 選擇器，與 HTML 中的 data-plan-id 呼應
        const buttons = document.querySelectorAll('.plan-tabs .tab-button'); 

        // 1. 隱藏所有內容 & 移除活躍狀態
        buttons.forEach(button => {
            // 使用 data-plan-id 快速比對
            if (button.dataset.planId === tabId) {
                // 找到目標按鈕後，不需要在迴圈內操作，稍後處理
            } else {
                button.classList.remove('active');
                button.setAttribute('aria-selected', 'false');
            }
        });
        
        contents.forEach(content => {
            content.style.display = 'none';
        });

        // 2. 設置目標內容區塊和按鈕為 'active'
        const targetContent = document.getElementById('content-' + tabId);
        const targetButton = document.getElementById('tab-' + tabId);

        if (targetContent && targetButton) {
            targetContent.style.display = 'block';
            targetButton.classList.add('active');
            targetButton.setAttribute('aria-selected', 'true');
            
            // A11Y 優化：將焦點移動到新內容的主要標題 (H2)
            const targetHeading = targetContent.querySelector('h2');
            if (targetHeading) {
                // 使 H2 可獲取焦點，以便鍵盤使用者快速跳轉
                targetHeading.setAttribute('tabindex', '-1'); 
                targetHeading.focus();
            }

            // 3. 滾動視窗到內容頂部
            if (scrollToContent) {
                const directoryElement = document.querySelector('.plan-directory');
                const mainElement = document.querySelector('.plan-page-container');
                
                // 假設 .plan-directory 是粘性標題
                const HEADER_HEIGHT_COMPENSATION = directoryElement ? directoryElement.offsetHeight + 15 : 100; // 增加緩衝

                let targetScrollPosition = mainElement.offsetTop - HEADER_HEIGHT_COMPENSATION;
                
                window.scrollTo({
                    top: Math.max(0, targetScrollPosition),
                    behavior: 'smooth'
                });
            }
        }
    };
})();


// ===============================================
// 2. Modal 燈箱控制函數
// ===============================================

(function() {
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
            // A11Y: 設置 Modal 內容的 role="document" 或 role="dialog" 確保輔助技術正確識別
            modal.setAttribute('role', 'dialog');
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
            // A11Y: 移除焦點，將焦點還給觸發的元素 (如果需要的話，可以更精確地實現)
        });

        document.body.style.overflow = ''; // 解鎖背景滾動
    };
})();


// ===============================================
// 3. 全域事件監聽
// ===============================================

document.addEventListener('click', function(e) {
    // 點擊 Modal 外部時關閉
    if (e.target.classList.contains('modal-overlay')) {
        window.closeModal();
    }
    
    // 也可以通過監聽 .tab-button 的點擊事件來取代 HTML 中的 onclick 屬性 (更好解耦)
    // const tabButton = e.target.closest('.tab-button');
    // if (tabButton && tabButton.dataset.planId) {
    //     window.openPlanTab(tabButton.dataset.planId);
    // }
    
    // 也可以通過監聽 CTA 按鈕的點擊事件來取代 HTML 中的 onclick 屬性 (更好解耦)
    // const modalButton = e.target.closest('[data-modal-id]');
    // if (modalButton && modalButton.dataset.modalId) {
    //     window.openModal(modalButton.dataset.modalId);
    // }
});

// ESC 鍵關閉 Modal
document.addEventListener('keydown', function(e) {
    if (e.key === "Escape" && document.querySelector('.modal-overlay.active')) {
        window.closeModal();
    }
});

// ===============================================
// 4. 初始化函數
// ===============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // 1. 智慧初始化 Tab 狀態
    const initialContent = document.getElementById('content-overview');
    const initialButton = document.getElementById('tab-overview');
    
    // 只有在 HTML 結構未正確設置時，才調用 openPlanTab()
    // 避免在頁面載入時，不必要的 display 設置和滾動 (因為 HTML 已經設置了 'overview' 應該顯示)
    if (initialContent && initialButton && 
        (initialContent.style.display !== 'block' || !initialButton.classList.contains('active'))) {
        
        // 使用 scrollToContent = false，避免頁面剛載入就執行滾動
        window.openPlanTab('overview', false); 
    }
    
    // A11Y 優化：移除 Tab 內容標題的 tabindex，除非它被選中
    document.querySelectorAll('.plan-tab-content h2').forEach(h2 => {
        h2.removeAttribute('tabindex');
    });

    // 2. 更新頁腳年份
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

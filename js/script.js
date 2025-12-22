/**
 * 祥安生命 官方網站核心腳本 V6.5 (2025 終極整合版)
 * 整合內容：手機選單防呆、2025 閏月日期校正、勞保試算、UI 交互優化
 */

'use strict';

(function() {
    // --- 1. 導覽系統與 UI 控制 ---
    const DOM = {
        header: document.querySelector('.main-header'),
        menuToggle: document.getElementById('menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        navOverlay: document.getElementById('navOverlay'), // 確保 HTML 有這個 div
        dropdowns: document.querySelectorAll('.has-dropdown'),
        yearSpan: document.getElementById('current-year')
    };

    // 切換選單狀態
    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !DOM.mainNav.classList.contains('active');
        
        DOM.mainNav.classList.toggle('active', isOpen);
        DOM.menuToggle.classList.toggle('active', isOpen);
        DOM.menuToggle.setAttribute('aria-expanded', isOpen);
        
        if (DOM.navOverlay) {
            DOM.navOverlay.classList.toggle('active', isOpen);
        }
        
        // 鎖定身體捲動，防止選單開啟時後方頁面滑動
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // 監聽漢堡按鈕
    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // 點擊 Overlay 或選單外區域自動關閉
    document.addEventListener('click', (e) => {
        if (DOM.mainNav.classList.contains('active') && !DOM.mainNav.contains(e.target)) {
            toggleMenu(true);
        }
    });

    // 「兩段式點擊」：手機版展開子選單邏輯
// 手機版子選單展開邏輯
DOM.dropdowns.forEach(li => {
    const link = li.querySelector('.dropdown-toggle');
    link?.addEventListener('click', function(e) {
        if (window.innerWidth <= 991) {
            // 檢查是否已經開啟，若無則展開並攔截跳轉
            if (!li.classList.contains('active')) {
                e.preventDefault();
                // 關閉其他已展開的子選單 (Accordion 效果)
                DOM.dropdowns.forEach(other => {
                    if (other !== li) other.classList.remove('active');
                });
                li.classList.add('active');
            }
        }
    });
});


    // 滾動時 Header 變色
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            DOM.header?.classList.add('scrolled');
        } else {
            DOM.header?.classList.remove('scrolled');
        }
    }, { passive: true });

    // --- 2. 2025 對年計算機 (修正日期溢位) ---
    window.calculateDuinian = function() {
        const input = document.getElementById('dateOfDeath')?.value;
        const resArea = document.getElementById('resultOutput');
        if (!input || !resArea) return;

        let [y, m, d] = input.split('-').map(Number);
        let dy = y + 1;
        let dm = m;
        let note = "一般對年估算：往生後的一週年。";

        // 2025 閏六月傳統習俗校正
        if (y === 2025 && m > 6) {
            dm -= 1;
            if (dm <= 0) { dm = 12; dy -= 1; }
            note = "⚠️ 偵測到 2025 閏六月，按傳統習俗對年需「提前一個月」計算。";
        }

        // 處理日期溢位 (例如 2/31 自動轉為 2/28)
        let target = new Date(dy, dm - 1, d);
        if (target.getMonth() !== dm - 1) {
            target = new Date(dy, dm, 0); 
        }

        resArea.innerHTML = `
            <div class="res-box" style="border-left:5px solid #bfa15d; padding:15px; background:#f9f9f9; margin-top:15px;">
                <p style="margin:0; font-size:0.9rem; color:#666;">${note}</p>
                <h3 style="color:#bfa15d; margin:10px 0;">建議對年日期：${target.getFullYear()}年${target.getMonth()+1}月${target.getDate()}日</h3>
                <small style="color:#999;">*精確日子建議仍須由禮儀師核對農民曆。*</small>
            </div>
        `;
        resArea.classList.remove('hidden');
    };

    // --- 3. 勞保喪葬給付試算 ---
    window.calculateLabor = function() {
        const salary = parseFloat(document.getElementById('avgSalary')?.value);
        const survivor = document.getElementById('hasSurvivor')?.value; // yes/no
        const resArea = document.getElementById('laborResult');
        if (!salary || !resArea) return;

        // 自動套用目前勞保上限與下限級距 (2025 參考值)
        const finalSalary = Math.min(Math.max(salary, 28590), 45800);
        const months = (survivor === 'yes') ? 5 : 10;
        const total = finalSalary * months;

        resArea.innerHTML = `
            <div style="margin-top:15px; padding:15px; background:#fffbe6; border:1px solid #ffe58f; border-radius:4px;">
                <p style="margin:0; color:#856404;">預估最高給付金額：</p>
                <strong style="font-size:1.5rem; color:#d48806;">NT$ ${total.toLocaleString()}</strong>
                <p style="font-size:0.8rem; color:#999; margin-top:5px;">(依月投保薪資級距 ${finalSalary.toLocaleString()} 元估算)</p>
            </div>
        `;
    };

    // 版權年份與頁面初始化
    if (DOM.yearSpan) DOM.yearSpan.textContent = new Date().getFullYear();
    document.body.classList.remove('js-loading');

    console.log("%c祥安生命 V6.5 腳本已完成整合部署", "color: #bfa15d; font-weight: bold;");
})();

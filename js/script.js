/**
 * 祥安生命 官方網站核心腳本 V6.5 (2025 終極整合版)
 * 修正內容：手機選單點擊、閏月日期溢位、試算機邏輯
 */

'use strict';

(function() {
    // --- 1. 導覽系統核心 ---
    const DOM = {
        header: document.querySelector('.main-header'),
        menuToggle: document.getElementById('menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        dropdowns: document.querySelectorAll('.has-dropdown'),
        yearSpan: document.getElementById('current-year')
    };

    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !DOM.mainNav.classList.contains('active');
        DOM.mainNav.classList.toggle('active', isOpen);
        DOM.menuToggle.classList.toggle('active', isOpen);
        DOM.menuToggle.setAttribute('aria-expanded', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : ''; // 避免選單打開時後方滾動
    };

    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', () => toggleMenu());
    }

    // 「兩段式點擊」：手機版點擊母選單先展開，再點一次才跳轉
    DOM.dropdowns.forEach(li => {
        const toggleBtn = li.querySelector('.dropdown-toggle');
        toggleBtn?.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                if (!li.classList.contains('active')) {
                    e.preventDefault(); // 攔截跳轉
                    DOM.dropdowns.forEach(item => item.classList.remove('active')); // 關閉其他
                    li.classList.add('active'); // 展開當前
                }
            }
        });
    });

    // 捲動效果
    window.addEventListener('scroll', () => {
        DOM.header?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // --- 2. 2025 對年計算機 (修正日期溢位問題) ---
    window.calculateDuinian = function() {
        const input = document.getElementById('dateOfDeath')?.value;
        const resArea = document.getElementById('resultOutput');
        if (!input || !resArea) return alert('請選擇日期');

        let [y, m, d] = input.split('-').map(Number);
        let dy = y + 1;
        let dm = m;
        let note = "一般對年估算：往生後的一週年（對年）。";

        // 2025 閏六月傳統習俗校正
        if (y === 2025 && m > 6) {
            dm -= 1;
            if (dm <= 0) { dm = 12; dy -= 1; }
            note = "⚠️ 偵測到 2025 閏六月，按傳統習俗對年需「提前一個月」計算。";
        }

        // 處理特殊日期（如 2/31 變 2/28）
        let target = new Date(dy, dm - 1, d);
        if (target.getMonth() !== dm - 1) {
            target = new Date(dy, dm, 0); // 取該月最後一天
        }

        resArea.innerHTML = `
            <div class="res-box" style="border-left:5px solid #bfa15d; padding:15px; background:#f4f4f4;">
                <p>${note}</p>
                <h3 style="color:#bfa15d; margin:5px 0;">建議對年日期：${target.getFullYear()}年${target.getMonth()+1}月${target.getDate()}日</h3>
                <small style="color:#888;">*此為自動估算，精確日期請與禮儀師核對農民曆。*</small>
            </div>
        `;
        resArea.classList.remove('hidden');
    };

    // --- 3. 勞保喪葬給付試算 ---
    window.calculateLabor = function() {
        const salary = parseFloat(document.getElementById('avgSalary')?.value);
        const survivor = document.getElementById('hasSurvivor')?.value;
        const resArea = document.getElementById('laborResult');
        if (!salary || !resArea) return;

        const finalSalary = Math.min(Math.max(salary, 27470), 45800);
        const months = (survivor === 'yes') ? 5 : 10;
        const total = finalSalary * months;

        resArea.innerHTML = `
            <div style="margin-top:10px; padding:15px; background:#fffbe6; border:1px solid #ffe58f;">
                <p style="margin:0;">預估給付：<strong style="font-size:1.4rem; color:#d48806;">NT$ ${total.toLocaleString()}</strong></p>
                <p style="font-size:0.8rem; color:#888; margin:5px 0 0;">(依投保薪資級距 ${finalSalary.toLocaleString()} 元計算)</p>
            </div>
        `;
    };

    // 版權年份自動更新
    if (DOM.yearSpan) DOM.yearSpan.textContent = new Date().getFullYear();

    console.log("祥安生命 V6.5 核心載入完畢");
})();

/**
 * 祥安生命 官方網站核心腳本 V7.0 (2025 終極修正版)
 * 整合：跨頁平滑捲動、手機選單防呆、2025 閏月校正、勞保試算
 */

'use strict';

(function() {
    // --- 1. DOM 元素初始化 ---
    const DOM = {
        header: document.querySelector('.main-header'),
        menuToggle: document.getElementById('menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        navOverlay: document.getElementById('navOverlay'),
        dropdowns: document.querySelectorAll('.has-dropdown'),
        yearSpan: document.getElementById('current-year'),
        headerHeight: 70 // 預設高度，用於捲動補償
    };

    // --- 2. 導覽系統邏輯 ---

    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !DOM.mainNav.classList.contains('active');
        DOM.mainNav.classList.toggle('active', isOpen);
        DOM.menuToggle.classList.toggle('active', isOpen);
        DOM.menuToggle.setAttribute('aria-expanded', isOpen);
        if (DOM.navOverlay) DOM.navOverlay.classList.toggle('active', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // 點擊遮罩或非選單區域自動關閉
    document.addEventListener('click', (e) => {
        if (DOM.mainNav.classList.contains('active') && !DOM.mainNav.contains(e.target)) {
            toggleMenu(true);
        }
    });

    // 手機版子選單展開邏輯 (兩段式點擊)
    DOM.dropdowns.forEach(li => {
        const link = li.querySelector('.dropdown-toggle');
        link?.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                // 如果是帶有錨點的連結且未被啟動
                if (!li.classList.contains('active')) {
                    e.preventDefault();
                    DOM.dropdowns.forEach(other => {
                        if (other !== li) other.classList.remove('active');
                    });
                    li.classList.add('active');
                }
                // 第二次點擊則放行，執行 a href 的路徑跳轉
            }
        });
    });

    // 平滑捲動與自動關閉選單 (處理內部連結)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === "#" || targetId === "#hero") return; // 讓首頁回頂端正常運作

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                toggleMenu(true); // 捲動前先關閉手機選單

                const offsetPosition = targetElement.offsetTop - DOM.headerHeight;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 滾動監聽：Header 變色
    window.addEventListener('scroll', () => {
        DOM.header?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    // --- 3. 2025 對年計算機 (修正日期溢位) ---
    window.calculateDuinian = function() {
        const input = document.getElementById('dateOfDeath')?.value;
        const resArea = document.getElementById('resultOutput');
        if (!input || !resArea) return;

        let [y, m, d] = input.split('-').map(Number);
        let dy = y + 1;
        let dm = m;
        let note = "一般對年估算：往生後的一週年。";

        // 2025 閏六月習俗修正
        if (y === 2025 && m > 6) {
            dm -= 1;
            if (dm <= 0) { dm = 12; dy -= 1; }
            note = "⚠️ 偵測到 2025 閏六月，按傳統習俗對年需「提前一個月」計算。";
        }

        let target = new Date(dy, dm - 1, d);
        if (target.getMonth() !== dm - 1) {
            target = new Date(dy, dm, 0); 
        }

        resArea.innerHTML = `
            <div class="res-box" style="border-left:5px solid #bfa15d; padding:15px; background:#f9f9f9; margin-top:15px; border-radius:4px;">
                <p style="margin:0; font-size:0.9rem; color:#666;">${note}</p>
                <h3 style="color:#bfa15d; margin:10px 0;">建議對年日期：${target.getFullYear()}年${target.getMonth()+1}月${target.getDate()}日</h3>
                <small style="color:#999;">*精確日子建議仍須由禮儀師核對農民曆。*</small>
            </div>
        `;
        resArea.classList.remove('hidden');
    };

    // --- 4. 勞保喪葬給付試算 ---
    window.calculateLabor = function() {
        const salary = parseFloat(document.getElementById('avgSalary')?.value);
        const survivor = document.getElementById('hasSurvivor')?.value;
        const resArea = document.getElementById('laborResult');
        if (!salary || !resArea) return;

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

    // --- 5. 初始化執行 ---
    if (DOM.yearSpan) DOM.yearSpan.textContent = new Date().getFullYear();
    document.body.classList.remove('js-loading');

    console.log("%c祥安生命 V7.0 終極修正版已載入", "color: #bfa15d; font-weight: bold;");
})();

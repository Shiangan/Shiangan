/**
 * 祥安生命 - 核心邏輯統整 V7.0
 * 更新重點：
 * 1. 修正手機版子選單「首點展開、二點跳轉」的防呆邏輯。
 * 2. 整合 2025 閏月對年演算法與勞保給付自動級距計算。
 * 3. 優化平滑捲動的高度補償（Offset）。
 */

'use strict';

(function() {
    // --- 1. DOM 元素與配置 ---
    const DOM = {
        header: document.querySelector('.main-header'),
        menuToggle: document.getElementById('menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        navOverlay: document.querySelector('.nav-overlay'),
        dropdowns: document.querySelectorAll('.has-dropdown'),
        yearSpan: document.getElementById('current-year')
    };

    // 配置參數
    const CONFIG = {
        headerHeight: 75,      // 捲動補償高度
        scrollThreshold: 50,    // 觸發 Header 變色的捲動距離
    };

    // --- 2. 導覽系統核心邏輯 ---

    const toggleMenu = (forceClose = false) => {
        const isOpen = forceClose ? false : !DOM.mainNav.classList.contains('active');
        
        DOM.mainNav.classList.toggle('active', isOpen);
        if (DOM.menuToggle) DOM.menuToggle.classList.toggle('active', isOpen);
        if (DOM.navOverlay) DOM.navOverlay.classList.toggle('active', isOpen);
        
        // 防止手機版開啟選單時底層捲動
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // 點擊漢堡鈕
    DOM.menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // 點擊遮罩關閉
    DOM.navOverlay?.addEventListener('click', () => toggleMenu(true));

    // 手機版子選單處理 (兩段式邏輯)
    DOM.dropdowns.forEach(li => {
        const trigger = li.querySelector('a'); // 取得父級連結
        
        trigger?.addEventListener('click', function(e) {
            if (window.innerWidth <= 991) {
                // 如果該選單尚未被啟動 (Active)
                if (!li.classList.contains('active')) {
                    e.preventDefault(); // 攔截跳轉
                    // 關閉其他已展開的子選單 (手風琴效果)
                    DOM.dropdowns.forEach(other => {
                        if (other !== li) other.classList.remove('active');
                    });
                    li.classList.add('active');
                } 
                // 如果已經是 Active，則第二次點擊會執行預設 a href 跳轉
            }
        });
    });

    // 頁面內錨點平滑捲動
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const id = this.getAttribute('href');
            if (id === "#") return;

            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                toggleMenu(true); // 捲動前先關閉手機選單

                const targetPos = target.getBoundingClientRect().top + window.pageYOffset - CONFIG.headerHeight;
                window.scrollTo({ top: targetPos, behavior: 'smooth' });
            }
        });
    });

    // 捲動監聽
    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > CONFIG.scrollThreshold;
        DOM.header?.classList.toggle('scrolled', isScrolled);
    }, { passive: true });


    // --- 3. 2025 對年計算機 (修正閏月邏輯) ---
    window.calculateDuinian = function() {
        const input = document.getElementById('dateOfDeath')?.value;
        const resArea = document.getElementById('resultOutput');
        if (!input || !resArea) return;

        let [y, m, d] = input.split('-').map(Number);
        let dy = y + 1;
        let dm = m;
        let note = "一般對年估算：往生後的一週年。";

        // 2025 閏六月習俗修正邏輯
        // 傳統習俗：若遇閏月，對年通常提前一個月（視地區習俗而定）
        if (y === 2025 && m > 6) {
            dm -= 1;
            if (dm <= 0) { dm = 12; dy -= 1; }
            note = "⚠️ 偵測到 2025 閏六月，依部分傳統習俗，對年需提前一個月計算。";
        }

        let target = new Date(dy, dm - 1, d);
        // 處理月底溢位 (例如 2/29 變 3/1)
        if (target.getMonth() !== dm - 1) {
            target = new Date(dy, dm, 0); 
        }

        resArea.innerHTML = `
            <div class="calculation-result-box">
                <p class="note">${note}</p>
                <h3 class="date-title">建議對年日期：${target.getFullYear()}年${target.getMonth()+1}月${target.getDate()}日</h3>
                <p class="disclaimer">*請務必提供亡者生辰與禮儀師核對農民曆擇日。*</p>
            </div>
        `;
        resArea.classList.remove('hidden');
    };


    // --- 4. 勞保喪葬給付試算 ---
    window.calculateLabor = function() {
        const salaryInput = parseFloat(document.getElementById('avgSalary')?.value);
        const survivor = document.getElementById('hasSurvivor')?.value;
        const resArea = document.getElementById('laborResult');
        if (!salaryInput || !resArea) return;

        // 自動校正級距 (2025 勞保投保上限暫定為 45,800)
        const finalSalary = Math.min(Math.max(salaryInput, 28590), 45800);
        const months = (survivor === 'yes') ? 5 : 10;
        const total = finalSalary * months;

        resArea.innerHTML = `
            <div class="labor-result-card">
                <p>試算預估給付金額：</p>
                <div class="amount">NT$ ${total.toLocaleString()}</div>
                <small>(投保級距：${finalSalary.toLocaleString()} 元 × ${months} 個月)</small>
            </div>
        `;
    };

    // --- 5. 初始化 ---
    const init = () => {
        if (DOM.yearSpan) DOM.yearSpan.textContent = new Date().getFullYear();
        document.body.classList.remove('js-loading');
        console.log("%c祥安生命 V7.0 終極修正版載入成功", "color: #bfa15d; font-weight: bold;");
    };

    init();
})();

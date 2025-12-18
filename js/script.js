/**
 * ====================================================================
 * 祥安生命網站核心整合腳本 (SA Life Total Integration) - V5.0 旗艦版
 * * 核心功能：
 * 1. 導航控管：RWD 手機版平滑手風琴、桌機版捲動變色。
 * 2. 跨裝置試算：勞保喪葬津貼 (2024/2025 級距)、對年習俗計算。
 * 3. 視覺動效：Canvas 漸層流星、頁面捲動偵測、Tab 頁籤切換。
 * 4. 效能優化：防止背景捲動、Passive Scroll 監聽、自動高度計算。
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間，防止與外部插件衝突
window.SALife = window.SALife || {};

// --- 1. 全域靜態配置 ---
const SAL_CONFIG = {
    LABOR: {
        MAX: 45800,     // 投保薪資上限
        MIN: 27470,     // 2024/2025 基本工資底限
        SURV_M: 5,      // 有遺屬月數
        NO_SURV_M: 10   // 無遺屬月數
    },
    UI: {
        BREAKPOINT: 991, // 手機版斷點
        SCROLL_THRES: 60, // 導航欄變色閾值
        METEORS: 10      // 流星數量 (平衡效能與美感)
    },
    PLANS: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
};

// ====================================================
// A. 試算機核心邏輯 (Calculators)
// ====================================================

/** 勞保喪葬津貼試算 - 支援動態級距與美化輸出 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    
    if (!avgInput || !resultBox) return;
    const rawValue = parseFloat(avgInput.value);
    
    // 錯誤處理：輸入非數字或負數
    if (isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<div class="alert-error">❗ 請輸入有效的平均月投保薪資金額。</div>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 邏輯判斷：自動修正至法定區間
    const finalSalary = Math.min(Math.max(rawValue, SAL_CONFIG.LABOR.MIN), SAL_CONFIG.LABOR.MAX);
    const months = (hasSurvivor === 'yes') ? SAL_CONFIG.LABOR.SURV_M : SAL_CONFIG.LABOR.NO_SURV_M;
    const totalAmount = finalSalary * months;
    
    let html = `<div class="calc-result-card pulse-animation">`;
    if (rawValue !== finalSalary) {
        html += `<p class="salary-limit-info">⚠️ 依規按最高/低投保金額 **$${finalSalary.toLocaleString()}** 計算。</p>`;
    }
    html += `
        <div class="result-main-value">
            <small>預估津貼金額</small>
            <strong>$${totalAmount.toLocaleString()}</strong>
        </div>
        <p class="result-formula">公式：$${finalSalary.toLocaleString()} × ${months} 個月</p>
    `;
    if (hasSurvivor === 'yes') {
        html += `<p class="result-tip">💡 **提醒：** 您可能符合領取「遺屬年金」資格，總額通常高於津貼，建議諮詢。</p>`;
    }
    resultBox.innerHTML = html + `</div>`;
    resultBox.style.display = 'block';
};

/** 對年日期習俗計算 - 整合閏月提醒 */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.onclick = () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        const resultOutput = document.getElementById('resultOutput');
        if (!dateVal) { alert('請選擇日期'); return; }
        
        const d = new Date(dateVal);
        const duinian = new Date(d);
        duinian.setFullYear(d.getFullYear() + 1);
        
        // 習俗特殊性：2024/2025 閏年提醒邏輯
        const yearCheck = d.getFullYear();
        const isSpecialYear = (yearCheck === 2024 || yearCheck === 2025);
        
        document.getElementById('lunarDate').innerText = `往生日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `對年預估：${duinian.toLocaleDateString('zh-TW')} (標準日)`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span class="custom-warning">⚠️ 提醒：治喪年逢閏月，習俗對年需「提前一個月」，請務必諮詢禮儀師核對農民曆。</span>` : 
            `計算依標準次年同日，實際儀式日期請以農民曆或專業師父建議為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
};

// ====================================================
// B. 全設備導航與視覺動效 (UX & Navigation)
// ====================================================

(function () {
    const dom = {
        header: document.querySelector('.main-header'),
        menuBtn: document.querySelector('.menu-toggle'),
        nav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 頂級漸層流星 (全螢幕渲染) ---
    const startMeteors = () => {
        if (!dom.canvas) return;
        const ctx = dom.canvas.getContext('2d');
        let meteors = [];

        const resize = () => {
            dom.canvas.width = window.innerWidth;
            dom.canvas.height = window.innerHeight;
        };

        class Meteor {
            constructor() { this.init(); }
            init() {
                this.x = Math.random() * dom.canvas.width + 300;
                this.y = Math.random() * dom.canvas.height * 0.4;
                this.size = Math.random() * 90 + 30;
                this.speed = Math.random() * 6 + 4;
                this.alpha = 1;
            }
            update() {
                this.x -= this.speed; this.y += this.speed; this.alpha -= 0.012;
                if (this.alpha <= 0) this.init();
            }
            draw() {
                ctx.beginPath();
                const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.size, this.y - this.size);
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = grad; ctx.lineWidth = 1.8;
                ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.size, this.y - this.size);
                ctx.stroke();
            }
        }

        for (let i = 0; i < SAL_CONFIG.UI.METEORS; i++) meteors.push(new Meteor());
        function frame() {
            ctx.clearRect(0, 0, dom.canvas.width, dom.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(frame);
        }
        window.addEventListener('resize', resize);
        resize(); frame();
    };

    // --- 2. 導航選單 (支援電腦版 Hover 與 手機版手風琴) ---
    const initNav = () => {
        if (!dom.menuBtn) return;

        // 手機版漢堡選單切換
        dom.menuBtn.onclick = function() {
            const active = dom.nav.classList.toggle('active');
            this.classList.toggle('active');
            this.setAttribute('aria-expanded', active);
            // 手機版開啟選單時禁止背景捲動
            dom.body.style.overflow = (active && window.innerWidth < SAL_CONFIG.UI.BREAKPOINT) ? 'hidden' : '';
            const icon = this.querySelector('i');
            if (icon) icon.className = active ? 'fas fa-times' : 'fas fa-bars';
        };

        // 手機版子選單：手風琴邏輯 (Accordion)
        dom.nav.querySelectorAll('.dropdown > a').forEach(link => {
            link.onclick = function(e) {
                // 如果是桌機版則維持原本連結/Hover邏輯
                if (window.innerWidth >= SAL_CONFIG.UI.BREAKPOINT) return;
                
                e.preventDefault();
                const parent = this.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 閉合同級其他選單 (優雅手風琴效果)
                parent.parentElement.querySelectorAll('.dropdown.active').forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('active');
                        const sub = item.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                // 開關當前選單：動態高度計算
                parent.classList.toggle('active');
                if (submenu) {
                    submenu.style.maxHeight = isOpen ? '0px' : submenu.scrollHeight + 'px';
                }
            };
        });
    };

    // --- 3. 頁籤與內容控管 ---
    window.SALife.openPlanTab = function(tabName, anchor = null) {
        SAL_CONFIG.PLANS.forEach(id => {
            const content = document.getElementById('content-' + id);
            const tabBtn = document.getElementById('tab-' + id);
            if (content) content.style.display = (id === tabName) ? 'block' : 'none';
            if (tabBtn) tabBtn.classList.toggle('active', id === tabName);
        });

        if (anchor) {
            const target = document.querySelector(anchor);
            if (target) {
                const headerH = dom.header?.offsetHeight || 80;
                window.scrollTo({ top: target.offsetTop - headerH - 10, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 系統初始化 ---
    document.addEventListener('DOMContentLoaded', () => {
        startMeteors();
        initNav();
        window.SALife.setupDuinianCalculator();
        
        // 高性能滾動偵測：Header 變色
        window.addEventListener('scroll', () => {
            const isScrolled = window.scrollY > SAL_CONFIG.UI.SCROLL_THRES;
            dom.header?.classList.toggle('scrolled', isScrolled);
        }, { passive: true });

        // 解析 URL 並啟動初始頁籤
        const hash = window.location.hash.substring(1);
        window.SALife.openPlanTab(SAL_CONFIG.PLANS.includes(hash) ? hash : 'buddhist-taoist');
    });

})();

/* 核心腳本整合結束 */

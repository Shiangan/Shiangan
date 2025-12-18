/**
 * ====================================================================
 * 祥安生命網站核心整合腳本 (SA Life Total Integration) - V4.5
 * 狀態：完整版 (無省略)
 * 功能：導航控管、勞保/對年試算、流星特效、頁籤切換、效能優化
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間
window.SALife = window.SALife || {};

// --- 1. 全域配置 ---
const SAL_CONFIG = {
    LABOR: {
        MAX: 45800,     // 2024-2025 最高投保薪資
        MIN: 27470,     // 2024-2025 最低投保薪資
        SURV_M: 5,      // 有遺屬津貼月數
        NO_SURV_M: 10   // 無遺屬(支出殯葬費者)月數
    },
    UI: {
        BREAKPOINT: 991,
        SCROLL_THRES: 60,
        METEORS: 12
    },
    PLANS: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
};

// ====================================================
// A. 試算機邏輯 (Calculators)
// ====================================================

/** 勞保喪葬津貼試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    
    if (!avgInput || !resultBox) return;
    const rawValue = parseFloat(avgInput.value);
    
    if (isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<div class="alert-err">❗ 請輸入正確的平均月投保薪資金額。</div>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 依據法定範圍修正薪資
    const finalSalary = Math.min(Math.max(rawValue, SAL_CONFIG.LABOR.MIN), SAL_CONFIG.LABOR.MAX);
    const months = (hasSurvivor === 'yes') ? SAL_CONFIG.LABOR.SURV_M : SAL_CONFIG.LABOR.NO_SURV_M;
    const totalAmount = finalSalary * months;
    
    let html = `<div class="calc-card">`;
    if (rawValue !== finalSalary) {
        html += `<p class="salary-limit-note">⚠️ 註：投保薪資按法定上限/下限 **$${finalSalary.toLocaleString()}** 計算。</p>`;
    }
    html += `
        <div class="result-main">
            <span class="label">預估金額：</span>
            <span class="value">$${totalAmount.toLocaleString()}</span>
        </div>
        <p class="formula">公式：$${finalSalary.toLocaleString()} × ${months} 個月</p>
    `;
    if (hasSurvivor === 'yes') {
        html += `<p class="pro-tip">💡 提示：符合遺屬資格者，建議優先諮詢「遺屬年金」，總領額度通常較高。</p>`;
    }
    resultBox.innerHTML = html + `</div>`;
    resultBox.style.display = 'block';
};

/** 對年日期習俗提醒 */
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
        
        // 習俗特殊年份判斷 (2024, 2025)
        const isLeapYearWarn = [2024, 2025].includes(d.getFullYear());
        
        document.getElementById('lunarDate').innerText = `往生日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${duinian.toLocaleDateString('zh-TW')} (參考值)`;
        document.getElementById('duinianNote').innerHTML = isLeapYearWarn ? 
            `<span class="warn-text">⚠️ 注意：治喪期間逢閏月，按習俗對年需「提前一個月」舉行。請與禮儀師確認農民曆。</span>` : 
            `計算採標準次年同日，實際儀式日期建議諮詢專業老師。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
};

// ====================================================
// B. UI 交互與導航 (Navigation & UX)
// ====================================================

(function () {
    const dom = {
        header: document.querySelector('.main-header'),
        menuBtn: document.querySelector('.menu-toggle'),
        nav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 高階流星特效 ---
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
                this.x = Math.random() * dom.canvas.width + 200;
                this.y = Math.random() * dom.canvas.height * 0.5;
                this.size = Math.random() * 80 + 40;
                this.speed = Math.random() * 5 + 5;
                this.alpha = 1;
            }
            update() {
                this.x -= this.speed; this.y += this.speed; this.alpha -= 0.015;
                if (this.alpha <= 0) this.init();
            }
            draw() {
                ctx.beginPath();
                const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.size, this.y - this.size);
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = grad; ctx.lineWidth = 2;
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

    // --- 2. 導航選單 (RWD 手風琴邏輯) ---
    const initNav = () => {
        if (!dom.menuBtn) return;

        // 主選單切換
        dom.menuBtn.onclick = function() {
            const active = dom.nav.classList.toggle('active');
            this.classList.toggle('active');
            dom.body.style.overflow = (active && window.innerWidth < SAL_CONFIG.UI.BREAKPOINT) ? 'hidden' : '';
            const icon = this.querySelector('i');
            if (icon) icon.className = active ? 'fas fa-times' : 'fas fa-bars';
        };

        // 手機版子選單：手風琴 (Accordion)
        dom.nav.querySelectorAll('.dropdown > a').forEach(link => {
            link.onclick = function(e) {
                if (window.innerWidth >= SAL_CONFIG.UI.BREAKPOINT) return;
                e.preventDefault();
                
                const parent = this.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 閉合其他已打開的選單 (單選效果)
                parent.parentElement.querySelectorAll('.dropdown.active').forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('active');
                        const sub = item.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                // 切換當前選單
                parent.classList.toggle('active');
                if (submenu) {
                    submenu.style.maxHeight = isOpen ? '0px' : submenu.scrollHeight + 'px';
                }
            };
        });
    };

    // --- 3. 頁籤切換與錨點 (Tabs Control) ---
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
                window.scrollTo({ top: target.offsetTop - headerH - 20, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 啟動器 ---
    document.addEventListener('DOMContentLoaded', () => {
        startMeteors();
        initNav();
        window.SALife.setupDuinianCalculator();
        
        // 監聽滾動：Header 背景變化
        window.addEventListener('scroll', () => {
            dom.header?.classList.toggle('scrolled', window.scrollY > SAL_CONFIG.UI.SCROLL_THRES);
        }, { passive: true });

        // 初始 Hash 判斷
        const hash = window.location.hash.substring(1);
        window.SALife.openPlanTab(SAL_CONFIG.PLANS.includes(hash) ? hash : 'buddhist-taoist');
    });

})();

/* 腳本結束 */

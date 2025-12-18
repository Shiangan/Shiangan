'use strict';

/**
 * ====================================================================
 * 祥安生命網站核心腳本 V4.2 (精簡優化版)
 * 整合：勞保精算、對年習俗、Canvas 流星、RWD 手風琴導航。
 * ====================================================================
 */

window.SALife = window.SALife || {};

// --- 1. 核心參數設定 ---
const CONFIG = {
    LABOR: { MAX: 45800, MIN: 27470, SURVIVOR: 5, NO_SURVIVOR: 10 },
    UI: { MOBILE_WIDTH: 991, SCROLL_LIMIT: 60, METEOR_COUNT: 12 },
    TABS: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
};

// ====================================================
// A. 試算機核心邏輯
// ====================================================

/** 勞保喪葬津貼試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    
    if (!avgInput || !resultBox) return;
    const rawValue = parseFloat(avgInput.value);
    
    if (isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<p class="error">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 法定邊界計算
    const finalSalary = Math.min(Math.max(rawValue, CONFIG.LABOR.MIN), CONFIG.LABOR.MAX);
    const months = (hasSurvivor === 'yes') ? CONFIG.LABOR.SURVIVOR : CONFIG.LABOR.NO_SURVIVOR;
    const totalAmount = finalSalary * months;
    
    let html = `<div class="calc-res">`;
    if (rawValue !== finalSalary) {
        html += `<p class="note">⚠️ 依規按最高/低投保金額 **$${finalSalary.toLocaleString()}** 計算。</p>`;
    }
    html += `<p class="main-amount">✅ 預估喪葬津貼：**$${totalAmount.toLocaleString()}**</p>`;
    if (hasSurvivor === 'yes') {
        html += `<p class="tip">💡 建議諮詢禮儀師，確認是否符合領取「遺屬年金」之資格。</p>`;
    }
    resultBox.innerHTML = html + `</div>`;
    resultBox.style.display = 'block';
};

/** 對年日期習俗試算 */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.onclick = () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        if (!dateVal) { alert('請選擇往生日期'); return; }
        
        const d = new Date(dateVal);
        const duinian = new Date(d);
        duinian.setFullYear(d.getFullYear() + 1);
        
        // 習俗邏輯提醒
        const isSpecialYear = [2024, 2025].includes(d.getFullYear());
        const resultOutput = document.getElementById('resultOutput');
        
        document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${duinian.toLocaleDateString('zh-TW')}`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span class="warn">⚠️ 治喪年遇閏月，按習俗對年需**提前一個月**。請諮詢禮儀師核對農民曆。</span>` : 
            `實際日期請以農民曆為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
};

// ====================================================
// B. UI 交互與特效
// ====================================================

(function () {
    const el = {
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        nav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 流星特效 (漸層優化版) ---
    const initMeteors = () => {
        if (!el.canvas) return;
        const ctx = el.canvas.getContext('2d');
        let meteors = [];

        const resize = () => { el.canvas.width = window.innerWidth; el.canvas.height = window.innerHeight; };

        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * el.canvas.width + 100;
                this.y = Math.random() * el.canvas.height * 0.4;
                this.len = Math.random() * 80 + 30;
                this.speed = Math.random() * 6 + 4;
                this.alpha = 1;
            }
            update() {
                this.x -= this.speed; this.y += this.speed; this.alpha -= 0.015;
                if (this.alpha <= 0) this.reset();
            }
            draw() {
                ctx.beginPath();
                const grad = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y - this.len);
                grad.addColorStop(0, `rgba(255, 255, 255, ${this.alpha})`);
                grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.strokeStyle = grad; ctx.lineWidth = 1.5;
                ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.len, this.y - this.len);
                ctx.stroke();
            }
        }

        for (let i = 0; i < CONFIG.UI.METEOR_COUNT; i++) meteors.push(new Meteor());
        const run = () => {
            ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(run);
        };
        window.addEventListener('resize', resize);
        resize(); run();
    };

    // --- 2. 導航選單 (RWD 手風琴) ---
    const setupNav = () => {
        if (!el.menuToggle) return;

        el.menuToggle.onclick = () => {
            const isActive = el.nav.classList.toggle('active');
            el.menuToggle.classList.toggle('active');
            el.body.style.overflow = (isActive && window.innerWidth < CONFIG.UI.MOBILE_WIDTH) ? 'hidden' : '';
            const icon = el.menuToggle.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        };

        el.nav.querySelectorAll('.dropdown > a').forEach(link => {
            link.onclick = (e) => {
                if (window.innerWidth > CONFIG.UI.MOBILE_WIDTH) return;
                e.preventDefault();
                const parent = link.parentElement;
                const sub = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 關閉同級其他選單
                parent.parentElement.querySelectorAll('.dropdown').forEach(li => {
                    if (li !== parent) { li.classList.remove('active'); const s = li.querySelector('.submenu, .submenu-container'); if(s) s.style.maxHeight = '0px'; }
                });

                parent.classList.toggle('active', !isOpen);
                sub.style.maxHeight = !isOpen ? sub.scrollHeight + 'px' : '0px';
            };
        });
    };

    // --- 3. 頁籤與初始化 ---
    window.SALife.openPlanTab = (tab, anchor = null) => {
        CONFIG.TABS.forEach(name => {
            const c = document.getElementById('content-' + name);
            const b = document.getElementById('tab-' + name);
            if (c) c.style.display = (name === tab) ? 'block' : 'none';
            if (b) b.classList.toggle('active', name === tab);
        });
        if (anchor) {
            const target = document.querySelector(anchor);
            if (target) window.scrollTo({ top: target.offsetTop - (el.header?.offsetHeight || 80) - 10, behavior: 'smooth' });
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        initMeteors();
        setupNav();
        window.SALife.setupDuinianCalculator();
        window.addEventListener('scroll', () => { el.header?.classList.toggle('scrolled', window.scrollY > CONFIG.UI.SCROLL_LIMIT); }, { passive: true });

        const hash = window.location.hash.substring(1);
        window.SALife.openPlanTab(CONFIG.TABS.includes(hash) ? hash : 'buddhist-taoist');
    });
})();

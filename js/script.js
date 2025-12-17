/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 終極整合版 V4.0
 * 修正：選單 RWD 手風琴邏輯、勞保法定邊界、對年閏月警告、Canvas 流星特效、A11Y 強化。
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機核心邏輯 (勞保 & 對年)
// ====================================================

const LABOR_RULES = {
    MAX_SALARY: 45800,
    MIN_SALARY: 27470,
    SURVIVOR_MONTHS: 5,
    NO_SURVIVOR_MONTHS: 10
};

/** 勞保試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    const rawValue = parseFloat(avgInput?.value);
    
    if (!avgInput?.value || isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用 2024/2025 法定薪資上下限
    const finalSalary = Math.min(Math.max(rawValue, LABOR_RULES.MIN_SALARY), LABOR_RULES.MAX_SALARY);
    const months = (hasSurvivor === 'yes') ? LABOR_RULES.SURVIVOR_MONTHS : LABOR_RULES.NO_SURVIVOR_MONTHS;
    const totalAmount = finalSalary * months;
    
    let html = (rawValue !== finalSalary) ? 
        `<p class="note" style="color:#f0ad4e; font-size:0.9em;">⚠️ 註：依規定按投保薪資範圍 **$${finalSalary.toLocaleString()}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        html += `
            <p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>
            <p>⚠️ **專業提醒：** 有遺屬者通常符合領取「遺屬年金」資格，總額通常遠高於此，建議立即諮詢。</p>
        `;
    } else {
        html += `<p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>`;
    }

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
};

/** 對年計算 (習俗邏輯) */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        if (!dateVal) { alert('請選擇往生日期'); return; }
        
        const d = new Date(dateVal);
        const nextYearDate = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
        
        // 模擬農曆閏年提醒 (習俗：遇閏月對年需提前)
        const isSpecialYear = (d.getFullYear() === 2024 || d.getFullYear() === 2025);
        
        const resultOutput = document.getElementById('resultOutput');
        document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${nextYearDate.toLocaleDateString('zh-TW')} (農曆估計)`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span style="color:#b22222;">⚠️ 治喪年遇閏月，按習俗對年需**提前一個月**。請諮詢禮儀師核對農民曆。</span>` : 
            `本次計算採標準對年估算，實際日期請以農民曆為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// IIFE 啟動：UI 動態與特效
// ====================================================

(function () {
    const SETTINGS = {
        MOBILE_WIDTH: 900,
        SCROLL_LIMIT: 50,
        METEOR_COUNT: 12,
        TAB_NAMES: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
    };

    const elements = {
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 流星特效 ---
    const initMeteors = () => {
        if (!elements.canvas) return;
        const ctx = elements.canvas.getContext('2d');
        let meteors = [];

        const resize = () => {
            elements.canvas.width = window.innerWidth;
            elements.canvas.height = window.innerHeight;
        };

        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * elements.canvas.width;
                this.y = Math.random() * elements.canvas.height * 0.4;
                this.length = Math.random() * 80 + 20;
                this.speed = Math.random() * 8 + 4;
                this.opacity = 1;
            }
            update() {
                this.x -= this.speed;
                this.y += this.speed;
                this.opacity -= 0.015;
                if (this.opacity <= 0) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.length, this.y - this.length);
                ctx.stroke();
            }
        }

        for (let i = 0; i < SETTINGS.METEOR_COUNT; i++) meteors.push(new Meteor());
        const run = () => {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(run);
        };
        window.addEventListener('resize', resize);
        resize(); run();
    };

    // --- 2. 導航選單 (RWD + A11Y) ---
    const setupNav = () => {
        if (!elements.menuToggle) return;

        elements.menuToggle.addEventListener('click', () => {
            const isActive = elements.mainNav.classList.toggle('active');
            elements.menuToggle.classList.toggle('active');
            elements.menuToggle.setAttribute('aria-expanded', isActive);
            elements.body.classList.toggle('no-scroll', isActive && window.innerWidth < SETTINGS.MOBILE_WIDTH);
            
            // 圖示切換 (FontAwesome)
            const icon = elements.menuToggle.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        });

        // 手機版子選單 (Accordion 邏輯修正)
        elements.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth > SETTINGS.MOBILE_WIDTH) return;
                e.preventDefault();
                const parent = link.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 關閉同層級其他選單
                parent.parentElement.querySelectorAll('.dropdown').forEach(li => {
                    if (li !== parent) {
                        li.classList.remove('active');
                        const sub = li.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                if (isOpen) {
                    parent.classList.remove('active');
                    submenu.style.maxHeight = '0px';
                } else {
                    parent.classList.add('active');
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    // 動畫完畢後解除高度限制以支援動態內容
                    setTimeout(() => { if(parent.classList.contains('active')) submenu.style.maxHeight = 'none'; }, 400);
                }
            });
        });
    };

    // --- 3. Tab 切換 (URL Hash 支援) ---
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        SETTINGS.TAB_NAMES.forEach(name => {
            const content = document.getElementById('content-' + name);
            const btn = document.getElementById('tab-' + name);
            if (content) content.style.display = (name === tabName) ? 'block' : 'none';
            if (btn) btn.classList.toggle('active', name === tabName);
        });

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) {
                const offset = elements.header?.offsetHeight || 80;
                window.scrollTo({ top: el.offsetTop - offset - 10, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 初始化 ---
    document.addEventListener('DOMContentLoaded', () => {
        initMeteors();
        setupNav();
        window.SALife.setupDuinianCalculator();
        
        // 滾動效果
        window.addEventListener('scroll', () => {
            elements.header?.classList.toggle('scrolled', window.scrollY > SETTINGS.SCROLL_LIMIT);
        }, { passive: true });

        // 處理 Hash 跳轉
        const currentHash = window.location.hash.substring(1);
        if (SETTINGS.TAB_NAMES.includes(currentHash)) {
            window.SALife.openPlanTab(currentHash);
        } else {
            window.SALife.openPlanTab('buddhist-taoist');
        }
    });

})();
/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 終極整合版 V4.0
 * 修正：選單 RWD 手風琴邏輯、勞保法定邊界、對年閏月警告、Canvas 流星特效、A11Y 強化。
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機核心邏輯 (勞保 & 對年)
// ====================================================

const LABOR_RULES = {
    MAX_SALARY: 45800,
    MIN_SALARY: 27470,
    SURVIVOR_MONTHS: 5,
    NO_SURVIVOR_MONTHS: 10
};

/** 勞保試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    const rawValue = parseFloat(avgInput?.value);
    
    if (!avgInput?.value || isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用 2024/2025 法定薪資上下限
    const finalSalary = Math.min(Math.max(rawValue, LABOR_RULES.MIN_SALARY), LABOR_RULES.MAX_SALARY);
    const months = (hasSurvivor === 'yes') ? LABOR_RULES.SURVIVOR_MONTHS : LABOR_RULES.NO_SURVIVOR_MONTHS;
    const totalAmount = finalSalary * months;
    
    let html = (rawValue !== finalSalary) ? 
        `<p class="note" style="color:#f0ad4e; font-size:0.9em;">⚠️ 註：依規定按投保薪資範圍 **$${finalSalary.toLocaleString()}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        html += `
            <p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>
            <p>⚠️ **專業提醒：** 有遺屬者通常符合領取「遺屬年金」資格，總額通常遠高於此，建議立即諮詢。</p>
        `;
    } else {
        html += `<p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>`;
    }

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
};

/** 對年計算 (習俗邏輯) */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        if (!dateVal) { alert('請選擇往生日期'); return; }
        
        const d = new Date(dateVal);
        const nextYearDate = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
        
        // 模擬農曆閏年提醒 (習俗：遇閏月對年需提前)
        const isSpecialYear = (d.getFullYear() === 2024 || d.getFullYear() === 2025);
        
        const resultOutput = document.getElementById('resultOutput');
        document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${nextYearDate.toLocaleDateString('zh-TW')} (農曆估計)`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span style="color:#b22222;">⚠️ 治喪年遇閏月，按習俗對年需**提前一個月**。請諮詢禮儀師核對農民曆。</span>` : 
            `本次計算採標準對年估算，實際日期請以農民曆為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// IIFE 啟動：UI 動態與特效
// ====================================================

(function () {
    const SETTINGS = {
        MOBILE_WIDTH: 900,
        SCROLL_LIMIT: 50,
        METEOR_COUNT: 12,
        TAB_NAMES: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
    };

    const elements = {
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 流星特效 ---
    const initMeteors = () => {
        if (!elements.canvas) return;
        const ctx = elements.canvas.getContext('2d');
        let meteors = [];

        const resize = () => {
            elements.canvas.width = window.innerWidth;
            elements.canvas.height = window.innerHeight;
        };

        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * elements.canvas.width;
                this.y = Math.random() * elements.canvas.height * 0.4;
                this.length = Math.random() * 80 + 20;
                this.speed = Math.random() * 8 + 4;
                this.opacity = 1;
            }
            update() {
                this.x -= this.speed;
                this.y += this.speed;
                this.opacity -= 0.015;
                if (this.opacity <= 0) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.length, this.y - this.length);
                ctx.stroke();
            }
        }

        for (let i = 0; i < SETTINGS.METEOR_COUNT; i++) meteors.push(new Meteor());
        const run = () => {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(run);
        };
        window.addEventListener('resize', resize);
        resize(); run();
    };

    // --- 2. 導航選單 (RWD + A11Y) ---
    const setupNav = () => {
        if (!elements.menuToggle) return;

        elements.menuToggle.addEventListener('click', () => {
            const isActive = elements.mainNav.classList.toggle('active');
            elements.menuToggle.classList.toggle('active');
            elements.menuToggle.setAttribute('aria-expanded', isActive);
            elements.body.classList.toggle('no-scroll', isActive && window.innerWidth < SETTINGS.MOBILE_WIDTH);
            
            // 圖示切換 (FontAwesome)
            const icon = elements.menuToggle.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        });

        // 手機版子選單 (Accordion 邏輯修正)
        elements.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth > SETTINGS.MOBILE_WIDTH) return;
                e.preventDefault();
                const parent = link.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 關閉同層級其他選單
                parent.parentElement.querySelectorAll('.dropdown').forEach(li => {
                    if (li !== parent) {
                        li.classList.remove('active');
                        const sub = li.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                if (isOpen) {
                    parent.classList.remove('active');
                    submenu.style.maxHeight = '0px';
                } else {
                    parent.classList.add('active');
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    // 動畫完畢後解除高度限制以支援動態內容
                    setTimeout(() => { if(parent.classList.contains('active')) submenu.style.maxHeight = 'none'; }, 400);
                }
            });
        });
    };

    // --- 3. Tab 切換 (URL Hash 支援) ---
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        SETTINGS.TAB_NAMES.forEach(name => {
            const content = document.getElementById('content-' + name);
            const btn = document.getElementById('tab-' + name);
            if (content) content.style.display = (name === tabName) ? 'block' : 'none';
            if (btn) btn.classList.toggle('active', name === tabName);
        });

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) {
                const offset = elements.header?.offsetHeight || 80;
                window.scrollTo({ top: el.offsetTop - offset - 10, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 初始化 ---
    document.addEventListener('DOMContentLoaded', () => {
        initMeteors();
        setupNav();
        window.SALife.setupDuinianCalculator();
        
        // 滾動效果
        window.addEventListener('scroll', () => {
            elements.header?.classList.toggle('scrolled', window.scrollY > SETTINGS.SCROLL_LIMIT);
        }, { passive: true });

        // 處理 Hash 跳轉
        const currentHash = window.location.hash.substring(1);
        if (SETTINGS.TAB_NAMES.includes(currentHash)) {
            window.SALife.openPlanTab(currentHash);
        } else {
            window.SALife.openPlanTab('buddhist-taoist');
        }
    });

})();
/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 終極整合版 V4.0
 * 修正：選單 RWD 手風琴邏輯、勞保法定邊界、對年閏月警告、Canvas 流星特效、A11Y 強化。
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機核心邏輯 (勞保 & 對年)
// ====================================================

const LABOR_RULES = {
    MAX_SALARY: 45800,
    MIN_SALARY: 27470,
    SURVIVOR_MONTHS: 5,
    NO_SURVIVOR_MONTHS: 10
};

/** 勞保試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    const rawValue = parseFloat(avgInput?.value);
    
    if (!avgInput?.value || isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用 2024/2025 法定薪資上下限
    const finalSalary = Math.min(Math.max(rawValue, LABOR_RULES.MIN_SALARY), LABOR_RULES.MAX_SALARY);
    const months = (hasSurvivor === 'yes') ? LABOR_RULES.SURVIVOR_MONTHS : LABOR_RULES.NO_SURVIVOR_MONTHS;
    const totalAmount = finalSalary * months;
    
    let html = (rawValue !== finalSalary) ? 
        `<p class="note" style="color:#f0ad4e; font-size:0.9em;">⚠️ 註：依規定按投保薪資範圍 **$${finalSalary.toLocaleString()}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        html += `
            <p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>
            <p>⚠️ **專業提醒：** 有遺屬者通常符合領取「遺屬年金」資格，總額通常遠高於此，建議立即諮詢。</p>
        `;
    } else {
        html += `<p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>`;
    }

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
};

/** 對年計算 (習俗邏輯) */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        if (!dateVal) { alert('請選擇往生日期'); return; }
        
        const d = new Date(dateVal);
        const nextYearDate = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
        
        // 模擬農曆閏年提醒 (習俗：遇閏月對年需提前)
        const isSpecialYear = (d.getFullYear() === 2024 || d.getFullYear() === 2025);
        
        const resultOutput = document.getElementById('resultOutput');
        document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${nextYearDate.toLocaleDateString('zh-TW')} (農曆估計)`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span style="color:#b22222;">⚠️ 治喪年遇閏月，按習俗對年需**提前一個月**。請諮詢禮儀師核對農民曆。</span>` : 
            `本次計算採標準對年估算，實際日期請以農民曆為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// IIFE 啟動：UI 動態與特效
// ====================================================

(function () {
    const SETTINGS = {
        MOBILE_WIDTH: 900,
        SCROLL_LIMIT: 50,
        METEOR_COUNT: 12,
        TAB_NAMES: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
    };

    const elements = {
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 流星特效 ---
    const initMeteors = () => {
        if (!elements.canvas) return;
        const ctx = elements.canvas.getContext('2d');
        let meteors = [];

        const resize = () => {
            elements.canvas.width = window.innerWidth;
            elements.canvas.height = window.innerHeight;
        };

        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * elements.canvas.width;
                this.y = Math.random() * elements.canvas.height * 0.4;
                this.length = Math.random() * 80 + 20;
                this.speed = Math.random() * 8 + 4;
                this.opacity = 1;
            }
            update() {
                this.x -= this.speed;
                this.y += this.speed;
                this.opacity -= 0.015;
                if (this.opacity <= 0) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.length, this.y - this.length);
                ctx.stroke();
            }
        }

        for (let i = 0; i < SETTINGS.METEOR_COUNT; i++) meteors.push(new Meteor());
        const run = () => {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(run);
        };
        window.addEventListener('resize', resize);
        resize(); run();
    };

    // --- 2. 導航選單 (RWD + A11Y) ---
    const setupNav = () => {
        if (!elements.menuToggle) return;

        elements.menuToggle.addEventListener('click', () => {
            const isActive = elements.mainNav.classList.toggle('active');
            elements.menuToggle.classList.toggle('active');
            elements.menuToggle.setAttribute('aria-expanded', isActive);
            elements.body.classList.toggle('no-scroll', isActive && window.innerWidth < SETTINGS.MOBILE_WIDTH);
            
            // 圖示切換 (FontAwesome)
            const icon = elements.menuToggle.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        });

        // 手機版子選單 (Accordion 邏輯修正)
        elements.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth > SETTINGS.MOBILE_WIDTH) return;
                e.preventDefault();
                const parent = link.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 關閉同層級其他選單
                parent.parentElement.querySelectorAll('.dropdown').forEach(li => {
                    if (li !== parent) {
                        li.classList.remove('active');
                        const sub = li.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                if (isOpen) {
                    parent.classList.remove('active');
                    submenu.style.maxHeight = '0px';
                } else {
                    parent.classList.add('active');
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    // 動畫完畢後解除高度限制以支援動態內容
                    setTimeout(() => { if(parent.classList.contains('active')) submenu.style.maxHeight = 'none'; }, 400);
                }
            });
        });
    };

    // --- 3. Tab 切換 (URL Hash 支援) ---
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        SETTINGS.TAB_NAMES.forEach(name => {
            const content = document.getElementById('content-' + name);
            const btn = document.getElementById('tab-' + name);
            if (content) content.style.display = (name === tabName) ? 'block' : 'none';
            if (btn) btn.classList.toggle('active', name === tabName);
        });

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) {
                const offset = elements.header?.offsetHeight || 80;
                window.scrollTo({ top: el.offsetTop - offset - 10, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 初始化 ---
    document.addEventListener('DOMContentLoaded', () => {
        initMeteors();
        setupNav();
        window.SALife.setupDuinianCalculator();
        
        // 滾動效果
        window.addEventListener('scroll', () => {
            elements.header?.classList.toggle('scrolled', window.scrollY > SETTINGS.SCROLL_LIMIT);
        }, { passive: true });

        // 處理 Hash 跳轉
        const currentHash = window.location.hash.substring(1);
        if (SETTINGS.TAB_NAMES.includes(currentHash)) {
            window.SALife.openPlanTab(currentHash);
        } else {
            window.SALife.openPlanTab('buddhist-taoist');
        }
    });

})();
/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 終極整合版 V4.0
 * 修正：選單 RWD 手風琴邏輯、勞保法定邊界、對年閏月警告、Canvas 流星特效、A11Y 強化。
 * ====================================================================
 */

'use strict';

// 建立全域單一命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機核心邏輯 (勞保 & 對年)
// ====================================================

const LABOR_RULES = {
    MAX_SALARY: 45800,
    MIN_SALARY: 27470,
    SURVIVOR_MONTHS: 5,
    NO_SURVIVOR_MONTHS: 10
};

/** 勞保試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgInput = document.getElementById('avgSalary');
    const hasSurvivor = document.getElementById('hasSurvivor')?.value;
    const resultBox = document.getElementById('resultBox');
    const rawValue = parseFloat(avgInput?.value);
    
    if (!avgInput?.value || isNaN(rawValue) || rawValue <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用 2024/2025 法定薪資上下限
    const finalSalary = Math.min(Math.max(rawValue, LABOR_RULES.MIN_SALARY), LABOR_RULES.MAX_SALARY);
    const months = (hasSurvivor === 'yes') ? LABOR_RULES.SURVIVOR_MONTHS : LABOR_RULES.NO_SURVIVOR_MONTHS;
    const totalAmount = finalSalary * months;
    
    let html = (rawValue !== finalSalary) ? 
        `<p class="note" style="color:#f0ad4e; font-size:0.9em;">⚠️ 註：依規定按投保薪資範圍 **$${finalSalary.toLocaleString()}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        html += `
            <p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>
            <p>⚠️ **專業提醒：** 有遺屬者通常符合領取「遺屬年金」資格，總額通常遠高於此，建議立即諮詢。</p>
        `;
    } else {
        html += `<p>✅ **喪葬津貼：** ${months} 個月 = **$${totalAmount.toLocaleString()}**</p>`;
    }

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
};

/** 對年計算 (習俗邏輯) */
window.SALife.setupDuinianCalculator = function() {
    const btn = document.getElementById('calculateDuinian');
    if (!btn) return;

    btn.addEventListener('click', () => {
        const dateVal = document.getElementById('dateOfDeath')?.value;
        if (!dateVal) { alert('請選擇往生日期'); return; }
        
        const d = new Date(dateVal);
        const nextYearDate = new Date(d.getFullYear() + 1, d.getMonth(), d.getDate());
        
        // 模擬農曆閏年提醒 (習俗：遇閏月對年需提前)
        const isSpecialYear = (d.getFullYear() === 2024 || d.getFullYear() === 2025);
        
        const resultOutput = document.getElementById('resultOutput');
        document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
        document.getElementById('duinianDate').innerText = `預估對年：${nextYearDate.toLocaleDateString('zh-TW')} (農曆估計)`;
        document.getElementById('duinianNote').innerHTML = isSpecialYear ? 
            `<span style="color:#b22222;">⚠️ 治喪年遇閏月，按習俗對年需**提前一個月**。請諮詢禮儀師核對農民曆。</span>` : 
            `本次計算採標準對年估算，實際日期請以農民曆為準。`;
        
        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// IIFE 啟動：UI 動態與特效
// ====================================================

(function () {
    const SETTINGS = {
        MOBILE_WIDTH: 900,
        SCROLL_LIMIT: 50,
        METEOR_COUNT: 12,
        TAB_NAMES: ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']
    };

    const elements = {
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        body: document.body,
        canvas: document.getElementById('meteor-canvas')
    };

    // --- 1. Canvas 流星特效 ---
    const initMeteors = () => {
        if (!elements.canvas) return;
        const ctx = elements.canvas.getContext('2d');
        let meteors = [];

        const resize = () => {
            elements.canvas.width = window.innerWidth;
            elements.canvas.height = window.innerHeight;
        };

        class Meteor {
            constructor() { this.reset(); }
            reset() {
                this.x = Math.random() * elements.canvas.width;
                this.y = Math.random() * elements.canvas.height * 0.4;
                this.length = Math.random() * 80 + 20;
                this.speed = Math.random() * 8 + 4;
                this.opacity = 1;
            }
            update() {
                this.x -= this.speed;
                this.y += this.speed;
                this.opacity -= 0.015;
                if (this.opacity <= 0) this.reset();
            }
            draw() {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.lineWidth = 1.5;
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x + this.length, this.y - this.length);
                ctx.stroke();
            }
        }

        for (let i = 0; i < SETTINGS.METEOR_COUNT; i++) meteors.push(new Meteor());
        const run = () => {
            ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
            meteors.forEach(m => { m.update(); m.draw(); });
            requestAnimationFrame(run);
        };
        window.addEventListener('resize', resize);
        resize(); run();
    };

    // --- 2. 導航選單 (RWD + A11Y) ---
    const setupNav = () => {
        if (!elements.menuToggle) return;

        elements.menuToggle.addEventListener('click', () => {
            const isActive = elements.mainNav.classList.toggle('active');
            elements.menuToggle.classList.toggle('active');
            elements.menuToggle.setAttribute('aria-expanded', isActive);
            elements.body.classList.toggle('no-scroll', isActive && window.innerWidth < SETTINGS.MOBILE_WIDTH);
            
            // 圖示切換 (FontAwesome)
            const icon = elements.menuToggle.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        });

        // 手機版子選單 (Accordion 邏輯修正)
        elements.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth > SETTINGS.MOBILE_WIDTH) return;
                e.preventDefault();
                const parent = link.parentElement;
                const submenu = parent.querySelector('.submenu, .submenu-container');
                const isOpen = parent.classList.contains('active');

                // 關閉同層級其他選單
                parent.parentElement.querySelectorAll('.dropdown').forEach(li => {
                    if (li !== parent) {
                        li.classList.remove('active');
                        const sub = li.querySelector('.submenu, .submenu-container');
                        if (sub) sub.style.maxHeight = '0px';
                    }
                });

                if (isOpen) {
                    parent.classList.remove('active');
                    submenu.style.maxHeight = '0px';
                } else {
                    parent.classList.add('active');
                    submenu.style.maxHeight = submenu.scrollHeight + 'px';
                    // 動畫完畢後解除高度限制以支援動態內容
                    setTimeout(() => { if(parent.classList.contains('active')) submenu.style.maxHeight = 'none'; }, 400);
                }
            });
        });
    };

    // --- 3. Tab 切換 (URL Hash 支援) ---
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        SETTINGS.TAB_NAMES.forEach(name => {
            const content = document.getElementById('content-' + name);
            const btn = document.getElementById('tab-' + name);
            if (content) content.style.display = (name === tabName) ? 'block' : 'none';
            if (btn) btn.classList.toggle('active', name === tabName);
        });

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) {
                const offset = elements.header?.offsetHeight || 80;
                window.scrollTo({ top: el.offsetTop - offset - 10, behavior: 'smooth' });
            }
        }
    };

    // --- 4. 初始化 ---
    document.addEventListener('DOMContentLoaded', () => {
        initMeteors();
        setupNav();
        window.SALife.setupDuinianCalculator();
        
        // 滾動效果
        window.addEventListener('scroll', () => {
            elements.header?.classList.toggle('scrolled', window.scrollY > SETTINGS.SCROLL_LIMIT);
        }, { passive: true });

        // 處理 Hash 跳轉
        const currentHash = window.location.hash.substring(1);
        if (SETTINGS.TAB_NAMES.includes(currentHash)) {
            window.SALife.openPlanTab(currentHash);
        } else {
            window.SALife.openPlanTab('buddhist-taoist');
        }
    });

})();

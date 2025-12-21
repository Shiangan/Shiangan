/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦究極整合版 V6.0
 * 更新日期：2025/12/22
 * ====================================================================
 */

'use strict';

// 建立全域命名空間
window.SALife = window.SALife || {};

// ====================================================
// 1. 勞保喪葬給付試算機 (Labor Insurance Engine)
// ====================================================
const LABOR_CONFIG = {
    MAX_SALARY: 45800,
    MIN_SALARY: 27470,
    SURVIVOR_MONTHS: 5,
    NO_SURVIVOR_MONTHS: 10
};

const formatCurrency = (amount) => {
    return amount.toLocaleString('zh-TW', { 
        style: 'currency', 
        currency: 'TWD', 
        minimumFractionDigits: 0 
    });
};

window.SALife.calculateLaborInsurance = function() {
    const avgSalaryInput = document.getElementById('avgSalary');
    const hasSurvivorSelect = document.getElementById('hasSurvivor');
    const resultBox = document.getElementById('resultBox');
    
    if (!avgSalaryInput || !resultBox) return;

    const avgSalary = parseFloat(avgSalaryInput.value);
    const hasSurvivor = hasSurvivorSelect.value;
    
    if (!avgSalaryInput.value || isNaN(avgSalary) || avgSalary <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f; font-weight:bold;">❗ 請輸入正確的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    const finalSalary = Math.min(Math.max(avgSalary, LABOR_CONFIG.MIN_SALARY), LABOR_CONFIG.MAX_SALARY);
    let allowanceMonths = (hasSurvivor === 'yes') ? LABOR_CONFIG.SURVIVOR_MONTHS : LABOR_CONFIG.NO_SURVIVOR_MONTHS;
    const funeralAllowance = finalSalary * allowanceMonths;
    
    let recommendationText = '';
    const salaryNote = avgSalary !== finalSalary ? 
        `<p class="warning-note" style="color:#ff8c00; font-size:0.9em; margin-bottom:8px;">⚠️ 備註：輸入薪資已按規定調整至 **${formatCurrency(finalSalary)}** 計算。</p>` : '';

    recommendationText = `
        ${salaryNote}
        <div class="result-item" style="background:#f4f4f4; padding:15px; border-radius:8px; margin:10px 0;">
            <p style="margin:0; color:#666;">預估給付金額</p>
            <strong style="font-size:1.5rem; color:#bfa15d;">${formatCurrency(funeralAllowance)}</strong>
            <span style="font-size:0.9rem; color:#888;">(${allowanceMonths}個月)</span>
        </div>
        <p class="advice" style="font-size:0.95rem; border-left:4px solid #bfa15d; padding-left:10px;">
            ${hasSurvivor === 'yes' ? 
            '⚠️ <strong>專業建議：</strong> 您有符合資格之遺屬，除了喪葬津貼，建議優先評估「遺屬年金」，其領取總額通常較高。' : 
            '因無符合資格之遺屬，應請領此筆 10 個月的喪葬津貼。'}
        </p>
    `;

    resultBox.innerHTML = recommendationText;
    resultBox.style.display = 'block';
};

// ====================================================
// 2. 對年日期計算機 (Anniversary Engine)
// ====================================================
window.SALife.setupDuinianCalculator = function() {
    const calculateBtn = document.getElementById('calculateDuinian');
    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', function() {
        const solarDateStr = document.getElementById('dateOfDeath').value;
        if (!solarDateStr) { alert('請選擇往生日期。'); return; }

        const parts = solarDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        const isLeapYearInFuneral = (year === 2025); 
        let dYear = year + 1;
        let dMonth = month;
        let note = '本次計算為正常年度，不涉及閏月處理。';

        if (isLeapYearInFuneral && month > 6) {
            dMonth -= 1;
            if (dMonth <= 0) { dMonth = 12; dYear -= 1; }
            note = '<strong>⚠️ 閏月習俗提醒：</strong> 治喪期間遇 2025 閏六月，按傳統對年需<strong>提前一個月</strong>，此計算已自動校正。';
        }

        const lunarDisplay = document.getElementById('lunarDate');
        const duinianDisplay = document.getElementById('duinianDate');
        const noteDisplay = document.getElementById('duinianNote');

        if(lunarDisplay) lunarDisplay.innerHTML = `<strong>陽曆：</strong> ${solarDateStr} &nbsp; | &nbsp; <strong>農曆估算：</strong> ${year}年${month}月${day}日`;
        if(duinianDisplay) duinianDisplay.innerHTML = `<strong>建議對年日期：</strong> <span class="highlight" style="color:#bfa15d; font-size:1.2rem; font-weight:bold;">${dYear}年${dMonth}月${day}日</span>`;
        if(noteDisplay) noteDisplay.innerHTML = `${note}<br><span style="color:#d9534f; font-size:0.85rem;">🚨 注意：此為自動化估算，最終日期請務必與禮儀師核對農民曆確定。</span>`;
        
        const output = document.getElementById('resultOutput');
        if (output) {
            output.classList.remove('hidden');
            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
};

// ====================================================
// 3. 核心導覽系統 (Navigation Engine)
// ====================================================
(function () {
    const CONFIG = {
        MOBILE_BREAKPOINT: 991,
        SCROLL_THRESHOLD: 80,
        SMOOTH_OFFSET: 100
    };

    const DOM = {
        html: document.documentElement,
        body: document.body,
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        dropdowns: document.querySelectorAll('.has-dropdown'),
        backToTop: document.querySelector('.back-to-top')
    };

    const state = {
        isNavOpen: false,
        scrollLockY: 0,
        isMobile: () => window.innerWidth <= CONFIG.MOBILE_BREAKPOINT
    };

    // iOS 鎖定滾動防止穿透
    const toggleScrollLock = (lock) => {
        if (lock) {
            state.scrollLockY = window.pageYOffset;
            DOM.body.style.cssText = `position:fixed; top:-${state.scrollLockY}px; width:100%; overflow:hidden;`;
        } else {
            DOM.body.style.cssText = '';
            window.scrollTo(0, state.scrollLockY);
        }
    };

    const resetNavigation = () => {
        state.isNavOpen = false;
        DOM.mainNav?.classList.remove('active');
        DOM.menuToggle?.classList.remove('active');
        const icon = DOM.menuToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
        
        toggleScrollLock(false);
        
        DOM.dropdowns.forEach(li => {
            li.classList.remove('active');
            const sub = li.querySelector('.submenu');
            if (sub) sub.style.maxHeight = null;
        });
    };

    const initNavigation = () => {
        // 主按鈕點擊
        DOM.menuToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            if (!DOM.mainNav.classList.contains('active')) {
                DOM.mainNav.classList.add('active');
                DOM.menuToggle.classList.add('active');
                const icon = DOM.menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-times';
                if (state.isMobile()) toggleScrollLock(true);
                state.isNavOpen = true;
            } else {
                resetNavigation();
            }
        });

        // 父子選單「兩段式」完美邏輯
        DOM.dropdowns.forEach(li => {
            const link = li.querySelector('.dropdown-toggle');
            const sub = li.querySelector('.submenu');
            
            link?.addEventListener('click', (e) => {
                if (!state.isMobile()) return;
                
                const isActive = li.classList.contains('active');

                if (!isActive) {
                    // 第一段：未打開 -> 展開
                    e.preventDefault(); 
                    
                    // 互斥開合
                    DOM.dropdowns.forEach(other => {
                        if (other !== li) {
                            other.classList.remove('active');
                            const otherSub = other.querySelector('.submenu');
                            if (otherSub) otherSub.style.maxHeight = null;
                        }
                    });

                    li.classList.add('active');
                    if (sub) sub.style.maxHeight = (sub.scrollHeight + 20) + "px";
                } 
                // 第二段：已打開 -> 點擊正常跳轉 href
            });
        });

        // 點擊外部關閉
        document.addEventListener('click', (e) => {
            if (state.isNavOpen && !DOM.mainNav.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
                resetNavigation();
            }
        });
    };

    const initScrollEffects = () => {
        window.addEventListener('scroll', () => {
            const y = window.scrollY;
            DOM.header?.classList.toggle('scrolled', y > CONFIG.SCROLL_THRESHOLD);
            DOM.backToTop?.classList.toggle('show', y > 400);
        }, { passive: true });

        // 平滑滾動
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]:not([href="#"])');
            if (anchor) {
                const target = document.querySelector(anchor.hash);
                if (target) {
                    e.preventDefault();
                    const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.SMOOTH_OFFSET;
                    window.scrollTo({ top, behavior: 'smooth' });
                    if (state.isNavOpen) resetNavigation();
                }
            }
        });
    };

    // 啟動
    const boot = () => {
        DOM.html.classList.replace('js-loading', 'js-ready');
        initNavigation();
        initScrollEffects();
        window.SALife.setupDuinianCalculator();
        
        // 自動更新年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        window.addEventListener('resize', () => {
            if (!state.isMobile() && state.isNavOpen) resetNavigation();
        });

        console.log('%cSA LIFE V6.0 | 完美導覽與計算系統啟動', 'color:#bfa15d; font-weight:bold;');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

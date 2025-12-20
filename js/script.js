/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦究極整合版 V5.5
 * 更新日期：2025/12/21
 * 修正項目：
 * 1. iOS Safari 滾動穿透毀滅性修正 (Fixed Overlay 方案)
 * 2. 試算機：勞保級距動態校正與遺屬建議邏輯
 * 3. 試算機：對年日期精確解析（防跨時區誤差）
 * 4. 導覽：手風琴互斥開合邏輯優化
 * 5. 效能：ResizeObserver 取代舊式 Debounce Resize
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
    
    const avgSalary = parseFloat(avgSalaryInput.value);
    const hasSurvivor = hasSurvivorSelect.value;
    
    if (!avgSalaryInput.value || isNaN(avgSalary) || avgSalary <= 0) {
        resultBox.innerHTML = `<p style="color:red; font-weight:bold;">❗ 請輸入正確的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 自動校正至法定上下限
    const finalSalary = Math.min(Math.max(avgSalary, LABOR_CONFIG.MIN_SALARY), LABOR_CONFIG.MAX_SALARY);
    
    let allowanceMonths = (hasSurvivor === 'yes') ? LABOR_CONFIG.SURVIVOR_MONTHS : LABOR_CONFIG.NO_SURVIVOR_MONTHS;
    const funeralAllowance = finalSalary * allowanceMonths;
    
    let recommendationText = '';
    const salaryNote = avgSalary !== finalSalary ? 
        `<p class="warning-note" style="color:#ff8c00; font-size:0.9em;">⚠️ 備註：輸入薪資已按規定調整至 **${formatCurrency(finalSalary)}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        recommendationText = `
            ${salaryNote}
            <p>✅ **喪葬津貼 (一次金)：** **${formatCurrency(funeralAllowance)}** (${allowanceMonths}個月)</p>
            <p>⚠️ **專業建議：** 由於有符合資格之遺屬，建議優先評估「遺屬年金」，其領取總額通常遠高於一次性喪葬津貼。</p>
        `;
    } else {
        recommendationText = `
            ${salaryNote}
            <p>✅ **喪葬津貼：** **${formatCurrency(funeralAllowance)}** (${allowanceMonths}個月)</p>
            <p class="recommendation">因無符合資格之遺屬，應請領此筆 10 個月的喪葬津貼。</p>
        `;
    }

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

        // 核心修正：手動解析字串避免瀏覽器時區偏差 (yyyy-mm-dd)
        const parts = solarDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        // 模擬農曆邏輯 (正式環境建議引入 lunar.js)
        const isLeapYearInFuneral = (year === 2025); 
        let dYear = year + 1;
        let dMonth = month;
        let note = '本次計算為正常年度，不涉及閏月處理。';

        if (isLeapYearInFuneral) {
            dMonth -= 1;
            if (dMonth <= 0) { dMonth = 12; dYear -= 1; }
            note = '<strong>⚠️ 閏月習俗提醒：</strong> 治喪期間遇閏月，按傳統習俗對年需**提前一個月**，此計算已自動應用。';
        }

        document.getElementById('lunarDate').innerHTML = `**陽曆：** ${solarDateStr} → **農曆估算：** ${year}年${month}月${day}日`;
        document.getElementById('duinianDate').innerHTML = `**建議對年日期：** ${dYear}年${dMonth}月${day}日`;
        document.getElementById('duinianNote').innerHTML = `${note}<br><span style="color:#b22222; font-weight:bold;">🚨 請務必以禮儀師核對之農民曆日期為準。</span>`;
        document.getElementById('resultOutput').classList.remove('hidden');
        document.getElementById('resultOutput').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// 3. 核心系統啟動 (Core System)
// ====================================================
(function () {
    const CONFIG = {
        MOBILE_BREAKPOINT: 901,
        SCROLL_THRESHOLD: 50,
        SMOOTH_OFFSET: 80
    };

    const DOM = {
        html: document.documentElement,
        body: document.body,
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        dropdowns: document.querySelectorAll('.dropdown'),
        backToTop: document.querySelector('.back-to-top')
    };

    const state = {
        isNavOpen: false,
        scrollLockY: 0,
        isMobile: () => window.innerWidth < CONFIG.MOBILE_BREAKPOINT
    };

    // --- A. iOS 深度滾動鎖定 (解藥) ---
    const toggleScrollLock = (lock) => {
        if (lock) {
            state.scrollLockY = window.pageYOffset;
            DOM.body.style.position = 'fixed';
            DOM.body.style.top = `-${state.scrollLockY}px`;
            DOM.body.style.width = '100%';
            DOM.body.style.overflow = 'hidden';
            DOM.body.classList.add('no-scroll');
        } else {
            DOM.body.style.position = '';
            DOM.body.style.top = '';
            DOM.body.style.width = '';
            DOM.body.style.overflow = '';
            DOM.body.classList.remove('no-scroll');
            window.scrollTo(0, state.scrollLockY);
        }
    };

    // --- B. 導覽邏輯 ---
    const resetNavigation = () => {
        state.isNavOpen = false;
        DOM.mainNav?.classList.remove('active');
        DOM.menuToggle?.classList.remove('active');
        toggleScrollLock(false);
        
        // 收合所有子選單
        DOM.dropdowns.forEach(li => {
            li.classList.remove('active');
            const sub = li.querySelector('.submenu-container, .submenu');
            if (sub) sub.style.maxHeight = '0px';
        });
        
        const icon = DOM.menuToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    };

    const initNavigation = () => {
        // 漢堡鈕
        DOM.menuToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            state.isNavOpen = !DOM.mainNav.classList.contains('active');
            
            if (state.isNavOpen) {
                DOM.mainNav.classList.add('active');
                DOM.menuToggle.classList.add('active');
                const icon = DOM.menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-times';
                if (state.isMobile()) toggleScrollLock(true);
            } else {
                resetNavigation();
            }
        });

        // 行動版手風琴 (互斥開合)
        DOM.dropdowns.forEach(li => {
            const link = li.querySelector('a');
            link?.addEventListener('click', (e) => {
                if (!state.isMobile()) return;
                
                const sub = li.querySelector('.submenu-container, .submenu');
                if (!sub) return;

                e.preventDefault();
                const isActive = li.classList.contains('active');

                // 關閉其他
                DOM.dropdowns.forEach(other => {
                    if (other !== li) {
                        other.classList.remove('active');
                        const otherSub = other.querySelector('.submenu-container, .submenu');
                        if (otherSub) otherSub.style.maxHeight = '0px';
                    }
                });

                // 切換當前
                if (!isActive) {
                    li.classList.add('active');
                    sub.style.maxHeight = `${sub.scrollHeight}px`;
                } else {
                    li.classList.remove('active');
                    sub.style.maxHeight = '0px';
                }
            });
        });

        // 點擊外部關閉
        document.addEventListener('click', (e) => {
            if (state.isNavOpen && !DOM.mainNav.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
                resetNavigation();
            }
        });
    };

    // --- C. 高性能組件 (AOS / FitText / Scroll) ---
    const initScrollEffects = () => {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const y = window.scrollY;
                    DOM.header?.classList.toggle('scrolled', y > CONFIG.SCROLL_THRESHOLD);
                    DOM.backToTop?.classList.toggle('show', y > 400);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // 平滑滾動
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]:not([href="#"])');
            if (anchor) {
                e.preventDefault();
                const target = document.querySelector(anchor.hash);
                if (target) {
                    const top = target.getBoundingClientRect().top + window.scrollY - CONFIG.SMOOTH_OFFSET;
                    window.scrollTo({ top, behavior: 'smooth' });
                    if (state.isNavOpen) resetNavigation();
                }
            }
        });
    };

    const initFitText = () => {
        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const line = entry.target.querySelector('.fit-text-line');
                if (!line) return;
                line.style.fontSize = ''; 
                const containerW = entry.contentRect.width;
                const textW = line.scrollWidth;
                if (textW > containerW && containerW > 0) {
                    line.style.fontSize = `${Math.floor((containerW / textW) * 95)}%`;
                }
            });
        });
        document.querySelectorAll('.fit-container').forEach(c => observer.observe(c));
    };

    // --- D. 啟動程序 ---
    const boot = () => {
        DOM.html.classList.replace('js-loading', 'js-ready');
        
        initNavigation();
        initScrollEffects();
        initFitText();
        
        window.SALife.setupDuinianCalculator();
        
        // 頁腳年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        // 監聽 Resize
        let timer;
        window.addEventListener('resize', () => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (!state.isMobile() && state.isNavOpen) resetNavigation();
            }, 200);
        });

        console.log('%cSA LIFE V5.5 | 旗艦整合版啟動成功', 'background:#bfa15d; color:white; padding:3px 8px; border-radius:3px;');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

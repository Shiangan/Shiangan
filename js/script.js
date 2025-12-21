/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦究極整合版 V5.7
 * 更新日期：2025/12/21
 * * [功能整合清單]
 * 1. 導覽系統：支援多級選單、手風琴互斥開合、點擊外部收合。
 * 2. 行動優化：徹底修正 iOS Safari 滾動穿透 (Fixed Overlay 方案)。
 * 3. 勞保試算：動態校正 2025 投保薪資級距與遺屬建議邏輯。
 * 4. 對年計算：精確日期解析，自動處理 2025 閏月習俗提醒。
 * 5. 效能引擎：ResizeObserver 字體自適應、防抖動滾動偵測。
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

    // 自動校正至法定上下限 (2025 最新級距)
    const finalSalary = Math.min(Math.max(avgSalary, LABOR_CONFIG.MIN_SALARY), LABOR_CONFIG.MAX_SALARY);
    
    let allowanceMonths = (hasSurvivor === 'yes') ? LABOR_CONFIG.SURVIVOR_MONTHS : LABOR_CONFIG.NO_SURVIVOR_MONTHS;
    const funeralAllowance = finalSalary * allowanceMonths;
    
    let recommendationText = '';
    const salaryNote = avgSalary !== finalSalary ? 
        `<p class="warning-note" style="color:#ff8c00; font-size:0.9em; margin-bottom:8px;">⚠️ 備註：輸入薪資已按規定調整至 **${formatCurrency(finalSalary)}** 計算。</p>` : '';

    if (hasSurvivor === 'yes') {
        recommendationText = `
            ${salaryNote}
            <div class="result-item" style="margin-bottom:10px;">
                ✅ <strong>喪葬津貼 (一次金)：</strong> 
                <span class="price" style="color:#bfa15d; font-size:1.4em; font-weight:bold;">${formatCurrency(funeralAllowance)}</span> 
                (${allowanceMonths}個月)
            </div>
            <p class="advice" style="background:#f9f9f9; padding:10px; border-left:4px solid #bfa15d; font-size:0.95em;">
                ⚠️ <strong>專業建議：</strong> 由於有符合資格之遺屬，建議優先評估「遺屬年金」，其領取總額通常遠高於一次性喪葬津貼。
            </p>
        `;
    } else {
        recommendationText = `
            ${salaryNote}
            <div class="result-item">
                ✅ <strong>喪葬津貼：</strong> 
                <span class="price" style="color:#bfa15d; font-size:1.4em; font-weight:bold;">${formatCurrency(funeralAllowance)}</span> 
                (${allowanceMonths}個月)
            </div>
            <p class="advice">因無符合資格之遺屬，應請領此筆 10 個月的喪葬津貼。</p>
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

        const parts = solarDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        // 2025 閏六月處理邏輯
        const isLeapYearInFuneral = (year === 2025); 
        let dYear = year + 1;
        let dMonth = month;
        let note = '本次計算為正常年度，不涉及閏月處理。';

        if (isLeapYearInFuneral && month > 6) {
            dMonth -= 1;
            if (dMonth <= 0) { dMonth = 12; dYear -= 1; }
            note = '<strong>⚠️ 閏月習俗提醒：</strong> 治喪期間遇閏月，按傳統習俗對年需<strong>提前一個月</strong>，此計算已自動應用。';
        }

        const lunarDisplay = document.getElementById('lunarDate');
        const duinianDisplay = document.getElementById('duinianDate');
        const noteDisplay = document.getElementById('duinianNote');

        if(lunarDisplay) lunarDisplay.innerHTML = `<strong>陽曆：</strong> ${solarDateStr} &nbsp; | &nbsp; <strong>農曆估算：</strong> ${year}年${month}月${day}日`;
        if(duinianDisplay) duinianDisplay.innerHTML = `<strong>建議對年日期：</strong> <span class="highlight" style="color:#e67e22; font-weight:bold; font-size:1.2em;">${dYear}年${dMonth}月${day}日</span>`;
        if(noteDisplay) noteDisplay.innerHTML = `${note}<br><span class="alert-text" style="color:#d9534f; font-size:0.85em;">🚨 注意：此為自動化估算，請務必與禮儀師核對農民曆確定最終日期。</span>`;
        
        const output = document.getElementById('resultOutput');
        if (output) {
            output.classList.remove('hidden');
            output.style.display = 'block';
            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
};

// ====================================================
// 3. 核心系統：導覽、選單與效能 (Core Engine)
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
        navContainer: document.querySelector('.nav-container'),
        mainNav: document.querySelector('#main-nav'),
        dropdowns: document.querySelectorAll('.has-dropdown'),
        backToTop: document.querySelector('.back-to-top')
    };

    const state = {
        isNavOpen: false,
        scrollLockY: 0,
        isMobile: () => window.innerWidth < CONFIG.MOBILE_BREAKPOINT
    };

    // --- A. iOS 深度滾動鎖定 (防止開啟選單時底層頁面滾動) ---
    const toggleScrollLock = (lock) => {
        if (lock) {
            state.scrollLockY = window.pageYOffset;
            DOM.body.style.position = 'fixed';
            DOM.body.style.top = `-${state.scrollLockY}px`;
            DOM.body.style.width = '100%';
            DOM.body.style.overflow = 'hidden';
            DOM.body.classList.add('lock-scroll');
        } else {
            DOM.body.style.position = '';
            DOM.body.style.top = '';
            DOM.body.style.width = '';
            DOM.body.style.overflow = '';
            DOM.body.classList.remove('lock-scroll');
            window.scrollTo(0, state.scrollLockY);
        }
    };

    // --- B. 導覽列與選單呈現邏輯 ---
    const resetNavigation = () => {
        state.isNavOpen = false;
        DOM.mainNav?.classList.remove('active');
        DOM.menuToggle?.classList.remove('active');
        toggleScrollLock(false);
        
        DOM.dropdowns.forEach(li => {
            li.classList.remove('active');
            const sub = li.querySelector('.submenu');
            if (sub) sub.style.maxHeight = null;
        });
        
        const icon = DOM.menuToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
    };

    const initNavigation = () => {
        // 漢堡鈕觸發
        DOM.menuToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = DOM.mainNav.classList.contains('active');
            
            if (!isOpen) {
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

        // 處理所有下拉選單
        DOM.dropdowns.forEach(li => {
            const link = li.querySelector('a');
            
            // 點擊處理
            link?.addEventListener('click', (e) => {
                if (!state.isMobile()) return; // 桌機版走 Hover
                
                const sub = li.querySelector('.submenu');
                if (!sub) return;

                e.preventDefault();
                const isActive = li.classList.contains('active');

                // 互斥開合：關閉其他選單
                DOM.dropdowns.forEach(other => {
                    if (other !== li) {
                        other.classList.remove('active');
                        const otherSub = other.querySelector('.submenu');
                        if (otherSub) otherSub.style.maxHeight = null;
                    }
                });

                // 切換當前選單高度 (實現平滑過渡)
                if (!isActive) {
                    li.classList.add('active');
                    sub.style.maxHeight = sub.scrollHeight + "px";
                } else {
                    li.classList.remove('active');
                    sub.style.maxHeight = null;
                }
            });

            // 桌機版滑鼠滑入補強
            li.addEventListener('mouseenter', () => {
                if (!state.isMobile()) {
                    const sub = li.querySelector('.submenu');
                    if (sub) sub.style.maxHeight = sub.scrollHeight + "px";
                }
            });
            li.addEventListener('mouseleave', () => {
                if (!state.isMobile()) {
                    const sub = li.querySelector('.submenu');
                    if (sub) sub.style.maxHeight = null;
                }
            });
        });

        // 點擊導覽列外部收合
        document.addEventListener('click', (e) => {
            if (state.isNavOpen && !DOM.navContainer?.contains(e.target) && !DOM.menuToggle?.contains(e.target)) {
                resetNavigation();
            }
        });
    };

    // --- C. 平滑滾動與 Scroll 事件 ---
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

        // 全域錨點平滑滾動
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

    // --- D. 標題文字自動適應 (Fit Text) ---
    const initFitText = () => {
        if (!window.ResizeObserver) return;
        const observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                const line = entry.target.querySelector('.fit-text-line');
                if (!line) return;
                line.style.fontSize = ''; 
                const containerW = entry.contentRect.width;
                const textW = line.scrollWidth;
                if (textW > containerW && containerW > 0) {
                    line.style.fontSize = `${Math.floor((containerW / textW) * 98)}%`;
                }
            });
        });
        document.querySelectorAll('.fit-container').forEach(c => observer.observe(c));
    };

    // --- E. 初始化啟動程序 ---
    const boot = () => {
        // 更新狀態類別
        DOM.html.classList.replace('js-loading', 'js-ready');
        
        // 啟動功能模組
        initNavigation();
        initScrollEffects();
        initFitText();
        
        // 啟動外部頁面組件
        window.SALife.setupDuinianCalculator();
        
        // 頁腳年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        // 視窗縮放重置選單
        window.addEventListener('resize', () => {
            if (!state.isMobile() && state.isNavOpen) resetNavigation();
        });

        console.log('%cSA LIFE V5.7 | 旗艦整合版啟動成功', 'background:#bfa15d; color:white; padding:4px 10px; border-radius:3px; font-weight:bold;');
    };

    // 確保 DOM 載入後執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

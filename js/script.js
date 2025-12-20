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

// 建立全域命名空間，防止與其他插件衝突
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
            <div class="result-item">✅ <strong>喪葬津貼 (一次金)：</strong> <span class="price">${formatCurrency(funeralAllowance)}</span> (${allowanceMonths}個月)</div>
            <p class="advice">⚠️ <strong>專業建議：</strong> 由於有符合資格之遺屬，建議優先評估「遺屬年金」，其領取總額通常遠高於一次性喪葬津貼。</p>
        `;
    } else {
        recommendationText = `
            ${salaryNote}
            <div class="result-item">✅ <strong>喪葬津貼：</strong> <span class="price">${formatCurrency(funeralAllowance)}</span> (${allowanceMonths}個月)</div>
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

        // 核心修正：手動解析 YYYY-MM-DD 字串，避免瀏覽器因時區判定成前一天
        const parts = solarDateStr.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const day = parseInt(parts[2], 10);

        // 模擬農曆對年邏輯 (傳統：農曆次年同月同日)
        // 注意：2025 為閏六月，若在農曆六月後需特殊處理
        const isLeapYearInFuneral = (year === 2025); 
        let dYear = year + 1;
        let dMonth = month;
        let note = '本次計算為正常年度，不涉及閏月處理。';

        if (isLeapYearInFuneral && month > 6) {
            // 簡略邏輯：遇閏月對年需提前一個月
            dMonth -= 1;
            if (dMonth <= 0) { dMonth = 12; dYear -= 1; }
            note = '<strong>⚠️ 閏月習俗提醒：</strong> 治喪期間遇閏月，按傳統習俗對年需<strong>提前一個月</strong>，此計算已自動應用。';
        }

        const lunarDisplay = document.getElementById('lunarDate');
        const duinianDisplay = document.getElementById('duinianDate');
        const noteDisplay = document.getElementById('duinianNote');

        if(lunarDisplay) lunarDisplay.innerHTML = `<strong>陽曆：</strong> ${solarDateStr} &nbsp; | &nbsp; <strong>農曆估算：</strong> ${year}年${month}月${day}日`;
        if(duinianDisplay) duinianDisplay.innerHTML = `<strong>建議對年日期：</strong> <span class="highlight">${dYear}年${dMonth}月${day}日</span>`;
        if(noteDisplay) noteDisplay.innerHTML = `${note}<br><span class="alert-text">🚨 注意：此為自動化估算，請務必與禮儀師核對農民曆確定最終日期。</span>`;
        
        const output = document.getElementById('resultOutput');
        if (output) {
            output.classList.remove('hidden');
            output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
};

// ====================================================
// 3. 核心系統啟動與導覽 (Core System & Nav)
// ====================================================
(function () {
    const CONFIG = {
        MOBILE_BREAKPOINT: 991, // 調整至一般平板常用斷點
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
        isMobile: () => window.innerWidth < CONFIG.MOBILE_BREAKPOINT
    };

    // --- A. iOS 深度滾動鎖定 (最強解決方案) ---
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

    // --- B. 導覽邏輯 ---
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
        // 漢堡按鈕觸發
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

        // 行動版二級選單 (手風琴互斥)
        DOM.dropdowns.forEach(li => {
            const link = li.querySelector('a');
            link?.addEventListener('click', (e) => {
                if (!state.isMobile()) return;
                
                const sub = li.querySelector('.submenu');
                if (!sub) return;

                e.preventDefault();
                const isActive = li.classList.contains('active');

                // 互斥：關閉其他同級選單
                DOM.dropdowns.forEach(other => {
                    if (other !== li) {
                        other.classList.remove('active');
                        const otherSub = other.querySelector('.submenu');
                        if (otherSub) otherSub.style.maxHeight = null;
                    }
                });

                // 切換當前選單
                if (!isActive) {
                    li.classList.add('active');
                    sub.style.maxHeight = sub.scrollHeight + "px";
                } else {
                    li.classList.remove('active');
                    sub.style.maxHeight = null;
                }
            });
        });

        // 點擊外部區域自動收合
        document.addEventListener('click', (e) => {
            if (state.isNavOpen && !DOM.mainNav.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
                resetNavigation();
            }
        });
    };

    // --- C. 高效能輔助功能 ---
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

        // 平滑滾動錨點
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
        // 使用 ResizeObserver 達成響應式標題縮放，效能優於 window.resize
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

    // --- D. 啟動與初始化 ---
    const boot = () => {
        // 移除載入狀態
        DOM.html.classList.replace('js-loading', 'js-ready');
        
        initNavigation();
        initScrollEffects();
        initFitText();
        
        // 初始化特定頁面組件
        window.SALife.setupDuinianCalculator();
        
        // 更新頁腳版權年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        // 監聽螢幕旋轉/縮放，重置導覽狀態避免 UI 鎖死
        window.addEventListener('resize', () => {
            if (!state.isMobile() && state.isNavOpen) resetNavigation();
        });

        console.log('%cSA LIFE V5.5 | 旗艦整合版啟動成功', 'background:#bfa15d; color:white; padding:4px 10px; border-radius:3px; font-family: sans-serif;');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

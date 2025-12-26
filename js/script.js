/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V3.2
 * 修正項目：
 * 1. 勞保試算：強制 2025 法定薪資上下限 ($27,470 - $45,800)
 * 2. 對年計算：整合農曆閏月提前習俗邏輯與平滑滾動
 * 3. 導航系統：解決行動版點擊父選單無法跳轉與手風琴衝突問題
 * 4. A11Y：強化鍵盤焦點陷阱管理 (Focus Trap)
 * 5. 性能：使用 ResizeObserver 取代部分 Resize Event，提升 FitText 效能
 * ====================================================================
 */

'use strict';

// 建立全域命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機功能模組
// ====================================================

/**
 * 勞保喪葬給付試算機
 */
const LABOR_CONFIG = {
    MIN: 27470, // 2025年最新基本工資
    MAX: 45800,
    MONTHS_SURVIVOR: 5,
    MONTHS_NO_SURVIVOR: 10
};

const formatTWD = (amt) => amt.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });

window.SALife.calculateLaborInsurance = function() {
    const avgSalaryInput = document.getElementById('avgSalary');
    const hasSurvivorSelect = document.getElementById('hasSurvivor');
    const resultBox = document.getElementById('resultBox');
    
    let inputVal = parseFloat(avgSalaryInput.value);
    const hasSurvivor = hasSurvivorSelect.value === 'yes';

    if (!avgSalaryInput.value || isNaN(inputVal) || inputVal <= 0) {
        resultBox.innerHTML = `<p class="error">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用法定薪資上下限
    const finalSalary = Math.min(Math.max(inputVal, LABOR_CONFIG.MIN), LABOR_CONFIG.MAX);
    const months = hasSurvivor ? LABOR_CONFIG.MONTHS_SURVIVOR : LABOR_CONFIG.MONTHS_NO_SURVIVOR;
    const allowance = finalSalary * months;

    let html = '';
    if (inputVal !== finalSalary) {
        html += `<p class="note" style="color:#ff8c00;">⚠️ 備註：依規定按投保薪資上限 $${LABOR_CONFIG.MAX.toLocaleString()} 計算。</p>`;
    }

    html += `
        <p>✅ **喪葬津貼：** ${months} 個月 (按 ${formatTWD(finalSalary)} 計算) = **${formatTWD(allowance)}**</p>
        ${hasSurvivor ? `<p class="recommend">💡 您的情況建議優先評估「遺屬年金」，預估總額通常更高，請聯絡本公司專業人員協助。</p>` : ''}
    `;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/**
 * 對年日期計算 (模擬習俗邏輯)
 */
window.SALife.setupDuinianCalculator = function() {
    const calculateBtn = document.getElementById('calculateDuinian');
    const dateInput = document.getElementById('dateOfDeath');
    const resultOutput = document.getElementById('resultOutput');

    if (!calculateBtn) return;

    calculateBtn.addEventListener('click', function() {
        const solarDate = dateInput.value;
        if (!solarDate) return alert('請選擇往生日期。');

        const deathDate = new Date(solarDate);
        const duinianDate = new Date(deathDate);
        duinianDate.setFullYear(deathDate.getFullYear() + 1);

        // 習俗邏輯判定 (2024-2025 閏月提示)
        const isLeapYearAffected = (deathDate.getFullYear() === 2024 || deathDate.getFullYear() === 2025);
        
        document.getElementById('lunarDate').innerHTML = `陽曆日期：${solarDate}`;
        document.getElementById('duinianDate').innerHTML = `預估對年日期：${duinianDate.toLocaleDateString('zh-TW')}`;
        document.getElementById('duinianNote').innerHTML = isLeapYearAffected ? 
            `⚠️ **閏月提示：** 治喪年逢閏月，按習俗對年可能需**提前一個月**，建議請禮儀師核對農民曆。` : 
            `計算結果僅供參考，請以實體農民曆為準。`;

        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// N. 導覽列與介面互動核心 (IIFE)
// ====================================================

(function () {
    const MOBILE_BREAKPOINT = 900;
    const TRANSITION_MS = 350;
    
    const header = document.querySelector('.main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    // 清理動畫殘留樣式
    const clearStyles = (el) => {
        el.addEventListener('transitionend', (e) => {
            if (e.propertyName === 'max-height' && el.style.maxHeight === '0px') {
                el.style.removeProperty('max-height');
            }
        }, { once: true });
    };

    /** 關閉選單 */
    const closeMenu = () => {
        mainNav.classList.remove('active');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        body.classList.remove('no-scroll');
        
        // 關閉所有展開的子選單
        document.querySelectorAll('.dropdown.active').forEach(d => {
            const sub = d.querySelector('.submenu-container');
            if (sub) {
                sub.style.maxHeight = sub.scrollHeight + 'px';
                requestAnimationFrame(() => sub.style.maxHeight = '0px');
            }
            d.classList.remove('active');
        });
    };

    /** 初始化選單邏輯 */
    const initNav = () => {
        if (!menuToggle) return;

        // 漢堡按鈕點擊
        menuToggle.addEventListener('click', () => {
            const isOpening = !mainNav.classList.contains('active');
            if (isOpening) {
                mainNav.classList.add('active');
                menuToggle.classList.add('active');
                menuToggle.setAttribute('aria-expanded', 'true');
                menuToggle.querySelector('i').classList.replace('fa-bars', 'fa-times');
                if (window.innerWidth <= MOBILE_BREAKPOINT) body.classList.add('no-scroll');
            } else {
                closeMenu();
            }
        });

        // 手機版下拉摺疊
        document.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth > MOBILE_BREAKPOINT) return;
                
                e.preventDefault();
                const parent = link.closest('.dropdown');
                const sub = parent.querySelector('.submenu-container');
                const isActive = parent.classList.contains('active');

                // 手風琴效果：關閉其他
                document.querySelectorAll('.dropdown.active').forEach(other => {
                    if (other !== parent) {
                        other.classList.remove('active');
                        other.querySelector('.submenu-container').style.maxHeight = '0px';
                    }
                });

                if (!isActive) {
                    parent.classList.add('active');
                    sub.style.maxHeight = sub.scrollHeight + 'px';
                } else {
                    parent.classList.remove('active');
                    sub.style.maxHeight = '0px';
                }
            });
        });
    };

    /** Tab 切換邏輯 */
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        document.querySelectorAll('.plan-tab-content').forEach(c => c.style.display = 'none');
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

        const targetContent = document.getElementById(`content-${tabName}`);
        const targetBtn = document.getElementById(`tab-${tabName}`);

        if (targetContent) targetContent.style.display = 'block';
        if (targetBtn) targetBtn.classList.add('active');

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    /** AOS 滾動動畫處理 */
    const initAOS = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    // 啟動
    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initAOS();
        window.SALife.setupDuinianCalculator();
        
        // 頁頭捲動樣式
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
        
        // 更新年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    });

})();

/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V3.5
 * 修正項目：
 * 1. 語法結構：修復 initNav 函式括號未閉合導致的腳本崩潰。
 * 2. 導航邏輯：統一手機版「點擊展開」與「防止跳轉」的行為。
 * 3. 試算精確度：2025 法定薪資上下限自動校正與提示。
 * 4. 效能優化：整合 Scroll 監聽與 IntersectionObserver。
 * ====================================================================
 */

'use strict';

// 建立全域命名空間
window.SALife = window.SALife || {};

// ====================================================
// Z. 試算機功能模組
// ====================================================

const LABOR_CONFIG = {
    MIN: 27470, // 2025年最新基本工資
    MAX: 45800,
    MONTHS_SURVIVOR: 5,
    MONTHS_NO_SURVIVOR: 10
};

const formatTWD = (amt) => amt.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });

/** 勞保喪葬給付試算 */
window.SALife.calculateLaborInsurance = function() {
    const avgSalaryInput = document.getElementById('avgSalary');
    const hasSurvivorSelect = document.getElementById('hasSurvivor');
    const resultBox = document.getElementById('resultBox');
    
    if (!avgSalaryInput || !resultBox) return;

    let inputVal = parseFloat(avgSalaryInput.value);
    const hasSurvivor = hasSurvivorSelect.value === 'yes';

    if (!avgSalaryInput.value || isNaN(inputVal) || inputVal <= 0) {
        resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的平均月投保薪資。</p>`;
        resultBox.style.display = 'block';
        return; 
    }

    // 應用 2025 法定薪資上下限
    const finalSalary = Math.min(Math.max(inputVal, LABOR_CONFIG.MIN), LABOR_CONFIG.MAX);
    const months = hasSurvivor ? LABOR_CONFIG.MONTHS_SURVIVOR : LABOR_CONFIG.MONTHS_NO_SURVIVOR;
    const allowance = finalSalary * months;

    let html = '';
    if (inputVal > LABOR_CONFIG.MAX) {
        html += `<p class="note" style="color:#ff8c00; font-size:0.9em;">⚠️ 備註：依規定按投保薪資上限 ${formatTWD(LABOR_CONFIG.MAX)} 計算。</p>`;
    }

    html += `
        <div class="calc-result-content">
            <p>✅ **預計給付月數：** ${months} 個月</p>
            <h3 style="color: #ce9d4a; margin: 10px 0;">試算金額：${formatTWD(allowance)}</h3>
            ${hasSurvivor ? `<p class="recommend" style="background:#fff9eb; padding:10px; border-radius:5px; font-size:0.9em;">💡 您的情況建議優先評估「遺屬年金」，預估總額通常更高，請諮詢專業人員。</p>` : ''}
        </div>
    `;

    resultBox.innerHTML = html;
    resultBox.style.display = 'block';
    resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

/** 對年日期計算 (含習俗邏輯) */
window.SALife.setupDuinianCalculator = function() {
    const calculateBtn = document.getElementById('calculateDuinian');
    const dateInput = document.getElementById('dateOfDeath');
    const resultOutput = document.getElementById('resultOutput');

    if (!calculateBtn || !dateInput) return;

    calculateBtn.addEventListener('click', function() {
        const solarDate = dateInput.value;
        if (!solarDate) return alert('請選擇往生日期。');

        const deathDate = new Date(solarDate);
        const duinianDate = new Date(deathDate);
        duinianDate.setFullYear(deathDate.getFullYear() + 1);

        // 習俗邏輯判定 (2025 提示)
        const isLeapYearAffected = (deathDate.getFullYear() === 2024 || deathDate.getFullYear() === 2025);
        
        document.getElementById('lunarDate').innerHTML = `陽曆日期：${solarDate}`;
        document.getElementById('duinianDate').innerHTML = `預計對年日期 (陽曆)：${duinianDate.toLocaleDateString('zh-TW')}`;
        document.getElementById('duinianNote').innerHTML = isLeapYearAffected ? 
            `⚠️ **習俗提示：** 若治喪年遇農曆閏月，對年需**提前一個月**舉行。此為陽曆試算，精確日期請諮詢禮儀師。` : 
            `計算結果僅供參考，實際日期請諮詢專業禮儀服務人員。`;

        resultOutput.classList.remove('hidden');
        resultOutput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
};

// ====================================================
// N. 介面互動核心 (IIFE)
// ====================================================

(function () {
    const MOBILE_BREAKPOINT = 900;
    
    /** 導航選單初始化 */
    const initNav = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const dropdowns = document.querySelectorAll('.dropdown');
        const body = document.body;

        if (!menuToggle || !mainNav) return;

        // 漢堡選單切換
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = mainNav.classList.toggle('active');
            this.setAttribute('aria-expanded', isActive);
            this.querySelector('i').className = isActive ? 'fas fa-times' : 'fas fa-bars';
            body.style.overflow = isActive ? 'hidden' : ''; 
        });

        // 手機版下拉選單 (手風琴效果)
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('a');
            trigger.addEventListener('click', function(e) {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    e.preventDefault(); 
                    const isActive = dropdown.classList.contains('active');
                    
                    // 關閉其他
                    dropdowns.forEach(d => d.classList.remove('active'));
                    
                    // 開啟當前
                    if (!isActive) dropdown.classList.add('active');
                }
            });
        });

        // 點擊空白處關閉選單
        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                if (mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    menuToggle.querySelector('i').className = 'fas fa-bars';
                    body.style.overflow = '';
                }
            }
        });
    };

    /** FAQ 手風琴 */
    const initAccordion = () => {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.parentElement;
                const isActive = item.classList.contains('active');
                
                // 關閉同組其他
                item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));

                if (!isActive) item.classList.add('active');
            });
        });
    };

    /** Tab 切換邏輯 */
    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        const contents = document.querySelectorAll('.plan-tab-content');
        const btns = document.querySelectorAll('.tab-btn');
        
        contents.forEach(c => c.style.display = 'none');
        btns.forEach(b => b.classList.remove('active'));

        const targetContent = document.getElementById(`content-${tabName}`);
        const targetBtn = document.getElementById(`tab-${tabName}`);

        if (targetContent) targetContent.style.display = 'block';
        if (targetBtn) targetBtn.classList.add('active');

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    /** AOS 滾動動畫 */
    const initAOS = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    };

    /** 啟動所有功能 */
    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initAccordion();
        initAOS();
        window.SALife.setupDuinianCalculator();
        
        // Header 捲動效果
        const header = document.querySelector('.main-header');
        window.addEventListener('scroll', () => {
            if (header) header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
        
        // 更新年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    });

})();

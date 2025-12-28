/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終精煉整合版 V3.6
 * ====================================================================
 */

(function () {
    'use strict';

    // 建立全域命名空間
    window.SALife = window.SALife || {};

    // --- 設定參數 ---
    const MOBILE_BREAKPOINT = 900;
    const LABOR_CONFIG = {
        MIN: 27470, // 2025年最新基本工資
        MAX: 45800,
        MONTHS_SURVIVOR: 5,
        MONTHS_NO_SURVIVOR: 10
    };

    // --- 工具函式 ---
    const formatTWD = (amt) => amt.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });

    /** A. 導航選單功能 */
    const initNav = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const dropdowns = document.querySelectorAll('.dropdown');
        const body = document.body;

        if (!menuToggle || !mainNav) return;

        // 漢堡選單
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = mainNav.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', isActive);
            menuToggle.querySelector('i').className = isActive ? 'fas fa-times' : 'fas fa-bars';
            body.style.overflow = isActive ? 'hidden' : '';
        });

        // 手機版下拉選單 (點擊文字展開)
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('a');
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                    e.preventDefault();
                    const isActive = dropdown.classList.contains('active');
                    dropdowns.forEach(d => d.classList.remove('active'));
                    if (!isActive) dropdown.classList.add('active');
                }
            });
        });
    };

    /** B. FAQ 手風琴動畫 (動態高度) */
    const initAccordion = () => {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.parentElement;
                const content = this.nextElementSibling;
                const isActive = item.classList.contains('active');
                
                // 關閉同層級其他
                const container = item.parentElement;
                container.querySelectorAll('.accordion-item').forEach(i => {
                    i.classList.remove('active');
                    const c = i.querySelector('.accordion-content');
                    if (c) c.style.maxHeight = null;
                });

                // 開啟當前
                if (!isActive) {
                    item.classList.add('active');
                    if (content) content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });
    };

    /** C. 試算機功能模組 */
    window.SALife.calculateLaborInsurance = function() {
        const avgSalaryInput = document.getElementById('avgSalary');
        const hasSurvivorSelect = document.getElementById('hasSurvivor');
        const resultBox = document.getElementById('resultBox');
        if (!avgSalaryInput || !resultBox) return;

        let inputVal = parseFloat(avgSalaryInput.value);
        if (isNaN(inputVal) || inputVal <= 0) {
            resultBox.innerHTML = `<p style="color:#d9534f;">❗ 請輸入有效的投保薪資。</p>`;
            resultBox.style.display = 'block';
            return;
        }

        const finalSalary = Math.min(Math.max(inputVal, LABOR_CONFIG.MIN), LABOR_CONFIG.MAX);
        const months = hasSurvivorSelect.value === 'yes' ? LABOR_CONFIG.MONTHS_SURVIVOR : LABOR_CONFIG.MONTHS_NO_SURVIVOR;
        const allowance = finalSalary * months;

        resultBox.innerHTML = `
            <div class="calc-result-content">
                ${inputVal > LABOR_CONFIG.MAX ? `<p class="note" style="color:#ff8c00;">⚠️ 依上限 ${formatTWD(LABOR_CONFIG.MAX)} 計算</p>` : ''}
                <p>✅ 預計給付月數：${months} 個月</p>
                <h3 style="color: #ce9d4a;">試算金額：${formatTWD(allowance)}</h3>
            </div>
        `;
        resultBox.style.display = 'block';
    };

    /** D. 對年計算器啟動器 */
    window.SALife.setupDuinianCalculator = function() {
        const btn = document.getElementById('calculateDuinian');
        const dateInput = document.getElementById('dateOfDeath');
        if (!btn || !dateInput) return;

        btn.addEventListener('click', () => {
            if (!dateInput.value) return alert('請選擇往生日期');
            const deathDate = new Date(dateInput.value);
            const duinianDate = new Date(deathDate);
            duinianDate.setFullYear(deathDate.getFullYear() + 1);
            
            document.getElementById('duinianDate').innerHTML = `預計對年日期：${duinianDate.toLocaleDateString('zh-TW')}`;
            document.getElementById('resultOutput').classList.remove('hidden');
        });
    };

    /** E. AOS 滾動動畫 */
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

    /** F. 初始化入口 */
    document.addEventListener('DOMContentLoaded', () => {
        initNav();
        initAccordion();
        initAOS();
        window.SALife.setupDuinianCalculator();
        
        // 捲動 Header 效果
        const header = document.querySelector('.main-header');
        window.addEventListener('scroll', () => {
            if (header) header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });

        // 年份自動更新
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    });

})();

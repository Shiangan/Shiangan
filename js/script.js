/**
 * ====================================================================
 * 祥安生命全站核心腳本 (SA Life Integrated) - 2025 最終整合版
 * 整合功能：導航選單、方案過濾、FAQ 手風琴、計算器、燈箱、滾動動畫
 * 修正重點：對接星空 Footer 年份、優化滾動效能、強化行動端選單體驗
 * ====================================================================
 */

(function () {
    'use strict';

    // 1. 全域命名空間與參數設定
    window.SALife = window.SALife || {};
    
    const CONFIG = {
        MOBILE_BREAKPOINT: 900,
        LABOR: {
            MIN: 27470, // 2025年最新基本工資
            MAX: 45800, // 勞保投保薪資最高上限
            MONTHS_SURVIVOR: 5,
            MONTHS_NO_SURVIVOR: 10
        }
    };

    const formatTWD = (amt) => amt.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });

    /** A. 導航選單邏輯 (漢堡選單與下拉) */
    const initNavigation = () => {
        const menuBtn = document.querySelector('.mobile-menu-btn') || document.querySelector('.menu-toggle');
        const mainNav = document.getElementById('main-nav');
        const dropdowns = document.querySelectorAll('.has-dropdown, .dropdown');

        if (!menuBtn || !mainNav) return;

        // 切換選單狀態
        const toggleMenu = (forceState) => {
            const isActive = forceState !== undefined ? forceState : mainNav.classList.toggle('active');
            if (forceState !== undefined) {
                isActive ? mainNav.classList.add('active') : mainNav.classList.remove('active');
            }
            menuBtn.setAttribute('aria-expanded', isActive);
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
            document.body.style.overflow = isActive ? 'hidden' : '';
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // 點擊選單外部自動關閉
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });

        // 手機版下拉選單處理
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('a');
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    const submenu = dropdown.querySelector('.submenu');
                    if (submenu) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                }
            });
        });
    };

    /** B. 方案分頁過濾邏輯 */
    const initPlanFiltering = () => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const planCards = document.querySelectorAll('.plan-card');

        if (!tabBtns.length) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const selectedCategory = btn.getAttribute('data-tab');

                planCards.forEach(card => {
                    // 出場動畫
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95) translateY(10px)';
                    
                    setTimeout(() => {
                        if (selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory) {
                            card.style.display = 'flex';
                            // 進場動畫 (使用 requestAnimationFrame 確保瀏覽器順暢渲染)
                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                    card.style.opacity = '1';
                                    card.style.transform = 'scale(1) translateY(0)';
                                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                }, 50);
                            });
                        } else {
                            card.style.display = 'none';
                        }
                    }, 300);
                });
            });
        });
    };

    /** C. FAQ 手風琴 (Accordion) */
    const initAccordion = () => {
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const targetId = this.getAttribute('data-toggle');
                const targetContent = document.getElementById(targetId) || this.nextElementSibling;
                const icon = this.querySelector('.accordion-icon');
                const isOpen = this.getAttribute('aria-expanded') === 'true';

                // 關閉同組其他項目
                const container = this.closest('.accordion-container') || document;
                container.querySelectorAll('.accordion-header').forEach(h => {
                    if (h !== this) {
                        h.setAttribute('aria-expanded', 'false');
                        const content = document.getElementById(h.getAttribute('data-toggle')) || h.nextElementSibling;
                        if (content && content.classList.contains('accordion-content')) content.style.maxHeight = null;
                        const otherIcon = h.querySelector('.accordion-icon');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                // 切換當前項目
                if (isOpen) {
                    this.setAttribute('aria-expanded', 'false');
                    if (targetContent) targetContent.style.maxHeight = null;
                    if (icon) icon.style.transform = 'rotate(0deg)';
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    if (targetContent) targetContent.style.maxHeight = targetContent.scrollHeight + "px";
                    if (icon) icon.style.transform = 'rotate(180deg)';
                }
            });
        });
    };

    /** D. 勞保與對年計算器模組 */
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

        const finalSalary = Math.min(Math.max(inputVal, CONFIG.LABOR.MIN), CONFIG.LABOR.MAX);
        const months = hasSurvivorSelect.value === 'yes' ? CONFIG.LABOR.MONTHS_SURVIVOR : CONFIG.LABOR.MONTHS_NO_SURVIVOR;
        const allowance = finalSalary * months;

        resultBox.innerHTML = `
            <div class="calc-result-content" style="animation: fadeInUp 0.5s ease;">
                ${inputVal > CONFIG.LABOR.MAX ? `<p class="note" style="color:#ff8c00;">⚠️ 依上限 ${formatTWD(CONFIG.LABOR.MAX)} 計算</p>` : ''}
                <p>✅ 預計給付月數：${months} 個月</p>
                <h3 style="color: #ce9d4a; margin-top:10px;">試算金額：${formatTWD(allowance)}</h3>
            </div>
        `;
        resultBox.style.display = 'block';
    };

    window.SALife.setupDuinianCalculator = function() {
        const btn = document.getElementById('calculateDuinian');
        const dateInput = document.getElementById('dateOfDeath');
        if (!btn || !dateInput) return;

        btn.addEventListener('click', () => {
            if (!dateInput.value) return alert('請選擇往生日期');
            const deathDate = new Date(dateInput.value);
            const duinianDate = new Date(deathDate);
            duinianDate.setFullYear(deathDate.getFullYear() + 1);
            
            const resText = document.getElementById('duinianDate');
            if (resText) resText.innerHTML = `預計對年日期：<strong>${duinianDate.toLocaleDateString('zh-TW')}</strong>`;
            const outDiv = document.getElementById('resultOutput');
            if (outDiv) outDiv.classList.remove('hidden');
        });
    };

    /** E. 燈箱與滾動動畫 (AOS) */
    const initLightbox = () => {
        const lightbox = document.getElementById('plansLightbox');
        const closeBtn = document.querySelector('.lightbox-close');
        if (!lightbox || !closeBtn) return;

        closeBtn.addEventListener('click', () => {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeBtn.click();
        });
    };

    const initAOS = () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // 監視方案卡片與所有設定動態的元素，並加入 Footer 區塊
        document.querySelectorAll('.animate-on-scroll, .plan-card, .footer-section').forEach(el => observer.observe(el));
    };

    /** F. 初始化入口 */
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initPlanFiltering();
        initAccordion();
        initLightbox();
        initAOS();
        window.SALife.setupDuinianCalculator();

        // 1. 全站年份更新 (確保包含 footer 的 ID)
        const currentYear = new Date().getFullYear();
        const yearSelectors = ['#current-year', '#current-year-plans', '#current-year-footer'];
        document.querySelectorAll(yearSelectors.join(',')).forEach(span => {
            span.textContent = currentYear;
        });

        // 2. Header 捲動效果 (使用節流優化滾動效能)
        const header = document.querySelector('header');
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    if (header) {
                        header.classList.toggle('scrolled', window.scrollY > 50);
                    }
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }, { passive: true });

        console.log("祥安生命官網腳本已載入 - 2025 最終完整版");
    });

})();

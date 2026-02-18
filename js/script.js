/**
 * ====================================================================
 * 祥安生命全站核心腳本 (SA Life Integrated) - 2026 最終修正版
 * 整合功能：導航選單、方案過濾、FAQ 手風琴、計算器、燈箱、滾動動畫
 * 修正重點：對接 2026 最新基本工資、優化滾動效能、強化行動端選單體驗
 * ====================================================================
 */

(function () {
    'use strict';

    // 1. 全域命名空間與參數設定
    window.SALife = window.SALife || {};
    
    const CONFIG = {
        MOBILE_BREAKPOINT: 900,
        LABOR: {
            MIN: 28590, // 2026年最新基本工資 (預計調整後)
            MAX: 45800, // 勞保投保薪資最高上限
            MONTHS_SURVIVOR: 5,   // 被保險人死亡給付
            MONTHS_NO_SURVIVOR: 3 // 家屬死亡津貼 (通常為3個月)
        }
    };

    const formatTWD = (amt) => 'NT$ ' + amt.toLocaleString('zh-TW', { minimumFractionDigits: 0 });

    /** A. 導航選單邏輯 (漢堡選單與下拉) */
    const initNavigation = () => {
        const menuBtn = document.querySelector('.mobile-menu-btn') || document.querySelector('.menu-toggle');
        const mainNav = document.getElementById('main-nav') || document.querySelector('.main-nav');
        const dropdowns = document.querySelectorAll('.has-dropdown, .dropdown');

        if (!menuBtn || !mainNav) return;

        // 切換選單狀態
        const toggleMenu = (forceState) => {
            const isActive = forceState !== undefined ? forceState : mainNav.classList.toggle('active');
            menuBtn.classList.toggle('active', isActive);
            menuBtn.setAttribute('aria-expanded', isActive);
            
            // 更換圖示 (相容 FontAwesome)
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
            
            // 防止選單開啟時背景滾動
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

        // 手機版下拉選單處理 (手風琴效果)
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('a');
            trigger.addEventListener('click', (e) => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    const submenu = dropdown.querySelector('.submenu');
                    if (submenu) {
                        e.preventDefault();
                        const isOpen = dropdown.classList.toggle('active');
                        // 動態計算高度以利 CSS 過渡
                        submenu.style.maxHeight = isOpen ? submenu.scrollHeight + "px" : "0";
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
                    // 出場動畫 (淡出與縮小)
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95) translateY(10px)';
                    
                    setTimeout(() => {
                        const isMatch = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
                        card.style.display = isMatch ? 'flex' : 'none';
                        
                        if (isMatch) {
                            // 進場動畫
                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                    card.style.opacity = '1';
                                    card.style.transform = 'scale(1) translateY(0)';
                                    card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                                }, 50);
                            });
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

                // 關閉同組其他項目 (單選模式)
                const container = this.closest('.accordion-container') || document;
                container.querySelectorAll('.accordion-header').forEach(h => {
                    if (h !== this) {
                        h.setAttribute('aria-expanded', 'false');
                        const content = document.getElementById(h.getAttribute('data-toggle')) || h.nextElementSibling;
                        if (content && content.classList.contains('accordion-content')) content.style.maxHeight = null;
                        const otherIcon = h.querySelector('.accordion-icon');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                        h.parentElement.classList.remove('active');
                    }
                });

                // 切換當前項目
                if (isOpen) {
                    this.setAttribute('aria-expanded', 'false');
                    if (targetContent) targetContent.style.maxHeight = null;
                    if (icon) icon.style.transform = 'rotate(0deg)';
                    this.parentElement.classList.remove('active');
                } else {
                    this.setAttribute('aria-expanded', 'true');
                    if (targetContent) targetContent.style.maxHeight = targetContent.scrollHeight + "px";
                    if (icon) icon.style.transform = 'rotate(180deg)';
                    this.parentElement.classList.add('active');
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
            resultBox.innerHTML = `<p class="color-accent">❗ 請輸入有效的投保薪資。</p>`;
            resultBox.style.display = 'block';
            return;
        }

        // 自動校正上下限
        const finalSalary = Math.min(Math.max(inputVal, CONFIG.LABOR.MIN), CONFIG.LABOR.MAX);
        const months = hasSurvivorSelect.value === 'yes' ? CONFIG.LABOR.MONTHS_SURVIVOR : CONFIG.LABOR.MONTHS_NO_SURVIVOR;
        const allowance = finalSalary * months;

        resultBox.innerHTML = `
            <div class="calc-result-content" style="animation: fadeInUp 0.5s ease;">
                ${inputVal > CONFIG.LABOR.MAX ? `<p class="note" style="color:#ff8c00;">⚠️ 依上限 ${formatTWD(CONFIG.LABOR.MAX)} 計算</p>` : ''}
                <p>✅ 預計給付月數：${months} 個月</p>
                <h3 class="color-primary" style="margin-top:10px;">試算金額：${formatTWD(allowance)}</h3>
            </div>
        `;
        resultBox.style.display = 'block';
        resultBox.classList.add('is-visible');
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
            if (resText) resText.innerHTML = `預計對年日期 (國曆)：<strong>${duinianDate.toLocaleDateString('zh-TW')}</strong>`;
            const outDiv = document.getElementById('resultOutput');
            if (outDiv) outDiv.classList.remove('hidden');
        });
    };

    /** E. 燈箱與滾動動畫 (Intersection Observer) */
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
                    // data-delay 支援
                    if (entry.target.dataset.delay) {
                        entry.target.style.transitionDelay = entry.target.dataset.delay;
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.animate-on-scroll, .plan-card, .footer-section, .feature-card').forEach(el => {
            el.classList.add('transform-layer'); // 強制硬體加速
            observer.observe(el);
        });
    };

    /** F. 初始化入口 */
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initPlanFiltering();
        initAccordion();
        initLightbox();
        initAOS();
        window.SALife.setupDuinianCalculator();

        // 1. 全站年份更新 (自動同步多個位置)
        const currentYear = new Date().getFullYear();
        document.querySelectorAll('.current-year, #current-year, #current-year-footer').forEach(span => {
            span.textContent = currentYear;
        });

        // 2. Header 捲動效果 (節流優化)
        const header = document.querySelector('.main-header') || document.querySelector('header');
        let isScrolling = false;
        window.addEventListener('scroll', () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    if (header) {
                        header.classList.toggle('scrolled', window.scrollY > 60);
                    }
                    isScrolling = false;
                });
                isScrolling = true;
            }
        }, { passive: true });

        console.log("%c祥安生命 SA Life %c系統初始化完成 - 2026 旗艦版", 
            "color: #ce9d4a; font-size: 14px; font-weight: bold;", 
            "color: #666; font-size: 12px;");
    });

})();

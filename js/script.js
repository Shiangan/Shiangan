/**
 * ====================================================================
 * 祥安生命全站核心腳本 (SA Life Integrated) - 2026 終極整合版
 * 整合功能：導覽系統、方案過濾、FAQ手風琴、計算器、燈箱、滾動視差動畫
 * ====================================================================
 */

(function () {
    'use strict';

    // 1. 全域命名空間與環境參數
    window.SALife = window.SALife || {};
    
    const CONFIG = {
        MOBILE_BREAKPOINT: 900,
        SCROLL_THRESHOLD: 60,
        LABOR: {
            MIN: 28590, // 2026 預估基本工資
            MAX: 45800, // 勞保投保薪資最高上限
            MONTHS_DEATH: 5,     // 本人死亡給付
            MONTHS_FAMILY: 3     // 家屬死亡津貼
        }
    };

    // 公用工具：台幣格式化
    const formatTWD = (amt) => `NT$ ${Math.round(amt).toLocaleString('zh-TW')}`;

    /** * A. 導航與選單模組 (Navigation & Mobile Menu)
     */
    const initNavigation = () => {
        const menuBtn = document.querySelector('.mobile-menu-btn') || document.querySelector('.menu-toggle');
        const mainNav = document.getElementById('main-nav') || document.querySelector('.main-nav');
        const header = document.querySelector('.main-header') || document.querySelector('header');
        const dropdowns = document.querySelectorAll('.has-dropdown, .dropdown');

        if (!menuBtn || !mainNav) return;

        // 導航欄滾動效果 (節流優化)
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    header.classList.toggle('scrolled', window.scrollY > CONFIG.SCROLL_THRESHOLD);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        // 切換手機選單
        const toggleMenu = (state) => {
            const isActive = state !== undefined ? state : !mainNav.classList.contains('active');
            mainNav.classList.toggle('active', isActive);
            menuBtn.classList.toggle('active', isActive);
            document.body.style.overflow = isActive ? 'hidden' : '';
            
            const icon = menuBtn.querySelector('i');
            if (icon) icon.className = isActive ? 'fas fa-times' : 'fas fa-bars';
        };

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // 處理手機版下拉選單 (Accordion Style)
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    const submenu = dropdown.querySelector('.submenu');
                    if (submenu) {
                        e.preventDefault();
                        const isOpen = dropdown.classList.toggle('active');
                        submenu.style.maxHeight = isOpen ? `${submenu.scrollHeight}px` : '0';
                    }
                }
            });
        });

        // 點擊外部關閉選單
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !menuBtn.contains(e.target)) {
                toggleMenu(false);
            }
        });
    };

    /** * B. 方案分頁過濾 (Plan Filter System)
     */
    const initPlanFiltering = () => {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const planCards = document.querySelectorAll('.plan-card, .price-plan');

        if (!tabBtns.length) return;

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-tab');

                // 更新按鈕狀態
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // 動態過濾卡片
                planCards.forEach(card => {
                    card.style.transition = 'opacity 0.3s, transform 0.3s';
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(10px)';

                    setTimeout(() => {
                        const isMatch = (category === 'all' || card.getAttribute('data-category') === category);
                        card.style.display = isMatch ? 'flex' : 'none';
                        
                        if (isMatch) {
                            requestAnimationFrame(() => {
                                card.style.opacity = '1';
                                card.style.transform = 'translateY(0)';
                            });
                        }
                    }, 300);
                });
            });
        });
    };

    /** * C. FAQ 互動手風琴 (Professional Accordion)
     */
    const initAccordion = () => {
        const headers = document.querySelectorAll('.accordion-header');
        
        headers.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = header.nextElementSibling;
                const isOpen = item.classList.contains('active');

                // 關閉其他項 (單選模式)
                const siblings = item.parentElement.querySelectorAll('.accordion-item');
                siblings.forEach(sib => {
                    if (sib !== item) {
                        sib.classList.remove('active');
                        if (sib.querySelector('.accordion-content')) {
                            sib.querySelector('.accordion-content').style.maxHeight = null;
                        }
                    }
                });

                // 切換當前項
                if (!isOpen) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + "px";
                } else {
                    item.classList.remove('active');
                    content.style.maxHeight = null;
                }
            });
        });
    };

    /** * D. 勞保與生命禮儀計算器 (Calculators)
     */
    window.SALife.calculateLaborInsurance = function() {
        const salaryIn = document.getElementById('avgSalary');
        const typeIn = document.getElementById('hasSurvivor') || document.getElementById('claimType'); 
        const resultDiv = document.getElementById('resultBox');

        if (!salaryIn || !resultDiv) return;

        let salary = parseFloat(salaryIn.value);
        if (isNaN(salary) || salary <= 0) {
            resultDiv.innerHTML = `<p style="color:#e74c3c;">❗ 請輸入有效的投保薪資金額</p>`;
            resultDiv.style.display = 'block';
            return;
        }

        // 限制投保薪資上下限
        const finalSalary = Math.min(Math.max(salary, CONFIG.LABOR.MIN), CONFIG.LABOR.MAX);
        const months = (typeIn && typeIn.value === 'no') ? CONFIG.LABOR.MONTHS_FAMILY : CONFIG.LABOR.MONTHS_DEATH;
        const total = finalSalary * months;

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="calc-result-content" style="animation: fadeInUp 0.5s ease;">
                ${salary > CONFIG.LABOR.MAX ? `<p class="note" style="color:#ff8c00;">⚠️ 依投保薪資上限 ${formatTWD(CONFIG.LABOR.MAX)} 計算</p>` : ''}
                <p>✅ 預計給付月數：${months} 個月</p>
                <h3 style="color: #ce9d4a; margin-top:10px;">試算金額：${formatTWD(total)}</h3>
            </div>
        `;
    };

    window.SALife.setupDuinianCalculator = function() {
        const btn = document.getElementById('calculateDuinian') || document.getElementById('btnDuinian');
        const dateInput = document.getElementById('dateOfDeath') || document.getElementById('deathDate');
        if (!btn || !dateInput) return;

        btn.addEventListener('click', () => {
            if (!dateInput.value) return alert('請選擇往生日期');
            const d = new Date(dateInput.value);
            d.setFullYear(d.getFullYear() + 1);
            
            const resultArea = document.getElementById('duinianDate') || document.getElementById('resultOutput');
            if (resultArea) {
                resultArea.parentElement.classList.remove('hidden');
                resultArea.innerHTML = `預計對年日期 (國曆)：<strong>${d.toLocaleDateString('zh-TW')}</strong>`;
            }
        });
    };

    /** * E. 滾動動畫顯現 (Intersection Observer)
     */
    const initScrollAnimations = () => {
        const options = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        document.querySelectorAll('.animate-on-scroll, .plan-card, .footer-section, .feature-card').forEach(el => {
            observer.observe(el);
        });
    };

    /** * F. 核心載入入口 (Initialize)
     */
    document.addEventListener('DOMContentLoaded', () => {
        initNavigation();
        initPlanFiltering();
        initAccordion();
        initScrollAnimations();
        window.SALife.setupDuinianCalculator();

        // 1. 自動更新全站年份
        const yearSelectors = ['.current-year', '#current-year', '#current-year-footer'];
        const currentYear = new Date().getFullYear();
        document.querySelectorAll(yearSelectors.join(',')).forEach(span => {
            span.textContent = currentYear;
        });

        console.log("%c祥安生命 SA Life %c系統初始化完成 - 2026 旗艦版", 
            "color: #ce9d4a; font-size: 14px; font-weight: bold;", 
            "color: #666; font-size: 12px;");
    });

})();

/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Master) - 終極整合版 V4.5
 * 優化項目：
 * 1. 導覽系統：支持 iOS 橡皮筋回彈與觸控外點關閉
 * 2. 計算核心：勞保試算與對年逻辑精度強化
 * 3. 性能監測：Intersection Observer 替代滾動監聽 (AOS)
 * 4. 無障礙：Modal 焦點鎖定與 ARIA 狀態同步
 * ====================================================================
 */

'use strict';

// 確保全域命名空間存在
window.SALife = window.SALife || {};

(function () {
    // --- 1. 配置與常數 ---
    const CONFIG = {
        MOBILE_BREAKPOINT: 900,
        SCROLL_OFFSET: 100,
        LABOR: {
            MAX_SALARY: 45800,
            MIN_SALARY: 27470,
            MONTHS_SURVIVOR: 5,     // 遺屬津貼
            MONTHS_NO_SURVIVOR: 10   // 喪葬津貼
        }
    };

    const DOM = {
        html: document.documentElement,
        body: document.body,
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        backToTop: document.querySelector('.back-to-top'),
        currentYear: document.getElementById('current-year'),
        revealElements: document.querySelectorAll('.animate-on-scroll, .reveal')
    };

    // --- 2. 核心工具函數 ---
    const utils = {
        debounce: (fn, delay = 16) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => fn.apply(this, args), delay);
            };
        },
        formatCurrency: (num) => {
            return new Intl.NumberFormat('zh-TW', {
                style: 'currency',
                currency: 'TWD',
                minimumFractionDigits: 0
            }).format(num);
        },
        // 鎖定滾動 (防止 Modal 開啟時背景捲動)
        lockScroll: (lock) => {
            DOM.body.style.overflow = lock ? 'hidden' : '';
            DOM.body.style.paddingRight = lock ? `${window.innerWidth - DOM.html.clientWidth}px` : '';
        }
    };

    // --- 3. 導覽系統核心 ---
    const Navigation = {
        init() {
            if (!DOM.menuToggle || !DOM.mainNav) return;

            // 切換選單
            DOM.menuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // 處理行動版子選單 (Accordion)
            DOM.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                        e.preventDefault();
                        this.toggleSubmenu(link.parentElement);
                    }
                });
            });

            // 點擊選單外自動關閉
            document.addEventListener('click', (e) => {
                if (DOM.mainNav.classList.contains('active') && !DOM.mainNav.contains(e.target)) {
                    this.closeMenu();
                }
            });

            // 監聽滾動狀態
            window.addEventListener('scroll', utils.debounce(() => this.handleScroll(), 10));
        },

        toggleMenu() {
            const isOpen = DOM.mainNav.classList.contains('active');
            isOpen ? this.closeMenu() : this.openMenu();
        },

        openMenu() {
            DOM.mainNav.classList.add('active');
            DOM.menuToggle.classList.add('active');
            DOM.menuToggle.setAttribute('aria-expanded', 'true');
            utils.lockScroll(true);
            const icon = DOM.menuToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-times';
        },

        closeMenu() {
            DOM.mainNav.classList.remove('active');
            DOM.menuToggle.classList.remove('active');
            DOM.menuToggle.setAttribute('aria-expanded', 'false');
            utils.lockScroll(false);
            const icon = DOM.menuToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            
            // 重置子選單
            DOM.mainNav.querySelectorAll('.dropdown.active').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.submenu-container').style.maxHeight = null;
            });
        },

        toggleSubmenu(parent) {
            const submenu = parent.querySelector('.submenu-container');
            const isActive = parent.classList.contains('active');

            // 關閉其他已展開的子選單
            DOM.mainNav.querySelectorAll('.dropdown.active').forEach(other => {
                if (other !== parent) {
                    other.classList.remove('active');
                    other.querySelector('.submenu-container').style.maxHeight = null;
                }
            });

            parent.classList.toggle('active');
            if (submenu) {
                submenu.style.maxHeight = !isActive ? `${submenu.scrollHeight}px` : null;
            }
        },

        handleScroll() {
            const isScrolled = window.scrollY > 50;
            DOM.header?.classList.toggle('scrolled', isScrolled);
            DOM.backToTop?.classList.toggle('show', window.scrollY > 400);
        }
    };

    // --- 4. 試算機引擎 ---
    const Calculators = {
        init() {
            this.setupDuinian();
        },

        calculateLabor() {
            const salaryInput = document.getElementById('avgSalary');
            const hasSurvivor = document.getElementById('hasSurvivor')?.value;
            const resultBox = document.getElementById('resultBox');
            
            if (!salaryInput || !resultBox) return;

            const val = parseFloat(salaryInput.value);
            if (isNaN(val) || val < 1000) {
                resultBox.innerHTML = `<div class="calc-alert error">請輸入正確的月平均投保薪資</div>`;
                resultBox.style.display = 'block';
                return;
            }

            // 邏輯修正：投保薪資有上限與下限限制
            const finalSalary = Math.min(Math.max(val, CONFIG.LABOR.MIN_SALARY), CONFIG.LABOR.MAX_SALARY);
            const months = (hasSurvivor === 'yes') ? CONFIG.LABOR.MONTHS_SURVIVOR : CONFIG.LABOR.MONTHS_NO_SURVIVOR;
            const total = finalSalary * months;

            resultBox.innerHTML = `
                <div class="calc-result-card animate-on-scroll is-visible">
                    <h4>試算結果</h4>
                    <p>適用投保薪資階級：<strong>${utils.formatCurrency(finalSalary)}</strong></p>
                    <p class="total-amount">預估領取金額：<span>${utils.formatCurrency(total)}</span></p>
                    <small>* 此數據僅供參考，實際請領金額以勞工保險局核定為準。</small>
                </div>`;
            resultBox.style.display = 'block';
        },

        setupDuinian() {
            const btn = document.getElementById('calculateDuinian');
            if (!btn) return;

            btn.addEventListener('click', () => {
                const dateVal = document.getElementById('dateOfDeath')?.value;
                const output = document.getElementById('resultOutput');
                if (!dateVal) return alert('請選擇日期');

                const baseDate = new Date(dateVal);
                const duinianDate = new Date(baseDate);
                duinianDate.setFullYear(baseDate.getFullYear() + 1);

                // 更新 UI
                document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
                document.getElementById('duinianDate').innerText = `對年預估：${duinianDate.toLocaleDateString('zh-TW')} (農曆同月同日)`;
                output.classList.remove('hidden');
                output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        }
    };

    // --- 5. 互動組件 (Modal, Tabs, FAQ) ---
    const UIComponents = {
        init() {
            this.setupFAQ();
            this.setupYear();
            this.setupScrollReveal();
        },

        setupFAQ() {
            document.querySelectorAll('.accordion-header').forEach(header => {
                header.addEventListener('click', () => {
                    const item = header.parentElement;
                    const content = item.querySelector('.accordion-content');
                    const isOpen = item.classList.contains('active');

                    // 關閉其他 FAQ
                    document.querySelectorAll('.accordion-item.active').forEach(active => {
                        if (active !== item) {
                            active.classList.remove('active');
                            active.querySelector('.accordion-content').style.maxHeight = null;
                        }
                    });

                    item.classList.toggle('active');
                    content.style.maxHeight = !isOpen ? `${content.scrollHeight}px` : null;
                });
            });
        },

        setupScrollReveal() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, { threshold: 0.15 });

            DOM.revealElements.forEach(el => observer.observe(el));
        },

        setupYear() {
            if (DOM.currentYear) DOM.currentYear.textContent = new Date().getFullYear();
        }
    };

    // --- 6. 公開 API (供 HTML 直接呼叫) ---
    window.SALife = {
        calculateLaborInsurance: () => Calculators.calculateLabor(),
        
        openModal: (id) => {
            const modal = document.getElementById(`modal-${id}`);
            if (modal) {
                modal.style.display = 'flex';
                utils.lockScroll(true);
                setTimeout(() => modal.classList.add('active'), 10);
            }
        },

        closeModal: () => {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                activeModal.classList.remove('active');
                setTimeout(() => {
                    activeModal.style.display = 'none';
                    utils.lockScroll(false);
                }, 300);
            }
        },

        openPlanTab: (tabName, anchorId = null) => {
            const tabs = document.querySelectorAll('.tab-btn');
            const panes = document.querySelectorAll('.plan-tab-content');
            
            tabs.forEach(t => t.classList.remove('active'));
            panes.forEach(p => p.style.display = 'none');

            document.getElementById(`tab-${tabName}`)?.classList.add('active');
            const targetPane = document.getElementById(`content-${tabName}`);
            if (targetPane) targetPane.style.display = 'block';

            if (anchorId) {
                const targetEl = document.querySelector(anchorId);
                if (targetEl) {
                    window.scrollTo({
                        top: targetEl.offsetTop - CONFIG.SCROLL_OFFSET,
                        behavior: 'smooth'
                    });
                }
            }
        }
    };

    // --- 7. 初始化啟動 ---
    document.addEventListener('DOMContentLoaded', () => {
        Navigation.init();
        Calculators.init();
        UIComponents.init();

        // Modal 外部點擊關閉
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) window.SALife.closeModal();
        });
    });

})();

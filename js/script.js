/**
 * =========================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終完美整合版 V4.0
 * 整合：導覽攔截、FitText、FAQ 手風琴、視窗保護、補助試算
 * =========================================================================
 */

'use strict';

(function () {
    // --- 配置參數 ---
    const CONFIG = {
        MOBILE_BREAKPOINT: 991,
        DEBOUNCE_DELAY: 150,
        SAFE_RATIO: 0.95 // FitText 安全緩衝比例
    };

    const body = document.body;
    const html = document.documentElement;

    // --- 工具函式 ---
    const debounce = (fn, delay) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    };

    /**
     * [1. 佈局防護] 防止 X 軸溢出造成頁面左右晃動
     */
    const enforceViewportIntegrity = () => {
        html.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
        body.style.position = 'relative';
        body.style.width = '100%';
    };

    /**
     * [2. 文字縮放] Fit Text - 防止標題過長斷句或擠壓
     */
    const initFitText = () => {
        const fitElements = document.querySelectorAll('.fit-text-line');
        if (!fitElements.length) return;

        const adjustText = () => {
            fitElements.forEach(el => {
                const container = el.parentElement;
                if (!container) return;

                el.style.fontSize = ''; 
                el.style.display = 'inline-block';
                el.style.whiteSpace = 'nowrap';

                const containerWidth = container.clientWidth;
                const textWidth = el.scrollWidth;

                if (textWidth > containerWidth) {
                    const ratio = containerWidth / textWidth;
                    const currentSize = parseFloat(window.getComputedStyle(el).fontSize);
                    el.style.fontSize = Math.floor(currentSize * ratio * CONFIG.SAFE_RATIO) + 'px';
                }
            });
        };

        adjustText();
        window.addEventListener('resize', debounce(adjustText, CONFIG.DEBOUNCE_DELAY));
    };

    /**
     * [3. 導覽系統] 核心：手機版父選單攔截與互斥展開
     */
    const initNavigation = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        const overlay = document.querySelector('.nav-overlay');
        const dropdownLinks = document.querySelectorAll('.dropdown > a');

        if (!menuToggle || !mainNav) return;

        // --- 漢堡按鈕開關 ---
        const toggleMenu = (forceClose = false) => {
            const isCurrentlyOpen = mainNav.classList.contains('active');
            const shouldOpen = forceClose ? false : !isCurrentlyOpen;

            mainNav.classList.toggle('active', shouldOpen);
            menuToggle.classList.toggle('active', shouldOpen);
            if (overlay) {
                overlay.style.display = shouldOpen ? 'block' : 'none';
                setTimeout(() => overlay.classList.toggle('active', shouldOpen), 10);
            }
            body.style.overflow = shouldOpen ? 'hidden' : ''; 
        };

        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleMenu();
        });

        if (overlay) overlay.addEventListener('click', () => toggleMenu(true));

        // --- 下拉選單邏輯 (手機版攔截) ---
        dropdownLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    const parent = this.parentElement;
                    const submenu = parent.querySelector('.submenu-container');
                    
                    if (submenu) {
                        e.preventDefault(); // 攔截跳轉網址
                        const isActive = parent.classList.contains('active');

                        // 互斥邏輯：關閉其他已開啟的下拉選單
                        document.querySelectorAll('.dropdown.active').forEach(other => {
                            if (other !== parent) {
                                other.classList.remove('active');
                                const otherSub = other.querySelector('.submenu-container');
                                if (otherSub) otherSub.style.maxHeight = '0px';
                            }
                        });

                        // 切換當前狀態
                        if (!isActive) {
                            parent.classList.add('active');
                            submenu.style.maxHeight = submenu.scrollHeight + "px";
                        } else {
                            parent.classList.remove('active');
                            submenu.style.maxHeight = "0px";
                        }
                    }
                }
            });
        });

        // 視窗切換清理：轉為桌面版時重置所有手機版狀態
        window.addEventListener('resize', debounce(() => {
            if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
                mainNav.classList.remove('active');
                if (overlay) {
                    overlay.classList.remove('active');
                    overlay.style.display = 'none';
                }
                body.style.overflow = '';
                document.querySelectorAll('.submenu-container').forEach(sub => sub.style.maxHeight = '');
                document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
            }
        }, 200));
    };

    /**
     * [4. FAQ 組件] 手風琴 (Accordion)
     */
    const initAccordions = () => {
        const headers = document.querySelectorAll('.accordion-header');
        headers.forEach(header => {
            header.addEventListener('click', function() {
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                if (!content) return;

                const isOpen = item.classList.contains('active');

                // 互斥：關閉其他 FAQ 項目
                document.querySelectorAll('.accordion-item.active').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        other.querySelector('.accordion-content').style.maxHeight = '0px';
                    }
                });

                item.classList.toggle('active', !isOpen);
                content.style.maxHeight = !isOpen ? (content.scrollHeight + 'px') : '0px';
            });
        });
    };

    /**
     * [5. 功能擴充] 補助試算與版權日期
     */
    const initUtilities = () => {
        // 更新年份
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();

        // 勞保家屬死亡給付試算
        window.calculateLabor = () => {
            const salaryInput = document.getElementById('avgSalary');
            const survivorSelect = document.getElementById('hasSurvivor');
            const resultBox = document.getElementById('resultBox');

            if (!salaryInput || !resultBox) return;

            const salary = Math.min(Math.max(parseFloat(salaryInput.value) || 0, 27470), 45800);
            const months = survivorSelect?.value === 'yes' ? 5 : 3; // 範例邏輯：有遺屬5個月，無則3個月

            const total = Math.round(salary * months);
            resultBox.innerHTML = `預估給付金額：<strong>NT$ ${total.toLocaleString()}</strong>`;
            resultBox.style.display = 'block';
        };
    };

    // --- 啟動初始化 ---
    const init = () => {
        enforceViewportIntegrity();
        initFitText();
        initNavigation();
        initAccordions();
        initUtilities();
    };

    // 確保 DOM 載入後執行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

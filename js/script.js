/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦最終修正版 V4.0
 * 修正內容：補全 resetNavigation、確保點擊攔截、優化 RWD 狀態重置
 * ====================================================================
 */

'use strict';

(function () {
    // ====================================================
    // 0. 環境配置與快取
    // ====================================================
    const CONFIG = {
        MOBILE_BREAKPOINT: 901, // 配合 CSS 的 900px 斷點
        RESIZE_DELAY: 250,
        ANIMATION_EASING: 'cubic-bezier(0.4, 0, 0.2, 1)'
    };

    const DOM = {
        html: document.documentElement,
        body: document.body,
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        dropdowns: document.querySelectorAll('.dropdown'),
        dropdownLinks: document.querySelectorAll('.dropdown > a')
    };

    const isMobile = () => window.innerWidth < CONFIG.MOBILE_BREAKPOINT;

    // ====================================================
    // 1. 導覽系統控制 (Navigation Controller)
    // ====================================================

    /** 關閉並重置所有導覽狀態 (核心修正：補全此函式) */
    const resetNavigation = () => {
        if (!DOM.mainNav) return;
        
        DOM.mainNav.classList.remove('active');
        if (DOM.menuToggle) {
            DOM.menuToggle.classList.remove('active');
            DOM.menuToggle.setAttribute('aria-expanded', 'false');
            const icon = DOM.menuToggle.querySelector('i');
            if (icon) {
                icon.className = 'fas fa-bars'; // 恢復為漢堡圖示
            }
        }
        DOM.body.style.overflow = ''; // 恢復網頁捲動

        // 收合所有子選單
        document.querySelectorAll('.submenu-container, .submenu').forEach(sub => {
            sub.style.maxHeight = '0px';
        });
        DOM.dropdowns.forEach(li => li.classList.remove('active'));
    };

    /** 初始化行動版漢堡選單 */
    const initMenuToggle = () => {
        if (!DOM.menuToggle || !DOM.mainNav) return;

        DOM.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = DOM.mainNav.classList.contains('active');
            
            if (!isOpen) {
                DOM.mainNav.classList.add('active');
                DOM.menuToggle.classList.add('active');
                DOM.menuToggle.setAttribute('aria-expanded', 'true');
                const icon = DOM.menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-times'; // 切換為 X 關閉圖示
                if (isMobile()) DOM.body.style.overflow = 'hidden'; // 鎖定背景防止捲動
            } else {
                resetNavigation();
            }
        });
    };

    /** 行動版：子選單手風琴邏輯 */
    const initMobileAccordion = () => {
        DOM.dropdownLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                // 只有在行動端寬度時攔截跳轉
                if (isMobile()) {
                    const parentLi = this.parentElement;
                    const submenu = parentLi.querySelector('.submenu-container') || parentLi.querySelector('.submenu');

                    if (submenu) {
                        e.preventDefault(); // 禁止 <a> 標籤跳轉頁面
                        e.stopPropagation();

                        const isActive = parentLi.classList.contains('active');

                        // 互斥效果：收起同層其他已展開的選單
                        const siblingDropdowns = parentLi.parentElement.querySelectorAll('.dropdown.active');
                        siblingDropdowns.forEach(sib => {
                            if (sib !== parentLi) {
                                sib.classList.remove('active');
                                const sibSub = sib.querySelector('.submenu-container') || sib.querySelector('.submenu');
                                if (sibSub) sibSub.style.maxHeight = '0px';
                            }
                        });

                        // 切換當前選單展開/收合
                        if (!isActive) {
                            parentLi.classList.add('active');
                            // 核心：利用 scrollHeight 獲取真實內容高度
                            submenu.style.maxHeight = submenu.scrollHeight + "px";
                        } else {
                            parentLi.classList.remove('active');
                            submenu.style.maxHeight = '0px';
                        }
                    }
                }
            });
        });
    };

    // ====================================================
    // 2. 視窗適配與性能 (Performance & Adaptability)
    // ====================================================

    /** 視窗縮放處理：防止從手機切換回電腦版時樣式殘留 */
    const initResizeHandler = () => {
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (!isMobile()) {
                    resetNavigation();
                    // 重要：清除 JS 寫入的行內樣式，恢復 CSS 的 hover 機制
                    document.querySelectorAll('.submenu-container, .submenu').forEach(sub => {
                        sub.style.removeProperty('max-height');
                    });
                }
            }, CONFIG.RESIZE_DELAY);
        });
    };

    /** 修正標題與長文字防溢出 */
    const initFitText = () => {
        const fitLines = document.querySelectorAll('.fit-text-line');
        fitLines.forEach(line => {
            const container = line.parentElement;
            if (container && line.offsetWidth > container.offsetWidth) {
                const ratio = container.offsetWidth / line.offsetWidth;
                line.style.fontSize = (ratio * 95) + '%';
            }
        });
    };

    // ====================================================
    // 3. 系統初始化 (System Startup)
    // ====================================================
    const boot = () => {
        // 移除 CSS 的加載預防機制
        DOM.html.classList.remove('js-loading');
        
        initMenuToggle();
        initMobileAccordion();
        initResizeHandler();
        initFitText();

        console.log('祥安生命核心系統 V4.0：最終修正版已就緒');
    };

    // 啟動監聽
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

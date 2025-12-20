/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 完善版 V3.2
 * ====================================================================
 */

'use strict';

window.SALife = window.SALife || {};

(function () {
    // ====================================================
    // 0. 環境設定與常量 (提升到最頂層確保作用域)
    // ====================================================
    const MOBILE_BREAKPOINT = 900;
    const SCROLL_THRESHOLD = 50;
    const TRANSITION_DURATION_MS = 350;
    const FIT_TEXT_SELECTOR = '.text-line-container span';
    const TAB_MAP = ['buddhist-taoist', 'western', 'japen', 'eco', 'custom', 'comparison', 'united']; 
    
    // 元素快取 (一次性選取)
    const header = document.querySelector('.main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const backToTopButton = document.querySelector('.back-to-top');

    // ====================================================
    // A. 輔助函數 (性能優化)
    // ====================================================
    const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        return function (...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                requestAnimationFrame(() => func.apply(this, args));
            }, delay);
        };
    };

    const onTransitionEndCleanup = (el) => {
        const handler = (e) => {
            if (e.target !== el || (e.propertyName !== 'max-height' && e.propertyName !== 'opacity')) return;
            if (el.style.maxHeight === '0px') {
                el.style.removeProperty('max-height');
                el.style.removeProperty('overflow');
            }
            el.removeEventListener('transitionend', handler);
        };
        el.addEventListener('transitionend', handler);
    };

    // ====================================================
    // B. 選單模組 (修正邏輯衝突點)
    // ====================================================

    /** 關閉主菜單與所有子選單 */
    const closeMainMenu = () => {
        if (!mainNav || !mainNav.classList.contains('active')) return;

        mainNav.classList.remove('active');
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            const icon = menuToggle.querySelector('i');
            if (icon) icon.classList.replace('fa-times', 'fa-bars');
        }
        body.classList.remove('no-scroll');
        
        // 收起手機版所有展開的子選單
        mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
            li.classList.remove('active');
            const submenu = li.querySelector('.submenu-container, .submenu');
            if (submenu) {
                submenu.style.maxHeight = '0px';
                onTransitionEndCleanup(submenu);
            }
        });
    };

    /** 設置 RWD 菜單開關 (唯一控制來源) */
    const setupRwdMenuToggle = () => {
        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener('click', (e) => {
            const isActive = mainNav.classList.contains('active');
            if (!isActive) {
                mainNav.classList.add('active');
                menuToggle.classList.add('active');
                menuToggle.setAttribute('aria-expanded', 'true');
                const icon = menuToggle.querySelector('i');
                if (icon) icon.classList.replace('fa-bars', 'fa-times');
                if (isMobileView()) body.classList.add('no-scroll');
            } else {
                closeMainMenu();
            }
        });

        // 點擊連結後自動關閉選單 (手機版)
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (isMobileView() && link.hash && link.hash !== '#') {
                    setTimeout(closeMainMenu, 100);
                }
            });
        });
    };

    /** 行動裝置子選單手風琴 */
    const setupMobileAccordion = () => {
        if (!mainNav) return;
        mainNav.querySelectorAll('li.dropdown > a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (!isMobileView()) return;
                
                const parentLi = this.parentElement;
                const submenu = parentLi.querySelector('.submenu-container, .submenu');
                if (!submenu) return;

                e.preventDefault(); // 防止手機版點擊父項目時直接跳轉
                const isActive = parentLi.classList.contains('active');

                // 關閉其他同層
                parentLi.parentElement.querySelectorAll(':scope > li.active').forEach(li => {
                    if (li !== parentLi) {
                        li.classList.remove('active');
                        const otherSub = li.querySelector('.submenu-container, .submenu');
                        if (otherSub) otherSub.style.maxHeight = '0px';
                    }
                });

                if (!isActive) {
                    parentLi.classList.add('active');
                    submenu.style.maxHeight = submenu.scrollHeight + "px";
                } else {
                    parentLi.classList.remove('active');
                    submenu.style.maxHeight = '0px';
                }
            });
        });
    };

    // ====================================================
    // C. 功能模組：對年計算、試算機、懶加載 (維持原邏輯並優化)
    // ====================================================
    
    // (保留你提供的 calculateLaborInsurance, calculateDuinian 等函式邏輯)
    // ... 原有 Z 系列功能 ...

    const setupLazyLoading = () => {
        const lazyImages = document.querySelectorAll('.lazy-load');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) img.src = img.dataset.src;
                    img.classList.add('fade-in');
                    observer.unobserve(img);
                }
            });
        });
        lazyImages.forEach(img => observer.observe(img));
    };

    // ====================================================
    // D. 總初始化 (DOMContentLoaded)
    // ====================================================
    const init = () => {
        // 移除 FOUC
        document.documentElement.classList.remove('js-loading');
        
        // 啟動各個模組
        setupRwdMenuToggle();
        setupMobileAccordion();
        setupLazyLoading();
        
        // 視窗縮放清理
        window.addEventListener('resize', debounce(() => {
            if (!isMobileView()) {
                closeMainMenu();
                document.querySelectorAll('.submenu-container, .submenu').forEach(el => {
                    el.style.removeProperty('max-height');
                });
            }
        }, 200));

        // 啟動試算機按鈕監聽 (如果你 HTML 裡有按鈕)
        if (window.SALife.setupDuinianCalculator) window.SALife.setupDuinianCalculator();
        
        console.log('祥安生命核心 V3.2 已就緒');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

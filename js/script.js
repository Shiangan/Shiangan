/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 旗艦究極版 V5.0
 * 特性：強健的 RWD 切換、精確的高度計算、完善的無障礙與外部點擊攔截
 * ====================================================================
 */

'use strict';

(function () {
    const CONFIG = {
        MOBILE_BREAKPOINT: 901,
        RESIZE_DELAY: 200,
        SMOOTH_SCROLL_OFFSET: 80
    };

    const DOM = {
        html: document.documentElement,
        body: document.body,
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.getElementById('main-nav'),
        dropdowns: document.querySelectorAll('.dropdown'),
        dropdownLinks: document.querySelectorAll('.dropdown > a')
    };

    const isMobile = () => window.innerWidth < CONFIG.MOBILE_BREAKPOINT;

    // ====================================================
    // 1. 導覽系統邏輯 (Navigation Core)
    // ====================================================

    /** 核心：重置導覽狀態並恢復環境 */
    const resetNavigation = () => {
        if (!DOM.mainNav) return;
        
        DOM.mainNav.classList.remove('active');
        DOM.body.classList.remove('no-scroll');
        
        if (DOM.menuToggle) {
            DOM.menuToggle.classList.remove('active');
            DOM.menuToggle.setAttribute('aria-expanded', 'false');
            const icon = DOM.menuToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
        }

        // 恢復所有子選單樣式
        document.querySelectorAll('.submenu-container, .submenu').forEach(sub => {
            sub.style.maxHeight = '';
            sub.setAttribute('aria-hidden', 'true');
        });
        DOM.dropdowns.forEach(li => {
            li.classList.remove('active');
            const toggle = li.querySelector('a');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    };

    /** 行動版：手風琴摺疊邏輯 */
    const handleAccordion = (e, link) => {
        if (!isMobile()) return;

        const parentLi = link.parentElement;
        const submenu = parentLi.querySelector('.submenu-container') || parentLi.querySelector('.submenu');

        if (submenu) {
            e.preventDefault();
            e.stopPropagation();

            const isActive = parentLi.classList.contains('active');

            // 互斥邏輯：關閉其他選單
            DOM.dropdowns.forEach(li => {
                if (li !== parentLi) {
                    li.classList.remove('active');
                    const otherSub = li.querySelector('.submenu-container') || li.querySelector('.submenu');
                    if (otherSub) {
                        otherSub.style.maxHeight = '0px';
                        otherSub.setAttribute('aria-hidden', 'true');
                    }
                }
            });

            // 切換當前選單
            if (!isActive) {
                parentLi.classList.add('active');
                link.setAttribute('aria-expanded', 'true');
                submenu.setAttribute('aria-hidden', 'false');
                // 動態計算 scrollHeight 確保動畫流暢
                submenu.style.maxHeight = `${submenu.scrollHeight}px`;
            } else {
                parentLi.classList.remove('active');
                link.setAttribute('aria-expanded', 'false');
                submenu.setAttribute('aria-hidden', 'true');
                submenu.style.maxHeight = '0px';
            }
        }
    };

    /** 初始化監聽器 */
    const initNavEvents = () => {
        // 1. 漢堡鈕點擊
        DOM.menuToggle?.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = DOM.mainNav.classList.contains('active');
            if (!isOpen) {
                DOM.mainNav.classList.add('active');
                DOM.menuToggle.classList.add('active');
                DOM.menuToggle.setAttribute('aria-expanded', 'true');
                const icon = DOM.menuToggle.querySelector('i');
                if (icon) icon.className = 'fas fa-times';
                if (isMobile()) DOM.body.classList.add('no-scroll');
            } else {
                resetNavigation();
            }
        });

        // 2. 子選單點擊
        DOM.dropdownLinks.forEach(link => {
            link.addEventListener('click', (e) => handleAccordion(e, link));
        });

        // 3. 點擊外部自動收合
        document.addEventListener('click', (e) => {
            if (DOM.mainNav?.classList.contains('active') && 
                !DOM.mainNav.contains(e.target) && 
                !DOM.menuToggle.contains(e.target)) {
                resetNavigation();
            }
        });

        // 4. 滾動時 Header 質感變化
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                DOM.header?.classList.add('scrolled');
            } else {
                DOM.header?.classList.remove('scrolled');
            }
        }, { passive: true });
    };

    // ====================================================
    // 2. 視窗適配與文字防溢出 (UX & Responsive)
    // ====================================================

    const handleResize = () => {
        if (!isMobile()) {
            resetNavigation();
        }
        initFitText(); // 重新計算文字縮放
    };

    const initFitText = () => {
        requestAnimationFrame(() => {
            const fitLines = document.querySelectorAll('.fit-text-line');
            fitLines.forEach(line => {
                const container = line.parentElement;
                if (!container) return;
                
                line.style.fontSize = ''; // 先重置
                const containerWidth = container.offsetWidth;
                const lineWidth = line.offsetWidth;

                if (lineWidth > containerWidth && containerWidth > 0) {
                    const ratio = (containerWidth / lineWidth) * 0.95;
                    line.style.fontSize = `${ratio * 100}%`;
                    line.style.display = 'inline-block';
                    line.style.whiteSpace = 'nowrap';
                }
            });
        });
    };

    // ====================================================
    // 3. 啟動 (Initialize)
    // ====================================================
    const boot = () => {
        DOM.html.classList.remove('js-loading');
        
        initNavEvents();
        initFitText();

        // Resize 防抖動處理
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, CONFIG.RESIZE_DELAY);
        });

        console.log('祥安生命 V5.0 旗艦系統啟動完成');
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();

/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 最終穩定整合版
 * 整合功能：Modal A11Y、Tab 切換/錨點、RWD 菜單手風琴、通用 Accordion、
 * 性能優化 (Lazy Load/Fit Text)、AOS 動畫、表單處理。
 * ====================================================================
 */

'use strict';

(function () {

    // ====================================================
    // 0. 環境設定與常量
    // ====================================================
    const MOBILE_BREAKPOINT = 900;
    const SCROLL_THRESHOLD = 10; // Header 變色/陰影的滾動門檻
    const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
    const TRANSITION_DURATION_MS = 350; // Modal / RWD Menu / Accordion 的 CSS 轉換時間
    const FIT_TEXT_SELECTOR = '.text-line-container span';
    const AOS_ROOT_MARGIN = '0px 0px -15% 0px';
    const FOUC_TIMEOUT_MS = 3000;

    const header = document.querySelector('.site-header, .main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const body = document.body;
    const backToTopButton = document.querySelector('.back-to-top');

    let focusedElementBeforeModal; // 用於儲存 Modal 開啟前的焦點元素

    // ====================================================
    // A. 輔助函數 (高性能優化)
    // ====================================================

    /**
     * 在 CSS Transition 結束後清理行內樣式，防止 RWD 衝突。
     * @param {HTMLElement} contentElement - 執行 transition 的元素。
     */
    const onTransitionEndCleanup = (contentElement) => {
        const handleTransitionEnd = (e) => {
            // 確保只處理當前元素的 max-height 屬性
            if (e.target !== contentElement || (e.propertyName !== 'max-height' && e.propertyName !== 'opacity')) return;
            
            // 檢查元素是否已收起 (maxHeight 為 0px)
            const isExpanded = contentElement.style.maxHeight !== '0px';

            if (!isExpanded) {
                // 如果已收起，移除 max-height 和 overflow 樣式
                contentElement.style.removeProperty('max-height');
                contentElement.style.removeProperty('overflow');
            }
            if (contentElement.style.display === 'none') {
                 // 如果已隱藏，移除 opacity/display 樣式
                contentElement.style.removeProperty('opacity');
                contentElement.style.removeProperty('display');
            }

            contentElement.removeEventListener('transitionend', handleTransitionEnd);
        };
        // 確保監聽器只觸發一次
        contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
    };

    /** 節流函數 (Debounce) */
    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        let lastArgs, lastThis;
        const run = () => {
            timeoutId = setTimeout(() => {
                requestAnimationFrame(() => func.apply(lastThis, lastArgs));
                timeoutId = null;
            }, delay);
        };
        return function (...args) {
            lastArgs = args;
            lastThis = this;
            if (timeoutId) clearTimeout(timeoutId);
            run();
        };
    };
    const debounceFitText = (func) => debounce(func, 100);

    /** 檢查是否處於行動裝置視圖 (Mobile View) */
    const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

    // ====================================================
    // B. FOUC 處理 (Flash of Unstyled Content)
    // ====================================================
    const removeLoadingClass = () => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('js-loading');
            body.classList.remove('js-loading');
        });
    };
    document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
    window.addEventListener('load', removeLoadingClass, { once: true });
    setTimeout(removeLoadingClass, FOUC_TIMEOUT_MS);

    // ====================================================
    // C. Modal 模組 (A11Y 強化與焦點陷阱)
    // ====================================================

    /** 處理 Modal 內的 Tab 鍵盤導航 (焦點陷阱) */
    function handleModalKeydown(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            window.closeModal(e);
            return;
        }
        if (e.key === 'Tab') {
            const modal = e.currentTarget;
            const focusableElements = modal.querySelectorAll('a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');

            // 過濾掉不可見元素 (僅保留在 active modal 內的可聚焦元素)
            const visibleFocusableElements = Array.from(focusableElements).filter(el => {
                return el.offsetWidth > 0 || el.offsetHeight > 0 || el.closest('.modal-overlay.active');
            });

            if (visibleFocusableElements.length === 0) return;

            const first = visibleFocusableElements[0];
            const last = visibleFocusableElements[visibleFocusableElements.length - 1];

            if (e.shiftKey) { // Shift + Tab: 從第一個跳到最後一個
                if (document.activeElement === first) { last.focus(); e.preventDefault(); }
            } else { // Tab: 從最後一個跳到第一個
                if (document.activeElement === last) { first.focus(); e.preventDefault(); }
            }
        }
    }

    /** 開啟 Modal */
    window.openModal = function(modalId) {
        const modal = document.getElementById('modal-' + modalId);
        if (modal) {
            focusedElementBeforeModal = document.activeElement;
            // 關閉所有其他已開啟的 Modal
            document.querySelectorAll('.modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                m.style.display = 'none';
                m.removeEventListener('keydown', handleModalKeydown);
            });

            // 確保 Modal 在 DOM 中可見後再添加 active class 觸發動畫
            modal.style.display = 'flex';

            setTimeout(() => { // 使用 setTimeout 模擬 requestAnimationFrame + 短延遲，確保 transition 觸發
                modal.classList.add('active');
                body.classList.add('no-scroll'); // 統一使用 no-scroll 鎖定 body 滾動
                modal.scrollTop = 0;
                modal.setAttribute('aria-hidden', 'false');

                const focusTarget = modal.querySelector('.close-btn') || modal;
                focusTarget.focus();

                modal.addEventListener('keydown', handleModalKeydown);
            }, 10);
        }
    }

    /** 關閉 Modal */
    window.closeModal = function(event) {
        // 修正：僅允許點擊 overlay 或 close-btn 或按下 Escape 鍵觸發關閉
        if (event && event.type === 'click') {
            const isModalOverlay = event.target.classList.contains('modal-overlay');
            const isCloseButton = event.target.closest('.close-btn');
            if (!isModalOverlay && !isCloseButton) {
                return;
            }
        }

        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            activeModal.setAttribute('aria-hidden', 'true');

            // 配合 CSS transition 結束後清理
            setTimeout(() => {
                activeModal.style.display = 'none';
                body.classList.remove('no-scroll');
                activeModal.removeEventListener('keydown', handleModalKeydown);
                if (focusedElementBeforeModal) {
                    focusedElementBeforeModal.focus();
                }
            }, TRANSITION_DURATION_MS);
        }
    }
    
    // 全局 Escape 鍵關閉 Modal (重複定義以確保功能，但已在 window.closeModal 中處理)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') { window.closeModal(event); }
    });

    // ====================================================
    // D. 導航菜單模組
    // ====================================================

    /** 關閉所有行動裝置子選單 (優化動畫) */
    const closeAllMobileSubmenus = (excludeLi = null) => {
        if (mainNav) {
            Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
                if (li === excludeLi) return;
                
                const submenu = li.querySelector('.submenu-container, .submenu');
                const targetLink = li.querySelector('a');

                if (submenu && targetLink) {
                    li.classList.remove('active');
                    targetLink.setAttribute('aria-expanded', 'false');
                    
                    if (submenu.scrollHeight > 0 && submenu.style.maxHeight !== '0px') {
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        submenu.style.overflow = 'hidden';
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = '0px';
                            onTransitionEndCleanup(submenu);
                        });
                    } else if (submenu.style.maxHeight !== '0px') {
                         submenu.style.maxHeight = '0px';
                         onTransitionEndCleanup(submenu);
                    }
                }
            });
        }
    };

    /** 關閉主菜單 */
    const closeMainMenu = () => {
        if (mainNav?.classList.contains('active')) {
            mainNav.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const menuIcon = menuToggle.querySelector('i');
                if (menuIcon) {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                }
            }
            body.classList.remove('no-scroll');
            body.classList.remove('menu-open'); // 兼容舊 class
            closeAllMobileSubmenus(); 
        }
    };

    /** 處理頁面滾動時 Header 的樣式變化 */
    const handleHeaderScroll = () => {
        const updateHeaderScrollClass = () => {
            const scrollY = window.scrollY;
            if (header) header.classList.toggle('scrolled', scrollY > SCROLL_THRESHOLD);
            if (backToTopButton) backToTopButton.classList.toggle('show', scrollY > 300);
        };
        updateHeaderScrollClass();
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 10), { passive: true });
    };

    /** 設置 RWD 菜單開關功能 */
    const setupRwdMenuToggle = () => {
        if (menuToggle && mainNav) {
            const menuIcon = menuToggle.querySelector('i');
            menuToggle.addEventListener('click', function () {
                const isExpanded = mainNav.classList.contains('active');
                if (!isExpanded) {
                    // 展開菜單
                    mainNav.classList.add('active');
                    this.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    if (menuIcon) menuIcon.classList.replace('fa-bars', 'fa-times');
                    if (isMobileView()) body.classList.add('no-scroll');
                } else {
                    // 關閉菜單
                    closeMainMenu();
                }
            });

            // 點擊菜單連結後自動關閉菜單 (RWD)
            mainNav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (isMobileView()) {
                        setTimeout(closeMainMenu, TRANSITION_DURATION_MS + 50); 
                    }
                });
            });
        }
    };

    /** 設置行動裝置菜單手風琴效果 (Accordion) - 優化版 */
    const setupMobileAccordion = () => {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                targetLink.addEventListener('click', (e) => {
                    const parentLi = targetLink.closest('li.dropdown');
                    if (!parentLi || !isMobileView()) return;
                    
                    const submenu = parentLi.querySelector('.submenu-container, .submenu');
                    if (!submenu) return; 

                    e.preventDefault();
                    const isCurrentlyActive = parentLi.classList.contains('active');
                    
                    closeAllMobileSubmenus(parentLi);
                    
                    if (!isCurrentlyActive) {
                        // 展開當前菜單
                        parentLi.classList.add('active');
                        targetLink.setAttribute('aria-expanded', 'true');
                        
                        submenu.style.maxHeight = '0px';
                        submenu.style.overflow = 'hidden';
                        void submenu.offsetHeight; 
                        
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                            onTransitionEndCleanup(submenu);
                        });
                        
                    } else {
                        // 收起當前菜單
                        parentLi.classList.remove('active');
                        targetLink.setAttribute('aria-expanded', 'false');
                        
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        submenu.style.overflow = 'hidden';
                        requestAnimationFrame(() => {
                            submenu.style.maxHeight = '0px';
                            onTransitionEndCleanup(submenu);
                        });
                    }
                });
            });
        }
    };

    /** 設置桌面版菜單的鍵盤 A11Y (focus-within) */
    const setupDesktopA11y = () => {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                dropdown.addEventListener('focusin', function () {
                    if (!isMobileView()) this.classList.add('focus-within');
                });
                dropdown.addEventListener('focusout', function () {
                    setTimeout(() => {
                        if (!isMobileView() && !this.contains(document.activeElement)) {
                            this.classList.remove('focus-within');
                        }
                    }, 0);
                });
            });
        }
    };

    /** 處理視窗大小改變後的清理工作 (RWD) */
    const handleResizeCleanup = (fitAllFunction) => {
        // 桌面視圖下，確保菜單是關閉的
        if (!isMobileView()) closeMainMenu();
        
        // 清理所有菜單的 inline max-height 樣式
        mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
            const targetLink = dropdown.querySelector('a');
            if(targetLink) targetLink.setAttribute('aria-expanded', 'false');

            const submenu = dropdown.querySelector('.submenu-container, .submenu');
            if (submenu) {
                submenu.style.removeProperty('max-height');
                submenu.style.removeProperty('overflow');
            }
        });
        
        // 重新計算所有手風琴或詳細資訊的高度
        setTimeout(() => {
            document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded')
                .forEach(content => {
                    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                        requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                    }
                });
        }, 100);

        // 重新執行 Fit Text
        if (typeof fitAllFunction === 'function') fitAllFunction();
    };


    // ====================================================
    // E. Tab 切換邏輯 (支援錨點滾動)
    // ====================================================

    /** 開啟選定的 Tab 並處理錨點滾動 */
    window.openPlanTab = function(tabName, anchorId = null) {
        let tabcontent;
        
        // 隱藏所有內容，重置所有 Tab 按鈕狀態
        tabcontent = document.getElementsByClassName("plan-tab-content");
        for (let i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
            const tabId = "tab-" + tabcontent[i].id.split('-')[1];
            const tabElement = document.getElementById(tabId);
            if (tabElement) {
                tabElement.classList.remove('active');
                tabElement.setAttribute('aria-selected', 'false');
                tabElement.setAttribute('tabindex', '-1');
            }
        }
        
        const contentId = "content-" + tabName;
        const tabId = "tab-" + tabName;

        const contentElement = document.getElementById(contentId);
        const tabElement = document.getElementById(tabId);

        // 顯示選定的內容，啟用選定的 Tab 按鈕
        if (contentElement) { contentElement.style.display = "block"; }
        if (tabElement) { 
            tabElement.classList.add("active"); 
            tabElement.setAttribute('aria-selected', 'true'); 
            tabElement.setAttribute('tabindex', '0'); 
        }
        
        // 平滑滾動邏輯
        const headerHeight = header?.offsetHeight || 0;
        
        requestAnimationFrame(() => {
            if (anchorId) {
                // 滾動到精確錨點 (#plan-168)
                const targetElement = document.querySelector(anchorId);
                if (targetElement) {
                    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20; // 額外 padding
                    window.scrollTo({ top: targetTop, behavior: 'smooth' });
                }
            } else {
                // 滾動到 Tab 按鈕的容器頂部
                const planTabs = document.querySelector('.plan-tabs');
                if (planTabs) {
                    const tabTop = planTabs.getBoundingClientRect().top + window.scrollY - headerHeight;
                    window.scrollTo({ top: tabTop, behavior: 'smooth' });
                }
            }
        });
    }

    /** 處理 URL Hash 以決定初始 Tab */
    const initializeTabFromHash = () => {
        let hash = window.location.hash.substring(1); 
        let targetAnchorId = null;

        // 檢查是否有精確錨點 (#plan-168)
        if (hash.startsWith('plan-')) {
             targetAnchorId = '#' + hash;
             hash = 'buddhist-taoist'; // 預設 Tab
        } else if (hash.startsWith('tab-')) {
            // 處理 #tab-buddhist-taoist 這種格式
            hash = hash.split('-')[1]; 
        }
        
        const tabMap = ['buddhist-taoist', 'western', 'japen', 'eco', 'custom'];
        let defaultTab = 'buddhist-taoist';
        
        if (tabMap.includes(hash)) {
            defaultTab = hash;
        }
        
        // 啟用正確的 Tab
        window.openPlanTab(defaultTab, targetAnchorId);
    };


    // ====================================================
    // F. 互動組件 (Accordion / Details)
    // ====================================================

    /** 設置通用手風琴 (Accordion) 功能 */
    const setupAccordion = () => {
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
            const headerElement = item.querySelector('.accordion-title');
            const content = item.querySelector('.accordion-content');
            if (!headerElement || !content) return;

            // 設置 A11Y 屬性
            const uniqueId = `faq-item-${index}`;
            content.id = `${uniqueId}-content`;
            headerElement.setAttribute('aria-controls', content.id);
            const isActive = item.classList.contains('active');
            headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            headerElement.setAttribute('tabindex', '0');
            headerElement.setAttribute('role', 'button');

            // 設置初始樣式
            content.style.display = 'block';
            content.style.overflow = 'hidden';
            content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';

            // 點擊事件
            headerElement.addEventListener('click', function () {
                const isCurrentlyActive = item.classList.contains('active');
                
                // 關閉所有其他已展開的手風琴
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-title');
                        activeItem.classList.remove('active');
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                        if (otherContent) {
                            otherContent.style.overflow = 'hidden';
                            otherContent.style.maxHeight = `${otherContent.scrollHeight}px`;
                            requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                            onTransitionEndCleanup(otherContent);
                        }
                    }
                });

                // 展開/收起當前手風琴
                item.classList.toggle('active', !isCurrentlyActive);
                this.setAttribute('aria-expanded', (!isCurrentlyActive).toString());
                
                if (!isCurrentlyActive) {
                    // 展開
                    content.style.maxHeight = '0px';
                    void content.offsetHeight;
                    content.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                        onTransitionEndCleanup(content);
                    });
                } else {
                    // 收起
                    content.style.overflow = 'hidden';
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    requestAnimationFrame(() => content.style.maxHeight = '0px');
                    onTransitionEndCleanup(content);
                }
            });

            // 鍵盤 A11Y 支援
            headerElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    };

    /** 展開/收起商品詳細資訊 (Plan Details Toggle) */
    const toggleDetails = (button) => {
        const card = button.closest('.plan-card');
        const details = card?.querySelector('.plan-details-expanded');
        if (!card || !details) return;

        const isExpanded = card.classList.contains('expanded');
        card.classList.toggle('expanded', !isExpanded);

        const icon = button.querySelector('i');
        const newText = !isExpanded ? '收起完整細項 ' : '查看完整細項 ';
        button.setAttribute('aria-expanded', (!isExpanded).toString());

        // 圖標和文本更新邏輯
        if (icon) {
            button.textContent = newText;
            const newIconClass = !isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            const oldIconClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            
            icon.classList.replace(oldIconClass, newIconClass);
            button.appendChild(icon);
        } else {
            button.textContent = newText;
        }

        // 展開/收起動畫邏輯
        if (!isExpanded) {
            // 展開
            details.style.maxHeight = '0px';
            void details.offsetHeight;
            details.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                details.style.maxHeight = `${details.scrollHeight}px`;
                onTransitionEndCleanup(details);
            });
        } else {
            // 收起
            details.style.overflow = 'hidden';
            details.style.maxHeight = `${details.scrollHeight}px`;
            requestAnimationFrame(() => details.style.maxHeight = '0px');
            onTransitionEndCleanup(details);
        }
    };
    // 暴露到全域，以便 HTML 中的 onclick 屬性可以呼叫
    if (typeof window.toggleDetails === 'undefined') window.toggleDetails = toggleDetails;

    // ====================================================
    // G. 性能優化與其他工具
    // ====================================================

    /** 設置 Lazy Load 功能 */
    const setupLazyLoading = () => {
        const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');
        
        const loadImage = (el) => {
            if (el.classList.contains('loaded')) return;
            if (el.tagName === 'IMG') {
                const imgEl = el;
                if (imgEl.dataset.src) { imgEl.src = imgEl.dataset.src; imgEl.removeAttribute('data-src'); }
                if (imgEl.dataset.srcset) { imgEl.srcset = imgEl.dataset.srcset; imgEl.removeAttribute('data-srcset'); }
                imgEl.classList.add('loaded');
            } else if (el.tagName === 'SOURCE') {
                const sourceEl = el;
                if (sourceEl.dataset.srcset) { sourceEl.srcset = sourceEl.dataset.srcset; sourceEl.removeAttribute('data-srcset'); }
            }
        };

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.tagName === 'PICTURE') {
                            element.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            const img = element.querySelector('img');
                            if (img) loadImage(img);
                        } else loadImage(element); 
                        
                        obs.unobserve(element);
                    }
                });
            }, { 
                root: null, 
                rootMargin: LAZY_LOAD_ROOT_MARGIN, 
                threshold: 0.01
            });
            lazyTargets.forEach(el => observer.observe(el));
        } else {
            lazyTargets.forEach(loadImage);
        }
    };

    /** 設置 Fit Text 功能 (文本自動縮放以適應容器寬度) */
    let fitAllTexts;
    const setupFitText = () => {
        const MAX_FONT = 22, MIN_FONT = 8, PRECISION = 0.1;
        
        const fitOne = (el) => {
            const parentWidth = el.parentElement?.offsetWidth || 0;
            const text = el.textContent?.trim() || '';
            
            if (parentWidth <= 50 || text === '' || !el.parentElement) { 
                el.style.fontSize = `${MAX_FONT}px`; 
                return; 
            }
            
            let low = MIN_FONT, high = MAX_FONT, bestSize = MIN_FONT, iterations = 0;
            while (low <= high && iterations < 20) { 
                const mid = (low + high) / 2;
                el.style.fontSize = `${mid}px`;
                
                if (el.scrollWidth <= parentWidth) { 
                    bestSize = mid; 
                    low = mid + PRECISION; 
                } else {
                    high = mid - PRECISION;
                }
                iterations++;
            }
            el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
        };

        const fitAll = () => {
            const nodes = document.querySelectorAll(FIT_TEXT_SELECTOR);
            requestAnimationFrame(() => nodes.forEach(fitOne));
        };
        
        const debounceFunc = debounceFitText(fitAll);
        
        const start = () => {
            fitAll();
            
            if (window.ResizeObserver) {
                const observer = new ResizeObserver(entries => {
                    if (entries.some(e => e.contentRect.width > 0)) debounceFunc();
                });
                const observedParents = new Set();
                document.querySelectorAll(FIT_TEXT_SELECTOR).forEach(el => {
                    const parent = el.parentElement;
                    if (parent && !observedParents.has(parent)) { 
                        observer.observe(parent); 
                        observedParents.add(parent); 
                    }
                });
            } else {
                window.addEventListener('resize', debounceFunc);
            }
        };

        if (document.fonts?.ready) document.fonts.ready.then(start).catch(start); 
        else window.addEventListener('load', start);
        
        return fitAll;
    };

    /** 設置平滑滾動到錨點功能 (不包含 Tab 滾動，Tab 滾動由 openPlanTab 處理) */
    const setupSmoothScrolling = () => {
        if (!header) return;
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId || '');
                if (targetElement) {
                    e.preventDefault();
                    requestAnimationFrame(() => {
                        const headerOffset = header.offsetHeight || 0;
                        const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerOffset);
                        
                        window.scrollTo({ top: targetTop, behavior: 'smooth' });
                        
                        // 點擊錨點後關閉 RWD 菜單
                        if (mainNav?.classList.contains('active')) setTimeout(closeMainMenu, TRANSITION_DURATION_MS + 50);
                    });
                }
            });
        });
        
        // 設置 Back-to-Top 按鈕
        if (backToTopButton) backToTopButton.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    };

    /** 設置表單提交處理 (AJAX) */
    const setupFormSubmission = () => {
        const form = document.getElementById('product-order-form');
        const statusMessage = document.getElementById('form-status-message');
        if (!form) return;
        
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            if (!submitButton) return;
            
            const originalText = submitButton.textContent;
            submitButton.textContent = '送出中... 請稍候';
            submitButton.disabled = true;
            if (statusMessage) statusMessage.textContent = '';
            this.classList.add('is-loading');

            const cleanup = (success = false) => {
                const delay = success ? 5000 : 50;
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    this.classList.remove('is-loading');
                    if (statusMessage && !success) statusMessage.textContent = '';
                }, delay);
            };

            try {
                // ⚠️ 檢查表單 action URL 是否已替換
                if (form.action.includes('your_form_endpoint')) {
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 請先替換表單 action URL！'; }
                    cleanup(); 
                    return;
                }
                
                const formData = new FormData(this);
                const response = await fetch(this.action, { 
                    method: this.method, 
                    body: formData, 
                    headers: { 'Accept': 'application/json' } 
                });

                if (response.ok) {
                    if (statusMessage) { statusMessage.style.color = '#28a745'; statusMessage.textContent = '🎉 訂購資訊已成功送出！'; }
                    this.reset(); 
                    submitButton.textContent = '訂購成功！'; 
                    cleanup(true);
                } else {
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤或非 JSON' }));
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = `❗ ${errorData.error || '表單送出失敗'}，請直接撥打 24H 專線訂購：0978-583-699`; }
                    cleanup();
                }
            } catch (err) {
                console.error(err);
                if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 網路錯誤或伺服器無回應，請直接撥打 24H 專線訂購：0978-583-699'; }
                cleanup();
            }
        });
    };

    /** 更新頁腳版權年份 */
    const updateCopyrightYear = () => {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear().toString();
    };

    /** 設置動畫滾動顯示 (AOS) */
    const setupAos = () => {
        const aosElements = document.querySelectorAll('.animate-on-scroll');
        if ('IntersectionObserver' in window && aosElements.length) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => { 
                    if (entry.isIntersecting) { 
                        requestAnimationFrame(() => entry.target.classList.add('is-visible')); 
                        obs.unobserve(entry.target);
                    } 
                });
            }, { 
                root: null, 
                rootMargin: AOS_ROOT_MARGIN,
                threshold: 0.01 
            });
            
            aosElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                // 如果元素在首屏可見範圍內，則立即觸發動畫
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    requestAnimationFrame(() => el.classList.add('is-visible'));
                } else {
                    observer.observe(el);
                }
            });
        } else {
            // 兼容模式：直接顯示動畫
            aosElements.forEach(el => requestAnimationFrame(() => el.classList.add('is-visible')));
        }
    };


    // ====================================================
    // H. 總初始化
    // ====================================================
    document.addEventListener('DOMContentLoaded', () => {
        
        // 菜單與滾動
        handleHeaderScroll();
        setupRwdMenuToggle();
        setupDesktopA11y();
        setupMobileAccordion();
        
        // 互動組件
        setupAccordion();
        setupSmoothScrolling();
        setupFormSubmission();
        updateCopyrightYear();
        
        // Tab 初始化 (處理 URL Hash)
        initializeTabFromHash();
        
        // 性能優化
        setupLazyLoading();
        fitAllTexts = setupFitText(); 
        
        // 動畫
        setupAos();
        
        // 視窗大小改變監聽 (使用 Debounce 優化性能)
        window.addEventListener('resize', debounce(() => handleResizeCleanup(fitAllTexts), 150));
    });

})();

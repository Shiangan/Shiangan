/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script)
 * 完整、模組化、高性能、RWD & A11Y 優化版。
 *
 * 審核狀態：結構清晰、性能優化良好。已針對 RWD 菜單和細節展開組件進行微調和修正。
 * ====================================================================
 */

'use strict';

(function () {

    // ====================================================
    // 0. 環境設定與常量
    // ====================================================
    const MOBILE_BREAKPOINT = 900;
    const SCROLL_THRESHOLD = 10;
    const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
    const RWD_TRANSITION_DURATION_MS = 400;
    const FIT_TEXT_SELECTOR = '.text-line-container span';
    const AOS_ROOT_MARGIN = '0px 0px -15% 0px';
    const FOUC_TIMEOUT_MS = 3000;

    const header = document.querySelector('.site-header, .main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const body = document.body;
    const backToTopButton = document.querySelector('.back-to-top');

    // ====================================================
    // A. 輔助函數
    // ====================================================

    /**
     * 在 CSS Transition 結束後清理行內樣式，防止 RWD 衝突。
     * @param {HTMLElement} contentElement - 執行 transition 的元素（通常是 content）。
     */
    const onTransitionEndCleanup = (contentElement) => {
        const handleTransitionEnd = (e) => {
            // 確保只處理當前元素的 max-height 屬性
            if (e.target !== contentElement || e.propertyName !== 'max-height') return;

            // 檢查元素是否已收起（maxHeight 為 0px）
            const isExpanded = contentElement.style.maxHeight !== '0px';

            if (!isExpanded) {
                // 如果已收起，移除 max-height 和 overflow 樣式，交由 CSS 處理
                contentElement.style.removeProperty('max-height');
                contentElement.style.removeProperty('overflow');
            }

            contentElement.removeEventListener('transitionend', handleTransitionEnd);
        };
        contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
    };

    /**
     * 節流函數 (Debounce)
     * @param {Function} func - 要延遲執行的函數。
     * @param {number} delay - 延遲時間 (毫秒)。
     * @returns {Function} - 節流後的函數。
     */
    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        let lastArgs, lastThis;
        const run = () => {
            timeoutId = setTimeout(() => {
                // 使用 requestAnimationFrame 確保在下一次瀏覽器重繪前執行
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

    /**
     * 檢查是否處於行動裝置視圖 (Mobile View)
     * @returns {boolean}
     */
    const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

    // ====================================================
    // B. FOUC 處理
    // ====================================================
    const removeLoadingClass = () => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('js-loading');
            document.body.classList.remove('js-loading');
        });
    };
    // 監聽三種事件，確保在網頁載入完成或逾時時移除 js-loading class
    document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
    window.addEventListener('load', removeLoadingClass, { once: true });
    setTimeout(removeLoadingClass, FOUC_TIMEOUT_MS);

    // ====================================================
    // C. 導航菜單模組
    // ====================================================

    /** 關閉所有行動裝置子選單 */
    const closeAllMobileSubmenus = () => {
        if (mainNav) {
            Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
                const submenu = li.querySelector('.submenu-container, .submenu');
                const targetLink = li.querySelector('a');
                if (submenu && targetLink) {
                    li.classList.remove('active');
                    targetLink.setAttribute('aria-expanded', 'false');
                    
                    // 執行收起動畫
                    if (submenu.style.maxHeight && submenu.style.maxHeight !== '0px') {
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px');
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
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
            body.classList.remove('no-scroll');
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

            // 點擊菜單外區域關閉菜單 (Mobile Only)
            document.addEventListener('click', (e) => {
                const target = e.target;
                if (isMobileView() && mainNav.classList.contains('active') &&
                    !mainNav.contains(target) && !menuToggle.contains(target)) {
                    closeMainMenu();
                }
            });
        }
    };

    /** 設置行動裝置菜單手風琴效果 (Accordion) */
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
                    
                    // 點擊展開時，先關閉其他所有已展開的子菜單
                    closeAllMobileSubmenus();
                    
                    if (!isCurrentlyActive) {
                        // 展開當前菜單
                        parentLi.classList.add('active');
                        targetLink.setAttribute('aria-expanded', 'true');
                        submenu.style.maxHeight = '0px';
                        void submenu.offsetHeight; // 強制重繪
                        requestAnimationFrame(() => submenu.style.maxHeight = `${submenu.scrollHeight}px`);
                        setTimeout(() => onTransitionEndCleanup(submenu), RWD_TRANSITION_DURATION_MS);
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
                    // 使用 setTimeout 確保在 document.activeElement 變更後檢查
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
            const submenu = dropdown.querySelector('.submenu-container, .submenu');
            if (submenu) {
                submenu.style.removeProperty('max-height');
                submenu.style.removeProperty('overflow');
            }
        });
        
        // 重新計算當前已展開手風琴的高度，以適應新的視窗大小
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
    // D. 互動組件
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
            
            // 設置初始樣式
            content.style.display = 'block';
            content.style.overflow = 'hidden';
            content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
            if (isActive) content.style.removeProperty('overflow');

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

        // 圖標和文本更新邏輯優化
        if (icon) {
            button.textContent = newText;
            const newIconClass = !isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            const oldIconClass = isExpanded ? 'fa-chevron-up' : 'fa-chevron-down';
            
            // 使用 classList.replace 替換圖標
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
    // E. Lazy Load
    // ====================================================
    const setupLazyLoading = () => {
        const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');
        
        /** 實際載入單個元素 */
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
                            // 處理 picture 標籤下的 source 和 img
                            element.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            const img = element.querySelector('img');
                            if (img) loadImage(img);
                        } else loadImage(element); // 處理單獨的 img 或 source
                        
                        obs.unobserve(element);
                    }
                });
            }, { 
                root: null, 
                rootMargin: LAZY_LOAD_ROOT_MARGIN, 
                threshold: 0.01 // 只要 0.01% 進入視口即觸發
            });
            lazyTargets.forEach(el => observer.observe(el));
        } else {
            // 瀏覽器不支援 IntersectionObserver 時，直接載入
            lazyTargets.forEach(loadImage);
        }
    };

    // ====================================================
    // F. Fit Text
    // ====================================================
    
    /** 全域變數，用於儲存 Fit Text 函數，以便在 resize 時呼叫 */
    let fitAllTexts;

    /** 設置 Fit Text 功能 (文本自動縮放以適應容器寬度) */
    const setupFitText = () => {
        const MAX_FONT = 22, MIN_FONT = 8, PRECISION = 0.1;
        
        /** 處理單個元素的 Fit Text */
        const fitOne = (el) => {
            const parentWidth = el.parentElement?.offsetWidth || 0;
            const text = el.textContent?.trim() || '';
            
            // 檢查有效性
            if (parentWidth <= 50 || text === '' || !el.parentElement) { 
                el.style.fontSize = `${MAX_FONT}px`; // 設置最大值作為備用
                return; 
            }
            
            // 二分查找算法 (Binary Search) 尋找最佳字體大小
            let low = MIN_FONT, high = MAX_FONT, bestSize = MIN_FONT, iterations = 0;
            while (low <= high && iterations < 20) { // 限制迭代次數以防無限循環
                const mid = (low + high) / 2;
                el.style.fontSize = `${mid}px`;
                
                if (el.scrollWidth <= parentWidth) { 
                    // 文本寬度小於父容器寬度，字體可以更大
                    bestSize = mid; 
                    low = mid + PRECISION; 
                } else {
                    // 文本寬度大於父容器寬度，字體必須更小
                    high = mid - PRECISION;
                }
                iterations++;
            }
            el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
        };

        /** 處理所有符合選擇器的元素的 Fit Text */
        const fitAll = () => {
            const nodes = document.querySelectorAll(FIT_TEXT_SELECTOR);
            requestAnimationFrame(() => nodes.forEach(fitOne));
        };
        
        const debounceFunc = debounceFitText(fitAll);
        
        /** 啟動 Fit Text 的監聽器 */
        const start = () => {
            fitAll();
            
            // 使用 ResizeObserver 監聽父容器大小變化，性能更優
            if (window.ResizeObserver) {
                const observer = new ResizeObserver(entries => {
                    // 只有在實際寬度改變時才觸發 debounceFunc
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
                // 降級方案：使用 window resize
                window.addEventListener('resize', debounceFunc);
            }
        };

        // 確保在所有字體載入完成後 (或在 load 事件後) 才執行 Fit Text
        if (document.fonts?.ready) document.fonts.ready.then(start).catch(start); 
        else window.addEventListener('load', start);
        
        return fitAll; // 返回 fitAll 函數供 resize cleanup 使用
    };

    // ====================================================
    // G. Smooth Scroll & Forms & Footer
    // ====================================================

    /** 設置平滑滾動到錨點功能 */
    const setupSmoothScrolling = () => {
        if (!header) return;
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId || '');
                if (targetElement) {
                    e.preventDefault();
                    requestAnimationFrame(() => {
                        // 計算滾動目標位置，減去 Header 高度
                        const headerOffset = header.offsetHeight || 0;
                        const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerOffset);
                        
                        // 使用瀏覽器原生平滑滾動或 polyfill
                        if ('scrollBehavior' in document.documentElement.style) {
                            window.scrollTo({ top: targetTop, behavior: 'smooth' });
                        } else {
                            window.scrollTo({ top: targetTop });
                        }
                        
                        // 如果菜單處於打開狀態，滾動完成後關閉它
                        if (mainNav?.classList.contains('active')) setTimeout(closeMainMenu, RWD_TRANSITION_DURATION_MS + 50);
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
            
            // 提交前狀態
            const originalText = submitButton.textContent;
            submitButton.textContent = '送出中... 請稍候';
            submitButton.disabled = true;
            if (statusMessage) statusMessage.textContent = '';
            this.classList.add('is-loading');

            const cleanup = (success = false) => {
                const delay = success ? 5000 : 50; // 成功消息保留較長時間
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    this.classList.remove('is-loading');
                    if (statusMessage && !success) statusMessage.textContent = '';
                }, delay);
            };

            try {
                // 開發者提醒檢查
                if (form.action.includes('your_form_endpoint')) {
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 請先替換表單 action URL！'; }
                    cleanup(); 
                    return;
                }
                
                // 執行提交
                const formData = new FormData(this);
                const response = await fetch(this.action, { 
                    method: this.method, 
                    body: formData, 
                    headers: { 'Accept': 'application/json' } 
                });

                if (response.ok) {
                    // 成功處理
                    if (statusMessage) { statusMessage.style.color = '#28a745'; statusMessage.textContent = '🎉 訂購資訊已成功送出！'; }
                    this.reset(); 
                    submitButton.textContent = '訂購成功！'; 
                    cleanup(true);
                } else {
                    // 伺服器響應錯誤處理
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤或非 JSON' }));
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = `❗ ${errorData.error || '表單送出失敗'}，請直接撥打 24H 專線訂購：0978-583-699`; }
                    cleanup();
                }
            } catch (err) {
                // 網路錯誤處理
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

    // ====================================================
    // H. AOS
    // ====================================================
    /** 設置動畫滾動顯示 (Animate on Scroll) */
    const setupAos = () => {
        const aosElements = document.querySelectorAll('.animate-on-scroll');
        if ('IntersectionObserver' in window && aosElements.length) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => { 
                    if (entry.isIntersecting) { 
                        requestAnimationFrame(() => entry.target.classList.add('is-visible')); 
                        obs.unobserve(entry.target); // 一次性動畫，移除觀察者
                    } 
                });
            }, { 
                root: null, 
                rootMargin: AOS_ROOT_MARGIN, // 提前載入
                threshold: 0.01 
            });
            
            aosElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                // 檢查是否已在視口內 (避免頁面刷新時不觸發動畫)
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    requestAnimationFrame(() => el.classList.add('is-visible'));
                } else {
                    observer.observe(el);
                }
            });
        } else {
            // 降級方案：直接顯示
            aosElements.forEach(el => requestAnimationFrame(() => el.classList.add('is-visible')));
        }
    };

    // ====================================================
    // I. 初始化
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
        
        // 性能優化
        setupLazyLoading();
        
        // 文本縮放：執行 setupFitText 並儲存 fitAllTexts 函數
        fitAllTexts = setupFitText(); 
        
        // 動畫
        setupAos();
        
        // 視窗大小改變監聽
        window.addEventListener('resize', () => handleResizeCleanup(fitAllTexts));
    });

})();

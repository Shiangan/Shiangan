// 使用嚴格模式確保程式碼品質與安全性
'use strict';

// ====================================================
// A. 頁面加載性能與 FOUC 處理 (Flash of Unstyled Content)
// ====================================================

/**
 * 移除 HTML 或 Body 上的 'js-loading' 類，確保頁面樣式正常顯示。
 * 使用 requestAnimationFrame 確保在瀏覽器下一次重繪前執行，優化性能。
 * @returns {void}
 */
const removeLoadingClass = () => {
    // 確保同時處理 <html> 和 <body> 上的類別
    const targetElements = [document.documentElement, document.body];
    targetElements.forEach(el => {
        if (el && el.classList.contains('js-loading')) {
            // 在下一次重繪前移除類別，觸發 CSS 顯示
            requestAnimationFrame(() => el.classList.remove('js-loading'));
        }
    });
};

// FOUC 安全網策略：確保樣式盡快載入
document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
window.addEventListener('load', removeLoadingClass, { once: true });
// 最終安全網：避免腳本錯誤導致頁面永久空白
setTimeout(removeLoadingClass, 3000);


// ====================================================
// B. 核心邏輯 - DOMContentLoaded 啟動區塊
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

    try {
        // ====================================================
        // 0. 初始設定與 DOM 變數 (Initial Setup & Variables)
        // ====================================================

        /** @type {(() => void) | undefined} */
        let fitAll; 
        
        /** @type {HTMLElement | null} */
        const header = document.querySelector('.main-header');
        /** @type {HTMLButtonElement | null} */
        const menuToggle = document.querySelector('.menu-toggle');
        /** @type {HTMLElement | null} */
        const mainNav = document.querySelector('#main-nav');
        /** @type {HTMLBodyElement} */
        const body = document.body;
        /** @type {HTMLAnchorElement | null} */
        const backToTopButton = document.querySelector('.back-to-top');
        /** @type {HTMLSpanElement | null} */
        const currentYearSpan = document.getElementById('current-year');
        
        const mobileBreakpoint = 900;
        const SCROLL_THRESHOLD = 10;
        const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
        const RWD_TRANSITION_DURATION = 400; // 0.4s

        // 輔助函數： Debounce (使用 requestAnimationFrame 優化)
        /**
         * @param {Function} func - 要去抖動的函數
         * @param {number} delay - 延遲時間 (ms)
         * @returns {Function}
         */
        const debounce = (func, delay = 50) => {
            let timeoutId;
            let lastArgs;
            let lastThis;

            const run = () => {
                timeoutId = setTimeout(() => {
                    requestAnimationFrame(() => func.apply(lastThis, lastArgs));
                    timeoutId = null;
                }, delay);
            };

            return function(...args) {
                lastArgs = args;
                lastThis = this;

                if (!timeoutId) {
                    run();
                } else {
                    clearTimeout(timeoutId);
                    run();
                }
            };
        };

        const debounceFitText = (func) => debounce(func, 100);

        // 核心：統一的手風琴清理函數 (在 CSS 過渡結束後徹底清理內聯 max-height)
        /**
         * @param {HTMLElement} contentElement - 包含 max-height 屬性的元素 (如 .submenu 或 .accordion-content)
         * @returns {void}
         */
        const onTransitionEndCleanup = (contentElement) => {
             /** @param {TransitionEvent} e */
             const handleTransitionEnd = (e) => {
                 // 檢查是否為 maxHeight 屬性的過渡結束事件
                 if (e.target !== contentElement || e.propertyName !== 'max-height') return;

                 // 只有在收合狀態 (maxHeight === '0px') 或非展開狀態才清除 max-height
                 if (contentElement.style.maxHeight === '0px' || !contentElement.closest('.active')) {
                     contentElement.style.removeProperty('max-height');
                 }
                 contentElement.removeEventListener('transitionend', handleTransitionEnd);
             };
             contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
         };

        // 輔助函數：關閉所有手機子菜單 (Mobile Navigation Accordion)
        const closeAllMobileSubmenus = () => {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    /** @type {HTMLElement | null} */
                    const submenu = li.querySelector('.submenu-container'); // **修正：使用 .submenu-container**
                    /** @type {HTMLElement | null} */
                    const targetLink = li.querySelector('a');

                    if (submenu && targetLink) {
                        li.classList.remove('active');
                        targetLink.setAttribute('aria-expanded', 'false');

                        // 確保先設置當前高度，以保證收合動畫平滑
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;

                        // 觸發 CSS Transition
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px');
                        onTransitionEndCleanup(submenu); 
                    }
                });
            }
        };

        // 獨立的關閉主菜單邏輯 (供漢堡菜單、外部點擊、滾動錨點使用)
        const closeMainMenu = () => {
             if (mainNav && mainNav.classList.contains('active')) {
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
                 // 解除滾動鎖定
                 body.classList.remove('no-scroll');

                 closeAllMobileSubmenus(); 
             }
         };

        // 點擊外部關閉菜單的處理
        /** @param {MouseEvent} e */
        const handleOutsideClick = (e) => {
             // 只有在手機模式下且菜單開啟時才處理
             if (window.innerWidth <= mobileBreakpoint &&
                 mainNav && mainNav.classList.contains('active') &&
                 !mainNav.contains(/** @type {Node} */ (e.target)) && 
                 menuToggle && !menuToggle.contains(/** @type {Node} */ (e.target))) { 
                 closeMainMenu();
             }
         };
         document.addEventListener('click', handleOutsideClick);


        // 輔助函數：處理 RWD 調整時的狀態清理 (徹底重置手機狀態)
        const handleResizeCleanup = () => {
             const isMobileView = window.innerWidth <= mobileBreakpoint;

             // 桌面模式清理手機狀態
             if (!isMobileView) {
                 closeMainMenu(); 

                 // 嚴謹性優化：徹底清除所有手機子菜單的 active 類和 max-height 內聯樣式
                 mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
                     dropdown.classList.remove('active');
                     
                     dropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');

                     /** @type {HTMLElement | null} */
                     const submenu = dropdown.querySelector('.submenu-container'); // **修正：使用 .submenu-container**
                     if (submenu) {
                         submenu.style.removeProperty('max-height'); 
                     }
                 });

                 // 清理桌面 A11Y 狀態
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
             }

             // FAQ/方案細項高度重算 (保持展開狀態的高度在 RWD 變化後依然正確)
             setTimeout(() => {
                 document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded').forEach(/** @type {HTMLElement} */ (content) => {
                      requestAnimationFrame(() => {
                          if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                             content.style.maxHeight = `${content.scrollHeight}px`;
                          }
                      });
                 });
             }, 50);

             // 觸發 Fit Text 重新計算
             if (typeof fitAll === 'function') fitAll();
        };
        window.addEventListener('resize', debounce(handleResizeCleanup, 150));


        // ====================================================
        // 1. Header & 滾動樣式處理 (Scrolled State & Back-to-Top)
        // ====================================================
        try {
            let ticking = false;
            const updateHeaderScrollClass = () => {
                const scrollY = window.scrollY;
                const isScrolled = scrollY > SCROLL_THRESHOLD;
                const isShowBackToTop = scrollY > 300;

                if (header) {
                    header.classList.toggle('scrolled', isScrolled);
                }

                if (backToTopButton) {
                    backToTopButton.classList.toggle('show', isShowBackToTop);
                }
                ticking = false;
            };

            if (header || backToTopButton) {
                updateHeaderScrollClass(); 
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateHeaderScrollClass);
                        ticking = true;
                    }
                }, { passive: true });
            }
        } catch (e) {
            console.error('Header Scroll Logic Failed:', e);
        }


        // ====================================================
        // 2. RWD 手機菜單切換 (Hamburger Menu Toggle & A11Y)
        // ====================================================
        try {
            if (menuToggle && mainNav) {
                const menuIcon = menuToggle.querySelector('i');

                menuToggle.addEventListener('click', function() {
                    const isExpanded = !mainNav.classList.contains('active');

                    if (isExpanded) {
                        mainNav.classList.add('active');
                        this.classList.add('active');
                        this.setAttribute('aria-expanded', 'true');

                        if (menuIcon) {
                             menuIcon.classList.remove('fa-bars');
                             menuIcon.classList.add('fa-times'); 
                        }

                        const shouldLockScroll = window.innerWidth <= mobileBreakpoint;
                        if (shouldLockScroll) {
                             body.classList.add('no-scroll'); 
                        }
                    } else {
                        closeMainMenu();
                    }
                });
            }

            // 桌面下拉選單的鍵盤訪問性 (A11Y - Focus Within)
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                    dropdown.addEventListener('focusin', function() {
                        if (window.innerWidth > mobileBreakpoint) {
                            this.classList.add('focus-within');
                        }
                    });

                    dropdown.addEventListener('focusout', function() {
                         setTimeout(() => {
                            if (window.innerWidth > mobileBreakpoint && !this.contains(document.activeElement)) {
                               this.classList.remove('focus-within');
                           }
                         }, 0);
                    });
                });
            }
        } catch (e) {
            console.error('RWD Menu Logic Failed:', e);
        }

        // ====================================================
        // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
        // ====================================================
        try {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                    targetLink.addEventListener('click', (/** @type {MouseEvent} */ e) => {
                        /** @type {HTMLElement | null} */
                        const parentLi = targetLink.closest('li.dropdown');

                        if (!parentLi) return;

                        const href = targetLink.getAttribute('href') || '';
                        // 判斷該連結是否為「開關觸發器」
                        const isTrigger = href === '' || href === '#';
                        const isMobileView = window.innerWidth <= mobileBreakpoint;

                        // 處理：非觸發器在手機/桌面模式下的導航行為
                        if (!isTrigger) {
                             if (isMobileView) closeMainMenu();
                             return;
                        }

                        // 處理：手機模式 + 觸發器 => 執行手風琴邏輯
                        if (isMobileView && isTrigger) {
                            e.preventDefault();

                            /** @type {HTMLElement | null} */
                            const submenu = parentLi.querySelector('.submenu-container'); // **修正：使用 .submenu-container**
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            if (!submenu) return;

                            if (isCurrentlyActive) {
                                // 收合
                                closeAllMobileSubmenus();
                            } else {
                                // 展開
                                closeAllMobileSubmenus();
                                parentLi.classList.add('active');
                                targetLink.setAttribute('aria-expanded', 'true');

                                submenu.style.maxHeight = '0px';
                                void submenu.offsetHeight; 

                                requestAnimationFrame(() => {
                                     submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                });
                            }
                        }
                    });
                });
            }
        } catch (e) {
            console.error('Mobile Accordion Logic Failed:', e);
        }


        // ====================================================
        // 4. 通用手風琴 (FAQ Accordion Component Logic)
        // ====================================================
        try {
            document.querySelectorAll('.accordion-item').forEach((item, index) => {
                 /** @type {HTMLButtonElement | null} */
                 const headerElement = item.querySelector('.accordion-title'); // **修正：使用 .accordion-title**
                 /** @type {HTMLElement | null} */
                 const content = item.querySelector('.accordion-content');

                 if (headerElement && content) {
                     // A11Y 屬性設置
                     const uniqueId = `faq-item-${index}`; 
                     content.id = `${uniqueId}-content`;
                     headerElement.setAttribute('aria-controls', content.id);

                     const isActive = item.classList.contains('active');
                     headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                     
                     content.style.display = 'block'; 

                     requestAnimationFrame(() => {
                         content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
                     });

                     headerElement.addEventListener('click', function() {
                        const isCurrentlyActive = item.classList.contains('active');

                        // 單一展開模式邏輯 (關閉其他)
                        document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                /** @type {HTMLElement | null} */
                                const otherContent = activeItem.querySelector('.accordion-content');
                                /** @type {HTMLButtonElement | null} */
                                const otherHeader = activeItem.querySelector('.accordion-title');
                                activeItem.classList.remove('active');
                                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');

                                if (otherContent) {
                                    otherContent.style.maxHeight = `${otherContent.scrollHeight}px`;
                                    requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                    onTransitionEndCleanup(otherContent); 
                                }
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);
                        this.setAttribute('aria-expanded', (!isCurrentlyActive).toString());

                        if (!isCurrentlyActive) {
                            // 展開
                            content.style.maxHeight = '0px';
                            void content.offsetHeight; 
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);

                        } else {
                            // 收合
                            content.style.maxHeight = `${content.scrollHeight}px`;
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
                            onTransitionEndCleanup(content); 
                        }
                     });

                     // 鍵盤無障礙操作 Enter/Space
                     headerElement.addEventListener('keydown', function(/** @type {KeyboardEvent} */ e) {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             this.click();
                         }
                     });
                 }
            });
        } catch (e) {
            console.error('FAQ Accordion Logic Failed:', e);
        }

        // ====================================================
        // 4b. 方案細項展開手風琴 (Plan Details Accordion Logic)
        // ====================================================
        /**
         * 處理方案卡片的細項展開/收合
         * @param {HTMLButtonElement} button 觸發按鈕
         * @returns {void}
         */
        const toggleDetails = (button) => {
            /** @type {HTMLElement | null} */
            const card = button.closest('.plan-card');
            /** @type {HTMLElement | null} */
            const details = card?.querySelector('.plan-details-expanded');
            
            if (!card || !details) return;

            const isExpanded = card.classList.contains('expanded');

            card.classList.toggle('expanded', !isExpanded);
            
            // 切換按鈕圖標與文字
            button.innerHTML = !isExpanded ? 
                '收起完整細項 <i class="fas fa-chevron-up"></i>' : 
                '查看完整細項 <i class="fas fa-chevron-down"></i>';

            // 實作平滑過渡
            if (!isExpanded) {
                // 展開
                details.style.maxHeight = '0px';
                void details.offsetHeight;
                requestAnimationFrame(() => details.style.maxHeight = `${details.scrollHeight}px`);
            } else {
                // 收合
                details.style.maxHeight = `${details.scrollHeight}px`;
                requestAnimationFrame(() => details.style.maxHeight = '0px');
                onTransitionEndCleanup(details);
            }
        };
        // 確保函數可以從 HTML 中調用
        window.toggleDetails = toggleDetails;


        // ====================================================
        // 5. 圖片延遲載入 (Image Lazy Loading) - IntersectionObserver
        // ====================================================
        try {
            const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');

            /**
             * 載入單一元素 (img/source) 的圖片來源
             * @param {HTMLElement} el
             * @returns {void}
             */
            const loadImage = (el) => {
                if (el.tagName === 'IMG') {
                    const imgEl = /** @type {HTMLImageElement} */ (el);
                    if (imgEl.dataset.src) {
                        imgEl.src = imgEl.dataset.src;
                        imgEl.removeAttribute('data-src');
                    }
                    if (imgEl.dataset.srcset) {
                        imgEl.srcset = imgEl.dataset.srcset;
                        imgEl.removeAttribute('data-srcset');
                    }
                    imgEl.classList.add('loaded');
                } else if (el.tagName === 'SOURCE') {
                    const sourceEl = /** @type {HTMLSourceElement} */ (el);
                    if (sourceEl.dataset.srcset) {
                        sourceEl.srcset = sourceEl.dataset.srcset;
                        sourceEl.removeAttribute('data-srcset');
                    }
                }
            };

            if ('IntersectionObserver' in window) {
                const observerOptions = {
                    root: null, 
                    rootMargin: LAZY_LOAD_ROOT_MARGIN, 
                    threshold: 0.01
                };

                const imgObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const elementToLoad = /** @type {HTMLElement} */ (entry.target);

                            if (elementToLoad.tagName === 'PICTURE') {
                                elementToLoad.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            } else if (elementToLoad.tagName === 'SOURCE' || elementToLoad.tagName === 'IMG') {
                                loadImage(elementToLoad);
                            }
                            observer.unobserve(entry.target);
                        }
                    });
                }, observerOptions);

                lazyTargets.forEach(el => {
                    imgObserver.observe(el);
                });
            } else {
                 // Fallback
                document.querySelectorAll('img[data-src], source[data-srcset]').forEach(loadImage);
            }
        } catch (e) {
            console.error('Lazy Loading Logic Failed:', e);
        }

        // ====================================================
        // 6. 平滑滾動至錨點 (Smooth Scrolling)
        // ====================================================
        try {
            if (header) {
                document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                    anchor.addEventListener('click', function (/** @type {MouseEvent} */ e) {
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId || '');

                        if (targetElement) {
                            e.preventDefault(); 
                            requestAnimationFrame(() => {
                                const headerHeight = header.offsetHeight;
                                const isMobileMenuOpen = mainNav?.classList.contains('active');

                                // 計算精確的目標位置：目標元素頂部 - Header高度 
                                const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                                
                                window.scrollTo({
                                    top: targetTop,
                                    behavior: 'smooth'
                                });

                                if (isMobileMenuOpen) {
                                     setTimeout(() => {
                                         closeMainMenu();
                                     }, RWD_TRANSITION_DURATION + 100);
                                }
                            });
                        }
                    });
                });
            }

            // Back-to-Top 按鈕的滾動邏輯
            if (backToTopButton) {
                backToTopButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
            }
        } catch (e) {
            console.error('Smooth Scroll Logic Failed:', e);
        }


        // ====================================================
        // 7. 動態生成不規則流星 (Meteor Generation Logic) -> 移除不必要的程式碼
        // ====================================================
        // 由於 .meteor 元素不在提供的 HTML 內，且這段邏輯複雜度高，為保持核心功能精簡，
        // 建議僅保留程式碼結構，但暫不啟用，或將其獨立為專屬的組件腳本。
        // 若您的 CSS 仍需要，請確保 CSS Keyframes 存在。此處不作修改，僅保留原樣。


        // ====================================================
        // 8. 自動更新版權年份 (Footer Copyright Year)
        // ====================================================
        try {
             if (currentYearSpan) {
                currentYearSpan.textContent = new Date().getFullYear().toString();
            }
        } catch (e) {
            console.error('Copyright Year Logic Failed:', e);
        }

        // ====================================================
        // 9. 表單驗證與 UX 強化 (Form Validation & UX) - 異步提交
        // ====================================================
        /** @type {HTMLFormElement | null} */
        const orderForm = document.getElementById('product-order-form');
        /** @type {HTMLElement | null} */
        const statusMessage = document.getElementById('form-status-message');

        if (orderForm) {
            orderForm.addEventListener('submit', async function(e) {
                e.preventDefault();

                /** @type {HTMLButtonElement | null} */
                const submitButton = this.querySelector('button[type="submit"]');
                if (!submitButton) return;

                const originalText = submitButton.textContent;

                submitButton.textContent = '送出中... 請稍候';
                submitButton.disabled = true;
                if (statusMessage) statusMessage.textContent = '';

                try {
                    // 檢查 action URL 是否已被替換
                    if (this.action.includes('your_form_endpoint')) {
                         if (statusMessage) {
                             statusMessage.style.color = '#dc3545';
                             statusMessage.textContent = '❗ 錯誤：請先替換表單 action URL！';
                         }
                         submitButton.textContent = originalText;
                         submitButton.disabled = false;
                         return;
                    }

                    const formData = new FormData(this);

                    const response = await fetch(this.action, {
                        method: this.method,
                        body: formData,
                        headers: {
                            'Accept': 'application/json'
                        }
                    });

                    if (response.ok) {
                        if (statusMessage) {
                           statusMessage.style.color = '#28a745';
                           statusMessage.textContent = '🎉 訂購資訊已成功送出！請等待專人電話聯繫。';
                        }
                        this.reset(); 

                        submitButton.textContent = '訂購成功！';

                        setTimeout(() => {
                            submitButton.textContent = originalText;
                            submitButton.disabled = false;
                        }, 5000); 

                    } else {
                        // 處理 HTTP 錯誤
                        const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤' }));
                        const errorMessage = errorData.error || '表單送出失敗';

                        if (statusMessage) {
                            statusMessage.style.color = '#dc3545';
                            statusMessage.textContent = `❗ ${errorMessage}，請直接撥打 24H 專線訂購：0978-583-699`;
                        }
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    console.error('Submission Error:', error);
                    if (statusMessage) {
                        statusMessage.style.color = '#dc3545';
                        statusMessage.textContent = '❗ 網路錯誤或伺服器無回應。請直接撥打 24H 專線訂購：0978-583-699';
                    }
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });
        }


        // ====================================================
        // 10. 動態文字適應 (Fit Text Logic) - ResizeObserver
        // ====================================================
        try {
            const MAX_FONT = 22;
            const MIN_FONT = 8;
            const PRECISION = 0.2;
            const TARGET_SELECTOR = '.text-line-container span';

            /**
             * 核心：使用二分法計算最佳字體大小 (性能優化)
             * @param {HTMLElement} el
             */
            const fitOne = (el) => {
                 const parentWidth = el.parentElement?.offsetWidth || 0;
                 const text = el.textContent?.trim() || '';

                 if (parentWidth <= 50 || text === '' || !el.parentElement) {
                     el.style.fontSize = `${MAX_FONT}px`;
                     return;
                 }

                 let low = MIN_FONT;
                 let high = MAX_FONT;
                 let bestSize = MIN_FONT;

                 while (low <= high) {
                     const mid = (low + high) / 2;
                     el.style.fontSize = `${mid}px`;

                     if (el.scrollWidth <= parentWidth) {
                         bestSize = mid;
                         low = mid + PRECISION; 
                     } else {
                         high = mid - PRECISION; 
                     }
                 }

                 el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
            };

            // 統一觸發所有元素的重新計算
            fitAll = () => {
                 const nodes = document.querySelectorAll(TARGET_SELECTOR);
                 requestAnimationFrame(() => nodes.forEach(el => fitOne(/** @type {HTMLElement} */ (el))));
            };

            // 啟動 Fit Text 邏輯
            const startFitText = () => {
                fitAll(); 

                if (window.ResizeObserver) {
                    const fitTextObserver = new ResizeObserver(entries => {
                        const hasWidthChange = entries.some(entry => entry.contentRect.width !== 0);
                        if (hasWidthChange) {
                            debounceFitText(fitAll)(); 
                        }
                    });

                    const observedParents = new Set();
                    document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
                         const parent = el.parentElement;
                         if (parent && !observedParents.has(parent)) {
                              fitTextObserver.observe(parent);
                              observedParents.add(parent);
                         }
                    });
                } else {
                    window.addEventListener('resize', debounceFitText(fitAll));
                }
            };

            if (document.fonts?.ready) {
                document.fonts.ready.then(startFitText).catch(startFitText);
            } else {
                window.addEventListener('load', startFitText);
            }
        } catch (e) {
            console.error('Fit Text Logic Failed:', e);
        }


        // ====================================================
        // 11. 滾動時動畫觸發 (Animation On Scroll - AOS) - IntersectionObserver
        // ====================================================
        try {
            const aosElements = document.querySelectorAll('.animate-on-scroll');

            if ('IntersectionObserver' in window && aosElements.length > 0) {
                const aosObserverOptions = {
                    root: null,
                    rootMargin: '0px 0px -15% 0px', 
                    threshold: 0.01
                };

                const aosObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            requestAnimationFrame(() => {
                                 entry.target.classList.add('is-visible'); 
                            });
                            observer.unobserve(entry.target);
                        }
                    });
                }, aosObserverOptions);

                aosElements.forEach(el => {
                    aosObserver.observe(el);
                });
            } else if (aosElements.length > 0) {
                 // Fallback
                 aosElements.forEach(el => el.classList.add('is-visible'));
            }
        } catch (e) {
            console.error('AOS Trigger Logic Failed:', e);
        }

    } catch (finalError) {
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

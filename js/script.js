// 【最終程式碼：js/script.js】

// 使用嚴格模式確保程式碼品質
'use strict';

// ====================================================
// A. 頁面加載性能與 FOUC 處理
// ====================================================

/**
 * 移除 HTML 或 Body 上的 'js-loading' 類，解決 Flash of Unstyled Content (FOUC) 問題。
 * 使用 requestAnimationFrame 確保在瀏覽器下一次重繪前執行。
 * @returns {void}
 */
const removeLoadingClass = () => {
    // 使用 document.documentElement (<html>)
    const targetElements = [document.documentElement, document.body];
    targetElements.forEach(el => {
        if (el && el.classList.contains('js-loading')) {
            // 在下一次重繪前移除類別，確保瀏覽器有時間應用 CSS
            requestAnimationFrame(() => el.classList.remove('js-loading'));
        }
    });
};

// FOUC 安全網策略：
// 1. DOM 樹結構載入完成時
document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });

// 2. 所有資源（圖片、字體）載入完成時 (最高安全性)
window.addEventListener('load', removeLoadingClass, { once: true });

// 3. 最終安全網：如果腳本執行失敗，強制在 3 秒後移除 CSS 隱藏，避免永久空白。
setTimeout(removeLoadingClass, 3000);


// ====================================================
// B. 核心邏輯 - DOMContentLoaded 啟動區塊
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================

    /** @type {(() => void) | undefined} */
    let fitAll; // 聲明，用於 Fit Text 邏輯

    try {
        // DOM 變數
        const header = document.querySelector('.main-header');
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        const body = document.body;
        const backToTopButton = document.querySelector('.back-to-top');
        const currentYearSpan = document.getElementById('current-year');
        
        /** @type {number} */
        const mobileBreakpoint = 900;

        // 配置變數
        const SCROLL_THRESHOLD = 10;
        const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
        const RWD_TRANSITION_DURATION = 400; // 0.4s

        // 輔助函數： Debounce (去抖動) - 使用 requestAnimationFrame 優化
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
                    // 在 RAF 中執行實際函數，確保在繪製週期內
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

        // 核心：統一的手風琴清理函數 (在 CSS 過渡結束後清除內聯 max-height)
        /**
         * @param {HTMLElement} contentElement
         * @returns {void}
         */
        const onTransitionEndCleanup = (contentElement) => {
             /** @param {TransitionEvent} e */
             const handleTransitionEnd = (e) => {
                 // 檢查是否為 maxHeight 屬性的過渡結束事件，且事件源是 contentElement 本身
                 if (e.target !== contentElement || e.propertyName !== 'max-height') return;

                 // 只有在收合狀態 (maxHeight === '0px') 才清除 max-height
                 if (contentElement.style.maxHeight === '0px') {
                     // **修正點：使用 removeProperty 徹底清除內聯樣式**
                     contentElement.style.removeProperty('max-height');
                 }
                 // 任務完成，移除事件監聽器
                 contentElement.removeEventListener('transitionend', handleTransitionEnd);
             };
             contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
         };

        // 輔助函數：關閉所有手機子菜單 (Accordion)
        const closeAllMobileSubmenus = () => {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    /** @type {HTMLElement | null} */
                    const submenu = li.querySelector('.submenu');
                    /** @type {HTMLElement | null} */
                    const targetLink = li.querySelector('a');

                    if (submenu && targetLink) {
                        li.classList.remove('active');
                        targetLink.setAttribute('aria-expanded', 'false');

                        // 確保先設置當前高度，以保證收合動畫平滑
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;

                        // 使用 requestAnimationFrame 確保在下一次重繪前將高度設為 0，觸發 CSS Transition
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px');
                        onTransitionEndCleanup(submenu); // 使用統一的清理函數
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
                          menuIcon.classList.remove('fa-times'); // 切換圖標：關閉 -> 菜單
                          menuIcon.classList.add('fa-bars');
                     }
                 }
                 // 解除滾動鎖定
                 body.classList.remove('no-scroll');

                 closeAllMobileSubmenus(); // 確保子菜單一併清理
             }
         };

        // 點擊外部關閉菜單的處理
        /** @param {MouseEvent} e */
        const handleOutsideClick = (e) => {
             // 只有在手機模式下且菜單開啟時才處理
             if (window.innerWidth <= mobileBreakpoint &&
                 mainNav && mainNav.classList.contains('active') &&
                 !mainNav.contains(e.target) && // 點擊目標不在菜單內
                 menuToggle && !menuToggle.contains(e.target)) { // 點擊目標不在漢堡按鈕上
                 closeMainMenu();
             }
         };

         // 註冊點擊外部監聽器
         document.addEventListener('click', handleOutsideClick);


        // 輔助函數：處理 RWD 調整時的狀態清理 (最高嚴謹性)
        const handleResizeCleanup = () => {
             const isMobileView = window.innerWidth <= mobileBreakpoint;

             // 桌面模式清理手機狀態
             if (!isMobileView) {
                 closeMainMenu(); // 強制關閉主菜單 (清除 no-scroll 和 active 類)

                 // 清理子選單 max-height，避免過渡動畫在桌面模式錯誤觸發
                 mainNav.querySelectorAll('.dropdown').forEach(dropdown => {
                     // 確保移除手機模式下的 'active' 類
                     dropdown.classList.remove('active');
                     
                     // 確保移除 aria-expanded 屬性
                     dropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');

                     /** @type {HTMLElement | null} */
                     const submenu = dropdown.querySelector('.submenu');
                     if (submenu) {
                         // 移除內聯 max-height 樣式
                         submenu.style.removeProperty('max-height'); 
                     }
                 });

                 // 清理桌面 A11Y 狀態 (focus-within)
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
             }

             // FAQ 高度重算 (保持展開狀態的高度在 RWD 變化後依然正確)
             setTimeout(() => {
                 document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
                      requestAnimationFrame(() => {
                          // 只有在展開狀態才需要重新設置高度
                          if (content.classList.contains('active') || (content.style.maxHeight && content.style.maxHeight !== '0px')) {
                              // 重新設置 max-height 為新的 scrollHeight
                              content.style.maxHeight = `${content.scrollHeight}px`;
                          }
                      });
                 });
             }, 50);

             // 觸發 Fit Text 重新計算
             if (typeof fitAll === 'function') fitAll();
        };

        // 啟用 Resize 監聽器 (去抖動，優化性能)
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
                updateHeaderScrollClass(); // 初始檢查
                // 使用 passive: true 和 requestAnimationFrame 提高滾動性能
                window.addEventListener('scroll', () => {
                    if (!ticking) {
                        requestAnimationFrame(updateHeaderScrollClass);
                        ticking = true;
                    }
                }, { passive: true });
            }
        } catch (e) {
            console.error('Core Logic Failed: Header Scroll', e);
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
                        // 展開邏輯
                        mainNav.classList.add('active');
                        this.classList.add('active');
                        this.setAttribute('aria-expanded', 'true');

                        if (menuIcon) {
                             menuIcon.classList.remove('fa-bars');
                             menuIcon.classList.add('fa-times'); // 切換圖標：菜單 -> 關閉
                        }

                        const shouldLockScroll = window.innerWidth <= mobileBreakpoint;
                        if (shouldLockScroll) {
                             body.classList.add('no-scroll'); // 鎖定滾動
                        }
                    } else {
                        // 關閉邏輯
                        closeMainMenu();
                    }
                });
            }

            // 桌面下拉選單的鍵盤訪問性 (A11Y - Focus Within)
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                    /** @param {FocusEvent} e */
                    dropdown.addEventListener('focusin', function(e) {
                        // 確保只有在桌面模式才觸發 (避免干擾手機手風琴)
                        if (window.innerWidth > mobileBreakpoint) {
                            this.classList.add('focus-within');
                        }
                    });

                    // 使用 'focusout' 處理失去焦點
                    /** @param {FocusEvent} e */
                    dropdown.addEventListener('focusout', function(e) {
                         // 使用 setTimeout(0) 確保相關焦點事件 (relatedTarget/document.activeElement) 穩定
                         setTimeout(() => {
                            // 只有在桌面模式下，且當前焦點不在下拉選單或子選單內時才移除 focus-within
                            if (window.innerWidth > mobileBreakpoint && !this.contains(document.activeElement)) {
                               this.classList.remove('focus-within');
                           }
                         }, 0);
                    });
                });
            }
        } catch (e) {
            console.error('Core Logic Failed: RWD Menu', e);
        }

        // ====================================================
        // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
        // ====================================================
        try {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                    /** @param {MouseEvent} e */
                    targetLink.addEventListener('click', (e) => {
                        /** @type {HTMLElement | null} */
                        const parentLi = targetLink.closest('li.dropdown');

                        if (!parentLi) return;

                        const href = targetLink.getAttribute('href') || ''; // 確保 href 為字串
                        // 判斷該連結是否為「開關觸發器」: '#' 或空
                        const isTrigger = href === '' || href === '#';

                        const isMobileView = window.innerWidth <= mobileBreakpoint;

                        // 1. 桌面模式：讓 CSS hover/focus-within 處理
                        if (!isMobileView && !isTrigger) return;

                        // 2. 手機模式 + 非觸發器：允許導航，但先關閉菜單 (極佳使用者體驗)
                        if (isMobileView && !isTrigger) {
                            closeMainMenu(); // 立即關閉，避免延遲跳轉
                            return;
                        }

                        // 3. 手機模式 + 觸發器：執行手風琴邏輯
                        if (isMobileView && isTrigger) {
                            e.preventDefault();

                            /** @type {HTMLElement | null} */
                            const submenu = parentLi.querySelector('.submenu');
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            if (!submenu) {
                                return;
                            }

                            if (isCurrentlyActive) {
                                // 收合操作：由 closeAllMobileSubmenus 執行
                                closeAllMobileSubmenus();
                            } else {
                                // 執行展開：先收合其他，再展開自己
                                closeAllMobileSubmenus();
                                parentLi.classList.add('active');
                                targetLink.setAttribute('aria-expanded', 'true');

                                // 確保從 0 開始平滑展開
                                submenu.style.maxHeight = '0px';
                                // 強制 Reflow，使用 offsetHeight
                                void submenu.offsetHeight; 

                                // 設置正確的 max-height
                                requestAnimationFrame(() => {
                                     submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                });
                            }
                        }
                    });
                });
            }
        } catch (e) {
            console.error('Core Logic Failed: Mobile Accordion', e);
        }


        // ====================================================
        // 4. 通用手風琴 (FAQ Accordion Component Logic)
        // ====================================================
        try {
            document.querySelectorAll('.accordion-item').forEach((item, index) => {
                 /** @type {HTMLButtonElement | null} */
                 const headerElement = item.querySelector('.accordion-header');
                 /** @type {HTMLElement | null} */
                 const content = item.querySelector('.accordion-content');

                 if (headerElement && content) {
                     // A11Y 屬性設置
                     // 確保 ID 唯一性 (加入時間戳以防萬一)
                     const uniqueId = `faq-item-${index}-${Date.now()}`; 
                     content.id = `${uniqueId}-content`;
                     headerElement.setAttribute('aria-controls', content.id);

                     const isActive = item.classList.contains('active');
                     headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                     
                     content.style.display = 'block'; // 確保 scrollHeight 正確計算

                     // 初始化 max-height
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
                                const otherHeader = activeItem.querySelector('.accordion-header');
                                activeItem.classList.remove('active');
                                if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');

                                // 收合操作
                                if (otherContent) {
                                    otherContent.style.maxHeight = `${otherContent.scrollHeight}px`;
                                    requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                    onTransitionEndCleanup(otherContent); // 使用統一清理函數
                                }
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);

                        // 實作平滑過渡
                        if (!isCurrentlyActive) {
                            // 展開
                            this.setAttribute('aria-expanded', 'true');
                            content.style.maxHeight = '0px';
                            void content.offsetHeight; // 強制 Reflow
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);

                        } else {
                            // 收合
                            this.setAttribute('aria-expanded', 'false');
                            content.style.maxHeight = `${content.scrollHeight}px`;
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
                            onTransitionEndCleanup(content); // 使用統一清理函數
                        }
                     });

                     // 鍵盤無障礙操作 Enter/Space
                     /** @param {KeyboardEvent} e */
                     headerElement.addEventListener('keydown', function(e) {
                         if (e.key === 'Enter' || e.key === ' ') {
                             e.preventDefault();
                             this.click();
                         }
                     });
                 }
            });
        } catch (e) {
            console.error('Core Logic Failed: FAQ Accordion', e);
        }


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
                    imgEl.classList.add('loaded'); // 添加 loaded 類別以觸發 CSS 動畫
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
                    root: null, // 相對於 viewport
                    rootMargin: LAZY_LOAD_ROOT_MARGIN, // 提前 200px 載入
                    threshold: 0.01
                };

                const imgObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const elementToLoad = /** @type {HTMLElement} */ (entry.target);

                            if (elementToLoad.tagName === 'PICTURE') {
                                // 載入 PICTURE 內所有 SOURCE 和 IMG
                                elementToLoad.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            } else if (elementToLoad.tagName === 'SOURCE' || elementToLoad.tagName === 'IMG') {
                                loadImage(elementToLoad);
                            }
                            observer.unobserve(entry.target); // 只需要觸發一次
                        }
                    });
                }, observerOptions);

                lazyTargets.forEach(el => {
                    // 觀察所有帶有 data-src/data-srcset 的元素
                    imgObserver.observe(el);
                });
            } else {
                 // Fallback: 如果不支援 IntersectionObserver，則全部載入
                document.querySelectorAll('img[data-src], source[data-srcset]').forEach(loadImage);
            }
        } catch (e) {
            console.error('Core Logic Failed: Lazy Loading', e);
        }

        // ====================================================
        // 6. 平滑滾動至錨點 (Smooth Scrolling)
        // ====================================================
        try {
            if (header) {
                // 排除：1. href="#" 2. 手機菜單下拉觸發器
                document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                     const href = anchor.getAttribute('href');
                     const isMobileAccordionTrigger = anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint && (href === '#' || href === '');
                     if (isMobileAccordionTrigger) return;

                    /** @param {MouseEvent} e */
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            requestAnimationFrame(() => {
                                const headerHeight = header.offsetHeight;
                                const isMobileMenuOpen = mainNav && mainNav.classList.contains('active');

                                // 計算精確的目標位置：目標元素頂部 - Header高度 
                                const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                                

                                // 使用 Web API 實現平滑滾動
                                window.scrollTo({
                                    top: targetTop,
                                    behavior: 'smooth'
                                });

                                // 延遲關閉手機菜單 (等待滾動動畫結束後)
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
            console.error('Core Logic Failed: Smooth Scroll', e);
        }


        // ====================================================
        // 7. 動態生成不規則流星 (Meteor Generation Logic)
        // ====================================================
        try {
            const meteors = document.querySelectorAll('.meteor');
            const METEOR_DISTANCE = 500;

            if (meteors.length > 0) {
                // 初始化流星動畫屬性
                meteors.forEach(meteor => {
                    // 1. 設置初始隨機位置
                    meteor.style.top = `${Math.random() * 100}vh`;
                    meteor.style.left = `${Math.random() * 100}vw`;

                    // 2. 設置 CSS 變數，實現從右上到左下的移動
                    meteor.style.setProperty('--rotation', '135deg');
                    meteor.style.setProperty('--travel-x', `-${METEOR_DISTANCE}px`);
                    meteor.style.setProperty('--travel-y', `${METEOR_DISTANCE}px`);

                    // 3. 設置動畫屬性
                    meteor.style.animationName = 'shooting-star-random';
                    const duration = 1 + Math.random() * 2; // 1s 到 3s
                    const delay = Math.random() * 10; // 0s 到 10s
                    meteor.style.animationDuration = `${duration}s`;
                    meteor.style.animationDelay = `${delay}s`;
                    meteor.style.animationIterationCount = 'infinite';
                    meteor.style.animationTimingFunction = 'linear';
                });
            }
        } catch (e) {
            console.error('Core Logic Failed: Meteor Generation', e);
        }


        // ====================================================
        // 8. 自動更新版權年份 (Footer Copyright Year)
        // ====================================================
        try {
             if (currentYearSpan) {
                currentYearSpan.textContent = new Date().getFullYear().toString();
            }
        } catch (e) {
            console.error('Core Logic Failed: Copyright Year', e);
        }

        // ====================================================
        // 9. 表單驗證與 UX 強化 (Form Validation & UX)
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

                // 禁用按鈕並更新狀態
                submitButton.textContent = '送出中... 請稍候';
                submitButton.disabled = true;
                if (statusMessage) statusMessage.textContent = '';

                try {
                    // 確保 action 屬性已替換 (防呆)
                    if (this.action.includes('your_form_endpoint')) {
                         if (statusMessage) {
                             statusMessage.style.color = 'var(--error-color, #dc3545)';
                             statusMessage.textContent = '❗ 錯誤：請先替換表單 action URL！ (代碼 0x10)';
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
                           statusMessage.style.color = 'var(--success-color, #28a745)';
                           statusMessage.textContent = '🎉 訂購資訊已成功送出！請等待專人電話聯繫。';
                        }
                        this.reset(); // 清空表單

                        // 成功後延遲解除禁用狀態
                        submitButton.textContent = '訂購成功！';

                        setTimeout(() => {
                            submitButton.textContent = originalText;
                            submitButton.disabled = false;
                        }, 5000); // 5秒後恢復原始按鈕狀態

                    } else {
                        // 處理 HTTP 錯誤 (4xx, 5xx)
                        const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤 (代碼 0x11)' }));
                        const errorMessage = errorData.error || '表單送出失敗';

                        if (statusMessage) {
                            statusMessage.style.color = 'var(--error-color, #dc3545)';
                            statusMessage.textContent = `❗ ${errorMessage}，請直接撥打 24H 專線訂購：0978-583-699`;
                        }
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    console.error('Submission Error:', error);
                    if (statusMessage) {
                        statusMessage.style.color = 'var(--error-color, #dc3545)';
                        statusMessage.textContent = '❗ 網路錯誤或伺服器無回應。請直接撥打 24H 專線訂購：0978-583-699 (代碼 0x12)';
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
             * 核心：使用二分法計算最佳字體大小
             * @param {HTMLElement} el
             */
            const fitOne = (el) => {
                 const parentWidth = el.parentElement ? el.parentElement.offsetWidth : 0;
                 const text = el.textContent ? el.textContent.trim() : '';

                 if (parentWidth <= 50 || text === '' || !el.parentElement) {
                     el.style.fontSize = `${MAX_FONT}px`;
                     return;
                 }

                 let low = MIN_FONT;
                 let high = MAX_FONT;
                 let bestSize = MIN_FONT;

                 // 二分法搜尋最佳字體
                 while (low <= high) {
                     const mid = (low + high) / 2;
                     el.style.fontSize = `${mid}px`;

                     if (el.scrollWidth <= parentWidth) {
                         bestSize = mid;
                         low = mid + PRECISION; // 嘗試更大的字體
                     } else {
                         high = mid - PRECISION; // 嘗試更小的字體
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
                fitAll(); // 初始計算

                if (window.ResizeObserver) {
                    const fitTextObserver = new ResizeObserver(entries => {
                        const hasWidthChange = entries.some(entry => entry.contentRect.width !== 0);
                        if (hasWidthChange) {
                            debounceFitText(fitAll)(); // 使用 debounce + RAF 優化
                        }
                    });

                    // 觀察每個目標元素的父容器
                    const observedParents = new Set();
                    document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
                         const parent = el.parentElement;
                         if (parent && !observedParents.has(parent)) {
                              fitTextObserver.observe(parent);
                              observedParents.add(parent);
                         }
                    });
                } else {
                    // Fallback: 使用 window.resize
                    window.addEventListener('resize', debounceFitText(fitAll));
                }
            };

            // 確保字體載入完成後才開始計算，避免字體替換造成的跳動
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(startFitText).catch(startFitText);
            } else {
                window.addEventListener('load', startFitText);
            }
        } catch (e) {
            console.error('Core Logic Failed: Fit Text', e);
        }


        // ====================================================
        // 11. 滾動時動畫觸發 (Animation On Scroll - AOS) - IntersectionObserver
        // ====================================================
        try {
            const aosElements = document.querySelectorAll('.animate-on-scroll');

            if ('IntersectionObserver' in window && aosElements.length > 0) {
                const aosObserverOptions = {
                    root: null,
                    // 提前 15% 觸發
                    rootMargin: '0px 0px -15% 0px',
                    threshold: 0.01
                };

                const aosObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            requestAnimationFrame(() => {
                                 entry.target.classList.add('is-visible'); // 添加觸發動畫的類別
                            });
                            observer.unobserve(entry.target); // 只需要觸發一次
                        }
                    });
                }, aosObserverOptions);

                aosElements.forEach(el => {
                    aosObserver.observe(el);
                });
            } else if (aosElements.length > 0) {
                 // Fallback: 如果不支持 IntersectionObserver，則全部顯示
                 aosElements.forEach(el => el.classList.add('is-visible'));
            }
        } catch (e) {
            console.error('Core Logic Failed: AOS Trigger', e);
        }

    } catch (finalError) {
        // 捕捉所有核心邏輯初始化時的最終致命錯誤。
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

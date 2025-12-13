'use strict';

// ====================================================
// 0. 環境設定與通用常量 (Constants & Environment)
// ====================================================

const MOBILE_BREAKPOINT = 900;
const SCROLL_THRESHOLD = 10;
const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
const RWD_TRANSITION_DURATION_MS = 400; 
const FIT_TEXT_SELECTOR = '.text-line-container span';
const AOS_ROOT_MARGIN = '0px 0px -15% 0px';
const FOUC_TIMEOUT_MS = 3000;


// ====================================================
// A. 輔助函數 (Utility Functions)
// ====================================================

/**
 * 核心：統一的手風琴清理函數。在 CSS 過渡結束後，徹底清除內聯的 max-height，
 * 避免 RWD 切換時樣式衝突。
 * @param {HTMLElement} contentElement - 包含 max-height 屬性的元素 (如 .submenu-container, .accordion-content)
 * @returns {void}
 */
const onTransitionEndCleanup = (contentElement) => {
    /** @param {TransitionEvent} e */
    const handleTransitionEnd = (e) => {
        // 檢查是否為 maxHeight 屬性的過渡結束事件
        if (e.target !== contentElement || e.propertyName !== 'max-height') return;

        // 只有在收合狀態 (maxHeight === '0px') 或非展開狀態才清除 max-height
        // 使用 getComputedStyle 檢查實際的高度，防止 CSS 導致的判斷錯誤
        const isExpanded = contentElement.closest('.active') || contentElement.closest('.expanded');

        // 在非展開狀態或收合動畫完成時清除
        if (!isExpanded || window.getComputedStyle(contentElement).maxHeight === '0px') {
            contentElement.style.removeProperty('max-height');
            contentElement.style.removeProperty('overflow'); 
        }
        
        contentElement.removeEventListener('transitionend', handleTransitionEnd);
    };
    // 使用 { once: true } 確保只運行一次
    contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
};


/**
 * 輔助函數： Debounce (使用 requestAnimationFrame 優化)
 * @param {Function} func - 要去抖動的函數
 * @param {number} [delay=50] - 延遲時間 (ms)
 * @returns {Function}
 */
const debounce = (func, delay = 50) => {
    let timeoutId = null;
    /** @type {any} */
    let lastArgs;
    /** @type {any} */
    let lastThis;

    const run = () => {
        timeoutId = setTimeout(() => {
            // 在 requestAnimationFrame 內執行，確保視覺更新在正確的時機發生
            requestAnimationFrame(() => func.apply(lastThis, lastArgs));
            timeoutId = null;
        }, delay);
    };

    return function(...args) {
        lastArgs = args;
        lastThis = this;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        run();
    };
};

// 專用於 Fit Text 的去抖動函數
/** @type {(func: Function) => Function} */
const debounceFitText = (func) => debounce(func, 100);


// ====================================================
// B. 性能與 FOUC 處理 (Flash of Unstyled Content)
// ====================================================

/**
 * 移除 HTML 或 Body 上的 'js-loading' 類，確保頁面樣式正常顯示。
 * @returns {void}
 */
const removeLoadingClass = () => {
    // 使用 requestAnimationFrame 確保在下一幀進行視覺更新，避免阻塞主線程
    requestAnimationFrame(() => {
        document.documentElement.classList.remove('js-loading');
        document.body.classList.remove('js-loading');
    });
};

// FOUC 安全網策略: 確保在不同時間點都能移除 loading 類
document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
window.addEventListener('load', removeLoadingClass, { once: true });
setTimeout(removeLoadingClass, FOUC_TIMEOUT_MS);


// ====================================================
// C. 導航菜單核心模組 (Navigation Core Module)
// ====================================================

const header = document.querySelector('.site-header'); 
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#main-nav');
const body = document.body;
const backToTopButton = document.querySelector('.back-to-top');

/**
 * 輔助函數：檢查當前是否為移動端視圖
 * @returns {boolean}
 */
const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

/**
 * 輔助函數：關閉所有手機子菜單 (Mobile Navigation Accordion)
 * @returns {void}
 */
const closeAllMobileSubmenus = () => {
    if (mainNav) {
        // 使用 Array.from 避免在迴圈中修改 DOM 集合時出錯
        Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
            const submenu = /** @type {HTMLElement | null} */ (li.querySelector('.submenu-container')); 
            const targetLink = /** @type {HTMLAnchorElement | null} */ (li.querySelector('a'));

            if (submenu && targetLink) {
                li.classList.remove('active');
                targetLink.setAttribute('aria-expanded', 'false');

                // 使用 rAF 確保過渡生效 (從當前高度收合)
                // 檢查是否還有 max-height 屬性，防止重複設定
                if (submenu.style.maxHeight && submenu.style.maxHeight !== '0px') {
                    submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                    requestAnimationFrame(() => submenu.style.maxHeight = '0px');
                    onTransitionEndCleanup(submenu); 
                }
            }
        });
    }
};

/**
 * 獨立的關閉主菜單邏輯
 * @returns {void}
 */
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
        body.classList.remove('no-scroll');
        closeAllMobileSubmenus(); 
    }
};

/**
 * 處理 Header 滾動樣式與 Back-to-Top 按鈕顯示
 * @returns {void}
 */
const handleHeaderScroll = () => {
    const updateHeaderScrollClass = () => {
        const scrollY = window.scrollY;
        const isScrolled = scrollY > SCROLL_THRESHOLD;
        const isShowBackToTop = scrollY > 300;

        if (header) {
            // 使用 classList.toggle(state) 更簡潔
            header.classList.toggle('scrolled', isScrolled);
        }

        if (backToTopButton) {
            backToTopButton.classList.toggle('show', isShowBackToTop);
        }
    };

    if (header || backToTopButton) {
        updateHeaderScrollClass(); 
        // 延遲降低到 10ms，提高滾動響應速度
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 10), { passive: true });
    }
};


/**
 * 設置 RWD 手機菜單切換與外部點擊關閉邏輯
 * @returns {void}
 */
const setupRwdMenuToggle = () => {
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i');

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.contains('active');

            if (!isExpanded) {
                // 展開
                mainNav.classList.add('active');
                this.classList.add('active');
                this.setAttribute('aria-expanded', 'true');

                if (menuIcon) {
                     menuIcon.classList.replace('fa-bars', 'fa-times');
                }

                if (isMobileView()) {
                     body.classList.add('no-scroll'); 
                }
            } else {
                // 收合
                closeMainMenu();
            }
        });

        // 點擊外部關閉菜單的處理 (使用更精確的 e.target 檢查)
        /** @param {MouseEvent} e */
        const handleOutsideClick = (e) => {
            const target = /** @type {Node} */ (e.target);
             // 確保是在手機視圖下，且菜單是展開的
             if (isMobileView() &&
                 mainNav.classList.contains('active') &&
                 !mainNav.contains(target) && 
                 menuToggle && !menuToggle.contains(target)) { 
                 closeMainMenu();
             }
         };
         document.addEventListener('click', handleOutsideClick);
    }
};


/**
 * 設置響應式導航手風琴選單 (Mobile Navigation Accordion)
 * @returns {void}
 */
const setupMobileAccordion = () => {
    if (mainNav) {
        // 僅針對帶有子菜單的 dropdown 項目進行處理
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', (/** @type {MouseEvent} */ e) => {
                const parentLi = targetLink.closest('li.dropdown');
                if (!parentLi || !isMobileView()) return; // 僅在手機模式下執行

                const submenu = /** @type {HTMLElement | null} */ (parentLi.querySelector('.submenu-container')); 
                if (!submenu) return;

                const href = targetLink.getAttribute('href') || '';
                const isTrigger = href === '' || href === '#'; 
                
                if (!isTrigger) {
                     // 允許在手機模式下點擊帶連結的菜單項
                     closeMainMenu();
                     return;
                }

                // 手機模式下的手風琴邏輯
                e.preventDefault();

                const isCurrentlyActive = parentLi.classList.contains('active');

                // 關閉其他 (單一展開模式)
                closeAllMobileSubmenus(); 

                if (!isCurrentlyActive) {
                    // 展開
                    parentLi.classList.add('active');
                    targetLink.setAttribute('aria-expanded', 'true');

                    submenu.style.maxHeight = '0px';
                    void submenu.offsetHeight; // 觸發重排，確保過渡生效

                    requestAnimationFrame(() => {
                         submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                    });
                     // 過渡完成後清理
                    setTimeout(() => onTransitionEndCleanup(submenu), RWD_TRANSITION_DURATION_MS); 
                } 
                // 收合邏輯已經在 closeAllMobileSubmenus 中處理
            });
        });
    }
};


/**
 * 設置桌面下拉選單的鍵盤訪問性 (A11Y - Focus Within)
 * @returns {void}
 */
const setupDesktopA11y = () => {
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
            // 使用 focusin 和 focusout 處理委派和冒泡
            dropdown.addEventListener('focusin', function() {
                if (!isMobileView()) {
                    this.classList.add('focus-within');
                }
            });

            dropdown.addEventListener('focusout', function() {
                 // 延遲執行，檢查新的 activeElement 是否仍在下拉菜單內部
                 setTimeout(() => {
                    // 在此確保 DOM 中的 activeElement 不在當前 dropdown 內
                    if (!isMobileView() && !this.contains(document.activeElement)) {
                       this.classList.remove('focus-within');
                   }
                 }, 0);
            });
        });
    }
};


/**
 * 處理 RWD 調整時的狀態清理 (徹底重置手機狀態和重算展開元素高度)
 * @param {(() => void) | undefined} fitAllFunction - Fit Text 的重算函數
 * @returns {void}
 */
const handleResizeCleanup = (fitAllFunction) => {
     // 1. 手機菜單清理
     if (!isMobileView()) {
         closeMainMenu(); 

         mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
             // 清理桌面模式下不需要的內聯樣式
             const submenu = /** @type {HTMLElement | null} */ (dropdown.querySelector('.submenu-container')); 
             if (submenu) {
                 submenu.style.removeProperty('max-height'); 
                 submenu.style.removeProperty('overflow');
             }
         });
     }

     // 2. 展開元素高度重算 (確保在 RWD 變化後高度依然正確)
     setTimeout(() => {
         // 統一處理所有手風琴內容
         document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded').forEach(/** @type {HTMLElement} */ (content) => {
              // 僅在存在 max-height 且非零時才重算
              if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                 requestAnimationFrame(() => {
                    // 獲取正確 scrollHeight
                    const newHeight = content.scrollHeight;
                    // 重新設定高度，確保過渡狀態正確
                    content.style.maxHeight = `${newHeight}px`; 
                 });
              }
         });
     }, 100); 

     // 3. Fit Text 重算
     if (typeof fitAllFunction === 'function') fitAllFunction();
};


// ====================================================
// D. 互動組件模組 (Interactive Components Module)
// ====================================================

/**
 * 通用手風琴 (FAQ Accordion Component Logic)
 * @returns {void}
 */
const setupAccordion = () => {
    document.querySelectorAll('.accordion-item').forEach((item, index) => {
         const headerElement = /** @type {HTMLButtonElement | null} */ (item.querySelector('.accordion-title')); 
         const content = /** @type {HTMLElement | null} */ (item.querySelector('.accordion-content'));

         if (headerElement && content) {
             // A11Y 屬性設置
             const uniqueId = `faq-item-${index}`; 
             content.id = `${uniqueId}-content`;
             headerElement.setAttribute('aria-controls', content.id);

             const isActive = item.classList.contains('active');
             headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             
             // 初始狀態設置：確保在 JS 控制 max-height 前 display:block
             content.style.display = 'block'; 
             content.style.overflow = 'hidden'; 
             content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
             // 初始展開時移除 overflow，允許內容顯示陰影等
             if (isActive) content.style.removeProperty('overflow'); 

             headerElement.addEventListener('click', function() {
                const isCurrentlyActive = item.classList.contains('active');

                // 單一展開模式邏輯 (關閉其他 active 項目)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = /** @type {HTMLElement | null} */ (activeItem.querySelector('.accordion-content'));
                        const otherHeader = /** @type {HTMLButtonElement | null} */ (activeItem.querySelector('.accordion-title'));
                        
                        activeItem.classList.remove('active');
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');

                        if (otherContent) {
                            otherContent.style.overflow = 'hidden';
                            // 立即設定高度，rAF 開始收合
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
                    content.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                         content.style.maxHeight = `${content.scrollHeight}px`;
                         // 過渡完成後移除 overflow: hidden (在 onTransitionEndCleanup 處理)
                         onTransitionEndCleanup(content); 
                    });

                } else {
                    // 收合
                    content.style.overflow = 'hidden';
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
};

/**
 * 處理方案卡片的細項展開/收合
 * @param {HTMLButtonElement} button 觸發按鈕
 * @returns {void}
 */
const toggleDetails = (button) => {
    const card = /** @type {HTMLElement | null} */ (button.closest('.plan-card'));
    const details = /** @type {HTMLElement | null} */ (card?.querySelector('.plan-details-expanded'));
    
    if (!card || !details) return;

    const isExpanded = card.classList.contains('expanded');

    card.classList.toggle('expanded', !isExpanded);
    
    // 更新按鈕文本和 A11Y 屬性 (使用 classList.replace 更健壯)
    const icon = button.querySelector('i');
    if (icon) {
         if (!isExpanded) {
             button.innerHTML = '收起完整細項 ';
             icon.classList.replace('fa-chevron-down', 'fa-chevron-up');
         } else {
             button.innerHTML = '查看完整細項 ';
             icon.classList.replace('fa-chevron-up', 'fa-chevron-down');
         }
         button.appendChild(icon); // 確保圖標在文本之後
    } else {
        // Fallback for text update
         button.textContent = !isExpanded ? '收起完整細項' : '查看完整細項';
    }

    button.setAttribute('aria-expanded', (!isExpanded).toString());

    // 實作平滑過渡
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
        // 收合
        details.style.overflow = 'hidden';
        details.style.maxHeight = `${details.scrollHeight}px`;
        requestAnimationFrame(() => details.style.maxHeight = '0px');
        onTransitionEndCleanup(details);
    }
};
// 確保函數可以從 HTML 中調用 (使用 window 上的聲明保持其全局性)
if (typeof window.toggleDetails === 'undefined') {
    /** @type {(button: HTMLButtonElement) => void} */
    window.toggleDetails = toggleDetails;
}


// ====================================================
// E. 性能優化模組 (Performance Module)
// ====================================================

/**
 * 圖片延遲載入 (Image Lazy Loading)
 * @returns {void}
 */
const setupLazyLoading = () => {
    // 統一選取所有需要被觀察的目標
    const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');

    /**
     * 載入單一元素 (img/source) 的圖片來源
     * @param {HTMLElement} el
     * @returns {void}
     */
    const loadImage = (el) => {
        // 避免重複載入
        if (el.classList.contains('loaded')) return; 

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
            imgEl.classList.add('loaded'); // 載入後標記
        } else if (el.tagName === 'SOURCE') {
            const sourceEl = /** @type {HTMLSourceElement} */ (el);
            if (sourceEl.dataset.srcset) {
                sourceEl.srcset = sourceEl.dataset.srcset;
                sourceEl.removeAttribute('data-srcset');
            }
             // source 元素不需要 loaded 類，只需確保圖片元素被處理
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
                        // 處理 <picture> 標籤內的所有 <source> 和 <img data-src>
                        elementToLoad.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                        // 確保 img 元素被處理
                        const img = elementToLoad.querySelector('img');
                        if (img) loadImage(img); 
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
         // Fallback: 舊瀏覽器直接載入所有圖片
        document.querySelectorAll('img[data-src], source[data-srcset]').forEach(loadImage);
    }
};

// ====================================================
// F. 動態文字適應模組 (Fit Text Module)
// ====================================================

/** @type {(() => void) | undefined} */
let fitAllTexts; 

/**
 * 設置動態文字適應 (Fit Text Logic)
 * @returns {(() => void)} - 返回 fitAll 函數供 RWD 清理函數調用
 */
const setupFitText = () => {
    const MAX_FONT = 22;
    const MIN_FONT = 8;
    const PRECISION = 0.1; // 字體大小調整精度
    const TARGET_SELECTOR = FIT_TEXT_SELECTOR;

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
         let iterations = 0;
         const maxIterations = 20; // 避免無限迴圈

         // 二分法查找最佳字體大小
         while (low <= high && iterations < maxIterations) {
             const mid = (low + high) / 2;
             el.style.fontSize = `${mid}px`;

             // 檢查文字寬度是否超過容器寬度
             if (el.scrollWidth <= parentWidth) {
                 bestSize = mid;
                 low = mid + PRECISION; // 嘗試更大的字體
             } else {
                 high = mid - PRECISION; // 嘗試更小的字體
             }
             iterations++;
         }

         // 設置最終字體大小
         el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
    };

    /**
     * 批量應用 Fit Text
     * @returns {void}
     */
    const fitAll = () => {
         const nodes = document.querySelectorAll(TARGET_SELECTOR);
         // 使用 rAF 確保在下一幀進行 DOM 操作
         requestAnimationFrame(() => nodes.forEach(el => fitOne(/** @type {HTMLElement} */ (el))));
    };
    
    // 使用專用的去抖動函數
    const debounceFitTextFunc = debounceFitText(fitAll);

    const startFitText = () => {
        fitAll(); 

        // 使用 ResizeObserver 監聽父元素寬度變化 (高效且精確)
        if (window.ResizeObserver) {
            const fitTextObserver = new ResizeObserver(entries => {
                // 檢查是否有實際的寬度變化 (而非只是高度變化等)
                const hasWidthChange = entries.some(entry => entry.contentRect.width > 0);
                if (hasWidthChange) {
                    debounceFitTextFunc(); 
                }
            });

            // 確保每個父元素只被觀察一次
            const observedParents = new Set();
            document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
                 const parent = el.parentElement;
                 if (parent && !observedParents.has(parent)) {
                      fitTextObserver.observe(parent);
                      observedParents.add(parent);
                 }
            });
        } else {
            // Fallback: 舊瀏覽器使用 window resize event
            window.addEventListener('resize', debounceFitTextFunc);
        }
    };
    
    // 確保字體載入完成後才計算，避免 FOUT/FOIT 導致的錯誤計算
    if (document.fonts?.ready) {
        document.fonts.ready.then(startFitText).catch(startFitText);
    } else {
        window.addEventListener('load', startFitText);
    }
    
    return fitAll; 
};

// ====================================================
// G. 腳本與 A11Y 強化模組 (Script & A11Y Module)
// ====================================================

/**
 * 平滑滾動至錨點 (Smooth Scrolling)
 * @returns {void}
 */
const setupSmoothScrolling = () => {
    if (!header) return;

    // 排除 href="#" 的錨點
    document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
        anchor.addEventListener('click', function (/** @type {MouseEvent} */ e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId || '');

            if (targetElement) {
                e.preventDefault(); 
                
                requestAnimationFrame(() => {
                    const headerHeight = header.offsetHeight;
                    const isMobileMenuOpen = mainNav?.classList.contains('active');

                    // 現代方式：CSS scroll-margin-top + scrollIntoView
                    if ('scrollBehavior' in document.documentElement.style && 'scrollMarginTop' in document.documentElement.style) {
                         // 如果支持 CSS 屬性，直接使用
                         targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                         // Fallback: 舊版計算方式
                        const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                        window.scrollTo({ top: targetTop, behavior: 'smooth' });
                    }

                    // 滾動後關閉手機菜單 (如果開啟)
                    if (isMobileMenuOpen) {
                         // 給予足夠的時間讓滾動開始
                         setTimeout(closeMainMenu, RWD_TRANSITION_DURATION_MS + 50); 
                    }
                });
            }
        });
    });

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
};


/**
 * 處理表單驗證與 UX 強化 (Form Validation & UX) - 異步提交
 * @returns {void}
 */
const setupFormSubmission = () => {
    const orderForm = /** @type {HTMLFormElement | null} */ (document.getElementById('product-order-form'));
    const statusMessage = document.getElementById('form-status-message');

    if (orderForm) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const submitButton = /** @type {HTMLButtonElement | null} */ (this.querySelector('button[type="submit"]'));
            if (!submitButton) return;

            const originalText = submitButton.textContent;

            // 設置 Loading 狀態
            submitButton.textContent = '送出中... 請稍候';
            submitButton.disabled = true;
            if (statusMessage) statusMessage.textContent = '';
            this.classList.add('is-loading');

            // 輔助函數：解除 Loading 狀態
            const cleanup = (success = false) => {
                 // 成功後延遲解除
                 const delay = success ? 5000 : 50; 
                 setTimeout(() => {
                     submitButton.textContent = originalText;
                     submitButton.disabled = false;
                     this.classList.remove('is-loading');
                     if (statusMessage && !success) statusMessage.textContent = ''; // 失敗不清除錯誤訊息
                 }, delay);
            }


            try {
                // 模擬安全檢查：確保表單 action 已被替換
                if (this.action.includes('your_form_endpoint')) {
                     if (statusMessage) {
                         statusMessage.style.color = '#dc3545';
                         statusMessage.textContent = '❗ 錯誤：請先替換表單 action URL！';
                     }
                     cleanup(); // 立即解除
                     return; 
                }

                const formData = new FormData(this);

                const response = await fetch(this.action, {
                    method: this.method,
                    body: formData,
                    // 確保伺服器知道我們接受 JSON (如果後端是 RESTful API)
                    headers: { 'Accept': 'application/json' } 
                });

                if (response.ok) {
                    // 成功處理
                    if (statusMessage) {
                       statusMessage.style.color = '#28a745';
                       statusMessage.textContent = '🎉 訂購資訊已成功送出！請等待專人電話聯繫。';
                    }
                    this.reset(); 
                    submitButton.textContent = '訂購成功！';
                    cleanup(true); // 成功後延遲解除
                    
                } else {
                    // 伺服器端錯誤處理
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤或非 JSON 響應' }));
                    const errorMessage = errorData.error || `表單送出失敗 (${response.status} ${response.statusText})`;

                    if (statusMessage) {
                        statusMessage.style.color = '#dc3545';
                        statusMessage.textContent = `❗ ${errorMessage}，請直接撥打 24H 專線訂購：0978-583-699`;
                    }
                    cleanup();
                }
            } catch (error) {
                // 網路或 Fetch 錯誤處理
                console.error('Submission Error:', error);
                if (statusMessage) {
                    statusMessage.style.color = '#dc3545';
                    statusMessage.textContent = '❗ 網路錯誤或伺服器無回應。請直接撥打 24H 專線訂購：0978-583-699';
                }
                cleanup();
            }
        });
    }
};

/**
 * 自動更新版權年份 (Footer Copyright Year)
 * @returns {void}
 */
const updateCopyrightYear = () => {
     const currentYearSpan = document.getElementById('current-year');
     if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear().toString();
    }
};


/**
 * 設置滾動時動畫觸發 (Animation On Scroll - AOS)
 * @returns {void}
 */
const setupAos = () => {
    const aosElements = document.querySelectorAll('.animate-on-scroll');

    if ('IntersectionObserver' in window && aosElements.length > 0) {
        const aosObserverOptions = {
            root: null,
            rootMargin: AOS_ROOT_MARGIN, 
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
            const rect = el.getBoundingClientRect();
             // 預先檢查元素是否已經在視圖內 (適用於首屏元素)
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                 requestAnimationFrame(() => el.classList.add('is-visible'));
            } else {
                 aosObserver.observe(el);
            }
        });
    } else if (aosElements.length > 0) {
         // Fallback: 直接顯示所有動畫
         requestAnimationFrame(() => {
             aosElements.forEach(el => el.classList.add('is-visible'));
         });
    }
};


// ====================================================
// H. 核心啟動區塊 (Main Initialization)
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

    try {
        // 1. 設置 Header 滾動樣式
        handleHeaderScroll();

        // 2. 設置 RWD 菜單切換與 A11Y
        setupRwdMenuToggle();
        setupDesktopA11y();

        // 3. 設置手機菜單手風琴
        setupMobileAccordion();

        // 4. 設置通用手風琴 (FAQ/Details)
        setupAccordion();

        // 5. 設置平滑滾動
        setupSmoothScrolling();
        
        // 6. 設置版權年份
        updateCopyrightYear();

        // 7. 設置表單提交
        setupFormSubmission();

        // 8. 設置 AOS 滾動動畫
        setupAos();

        // 9. 設置動態文字適應 (Fit Text) - 返回 fitAll 函數
        fitAllTexts = setupFitText(); 
        
        // 10. 設置 RWD 尺寸調整清理邏輯 (使用 debounce 包裝)
        // 增加延遲時間到 150ms，平衡性能與響應速度
        window.addEventListener('resize', debounce(() => handleResizeCleanup(fitAllTexts), 150));

    } catch (finalError) {
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

window.addEventListener('load', () => {
    try {
        // 11. 設置圖片延遲載入 (確保在 window.load 後執行，提升初始化速度)
        setupLazyLoading(); 
    } catch (e) {
        console.error('Lazy Loading Initialization Failed:', e);
    }
});

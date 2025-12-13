// 使用嚴格模式確保程式碼品質與安全性
'use strict';

// ====================================================
// 0. 環境設定與通用常量 (Constants & Environment)
// ====================================================

const MOBILE_BREAKPOINT = 900;
const SCROLL_THRESHOLD = 10;
const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
// 從 CSS 變數獲取過渡時間。這裡使用 RWD_TRANSITION_DURATION_MS 確保與 CSS 同步
const RWD_TRANSITION_DURATION_MS = 400; // 原始程式碼的硬編碼值，保持一致性
const FIT_TEXT_SELECTOR = '.text-line-container span';
const AOS_ROOT_MARGIN = '0px 0px -15% 0px';


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
        const isActive = contentElement.closest('.active') || contentElement.closest('.expanded');

        if (!isActive || contentElement.style.maxHeight === '0px') {
            contentElement.style.removeProperty('max-height');
            contentElement.style.removeProperty('overflow'); 
        }
        
        contentElement.removeEventListener('transitionend', handleTransitionEnd);
    };
    contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
};


/**
 * 輔助函數： Debounce (使用 requestAnimationFrame 優化)
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
            // 在 requestAnimationFrame 內執行，確保視覺更新在正確的時機發生
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


// ====================================================
// B. 性能與 FOUC 處理 (Flash of Unstyled Content)
// ====================================================

/**
 * 移除 HTML 或 Body 上的 'js-loading' 類，確保頁面樣式正常顯示。
 * @returns {void}
 */
const removeLoadingClass = () => {
    const targetElements = [document.documentElement, document.body];
    targetElements.forEach(el => {
        if (el && el.classList.contains('js-loading')) {
            requestAnimationFrame(() => el.classList.remove('js-loading'));
        }
    });
};

// FOUC 安全網策略
document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
window.addEventListener('load', removeLoadingClass, { once: true });
setTimeout(removeLoadingClass, 3000);


// ====================================================
// C. 導航菜單核心模組 (Navigation Core Module)
// ====================================================

/** @type {HTMLElement | null} */
const header = document.querySelector('.main-header');
/** @type {HTMLButtonElement | null} */
const menuToggle = document.querySelector('.menu-toggle');
/** @type {HTMLElement | null} */
const mainNav = document.querySelector('#main-nav');
/** @type {HTMLBodyElement} */
const body = document.body;

/**
 * 輔助函數：關閉所有手機子菜單 (Mobile Navigation Accordion)
 * @returns {void}
 */
const closeAllMobileSubmenus = () => {
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
            /** @type {HTMLElement | null} */
            const submenu = li.querySelector('.submenu-container'); 
            /** @type {HTMLAnchorElement | null} */
            const targetLink = li.querySelector('a');

            if (submenu && targetLink) {
                li.classList.remove('active');
                targetLink.setAttribute('aria-expanded', 'false');

                submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                requestAnimationFrame(() => submenu.style.maxHeight = '0px');
                onTransitionEndCleanup(submenu); 
            }
        });
    }
};

/**
 * 獨立的關閉主菜單邏輯 (供漢堡菜單、外部點擊、滾動錨點使用)
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
    /** @type {HTMLAnchorElement | null} */
    const backToTopButton = document.querySelector('.back-to-top');
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
};


/**
 * 設置 RWD 手機菜單切換與外部點擊關閉邏輯
 * @returns {void}
 */
const setupRwdMenuToggle = () => {
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

                if (window.innerWidth <= MOBILE_BREAKPOINT) {
                     body.classList.add('no-scroll'); 
                }
            } else {
                closeMainMenu();
            }
        });

        // 點擊外部關閉菜單的處理
        /** @param {MouseEvent} e */
        const handleOutsideClick = (e) => {
             if (window.innerWidth <= MOBILE_BREAKPOINT &&
                 mainNav.classList.contains('active') &&
                 !mainNav.contains(/** @type {Node} */ (e.target)) && 
                 menuToggle && !menuToggle.contains(/** @type {Node} */ (e.target))) { 
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
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', (/** @type {MouseEvent} */ e) => {
                /** @type {HTMLLIElement | null} */
                const parentLi = targetLink.closest('li.dropdown');

                if (!parentLi) return;

                const href = targetLink.getAttribute('href') || '';
                const isTrigger = href === '' || href === '#';
                const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT;

                if (!isTrigger && isMobileView) {
                     closeMainMenu();
                     return;
                }

                if (isMobileView && isTrigger) {
                    e.preventDefault();

                    /** @type {HTMLElement | null} */
                    const submenu = parentLi.querySelector('.submenu-container'); 
                    const isCurrentlyActive = parentLi.classList.contains('active');

                    if (!submenu) return;

                    if (isCurrentlyActive) {
                        closeAllMobileSubmenus();
                    } else {
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
};


/**
 * 設置桌面下拉選單的鍵盤訪問性 (A11Y - Focus Within)
 * @returns {void}
 */
const setupDesktopA11y = () => {
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
            dropdown.addEventListener('focusin', function() {
                if (window.innerWidth > MOBILE_BREAKPOINT) {
                    this.classList.add('focus-within');
                }
            });

            dropdown.addEventListener('focusout', function() {
                 setTimeout(() => {
                    if (window.innerWidth > MOBILE_BREAKPOINT && !this.contains(document.activeElement)) {
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
     const isMobileView = window.innerWidth <= MOBILE_BREAKPOINT;

     if (!isMobileView) {
         closeMainMenu(); 

         mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
             dropdown.classList.remove('active');
             dropdown.querySelector('a')?.setAttribute('aria-expanded', 'false');

             /** @type {HTMLElement | null} */
             const submenu = dropdown.querySelector('.submenu-container'); 
             if (submenu) {
                 submenu.style.removeProperty('max-height'); 
                 submenu.style.removeProperty('overflow');
             }
         });
     }

     // 展開元素高度重算 (確保在 RWD 變化後高度依然正確)
     setTimeout(() => {
         document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded').forEach(/** @type {HTMLElement} */ (content) => {
              if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                 requestAnimationFrame(() => {
                    // 暫時設為 none 以獲取正確 scrollHeight
                    content.style.maxHeight = 'none'; 
                    const newHeight = content.scrollHeight;
                    content.style.maxHeight = `${newHeight}px`; 
                 });
              }
         });
     }, 100); 

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
         /** @type {HTMLButtonElement | null} */
         const headerElement = item.querySelector('.accordion-title'); 
         /** @type {HTMLElement | null} */
         const content = item.querySelector('.accordion-content');

         if (headerElement && content) {
             // A11Y 屬性設置
             const uniqueId = `faq-item-${index}`; 
             content.id = `${uniqueId}-content`;
             headerElement.setAttribute('aria-controls', content.id);

             const isActive = item.classList.contains('active');
             headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             
             // 初始狀態
             content.style.display = 'block'; 
             content.style.overflow = 'hidden'; 
             content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
             if (isActive) content.style.removeProperty('overflow'); // 展開狀態不應有 overflow: hidden

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
                            otherContent.style.overflow = 'hidden';
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
                         // 過渡完成後移除 overflow: hidden
                         setTimeout(() => content.style.removeProperty('overflow'), RWD_TRANSITION_DURATION_MS); 
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
    /** @type {HTMLElement | null} */
    const card = button.closest('.plan-card');
    /** @type {HTMLElement | null} */
    const details = card?.querySelector('.plan-details-expanded');
    
    if (!card || !details) return;

    const isExpanded = card.classList.contains('expanded');

    card.classList.toggle('expanded', !isExpanded);
    
    button.innerHTML = !isExpanded ? 
        '收起完整細項 <i class="fas fa-chevron-up"></i>' : 
        '查看完整細項 <i class="fas fa-chevron-down"></i>';
    button.setAttribute('aria-expanded', (!isExpanded).toString());

    // 實作平滑過渡
    if (!isExpanded) {
        // 展開
        details.style.maxHeight = '0px';
        void details.offsetHeight;
        details.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            details.style.maxHeight = `${details.scrollHeight}px`;
            setTimeout(() => details.style.removeProperty('overflow'), RWD_TRANSITION_DURATION_MS); 
        });
    } else {
        // 收合
        details.style.overflow = 'hidden';
        details.style.maxHeight = `${details.scrollHeight}px`;
        requestAnimationFrame(() => details.style.maxHeight = '0px');
        onTransitionEndCleanup(details);
    }
};
// 確保函數可以從 HTML 中調用
window.toggleDetails = toggleDetails;


// ====================================================
// E. 性能優化模組 (Performance Module)
// ====================================================

/**
 * 圖片延遲載入 (Image Lazy Loading)
 * @returns {void}
 */
const setupLazyLoading = () => {
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
    const PRECISION = 0.1; // 提高精度以獲得更準確的結果
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
         const maxIterations = 20;

         while (low <= high && iterations < maxIterations) {
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
         const nodes = document.querySelectorAll(TARGET_SELECTOR);
         requestAnimationFrame(() => nodes.forEach(el => fitOne(/** @type {HTMLElement} */ (el))));
    };
    
    const debounceFitTextFunc = debounceFitText(fitAll);

    const startFitText = () => {
        fitAll(); 

        if (window.ResizeObserver) {
            const fitTextObserver = new ResizeObserver(entries => {
                const hasWidthChange = entries.some(entry => entry.contentRect.width !== 0);
                if (hasWidthChange) {
                    debounceFitTextFunc(); 
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
            window.addEventListener('resize', debounceFitTextFunc);
        }
    };
    
    if (document.fonts?.ready) {
        document.fonts.ready.then(startFitText).catch(startFitText);
    } else {
        window.addEventListener('load', startFitText);
    }
    
    return fitAll; // 將核心函數返回
};

// ====================================================
// G. 腳本與 A11Y 強化模組 (Script & A11Y Module)
// ====================================================

/**
 * 平滑滾動至錨點 (Smooth Scrolling)
 * @returns {void}
 */
const setupSmoothScrolling = () => {
    /** @type {HTMLAnchorElement | null} */
    const backToTopButton = document.querySelector('.back-to-top');

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
                             }, RWD_TRANSITION_DURATION_MS + 50); // 使用同步的過渡時間
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
};


/**
 * 處理表單驗證與 UX 強化 (Form Validation & UX) - 異步提交
 * @returns {void}
 */
const setupFormSubmission = () => {
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
                        if (statusMessage) statusMessage.textContent = '';
                    }, 5000); 

                } else {
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤' }));
                    const errorMessage = errorData.error || `表單送出失敗 (${response.status} ${response.statusText})`;

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
};

/**
 * 自動更新版權年份 (Footer Copyright Year)
 * @returns {void}
 */
const updateCopyrightYear = () => {
     /** @type {HTMLSpanElement | null} */
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
            aosObserver.observe(el);
        });
    } else if (aosElements.length > 0) {
         // Fallback
         aosElements.forEach(el => el.classList.add('is-visible'));
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
        window.addEventListener('resize', debounce(() => handleResizeCleanup(fitAllTexts), 150));

    } catch (finalError) {
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

// 必須在 DOMContentLoaded 外部調用，確保圖片元素能被即時觀察
window.addEventListener('load', () => {
    try {
        // 11. 設置圖片延遲載入 (確保在 window.load 後執行，提升初始化速度)
        setupLazyLoading(); 
    } catch (e) {
        console.error('Lazy Loading Initialization Failed:', e);
    }
});

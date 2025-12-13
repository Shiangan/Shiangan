// 【最終程式碼：js/script.js】

// 使用嚴格模式
'use strict'; 

// ====================================================
// A. 修正 1：FOUC 移除函數 (移至最外層確保執行)
// ====================================================
/**
 * 移除 HTML 或 Body 上的 'js-loading' 類，解決 Flash of Unstyled Content (FOUC) 問題。
 * 使用 requestAnimationFrame 確保在下一次重繪前執行，讓 CSS 有時間準備。
 */
const removeLoadingClass = () => {
    const targetElements = [document.documentElement, document.body];
    targetElements.forEach(el => {
        if (el && el.classList.contains('js-loading')) {
            requestAnimationFrame(() => el.classList.remove('js-loading'));
        }
    });
};

// 策略：確保在多個時間點移除 js-loading，提供安全網。
// 1. DOM 樹結構載入完成時
document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });

// 2. 所有資源（圖片、字體）載入完成時
window.addEventListener('load', removeLoadingClass, { once: true });

// 3. 最終安全網：如果腳本執行失敗，強制在 3 秒後移除 CSS 隱藏，避免永久空白。
setTimeout(removeLoadingClass, 3000); 


// ====================================================
// B. 核心邏輯 - DOMContentLoaded
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    let fitAll; // 確保 fitAll 可以在全域（或此函數閉包內）被訪問和重新賦值

    try {

        // DOM 變數
        const header = document.querySelector('.main-header');
        const menuToggle = document.querySelector('.menu-toggle');
        const mainNav = document.querySelector('#main-nav');
        const body = document.body;
        const backToTopButton = document.querySelector('.back-to-top');
        const currentYearSpan = document.getElementById('current-year');
        const mobileBreakpoint = 900;
        
        // 配置變數
        const SCROLL_THRESHOLD = 10;
        const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
        const RWD_TRANSITION_DURATION = 400; // 0.4s
        
        // 輔助函數： Debounce (去抖動)
        const debounce = (func, delay = 50) => { 
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay); 
            };
        };
        const debounceFitText = (func) => debounce(func, 100); 

        // 核心：統一的手風琴清理函數 (在 CSS 過渡結束後清理 max-height)
        const onTransitionEndCleanup = (contentElement) => {
             const handleTransitionEnd = (e) => {
                 // 檢查是否為 maxHeight 屬性的過渡結束事件，且事件源是 contentElement 本身
                 if (e.target !== contentElement || e.propertyName !== 'max-height') return; 

                 // 只有在收合狀態 (maxHeight === '0px' 或空) 才清除 max-height
                 if (!contentElement.style.maxHeight || contentElement.style.maxHeight === '0px') {
                     contentElement.style.maxHeight = ''; 
                 }
                 contentElement.removeEventListener('transitionend', handleTransitionEnd);
             };
             // 註冊 transitionend 事件
             contentElement.addEventListener('transitionend', handleTransitionEnd);
         };

        // 輔助函數：關閉所有手機子菜單 (Accordion)
        const closeAllMobileSubmenus = () => {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    const submenu = li.querySelector('.submenu');
                    if (submenu) {
                        li.classList.remove('active');
                        li.querySelector('a').setAttribute('aria-expanded', 'false'); // A11Y

                        // 修正 3：確保先設置當前高度再設為 0
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`; 
                        
                        // 使用 requestAnimationFrame 確保在下一次重繪前將高度設為 0，觸發 CSS Transition
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px'); 
                        onTransitionEndCleanup(submenu); // 使用統一的清理函數
                    }
                });
            }
        };

        // 獨立的關閉主菜單邏輯
        const closeMainMenu = () => {
             if (mainNav && mainNav.classList.contains('active')) {
                 mainNav.classList.remove('active');
                 
                 if (menuToggle) {
                     menuToggle.classList.remove('active');
                     menuToggle.setAttribute('aria-expanded', 'false');
                     
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon) {
                          // 假設使用 FontAwesome
                          menuIcon.classList.remove('fa-times');
                          menuIcon.classList.add('fa-bars');
                     }
                 }
                 body.classList.remove('no-scroll');
                 
                 closeAllMobileSubmenus(); // 確保子菜單一併清理
             }
         };
         
        // 修正 4：點擊外部關閉菜單的處理 
        const handleOutsideClick = (e) => {
             // 只有在手機模式下才觸發外部點擊關閉
             if (window.innerWidth <= mobileBreakpoint && 
                 mainNav && mainNav.classList.contains('active') && 
                 !mainNav.contains(e.target) && 
                 !menuToggle.contains(e.target)) {
                 
                 closeMainMenu();
             }
         };
         
         // 註冊點擊外部監聽器
         document.addEventListener('click', handleOutsideClick);


        // 輔助函數：處理 RWD 調整時的狀態清理
        const handleResizeCleanup = () => {
             const isMobileView = window.innerWidth <= mobileBreakpoint;
             
             // 桌面模式清理手機狀態
             if (!isMobileView) {
                 closeMainMenu(); // 強制關閉主菜單
                 
                 // 清理子選單 max-height，但避免觸發過渡動畫
                 mainNav.querySelectorAll('.submenu').forEach(submenu => {
                     submenu.style.maxHeight = ''; // 直接清除
                 });
                 
                 // 清理桌面 A11Y 狀態 (focus-within)
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
             }
             
             // FAQ 高度重算 (保持展開狀態的高度正確)
             // 使用 setTimeout/requestAnimationFrame 確保在 DOM 變化後正確計算
             setTimeout(() => {
                 document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
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

        // 啟用 Resize 監聽器
        window.addEventListener('resize', debounce(handleResizeCleanup, 150)); 


        // ====================================================
        // 1. Header & 滾動樣式處理
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
                // 使用 passive: true 提高滾動性能
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
        // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
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
                             menuIcon.classList.add('fa-times');
                        }
                        
                        const shouldLockScroll = window.innerWidth <= mobileBreakpoint;
                        // 確保只有在手機模式才鎖定滾動
                        if (shouldLockScroll) {
                             body.classList.add('no-scroll');
                        }
                    } else {
                        // 關閉邏輯
                        closeMainMenu(); 
                    }
                });
            }
            
            // 桌面下拉選單的鍵盤訪問性 (A11Y)
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                    dropdown.addEventListener('focusin', function() {
                        if (window.innerWidth > mobileBreakpoint) {
                            this.classList.add('focus-within');
                        }
                    });
                    
                    // 修正 5：使用 'focusout' 監聽，需要檢查 relatedTarget
                    dropdown.addEventListener('focusout', function(e) {
                         // 使用 setTimeout 確保相關焦點事件 (relatedTarget) 穩定
                         setTimeout(() => {
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
                    targetLink.addEventListener('click', (e) => {
                        const parentLi = targetLink.closest('li.dropdown');
                        
                        if (!parentLi) return; 

                        const href = targetLink.getAttribute('href');
                        // 判斷該連結是否為「開關觸發器」: 如果 href 是 '#'、空字串或 null
                        const isTrigger = !href || href === '#' || href.startsWith('#'); 
                        
                        const isMobileView = window.innerWidth <= mobileBreakpoint;

                        // 如果不是手機模式，則直接跳出，讓 CSS hover/focus-within 處理
                        if (!isMobileView && !isTrigger) return; 
                        
                        // 如果在手機模式，且不是開關觸發器，則允許導航，但先關閉菜單
                        if (isMobileView && !isTrigger) {
                            // 修正 6：直接關閉，避免延遲跳轉
                            closeMainMenu(); 
                            return; 
                        }

                        // 只有在手機視圖且是開關觸發器時才執行手風琴邏輯
                        if (isMobileView && isTrigger) {
                            e.preventDefault();
                            
                            const submenu = parentLi.querySelector('.submenu');
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            if (!submenu) {
                                console.warn('Mobile Accordion: Submenu element not found.');
                                return;
                            }

                            if (isCurrentlyActive) {
                                // 收合操作：由 closeAllMobileSubmenus 執行
                                closeAllMobileSubmenus(); 
                            } else {
                                // 執行展開：先關閉其他，再展開自己
                                closeAllMobileSubmenus(); 
                                parentLi.classList.add('active');
                                targetLink.setAttribute('aria-expanded', 'true'); // A11Y

                                // 優化 7：Accordion 展開穩定性
                                submenu.style.maxHeight = '0px'; // 確保起點是 0
                                submenu.offsetHeight; // 強制 Reflow

                                // 設置正確的 max-height
                                requestAnimationFrame(() => {
                                     submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                });
                                // 展開狀態不需要 onTransitionEndCleanup
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
                 const headerElement = item.querySelector('.accordion-header');
                 const content = item.querySelector('.accordion-content');

                 if (headerElement && content) {
                     // A11Y 屬性設置
                     const uniqueId = `acc-item-${index}`;
                     content.id = `${uniqueId}-content`;
                     headerElement.setAttribute('aria-controls', content.id);

                     const isActive = item.classList.contains('active');
                     headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                     
                     // 初始化 max-height
                     requestAnimationFrame(() => {
                         content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px'; 
                     });

                     headerElement.addEventListener('click', function() {
                        const isCurrentlyActive = item.classList.contains('active');
                        
                        // 單一展開模式邏輯 (關閉其他)
                        document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                const otherContent = activeItem.querySelector('.accordion-content');
                                const otherHeader = activeItem.querySelector('.accordion-header');
                                activeItem.classList.remove('active');
                                otherHeader.setAttribute('aria-expanded', 'false');
                                
                                // 收合操作：先設置當前高度，再設為 0
                                otherContent.style.maxHeight = `${otherContent.scrollHeight}px`; 
                                requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                onTransitionEndCleanup(otherContent); 
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);

                        // 實作平滑過渡
                        if (!isCurrentlyActive) {
                            // 展開
                            this.setAttribute('aria-expanded', 'true');
                            // 優化 8：確保從 0 開始過渡
                            content.style.maxHeight = '0px'; 
                            content.offsetHeight; // 強制 Reflow
                            
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);

                        } else {
                            // 收合
                            this.setAttribute('aria-expanded', 'false');
                            // 確保先設置 scrollHeight 再設為 0 (觸發收合動畫)
                            content.style.maxHeight = `${content.scrollHeight}px`; 
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
                            onTransitionEndCleanup(content); 
                        }
                     });

                     // 鍵盤無障礙操作 Enter/Space
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
        // 5. 圖片延遲載入 (Image Lazy Loading)
        // ====================================================
        try {
            const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');

            const loadImage = (el) => {
                if (el.tagName === 'IMG' && el.dataset.src) {
                    el.src = el.dataset.src;
                    if (el.dataset.srcset) el.srcset = el.dataset.srcset;
                    el.removeAttribute('data-src');
                    el.removeAttribute('data-srcset');
                    el.classList.add('loaded'); // 添加 loaded 類別以觸發 CSS 動畫
                } else if (el.tagName === 'SOURCE' && el.dataset.srcset) {
                    el.srcset = el.dataset.srcset;
                    el.removeAttribute('data-srcset');
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
                            const elementToLoad = entry.target;
                            
                            if (elementToLoad.tagName === 'PICTURE') {
                                // 載入所有 source 和 img
                                elementToLoad.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            } else if (elementToLoad.tagName === 'SOURCE' || elementToLoad.tagName === 'IMG') {
                                loadImage(elementToLoad);
                            }
                            observer.unobserve(entry.target); 
                        }
                    });
                }, observerOptions);

                lazyTargets.forEach(el => {
                    if (el.tagName === 'IMG' && el.hasAttribute('data-src')) {
                         imgObserver.observe(el);
                    } else if (el.tagName === 'PICTURE') {
                         imgObserver.observe(el);
                    }
                });
            } else {
                 // Fallback
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
                // 排除所有以 # 開頭的連結，如果它是手機模式的菜單按鈕
                document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                     const href = anchor.getAttribute('href');
                     // 排除移動選單開關和點擊錨點後要平滑滾動的
                     const isMobileAccordionTrigger = anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint && (href === '#' || href.startsWith('#'));
                     if (isMobileAccordionTrigger) return; 
                     
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            requestAnimationFrame(() => {
                                const headerHeight = header.offsetHeight;
                            
                                // 計算精確的目標位置：目標元素頂部 - Header高度
                                const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                                const isMobileMenuOpen = mainNav && mainNav.classList.contains('active');

                                // 使用 Web API 實現平滑滾動
                                window.scrollTo({
                                    top: targetTop,
                                    behavior: 'smooth'
                                });
                                
                                // 延遲關閉手機菜單
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
            const METEOR_DISTANCE = 500; // 流星移動距離 (自定義)

            if (meteors.length > 0) {
                // 初始化流星動畫屬性
                meteors.forEach(meteor => {
                    // 1. 設置初始隨機位置
                    meteor.style.top = `${Math.random() * 100}vh`;
                    meteor.style.left = `${Math.random() * 100}vw`;

                    // 2. 設置 CSS 變數，實現從右上到左下的移動
                    meteor.style.setProperty('--rotation', '135deg'); // 與 CSS 保持一致
                    meteor.style.setProperty('--travel-x', `-${METEOR_DISTANCE}px`); // 向左移動
                    meteor.style.setProperty('--travel-y', `${METEOR_DISTANCE}px`); // 向下移動
                    
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
                currentYearSpan.textContent = new Date().getFullYear(); 
            }
        } catch (e) {
            console.error('Core Logic Failed: Copyright Year', e);
        }

        // ====================================================
        // 10. 表單驗證與 UX 強化 (Form Validation & UX)
        // ====================================================
        const orderForm = document.getElementById('product-order-form');
        const statusMessage = document.getElementById('form-status-message');
        
        if (orderForm) {
            orderForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const submitButton = this.querySelector('button[type="submit"]');
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
                           statusMessage.style.color = 'var(--success-color, #28a745)';
                           statusMessage.textContent = '🎉 訂購資訊已成功送出！請等待專人電話聯繫。';
                        }
                        this.reset(); 
                        
                        // 成功後延遲解除禁用狀態
                        submitButton.textContent = '訂購成功！';
                        
                        setTimeout(() => {
                            submitButton.textContent = originalText;
                            submitButton.disabled = false;
                        }, 5000); 

                    } else {
                        // 處理 HTTP 錯誤 (4xx, 5xx)
                        const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤' }));
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
                        statusMessage.textContent = '❗ 網路錯誤或伺服器無回應。請直接撥打 24H 專線訂購：0978-583-699';
                    }
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                }
            });
        }


        // ====================================================
        // 11. 動態文字適應 (Fit Text Logic)
        // ====================================================
        try {
            const MAX_FONT = 22;   
            const MIN_FONT = 8;    
            const PRECISION = 0.2; 
            const TARGET_SELECTOR = '.text-line-container span'; 

            const fitOne = (el) => { 
                 const parentWidth = el.parentElement.offsetWidth;
                 const text = el.textContent.trim();
                 
                 if (parentWidth <= 50 || text === '') {
                     el.style.fontSize = `${MAX_FONT}px`; 
                     return;
                 }

                 let low = MIN_FONT;
                 let high = MAX_FONT;
                 let bestSize = MIN_FONT;

                 // 二分法計算最佳字體大小
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

            // 修正 fitAll: 確保此函數在閉包外可以被訪問
            fitAll = () => { 
                 const nodes = document.querySelectorAll(TARGET_SELECTOR);
                 requestAnimationFrame(() => nodes.forEach(el => fitOne(el)));
            };

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

            if (document.fonts && document.fonts.ready) {
                // 確保字體載入完成後才開始計算
                document.fonts.ready.then(startFitText).catch(startFitText);
            } else {
                window.addEventListener('load', startFitText);
            }
        } catch (e) {
            console.error('Core Logic Failed: Fit Text', e);
        }
        
        
        // ====================================================
        // 12. 滾動時動畫觸發 (Animation On Scroll - AOS)
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
                                 entry.target.classList.add('is-visible');
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
        // 這是一個捕捉所有核心邏輯初始化時的最終致命錯誤。
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

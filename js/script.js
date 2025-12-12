/**
 * ====================================================
 * 網站核心 JavaScript (V22.3 - 最終質感優化版 - 強化 Accordion & 性能)
 * - 核心修復：徹底解決 RWD Menu 點擊失效問題。
 * - 核心修復：強化 RWD Accordion 展開邏輯和防禦性檢查。
 * - 優化增強：結構簡化、平滑滾動穩定性提升。
 * ====================================================
 */

document.addEventListener('DOMContentLoaded', () => {

    // 【🔥 最終防線：所有核心邏輯將在模組化的 Try-Catch 中執行】
    try {

        // ====================================================
        // 0. 初始設定與變數 (Initial Setup & Variables)
        // ====================================================

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
        
        // 宣告 fitAll (供 RWD 清理函數使用)
        let fitAll; 

        // 輔助函數： Debounce (去抖動)
        const debounce = (func, delay = 50) => { 
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                // 使用 requestAnimationFrame 確保在下一次重繪前執行，提升視覺流暢度
                timeoutId = setTimeout(() => requestAnimationFrame(() => func.apply(this, args)), delay); 
            };
        };
        const debounceFitText = (func) => debounce(func, 100); 

        // 輔助函數：清理手機子菜單 (Accordion) 的核心邏輯
        const cleanupSubmenuMaxHeight = (submenu) => {
            const handleTransitionEnd = (e) => {
                // 檢查是否為 maxHeight 屬性的過渡結束事件
                if (e.target !== submenu || e.propertyName !== 'max-height') return; 

                // 只有在子選單完全收起後，且在非手機或主選單關閉時才清除 max-height
                if (window.innerWidth > mobileBreakpoint || !mainNav.classList.contains('active')) {
                    submenu.style.maxHeight = ''; 
                }
                submenu.removeEventListener('transitionend', handleTransitionEnd);
            };
            submenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
        };

        // 輔助函數：關閉所有手機子菜單 (Accordion)
        const closeAllMobileSubmenus = () => {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    const submenu = li.querySelector('.submenu');
                    if (submenu) {
                        li.classList.remove('active');
                        // 確保先給一個 scrollHeight，再立即設為 0，以觸發 CSS Transition
                        // 這是確保平滑收合的關鍵技巧
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`; 
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px'); 
                        cleanupSubmenuMaxHeight(submenu);
                    }
                });
            }
        };

        // 輔助函數：處理 RWD 調整時的狀態清理
        const handleResizeCleanup = () => {
             const isMobileView = window.innerWidth <= mobileBreakpoint;
             
             // 桌面模式清理手機狀態
             if (!isMobileView) {
                 // 強制關閉主菜單
                 if (mainNav && mainNav.classList.contains('active')) {
                     menuToggle?.click(); // 模擬點擊關閉菜單
                 }
                 
                 closeAllMobileSubmenus(); // 清理所有手機子菜單狀態
                 
                 // 清理桌面 A11Y 狀態 (focus-within)
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
                 
                 // FAQ 高度重算 (保持展開狀態的高度正確，避免 resize 造成高度錯誤)
                 document.querySelectorAll('.accordion-item.active .accordion-content').forEach(content => {
                     // 延遲更新以確保 DOM 穩定
                     requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                 });
             } else {
                 // 手機模式下，確保桌面 A11Y 狀態被清除
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
             }
             
             // 觸發 Fit Text 重新計算 (如果有載入 Fit Text 模組)
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
                    // 只在需要改變時才操作 DOM
                    if (header.classList.contains('scrolled') !== isScrolled) {
                        header.classList.toggle('scrolled', isScrolled);
                    }
                }
                
                if (backToTopButton) {
                    if (backToTopButton.classList.contains('show') !== isShowBackToTop) {
                        backToTopButton.classList.toggle('show', isShowBackToTop);
                    }
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
                    
                    mainNav.classList.toggle('active', isExpanded);
                    this.classList.toggle('active', isExpanded); 
                    
                    this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

                    if (menuIcon) {
                        // 確保 Font Awesome 圖標切換的魯棒性
                        if (isExpanded) {
                             menuIcon.classList.remove('fa-bars');
                             menuIcon.classList.add('fa-times');
                        } else {
                             menuIcon.classList.remove('fa-times');
                             menuIcon.classList.add('fa-bars');
                        }
                    }
                    
                    const shouldLockScroll = isExpanded && window.innerWidth <= mobileBreakpoint;
                    body.classList.toggle('no-scroll', shouldLockScroll);

                    // 如果是執行「關閉」操作，則清理子選單
                    if (!isExpanded) {
                        closeAllMobileSubmenus(); 
                    }
                    
                    // GA4 追蹤點 (略)
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
                    dropdown.addEventListener('focusout', function(e) {
                         // 僅在焦點真正離開此 dropdown 及其子元素時才移除 focus-within
                         if (window.innerWidth > mobileBreakpoint && !this.contains(e.relatedTarget)) {
                            this.classList.remove('focus-within');
                        }
                    });
                });
            }
        } catch (e) {
            console.error('Core Logic Failed: RWD Menu', e);
        }

        // ====================================================
        // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion) - 【最終魯棒性修復版】
        // ====================================================
        try {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                    targetLink.addEventListener('click', (e) => {
                        const parentLi = targetLink.closest('li.dropdown');
                        
                        if (!parentLi) return; 

                        // 判斷該連結是否為「開關觸發器」: 如果 href 是 '#'、空字串或 null
                        const isTrigger = !targetLink.getAttribute('href') || targetLink.getAttribute('href') === '#';

                        // 只有在手機視圖且是開關觸發器時才執行手風琴邏輯
                        if (window.innerWidth <= mobileBreakpoint && isTrigger) {
                            e.preventDefault();
                            
                            const submenu = parentLi.querySelector('.submenu');
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            if (!submenu) {
                                console.warn('Mobile Accordion: Submenu element not found.');
                                return;
                            }

                            // 如果是收合操作，則直接呼叫 closeAllMobileSubmenus 進行收合並清理
                            if (isCurrentlyActive) {
                                closeAllMobileSubmenus();
                            } else {
                                // 執行展開：先關閉其他，再展開自己
                                closeAllMobileSubmenus(); 
                                parentLi.classList.add('active');
                                requestAnimationFrame(() => {
                                    // 核心：設置正確的 max-height
                                    submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                });
                            }
                        }
                    });
                });

                // 點擊菜單中的非手風琴連結後，自動關閉主菜單
                mainNav.querySelectorAll('a[href]').forEach(link => { 
                     // 排除作為手風琴開關的父連結
                     const isAccordionLink = link.closest('.dropdown > a') && (!link.getAttribute('href') || link.getAttribute('href') === '#');
                     if (isAccordionLink) return;
                     
                     link.addEventListener('click', () => {
                         if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                             // 使用 setTimeout 確保在導航發生後再執行關閉，避免中斷導航
                             setTimeout(() => {
                                 if (menuToggle) menuToggle.click(); 
                             }, RWD_TRANSITION_DURATION + 100); 
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
                     // 初始化 max-height，讓 CSS 決定是否為 0
                     content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px'; 
                     
                     // 監聽 transitionend，以便在收合完成後清除 max-height，避免響應式問題
                     const handleFaqTransitionEnd = (e) => {
                         if (e.target !== content || e.propertyName !== 'max-height') return; 

                         // 只有在收合時 (maxHeight === '0px') 才清除屬性
                         if (content.style.maxHeight === '0px') {
                             content.style.maxHeight = ''; 
                         }
                         content.removeEventListener('transitionend', handleFaqTransitionEnd);
                     };

                     headerElement.addEventListener('click', function() {
                        const isCurrentlyActive = item.classList.contains('active');
                        
                        // 單一展開模式邏輯 (關閉其他)
                        document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                const otherContent = activeItem.querySelector('.accordion-content');
                                const otherHeader = activeItem.querySelector('.accordion-header');
                                activeItem.classList.remove('active');
                                requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                otherHeader.setAttribute('aria-expanded', 'false');
                                otherContent.addEventListener('transitionend', handleFaqTransitionEnd, { once: true }); // 添加清理
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);

                        // 實作平滑過渡
                        if (!isCurrentlyActive) {
                            // 展開
                            this.setAttribute('aria-expanded', 'true');
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                        } else {
                            // 收合
                            this.setAttribute('aria-expanded', 'false');
                            // 確保先設置 scrollHeight 再設為 0
                            content.style.maxHeight = `${content.scrollHeight}px`; 
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
                            content.addEventListener('transitionend', handleFaqTransitionEnd, { once: true }); // 添加清理
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
                            
                            // 處理 <picture> 標籤，需載入所有 <source> 和 <img>
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
                 // Fallback: 如果不支持 IntersectionObserver，則立即載入
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
                // 排除移動選單開關
                document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                     // 再次強化檢查，排除作為手風琴開關的連結
                     const isMobileAccordionTrigger = anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint && (!anchor.getAttribute('href') || anchor.getAttribute('href') === '#');
                     if (isMobileAccordionTrigger) return; 
                     
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            const headerHeight = header.offsetHeight;
                            
                            // 計算精確的目標位置：目標元素頂部 - Header高度
                            const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                            const isMobileMenuOpen = mainNav && mainNav.classList.contains('active');

                            // 使用 Web API 實現平滑滾動
                            window.scrollTo({
                                top: targetTop,
                                behavior: 'smooth'
                            });
                            
                            // GA4 追蹤點 (略)
                            
                            // 延遲關閉手機菜單，確保使用者看到滾動動畫
                            if (isMobileMenuOpen) {
                                 setTimeout(() => {
                                     if (menuToggle) menuToggle.click();
                                 }, RWD_TRANSITION_DURATION + 100); 
                            }
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
        // (保持原樣，如果需要啟動，請加入流星生成邏輯)
        try {
            const heroSection = document.querySelector('.hero-section.has-meteor'); 
            if (heroSection) {
                 // 這裡可以插入流星生成函數 (generateMeteors())
            }
        } catch (e) {
            console.error('Core Logic Failed: Meteor Effect', e);
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
        // 9. 移除初始載入類別 (FOUC 修正)
        // ====================================================
        try {
            const removeLoadingClass = () => {
                const targetElements = [document.documentElement, document.body];
                targetElements.forEach(el => {
                    if (el && el.classList.contains('js-loading')) {
                        requestAnimationFrame(() => el.classList.remove('js-loading'));
                    }
                });
            };
            
            // 使用 'load' 確保所有資源載入後才移除
            window.addEventListener('load', removeLoadingClass, { once: true });
            // 如果在 load 事件觸發前 DOMContentLoaded 執行，先嘗試移除，防止長時間空白
            removeLoadingClass(); 
        } catch (e) {
            console.error('Core Logic Failed: Loading Class', e);
        }


        // ====================================================
        // 10. 表單驗證與 UX 強化 (Form Validation & UX)
        // ====================================================
        // (此處將原本的表單邏輯移至 try-catch 內，以便統一錯誤處理)
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
                statusMessage.textContent = '';
                
                try {
                    // 確保 action 屬性已替換
                    if (this.action.includes('your_form_endpoint')) {
                         statusMessage.style.color = 'var(--error-color)';
                         statusMessage.textContent = '❗ 錯誤：請先替換表單 action URL！';
                         submitButton.textContent = originalText;
                         submitButton.disabled = false;
                         return;
                    }

                    const formData = new FormData(this);
                    
                    const response = await fetch(this.action, {
                        method: this.method,
                        body: formData,
                        headers: {
                            // 確保 Formspree 或類似服務返回 JSON 響應
                            'Accept': 'application/json' 
                        }
                    });

                    if (response.ok) {
                        statusMessage.style.color = 'var(--success-color)';
                        statusMessage.textContent = '🎉 訂購資訊已成功送出！請等待專人電話聯繫。';
                        this.reset(); 
                        submitButton.textContent = '訂購資訊已送出 (請等電話)';
                        // 成功後保持禁用，避免重複提交
                    } else {
                        // 處理 HTTP 錯誤 (4xx, 5xx)
                        const errorData = await response.json();
                        const errorMessage = errorData.error || '表單送出失敗';
                        
                        statusMessage.style.color = 'var(--error-color)';
                        statusMessage.textContent = `❗ ${errorMessage}，請直接撥打 24H 專線訂購：0978-583-699`;
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                    }
                } catch (error) {
                    console.error('Submission Error:', error);
                    statusMessage.style.color = 'var(--error-color)';
                    statusMessage.textContent = '❗ 網路錯誤或伺服器無回應。請直接撥打 24H 專線訂購：0978-583-699';
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
            const TARGET_SELECTOR = '.fit-text-line'; 

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

                 // 二分搜尋法優化字體計算
                 while (low <= high) {
                     const mid = (low + high) / 2;
                     el.style.fontSize = `${mid}px`;
                     
                     // 檢查文字寬度是否超出父元素
                     if (el.scrollWidth <= parentWidth) {
                         bestSize = mid;
                         low = mid + PRECISION;
                     } else {
                         high = mid - PRECISION;
                     }
                 }
                 
                 el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
            };

            fitAll = () => { 
                 const nodes = document.querySelectorAll(TARGET_SELECTOR);
                 requestAnimationFrame(() => nodes.forEach(el => fitOne(el)));
            };

            const startFitText = () => {
                fitAll();
                
                if (window.ResizeObserver) {
                    // 使用 ResizeObserver 監聽父元素寬度變化，比 window.resize 更精確高效
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
                    // Fallback 使用 window resize
                    window.addEventListener('resize', debounceFitText(fitAll)); 
                }
            };

            // 確保字體載入完成後才開始計算，防止 FOUT/FOIT 導致的計算錯誤
            if (document.fonts && document.fonts.ready) {
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
                    // 提前 15% 觸發，讓動畫看起來更即時
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
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

/**
 * ====================================================
 * 網站核心 JavaScript (V22.1 最終穩定版)
 * - 核心修復：徹底解決 RWD Menu 點擊失效問題。
 * - 性能優化：全數保留 Debounce, rAF, IntersectionObserver 邏輯。
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
        const contactForm = document.querySelector('.contact-form');
        
        // 配置變數
        const mobileBreakpoint = 900;
        const SCROLL_THRESHOLD = 10;
        const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px'; // 提前 200px 載入
        const RWD_TRANSITION_DURATION = 400; // 確保與 CSS 中 var(--rwd-transition-duration) = 0.4s 一致
        
        // 宣告 fitAll (供 RWD 清理函數使用)
        let fitAll; 

        // 輔助函數： Debounce (去抖動)
        const debounce = (func, delay = 50) => { 
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => requestAnimationFrame(() => func.apply(this, args)), delay); 
            };
        };
        
        const debounceFitText = (func) => debounce(func, 100); 

        // 輔助函數：關閉所有手機子菜單 (Accordion)
        const closeAllMobileSubmenus = () => {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    const submenu = li.querySelector('.submenu');
                    if (submenu) {
                        li.classList.remove('active');
                        submenu.style.maxHeight = '0px';
                        
                        const handleTransitionEnd = (e) => {
                            if (e.target !== submenu || e.propertyName !== 'max-height') return; 

                            // 只有在非手機或主菜單關閉時才清除 max-height
                            if (window.innerWidth > mobileBreakpoint || !mainNav.classList.contains('active')) {
                                submenu.style.maxHeight = ''; 
                            }
                            submenu.removeEventListener('transitionend', handleTransitionEnd);
                        };
                        
                        submenu.addEventListener('transitionend', handleTransitionEnd, { once: true });
                    }
                });
            }
        };

        // 輔助函數：處理 RWD 調整時的狀態清理
        const handleResizeCleanup = () => {
             const isMobileView = window.innerWidth <= mobileBreakpoint;
             
             // 桌面模式清理手機狀態
             if (!isMobileView) {
                 if (mainNav && mainNav.classList.contains('active')) {
                     // 使用可選鏈式調用，安全地模擬點擊關閉菜單
                     menuToggle?.click(); 
                 }
                 
                 closeAllMobileSubmenus(); 
                 
                 // 清理桌面 A11Y 狀態 (focus-within)
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
                 
                 // FAQ 高度重算
                 document.querySelectorAll('.accordion-item.active').forEach(item => {
                     const content = item.querySelector('.accordion-content');
                     if (content) {
                         requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                     }
                 });
             } else {
                 // 手機模式下，確保桌面 A11Y 狀態被清除
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
             }
             
             // 觸發 Fit Text 重新計算 (確保函式存在)
             if (typeof fitAll === 'function') fitAll(); 
        };

        window.addEventListener('resize', debounce(handleResizeCleanup, 150)); 


        // ====================================================
        // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
        // ====================================================
        try {
            let ticking = false;
            const updateHeaderScrollClass = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const isScrolled = window.scrollY > SCROLL_THRESHOLD;
                        
                        if (header) {
                            header.classList.toggle('scrolled', isScrolled);
                        }
                        
                        if (backToTopButton) {
                            backToTopButton.classList.toggle('show', window.scrollY > 300);
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            if (header || backToTopButton) { 
                updateHeaderScrollClass(); 
                window.addEventListener('scroll', updateHeaderScrollClass, { passive: true });
            }
        } catch (e) {
            console.error('Core Logic Failed: Header Scroll', e);
        }


        // ====================================================
        // 2. RWD 手機菜單切換 (Hamburger Menu Toggle) - 【核心修復區】
        // ====================================================
        try {
            if (menuToggle && mainNav) {
                const menuIcon = menuToggle.querySelector('i');

                menuToggle.addEventListener('click', function() {
                    // 1. 判斷並切換核心狀態
                    const isExpanded = !mainNav.classList.contains('active'); 
                    
                    mainNav.classList.toggle('active', isExpanded);
                    this.classList.toggle('active', isExpanded); 
                    
                    // 2. A11Y 與 Icon 處理
                    this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

                    if (menuIcon) {
                        // 使用 replace 確保單次操作，且邏輯正確
                        menuIcon.classList.replace(isExpanded ? 'fa-bars' : 'fa-times', isExpanded ? 'fa-times' : 'fa-bars');
                    }
                    
                    // 3. 滾動鎖定處理 (只在手機模式下鎖定)
                    const shouldLockScroll = isExpanded && window.innerWidth <= mobileBreakpoint;
                    body.classList.toggle('no-scroll', shouldLockScroll);

                    // 4. 清理子選單 (如果是執行「關閉」操作)
                    if (!isExpanded) {
                        closeAllMobileSubmenus(); 
                    }
                    
                    // 5. GA4 追蹤點 
                    if (window.dataLayer) {
                        dataLayer.push({
                            'event': 'interaction',
                            'event_category': 'Navigation',
                            'event_label': 'Mobile_Menu',
                            'event_action': isExpanded ? 'Open' : 'Close'
                        });
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
                    dropdown.addEventListener('focusout', function(e) {
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
// ====================================================
// ====================================================
// 3. 響應式導航手風琴選單 (Mobile Navigation Accordion) - 【最終魯棒性修復版】
// ====================================================
try {
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', (e) => {
                const parentLi = targetLink.closest('li.dropdown');
                
                // 檢查 1：確保找到父級 <li>
                if (!parentLi) return; 

                // 檢查 2：判斷該連結是否為「開關觸發器」（href 為 # 或空）
                const isTrigger = (targetLink.getAttribute('href') === '#' || 
                                   targetLink.getAttribute('href') === null || 
                                   targetLink.getAttribute('href') === '');

                // 只有在手機視圖且是開關觸發器時才執行手風琴邏輯
                if (window.innerWidth <= mobileBreakpoint && isTrigger) {
                    e.preventDefault();
                    
                    // 獲取子選單 (防禦性檢查)
                    const submenu = parentLi.querySelector('.submenu');
                    const isCurrentlyActive = parentLi.classList.contains('active');

                    // 檢查 3：確保我們總是可以找到子選單，否則停止執行
                    if (!submenu) {
                        console.warn('Mobile Accordion: Submenu element not found for this dropdown. Check HTML class="submenu".');
                        return;
                    }

                    closeAllMobileSubmenus(); // 關閉其他

                    if (!isCurrentlyActive) {
                        // 執行展開
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
             if (link.closest('.dropdown > a') && (link.getAttribute('href') === '#' || link.getAttribute('href') === null || link.getAttribute('href') === '')) return;
             
             link.addEventListener('click', () => {
                 if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
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
                     content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';

                     headerElement.addEventListener('click', function() {
                        const isCurrentlyActive = item.classList.contains('active');
                        
                        // GA4 追蹤點
                        if (window.dataLayer) {
                            dataLayer.push({
                                'event': 'interaction',
                                'event_category': 'Accordion_FAQ',
                                'event_label': this.textContent.trim(),
                                'event_action': isCurrentlyActive ? 'Collapse' : 'Expand'
                            });
                        }

                        // 單一展開模式邏輯
                        document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                const otherContent = activeItem.querySelector('.accordion-content');
                                const otherHeader = activeItem.querySelector('.accordion-header');
                                activeItem.classList.remove('active');
                                requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                otherHeader.setAttribute('aria-expanded', 'false');
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);

                        // 實作平滑過渡
                        if (!isCurrentlyActive) {
                            this.setAttribute('aria-expanded', 'true');
                            requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                        } else {
                            this.setAttribute('aria-expanded', 'false');
                            content.style.maxHeight = `${content.scrollHeight}px`; 
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
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
                    el.classList.add('loaded');
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
            console.error('Core Logic Failed: Lazy Loading', e);
        }

        // ====================================================
        // 6. 平滑滾動至錨點 (Smooth Scrolling)
        // ====================================================
        try {
            if (header) {
                document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
                     const isMobileAccordionTrigger = anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint && (anchor.getAttribute('href') === '#' || anchor.getAttribute('href') === null || anchor.getAttribute('href') === '');
                     if (isMobileAccordionTrigger) return; 
                     
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            const headerHeight = header.offsetHeight;
                            const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                            const isMobileMenuOpen = mainNav && menuToggle && mainNav.classList.contains('active');

                            window.scrollTo({
                                top: targetTop,
                                behavior: 'smooth'
                            });
                            
                            // GA4 追蹤點
                            if (window.dataLayer) {
                                dataLayer.push({
                                    'event': 'navigation',
                                    'event_category': 'Anchor_Scroll',
                                    'event_label': targetId,
                                    'event_action': 'Smooth_Scroll'
                                });
                            }
                            
                            // 延遲關閉手機菜單
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
        try {
            const heroSection = document.querySelector('.hero-section.has-meteor'); 
            if (heroSection) {
                const numMeteors = window.innerWidth > mobileBreakpoint ? 8 : 4; 
                
                const createMeteor = () => {
                    const meteor = document.createElement('div');
                    meteor.classList.add('meteor');
                    
                    const startX = Math.random() * (heroSection.offsetWidth * 1.5) - (heroSection.offsetWidth * 0.5);
                    const startY = Math.random() * (heroSection.offsetHeight * 1.5) - (heroSection.offsetHeight * 0.5);
                    const duration = Math.random() * 8 + 4; // 4s to 12s
                    const delay = Math.random() * 10; // 0s to 10s delay

                    meteor.style.left = `${startX}px`;
                    meteor.style.top = `${startY}px`; 
                    meteor.style.animationDuration = `${duration}s`;
                    meteor.style.animationDelay = `${delay}s`;
                    
                    heroSection.appendChild(meteor);

                    meteor.addEventListener('animationend', () => {
                        meteor.remove();
                        setTimeout(createMeteor, Math.random() * 10000 + 1000); 
                    }, { once: true });
                };
                
                const initializeMeteors = () => {
                     for (let i = 0; i < numMeteors; i++) {
                         setTimeout(createMeteor, Math.random() * 15000); 
                     }
                };
                initializeMeteors(); 
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
            
            window.addEventListener('load', removeLoadingClass);
            removeLoadingClass(); 
        } catch (e) {
            console.error('Core Logic Failed: Loading Class', e);
        }


        // ====================================================
        // 10. 表單驗證與 UX 強化 (Form Validation & UX)
        // ====================================================
        try {
            if (contactForm) {
                contactForm.setAttribute('novalidate', ''); 
                
                contactForm.addEventListener('submit', function(e) {
                    const phoneInput = document.getElementById('phone');
                    const privacyCheckbox = document.getElementById('privacy');
                    let isValid = true;
                    let validationMessage = '';

                    // 電話號碼基本驗證
                    if (phoneInput) {
                        const phoneRegex = /^09\d{8}$/;
                        const normalizedPhone = phoneInput.value.replace(/[\s-]/g, '');

                        if (normalizedPhone === '') {
                             validationMessage = '請務必填寫您的聯繫電話。';
                             isValid = false;
                        } else if (!phoneRegex.test(normalizedPhone)) {
                            validationMessage = '請檢查您的聯繫電話格式，應為 10 碼數字 (例如：0912345678)。';
                            isValid = false;
                        }
                    }

                    // 隱私權條款驗證
                    if (isValid && privacyCheckbox && !privacyCheckbox.checked) {
                        validationMessage = '請務必勾選同意隱私權條款才能送出表單。';
                        isValid = false;
                    }
                    
                    if (!isValid) {
                        e.preventDefault();
                        alert(validationMessage); 
                        
                        // 讓焦點回到錯誤的元素
                        if (phoneInput && !phoneInput.value.trim()) {
                             phoneInput.focus();
                        } else if (phoneInput && !(/^09\d{8}$/).test(phoneInput.value.replace(/[\s-]/g, ''))) {
                             phoneInput.focus();
                        } else if (privacyCheckbox && !privacyCheckbox.checked) {
                             privacyCheckbox.focus();
                        }
                    }
                    
                    // GA4 追蹤點
                    if (window.dataLayer) {
                        dataLayer.push({
                            'event': isValid ? 'form_submission' : 'form_validation_fail',
                            'event_category': 'Contact_Form',
                            'event_label': 'Contact_Form_Submit',
                            'event_action': isValid ? 'Success' : 'Failure'
                        });
                    }
                });
            }
        } catch (e) {
            console.error('Core Logic Failed: Form Validation', e);
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
                 aosElements.forEach(el => el.classList.add('is-visible'));
            }
        } catch (e) {
            console.error('Core Logic Failed: AOS Trigger', e);
        }

    } catch (finalError) {
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

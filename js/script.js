

Document.addEventListener('DOMContentLoaded', () => {

    // 【🔥 最終防線：所有核心邏輯將在模組化的 Try-Catch 中執行，確保單點故障不影響全局】
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
        
        // 輔助函數： Debounce (去抖動)
        const debounce = (func, delay = 50) => { 
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                // 使用 requestAnimationFrame 包裹以在下一幀執行，減少佈局抖動
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
                        
                        // 確保清除 max-height，讓 CSS 規則重新生效（在桌面模式時）
                        const handleTransitionEnd = () => {
                            // 只有在非手機或主菜單關閉時才清除 max-height，避免桌面模式下 submenu 錯誤顯示 0px
                            if (window.innerWidth > mobileBreakpoint || !mainNav.classList.contains('active')) {
                                submenu.style.maxHeight = ''; 
                            }
                            submenu.removeEventListener('transitionend', handleTransitionEnd);
                        };
                        
                        // 監聽並移除事件
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
                     menuToggle?.click(); // 模擬點擊關閉菜單 (包含所有清理)
                 }
                 
                 closeAllMobileSubmenus(); 
                 
                 // 清理桌面 A11Y 狀態 (focus-within)
                 document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                     dropdown.classList.remove('focus-within');
                 });
                 
                 // FAQ 高度重算：確保內容高度正確，避免 RWD 變形
                 document.querySelectorAll('.accordion-item.active').forEach(item => {
                     const content = item.querySelector('.accordion-content');
                     if (content) {
                         // 確保內容能完整顯示
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
                            // 使用 .show class 而非 .is-visible class (與 CSS 最終版統一)
                            backToTopButton.classList.toggle('show', window.scrollY > 300);
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            if (header || backToTopButton) { 
                updateHeaderScrollClass(); // 初始檢查
                // 使用 Passive Listener 優化滾動性能
                window.addEventListener('scroll', updateHeaderScrollClass, { passive: true });
            }
        } catch (e) {
            console.error('Core Logic Failed: Header Scroll', e);
        }


        // ====================================================
        // 2. RWD 手機菜單切換 (Hamburger Menu Toggle) - 【最終修復模式】
        // ====================================================
        try {
            if (menuToggle && mainNav) {
                const menuIcon = menuToggle.querySelector('i');

                menuToggle.addEventListener('click', function() {
                    // 1. 判斷並切換核心狀態 (Active State)
                    const isExpanded = !mainNav.classList.contains('active'); 
                    
                    mainNav.classList.toggle('active', isExpanded);
                    this.classList.toggle('active', isExpanded); 
                    
                    // 2. A11Y 與 Icon 處理
                    this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');

                    if (menuIcon) {
                        // 使用 replace 確保單次操作，且邏輯是正確的
                        menuIcon.classList.replace(isExpanded ? 'fa-bars' : 'fa-times', isExpanded ? 'fa-times' : 'fa-bars');
                    }
                    
                    // 3. 滾動鎖定處理 (只在手機模式下鎖定)
                    const shouldLockScroll = isExpanded && window.innerWidth <= mobileBreakpoint;
                    body.classList.toggle('no-scroll', shouldLockScroll);

                    // 4. 清理子選單 (如果是執行「關閉」操作)
                    if (!isExpanded) {
                        // 執行所有子選單的收合動畫與狀態清除
                        closeAllMobileSubmenus(); 
                    }
                    
                    // 5. GA4 追蹤點 (保持不變)
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
        // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
        // ====================================================
        try {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                    targetLink.addEventListener('click', (e) => {
                        // 檢查是否為手機模式且該連結是父級菜單（href 為 # 或空）
                        const isDropdownTrigger = targetLink.closest('li.dropdown') && (targetLink.getAttribute('href') === '#' || targetLink.getAttribute('href') === null || targetLink.getAttribute('href') === '');
                        
                        if (window.innerWidth <= mobileBreakpoint && isDropdownTrigger) {
                            e.preventDefault();
                            const parentLi = targetLink.closest('li.dropdown');
                            const submenu = parentLi.querySelector('.submenu');
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            closeAllMobileSubmenus(); // 關閉其他

                            if (!isCurrentlyActive) {
                                parentLi.classList.add('active');
                                if (submenu) {
                                    requestAnimationFrame(() => {
                                        // 使用 scrollHeight 獲取子菜單實際高度，實作動畫效果
                                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                    });
                                }
                            } 
                        }
                    });
                });

                // 點擊菜單中的**非手風琴連結**後，自動關閉主菜單
                mainNav.querySelectorAll('a[href]').forEach(link => { 
                     // 排除作為手風琴開關的父連結
                     if (link.closest('.dropdown > a') && (link.getAttribute('href') === '#' || link.getAttribute('href') === null || link.getAttribute('href') === '')) return;
                     
                     link.addEventListener('click', () => {
                         if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                             // 延遲關閉，提供足夠時間進行頁面切換或平滑滾動
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
                     
                     // 初始設置高度以支持 CSS 過渡
                     content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';

                     headerElement.addEventListener('click', function() {
                        const isCurrentlyActive = item.classList.contains('active');
                        
                        // 【✨ GA4 追蹤點】
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
                            // 修正：必須確保 max-height 是從一個非 0 的值過渡到 0
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
        // 5. 圖片延遲載入 (Image Lazy Loading) - 核心 SEO/性能
        // ====================================================
        try {
            const lazyImages = document.querySelectorAll('img[data-src], source[data-srcset]');

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
                            // 處理 <picture> 標籤和單一 <img> 的邏輯
                            const elementToLoad = entry.target;
                            
                            if (elementToLoad.tagName === 'PICTURE') {
                                elementToLoad.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            } else if (elementToLoad.tagName === 'SOURCE' || elementToLoad.tagName === 'IMG') {
                                loadImage(elementToLoad);
                                // 如果是 <source> 則同時載入父級 <picture> 內的 <img>
                                if (elementToLoad.tagName === 'SOURCE' && elementToLoad.closest('picture')) {
                                    const img = elementToLoad.closest('picture').querySelector('img[data-src]');
                                    if (img) loadImage(img);
                                }
                            }
                            observer.unobserve(entry.target); 
                        }
                    });
                }, observerOptions);

                lazyImages.forEach(el => {
                    imgObserver.observe(el);
                });
            } else {
                 // Fallback for old browsers
                lazyImages.forEach(loadImage);
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
                     // 排除在手機模式下作為手風琴開關的父連結
                     const isMobileAccordionTrigger = anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint && (anchor.getAttribute('href') === '#' || anchor.getAttribute('href') === null || anchor.getAttribute('href') === '');
                     if (isMobileAccordionTrigger) return; 
                     
                    anchor.addEventListener('click', function (e) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            // 確保在點擊當下獲取 Header 實際高度
                            const headerHeight = header.offsetHeight;
                            
                            // 計算滾動位置：目標元素頂部位置 + 頁面滾動量 - Header 高度
                            const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                            const isMobileMenuOpen = mainNav && menuToggle && mainNav.classList.contains('active');

                            window.scrollTo({
                                top: targetTop,
                                behavior: 'smooth'
                            });
                            
                            // 【✨ GA4 追蹤點】
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
                    
                    // 【✨ GA4 追蹤點】
                    if (window.dataLayer) {
                        dataLayer.push({
                            'event': 'interaction',
                            'event_category': 'UX',
                            'event_label': 'Back_To_Top',
                            'event_action': 'Click'
                        });
                    }
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
                    
                    // 修正：從整個頁面寬度/高度隨機開始
                    const startX = Math.random() * (heroSection.offsetWidth * 1.5) - (heroSection.offsetWidth * 0.5);
                    const startY = Math.random() * (heroSection.offsetHeight * 1.5) - (heroSection.offsetHeight * 0.5);
                    const duration = Math.random() * 8 + 4; // 4s to 12s
                    const delay = Math.random() * 10; // 0s to 10s delay

                    meteor.style.left = `${startX}px`;
                    meteor.style.top = `${startY}px`; 
                    meteor.style.animationDuration = `${duration}s`;
                    meteor.style.animationDelay = `${delay}s`;
                    
                    heroSection.appendChild(meteor);

                    // 關鍵優化：監聽動畫結束事件，並刪除元素
                    meteor.addEventListener('animationend', () => {
                        meteor.remove();
                        // 刪除後以隨機間隔再次創建，維持數量
                        setTimeout(createMeteor, Math.random() * 10000 + 1000); 
                    }, { once: true });
                };
                
                const initializeMeteors = () => {
                     // 初始批次生成
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
            
            // 監聽 window load (所有資源載入完成)
            window.addEventListener('load', removeLoadingClass);
            // DOMContentLoaded 後先嘗試移除一次 
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
                        // 精簡正則表達式，接受數字、空格、破折號，但必須是 10 位數字開頭 09
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
                    
                    // 【✨ GA4 追蹤點】
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
        // 11. 動態文字適應 (Fit Text Logic) - 【🔥 補齊 Fit Text 核心邏輯】
        // ====================================================
        let fitAll; 
        try {
            const MAX_FONT = 22;   
            const MIN_FONT = 8;    
            const PRECISION = 0.2; 
            const TARGET_SELECTOR = '.fit-text-line'; 

            const fitOne = (el) => { 
                 const parentWidth = el.parentElement.offsetWidth;
                 const text = el.textContent.trim();
                 
                 // 確保 parent 寬度非零且內容非空
                 if (parentWidth <= 50 || text === '') {
                     // 設置為最大值以確保在極端情況下可見
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
                     
                     // 檢查元素寬度是否小於或等於父容器寬度
                     if (el.scrollWidth <= parentWidth) {
                         bestSize = mid;
                         low = mid + PRECISION; // 嘗試更大的字體
                     } else {
                         high = mid - PRECISION; // 嘗試更小的字體
                     }
                 }
                 
                 // 應用最終字體大小，且不超過最大值
                 el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
            };

            fitAll = () => { 
                 const nodes = document.querySelectorAll(TARGET_SELECTOR);
                 requestAnimationFrame(() => nodes.forEach(el => fitOne(el)));
            };

            const startFitText = () => {
                fitAll();
                
                // 使用 ResizeObserver 提高性能
                if (window.ResizeObserver) {
                    const fitTextObserver = new ResizeObserver(entries => {
                        // 僅在寬度發生實質變化時才觸發重新計算
                        const hasWidthChange = entries.some(entry => entry.contentRect.width !== 0);
                        if (hasWidthChange) {
                            debounceFitText(fitAll)();
                        }
                    });
                    
                    // 觀察父容器的尺寸變化
                    const observedParents = new Set();
                    document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
                         const parent = el.parentElement;
                         if (parent && !observedParents.has(parent)) {
                              fitTextObserver.observe(parent);
                              observedParents.add(parent);
                         }
                    });
                } else {
                    // Fallback for old browsers
                    window.addEventListener('resize', debounceFitText(fitAll)); 
                }
            };

            // 確保所有字體資源載入後再計算，避免閃爍
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
                    // 元素在底部進入視窗 85% 時觸發，優化動畫感知
                    rootMargin: '0px 0px -15% 0px', 
                    threshold: 0.01 
                };

                const aosObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            // 使用 rAF 集中寫入 DOM
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
                 // Fallback: 如果不支援 IO，則直接顯示 
                 aosElements.forEach(el => el.classList.add('is-visible'));
            }
        } catch (e) {
            console.error('Core Logic Failed: AOS Trigger', e);
        }

    } catch (finalError) {
        // 最終防線：如果腳本因為極端環境問題失敗，在控制台發出通知
        console.error('Fatal Error: Core JS Initialization Failed.', finalError);
    }
});

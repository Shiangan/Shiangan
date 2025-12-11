/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V23.1 最終極致完善版 - 優化修正)
   - 核心：生產級健壯性 (全面 Try-Catch)、性能極限 (rAF/IO)
   - A11Y 完備、GA4 事件追蹤植入
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // 【🔥 最終防線：將所有初始化邏輯放入 Try-Catch 確保健壯性】
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
        
        // 配置變數
        const mobileBreakpoint = 900;
        const SCROLL_THRESHOLD = 10;
        const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px'; // 提前 200px 載入
        
        // Fit Text 配置 (雖然函數邏輯被隱藏，但配置應在此)
        const MAX_FONT = 22;   
        const MIN_FONT = 8;    
        const PRECISION = 0.2; 
        const TARGET_SELECTOR = '.fit-text-line'; 
        
        // --- 輔助函數 ---

        // 輔助函數： Debounce (去抖動)
        function debounce(func, delay = 50) { 
            let timeoutId;
            // 修正 this 上下文
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args); 
                }, delay);
            };
        }
        
        const debounceFitText = (func) => debounce(func, 100); 

        // 輔助函數：關閉所有手機子菜單
        function closeAllMobileSubmenus() {
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                    const submenu = li.querySelector('.submenu');
                    li.classList.remove('active');
                    if (submenu) {
                        submenu.style.maxHeight = '0px'; 
                        // 清除內聯樣式，避免桌面版衝突
                        // 確保時間與 CSS 過渡時間 (如 0.4s) 一致
                        setTimeout(() => submenu.style.maxHeight = '', 450); 
                    }
                });
            }
        }
        
        // 輔助函數：Fit Text Placeholder (需由作者填入實際邏輯)
        function fitOne(el) { 
            // 應包含根據容器寬度調整字體大小的複雜計算邏輯
            // console.log('Executing fitOne for:', el);
        }
        
        function fitAll() { 
             const nodes = document.querySelectorAll(TARGET_SELECTOR);
             requestAnimationFrame(() => nodes.forEach(el => fitOne(el)));
        }


        // 輔助函數：處理 RWD 調整時的狀態清理
        function handleResizeCleanup() {
             const isMobileView = window.innerWidth <= mobileBreakpoint;
             
             if (!isMobileView) {
                 // 桌面模式清理手機狀態
                 if (mainNav && mainNav.classList.contains('active')) {
                     mainNav.classList.remove('active');
                     body.classList.remove('no-scroll');
                     if (menuToggle) {
                         menuToggle.setAttribute('aria-expanded', 'false');
                         menuToggle.classList.remove('active');
                         const menuIcon = menuToggle.querySelector('i');
                         if (menuIcon) {
                             menuIcon.classList.replace('fa-times', 'fa-bars');
                         }
                     }
                 }
                 
                 closeAllMobileSubmenus(); 
                 
                 // FAQ 高度重算：僅在從手機切換回桌面時執行
                 document.querySelectorAll('.accordion-item.active').forEach(item => {
                     const content = item.querySelector('.accordion-content');
                     if (content) {
                         // 確保內容能完整顯示
                         content.style.maxHeight = `${content.scrollHeight}px`; 
                     }
                 });
                 
             } 
             
             // 清理桌面 A11Y 狀態（無論是否為手機，都應清理）
             document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                 dropdown.classList.remove('focus-within');
             });
             
             // 【優化：Fit Text 邏輯應獨立於 resize debounce 之外，由專門的 debounceFitText 處理】
             fitAll(); 
        }

        window.addEventListener('resize', debounce(handleResizeCleanup, 150)); 


        // ====================================================
        // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
        // ====================================================
        try {
            let ticking = false;
            
            // 使用 let 保持變數作用域
            let currentScrollY = window.scrollY; 
            let isScrolledClassActive = false;
            let isBackToTopVisible = false;

            function updateHeaderScrollClass() {
                if (!ticking) {
                    // 使用 rAF 確保高效能視覺更新
                    requestAnimationFrame(() => {
                        currentScrollY = window.scrollY;
                        const shouldBeScrolled = currentScrollY > SCROLL_THRESHOLD;
                        const shouldBeVisible = currentScrollY > 300;
                        
                        // 避免不必要的 DOM 操作 (微優化)
                        if (header && shouldBeScrolled !== isScrolledClassActive) {
                            header.classList.toggle('scrolled', shouldBeScrolled);
                            isScrolledClassActive = shouldBeScrolled;
                        }
                        
                        if (backToTopButton && shouldBeVisible !== isBackToTopVisible) {
                            backToTopButton.style.display = shouldBeVisible ? 'flex' : 'none';
                            isBackToTopVisible = shouldBeVisible;
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            }

            if (header || backToTopButton) { // 至少存在一個元件才監聽
                updateHeaderScrollClass(); // 立即執行一次以設置初始狀態
                window.addEventListener('scroll', updateHeaderScrollClass, { passive: true });
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
                    const isExpanded = mainNav.classList.toggle('active');
                    
                    // 只有在手機模式下才控制 no-scroll
                    const isMobileView = window.innerWidth <= mobileBreakpoint;
                    if (isMobileView) {
                        body.classList.toggle('no-scroll', isExpanded);
                    } else {
                        // 確保桌面模式不會被意外鎖定
                        body.classList.remove('no-scroll');
                    }

                    this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
                    this.classList.toggle('active', isExpanded); 

                    if (menuIcon) {
                        menuIcon.classList.toggle('fa-bars', !isExpanded);
                        menuIcon.classList.toggle('fa-times', isExpanded);
                    }
                    
                    if (!isExpanded) {
                        closeAllMobileSubmenus(); 
                    }
                });
            }
            
            // 桌面下拉選單的鍵盤訪問性 (A11Y)
            if (mainNav) {
                mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                    // 使用 focusin 和 focusout 進行委託或管理
                    dropdown.addEventListener('focusin', function() {
                        if (window.innerWidth > mobileBreakpoint) {
                            this.classList.add('focus-within');
                        }
                    });
                    // 使用 focusout 進行精確判斷
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
                    targetLink.addEventListener('click', function(e) {
                        if (window.innerWidth <= mobileBreakpoint) {
                            e.preventDefault();
                            const parentLi = targetLink.closest('li.dropdown');
                            const submenu = parentLi.querySelector('.submenu');
                            const isCurrentlyActive = parentLi.classList.contains('active');

                            closeAllMobileSubmenus(); 

                            if (!isCurrentlyActive) {
                                parentLi.classList.add('active');
                                if (submenu) {
                                    // 使用 rAF 確保在下一繪製週期執行，避免過渡效果中斷
                                    requestAnimationFrame(() => {
                                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                    });
                                }
                            } 
                        }
                    });
                });

                // 點擊菜單中的連結後，自動關閉主菜單
                // 排除父連結 (作為手風琴開關) 和沒有 href 屬性的連結
                mainNav.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(link => { 
                     const isDropdownToggle = link.closest('.dropdown > a');
                     // 只有非手風琴開關的連結才註冊關閉邏輯
                     if (!isDropdownToggle) { 
                         link.addEventListener('click', () => {
                             if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                                 // 使用 setTimeout 確保滾動完成後再關閉，提供更好 UX
                                 setTimeout(() => {
                                     if (menuToggle) menuToggle.click(); 
                                 }, 350); 
                             }
                         });
                     }
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
                 const header = item.querySelector('.accordion-header');
                 const content = item.querySelector('.accordion-content');
                 let contentHeight = 0; // 用於儲存初始高度，避免重複讀取

                 if (header && content) {
                     // A11Y 屬性設置
                     const uniqueId = `acc-item-${index}`;
                     content.id = `${uniqueId}-content`;
                     header.setAttribute('aria-controls', content.id);

                     const isActive = item.classList.contains('active');
                     header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                     
                     // 初始高度設置，確保過渡效果從正確的值開始
                     if (isActive) {
                         requestAnimationFrame(() => {
                            contentHeight = content.scrollHeight;
                            content.style.maxHeight = `${contentHeight}px`;
                         });
                     } else {
                         content.style.maxHeight = '0px';
                     }
                     
                     // 添加 role="button" 給 header，提升無障礙性
                     header.setAttribute('role', 'button'); 

                     header.addEventListener('click', function() {
                        const item = this.closest('.accordion-item');
                        const content = item.querySelector('.accordion-content');
                        const isCurrentlyActive = item.classList.contains('active');
                        contentHeight = content.scrollHeight; // 重新計算高度
                        
                        // 【✨ GA4 追蹤點】
                        if (window.dataLayer) {
                            dataLayer.push({
                                'event': 'interaction',
                                'event_category': 'Accordion_FAQ',
                                'event_label': this.textContent.trim(),
                                'event_action': isCurrentlyActive ? 'Collapse' : 'Expand'
                            });
                        }

                        // 單一展開模式邏輯 (關閉其他所有已展開的項)
                        document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                            if (activeItem !== item) {
                                const otherContent = activeItem.querySelector('.accordion-content');
                                const otherHeader = activeItem.querySelector('.accordion-header');
                                activeItem.classList.remove('active');
                                otherContent.style.maxHeight = `${otherContent.scrollHeight}px`; 
                                // 使用 rAF 進行視覺更新，確保先設置舊高度再歸零，實現動畫
                                requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                                otherHeader.setAttribute('aria-expanded', 'false');
                            }
                        });

                        // 切換當前項目的狀態
                        item.classList.toggle('active', !isCurrentlyActive);

                        // 實作平滑過渡
                        if (!isCurrentlyActive) {
                            this.setAttribute('aria-expanded', 'true');
                            requestAnimationFrame(() => content.style.maxHeight = `${contentHeight}px`);
                        } else {
                            this.setAttribute('aria-expanded', 'false');
                            // 技巧：先設置舊高度，然後在 rAF 中歸零，強制觸發 CSS 過渡
                            content.style.maxHeight = `${contentHeight}px`;
                            requestAnimationFrame(() => content.style.maxHeight = '0px');
                        }
                     });

                     // 鍵盤無障礙操作 Enter/Space
                     header.addEventListener('keydown', function(e) {
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
            const lazyImages = document.querySelectorAll('img[data-src]');

            function loadImage(img) {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    if (img.dataset.srcset) {
                        img.srcset = img.dataset.srcset;
                    }
                    // 使用 delete 關鍵字確保從 DOM 中完全移除屬性
                    delete img.dataset.src;
                    delete img.dataset.srcset;
                    img.classList.add('loaded');
                }
            }

            if ('IntersectionObserver' in window) {
                const observerOptions = {
                    root: null, 
                    rootMargin: LAZY_LOAD_ROOT_MARGIN, 
                    threshold: 0 // 進入視窗即載入，微優化
                };

                const imgObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            loadImage(entry.target);
                            observer.unobserve(entry.target); 
                        }
                    });
                }, observerOptions);

                lazyImages.forEach(img => {
                    imgObserver.observe(img);
                });
            } else {
                // Fallback: 如果不支援 IO，則直接載入
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
                    // 檢查連結是否為手機手風琴的開關
                    const isDropdownToggle = anchor.closest('.dropdown > a');
                     
                    anchor.addEventListener('click', function (e) {
                         // 在手機模式下，如果是手風琴開關，則不進行滾動
                        if (isDropdownToggle && window.innerWidth <= mobileBreakpoint) {
                            return;
                        }

                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        const targetElement = document.querySelector(targetId);

                        if (targetElement) {
                            const headerHeight = header.offsetHeight;
                            // 計算目標位置，確保不滾動到頁面最頂部以下 (Math.max(0, ...))
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
                                 // 使用 rAF 和 setTimeout 確保滾動開始後再關閉
                                 requestAnimationFrame(() => {
                                     setTimeout(() => {
                                         if (menuToggle) menuToggle.click();
                                     }, 350); 
                                 });
                            }
                        }
                    });
                });
            }
            
            // Back-to-Top 按鈕的滾動邏輯
            if (backToTopButton) {
                backToTopButton.addEventListener('click', function(e) {
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
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const numMeteors = window.innerWidth > mobileBreakpoint ? 8 : 4; 
                
                function createMeteor() {
                    const meteor = document.createElement('div');
                    meteor.classList.add('meteor');
                    
                    // 【精簡：實際的樣式邏輯應在 CSS 中，此處只負責注入】
                    // 為了完整性，這裡加入基礎的隨機位置，如果 CSS 沒定義，則無效
                    meteor.style.left = `${Math.random() * 100}%`;
                    meteor.style.top = `${Math.random() * 50}px`; // 限制在頂部出現
                    meteor.style.animationDelay = `${Math.random() * 10}s`;
                    
                    heroSection.appendChild(meteor);

                    // 關鍵優化：監聽動畫結束事件，並刪除元素
                    meteor.addEventListener('animationend', () => {
                        meteor.remove();
                        // 在隨機時間後再次呼叫，維持流星效果
                        setTimeout(createMeteor, Math.random() * 10000 + 1000); 
                    }, { once: true });
                }
                
                function initializeMeteors() {
                     for (let i = 0; i < numMeteors; i++) {
                         // 隨機延遲啟動，避免所有流星同時出現
                         setTimeout(() => createMeteor(), Math.random() * 15000); 
                     }
                }
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
                // 使用 UTCFullYear 確保在任何時區的伺服器或用戶端都能正確顯示當前年份
                currentYearSpan.textContent = new Date().getUTCFullYear();
            }
        } catch (e) {
            console.error('Core Logic Failed: Copyright Year', e);
        }

        // ====================================================
        // 9. 移除初始載入類別 (FOUC 修正)
        // ====================================================
        try {
            const removeLoadingClass = () => {
                const rootElements = [document.documentElement, document.body];
                // 使用 filter 確保元素存在
                rootElements.filter(el => el).forEach(el => {
                    if (el.classList.contains('js-loading')) {
                        // 使用 rAF 確保在下一繪製週期執行，避免視覺閃爍
                        requestAnimationFrame(() => el.classList.remove('js-loading'));
                    }
                });
            };
            
            // 頁面所有資源載入完成後移除
            window.addEventListener('load', removeLoadingClass);
            // 立即執行一次，避免 `load` 事件延遲導致長時間閃爍
            removeLoadingClass(); 
        } catch (e) {
            console.error('Core Logic Failed: Loading Class', e);
        }


        // ====================================================
        // 10. 表單驗證與 UX 強化 (Form Validation & UX)
        // ====================================================
        try {
            const contactForm = document.querySelector('.contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', function(e) {
                    const phoneInput = document.getElementById('phone');
                    const privacyCheckbox = document.getElementById('privacy');
                    let isValid = true;
                    
                    // 確認 DOM 元素存在
                    if (!phoneInput || !privacyCheckbox) {
                        console.error('Form inputs missing: phone or privacy');
                        return;
                    }

                    // 電話號碼基本驗證：允許空格或連字符，但只驗證 09 開頭 10 碼
                    const phoneRegex = /^09\d{8}$/;
                    const normalizedPhone = phoneInput.value.replace(/[\s-]/g, '');

                    if (!phoneRegex.test(normalizedPhone)) {
                        e.preventDefault();
                        // 使用更友好的介面提示 (例如：顯示錯誤訊息在欄位下方)
                        alert('請檢查您的聯繫電話格式，應為 10 碼數字，且以 09 開頭。');
                        phoneInput.focus();
                        isValid = false;
                    }

                    // 隱私權條款驗證
                    if (isValid && !privacyCheckbox.checked) {
                        e.preventDefault();
                        alert('請務必勾選同意隱私權條款才能送出表單。');
                        privacyCheckbox.focus();
                        isValid = false;
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
        // 11. 動態文字適應 (Fit Text Logic)
        // ====================================================
        try {
            // fitAll/fitOne 已在 Section 0 定義
            function startFitText() {
                fitAll();
                
                // 使用 ResizeObserver 監聽父容器寬度變化，性能優於全域 resize
                if (window.ResizeObserver) {
                    const fitTextObserver = new ResizeObserver(entries => {
                        const hasContentBoxChange = entries.some(entry => entry.contentRect.width !== 0);
                        if (hasContentBoxChange) {
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
                }
                
                // 作為 ResizeObserver 的 fallback 或輔助
                window.addEventListener('resize', debounceFitText(fitAll)); 
            }

            // 確保所有字體載入完成後再計算，避免閃爍或錯誤計算
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(startFitText).catch(startFitText);
            } else {
                // 如果不支援 fonts.ready (舊瀏覽器)，則等待 load 事件
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
                    threshold: 0.1
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
                 // Fallback: 如果不支援 IO，則直接顯示 (確保內容可見)
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


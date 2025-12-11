/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V22.0 極致性能與 A11Y 聯動版)
   - 核心優化：FitText 性能、RWD 選單穩定性、滾動監聽
   - 專注 Core Web Vitals (CLS/FID) 修正
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {

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
    const SCROLL_THRESHOLD = 10; // Header 滾動樣式觸發距離
    const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px'; // 提前 200px 載入圖片 (加大預載空間)
    

    // 輔助函數： Debounce (去抖動) - 優化性能
    function debounce(func, delay = 50) { 
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    
    // 【✅ 優化：專門用於 Fit Text，允許更長的等待，減少重排】
    const debounceFitText = (func) => debounce(func, 100); 

    // 輔助函數：關閉所有手機子菜單 (清除 .active 類別及內聯樣式)
    function closeAllMobileSubmenus() {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                const submenu = li.querySelector('.submenu');
                li.classList.remove('active');
                if (submenu) {
                    // 確保清除 max-height 
                    submenu.style.maxHeight = '0px'; 
                    // 為了 CSS 過渡，需額外確保在下一個執行緒清除內聯樣式，避免桌面版衝突
                    setTimeout(() => submenu.style.maxHeight = '', 450); 
                }
            });
        }
    }

    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResizeCleanup() {
         const isMobileView = window.innerWidth <= mobileBreakpoint;
         
         if (!isMobileView) {
             // 1. 視窗變寬時，強制關閉主菜單
             if (mainNav && mainNav.classList.contains('active')) {
                 mainNav.classList.remove('active');
                 body.classList.remove('no-scroll');

                 if (menuToggle) {
                     menuToggle.setAttribute('aria-expanded', 'false');
                     menuToggle.classList.remove('active'); // 確保按鈕狀態一致
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
             }
             
             // 2. 清理所有手機子菜單 active 狀態
             closeAllMobileSubmenus(); 
             
             // 3. 清理桌面模式下的鍵盤輔助類別
             document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                 dropdown.classList.remove('focus-within');
             });
             
             // 4. 確保 FAQ 在桌面版調整時能重新計算高度 (處理 CSS/JS 衝突)
             document.querySelectorAll('.accordion-item.active').forEach(item => {
                 const content = item.querySelector('.accordion-content');
                 if (content) {
                     // 確保內容能完整顯示
                     content.style.maxHeight = `${content.scrollHeight}px`;
                 }
             });
         } else {
             // 5. 手機模式下，確保桌面 A11Y 狀態被移除
             document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                 dropdown.classList.remove('focus-within');
             });
         }
         
         // 6. 觸發 Fit Text 重新計算
         fitAll();
    }

    // 【✅ 性能修正】：將 resize 事件的 debounce 稍微加長，以減少重排
    window.addEventListener('resize', debounce(handleResizeCleanup, 150)); 


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class) - 性能核心
    // ====================================================

    // 【✅ 核心優化：使用 requestAnimationFrame 避免滾動卡頓】
    let ticking = false;
    function updateHeaderScrollClass() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const isScrolled = window.scrollY > SCROLL_THRESHOLD;
                if (header) {
                     header.classList.toggle('scrolled', isScrolled);
                }
                
                // Back-to-Top 顯示/隱藏
                if (backToTopButton) {
                    backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
                }

                ticking = false;
            });
            ticking = true;
        }
    }

    if (header) {
        updateHeaderScrollClass();
        // 使用 { passive: true } 提升滾動性能
        window.addEventListener('scroll', updateHeaderScrollClass, { passive: true });
    }

    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i');

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active');
            
            // 【✅ 修正：確保 no-scroll 僅在手機模式下應用】
            if (window.innerWidth <= mobileBreakpoint) {
                body.classList.toggle('no-scroll', isExpanded);
            } else {
                body.classList.remove('no-scroll');
            }

            this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            this.classList.toggle('active', isExpanded); // 保持按鈕自身的 active 狀態

            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.replace('fa-bars', 'fa-times');
                } else {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                    // 菜單關閉時，確保所有子菜單也關閉
                    closeAllMobileSubmenus(); 
                }
            }
        });
    }
    
    // 【✅ 補強：桌面下拉選單的鍵盤訪問性 (A11Y)】
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
            dropdown.addEventListener('focusin', function() {
                if (window.innerWidth > mobileBreakpoint) {
                    this.classList.add('focus-within');
                }
            });
            // 使用'focusout'搭配'relatedTarget'來處理從子菜單跳出時的清理
            dropdown.addEventListener('focusout', function(e) {
                 // 只有在焦點移到 *非* 自身或子菜單的元素時才移除 focus-within
                 if (window.innerWidth > mobileBreakpoint && !this.contains(e.relatedTarget)) {
                    this.classList.remove('focus-within');
                }
            });
        });
    }

    // ====================================================
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', function(e) {
                if (window.innerWidth <= mobileBreakpoint) {
                    e.preventDefault();

                    const parentLi = targetLink.closest('li.dropdown');
                    const submenu = parentLi.querySelector('.submenu');
                    const isCurrentlyActive = parentLi.classList.contains('active');

                    closeAllMobileSubmenus(); // 確保單一展開模式

                    if (!isCurrentlyActive) {
                        parentLi.classList.add('active');
                        if (submenu) {
                             // 【✅ 修正：使用 requestAnimationFrame + setTimeout 0 確保準確讀取 scrollHeight】
                             // 確保在 CSS 應用後立即計算高度
                            requestAnimationFrame(() => {
                                setTimeout(() => {
                                   submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                }, 0);
                            });
                        }
                    } 
                }
            });
        });

        // 點擊菜單中的連結後，自動關閉主菜單 (修正：更精準判斷為非手風琴開關的連結)
        mainNav.querySelectorAll('a[href^="#"]:not([href="#"]), a:not([href])').forEach(link => { 
             // 排除作為手風琴開關的父連結 (已在上面處理，但這裡再次確認)
             if (!link.closest('.dropdown > a')) {
                 link.addEventListener('click', () => {
                     if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                         // 使用 setTimeout 確保滾動完成後再關閉
                         setTimeout(() => {
                             if (menuToggle) menuToggle.click(); // 關閉主菜單
                         }, 350); 
                     }
                 });
             }
        });
    }


    // ====================================================
    // 4. 通用手風琴 (FAQ Accordion Component Logic)
    // ====================================================
    document.querySelectorAll('.accordion-item').forEach((item, index) => {
         const header = item.querySelector('.accordion-header');
         const content = item.querySelector('.accordion-content');

         if (header && content) {
             // 確保所有 id/aria 屬性正確設置
             const uniqueId = `acc-item-${index}`;
             content.id = `${uniqueId}-content`;
             header.setAttribute('aria-controls', content.id);

             const isActive = item.classList.contains('active');

             // 【✅ 修正：初始化邏輯】
             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             // 確保在 DOM 繪製前，max-height 已被設定，避免視覺上的 CLS
             if (isActive) {
                 requestAnimationFrame(() => {
                     content.style.maxHeight = `${content.scrollHeight}px`;
                 });
             } else {
                 content.style.maxHeight = '0px';
             }

             header.addEventListener('click', function() {
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isCurrentlyActive = item.classList.contains('active');

                // 1. 關閉所有其他項目 (單一展開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-header');

                        activeItem.classList.remove('active');
                        // 使用 requestAnimationFrame 確保視覺平滑收合
                        otherContent.style.maxHeight = `${otherContent.scrollHeight}px`; 
                        requestAnimationFrame(() => {
                            otherContent.style.maxHeight = '0px';
                        });
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });

                // 2. 切換當前項目的狀態
                item.classList.toggle('active', !isCurrentlyActive);

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開
                    this.setAttribute('aria-expanded', 'true');
                    requestAnimationFrame(() => {
                        // 確保 scrollHeight 計算準確
                        content.style.maxHeight = `${content.scrollHeight}px`;
                    });
                } else {
                    // 收合
                    this.setAttribute('aria-expanded', 'false');
                    // 必須先將 max-height 設為 scrollHeight 以便 CSS 過渡生效
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    requestAnimationFrame(() => {
                        content.style.maxHeight = '0px';
                    });
                }
             });

             // 【✅ 補強：鍵盤無障礙操作 Enter/Space】
             header.addEventListener('keydown', function(e) {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     this.click();
                 }
             });
         }
    });

    // ====================================================
    // 5. 圖片延遲載入 (Image Lazy Loading) - 核心 SEO/性能
    // ====================================================
    
    const lazyImages = document.querySelectorAll('img[data-src]');

    function loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            // 觸發圖片載入完成的 CSS 過渡
            img.classList.add('loaded');
        }
    }

    if ('IntersectionObserver' in window) {
        const observerOptions = {
            root: null, 
            rootMargin: LAZY_LOAD_ROOT_MARGIN, 
            threshold: 0.01 
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
        // Fallback: 雖然犧牲性能，但確保圖片一定會載入
        lazyImages.forEach(loadImage);
    }

    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // ====================================================
    if (header) {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
             // 排除在手機模式下作為手風琴開關的父連結
             if (anchor.closest('.dropdown > a') && window.innerWidth <= mobileBreakpoint) {
                 return; 
             }
             
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    // 使用 Math.max(0, ...) 確保不會滾動到負值
                    const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - headerHeight);
                    
                    const isMobileMenuOpen = mainNav && menuToggle && mainNav.classList.contains('active');

                    window.scrollTo({
                        top: targetTop,
                        behavior: 'smooth'
                    });
                    
                    // 延遲關閉手機菜單，避免滾動卡頓
                    if (isMobileMenuOpen) {
                         // 使用 setTimeout 確保滾動開始後再關閉
                         setTimeout(() => {
                             if (menuToggle) menuToggle.click();
                         }, 350); 
                    }
                }
            });
        });
    }
    
    // 【✅ 補強：Back-to-Top 按鈕的滾動邏輯】
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // ====================================================
    // 7. 動態生成不規則流星 (Meteor Generation Logic)
    // ====================================================
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        // 降低數量，提升性能
        const numMeteors = window.innerWidth > mobileBreakpoint ? 8 : 4; 
        
        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');

            const duration = Math.random() * 10 + 10; // 10s 到 20s
            
            let initialLeft = Math.random() * 50 + 80; 
            let initialTop = Math.random() * 50 - 10; 

            meteor.style.left = `${initialLeft}vw`;
            meteor.style.top = `${initialTop}vh`;

            // 尺寸隨機性
            const size = Math.random() * 1.5 + 1.5;
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size}px`;

            // 鎖定「向左下方移動」
            const rotation = -135 + (Math.random() * 30 - 15); 
            const travelX = -(120 + Math.random() * 80);
            const travelY = 80 + Math.random() * 80;

            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);

            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            // 使用 Math.max 確保延遲不為負值
            meteor.style.animationDelay = `${Math.max(0, Math.random() * 8 - 4)}s`; 
            meteor.style.animationTimingFunction = 'linear';
            meteor.style.animationIterationCount = '1'; 

            heroSection.appendChild(meteor);

            // 關鍵優化：監聽動畫結束事件，並刪除元素
            meteor.addEventListener('animationend', () => {
                meteor.remove();
                // 在流星消失後，延遲一段時間重新創建一個新的
                setTimeout(createMeteor, Math.random() * 10000 + 1000); // 1s 到 11s 後再次出現
            }, { once: true });
        }
        
        // 初始生成邏輯
        function initializeMeteors() {
             for (let i = 0; i < numMeteors; i++) {
                 // 錯開初始延遲
                 setTimeout(() => createMeteor(), Math.random() * 15000); 
             }
        }
        initializeMeteors(); 
    }

    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getUTCFullYear();
    }

    // ====================================================
    // 9. 移除初始載入類別 (FOUC 修正)
    // ====================================================
    const removeLoadingClass = () => {
        const rootElements = [document.documentElement, document.body];
        rootElements.forEach(el => {
            if (el && el.classList.contains('js-loading')) {
                // 【✅ 核心修正：使用 rAF 確保在下一幀移除，防止 DOM 渲染中途閃爍】
                requestAnimationFrame(() => {
                     el.classList.remove('js-loading');
                });
            }
        });
    };
    
    // 優先使用 load 事件，確保所有資源載入完成
    window.addEventListener('load', removeLoadingClass);
    // 額外確保 DOMContentLoaded 後也能移除（以防萬一）
    removeLoadingClass(); 


    // ====================================================
    // 10. 表單驗證與 UX 強化 (Form Validation & UX)
    // ====================================================
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const phoneInput = document.getElementById('phone');
            const privacyCheckbox = document.getElementById('privacy');
            let isValid = true;

            // 1. 電話號碼基本驗證：允許 10 碼數字，可包含 '-' 或空格
            const phoneRegex = /^09\d{8}$/;
            const normalizedPhone = phoneInput.value.replace(/[\s-]/g, '');

            if (!phoneRegex.test(normalizedPhone)) {
                e.preventDefault();
                alert('請檢查您的聯繫電話格式，應為 10 碼數字 (例如：0912345678)。');
                phoneInput.focus();
                isValid = false;
            }

            // 2. 隱私權條款驗證
            if (isValid && !privacyCheckbox.checked) {
                e.preventDefault();
                alert('請務必勾選同意隱私權條款才能送出表單。');
                privacyCheckbox.focus();
                isValid = false;
            }
        });
    }
    
    
    // ====================================================
    // 11. 動態文字適應 (Fit Text Logic) - 【✅ 性能強化與 ResizeObserver 修正】
    // ====================================================
    
    // 設定：最大、最小字級（px），以及精度（px）
    const MAX_FONT = 22;   
    const MIN_FONT = 8;    
    const PRECISION = 0.2; 
    
    // 定義目標元素選擇器
    const TARGET_SELECTOR = '.fit-text-line'; 


    // 量測並讓單一元素 fit 父容器 (優化為單線程執行)
    function fitOne(el) {
        if (!el || !el.parentElement) return;
        const parent = el.parentElement;
        const containerWidth = parent.clientWidth; 
        
        // 確保 el 內的文字在單行顯示
        el.style.whiteSpace = 'nowrap';
        
        if (containerWidth <= 0) return;

        let low = MIN_FONT;
        let high = MAX_FONT;
        
        // 嘗試最大字級
        el.style.fontSize = high + "px";
        let w = el.getBoundingClientRect().width;
        
        if (w <= containerWidth) {
            // 如果在最大字級下仍能適應，則直接使用最大字級
            return;
        }

        // 二分搜尋：找到最接近的字級
        while (high - low > PRECISION) {
            const mid = (low + high) / 2;
            el.style.fontSize = mid + "px";
            w = el.getBoundingClientRect().width;
            if (w > containerWidth) {
                high = mid;
            } else {
                low = mid;
            }
        }
        el.style.fontSize = Math.max(MIN_FONT, low) + "px";
    }

    // 套用到頁內所有目標元素
    function fitAll() {
        const nodes = document.querySelectorAll(TARGET_SELECTOR);
        // 【✅ 關鍵優化：使用 rAF 批次處理，減少重排】
        requestAnimationFrame(() => {
             nodes.forEach(el => fitOne(el));
        });
    }

    // 啟動 Fit Text 邏輯
    function startFitText() {
        fitAll();
        
        // 【✅ 修正：ResizeObserver 應觀察父容器，並使用一個單一的觀察者來處理所有變動】
        if (window.ResizeObserver) {
            // 由於觀察者觸發後會呼叫 fitAll() 重新計算所有 FitText 元素，
            // 我們只需要一個單一的 ResizeObserver 觀察所有**相關的父容器**即可。
            const fitTextObserver = new ResizeObserver(entries => {
                // 檢查是否有實際的寬度變化，避免不必要的重排
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
        }
        
        // 保留 window resize 兼容 (雖然功能被 ResizeObserver 取代，但作為通用 fallback)
        window.addEventListener('resize', debounceFitText(fitAll)); 
    }

    // 預先等待字型載入 (防止字型載入後發生 CLS)
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(startFitText).catch(startFitText);
    } else {
        // fallback: 在頁面完全載入後啟動
        window.addEventListener('load', startFitText);
    }
    
    // Fit Text 邏輯結束
    // ====================================================

});

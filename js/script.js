/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.8 最終聯動修正版 - 選單穩定加強版)
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {

    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================

    const header = document.querySelector('.main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const body = document.body;
    const mobileBreakpoint = 900;
    const currentYearSpan = document.getElementById('current-year');
    const backToTopButton = document.querySelector('.back-to-top'); 
    const lazyImages = document.querySelectorAll('img[data-src]');


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

    // 輔助函數：關閉所有手機子菜單 (清除 .active 類別及內聯樣式)
    function closeAllMobileSubmenus() {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                const submenu = li.querySelector('.submenu');
                li.classList.remove('active');
                if (submenu) {
                    // 修正：徹底清除 max-height 確保狀態重置
                    submenu.style.maxHeight = '0px'; 
                }
            });
        }
    }


    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResizeCleanup() {
         if (window.innerWidth > mobileBreakpoint) {
             // 視窗變寬時，移除手機菜單的 active 狀態和 no-scroll
             if (mainNav && mainNav.classList.contains('active')) {
                 mainNav.classList.remove('active');
                 body.classList.remove('no-scroll');

                 if (menuToggle) {
                     menuToggle.setAttribute('aria-expanded', 'false');
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
             }
             
             // 清理所有手機子菜單 active 狀態
             closeAllMobileSubmenus(); 
             
             // 確保桌面模式下，submenu 不受 max-height 限制
             if (mainNav) {
                 mainNav.querySelectorAll('.submenu').forEach(submenu => {
                     // 移除手機模式下設置的任何內聯 max-height 樣式
                     submenu.style.maxHeight = ''; 
                 });
             }
             
             // 【✅ 優化：清理桌面模式下的鍵盤輔助類別】
             document.querySelectorAll('.dropdown.focus-within').forEach(dropdown => {
                 dropdown.classList.remove('focus-within');
             });

             // 窗口調整時，重新計算 FAQ 的 max-height
             document.querySelectorAll('.accordion-item.active').forEach(item => {
                 const content = item.querySelector('.accordion-content');
                 if (content) {
                     // 確保內容能完整顯示
                     content.style.maxHeight = `${content.scrollHeight}px`;
                 }
             });
         }
    }

    window.addEventListener('resize', debounce(handleResizeCleanup, 150));


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    function updateHeaderScrollClass() {
        if (header) {
            // 性能優化：使用 requestAnimationFrame 確保 DOM 操作在瀏覽器繪製前完成
            requestAnimationFrame(() => {
                 header.classList.toggle('scrolled', window.scrollY > 10);
            });
        }
        
        // 【✅ 補強：Back-to-Top 顯示/隱藏】
        if (backToTopButton) {
            backToTopButton.style.display = window.scrollY > 300 ? 'flex' : 'none';
        }
    }

    if (header) {
        updateHeaderScrollClass();
        // 使用 { passive: true } 提升滾動性能
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 30), { passive: true });
    }

    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i');

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active');
            body.classList.toggle('no-scroll');

            this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            this.classList.toggle('active', isExpanded);

            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.replace('fa-bars', 'fa-times');
                } else {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                    closeAllMobileSubmenus(); 
                }
            }
        });
        
        // 【✅ 新增：點擊菜單外部時關閉菜單 (極端情況穩定性優化)】
        document.addEventListener('click', function(e) {
            // 檢查是否點擊了菜單開關按鈕或導航菜單本身
            const isMenuClick = mainNav.contains(e.target) || menuToggle.contains(e.target);
            
            if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active') && !isMenuClick) {
                // 模擬點擊開關來關閉菜單 (觸發所有關閉邏輯)
                menuToggle.click();
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
            dropdown.addEventListener('focusout', function(e) {
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
                // 僅在手機模式下觸發手風琴邏輯
                if (window.innerWidth <= mobileBreakpoint) {
                    e.preventDefault();

                    const parentLi = targetLink.closest('li.dropdown');
                    const submenu = parentLi.querySelector('.submenu');

                    const isCurrentlyActive = parentLi.classList.contains('active');

                    // 1. 關閉所有其他項目 (單一展開模式)
                    closeAllMobileSubmenus();

                    // 2. 切換當前項目的狀態：只有當前項目原本是關閉時才開啟它
                    if (!isCurrentlyActive) {
                        parentLi.classList.add('active');
                        // 關鍵：手動計算並設定 max-height
                        if (submenu) {
                            requestAnimationFrame(() => {
                                // 修正：使用 setTimeout 0ms 來確保 scrollHeight 精確計算
                                setTimeout(() => {
                                   submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                                }, 0);
                            });
                        }
                    } 
                }
            });
        });

        // 點擊菜單中的連結後，自動關閉主菜單
        mainNav.querySelectorAll('a[href^="#"], a:not([href])').forEach(link => { 
             // 排除作為手風琴開關的父連結
             if (!link.closest('.dropdown')) {
                 link.addEventListener('click', () => {
                     if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                         // 使用 setTimeout 確保滾動完成後再關閉
                         setTimeout(() => {
                             menuToggle.click(); 
                             body.classList.remove('no-scroll');
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

             // 初始化：設定正確的 max-height 以觸發 CSS 過渡
             content.style.maxHeight = isActive ? content.scrollHeight + "px" : '0px';
             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');

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
                        // 修正: 關閉時也必須執行兩步，確保平滑收合
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

             // 鍵盤無障礙操作
             header.addEventListener('keydown', function(e) {
                 if (e.key === 'Enter' || e.key === ' ') {
                     e.preventDefault();
                     this.click();
                 }
             });
         }
    });

    // ====================================================
    // 5. 圖片延遲載入 (Image Lazy Loading) - 增加 IntersectionObserver 錯誤處理
    // ====================================================
    
    // 載入圖片的函數
    function loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            if (img.dataset.srcset) {
                img.srcset = img.dataset.srcset;
            }
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            // 【✅ 補強：觸發圖片載入完成的 CSS 過渡（可搭配 CSS 實現淡入）】
            img.classList.add('loaded');
        }
    }

    if ('IntersectionObserver' in window) {
        try {
            const observerOptions = {
                root: null, // 視口 (viewport)
                rootMargin: '0px 0px 100px 0px', // 提前 100px 載入
                threshold: 0.01 // 圖片進入視口 1% 即載入
            };

            const imgObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        loadImage(entry.target);
                        observer.unobserve(entry.target); // 載入後停止觀察
                    }
                });
            }, observerOptions);

            lazyImages.forEach(img => {
                imgObserver.observe(img);
            });
        } catch (error) {
            // 在極少數情況下，Observer 建立失敗的錯誤處理
            console.error("Intersection Observer 初始化失敗，直接載入圖片。", error);
            lazyImages.forEach(loadImage);
        }
    } else {
        // Fallback for older browsers (直接載入所有圖片，犧牲性能)
        lazyImages.forEach(loadImage);
    }

    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // ====================================================
    if (header) {
        // 修正: 擴大選擇器範圍，包含所有以 # 開頭的錨點 (除了單獨的 #)
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
             // 排除在手機模式下作為手風琴開關的父連結
             if (anchor.closest('.dropdown') && window.innerWidth <= mobileBreakpoint) {
                 return; // 手機模式下，下拉菜單父連結不應觸發滾動
             }
             
            anchor.addEventListener('click', function (e) {
                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    const headerHeight = header.offsetHeight;
                    const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                    const targetPosition = targetTop - headerHeight;

                    // 判斷是否為手機菜單開啟狀態
                    const isMobileMenuOpen = mainNav && menuToggle && mainNav.classList.contains('active');

                    // 執行滾動
                    window.scrollTo({
                        top: Math.max(0, targetPosition),
                        behavior: 'smooth'
                    });
                    
                    // 延遲關閉手機菜單，避免滾動卡頓
                    if (isMobileMenuOpen) {
                         setTimeout(() => menuToggle.click(), 350); 
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
    // 7. 動態生成不規則流星 (Meteor Generation Logic) - 強化生命週期管理
    // ====================================================
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        // 降低數量，提升性能，並讓每次出現都更稀有
        const numMeteors = window.innerWidth > mobileBreakpoint ? 10 : 5; 
        
        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');

            // 速度 (持續時間)
            const duration = Math.random() * 10 + 10; // 10s 到 20s
            
            // 核心邏輯 1：定義「從右上方進入」 (與 CSS 變數呼應)
            let initialLeft = Math.random() * 50 + 80; // 80vw - 130vw
            let initialTop = Math.random() * 50 - 10;  // -10vh - 40vh

            meteor.style.left = `${initialLeft}vw`;
            meteor.style.top = `${initialTop}vh`;

            // 尺寸隨機性
            const size = Math.random() * 1.5 + 1.5;
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size}px`;

            // 核心邏輯 2：鎖定「向左下方移動」 (與 CSS 變數呼應)
            const rotation = -135 + (Math.random() * 30 - 15); // -150deg 到 -120deg
            const travelX = -(120 + Math.random() * 80);
            const travelY = 80 + Math.random() * 80;

            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);

            // 應用動畫屬性 (使用更真實的動畫命名，並只執行一次)
            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            meteor.style.animationDelay = `${Math.random() * 8}s`;
            meteor.style.animationTimingFunction = 'linear';
            meteor.style.animationIterationCount = '1'; // 關鍵：只執行一次
            meteor.style.pointerEvents = 'none';

            heroSection.appendChild(meteor);

            // 🌟 關鍵優化：監聽動畫結束事件，並刪除元素
            meteor.addEventListener('animationend', () => {
                meteor.remove();
                // 在流星消失後，延遲一段時間重新創建一個新的，實現無限但間歇的流星雨
                setTimeout(createMeteor, Math.random() * 10000); // 0s 到 10s 後再次出現
            }, { once: true }); // 確保事件監聽器只運行一次
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
    // 確保在頁面完全 ready 後移除 js-loading
    const removeLoadingClass = () => {
        const rootElements = [document.documentElement, document.body];
        rootElements.forEach(el => {
            if (el && el.classList.contains('js-loading')) {
                el.classList.remove('js-loading');
            }
        });
    };
    
    // 使用 load 事件確保所有資源（包括圖片）都載入完成，減少閃爍風險
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

            // 1. 電話號碼基本驗證
            // 允許格式：09XX-XXX-XXX 或 09XXXXXXXX (10 碼數字)
            const phoneRegex = /^09\d{8}$|^09\d{2}-\d{3}-\d{3}$/;
            const normalizedPhone = phoneInput.value.replace(/[\s-]/g, '');

            if (!phoneRegex.test(normalizedPhone)) {
                e.preventDefault();
                alert('請檢查您的聯繫電話格式，應為 10 碼數字 (例如：09XX-XXX-XXX)。');
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

            if (isValid) {
                // 如果所有驗證通過，可以在此處進行額外的 AJAX 提交邏輯
                // 這裡保持預設的 POST 提交到 submit_form.php
                // alert('表單已成功送出，禮儀師將盡快與您聯繫！');
            }
        });
    }

    // 確保所有邏輯已完全載入
    // ... 其他初始化邏輯 ...
});


// ====================================================
// 11. 動態文字適應 (Fit Text Logic) - 【✅ 調整為全頁面適用】
// ====================================================
(function () {
    // 設定：最大、最小字級（px），以及精度（px）
    const MAX_FONT = 22;   
    const MIN_FONT = 8;    
    const PRECISION = 0.2; 
    
    // 【💡 關鍵變更 1：定義目標元素選擇器】
    const TARGET_SELECTOR = '.fit-text-line'; 
    // 為了清晰和避免與其他樣式衝突，建議您使用一個新的、更具體的類別，例如：.fit-text-line
    // (如果堅持使用 .footer-text .fit-text，您需要在所有需要適應的元素上套用這兩個類別)


    // 量測並讓單一元素 fit 父容器
    function fitOne(el) {
        if (!el || !el.parentElement) return;
        const parent = el.parentElement;
        const containerWidth = parent.clientWidth; 
        if (containerWidth <= 0) return;

        // 二分搜尋邏輯 (保持不變)
        let low = MIN_FONT;
        let high = MAX_FONT;
        
        el.style.fontSize = high + "px";
        let w = el.getBoundingClientRect().width;
        
        if (w <= containerWidth) {
            return;
        }

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

    // 【💡 關鍵變更 2：套用到頁內所有目標元素】
    function fitAll() {
        // 使用新的目標選擇器
        const nodes = document.querySelectorAll(TARGET_SELECTOR);
        nodes.forEach(el => fitOne(el));
    }

    // 啟動邏輯
    function startFitText() {
        fitAll();
        
        // 【💡 關鍵變更 3：ResizeObserver 觀察全頁面所有目標元素的父容器】
        if (window.ResizeObserver) {
            // 嘗試找到所有目標元素的直接父級容器，並觀察它們。
            // 為了簡化，您可以觀察一個固定的、不會變動的頂層容器，例如 #main 或 .content-wrap
            document.querySelectorAll(TARGET_SELECTOR).forEach(el => {
                 if (el.parentElement) {
                      // 觀察父元素，確保當父元素寬度變化時能觸發
                      const ro = new ResizeObserver(debounceFitText(fitAll));
                      ro.observe(el.parentElement);
                 }
            });
        }
        
        // 保留 window resize 兼容 (使用核心 debounce)
        window.addEventListener('resize', debounceFitText(fitAll)); 
    }

    // 預先等待字型載入
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(startFitText).catch(startFitText);
    } else {
        window.addEventListener('load', startFitText);
    }
})();
// ====================================================


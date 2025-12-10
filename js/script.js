
/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.8 最終聯動修正版 - 完整優化)
   包含性能、RWD、A11y、平滑滾動，以及新增的里程碑數字滾動功能。
   ==================================================== */

// 0. **抗閃爍機制 (SEO/UX 優化)**
//    此處確保 'js-loading' 類別在 DOM 結構準備好時被快速移除。
document.body.classList.remove('js-loading');


document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    const header = document.querySelector('.main-header'); 
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const mobileBreakpoint = 900; 
    const currentYearSpan = document.getElementById('current-year');
    
    // 輔助函數： Debounce (去抖動) - 優化性能
    function debounce(func, delay = 150) { 
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // 輔助函數：關閉所有手機子菜單 (清除 .active 類別)
    function closeAllMobileSubmenus() {
        if (mainNav) {
            // 由於 submenu 是 li.dropdown 的子元素，我們只需移除父級 li 的 active 即可
            mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                li.classList.remove('active');
            });
        }
    }
    
    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResizeCleanup() {
         // 確保在電腦版 ( > 900px) 時，所有手機模式殘留的 class 被移除
         if (window.innerWidth > mobileBreakpoint) {
             if (mainNav && mainNav.classList.contains('active')) {
                 
                 mainNav.classList.remove('active');
                 body.classList.remove('no-scroll');
                 
                 if (menuToggle) {
                     menuToggle.setAttribute('aria-expanded', 'false');
                     
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
                 // 必須關閉所有子選單，避免切換回桌面後子選單狀態殘留
                 closeAllMobileSubmenus(); 
             }
         }
    }
    
    window.addEventListener('resize', debounce(handleResizeCleanup, 150));


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    function handleScroll() {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 0);
        }
    }
    
    if (header) {
        handleScroll(); 
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i'); 

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active'); 
            body.classList.toggle('no-scroll', isExpanded); // 鎖定背景滾動
            
            this.setAttribute('aria-expanded', isExpanded);
            
            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.replace('fa-bars', 'fa-times');
                    closeAllMobileSubmenus(); // 展開主選單時，收合所有子選單
                } else {
                    menuIcon.classList.replace('fa-times', 'fa-bars');
                }
            }
        });
    }

    // ====================================================
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion) - **邏輯修正**
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            // 只在移動端生效
            if (window.innerWidth <= mobileBreakpoint) { 
                
                // 修正：確保只處理點擊 li.dropdown > a，並且該 li 內有 submenu
                const targetLink = e.target.closest('li.dropdown > a'); 

                if (targetLink) {
                    const parentLi = targetLink.closest('li.dropdown');
                    const hasSubmenu = parentLi.querySelector('.submenu');
                    
                    // 只有當存在 submenu 且 href 為 '#' 或目標是當前頁面時才觸發手風琴
                    if (hasSubmenu && (targetLink.getAttribute('href') === '#' || targetLink.pathname === window.location.pathname)) {
                         
                        e.preventDefault(); 
                        
                        if (parentLi.classList.contains('active')) {
                            parentLi.classList.remove('active');
                        } else {
                            // 確保只有一個子菜單展開
                            closeAllMobileSubmenus(); 
                            parentLi.classList.add('active'); 
                        }
                    } else if (mainNav.classList.contains('active')) {
                        // 如果點擊的是有實際連結的項目，且菜單是打開的，則導航後關閉菜單
                        menuToggle.click(); // 模擬點擊關閉菜單
                    }
                }
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
             const uniqueId = `acc-item-${index}`;
             content.id = `${uniqueId}-content`;
             header.setAttribute('aria-controls', content.id);

             const isActive = item.classList.contains('active');
             
             // 初始化：設定正確的 max-height 以觸發 CSS 過渡
             const initialMaxHeight = isActive ? content.scrollHeight + "px" : '0px';
             content.style.maxHeight = initialMaxHeight;

             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             header.setAttribute('role', 'button'); 
             header.setAttribute('tabindex', '0'); 
             
             header.addEventListener('click', function(e) {
                
                const currentItem = this.closest('.accordion-item');
                const currentContent = currentItem.querySelector('.accordion-content');
                const isCurrentlyActive = currentItem.classList.contains('active');
                
                // 1. 關閉其他項目 (單開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== currentItem) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-header');
                        
                        activeItem.classList.remove('active');
                        otherContent.style.maxHeight = '0px';
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // 2. 切換當前項目的狀態
                currentItem.classList.toggle('active', !isCurrentlyActive);

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開
                    this.setAttribute('aria-expanded', 'true');
                    // **優化：確保 content.scrollHeight 是最新的**
                    requestAnimationFrame(() => {
                        currentContent.style.maxHeight = currentContent.scrollHeight + "px"; 
                    });
                } else {
                    // 收合
                    this.setAttribute('aria-expanded', 'false');
                    
                    // 為了確保 CSS 過渡能生效，必須先設定高度再設為 0
                    currentContent.style.maxHeight = currentContent.scrollHeight + "px";
                    
                    requestAnimationFrame(() => {
                        currentContent.style.maxHeight = '0px'; 
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
             
             // 窗口調整時重新計算 max-height
             window.addEventListener('resize', debounce(() => {
                 if (item.classList.contains('active')) {
                     // **優化：只在 active 狀態下重新計算**
                     content.style.maxHeight = content.scrollHeight + "px";
                 }
             }, 100));
         }
    });

    // ====================================================
    // 5. 圖片延遲載入 (Image Lazy Loading)
    // ====================================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const observerOptions = {
            rootMargin: '0px 0px 200px 0px' 
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        // 優化：優先使用 dataset.alt，若無則使用現有 alt，最後才為空
                        img.alt = img.dataset.alt || img.alt || ''; 
                        img.removeAttribute('data-src'); 
                        img.removeAttribute('data-alt');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for older browsers
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || img.alt || '';
            img.removeAttribute('data-src');
            img.removeAttribute('data-alt');
        });
    }

    
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // ====================================================
    if (header) { 
        // 排除下拉選單的父級連結 (只處理外部錨點和無下拉菜單的內部錨點)
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.dropdown > a)').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 點擊後關閉手機菜單
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         // 使用 setTimeout 確保菜單關閉流程完成
                         setTimeout(() => menuToggle.click(), 50); 
                     }
                    
                     const headerHeight = header.offsetHeight;
                     const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                     // 減去 Header 高度，確保目標不會被 Header 遮擋
                     const targetPosition = targetTop - headerHeight;
                         
                     window.scrollTo({
                         top: Math.max(0, targetPosition), // 確保不會滾動到負值
                         behavior: 'smooth'
                     });
                     
                }
            });
        });
    }

    
    // ====================================================
    // 7. 動態生成不規則流星 (Meteor Generation Logic) - **優化：DOM 移除與循環**
    // ====================================================
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) { 
        const numMeteors = 15; 
        let meteorIndex = 0;

        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');
            meteor.id = `meteor-${meteorIndex++}`;
            
            // 速度 (持續時間)
            const duration = Math.random() * 10 + 10; // 10s 到 20s
            const delay = Math.random() * 8; 
            
            // 核心邏輯 1：定義「從右上方進入」
            let initialLeft, initialTop;
            
            if (Math.random() > 0.4) {
                 // 60% 機率從右側邊緣開始 (105vw)
                 initialLeft = 105; 
                 initialTop = Math.random() * 80 - 20; 
            } else {
                 // 40% 機率從頂部邊緣開始 (-10vh)
                 initialTop = -10; 
                 initialLeft = Math.random() * 105; 
            }

            meteor.style.left = `${initialLeft}vw`;
            meteor.style.top = `${initialTop}vh`;
            
            // 核心邏輯 2：鎖定「向左下方移動」
            const rotation = Math.random() * 20 - 135; 
            const travelX = -(120 + Math.random() * 80); 
            const travelY = 80 + Math.random() * 80; 

            // 將參數設定為 CSS 變數
            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);
            
            // **優化：循環生成機制**
            meteor.addEventListener('animationend', () => {
                 meteor.remove();
                 // 使用 requestAnimationFrame 讓重新生成更平滑，並增加隨機延遲
                 setTimeout(() => requestAnimationFrame(createMeteor), Math.random() * 4000 + 1000); 
            }, { once: true }); // 確保監聽器只觸發一次

            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            meteor.style.animationDelay = `${delay}s`;
            meteor.style.animationTimingFunction = 'linear'; 
            meteor.style.pointerEvents = 'none'; 

            heroSection.appendChild(meteor);
        }

        // 初始生成指定數量的流星
        for (let i = 0; i < numMeteors; i++) {
            // 初始生成使用 requestAnimationFrame 確保在下一幀繪製
            setTimeout(() => requestAnimationFrame(createMeteor), Math.random() * 5000); 
        }
    }

    
    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }


    // ====================================================
    // 9. 數字滾動動畫 (Counter Up for Milestones) - **修正：後綴處理**
    // ====================================================
    function startCounter(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                let current = 0;
                
                // 修正：先取出並判斷後綴，確保 .toLocaleString 不會覆蓋它
                const originalText = counter.textContent.trim();
                const suffixMatch = originalText.match(/[^0-9\s]+$/); // 匹配末尾非數字、非空白字符
                const suffix = suffixMatch ? suffixMatch[0] : '';
                
                const duration = 1500; // 1.5 秒
                const step = (target / duration) * 10; 

                const interval = setInterval(() => {
                    current += step;
                    
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    
                    // 格式化數字 (數字部分使用逗號分隔)
                    let displayValue = Math.round(current).toLocaleString(undefined, { maximumFractionDigits: 0 });
                    
                    // 重新拼接數字與後綴
                    counter.textContent = displayValue + suffix; 
                    
                }, 10); // 每 10 毫秒更新一次

                observer.unobserve(counter); // 確保只運行一次
            }
        });
    }

    const counters = document.querySelectorAll('.milestone-item .counter');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(startCounter, {
            root: null,
            threshold: 0.5 
        });

        counters.forEach(counter => {
            // 初始設定 data-count 屬性，用於動畫目標
            if (!counter.dataset.count) {
                 // 由於您已經在 HTML 中設置了初始值，這裡只需確保它可以被解析
                 const initialValue = parseInt(counter.textContent.replace(/[^0-9]/g, '')) || 0;
                 counter.dataset.count = initialValue; 
            }
            counterObserver.observe(counter);
        });
    }
    
});


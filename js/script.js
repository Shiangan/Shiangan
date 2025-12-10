/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.8 最終聯動修正版 - 完整優化)
   包含性能、RWD、A11y、平滑滾動，以及新增的里程碑數字滾動功能。
   ==================================================== */

// 1. **抗閃爍機制 (SEO/UX 優化)**
//    此處確保 'js-loading' 類別在 DOM 結構準備好時被快速移除，優於在 DOMContentLoaded 內執行。
document.body.classList.remove('js-loading');


document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    const header = document.querySelector('.main-header'); // 確保使用正確的類別
    const menuToggle = document.querySelector('.menu-toggle');
    // [修正] 使用 querySelector 保持一致性
    const mainNav = document.querySelector('#main-nav'); 
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
                     // 確保圖標恢復到漢堡圖標
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
                 // 必須關閉所有子選單，避免切換回桌面後子選單狀態殘留
                 closeAllMobileSubmenus(); 
             }
             
             // [新增] 窗口調整時，如果 FAQ 是打開的，重新計算 max-height
             document.querySelectorAll('.accordion-item.active').forEach(item => {
                 const content = item.querySelector('.accordion-content');
                 if (content) {
                     content.style.maxHeight = content.scrollHeight + "px";
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
            // 使用 window.scrollY > 0 檢查滾動位置
            header.classList.toggle('scrolled', window.scrollY > 0);
        }
    }
    
    if (header) {
        updateHeaderScrollClass(); 
        // [優化] 使用 debounce 處理滾動事件
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 50), { passive: true });
    }
    
    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i'); 

        menuToggle.addEventListener('click', function() {
            const isExpanded = mainNav.classList.toggle('active'); 
            body.classList.toggle('no-scroll'); // 鎖定背景滾動
            
            // [A11y 優化] 確保 aria 狀態更新
            this.setAttribute('aria-expanded', isExpanded ? 'true' : 'false');
            
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
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            // 只在移動端生效
            if (window.innerWidth <= mobileBreakpoint) { 
                // [優化] 精確鎖定點擊目標：li.dropdown > a，並且該連結沒有 'submenu' 的類別 (如果有的話)
                let targetLink = e.target.closest('li.dropdown > a:not([href="#"])'); 

                if (targetLink) {
                    e.preventDefault(); 
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        // 確保只有一個子菜單展開
                        closeAllMobileSubmenus(); 
                        parentLi.classList.add('active'); 
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
             requestAnimationFrame(() => {
                 content.style.maxHeight = isActive ? content.scrollHeight + "px" : '0px'; 
             });

             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             header.setAttribute('role', 'button'); 
             header.setAttribute('tabindex', '0'); // 使其可通過鍵盤操作
             
             header.addEventListener('click', function(e) {
                
                const item = this.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isCurrentlyActive = item.classList.contains('active');
                
                // 1. 關閉其他項目 (單開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-header');
                        
                        activeItem.classList.remove('active');
                        otherContent.style.maxHeight = '0px';
                        otherHeader.setAttribute('aria-expanded', 'false');
                    }
                });
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開
                    this.setAttribute('aria-expanded', 'true');
                    requestAnimationFrame(() => {
                        content.style.maxHeight = content.scrollHeight + "px"; 
                    });
                } else {
                    // 收合
                    this.setAttribute('aria-expanded', 'false');
                    
                    // [修正] 收合時只需設定為 '0px'
                    // content.style.maxHeight = content.scrollHeight + "px"; // 移除多餘的設置
                    
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
             
             // 窗口調整時重新計算 max-height
             window.addEventListener('resize', debounce(() => {
                 if (item.classList.contains('active')) {
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
                        img.alt = img.dataset.alt || img.alt || ''; 
                        img.removeAttribute('data-src'); 
                        img.removeAttribute('data-alt');
                        // [優化] 增加一個類別標記，用於 CSS 動畫（可選）
                        img.classList.add('lazy-loaded'); 
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
                     // [優化] 延遲關閉手機菜單，讓滾動計算在菜單關閉後發生
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         // 使用 setTimeout 確保關閉動畫完成後再計算滾動
                         setTimeout(() => menuToggle.click(), 350); 
                     }
                    
                     if (typeof window.scrollTo === 'function' && targetElement.getBoundingClientRect) {
                         
                         const headerHeight = header.offsetHeight;
                         const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                         // 減去 Header 高度，確保目標不會被 Header 遮擋
                         const targetPosition = targetTop - headerHeight;
                         
                         window.scrollTo({
                             top: Math.max(0, targetPosition),
                             behavior: 'smooth'
                         });
                         
                     } else {
                         // Fallback: 舊瀏覽器
                         targetElement.scrollIntoView({
                             block: 'start',
                             inline: 'nearest',
                             behavior: 'instant' 
                         });
                         // 舊瀏覽器需手動修正位置
                         window.scrollBy(0, -header.offsetHeight);
                     }
                }
            });
        });
    }

    
    // ====================================================
    // 7. 動態生成不規則流星 (Meteor Generation Logic)
    // ====================================================
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) { 
        const numMeteors = 15; 

        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');
            
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
            
            // [新增] 流星尺寸的隨機性 (2px 到 4px)
            const size = Math.random() * 2 + 2; 
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size}px`;

            // 核心邏輯 2：鎖定「向左下方移動」
            const rotation = Math.random() * 20 - 135; 
            const travelX = -(120 + Math.random() * 80); 
            const travelY = 80 + Math.random() * 80; 

            // 將參數設定為 CSS 變數 (與您的 CSS @keyframes 完美聯動)
            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);
            
            // **優化：循環生成機制**
            meteor.addEventListener('animationend', () => {
                 meteor.remove();
                 // 延遲一段隨機時間後重新創建流星 (模擬無限流星)
                 setTimeout(createMeteor, Math.random() * 4000 + 1000); 
            });

            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            meteor.style.animationDelay = `${delay}s`;
            meteor.style.animationTimingFunction = 'linear'; 
            meteor.style.pointerEvents = 'none'; // 確保不影響用戶點擊

            heroSection.appendChild(meteor);
        }

        // 初始生成指定數量的流星
        for (let i = 0; i < numMeteors; i++) {
            setTimeout(createMeteor, Math.random() * 5000); 
        }
    }

    
    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
        // [優化] 使用 getUTCFullYear() 以確保時區獨立性 (雖然影響不大，但更嚴謹)
        currentYearSpan.textContent = new Date().getUTCFullYear();
    }


    // ====================================================
    // 9. 數字滾動動畫 (Counter Up for Milestones) - [新增的視覺衝擊優化]
    // ====================================================
    function startCounter(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                
                // 原始文字 (e.g., "100+", "95%", "15 mins")
                const originalText = counter.textContent.trim();
                
                // 提取目標數值
                const targetMatch = originalText.match(/\d+/);
                const target = targetMatch ? parseInt(targetMatch[0]) : 0;
                
                // 提取後綴 (e.g., "+", "%", " mins")
                const suffix = originalText.replace(targetMatch[0], '').trim();

                let current = 0;
                const duration = 1500; // 1.5 秒
                const step = (target / duration) * 10; 
                const intervalTime = 10;

                const interval = setInterval(() => {
                    current += step;
                    
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    
                    // 格式化顯示 (確保數字沒有小數點)
                    let displayValue = Math.round(current);
                    
                    // [修正] 使用 toLocaleString 增加千位分隔符，並保留後綴
                    counter.textContent = displayValue.toLocaleString() + (suffix ? ' ' + suffix : ''); 
                    
                }, intervalTime);

                observer.unobserve(counter); // 確保只運行一次
            }
        });
    }

    const counters = document.querySelectorAll('.milestone-item .counter');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(startCounter, {
            root: null,
            threshold: 0.5 // 50% 進入可視區時觸發
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
});

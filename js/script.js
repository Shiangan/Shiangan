/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V21.0 最終聯動穩定版 - 配合高雅金設計主題)
   
   - 包含：Header滾動、RWD菜單、通用手風琴、圖片延遲載入、平滑滾動、
     高性能流星動畫、里程碑數字滾動、智慧 CTA 隱藏、輕微視差滾動。
   - 優化：使用高性能API (requestAnimationFrame, IntersectionObserver, translate3d)。
   ==================================================== */

// 0. **抗閃爍機制 (SEO/UX 優化)**
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
    const floatingCta = document.querySelector('.floating-cta'); 
    const footer = document.querySelector('footer'); 
    const heroSection = document.querySelector('.hero-section');

    
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
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
                 // 必須關閉所有子選單，避免切換回桌面後子選單狀態殘留
                 closeAllMobileSubmenus(); 
             }
         }
         
         // 調整窗口時重新檢查 CTA 狀態
         if (floatingCta && footer) {
             handleFloatingCta();
         }
    }
    
    window.addEventListener('resize', debounce(handleResizeCleanup, 150));


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    // 使用 requestAnimationFrame 優化滾動事件性能
    let isScrolling = false;
    
    function updateScrollState() {
        if (header) {
            const scrolled = window.scrollY > 0;
            header.classList.toggle('scrolled', scrolled);
        }
        
        // 觸發視差滾動
        handleParallax();
        
        // 觸發 CTA 隱藏
        if (floatingCta && footer) {
            handleFloatingCta();
        }
        
        isScrolling = false;
    }
    
    function scrollHandler() {
        if (!isScrolling) {
            isScrolling = true;
            requestAnimationFrame(updateScrollState);
        }
    }
    
    if (header) {
        // 初始檢查狀態
        updateScrollState(); 
        window.addEventListener('scroll', scrollHandler, { passive: true });
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
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            // 只在移動端生效
            if (window.innerWidth <= mobileBreakpoint) { 
                
                const targetLink = e.target.closest('li.dropdown > a'); 

                if (targetLink) {
                    const parentLi = targetLink.closest('li.dropdown');
                    const hasSubmenu = parentLi.querySelector('.submenu');
                    
                    if (hasSubmenu) {
                         
                        e.preventDefault(); 
                        
                        // 處理子選單的展開/收合
                        parentLi.classList.toggle('active');
                        
                        // 如果展開，收合其他的
                        if (parentLi.classList.contains('active')) {
                             mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                                if (li !== parentLi) {
                                     li.classList.remove('active');
                                }
                             });
                        }
                        
                    } else if (mainNav.classList.contains('active')) {
                        // 點擊無下拉菜單的連結，導航後關閉菜單
                        setTimeout(() => menuToggle.click(), 50); 
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
             
             // 初始化高度
             const initialMaxHeight = isActive ? content.scrollHeight + "px" : '0px';
             content.style.maxHeight = initialMaxHeight;

             header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
             header.setAttribute('role', 'button'); 
             header.setAttribute('tabindex', '0'); 
             
             header.addEventListener('click', function() {
                
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
                
                // 2. 切換當前項目的狀態與高度
                currentItem.classList.toggle('active', !isCurrentlyActive);

                if (!isCurrentlyActive) {
                    this.setAttribute('aria-expanded', 'true');
                    requestAnimationFrame(() => {
                        currentContent.style.maxHeight = currentContent.scrollHeight + "px"; 
                    });
                } else {
                    this.setAttribute('aria-expanded', 'false');
                    
                    // 確保收合動畫流暢
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
            rootMargin: '0px 0px 200px 0px' // 在圖片進入視窗前 200px 就開始載入
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        // 優化：確保 alt 屬性設置
                        img.alt = img.dataset.alt || img.alt || '網站圖片'; 
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
            img.alt = img.dataset.alt || img.alt || '網站圖片';
            img.removeAttribute('data-src');
            img.removeAttribute('data-alt');
        });
    }

    
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // ====================================================
    if (header) { 
        // 排除掉不應該平滑滾動的項目：例如只有 # 的、或帶有下拉菜單的父連結
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.dropdown > a)').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 如果在手機模式下，先關閉菜單
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         setTimeout(() => menuToggle.click(), 50); 
                     }
                    
                     const headerHeight = header.offsetHeight;
                     const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                     // 減去 Header 高度，避免內容被遮擋
                     const targetPosition = targetTop - headerHeight;
                         
                     window.scrollTo({
                         top: Math.max(0, targetPosition), 
                         behavior: 'smooth'
                     });
                     
                }
            });
        });
    }

    
    // ====================================================
    // 7. 動態生成不規則流星 (Meteor Generation Logic)
    // ====================================================
    if (heroSection) { 
        const numMeteors = 15; 
        let meteorIndex = 0;

        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');
            meteor.id = `meteor-${meteorIndex++}`;
            
            const duration = Math.random() * 10 + 10; // 10s - 20s
            const delay = Math.random() * 8; // 0s - 8s 初始延遲
            
            let initialLeft, initialTop;
            
            // 70% 機率從右上方進入 (更常見的流星角度)
            if (Math.random() > 0.3) {
                 initialLeft = 105; // 稍稍超出右邊界
                 initialTop = Math.random() * 80 - 20; // -20vh 到 60vh
            } else {
                 // 30% 機率從上方進入
                 initialTop = -10; 
                 initialLeft = Math.random() * 105; 
            }

            meteor.style.left = `${initialLeft}vw`;
            meteor.style.top = `${initialTop}vh`;
            
            // 調整角度和軌跡
            const rotation = Math.random() * 20 - 135; // 集中在 -115deg 到 -135deg
            const travelX = -(120 + Math.random() * 80); // 離開範圍
            const travelY = 80 + Math.random() * 80; 

            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);
            
            // 動畫結束後移除並重新生成
            meteor.addEventListener('animationend', () => {
                 meteor.remove();
                 // 隨機延遲後再次生成，確保不規則
                 setTimeout(() => requestAnimationFrame(createMeteor), Math.random() * 4000 + 1000); 
            }, { once: true }); 

            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            meteor.style.animationDelay = `${delay}s`;
            meteor.style.animationTimingFunction = 'linear'; 
            meteor.style.pointerEvents = 'none'; 

            heroSection.appendChild(meteor);
        }

        for (let i = 0; i < numMeteors; i++) {
            // 初始時分散生成
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
    // 9. 數字滾動動畫 (Counter Up for Milestones)
    // ====================================================
    function startCounter(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.count);
                let current = 0;
                
                // 保留數字後面的單位或符號
                const originalText = counter.textContent.trim();
                const suffixMatch = originalText.match(/[^0-9\s]+$/); 
                const suffix = suffixMatch ? suffixMatch[0] : '';
                
                const duration = 1500; // 滾動時間 1.5s
                const step = (target / duration) * 10; 

                const interval = setInterval(() => {
                    current += step;
                    
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    
                    // 使用 toLocaleString 添加千分位分隔符
                    let displayValue = Math.round(current).toLocaleString(undefined, { maximumFractionDigits: 0 });
                    
                    counter.textContent = displayValue + suffix; 
                    
                }, 10); 

                observer.unobserve(counter); 
            }
        });
    }

    const counters = document.querySelectorAll('.milestone-item .counter');
    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(startCounter, {
            root: null,
            threshold: 0.5 // 元素一半進入視窗時觸發
        });

        counters.forEach(counter => {
            // 確保目標數字被儲存在 data 屬性中
            if (!counter.dataset.count) {
                 const initialValue = parseInt(counter.textContent.replace(/[^0-9]/g, '')) || 0;
                 counter.dataset.count = initialValue; 
            }
            counterObserver.observe(counter);
        });
    }


    // ====================================================
    // 10. 浮動 CTA 按鈕的智慧顯示/隱藏 (UX 優化)
    // ====================================================
    if (floatingCta && footer) {
        
        const offset = 100; // 提前隱藏的距離
        
        function handleFloatingCta() {
            // 獲取當前滾動到的視窗底部位置
            const scrollBottom = window.scrollY + window.innerHeight;
            // 獲取頁尾的頂部位置
            const footerTop = footer.offsetTop;
            
            // 如果視窗底部超過 Footer 頂部 + 偏移量
            if (scrollBottom > footerTop + offset) {
                // 隱藏
                floatingCta.style.opacity = '0';
                floatingCta.style.visibility = 'hidden';
                floatingCta.style.transform = 'translateY(10px)';
            } else {
                // 顯示
                floatingCta.style.opacity = '1';
                floatingCta.style.visibility = 'visible';
                floatingCta.style.transform = 'translateY(0)';
            }
        }
        
        handleFloatingCta();
        // 滾動事件已在 1. Header 區塊被 requestAnimationFrame 優化處理
    }
    
    // ====================================================
    // 11. 輕微視差滾動效果 (Parallax Scroll)
    // ====================================================
    const parallaxElements = [
        { selector: '#stars', speed: 0.05 },
        { selector: '#stars2', speed: 0.1 },
        { selector: '#stars3', speed: 0.15 }
    ];

    function handleParallax() {
        const scrolled = window.scrollY;
        
        if (scrolled === 0) return; 
        
        parallaxElements.forEach(item => {
            const element = document.querySelector(item.selector);
            if (element) {
                // 使用 translate3d 提升 GPU 渲染性能
                const yPos = scrolled * item.speed;
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });
    }

    // 滾動事件已在 1. Header 區塊被 requestAnimationFrame 優化處理
    
});

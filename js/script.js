/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V21.1 最終聯動穩定版 - 配合高雅金設計主題)
   
   - 核心功能：Header滾動、RWD菜單、通用手風琴、圖片延遲載入 (IO)、
     平滑滾動、流星動畫、里程碑數字滾動 (IO)、智慧 CTA 隱藏 (IO)、
     輕微視差滾動 (RAF)。
   - 優化：使用高性能API (requestAnimationFrame, IntersectionObserver, translate3d)。
   - 結構：採用 IIFE 封裝，防止全域變數污染。
   ==================================================== */

// 0. **抗閃爍機制 (SEO/UX 優化)**
document.body.classList.remove('js-loading');


document.addEventListener('DOMContentLoaded', function() {

    // 使用立即執行函數表達式 (IIFE) 封裝所有邏輯，避免變數污染
    (function() { 
        
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
        const heroSection = document.querySelector('.page-hero'); // 修正為實際 Hero 選擇器
        
        // 性能優化標記
        let isScrolling = false; 

        
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
             
             // 調整窗口時重新檢查 CTA 狀態 (如果沒有使用 IO 監聽 footer)
             // if (floatingCta && footer) {
             //     handleFloatingCta();
             // }
        }
        
        window.addEventListener('resize', debounce(handleResizeCleanup, 150));


        // ====================================================
        // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
        // ====================================================
        
        function updateScrollState() {
            const scrolled = window.scrollY > 0;
            if (header) {
                header.classList.toggle('scrolled', scrolled);
            }
            
            // 觸發視差滾動
            handleParallax();
            
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
                            const isCurrentlyActive = parentLi.classList.contains('active');
                            parentLi.classList.toggle('active', !isCurrentlyActive);

                            // 如果展開，收合其他的 (單開模式)
                            if (!isCurrentlyActive) {
                                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                                    if (li !== parentLi) {
                                        li.classList.remove('active');
                                    }
                                });
                            }
                            
                        } else if (mainNav.classList.contains('active')) {
                            // 點擊無下拉菜單的連結，導航後關閉菜單 (更好的用戶體驗)
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
                 
                 // 初始化高度，並使用 transition 處理高度
                 content.style.maxHeight = isActive ? content.scrollHeight + "px" : '0px';

                 header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                 header.setAttribute('role', 'button'); 
                 header.setAttribute('tabindex', '0'); 
                 
                 const toggleAccordion = function() {
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
                        // 使用 requestAnimationFrame 確保高度計算在下一幀進行
                        requestAnimationFrame(() => {
                            currentContent.style.maxHeight = currentContent.scrollHeight + "px"; 
                        });
                    } else {
                        this.setAttribute('aria-expanded', 'false');
                        // 確保收合動畫流暢：先設定實際高度，再歸零
                        currentContent.style.maxHeight = currentContent.scrollHeight + "px";
                        
                        requestAnimationFrame(() => {
                            currentContent.style.maxHeight = '0px'; 
                        });
                    }
                 };


                 header.addEventListener('click', toggleAccordion);
                 
                 // 鍵盤無障礙操作
                 header.addEventListener('keydown', function(e) {
                     if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         toggleAccordion.call(this); // 使用 call 確保 this 指向 header
                     }
                 });
                 
                 // 窗口調整時重新計算 max-height
                 window.addEventListener('resize', debounce(() => {
                     if (item.classList.contains('active')) {
                         // 僅在 active 時才需要重新計算高度
                         content.style.maxHeight = content.scrollHeight + "px";
                     }
                 }, 100));
             }
        });

        // ====================================================
        // 5. 圖片延遲載入 (Image Lazy Loading)
        // ====================================================
        const lazyImages = document.querySelectorAll('img[data-src], source[data-srcset]');
        
        if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
            const observerOptions = {
                rootMargin: '0px 0px 200px 0px' 
            };

            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        
                        // 處理 img 標籤
                        if (target.tagName === 'IMG' && target.dataset.src) {
                            target.src = target.dataset.src;
                            target.alt = target.dataset.alt || target.alt || '網站圖片'; 
                            target.removeAttribute('data-src'); 
                            target.removeAttribute('data-alt');
                        }
                        
                        // 處理 source 標籤 (適用於 <picture> 內部)
                        if (target.tagName === 'SOURCE' && target.dataset.srcset) {
                            target.srcset = target.dataset.srcset;
                            target.removeAttribute('data-srcset');
                        }
                        
                        observer.unobserve(target);
                    }
                });
            }, observerOptions);

            lazyImages.forEach(function(el) {
                imageObserver.observe(el);
            });
            
        } else {
            // Fallback for older browsers
            lazyImages.forEach(el => {
                if (el.tagName === 'IMG' && el.dataset.src) {
                    el.src = el.dataset.src;
                    el.alt = el.dataset.alt || el.alt || '網站圖片';
                    el.removeAttribute('data-src');
                    el.removeAttribute('data-alt');
                }
                if (el.tagName === 'SOURCE' && el.dataset.srcset) {
                    el.srcset = el.dataset.srcset;
                    el.removeAttribute('data-srcset');
                }
            });
        }

        
        // ====================================================
        // 6. 平滑滾動至錨點 (Smooth Scrolling)
        // ====================================================
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
                    
                     // 魯棒性檢查：確保 header 存在
                     const headerHeight = header ? header.offsetHeight : 0;
                     const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                     // 減去 Header 高度，避免內容被遮擋
                     const targetPosition = targetTop - headerHeight;
                         
                     window.scrollTo({
                         top: Math.max(0, targetPosition), 
                         behavior: 'smooth'
                     });
                     
                     // 讓焦點回到目標元素，提升無障礙體驗
                     targetElement.setAttribute('tabindex', '-1');
                     targetElement.focus();
                }
            });
        });

        
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
                     initialLeft = 105; 
                     initialTop = Math.random() * 80 - 20; 
                } else {
                     // 30% 機率從上方進入
                     initialTop = -10; 
                     initialLeft = Math.random() * 105; 
                }

                meteor.style.left = `${initialLeft}vw`;
                meteor.style.top = `${initialTop}vh`;
                
                // 調整角度和軌跡
                const rotation = Math.random() * 20 - 135; 
                const travelX = -(120 + Math.random() * 80); 
                const travelY = 80 + Math.random() * 80; 

                // 使用 CSS 變數來控制動畫，性能最佳
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
                meteor.style.pointerEvents = 'none'; // 避免流星擋住點擊

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
        // 9. 數字滾動動畫 (Counter Up for Milestones) - 使用 IO
        // ====================================================
        function startCounter(entries, observer) {
            entries.forEach(entry => {
                // 確保只在元素進入視窗且可見時觸發
                if (entry.isIntersecting && entry.intersectionRatio > 0) { 
                    const counter = entry.target;
                    const targetText = counter.dataset.count;
                    const target = parseInt(targetText.replace(/[^0-9]/g, ''));

                    // 保留數字後面的單位或符號 (例如 +, %)
                    const suffixMatch = targetText.match(/[^0-9\s]+$/); 
                    const suffix = suffixMatch ? suffixMatch[0] : '';
                    
                    let current = 0;
                    const duration = 1500; // 滾動時間 1.5s
                    const startTime = performance.now();

                    function animateCount(timestamp) {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        current = target * progress;
                        
                        // 使用 toLocaleString 添加千分位分隔符
                        let displayValue = Math.round(current).toLocaleString(undefined, { maximumFractionDigits: 0 });
                        
                        counter.textContent = displayValue + suffix; 

                        if (progress < 1) {
                            requestAnimationFrame(animateCount);
                        }
                    }

                    requestAnimationFrame(animateCount);

                    observer.unobserve(counter); 
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
                // 確保目標數字被儲存在 data 屬性中
                if (counter.textContent) {
                    counter.dataset.count = counter.textContent; 
                }
                counterObserver.observe(counter);
            });
        }


        // ====================================================
        // 10. 浮動 CTA 按鈕的智慧顯示/隱藏 (UX 優化) - 使用 IO
        // ====================================================
        if (floatingCta && footer && 'IntersectionObserver' in window) {
            
            const offset = 100; // 提前隱藏的距離
            
            const ctaObserver = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Footer 頂部進入視窗，隱藏 CTA
                        floatingCta.style.opacity = '0';
                        floatingCta.style.visibility = 'hidden';
                        floatingCta.style.transform = 'translateY(10px)';
                    } else {
                         // Footer 離開視窗，顯示 CTA
                         floatingCta.style.opacity = '1';
                         floatingCta.style.visibility = 'visible';
                         floatingCta.style.transform = 'translateY(0)';
                    }
                });
            }, {
                root: null,
                // 根邊距設為負值，讓 CTA 在 Footer 頂部**到達視窗底部前**就開始隱藏
                rootMargin: `0px 0px -${window.innerHeight - offset}px 0px`, 
                threshold: 0 
            });
            
            ctaObserver.observe(footer);
        }
        
        // ====================================================
        // 11. 輕微視差滾動效果 (Parallax Scroll) - 使用 RAF
        // ====================================================
        // 假設 HTML 中有 .parallax-layer 的元素
        const parallaxElements = document.querySelectorAll('.parallax-layer'); 
        
        function handleParallax() {
            const scrolled = window.scrollY;
            
            // 由於已經在 requestAnimationFrame 中執行，不需要額外的 scrolled === 0 檢查
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.1; // 從 data 屬性獲取速度
                const yPos = scrolled * speed;
                
                // 使用 translate3d 提升 GPU 渲染性能
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            });
        }

        // 滾動事件已在 1. Header 區塊被 requestAnimationFrame 優化處理
        
    })(); // IIFE 結束
});

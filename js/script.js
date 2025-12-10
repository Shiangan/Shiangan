/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V25.1 菜單穩定修復版)
   ==================================================== */

// 0. **抗閃爍機制 (SEO/UX 優化)**
document.documentElement.classList.remove('js-loading');


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
        const heroSection = document.querySelector('.hero-section'); 
        
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
                    // 確保 ARIA 狀態被正確更新
                    const link = li.querySelector('li.dropdown > a');
                    if (link) {
                        link.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }
        
        // 輔助函數：處理 RWD 調整時的狀態清理
        function handleResizeCleanup() {
             // 確保在電腦版 ( > 900px) 時，所有手機模式殘留的 class 被移除
             if (window.innerWidth > mobileBreakpoint) {
                 if (mainNav && mainNav.classList.contains('active')) {
                     
                     // 執行關閉菜單的邏輯，避免殘留
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
                 // 確保所有子選單狀態被重置
                 closeAllMobileSubmenus(); 
                 
                 // 重新計算手風琴高度 (確保從手機切換回電腦後，再切回手機時能正確計算)
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
        
        function updateScrollState() {
            const scrolled = window.scrollY > 0;
            if (header) {
                if (header.classList.contains('scrolled') !== scrolled) {
                    header.classList.toggle('scrolled', scrolled);
                }
            }
            
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
            updateScrollState(); 
            window.addEventListener('scroll', scrollHandler, { passive: true });
        }
        
        // ====================================================
        // 2. ⭐️ RWD 手機菜單切換 (Hamburger Menu Toggle) - 修復核心
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
                        // 展開主選單時，收合所有手機子選單（確保乾淨狀態）
                        closeAllMobileSubmenus(); 
                    } else {
                        menuIcon.classList.replace('fa-times', 'fa-bars');
                    }
                }
            });
        }

        // ====================================================
        // 3. ⭐️ 響應式導航手風琴選單 (Mobile Navigation Accordion) - 修復核心
        // ====================================================
        if (mainNav) {
            mainNav.addEventListener('click', function(e) {
                
                // 必須在手機模式且主菜單展開時才處理子菜單點擊
                if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) { 
                    
                    // 找到點擊的目標連結 (必須是 li.dropdown 的直屬 a)
                    const targetLink = e.target.closest('li.dropdown > a'); 

                    if (targetLink) {
                        const parentLi = targetLink.closest('li.dropdown');
                        const hasSubmenu = parentLi.querySelector('.submenu');
                        
                        if (hasSubmenu) {
                            
                            e.preventDefault(); 
                            
                            const isCurrentlyActive = parentLi.classList.contains('active');
                            
                            // 1. 處理單開模式：如果展開，收合其他的
                            if (!isCurrentlyActive) {
                                mainNav.querySelectorAll('li.dropdown.active').forEach(li => {
                                    if (li !== parentLi) {
                                        li.classList.remove('active');
                                        li.querySelector('li.dropdown > a').setAttribute('aria-expanded', 'false');
                                    }
                                });
                            }
                            
                            // 2. 切換當前項目的狀態
                            parentLi.classList.toggle('active');
                            targetLink.setAttribute('aria-expanded', !isCurrentlyActive);

                            // 確保選單箭頭圖標在點擊時也能旋轉 (假設箭頭在 targetLink 內)
                            const icon = targetLink.querySelector('.fa-chevron-down');
                            if (icon) {
                                icon.style.transform = parentLi.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0deg)';
                            }
                            
                        } else {
                            // 點擊無下拉菜單的頂層連結，導航後關閉菜單 
                            setTimeout(() => menuToggle.click(), 50); 
                        }
                    }
                    // 點擊子菜單 (.submenu a) 內的連結，導航後關閉整個主選單
                    else if (e.target.closest('.submenu a')) {
                        setTimeout(() => menuToggle.click(), 50);
                    }
                }
                // 處理桌面模式下的 tabindex="0" 導致的點擊事件（如果需要）
                else if (window.innerWidth > mobileBreakpoint) {
                    // 在桌面版，點擊帶有 submenu 的 a 連結不應該阻止預設行為 (因為 CSS 已經處理懸浮下拉)
                    // 但如果點擊的是 li.dropdown 本身，則不做任何處理
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
                 // 確保初始高度設定正確
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
                        requestAnimationFrame(() => {
                            currentContent.style.maxHeight = currentContent.scrollHeight + "px"; 
                        });
                    } else {
                        this.setAttribute('aria-expanded', 'false');
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
                         toggleAccordion.call(this);
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
        const lazyImages = document.querySelectorAll('img[data-src], source[data-srcset]');
        
        if (lazyImages.length > 0 && 'IntersectionObserver' in window) {
            const observerOptions = {
                rootMargin: '0px 0px 200px 0px' 
            };

            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        
                        if (target.tagName === 'IMG' && target.dataset.src) {
                            target.src = target.dataset.src;
                            target.alt = target.dataset.alt || target.alt || '網站圖片'; 
                            target.removeAttribute('data-src'); 
                            target.removeAttribute('data-alt');
                        }
                        
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
                    
                     const headerHeight = header ? header.offsetHeight : 0;
                     const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                     const targetPosition = targetTop - headerHeight;
                         
                     window.scrollTo({
                         top: Math.max(0, targetPosition), 
                         behavior: 'smooth'
                     });
                     
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
                
                if (Math.random() > 0.3) {
                     initialLeft = 105; 
                     initialTop = Math.random() * 80 - 20; 
                } else {
                     initialTop = -10; 
                     initialLeft = Math.random() * 105; 
                }

                meteor.style.left = `${initialLeft}vw`;
                meteor.style.top = `${initialTop}vh`;
                
                const rotation = Math.random() * 20 - 135; 
                const travelX = -(120 + Math.random() * 80); 
                const travelY = 80 + Math.random() * 80; 

                meteor.style.setProperty('--rotation', `${rotation}deg`);
                meteor.style.setProperty('--travel-x', `${travelX}vw`);
                meteor.style.setProperty('--travel-y', `${travelY}vh`);
                
                meteor.addEventListener('animationend', () => {
                     meteor.remove();
                     setTimeout(() => requestAnimationFrame(createMeteor), Math.random() * 4000 + 1000); 
                }, { once: true }); 

                meteor.style.animationName = 'shooting-star-random';
                meteor.style.animationDuration = `${duration}s`;
                meteor.style.animationDelay = `${delay}s`;
                meteor.style.animationTimingFunction = 'linear'; 
                meteor.style.pointerEvents = 'none'; 
                meteor.style.willChange = 'transform, opacity';

                heroSection.appendChild(meteor);
            }

            for (let i = 0; i < numMeteors; i++) {
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
                if (entry.isIntersecting && entry.intersectionRatio > 0) { 
                    const counter = entry.target;
                    const targetText = counter.dataset.count;
                    
                    const targetMatch = targetText.match(/^-?[\d\s,.]+/);
                    const target = targetMatch ? parseInt(targetMatch[0].replace(/[^0-9]/g, '')) : 0;

                    const suffixMatch = targetText.match(/[^0-9\s]+$/); 
                    const suffix = suffixMatch ? suffixMatch[0] : '';
                    
                    let current = 0;
                    const duration = 1500; 
                    const startTime = performance.now();

                    function animateCount(timestamp) {
                        const elapsed = timestamp - startTime;
                        const progress = Math.min(1, elapsed / duration);
                        current = target * progress;
                        
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
                if (counter.textContent && !counter.dataset.count) {
                    counter.dataset.count = counter.textContent; 
                }
                counter.textContent = '0'; 
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
                rootMargin: `0px 0px -${offset}px 0px`, 
                threshold: 0 
            });
            
            ctaObserver.observe(footer);
        }
        
        // ====================================================
        // 11. 輕微視差滾動效果 (Parallax Scroll) - 使用 RAF
        // ====================================================
        const parallaxElements = document.querySelectorAll('.parallax-layer'); 
        
        function handleParallax() {
            const scrolled = window.scrollY;
            
            parallaxElements.forEach(element => {
                const speed = parseFloat(element.dataset.speed) || 0.1; 
                const yPos = scrolled * speed;
                
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
                element.style.willChange = 'transform';
            });
        }
        
    })(); // IIFE 結束
});

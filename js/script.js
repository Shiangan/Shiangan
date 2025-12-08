/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.0 最終完整性與穩定版)
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    // **抗閃爍機制 (SEO/UX 優化)**
    document.body.classList.remove('js-loading');
    
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const mobileBreakpoint = 900; 
    const accordionContainer = document.querySelector('.accordion-container');
    const currentYearSpan = document.getElementById('current-year');
    
    // 輔助函數： Debounce (去抖動) - 優化性能
    function debounce(func, delay = 150) { // 延遲時間微調
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
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }
    
    // 輔助函數：處理 RWD 調整時的狀態清理
    function handleResizeCleanup() {
         if (window.innerWidth > mobileBreakpoint) {
             if (mainNav && mainNav.classList.contains('active')) {
                 
                 mainNav.classList.remove('active');
                 body.classList.remove('no-scroll');
                 
                 if (menuToggle) {
                     menuToggle.setAttribute('aria-expanded', 'false');
                     
                     // 避免在 resize 時重複呼叫 classList.replace() 造成錯誤
                     const menuIcon = menuToggle.querySelector('i');
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
                 closeAllMobileSubmenus(); 
             }
         }
    }
    
    // 註冊 Debounce 過後的 RWD 狀態清理事件
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
            body.classList.toggle('no-scroll'); 
            
            this.setAttribute('aria-expanded', isExpanded);
            
            if (menuIcon) {
                if (isExpanded) {
                    menuIcon.classList.replace('fa-bars', 'fa-times');
                    closeAllMobileSubmenus(); 
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
            if (window.innerWidth <= mobileBreakpoint) { 
                let targetLink = e.target.closest('#main-nav ul li.dropdown > a'); 

                if (targetLink) {
                    e.preventDefault(); 
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        closeAllMobileSubmenus(); 
                        parentLi.classList.add('active'); 
                    }
                }
            }
        });
    }

    // ====================================================
    // 4. 通用手風琴 (FAQ Accordion Component Logic) - 完整性強化
    // ====================================================
    if (accordionContainer) {
        
        // --- 核心優化：初始化 A11Y 與狀態 ---
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
             const header = item.querySelector('.accordion-header');
             const content = item.querySelector('.accordion-content');
             
             if (header && content) {
                 const uniqueId = `acc-item-${index}`;
                 content.id = `${uniqueId}-content`;
                 header.setAttribute('aria-controls', content.id);

                 const isActive = item.classList.contains('active');
                 
                 // 確保初始狀態的 max-height 是正確的 (使用 requestAnimationFrame 確保 DOM 穩定)
                 requestAnimationFrame(() => {
                     // 由於 CSS 使用 max-height: 0/auto 的平滑過渡，初始狀態必須精確設置
                     content.style.maxHeight = isActive ? content.scrollHeight + "px" : ''; // 展開時設為實際高度，收合時設為空字串或 0
                 });

                 header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                 header.setAttribute('role', 'button'); 
             }
        });

        // --- 點擊事件監聽 ---
        accordionContainer.addEventListener('click', function(e) {
            const header = e.target.closest('.accordion-header');
            
            if (header) {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isCurrentlyActive = item.classList.contains('active');
                
                // 關閉其他項目 (單開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                        activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    }
                });
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡 (使用 setTimeout 確保 CSS 讀取了 max-height: 0 的過渡起點)
                if (!isCurrentlyActive) {
                    // 展開時
                    header.setAttribute('aria-expanded', 'true');
                    // 核心強化: 設置高度前，使用 requestAnimationFrame 確保 scrollHeight 計算精確
                    requestAnimationFrame(() => {
                        content.style.maxHeight = content.scrollHeight + "px"; 
                    });
                } else {
                    // 收合時
                    header.setAttribute('aria-expanded', 'false');
                    // 核心強化: 必須先設定一個精確的高度值 ( content.scrollHeight )，
                    // 然後在下一個 tick 設為 0，才能觸發正確的收合動畫。
                    content.style.maxHeight = content.scrollHeight + "px";
                    setTimeout(() => {
                        content.style.maxHeight = 0;
                    }, 10); // 確保瀏覽器有時間讀取到正確的初始高度
                }
            }
        });
    }

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
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    } else {
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || img.alt || '';
        });
    }

    
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling) - 完整性強化
    // ====================================================
    if (header) { 
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 點擊錨點連結後，關閉手機菜單 (模擬點擊)
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         menuToggle.click(); 
                     }
                    
                     const headerHeight = header.offsetHeight;
                     
                     // **核心強化**: 檢查目標元素是否為頁面頂部 (e.g., #top 或第一個 section)
                     // 如果目標位置已經在視窗內，則無需考慮 headerHeight，直接滾動到目標頂部
                     const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
                     const targetPosition = targetTop - headerHeight;
                     
                     window.scrollTo({
                         // 使用 Math.max 確保滾動位置不會小於 0 (避免滾動到頁面頂部上方的負值)
                         top: Math.max(0, targetPosition),
                         behavior: 'smooth'
                     });
                }
            });
        });
    }
    
    // ====================================================
    // 7. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});

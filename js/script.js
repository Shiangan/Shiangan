/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V18.0 最終完善穩定版 - 兼顧性能與 RWD)
   ==================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ====================================================
    // 0. 初始設定與變數 (Initial Setup & Variables)
    // ====================================================
    
    // **抗閃爍機制 (SEO/UX 優化)**: 移除 body 上的 'js-loading' class，讓內容在 JS 準備好後才顯示，避免樣式閃爍。
    document.body.classList.remove('js-loading');
    
    const header = document.querySelector('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    const mobileBreakpoint = 900; 
    const accordionContainer = document.querySelector('.accordion-container');
    const currentYearSpan = document.getElementById('current-year');


    // 輔助函數：關閉所有手機子菜單 (清除 .active 類別)
    function closeAllMobileSubmenus() {
        document.querySelectorAll('#main-nav ul li.dropdown.active').forEach(li => {
            li.classList.remove('active');
        });
    }
    
    // 輔助函數：處理 RWD 調整時的狀態清理 (性能與穩定性關鍵)
    function handleResize() {
         if (window.innerWidth > mobileBreakpoint) {
             // 如果回到桌面版，確保手機選單關閉狀態被重置
             if (mainNav && mainNav.classList.contains('active')) {
                 mainNav.classList.remove('active');
                 // 確保無障礙標籤被重設
                 if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                 body.classList.remove('no-scroll');
                 // 確保手機子選單狀態被清空 (避免換回桌面版時，子選單卡住)
                 closeAllMobileSubmenus(); 
                 
                 // 確保圖示是 'fa-bars'
                 const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;
                 if (menuIcon) {
                     menuIcon.classList.remove('fa-times');
                     menuIcon.classList.add('fa-bars');
                 }
             }
         }
    }
    
    // 註冊 RWD 狀態清理事件
    window.addEventListener('resize', handleResize);


    // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    
    // 使用節流 (Throttling) 或被動事件 (Passive) 監聽，優化滾動性能 (SEO/UX 關鍵)
    function handleScroll() {
        if (header) {
            if (window.scrollY > 0) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    }
    
    if (header) {
        handleScroll(); 
        window.addEventListener('scroll', handleScroll, { passive: true }); // passive: true 提升滾動性能
    }
    
    // ====================================================
    // 2. RWD 手機菜單切換 (Hamburger Menu Toggle)
    // ====================================================
    if (menuToggle && mainNav) {
        const menuIcon = menuToggle.querySelector('i'); 

        menuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
            
            this.setAttribute('aria-expanded', !isExpanded);
            mainNav.classList.toggle('active'); 
            body.classList.toggle('no-scroll'); 
            
            // 核心邏輯：切換圖示 Class (fa-bars <-> fa-times)
            if (menuIcon) {
                if (!isExpanded) {
                    // 開啟選單
                    menuIcon.classList.remove('fa-bars');
                    menuIcon.classList.add('fa-times');
                    closeAllMobileSubmenus(); 
                } else {
                    // 關閉選單
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
        });
    }

    // ====================================================
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    //    點擊下拉連結，切換 .active 類別，CSS 處理平滑展開動畫
    // ====================================================
    if (mainNav) {
        mainNav.addEventListener('click', function(e) {
            // 確保只在手機尺寸下運作
            if (window.innerWidth <= mobileBreakpoint) { 
                let targetLink = e.target.closest('#main-nav ul li.dropdown > a'); 

                if (targetLink) {
                    e.preventDefault(); 
                    
                    const parentLi = targetLink.closest('li.dropdown');
                    
                    if (parentLi.classList.contains('active')) {
                        // 如果已經展開，則收合
                        parentLi.classList.remove('active');
                    } else {
                        // 如果是收合，則先關閉其他已展開的選單，再展開自己
                        closeAllMobileSubmenus(); 
                        parentLi.classList.add('active'); 
                    }
                }
            }
        });
    }

    // ====================================================
    // 4. 通用手風琴 (FAQ Accordion Component Logic)
    //    使用 scrollHeight 實現精準的展開動畫 (UX 優化)
    // ====================================================
    if (accordionContainer) {
        
        // --- 初始化 A11Y 與狀態 ---
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
             const header = item.querySelector('.accordion-header');
             const content = item.querySelector('.accordion-content');
             
             if (header && content) {
                 const uniqueId = `acc-item-${index}`;
                 content.id = `${uniqueId}-content`;
                 header.setAttribute('aria-controls', content.id);

                 const isActive = item.classList.contains('active');
                 
                 // 設置初始 max-height，確保展開時高度正確
                 const contentHeight = content.scrollHeight; 
                 content.style.maxHeight = isActive ? contentHeight + "px" : 0;
                 
                 header.setAttribute('aria-expanded', isActive ? 'true' : 'false');
                 header.setAttribute('tabindex', '0'); 
             }
        });

        // --- 點擊事件監聽 ---
        accordionContainer.addEventListener('click', function(e) {
            const header = e.target.closest('.accordion-header');
            
            if (header) {
                const item = header.closest('.accordion-item');
                const content = item.querySelector('.accordion-content');
                const isCurrentlyActive = item.classList.contains('active');
                
                // 關閉其他項目 (預設單開模式)
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        activeItem.classList.remove('active');
                        activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                        activeItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    }
                });
                
                // 2. 切換當前項目的狀態
                item.classList.toggle('active');

                // 3. 實作平滑過渡
                if (!isCurrentlyActive) {
                    // 展開時：將 max-height 設為實際內容高度
                    content.style.maxHeight = content.scrollHeight + "px"; 
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    // 收合時：將 max-height 設為 0
                    content.style.maxHeight = 0;
                    header.setAttribute('aria-expanded', 'false');
                }
            }
        });
    }

    // ====================================================
    // 5. 圖片延遲載入 (Image Lazy Loading)
    //    提高網頁初始載入速度 (Lighthouse/Core Web Vitals 關鍵優化)
    // ====================================================
    if ('IntersectionObserver' in window) {
        const lazyImages = document.querySelectorAll('img[data-src]');
        const observerOptions = {
            // 提前 200px 載入，提升用戶體驗
            rootMargin: '0px 0px 200px 0px' 
        };

        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src'); 
                    }
                    
                    if (img.dataset.alt) {
                        // 處理 data-alt，確保圖片具有 alt 屬性 (SEO/A11Y 關鍵)
                        img.alt = img.dataset.alt;
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
        // 瀏覽器不支援 IntersectionObserver 時的備用方案
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.dataset.src;
            img.alt = img.dataset.alt || ''; // 確保 alt 屬性存在
        });
    }

    
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    //    增加導覽列的連結處理邏輯 (UX 優化)
    // ====================================================
    if (header) { 
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                if (this.getAttribute('href') === '#') return;
                
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                     // 點擊錨點連結後，關閉手機菜單 (模擬點擊，會觸發圖示切換)
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         menuToggle.click(); 
                     }
                    
                     // 考慮 Header 的高度，確保錨點不會被黏性 Header 遮蓋
                     const headerHeight = header.offsetHeight;
                     const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                     window.scrollTo({
                         top: targetPosition,
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
        const currentYear = new Date().getFullYear();
        currentYearSpan.textContent = currentYear;
    }
});

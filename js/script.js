/* ====================================================
   程式夥伴 - 網站核心 JavaScript (V20.8 最終聯動修正版 - 完整優化)
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
    
    // 圖片延遲載入的選擇器
    const lazyImages = document.querySelectorAll('img[data-src]');


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
                const submenu = li.querySelector('.submenu');
                li.classList.remove('active');
                // 確保內聯樣式也被清理，以配合 CSS 過渡
                if (submenu) {
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
                     if (menuIcon && menuIcon.classList.contains('fa-times')) {
                         menuIcon.classList.replace('fa-times', 'fa-bars');
                     }
                 }
             }
             // 無論導航列是否 active，都要清理所有 dropdown active 狀態，防止佈局錯誤
             closeAllMobileSubmenus();

             // 窗口調整時，重新計算 FAQ 的 max-height
             document.querySelectorAll('.accordion-item.active').forEach(item => {
                 const content = item.querySelector('.accordion-content');
                 if (content) {
                     // 確保內容能完整顯示
                     content.style.maxHeight = 'fit-content';
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
            // 使用 requestAnimationFrame 優化視覺更新
            requestAnimationFrame(() => {
                 header.classList.toggle('scrolled', window.scrollY > 0);
            });
        }
    }

    if (header) {
        updateHeaderScrollClass();
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 50), { passive: true });
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
                    // 關閉主選單時，收合所有子菜單，確保視覺一致性
                    closeAllMobileSubmenus(); 
                }
            }
        });
    }

    // ====================================================
    // 3. 響應式導航手風琴選單 (Mobile Navigation Accordion)
    // ====================================================
    if (mainNav) {
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', function(e) {
                // 僅在手機模式下，且主菜單展開時觸發手風琴邏輯
                if (window.innerWidth <= mobileBreakpoint) {
                    e.preventDefault();

                    const parentLi = targetLink.closest('li.dropdown');
                    const submenu = parentLi.querySelector('.submenu');

                    const isCurrentlyActive = parentLi.classList.contains('active');

                    // 1. 關閉所有其他項目 (單一展開模式)
                    closeAllMobileSubmenus();

                    // 2. 切換當前項目的狀態
                    if (!isCurrentlyActive) {
                        parentLi.classList.add('active');
                        // 關鍵：手動計算並設定 max-height
                        if (submenu) {
                            // 暫時將 max-height 設置為 fit-content 以獲得準確的 scrollHeight
                            submenu.style.maxHeight = 'fit-content';
                            const height = submenu.scrollHeight;
                            submenu.style.maxHeight = `${height}px`;
                        }
                    } else {
                         // 重複點擊已打開的項目，在 closeAllMobileSubmenus 中已經被關閉
                         if (submenu) submenu.style.maxHeight = '0px';
                    }
                }
            });
        });

        // 點擊菜單中的連結後，自動關閉主菜單
        mainNav.querySelectorAll('a').forEach(link => {
             // 排除作為手風琴開關的父連結
             if (!link.closest('.dropdown')) {
                 link.addEventListener('click', () => {
                     // 確保在滾動前關閉主菜單
                     if (window.innerWidth <= mobileBreakpoint && mainNav.classList.contains('active')) {
                         menuToggle.click(); // 模擬點擊漢堡按鈕關閉選單
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
                        otherContent.style.maxHeight = '0px';
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
                        content.style.maxHeight = 'fit-content';
                        const height = content.scrollHeight;
                        content.style.maxHeight = `${height}px`;
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
    // 5. 圖片延遲載入 (Image Lazy Loading) - 完整實作
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
        }
    }

    if ('IntersectionObserver' in window) {
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
    } else {
        // Fallback for older browsers (直接載入所有圖片，犧牲性能)
        lazyImages.forEach(loadImage);
    }
    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // **修正：避免在非手機模式下不必要的延遲**
    // ====================================================
    if (header) {
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.dropdown > a)').forEach(anchor => {
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
                    
                    // 延遲關閉手機菜單
                    if (isMobileMenuOpen) {
                         setTimeout(() => menuToggle.click(), 350); 
                    }
                }
            });
        });
    }


    // ====================================================
    // 7. 動態生成不規則流星 (Meteor Generation Logic)
    // **優化：使用 CSS 無限循環動畫，減少 DOM 銷毀與創建**
    // ====================================================
    const heroSection = document.querySelector('.hero-section');

    if (heroSection) {
        const numMeteors = 15;
        
        // 只在初始化時運行一次，創建所有流星
        function initializeMeteors() {
            for (let i = 0; i < numMeteors; i++) {
                // 使用 setTimeout 錯開初始延遲
                setTimeout(() => createMeteor(), Math.random() * 5000); 
            }
        }

        function createMeteor() {
            const meteor = document.createElement('div');
            meteor.classList.add('meteor');

            // 速度 (持續時間)
            const duration = Math.random() * 10 + 10; // 10s 到 20s
            const delay = Math.random() * 8; // 初始延遲

            // 核心邏輯 1：定義「從右上方進入」
            let initialLeft, initialTop;
            if (Math.random() > 0.4) {
                 initialLeft = 105;
                 initialTop = Math.random() * 80 - 20;
            } else {
                 initialTop = -10;
                 initialLeft = Math.random() * 105;
            }

            meteor.style.left = `${initialLeft}vw`;
            meteor.style.top = `${initialTop}vh`;

            // 尺寸隨機性
            const size = Math.random() * 2 + 2;
            meteor.style.width = `${size}px`;
            meteor.style.height = `${size}px`;

            // 核心邏輯 2：鎖定「向左下方移動」
            const rotation = Math.random() * 20 - 135;
            const travelX = -(120 + Math.random() * 80);
            const travelY = 80 + Math.random() * 80;

            // 將參數設定為 CSS 變數
            meteor.style.setProperty('--rotation', `${rotation}deg`);
            meteor.style.setProperty('--travel-x', `${travelX}vw`);
            meteor.style.setProperty('--travel-y', `${travelY}vh`);

            // 應用動畫屬性
            meteor.style.animationName = 'shooting-star-random';
            meteor.style.animationDuration = `${duration}s`;
            meteor.style.animationDelay = `${delay}s`;
            meteor.style.animationTimingFunction = 'linear';
            meteor.style.animationIterationCount = 'infinite'; // 關鍵：讓動畫無限循環
            meteor.style.pointerEvents = 'none';

            heroSection.appendChild(meteor);
        }
        
        initializeMeteors(); 
    }

    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year) - 完整實作
    // **優化：使用 textContent 以提升安全性**
    // ====================================================
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getUTCFullYear();
    }

    // ====================================================
    // 9. 移除初始載入類別 (FOUC 修正)
    // ====================================================
    // 確保頁面載入完成後移除 js-loading 類別，防止閃爍
    const loadingElement = document.querySelector('.js-loading');
    if (loadingElement) {
        loadingElement.classList.remove('js-loading');
    }
});

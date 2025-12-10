   // ====================================================
    // 1. Header & 滾動樣式處理 (Sticky Header & Scroll Class)
    // ====================================================
    function updateHeaderScrollClass() {
        if (header) {
            header.classList.toggle('scrolled', window.scrollY > 0);
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
        // 確保點擊的是下拉菜單的父連結
        mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
            targetLink.addEventListener('click', function(e) {
                if (window.innerWidth <= mobileBreakpoint) {
                    // 阻止默認行為，例如導航到 services.html
                    e.preventDefault();

                    const parentLi = targetLink.closest('li.dropdown');

                    if (parentLi.classList.contains('active')) {
                        parentLi.classList.remove('active');
                    } else {
                        closeAllMobileSubmenus();
                        parentLi.classList.add('active');
                    }
                }
            });
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

                // 1. 關閉所有其他項目
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
    // 5. 圖片延遲載入 (Image Lazy Loading)
    // ====================================================
    // 由於您的 HTML 中未使用 data-src，此處保留 IntersectionObserver 的標準實現，
    // 以便未來使用 <img data-src="xxx" class="lazy-image"> 時能啟用。
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
                        img.classList.add('lazy-loaded');
                    }

                    observer.unobserve(img);
                }
            });
        }, observerOptions);

        lazyImages.forEach(function(img) {
            imageObserver.observe(img);
        });
    }


    // ====================================================
    // 6. 平滑滾動至錨點 (Smooth Scrolling)
    // ====================================================
    if (header) {
        document.querySelectorAll('a[href^="#"]:not([href="#"]):not(.dropdown > a)').forEach(anchor => {
            anchor.addEventListener('click', function (e) {

                e.preventDefault();

                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                     // 延遲關閉手機菜單，讓滾動計算在菜單關閉後發生
                     if (mainNav && menuToggle && mainNav.classList.contains('active')) {
                         setTimeout(() => menuToggle.click(), 350);
                     }

                     if (typeof window.scrollTo === 'function' && targetElement.getBoundingClientRect) {

                         const headerHeight = header.offsetHeight;
                         const targetTop = targetElement.getBoundingClientRect().top + window.scrollY;
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

            // 將參數設定為 CSS 變數
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
            meteor.style.pointerEvents = 'none';

            heroSection.appendChild(meteor);
        }

        // 初始生成指定數量的流星
        for (let i = 0; i < numMeteors; i++) {
            // 隨機延遲，避免流星同時出現
            setTimeout(createMeteor, Math.random() * 5000);
        }
    }


    // ====================================================
    // 8. 自動更新版權年份 (Footer Copyright Year)
    // ====================================================
    if (currentYearSpan) {
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

    // 檢查是否有里程碑計數器元素
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


/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script)
 * 完整、模組化、高性能、RWD & A11Y 優化版。
 * ====================================================================
 */

'use strict';

(function () {

    // ====================================================
    // 0. 環境設定與常量
    // ====================================================
    const MOBILE_BREAKPOINT = 900;
    const SCROLL_THRESHOLD = 10;
    const LAZY_LOAD_ROOT_MARGIN = '0px 0px 200px 0px';
    const RWD_TRANSITION_DURATION_MS = 400;
    const FIT_TEXT_SELECTOR = '.text-line-container span';
    const AOS_ROOT_MARGIN = '0px 0px -15% 0px';
    const FOUC_TIMEOUT_MS = 3000;

    const header = document.querySelector('.site-header, .main-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const body = document.body;
    const backToTopButton = document.querySelector('.back-to-top');

    // ====================================================
    // A. 輔助函數
    // ====================================================

    const onTransitionEndCleanup = (contentElement) => {
        const handleTransitionEnd = (e) => {
            if (e.target !== contentElement || e.propertyName !== 'max-height') return;
            const parent = contentElement.closest('.active, .expanded');
            const isExpanded = parent && window.getComputedStyle(contentElement).maxHeight !== '0px';
            if (!isExpanded) {
                contentElement.style.removeProperty('max-height');
                contentElement.style.removeProperty('overflow');
            }
            contentElement.removeEventListener('transitionend', handleTransitionEnd);
        };
        contentElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
    };

    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        let lastArgs, lastThis;
        const run = () => {
            timeoutId = setTimeout(() => {
                requestAnimationFrame(() => func.apply(lastThis, lastArgs));
                timeoutId = null;
            }, delay);
        };
        return function (...args) {
            lastArgs = args;
            lastThis = this;
            if (timeoutId) clearTimeout(timeoutId);
            run();
        };
    };
    const debounceFitText = (func) => debounce(func, 100);

    const isMobileView = () => window.innerWidth <= MOBILE_BREAKPOINT;

    // ====================================================
    // B. FOUC 處理
    // ====================================================
    const removeLoadingClass = () => {
        requestAnimationFrame(() => {
            document.documentElement.classList.remove('js-loading');
            document.body.classList.remove('js-loading');
        });
    };
    document.addEventListener('DOMContentLoaded', removeLoadingClass, { once: true });
    window.addEventListener('load', removeLoadingClass, { once: true });
    setTimeout(removeLoadingClass, FOUC_TIMEOUT_MS);

    // ====================================================
    // C. 導航菜單模組
    // ====================================================

    const closeAllMobileSubmenus = () => {
        if (mainNav) {
            Array.from(mainNav.querySelectorAll('li.dropdown.active')).forEach(li => {
                const submenu = li.querySelector('.submenu-container, .submenu');
                const targetLink = li.querySelector('a');
                if (submenu && targetLink) {
                    li.classList.remove('active');
                    targetLink.setAttribute('aria-expanded', 'false');
                    if (submenu.style.maxHeight && submenu.style.maxHeight !== '0px') {
                        submenu.style.maxHeight = `${submenu.scrollHeight}px`;
                        requestAnimationFrame(() => submenu.style.maxHeight = '0px');
                        onTransitionEndCleanup(submenu);
                    }
                }
            });
        }
    };

    const closeMainMenu = () => {
        if (mainNav?.classList.contains('active')) {
            mainNav.classList.remove('active');
            if (menuToggle) {
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                const menuIcon = menuToggle.querySelector('i');
                if (menuIcon) {
                    menuIcon.classList.remove('fa-times');
                    menuIcon.classList.add('fa-bars');
                }
            }
            body.classList.remove('no-scroll');
            closeAllMobileSubmenus();
        }
    };

    const handleHeaderScroll = () => {
        const updateHeaderScrollClass = () => {
            const scrollY = window.scrollY;
            if (header) header.classList.toggle('scrolled', scrollY > SCROLL_THRESHOLD);
            if (backToTopButton) backToTopButton.classList.toggle('show', scrollY > 300);
        };
        updateHeaderScrollClass();
        window.addEventListener('scroll', debounce(updateHeaderScrollClass, 10), { passive: true });
    };

    const setupRwdMenuToggle = () => {
        if (menuToggle && mainNav) {
            const menuIcon = menuToggle.querySelector('i');
            menuToggle.addEventListener('click', function () {
                const isExpanded = mainNav.classList.contains('active');
                if (!isExpanded) {
                    mainNav.classList.add('active');
                    this.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                    if (menuIcon) menuIcon.classList.replace('fa-bars', 'fa-times');
                    if (isMobileView()) body.classList.add('no-scroll');
                } else {
                    closeMainMenu();
                }
            });

            document.addEventListener('click', (e) => {
                const target = e.target;
                if (isMobileView() && mainNav.classList.contains('active') &&
                    !mainNav.contains(target) && !menuToggle.contains(target)) {
                    closeMainMenu();
                }
            });
        }
    };

    const setupMobileAccordion = () => {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown > a').forEach(targetLink => {
                targetLink.addEventListener('click', (e) => {
                    const parentLi = targetLink.closest('li.dropdown');
                    if (!parentLi || !isMobileView()) return;
                    const submenu = parentLi.querySelector('.submenu-container, .submenu');
                    if (!submenu) return;

                    e.preventDefault();
                    const isCurrentlyActive = parentLi.classList.contains('active');
                    closeAllMobileSubmenus();
                    if (!isCurrentlyActive) {
                        parentLi.classList.add('active');
                        targetLink.setAttribute('aria-expanded', 'true');
                        submenu.style.maxHeight = '0px';
                        void submenu.offsetHeight;
                        requestAnimationFrame(() => submenu.style.maxHeight = `${submenu.scrollHeight}px`);
                        setTimeout(() => onTransitionEndCleanup(submenu), RWD_TRANSITION_DURATION_MS);
                    }
                });
            });
        }
    };

    const setupDesktopA11y = () => {
        if (mainNav) {
            mainNav.querySelectorAll('li.dropdown').forEach(dropdown => {
                dropdown.addEventListener('focusin', function () {
                    if (!isMobileView()) this.classList.add('focus-within');
                });
                dropdown.addEventListener('focusout', function () {
                    setTimeout(() => {
                        if (!isMobileView() && !this.contains(document.activeElement)) {
                            this.classList.remove('focus-within');
                        }
                    }, 0);
                });
            });
        }
    };

    const handleResizeCleanup = (fitAllFunction) => {
        if (!isMobileView()) closeMainMenu();
        mainNav?.querySelectorAll('.dropdown').forEach(dropdown => {
            const submenu = dropdown.querySelector('.submenu-container, .submenu');
            if (submenu) {
                submenu.style.removeProperty('max-height');
                submenu.style.removeProperty('overflow');
            }
        });
        setTimeout(() => {
            document.querySelectorAll('.accordion-item.active .accordion-content, .plan-card.expanded .plan-details-expanded')
                .forEach(content => {
                    if (content.style.maxHeight && content.style.maxHeight !== '0px') {
                        requestAnimationFrame(() => content.style.maxHeight = `${content.scrollHeight}px`);
                    }
                });
        }, 100);
        if (typeof fitAllFunction === 'function') fitAllFunction();
    };

    // ====================================================
    // D. 互動組件
    // ====================================================

    const setupAccordion = () => {
        document.querySelectorAll('.accordion-item').forEach((item, index) => {
            const headerElement = item.querySelector('.accordion-title');
            const content = item.querySelector('.accordion-content');
            if (!headerElement || !content) return;

            const uniqueId = `faq-item-${index}`;
            content.id = `${uniqueId}-content`;
            headerElement.setAttribute('aria-controls', content.id);
            const isActive = item.classList.contains('active');
            headerElement.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            content.style.display = 'block';
            content.style.overflow = 'hidden';
            content.style.maxHeight = isActive ? `${content.scrollHeight}px` : '0px';
            if (isActive) content.style.removeProperty('overflow');

            headerElement.addEventListener('click', function () {
                const isCurrentlyActive = item.classList.contains('active');
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    if (activeItem !== item) {
                        const otherContent = activeItem.querySelector('.accordion-content');
                        const otherHeader = activeItem.querySelector('.accordion-title');
                        activeItem.classList.remove('active');
                        if (otherHeader) otherHeader.setAttribute('aria-expanded', 'false');
                        if (otherContent) {
                            otherContent.style.overflow = 'hidden';
                            otherContent.style.maxHeight = `${otherContent.scrollHeight}px`;
                            requestAnimationFrame(() => otherContent.style.maxHeight = '0px');
                            onTransitionEndCleanup(otherContent);
                        }
                    }
                });

                item.classList.toggle('active', !isCurrentlyActive);
                this.setAttribute('aria-expanded', (!isCurrentlyActive).toString());
                if (!isCurrentlyActive) {
                    content.style.maxHeight = '0px';
                    void content.offsetHeight;
                    content.style.overflow = 'hidden';
                    requestAnimationFrame(() => {
                        content.style.maxHeight = `${content.scrollHeight}px`;
                        onTransitionEndCleanup(content);
                    });
                } else {
                    content.style.overflow = 'hidden';
                    content.style.maxHeight = `${content.scrollHeight}px`;
                    requestAnimationFrame(() => content.style.maxHeight = '0px');
                    onTransitionEndCleanup(content);
                }
            });

            headerElement.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
        });
    };

    const toggleDetails = (button) => {
        const card = button.closest('.plan-card');
        const details = card?.querySelector('.plan-details-expanded');
        if (!card || !details) return;

        const isExpanded = card.classList.contains('expanded');
        card.classList.toggle('expanded', !isExpanded);

        const icon = button.querySelector('i');
        const newText = !isExpanded ? '收起完整細項 ' : '查看完整細項 ';
        button.setAttribute('aria-expanded', (!isExpanded).toString());

        if (icon) {
            button.textContent = newText;
            icon.classList.replace(isExpanded ? 'fa-chevron-up' : 'fa-chevron-down', !isExpanded ? 'fa-chevron-up' : 'fa-chevron-down');
            button.appendChild(icon);
        } else button.textContent = newText;

        if (!isExpanded) {
            details.style.maxHeight = '0px';
            void details.offsetHeight;
            details.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                details.style.maxHeight = `${details.scrollHeight}px`;
                onTransitionEndCleanup(details);
            });
        } else {
            details.style.overflow = 'hidden';
            details.style.maxHeight = `${details.scrollHeight}px`;
            requestAnimationFrame(() => details.style.maxHeight = '0px');
            onTransitionEndCleanup(details);
        }
    };
    if (typeof window.toggleDetails === 'undefined') window.toggleDetails = toggleDetails;

    // ====================================================
    // E. Lazy Load
    // ====================================================
    const setupLazyLoading = () => {
        const lazyTargets = document.querySelectorAll('img[data-src], source[data-srcset], picture');
        const loadImage = (el) => {
            if (el.classList.contains('loaded')) return;
            if (el.tagName === 'IMG') {
                const imgEl = el;
                if (imgEl.dataset.src) { imgEl.src = imgEl.dataset.src; imgEl.removeAttribute('data-src'); }
                if (imgEl.dataset.srcset) { imgEl.srcset = imgEl.dataset.srcset; imgEl.removeAttribute('data-srcset'); }
                imgEl.classList.add('loaded');
            } else if (el.tagName === 'SOURCE') {
                const sourceEl = el;
                if (sourceEl.dataset.srcset) { sourceEl.srcset = sourceEl.dataset.srcset; sourceEl.removeAttribute('data-srcset'); }
            }
        };
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        if (element.tagName === 'PICTURE') {
                            element.querySelectorAll('source[data-srcset], img[data-src]').forEach(loadImage);
                            const img = element.querySelector('img');
                            if (img) loadImage(img);
                        } else loadImage(element);
                        obs.unobserve(element);
                    }
                });
            }, { root: null, rootMargin: LAZY_LOAD_ROOT_MARGIN, threshold: 0.01 });
            lazyTargets.forEach(el => observer.observe(el));
        } else {
            lazyTargets.forEach(loadImage);
        }
    };

    // ====================================================
    // F. Fit Text
    // ====================================================
    let fitAllTexts;
    const setupFitText = () => {
        const MAX_FONT = 22, MIN_FONT = 8, PRECISION = 0.1;
        const fitOne = (el) => {
            const parentWidth = el.parentElement?.offsetWidth || 0;
            const text = el.textContent?.trim() || '';
            if (parentWidth <= 50 || text === '' || !el.parentElement) { el.style.fontSize = `${MAX_FONT}px`; return; }
            let low = MIN_FONT, high = MAX_FONT, bestSize = MIN_FONT, iterations = 0;
            while (low <= high && iterations < 20) {
                const mid = (low + high) / 2;
                el.style.fontSize = `${mid}px`;
                if (el.scrollWidth <= parentWidth) { bestSize = mid; low = mid + PRECISION; } else high = mid - PRECISION;
                iterations++;
            }
            el.style.fontSize = `${Math.min(bestSize, MAX_FONT)}px`;
        };
        const fitAll = () => {
            const nodes = document.querySelectorAll(FIT_TEXT_SELECTOR);
            requestAnimationFrame(() => nodes.forEach(fitOne));
        };
        const debounceFunc = debounceFitText(fitAll);
        const start = () => {
            fitAll();
            if (window.ResizeObserver) {
                const observer = new ResizeObserver(entries => {
                    if (entries.some(e => e.contentRect.width > 0)) debounceFunc();
                });
                const observedParents = new Set();
                document.querySelectorAll(FIT_TEXT_SELECTOR).forEach(el => {
                    const parent = el.parentElement;
                    if (parent && !observedParents.has(parent)) { observer.observe(parent); observedParents.add(parent); }
                });
            } else window.addEventListener('resize', debounceFunc);
        };
        if (document.fonts?.ready) document.fonts.ready.then(start).catch(start); else window.addEventListener('load', start);
        fitAllTexts = fitAll;
        return fitAll;
    };

    // ====================================================
    // G. Smooth Scroll & Forms & Footer
    // ====================================================
    const setupSmoothScrolling = () => {
        if (!header) return;
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId || '');
                if (targetElement) {
                    e.preventDefault();
                    requestAnimationFrame(() => {
                        if ('scrollBehavior' in document.documentElement.style) {
                            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        } else {
                            const targetTop = Math.max(0, targetElement.getBoundingClientRect().top + window.scrollY - (header.offsetHeight || 0));
                            window.scrollTo({ top: targetTop, behavior: 'smooth' });
                        }
                        if (mainNav?.classList.contains('active')) setTimeout(closeMainMenu, RWD_TRANSITION_DURATION_MS + 50);
                    });
                }
            });
        });
        if (backToTopButton) backToTopButton.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    };

    const setupFormSubmission = () => {
        const form = document.getElementById('product-order-form');
        const statusMessage = document.getElementById('form-status-message');
        if (!form) return;
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitButton = this.querySelector('button[type="submit"]');
            if (!submitButton) return;
            const originalText = submitButton.textContent;
            submitButton.textContent = '送出中... 請稍候';
            submitButton.disabled = true;
            if (statusMessage) statusMessage.textContent = '';
            this.classList.add('is-loading');
            const cleanup = (success = false) => {
                const delay = success ? 5000 : 50;
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    this.classList.remove('is-loading');
                    if (statusMessage && !success) statusMessage.textContent = '';
                }, delay);
            };
            try {
                if (form.action.includes('your_form_endpoint')) {
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 請先替換表單 action URL！'; }
                    cleanup(); return;
                }
                const formData = new FormData(this);
                const response = await fetch(this.action, { method: this.method, body: formData, headers: { 'Accept': 'application/json' } });
                if (response.ok) {
                    if (statusMessage) { statusMessage.style.color = '#28a745'; statusMessage.textContent = '🎉 訂購資訊已成功送出！'; }
                    this.reset(); submitButton.textContent = '訂購成功！'; cleanup(true);
                } else {
                    const errorData = await response.json().catch(() => ({ error: '伺服器響應格式錯誤或非 JSON' }));
                    if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = `❗ ${errorData.error || '表單送出失敗'}，請直接撥打 24H 專線訂購：0978-583-699`; }
                    cleanup();
                }
            } catch (err) {
                console.error(err);
                if (statusMessage) { statusMessage.style.color = '#dc3545'; statusMessage.textContent = '❗ 網路錯誤或伺服器無回應，請直接撥打 24H 專線訂購：0978-583-699'; }
                cleanup();
            }
        });
    };

    const updateCopyrightYear = () => {
        const currentYearSpan = document.getElementById('current-year');
        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear().toString();
    };

    // ====================================================
    // H. AOS
    // ====================================================
    const setupAos = () => {
        const aosElements = document.querySelectorAll('.animate-on-scroll');
        if ('IntersectionObserver' in window && aosElements.length) {
            const observer = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => { if (entry.isIntersecting) { requestAnimationFrame(() => entry.target.classList.add('is-visible')); obs.unobserve(entry.target); } });
            }, { root: null, rootMargin: AOS_ROOT_MARGIN, threshold: 0.01 });
            aosElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) requestAnimationFrame(() => el.classList.add('is-visible'));
                else observer.observe(el);
            });
        } else aosElements.forEach(el => requestAnimationFrame(() => el.classList.add('is-visible')));
    };

    // ====================================================
    // I. 初始化
    // ====================================================
    document.addEventListener('DOMContentLoaded', () => {
        handleHeaderScroll();
        setupRwdMenuToggle();
        setupDesktopA11y();
        setupMobileAccordion();
        setupAccordion();
        setupSmoothScrolling();
        setupFormSubmission();
        updateCopyrightYear();
        setupLazyLoading();
        fitAllTexts = setupFitText();
        setupAos();
        window.addEventListener('resize', () => handleResizeCleanup(fitAllTexts));
    });

})();

/* ═══════════════════════════════════════════════════
   js/script.js — 祥安生命全站 JavaScript
   修正版 2026-04
   ─────────────────────────────────────────────────
   包含：
     1. FAQ 手風琴展開（支援 h3/h4 切換按鈕）
     2. Reveal 捲動動畫（IntersectionObserver）
     3. Header 捲動縮小效果
     4. 年份自動更新
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    /* ── 1. FAQ 手風琴 ─────────────────────── */
    function initFAQ() {
        var faqItems = document.querySelectorAll('.faq-item');
        if (!faqItems.length) return;

        faqItems.forEach(function (item) {
            var btn = item.querySelector('.faq-toggle');
            if (!btn) return;

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                var isActive = item.classList.contains('active');

                // 手風琴：關閉其他所有開啟項目
                faqItems.forEach(function (other) {
                    other.classList.remove('active');
                    var icon = other.querySelector('.faq-icon');
                    if (icon) icon.setAttribute('aria-hidden', 'true');
                    var toggle = other.querySelector('.faq-toggle');
                    if (toggle) toggle.setAttribute('aria-expanded', 'false');
                });

                // 若原本是關閉的，則開啟
                if (!isActive) {
                    item.classList.add('active');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    /* ── 2. Reveal 捲動動畫 ────────────────── */
    function initReveal() {
        var revealEls = document.querySelectorAll('.reveal');
        if (!revealEls.length) return;

        // 不支援 IntersectionObserver 的舊瀏覽器：直接顯示
        if (!('IntersectionObserver' in window)) {
            revealEls.forEach(function (el) {
                el.classList.add('revealed');
            });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target); // 觸發後停止觀察
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px'
        });

        revealEls.forEach(function (el) {
            observer.observe(el);
        });
    }

    /* ── 3. Header 捲動縮小 ────────────────── */
    function initHeaderScroll() {
        var header = document.querySelector('.main-header');
        if (!header) return;

        var lastY = 0;
        var ticking = false;

        window.addEventListener('scroll', function () {
            lastY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(function () {
                    if (lastY > 80) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    /* ── 4. 年份自動更新 ───────────────────── */
    function initYear() {
        var yearEl = document.getElementById('current-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    /* ── 5. 手機選單切換 ───────────────────── */
    function initMobileMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var nav    = document.getElementById('main-nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            var isExpanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isExpanded));
            nav.classList.toggle('is-open');
        });

        // 點擊外部關閉選單
        document.addEventListener('click', function (e) {
            if (nav.classList.contains('is-open') &&
                !nav.contains(e.target) &&
                !toggle.contains(e.target)) {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* ── DOMContentLoaded 統一啟動 ─────────── */
    document.addEventListener('DOMContentLoaded', function () {
        initFAQ();
        initReveal();
        initHeaderScroll();
        initYear();
        initMobileMenu();
    });

}());

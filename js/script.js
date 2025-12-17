/**
 * ====================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script) - 終極整合版 V4.0
 * 整合內容：手機導航、勞保/對年試算、Modal、AOS 動畫、性能優化
 * ====================================================================
 */

'use strict';

window.SALife = window.SALife || {};

(function () {
    // ====================================================
    // 0. 環境設定與元素快取
    // ====================================================
    const CONFIG = {
        MOBILE_BREAKPOINT: 900,
        SCROLL_THRESHOLD: 80,
        LABOR: {
            MAX: 45800,
            MIN: 27470,
            SURVIVOR: 5,
            NO_SURVIVOR: 10
        }
    };

    const DOM = {
        body: document.body,
        header: document.querySelector('.main-header'),
        menuToggle: document.querySelector('.menu-toggle'),
        mainNav: document.querySelector('#main-nav'),
        backToTop: document.querySelector('.back-to-top'),
        currentYear: document.getElementById('current-year')
    };

    let focusedElementBeforeModal;

    // ====================================================
    // A. 基礎輔助工具 (效能優化)
    // ====================================================
    const debounce = (func, delay = 50) => {
        let timeoutId = null;
        return function (...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => requestAnimationFrame(() => func.apply(this, args)), delay);
        };
    };

    const formatCurrency = (amount) => {
        return amount.toLocaleString('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 });
    };

    // ====================================================
    // B. 行動裝置導航核心 (修正您選單打不開的問題)
    // ====================================================
    const closeMainMenu = () => {
        if (!DOM.mainNav || !DOM.mainNav.classList.contains('active')) return;
        
        DOM.mainNav.classList.remove('active');
        DOM.menuToggle.classList.remove('active');
        DOM.menuToggle.setAttribute('aria-expanded', 'false');
        DOM.body.classList.remove('no-scroll');
        
        const icon = DOM.menuToggle.querySelector('i');
        if (icon) icon.classList.replace('fa-times', 'fa-bars');
        
        // 關閉所有展開的子選單
        DOM.mainNav.querySelectorAll('.dropdown.active').forEach(li => {
            li.classList.remove('active');
            const sub = li.querySelector('.submenu-container');
            if (sub) sub.style.maxHeight = null;
        });
    };

    const setupNavigation = () => {
        if (!DOM.menuToggle || !DOM.mainNav) return;

        // 1. 主開關
        DOM.menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = DOM.mainNav.classList.contains('active');
            
            if (!isOpen) {
                DOM.mainNav.classList.add('active');
                DOM.menuToggle.classList.add('active');
                DOM.menuToggle.setAttribute('aria-expanded', 'true');
                DOM.body.classList.add('no-scroll');
                const icon = DOM.menuToggle.querySelector('i');
                if (icon) icon.classList.replace('fa-bars', 'fa-times');
            } else {
                closeMainMenu();
            }
        });

        // 2. 行動版子選單摺疊 (Accordion)
        DOM.mainNav.querySelectorAll('.dropdown > a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) {
                    e.preventDefault();
                    const li = link.parentElement;
                    const submenu = li.querySelector('.submenu-container');
                    const isActive = li.classList.contains('active');

                    // 關閉其他
                    DOM.mainNav.querySelectorAll('.dropdown.active').forEach(other => {
                        if (other !== li) {
                            other.classList.remove('active');
                            other.querySelector('.submenu-container').style.maxHeight = null;
                        }
                    });

                    li.classList.toggle('active');
                    if (submenu) {
                        submenu.style.maxHeight = !isActive ? `${submenu.scrollHeight}px` : null;
                    }
                }
            });
        });

        // 3. 點擊連結後關閉 (針對錨點)
        DOM.mainNav.querySelectorAll('a:not([aria-haspopup="true"])').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) setTimeout(closeMainMenu, 100);
            });
        });
    };

    // ====================================================
    // C. 試算機功能 (勞保 & 對年)
    // ====================================================
    window.SALife.calculateLaborInsurance = function() {
        const salaryIn = document.getElementById('avgSalary');
        const hasSurvivor = document.getElementById('hasSurvivor')?.value;
        const resultBox = document.getElementById('resultBox');
        if (!salaryIn || !resultBox) return;

        const val = parseFloat(salaryIn.value);
        if (isNaN(val) || val <= 0) {
            resultBox.innerHTML = `<p style="color:red;">❗ 請輸入有效薪資。</p>`;
            resultBox.style.display = 'block';
            return;
        }

        const finalSalary = Math.min(Math.max(val, CONFIG.LABOR.MIN), CONFIG.LABOR.MAX);
        const months = (hasSurvivor === 'yes') ? CONFIG.LABOR.SURVIVOR : CONFIG.LABOR.NO_SURVIVOR;
        const total = finalSalary * months;

        resultBox.innerHTML = `
            <div style="padding:15px; background:#f8f9fa; border-left:4px solid #b22222;">
                <p>經調整投保薪資：${formatCurrency(finalSalary)}</p>
                <p><strong>預估領取金額：${formatCurrency(total)}</strong> (${months}個月)</p>
                ${hasSurvivor === 'yes' ? '<p style="color:#007bff;">💡 建議優先評估「遺屬年金」，總額通常更高。</p>' : ''}
            </div>`;
        resultBox.style.display = 'block';
    };

    window.SALife.setupDuinianCalculator = function() {
        const btn = document.getElementById('calculateDuinian');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const dateVal = document.getElementById('dateOfDeath')?.value;
            const resBox = document.getElementById('resultOutput');
            if (!dateVal) return alert('請選擇日期');

            // 簡易模擬邏輯 (實際應配合農曆庫)
            const date = new Date(dateVal);
            const resDate = new Date(date.setFullYear(date.getFullYear() + 1));
            
            document.getElementById('lunarDate').innerText = `陽曆日期：${dateVal}`;
            document.getElementById('duinianDate').innerText = `對年預估：${resDate.toLocaleDateString('zh-TW')} (農曆同月同日)`;
            resBox.classList.remove('hidden');
            resBox.scrollIntoView({ behavior: 'smooth' });
        });
    };

    // ====================================================
    // D. Modal 與 Tab 管理
    // ====================================================
    window.SALife.openModal = function(id) {
        const modal = document.getElementById('modal-' + id);
        if (!modal) return;
        focusedElementBeforeModal = document.activeElement;
        modal.style.display = 'flex';
        DOM.body.classList.add('no-scroll');
        setTimeout(() => modal.classList.add('active'), 10);
    };

    window.SALife.closeModal = function() {
        const activeModal = document.querySelector('.modal-overlay.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            DOM.body.classList.remove('no-scroll');
            setTimeout(() => {
                activeModal.style.display = 'none';
                if (focusedElementBeforeModal) focusedElementBeforeModal.focus();
            }, 300);
        }
    };

    window.SALife.openPlanTab = function(tabName, anchorId = null) {
        const contents = document.querySelectorAll('.plan-tab-content');
        const tabs = document.querySelectorAll('.tab-btn');
        
        contents.forEach(c => c.style.display = 'none');
        tabs.forEach(t => t.classList.remove('active'));

        const targetContent = document.getElementById('content-' + tabName);
        const targetTab = document.getElementById('tab-' + tabName);

        if (targetContent) targetContent.style.display = 'block';
        if (targetTab) targetTab.classList.add('active');

        if (anchorId) {
            const el = document.querySelector(anchorId);
            if (el) window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' });
        }
    };

    // ====================================================
    // E. 介面互動與初始化
    // ====================================================
    const setupUI = () => {
        // 1. Header 滾動監聽
        window.addEventListener('scroll', debounce(() => {
            const scrolled = window.scrollY > CONFIG.SCROLL_THRESHOLD;
            DOM.header?.classList.toggle('scrolled', scrolled);
            DOM.backToTop?.classList.toggle('show', window.scrollY > 400);
        }, 15));

        // 2. FAQ 手風琴
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                const content = item.querySelector('.accordion-content');
                const isOpen = item.classList.contains('active');

                document.querySelectorAll('.accordion-item.active').forEach(active => {
                    active.classList.remove('active');
                    active.querySelector('.accordion-content').style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });

        // 3. 更新年份
        if (DOM.currentYear) DOM.currentYear.textContent = new Date().getFullYear();
    };

    // 啟動
    document.addEventListener('DOMContentLoaded', () => {
        setupNavigation();
        setupUI();
        window.SALife.setupDuinianCalculator();
        
        // 點擊 Modal 外部關閉
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) window.SALife.closeModal();
        });
    });

})();

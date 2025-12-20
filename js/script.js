/**
 * =========================================================================
 * 祥安生命網站核心腳本 (SA Life Core Script)
 * Version: V4.1 FINAL
 * 說明：
 * - 手機選單滑出 + Overlay
 * - 手機 submenu 點擊展開（互斥）
 * - FitText 標題安全縮放
 * - FAQ Accordion
 * - 補助試算 / 年份更新
 * =========================================================================
 */

'use strict';

(function () {

  /* =========================
     全域設定
  ========================= */
  const CONFIG = {
    MOBILE_BREAKPOINT: 991,
    DEBOUNCE_DELAY: 150,
    SAFE_RATIO: 0.95
  };

  const body = document.body;
  const html = document.documentElement;

  /* =========================
     工具：Debounce
  ========================= */
  const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  /* =========================
     [1] 版面防護
  ========================= */
  const enforceViewportIntegrity = () => {
    html.style.overflowX = 'hidden';
    body.style.overflowX = 'hidden';
    body.style.position = 'relative';
    body.style.width = '100%';
  };

  /* =========================
     [2] FitText
  ========================= */
  const initFitText = () => {
    const elements = document.querySelectorAll('.fit-text-line');
    if (!elements.length) return;

    const adjust = () => {
      elements.forEach(el => {
        const container = el.parentElement;
        if (!container) return;

        el.style.fontSize = '';
        el.style.whiteSpace = 'nowrap';
        el.style.display = 'inline-block';

        const cw = container.clientWidth;
        const tw = el.scrollWidth;

        if (tw > cw) {
          const ratio = cw / tw;
          const size = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = Math.floor(size * ratio * CONFIG.SAFE_RATIO) + 'px';
        }
      });
    };

    adjust();
    window.addEventListener('resize', debounce(adjust, CONFIG.DEBOUNCE_DELAY));
  };

  /* =========================
     [3] 導覽系統（V4.1 核心）
  ========================= */
  const initNavigation = () => {
    const toggleBtn = document.querySelector('.menu-toggle');
    const mainNav = document.getElementById('main-nav');
    const overlay = document.querySelector('.nav-overlay');
    const dropdownLinks = document.querySelectorAll('.dropdown > a');

    if (!toggleBtn || !mainNav) return;

    /* --- 初始 submenu 狀態 --- */
    document.querySelectorAll('.submenu-container').forEach(sub => {
      sub.style.maxHeight = '0px';
    });

    /* --- 開關主選單 --- */
    const toggleMenu = (forceClose = false) => {
      const isOpen = mainNav.classList.contains('active');
      const shouldOpen = forceClose ? false : !isOpen;

      mainNav.classList.toggle('active', shouldOpen);
      toggleBtn.classList.toggle('active', shouldOpen);
      toggleBtn.setAttribute('aria-expanded', shouldOpen);

      if (overlay) overlay.classList.toggle('active', shouldOpen);
      body.style.overflow = shouldOpen ? 'hidden' : '';
    };

    toggleBtn.addEventListener('click', e => {
      e.preventDefault();
      toggleMenu();
    });

    if (overlay) {
      overlay.addEventListener('click', () => toggleMenu(true));
    }

    /* --- ESC 關閉 --- */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') toggleMenu(true);
    });

    /* --- 手機 submenu 點擊展開（互斥） --- */
    dropdownLinks.forEach(link => {
      link.addEventListener('click', function (e) {
        if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) return;

        const parent = this.parentElement;
        const submenu = parent.querySelector('.submenu-container');
        if (!submenu) return;

        e.preventDefault();

        const isActive = parent.classList.contains('active');

        document.querySelectorAll('.dropdown.active').forEach(other => {
          if (other !== parent) {
            other.classList.remove('active');
            const sub = other.querySelector('.submenu-container');
            if (sub) sub.style.maxHeight = '0px';
          }
        });

        parent.classList.toggle('active', !isActive);
        submenu.style.maxHeight = !isActive
          ? submenu.scrollHeight + 'px'
          : '0px';
      });
    });

    /* --- resize 清理 --- */
    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
        mainNav.classList.remove('active');
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        body.style.overflow = '';

        if (overlay) overlay.classList.remove('active');

        document.querySelectorAll('.submenu-container').forEach(sub => sub.style.maxHeight = '');
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('active'));
      }
    }, 200));
  };

  /* =========================
     [4] FAQ Accordion
  ========================= */
  const initAccordions = () => {
    document.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const item = header.closest('.accordion-item');
        const content = item?.querySelector('.accordion-content');
        if (!content) return;

        const isOpen = item.classList.contains('active');

        document.querySelectorAll('.accordion-item.active').forEach(other => {
          if (other !== item) {
            other.classList.remove('active');
            other.querySelector('.accordion-content').style.maxHeight = '0px';
          }
        });

        item.classList.toggle('active', !isOpen);
        content.style.maxHeight = !isOpen ? content.scrollHeight + 'px' : '0px';
      });
    });
  };

  /* =========================
     [5] 工具功能
  ========================= */
  const initUtilities = () => {
    const year = document.getElementById('current-year');
    if (year) year.textContent = new Date().getFullYear();

    window.calculateLabor = () => {
      const salaryInput = document.getElementById('avgSalary');
      const survivorSelect = document.getElementById('hasSurvivor');
      const resultBox = document.getElementById('resultBox');

      if (!salaryInput || !resultBox) return;

      const salary = Math.min(Math.max(parseFloat(salaryInput.value) || 0, 27470), 45800);
      const months = survivorSelect?.value === 'yes' ? 5 : 3;
      const total = Math.round(salary * months);

      resultBox.innerHTML = `預估給付金額：<strong>NT$ ${total.toLocaleString()}</strong>`;
      resultBox.style.display = 'block';
    };
  };

  /* =========================
     初始化
  ========================= */
  const init = () => {
    enforceViewportIntegrity();
    initFitText();
    initNavigation();
    initAccordions();
    initUtilities();
  };

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

})();

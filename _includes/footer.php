<footer style="background: #020617; color: rgba(255,255,255,0.6); padding: 80px 0 30px;">
    <div class="container" style="text-align: center;">
        <img src="{{ site.baseurl }}/images/logo.png" alt="Logo" style="height: 55px; filter: brightness(0) invert(1); margin-bottom: 25px;">
        
        <p>新北市三重區永福街135巷13號</p>
        <p>24H 禮儀諮詢：<a href="tel:+886978583699" style="color:#fff; text-decoration:none;">0978-583-699</a></p>
        
        <div style="margin: 20px 0; font-size: 1.5rem;">
            <a href="#" style="color:#fff; margin:0 10px;"><i class="fab fa-facebook"></i></a>
            <a href="https://line.me/ti/p/@yourid" style="color:#00c300; margin:0 10px;"><i class="fab fa-line"></i></a>
        </div>
        
        <p style="font-size: 0.8rem;">祥安生命有限公司 © {{ "now" | date: "%Y" }} 版權所有</p>
    </div>
</footer>

{% include floating-cta.html %}

<script>
    // 1. 滾動效果：導航列變色
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if(navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // 2. 手機版選單：修正 ID 抓取問題
    // 同時相容 menu-toggle 和 menu-btn
    const menuBtn = document.querySelector('.menu-toggle') || document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        });
    }

    // 3. 進場動畫 (Scroll Reveal)
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { 
            if(entry.isIntersecting) entry.target.classList.add('revealed'); 
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // 4. 流星效果：修正 ID 名稱，對應您 Hero 區的 id
    // 如果您的 Hero ID 是 'home'，請將下方改為 'home'
    const hero = document.getElementById('hero-space') || document.getElementById('home');
    if(hero) {
        setInterval(() => {
            const m = document.createElement('div');
            m.className = 'meteor';
            m.style.left = Math.random() * 100 + '%';
            m.style.top = Math.random() * 20 + '%';
            hero.appendChild(m);
            m.animate([
                { transform: 'rotate(-35deg) translateX(0)', opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { transform: 'rotate(-35deg) translateX(-800px)', opacity: 0 }
            ], { duration: 2500, easing: 'linear' }).onfinish = () => m.remove();
        }, 3000);
    }
</script>

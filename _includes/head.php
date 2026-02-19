<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<script async src="https://www.googletagmanager.com/gtag/js?id=G-445583766"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-445583766'); 
</script>

<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;700&family=Noto+Sans+TC:wght@300;400;700&display=swap" rel="stylesheet">

<style>
    :root {
        --primary: #0f172a; --accent: #c5a059; --soft-gold: #e2c28d; --white: #ffffff;
        --glass: rgba(255, 255, 255, 0.95); --transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        --header-h: 90px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Noto Serif TC', serif; color: #334155; line-height: 1.8; overflow-x: hidden; }
    
    /* 導覽列共用樣式 */
    .main-header {
        position: fixed; top: 0; width: 100%; height: var(--header-h); z-index: 2000;
        background: var(--glass); backdrop-filter: blur(15px);
        border-bottom: 1px solid rgba(197, 160, 89, 0.2); transition: var(--transition);
    }
    .main-header.scrolled { height: 70px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    
    /* 通用區塊樣式 */
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .section-padding { padding: 80px 0; }
    .reveal { opacity: 0; transform: translateY(30px); transition: 1s; }
    .revealed { opacity: 1; transform: translateY(0); }
    
    /* 流星效果 */
    .meteor { position: absolute; width: 2px; height: 2px; background: #fff; border-radius: 50%; box-shadow: 0 0 10px 2px var(--accent); opacity: 0; pointer-events: none; }
    
    /* 這裡可以放您原本 index.html 裡的所有 CSS... */
</style>

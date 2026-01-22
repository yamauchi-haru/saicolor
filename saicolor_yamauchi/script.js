/* ===== 1) 円形スクロール文字 ===== */
;(() => {
    document.addEventListener("DOMContentLoaded", () => {
        const circleText = document.querySelector(".circle-text_01");
        if (!circleText || circleText.childElementCount) return;

        const text = "SCROLL DOWN ";
        const repeatedText = text.repeat(2);
        const totalChars = repeatedText.length;
        const anglePerChar = 360 / totalChars;

        for (let i = 0; i < totalChars; i++) {
        const span = document.createElement("span");
        span.textContent = repeatedText[i];
        span.style.transform = `rotate(${i * anglePerChar}deg)`;
        circleText.appendChild(span);
        }
    });
})();

/* ===== 2) カラーピッカー → 近い色のカード3枚 ===== */
;(() => {
    "use strict";

    const SPOTS = [
        { title:"宝登山神社の鳥居", img:"img/all_card/jinja_card.webp", href:"", hex:"#cc3b2e"},
        { title:"熊谷うちわ祭り", img:"img/all_card/uchiwa_card.webp", href:"kumagaya-uchiwa.html", hex:"#E86B37"},
        { title:"川越の芋スイーツ", img:"img/all_card/imo_card.webp", href:"", hex:"#DDAA33"},
        { title:"幸手ひまわり畑", img:"img/all_card/himawari_card.webp", href:"satte-himawari.html", hex:"#F6C443"},
        { title:"上尾 丸山公園", img:"img/all_card/maruyama_card.webp", href:"", hex:"#DCE775"},
        { title:"入間 狭山茶畑", img:"img/all_card/chabatake_card.webp", href:"iruma-sayama-cha.html", hex:"#8BC34A"},
        { title:"深谷 ねぎ", img:"img/all_card/negi_card.webp", href:"", hex:"#6B9E85"},
        { title:"有間ダム", img:"img/all_card/damu_card.webp", href:"", hex:"#A7C4C6"},
        { title:"深谷 ガリガリ君", img:"img/all_card/garigarikun_card.webp", href:"fukaya-garigarikun.html", hex:"#6FC3DF"},
        { title:"さいたま新都心 イルミ", img:"img/all_card/irumi_card.webp", href:"", hex:"#345DAA"},
        { title:"玉敷神社の藤", img:"img/all_card/huji_card.webp", href:"", hex:"#9e6292"},
        { title:"嵐山町 あじさい寺", img:"img/all_card/ajisai_card.webp", href:"ranzan-ajisai.html", hex:"#7E548C"},
        { title:"大宮公園の桜", img:"img/all_card/sakura_card.webp", href:"", hex:"#F4A7B9"},
        { title:"秩父 羊山公園", img:"img/all_card/hitujiyama_card.webp", href:"", hex:"#C57299"},
        { title:"西武園ゆうえんち", img:"img/all_card/seibu_card.webp", href:"", hex:"#F1E2B6"},
        { title:"川越 菓子屋横丁", img:"img/all_card/kashiya_card.webp", href:"", hex:"#BBA483"},
        { title:"秩父 味噌ポテト", img:"img/all_card/misopoteto_card.webp", href:"", hex:"#735A4E"},
        { title:"秩父鉄道 SL", img:"img/all_card/sl_card.webp", href:"", hex:"#403230"},
        { title:"鉄道博物館", img:"img/all_card/tetsudou.webp", href:"", hex:"#3D4049"},
        { title:"長瀞 岩畳", img:"img/all_card/nagatoro_card.webp", href:"nagatoro-iwadatami.html", hex:"#888B9C"},
        { title:"越谷レイクタウン", img:"img/all_card/reiku_card.webp", href:"", hex:"#C0C2D4"},
    ];

/* --- HEX→Lab & ΔE2000 --- */
  const hexToRgb = (hex) => {
      const m = (hex||"").replace("#","").match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (!m) return { r:255,g:255,b:255 };
      let s = m[1]; if (s.length===3) s = s.split("").map(c=>c+c).join("");
      const n = parseInt(s,16);
      return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  };
  const srgbToLin = (c)=>{ c/=255; return c<=0.04045? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
  const rgbToXyz = ({r,g,b})=>{
      const R=srgbToLin(r), G=srgbToLin(g), B=srgbToLin(b);
      return {
      x: R*0.4124564 + G*0.3575761 + B*0.1804375,
      y: R*0.2126729 + G*0.7151522 + B*0.0721750,
      z: R*0.0193339 + G*0.1191920 + B*0.9503041
      };
  };
  const xyzToLab = ({x,y,z})=>{
      const Xn=0.95047, Yn=1.00000, Zn=1.08883;
      const f=(t)=> t>0.008856 ? Math.cbrt(t) : (7.787*t + 16/116);
      const fx=f(x/Xn), fy=f(y/Yn), fz=f(z/Zn);
      return { L:116*fy-16, a:500*(fx-fy), b:200*(fy-fz) };
  };
  const rgbToLab = (rgb)=> xyzToLab(rgbToXyz(rgb));

  const deltaE00 = (lab1, lab2) => {
      const {L:L1,a:a1,b:b1}=lab1, {L:L2,a:a2,b:b2}=lab2;
      const avgLp=(L1+L2)/2, C1=Math.hypot(a1,b1), C2=Math.hypot(a2,b2), avgC=(C1+C2)/2;
      const G=0.5*(1-Math.sqrt(Math.pow(avgC,7)/(Math.pow(avgC,7)+Math.pow(25,7))));
      const a1p=(1+G)*a1, a2p=(1+G)*a2, C1p=Math.hypot(a1p,b1), C2p=Math.hypot(a2p,b2), avgCp=(C1p+C2p)/2;
      const h1p=(Math.atan2(b1,a1p)*180/Math.PI+360)%360, h2p=(Math.atan2(b2,a2p)*180/Math.PI+360)%360;
      let dhp=h2p-h1p; if(dhp>180) dhp-=360; else if(dhp<-180) dhp+=360;
      const dLp=L2-L1, dCp=C2p-C1p, dHp=2*Math.sqrt(C1p*C2p)*Math.sin((dhp/2)*Math.PI/180);
      const avgHp = (Math.abs(h1p-h2p)>180)? (h1p+h2p+360)/2 : (h1p+h2p)/2;
      const T=1-0.17*Math.cos((avgHp-30)*Math.PI/180)+0.24*Math.cos((2*avgHp)*Math.PI/180)
              +0.32*Math.cos((3*avgHp+6)*Math.PI/180)-0.20*Math.cos((4*avgHp-63)*Math.PI/180);
      const Sl=1+(0.015*Math.pow(avgLp-50,2))/Math.sqrt(20+Math.pow(avgLp-50,2));
      const Sc=1+0.045*avgCp, Sh=1+0.015*avgCp*T;
      const Rt=-2*Math.sqrt(Math.pow(avgCp,7)/(Math.pow(avgCp,7)+Math.pow(25,7)))
                  *Math.sin((60*Math.exp(-Math.pow((avgHp-275)/25,2)))*Math.PI/180);
      return Math.sqrt(Math.pow(dLp/Sl,2)+Math.pow(dCp/Sc,2)+Math.pow(dHp/Sh,2)+Rt*(dCp/Sc)*(dHp/Sh));
  };

  document.addEventListener("DOMContentLoaded", () => {
      const well   = document.querySelector('[data-role="color-well"]');
      const input  = document.getElementById("ui-color-input");
      const result = Array.from(document.querySelectorAll('[data-role="result-card"]'));
      if (!well || !input || result.length!==3) return;

      SPOTS.forEach(s => { s.lab = rgbToLab(hexToRgb(s.hex)); });

      const renderFor = (hex) => {
        const pickedLab = rgbToLab(hexToRgb(hex));
        well.style.setProperty("--picked", hex);
        well.title = hex.toUpperCase();

        const top3 = [...SPOTS]
          .map(s => ({ ...s, score: deltaE00(pickedLab, s.lab) }))
          .sort((a, b) => a.score - b.score)
          .slice(0, 3);

        top3.forEach((s, i) => {
          const node = result[i];

          let img = node.querySelector("img");
          if (!img) {
            img = new Image();
            img.loading = "lazy";
            img.decoding = "async";
            img.fetchPriority = "low";
            node.appendChild(img);
          }

          img.src = s.img;
          img.alt = s.title;

          if (s.href) {
            node.href = s.href;
            node.classList.remove("is-disabled");
            node.removeAttribute("aria-disabled");
            node.tabIndex = 0;
          } else {
            node.removeAttribute("href");
            node.classList.add("is-disabled");
            node.setAttribute("aria-disabled", "true");
            node.tabIndex = -1;
          }
        });
      };

      // well.addEventListener("click", ()=> input.click());
      input.addEventListener("change", e => renderFor(e.target.value));
      renderFor(input.value || "#f1e2b6");
  });
  })();

  // ===== 1) モバイルナビ開閉（全ページ共通） =====
(() => {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primaryNav');
    if (!btn || !nav) return;

    const toggle = () => {
      const opened = document.body.classList.toggle('nav-open');
      btn.setAttribute('aria-expanded', String(opened));
    };

    btn.addEventListener('click', toggle);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) toggle();
    });
    // リンクを押したら閉じるが、SP幅でのドロップダウントリガーは閉じない
nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;

    // 600px以下 かつ aria-haspopup="true"（= 6色カードのトリガー）は閉じない
    if (window.matchMedia('(max-width: 600px)').matches && a.getAttribute('aria-haspopup') === 'true') {
      return;
    }
    document.body.classList.remove('nav-open');
  });

  })();
  document.addEventListener("scroll", () => {
    const header = document.querySelector("header");
    if (!header) return;

    const hero = document.querySelector(".hero");
    const threshold = hero ? hero.offsetHeight - 80 : 80;

    if (window.scrollY > threshold) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
// モバイル時：6色カードはクリックで開閉（下に押し出す）
document.addEventListener("DOMContentLoaded", () => {
    const mq = window.matchMedia("(max-width: 600px)");
    const li = document.querySelector(".has-dropdown");
    const link = li?.querySelector(":scope > a");

    if (!li || !link) return;

    link.addEventListener("click", (e) => {
      if (mq.matches && document.body.classList.contains("nav-open")) {
        e.preventDefault();
        // ほかを閉じる（同階層に他があれば）
        document.querySelectorAll(".has-dropdown.open").forEach(el => {
          if (el !== li) el.classList.remove("open");
        });
        li.classList.toggle("open");
      }
    });
  });

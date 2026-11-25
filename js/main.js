/* =========================================================
   madebyel — interactions (Lenis + GSAP ScrollTrigger)
   ========================================================= */
(() => {
  // ---------- WhatsApp ----------
  const WA_NUMBER = "6285971193011"; // +62 859-7119-3011
  const WA_TEXT = "Halo Biyel! 🍅 Aku mau order jasa edit di madebyel. Boleh minta info layanan & harganya?";
  const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;
  document.querySelectorAll("[data-wa]").forEach((a) => (a.href = WA_URL));

  document.getElementById("year").textContent = new Date().getFullYear();

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  // ---------- Mobile nav ----------
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  const closeNav = () => {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Buka menu");
  };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  });

  // ---------- Smooth scroll (Lenis) ----------
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  // anchor links
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeNav();
      if (lenis) lenis.scrollTo(target, { offset: id === "#beranda" ? 0 : -20, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  // ---------- Header hide/show ----------
  const header = document.getElementById("header");
  let lastY = 0;
  const onScroll = (y) => {
    if (y > 160 && y > lastY + 4 && !nav.classList.contains("is-open")) header.classList.add("is-hidden");
    else if (y < lastY - 4 || y < 160) header.classList.remove("is-hidden");
    lastY = y;
  };
  if (lenis) lenis.on("scroll", ({ scroll }) => onScroll(scroll));
  else window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });

  // ---------- Lightbox ----------
  const lb = document.getElementById("lightbox");
  const lbContent = lb.querySelector(".lightbox__content");
  const openLb = (node) => {
    lbContent.innerHTML = "";
    const clone = node.cloneNode(true);
    if (clone.tagName === "VIDEO") { clone.controls = true; clone.muted = false; }
    lbContent.appendChild(clone);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    lenis && lenis.stop();
  };
  const closeLb = () => {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    lenis && lenis.start();
    setTimeout(() => (lbContent.innerHTML = ""), 350);
  };
  document.querySelectorAll(".g-item").forEach((el) => el.addEventListener("click", () => openLb(el.firstElementChild)));
  document.querySelectorAll(".work").forEach((el) => el.addEventListener("click", () => openLb(el.querySelector(".phone__screen").firstElementChild)));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox__close")) closeLb(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeLb(); closeNav(); } });

  // ---------- Loader ----------
  const loader = document.querySelector(".loader");
  document.body.classList.add("is-loading");

  if (!hasGsap || reduceMotion) {
    const done = () => { loader.remove(); document.body.classList.remove("is-loading"); };
    window.addEventListener("load", done);
    setTimeout(done, 2500);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // ---------- Split titles into words ----------
  const splitWords = (el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const w = document.createElement("span"); w.className = "w";
            const inner = document.createElement("span"); inner.textContent = part;
            w.appendChild(inner); frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) walk(child);
      });
    };
    walk(el);
    return el.querySelectorAll(".w > span");
  };

  // ---------- Hero intro ----------
  const heroIntro = () => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(loader, { yPercent: -100, duration: 1, ease: "expo.inOut", onComplete: () => { loader.remove(); document.body.classList.remove("is-loading"); } })
      .from(".hero__card", { scale: .9, rotate: -2, opacity: 0, duration: 1.2 }, "-=.45")
      .from(".squiggle path", { strokeDasharray: 6000, strokeDashoffset: 6000, duration: 2, ease: "power2.inOut" }, "<")
      .from(".hero__title .word", { yPercent: 120, rotate: 8, duration: 1.1, stagger: .08 }, "-=1.5")
      .from(".eyebrow, .hero__lead, .hero__actions", { y: 30, opacity: 0, duration: .9, stagger: .1 }, "-=.9")
      .from(".hero__mascots", { y: 120, opacity: 0, duration: 1.2, ease: "back.out(1.6)" }, "-=1.1")
      .from(".bubble", { scale: 0, opacity: 0, duration: .7, stagger: .15, ease: "back.out(2.5)" }, "-=.6")
      .from(".hero__cluster--tl", { x: -200, y: -120, rotate: -40, opacity: 0, duration: 1.4 }, "-=1.4")
      .from(".hero__cluster--br", { x: 200, y: 120, rotate: 40, opacity: 0, duration: 1.4 }, "<")
      .from(".header", { y: -120, duration: 1, clearProps: "transform" }, "-=1.2")
      .from(".scroll-hint", { opacity: 0, y: 20, duration: .6 }, "-=.6");
    return tl;
  };

  gsap.set(".squiggle path", { strokeDasharray: 6000, strokeDashoffset: 0 });
  gsap.from(".loader__logo", { scale: .6, rotate: -20, opacity: 0, duration: .8, ease: "back.out(2)" });
  let started = false;
  const start = () => { if (started) return; started = true; setTimeout(heroIntro, 450); };
  window.addEventListener("load", start);
  setTimeout(start, 3000);

  // idle loops
  gsap.to(".hero__mascots", { y: -14, duration: 1.8, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".bubble--left", { rotate: -4, y: -6, duration: 2.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
  gsap.to(".bubble--right", { rotate: 5, y: -8, duration: 2, ease: "sine.inOut", yoyo: true, repeat: -1, delay: .4 });

  // hero parallax on scroll
  gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
    .to(".hero__cluster--tl", { y: 160, rotate: 25 }, 0)
    .to(".hero__cluster--br", { y: -140, rotate: -25 }, 0)
    .to(".hero__card", { y: 80, scale: .96 }, 0)
    .to(".scroll-hint", { opacity: 0 }, 0);

  // ---------- Marquee (velocity reactive) ----------
  const marquee = gsap.to(".marquee__track", { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  if (lenis) {
    lenis.on("scroll", ({ velocity }) => {
      const v = gsap.utils.clamp(-6, 6, velocity / 6);
      gsap.to(marquee, { timeScale: v < 0 ? v - 1 : 1 + v, duration: .4, overwrite: true });
    });
  }

  // ---------- Title & text reveals ----------
  document.querySelectorAll(".reveal-title").forEach((t) => {
    const words = splitWords(t);
    gsap.from(words, { yPercent: 115, rotate: 6, duration: 1, ease: "expo.out", stagger: .05, scrollTrigger: { trigger: t, start: "top 85%" } });
  });
  document.querySelectorAll(".section__label").forEach((el) => {
    gsap.from(el, { scale: 0, rotate: -20, duration: .7, ease: "back.out(2.5)", scrollTrigger: { trigger: el, start: "top 90%" } });
  });
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  // ---------- About ----------
  gsap.from(".about__logo-wrap", { scale: .6, rotate: -15, opacity: 0, duration: 1.3, ease: "elastic.out(1, .7)", scrollTrigger: { trigger: ".about__visual", start: "top 75%" } });
  gsap.from(".sticker", { scale: 0, opacity: 0, duration: .7, stagger: .12, ease: "back.out(3)", scrollTrigger: { trigger: ".about__visual", start: "top 65%" } });
  gsap.to(".about__logo", { rotate: 10, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.utils.toArray(".sticker").forEach((s, i) => {
    gsap.to(s, { y: (i % 2 ? -1 : 1) * 40, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });
  });

  // ---------- Services ----------
  gsap.from(".service-card", { y: 120, rotateX: -25, opacity: 0, duration: 1.2, stagger: .14, ease: "expo.out", scrollTrigger: { trigger: ".services__grid", start: "top 80%" } });
  gsap.from(".perk", { y: 40, opacity: 0, duration: .9, stagger: .1, ease: "expo.out", scrollTrigger: { trigger: ".perks", start: "top 90%" } });

  // tilt on hover (pointer devices)
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      const rx = gsap.quickTo(card, "rotateX", { duration: .5, ease: "power3" });
      const ry = gsap.quickTo(card, "rotateY", { duration: .5, ease: "power3" });
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        rx(py * -12); ry(px * 12);
      });
      card.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });

    // magnetic CTA
    document.querySelectorAll(".magnetic").forEach((btn) => {
      const x = gsap.quickTo(btn, "x", { duration: .6, ease: "elastic.out(1, .4)" });
      const y = gsap.quickTo(btn, "y", { duration: .6, ease: "elastic.out(1, .4)" });
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * .35);
        y((e.clientY - r.top - r.height / 2) * .35);
      });
      btn.addEventListener("pointerleave", () => { x(0); y(0); });
    });
  }

  // ---------- How to order (horizontal scroll on desktop) ----------
  const mm = gsap.matchMedia();
  mm.add("(min-width: 921px)", () => {
    const pin = document.querySelector(".howto__pin");
    const distance = () => Math.max(0, pin.scrollWidth - window.innerWidth);
    const tween = gsap.to(pin, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: { trigger: ".howto", start: "top top", end: () => "+=" + distance(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    gsap.utils.toArray(".step").forEach((step) => {
      gsap.from(step.querySelector(".step__emoji"), {
        scale: 0, rotate: -90, duration: .8, ease: "back.out(3)",
        scrollTrigger: { trigger: step, containerAnimation: tween, start: "left 85%" },
      });
    });
    return () => tween.scrollTrigger && tween.scrollTrigger.kill();
  });
  mm.add("(max-width: 920px)", () => {
    gsap.utils.toArray(".step").forEach((step) => {
      gsap.from(step, { y: 60, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: step, start: "top 88%" } });
    });
  });

  // ---------- Gallery ----------
  gsap.from(".g-item", { clipPath: "inset(100% 0 0 0 round 24px)", duration: 1.2, stagger: .08, ease: "expo.inOut", scrollTrigger: { trigger: ".gallery__grid", start: "top 80%" } });
  mm.add("(min-width: 921px)", () => {
    gsap.utils.toArray(".g-item").forEach((item) => {
      const speed = parseFloat(item.dataset.speed || 1);
      gsap.to(item, { y: (1 - speed) * 260, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });
    });
  });

  // ---------- Works ----------
  gsap.from(".work", { y: 140, opacity: 0, rotate: (i) => (i % 2 ? 6 : -6), duration: 1.2, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: ".works__grid", start: "top 85%" } });

  // ---------- CTA ----------
  gsap.from(".cta__card", { y: 100, scale: .9, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".cta", start: "top 75%" } });
  gsap.from(".cta__mascots", { y: 80, opacity: 0, duration: 1.2, ease: "back.out(1.8)", scrollTrigger: { trigger: ".cta", start: "top 60%" } });
  gsap.timeline({ scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } })
    .fromTo(".cta__cluster--l", { y: -80, rotate: -20 }, { y: 120, rotate: 15 }, 0)
    .fromTo(".cta__cluster--r", { y: 80, rotate: 20 }, { y: -120, rotate: -15 }, 0);

  // ---------- Active nav link ----------
  const links = [...document.querySelectorAll(".nav a[href^='#']")];
  ["beranda", "tentang", "layanan", "cara-order", "galeri", "karya"].forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec, start: "top 45%", end: "bottom 45%",
      onToggle: (self) => {
        if (!self.isActive) return;
        links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === "#" + id));
      },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

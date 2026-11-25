(function () {
  "use strict";

  var WA_NUMBER = "5584996523788";
  var root = document.documentElement;
  root.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header ao rolar ---------- */
  var header = document.querySelector(".header");
  function onScrollHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  /* ---------- Menu mobile ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("menuToggle");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false);
  });

  /* ---------- Parallax ---------- */
  var layers = [];
  document.querySelectorAll(".parallax").forEach(function (section) {
    var media = section.querySelector(".parallax__media");
    if (media) layers.push({ box: section, el: media, speed: parseFloat(media.dataset.speed) || 0.3 });
  });
  document.querySelectorAll(".cat-card").forEach(function (card) {
    var media = card.querySelector(".cat-card__media");
    if (media) layers.push({ box: card, el: media, speed: 0.12 });
  });

  function updateParallax() {
    var vh = window.innerHeight;
    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      var r = l.box.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) continue;
      // distância do centro do bloco ao centro da viewport
      var offset = (r.top + r.height / 2 - vh / 2) * -l.speed;
      l.el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScrollHeader();
      if (!reduceMotion) updateParallax();
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Revelação ao rolar ---------- */
  var reveals = document.querySelectorAll(".reveal");

  // escalona elementos irmãos para entrarem em sequência
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains("reveal");
    });
    var idx = siblings.indexOf(el);
    if (idx > 0) el.style.setProperty("--d", Math.min(idx * 0.1, 0.6) + "s");
  });

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contadores ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    var start = null, duration = 1800;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- Formulário → WhatsApp ---------- */
  var form = document.getElementById("waForm");
  var note = document.getElementById("formNote");

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nome = form.nome.value.trim();
    var interesse = form.interesse.value;
    var objetivo = form.objetivo.value;
    var mensagem = form.mensagem.value.trim();

    form.nome.closest(".field").classList.toggle("is-invalid", !nome);
    form.interesse.closest(".field").classList.toggle("is-invalid", !interesse);

    if (!nome || !interesse) {
      note.textContent = "Por favor, informe seu nome e o tipo de imóvel de interesse.";
      (nome ? form.interesse : form.nome).focus();
      return;
    }
    note.textContent = "";

    var texto =
      "Olá! Vim pelo site da Imóveis com Valor.\n\n" +
      "*Nome:* " + nome + "\n" +
      "*Interesse:* " + interesse + "\n" +
      "*Objetivo:* " + objetivo +
      (mensagem ? "\n*Mensagem:* " + mensagem : "");

    window.open("https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(texto), "_blank", "noopener");
  });

  /* ---------- Ano no rodapé ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();

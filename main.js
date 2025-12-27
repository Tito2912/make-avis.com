/* main.js — VERSION SIMPLIFIEE ET CORRIGEE (2025-09) */
(function () {
  "use strict";
  const doc = document, w = window, ls = w.localStorage;

  /* ----------------- utils ----------------- */
  const $ = (s, c = doc) => c.querySelector(s);
  const $$ = (s, c = doc) => Array.from(c.querySelectorAll(s));
  const nowISO = () => new Date().toISOString();

  function setFooterYear(){
    const y = $("#year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initSkipToContent(){
    const skip = $(".skip-link");
    const main = $("#main");
    if (!skip || !main) return;
    skip.addEventListener("click", (e) => {
      // Laisser la navigation à l’ancre, puis focaliser proprement
      setTimeout(() => {
        if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex","-1");
        main.focus({ preventScroll: true });
      }, 0);
    });
  }

  /* ----------------- nav ----------------- */
  function initBurger(){
    const burger = $("#burger"), nav = $("#nav");
    if(!burger || !nav) return;

        const toggle = (open) => {
      const isOpen = open ?? burger.getAttribute("aria-expanded") === "false";
      burger.setAttribute("aria-expanded", String(isOpen));
      nav.classList.toggle("open", isOpen);
      nav.toggleAttribute("hidden", !isOpen);
      doc.body.classList.toggle("nav-open", isOpen);
      if (isOpen) {
        const firstLink = nav.querySelector("a");
        if (firstLink) firstLink.focus();
      }
    };

    burger.addEventListener("click", () => toggle());
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggle(false);
        burger.focus();
      }
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) toggle(false);
    });
  }

  /* ----------------- Cookie modal (version amelioree) ----------------- */
  let lastFocus = null;
  let trapHandler = null;

  function getFocusableIn(el){
    return $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      el
    ).filter((n) => n.offsetParent !== null || n === el); // visibles
  }

  function openCookieModal(){
    const bd = $(".cookie-backdrop"), md = $(".cookie-modal");
    if(!bd || !md) return;

    // Afficher le modal
    bd.hidden = false;
    md.hidden = false;
    doc.body.classList.add("modal-open");

    // Sauvegarder le focus courant et deplacer le focus dans le modal
    lastFocus = doc.activeElement;
    const focusables = getFocusableIn(md);
    const first = focusables[0] || md;
    const last  = focusables[focusables.length - 1] || md;
    first.focus();

    // Focus trap (TAB reste dans le modal)
    trapHandler = (e) => {
      if (e.key !== "Tab") return;
      const active = doc.activeElement;
      if (e.shiftKey) {
        if (active === first || !md.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last || !md.contains(active)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    doc.addEventListener("keydown", trapHandler);

    // Clique sur backdrop = fermer
    bd.addEventListener("click", closeCookieModal, { once: true });
  }

  function closeCookieModal(){
    const bd = $(".cookie-backdrop"), md = $(".cookie-modal");
    if(!bd || !md) return;

    // Cacher le modal
    bd.hidden = true;
    md.hidden = true;
    doc.body.classList.remove("modal-open");

    // Retirer le trap et restaurer le focus
    if (trapHandler) doc.removeEventListener("keydown", trapHandler);
    trapHandler = null;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
    lastFocus = null;
  }

  function initCookieUI(){
    // Gestion des clics sur les actions
    doc.addEventListener("click", (e) => {
      const actionEl = e.target.closest("[data-action]");
      if(!actionEl) return;

      const action = actionEl.getAttribute("data-action");

      switch(action) {
        case "open-cookie-modal":
          e.preventDefault();
          openCookieModal();
          break;

        case "close-cookie-modal":
          e.preventDefault();
          closeCookieModal();
          break;

        case "reject-all":
          e.preventDefault();
          {
            const c = { analytics:false, marketing:false };
            storeConsent(c);
            applyConsent(c);
            closeCookieModal();
          }
          break;

        case "accept-necessary":
          e.preventDefault();
          {
            const c2 = { analytics:false, marketing:false };
            storeConsent(c2);
            applyConsent(c2);
            closeCookieModal();
          }
          break;
      }
    });

    // Gestion du formulaire
    const form = $("#cookie-form");
    if(form){
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const analytics = !!form.elements["analytics"]?.checked;
        const marketing = !!form.elements["marketing"]?.checked;
        const c = { analytics, marketing };
        storeConsent(c);
        applyConsent(c);
        closeCookieModal();
      });
    }

    // ESC pour fermer
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeCookieModal();
    });

    // Ouvrir automatiquement si première visite
    const stored = getStoredConsent();
    if(!stored){
      setTimeout(openCookieModal, 100);
    } else {
      applyConsent(stored);
    }
  }

  /* ----------------- Consent Mode v2 / GA4 ----------------- */
  let dataLayer = w.dataLayer || (w.dataLayer = []);
  function gtag(){ dataLayer.push(arguments); }

  function setConsentDefaults(){
    gtag("consent","default",{
      ad_storage: "denied",
      analytics_storage: "denied",
      functionality_storage: "granted",
      security_storage: "granted",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500
    });
  }

  function loadGA4(){
    const GA_ID = w.GA_MEASUREMENT_ID || "G-ZVQ7Z5ZGK9";
    if(!GA_ID || $("#ga4-lib")) return;

    const s = doc.createElement("script");
    s.async = true;
    s.id = "ga4-lib";
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    doc.head.appendChild(s);

    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }

  function applyConsent(c){
    const analytics = !!c.analytics, marketing = !!c.marketing;

    gtag("consent","update",{
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage:        marketing ? "granted" : "denied",
      ad_user_data:      marketing ? "granted" : "denied",
      ad_personalization:marketing ? "granted" : "denied"
    });

    if (analytics) loadGA4();
  }

  const CONSENT_KEY = "cookieConsentV2";
  const getStoredConsent = () => {
    try {
      const r = ls.getItem(CONSENT_KEY);
      return r ? JSON.parse(r) : null;
    } catch { return null; }
  };

  const storeConsent = (o) => {
    try {
      ls.setItem(CONSENT_KEY, JSON.stringify({ ...o, ts: nowISO() }));
    } catch {}
  };

  /* ----------------- Centrage global (hook CSS) ----------------- */
  function applyCenteredLayout(){
    // Classe decorative : le centrage reel est dans style.css (containers, titres, images, etc.)
    doc.body.classList.add("centered-ui");
  }

  /* ----------------- init ----------------- */
  setConsentDefaults();

  doc.addEventListener("DOMContentLoaded", () => {
    setFooterYear();
    initBurger();
    initSkipToContent();
    initCookieUI();
    applyCenteredLayout();
  });
})();


















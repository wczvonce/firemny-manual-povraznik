/* Firemná príručka — vanilla JS render z content.json.
 * Bezpečnosť: obsah z content.json vkladáme cez textContent / bezpečné DOM API,
 * nikdy nie cez innerHTML so surovými dátami (ochrana proti XSS).
 */
(function () {
  "use strict";

  var state = { data: null, categoryId: null, itemId: null, query: "" };

  var els = {};
  var lightbox = { root: null, img: null, closeBtn: null, lastFocus: null };

  document.addEventListener("DOMContentLoaded", function () {
    els.status = document.getElementById("status");
    els.viewContent = document.getElementById("view-content");
    els.suggestedList = document.getElementById("suggested-list");
    els.breadcrumbTail = document.getElementById("breadcrumb-tail");
    els.title = document.getElementById("app-title");
    els.updated = document.getElementById("app-updated");
    els.homeBtn = document.getElementById("home-btn");
    els.searchBox = document.getElementById("search-box");
    els.searchInput = document.getElementById("search-input");
    els.searchClear = document.getElementById("search-clear");

    lightbox.root = document.getElementById("lightbox");
    lightbox.img = document.getElementById("lightbox-img");
    lightbox.closeBtn = document.getElementById("lightbox-close");

    els.homeBtn.addEventListener("click", function () {
      goHome();
    });

    els.searchInput.addEventListener("input", function () {
      state.query = els.searchInput.value || "";
      els.searchClear.classList.toggle("hidden", !state.query);
      render();
    });
    els.searchClear.addEventListener("click", function () {
      clearSearch();
      els.searchInput.focus();
    });

    // Lightbox ovládanie
    lightbox.closeBtn.addEventListener("click", closeLightbox);
    lightbox.root.addEventListener("click", function (e) {
      if (e.target === lightbox.root) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.root.classList.contains("hidden")) {
        closeLightbox();
      }
    });

    loadContent();
  });

  function loadContent() {
    fetch("content.json", { cache: "no-cache" })
      .then(function (res) {
        if (!res.ok) {
          throw new Error("HTTP " + res.status + " " + res.statusText);
        }
        return res.json();
      })
      .then(function (data) {
        state.data = data;
        setStatus("", false, true); // skryť
        if (data.meta && data.meta.title) {
          els.title.textContent = data.meta.title;
          document.title = data.meta.title;
        }
        if (data.meta && data.meta.updated_at) {
          els.updated.textContent = "Aktualizované: " + formatDate(data.meta.updated_at);
        }
        renderSuggested();
        render();
      })
      .catch(function (err) {
        setStatus("Nepodarilo sa načítať obsah (content.json): " + err.message, true, false);
      });
  }

  function setStatus(msg, isError, hide) {
    if (!els.status) return;
    els.status.textContent = msg || "";
    els.status.classList.toggle("error", !!isError);
    els.status.classList.toggle("hidden", !!hide);
  }

  function goHome() {
    state.categoryId = null;
    state.itemId = null;
    state.query = "";
    if (els.searchInput) els.searchInput.value = "";
    if (els.searchClear) els.searchClear.classList.add("hidden");
    render();
  }

  function clearSearch() {
    state.query = "";
    els.searchInput.value = "";
    els.searchClear.classList.add("hidden");
    render();
  }

  /* ---- Router / render ---- */
  function render() {
    clear(els.viewContent);
    clear(els.breadcrumbTail);

    if (!state.data) return;

    // Vyhľadávacie pole je viditeľné len na domovskej obrazovke (zoznam kategórií).
    var onHome = !state.categoryId && !state.itemId;
    els.searchBox.classList.toggle("hidden", !onHome);

    var q = (state.query || "").trim();

    if (onHome && q) {
      renderSearchResults(q);
    } else if (state.categoryId && state.itemId) {
      renderDetail();
    } else if (state.categoryId) {
      renderItemList();
    } else {
      renderCategoryList();
    }
    // Fokus na obsah pre klávesnicovú navigáciu — ale nie počas písania do hľadania.
    if (!(onHome && q) && document.activeElement !== els.searchInput) {
      var main = document.getElementById("main");
      if (main) main.focus();
    }
  }

  function renderCategoryList() {
    var cats = state.data.categories || [];
    if (!cats.length) {
      els.viewContent.appendChild(makeEmpty("Zatiaľ nie sú žiadne kategórie."));
      return;
    }
    var ul = document.createElement("ul");
    ul.className = "card-list";
    cats.forEach(function (cat) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cat-card";

      var ico = document.createElement("span");
      ico.className = "ico";
      ico.setAttribute("aria-hidden", "true");
      ico.textContent = cat.icon || "📁";

      var txt = document.createElement("span");
      txt.className = "txt";
      var name = document.createElement("b");
      name.textContent = cat.name || cat.id;
      var desc = document.createElement("span");
      var count = countItems(cat.id);
      desc.textContent = cat.desc || (count + " " + pluralItems(count));
      txt.appendChild(name);
      txt.appendChild(desc);

      var chev = document.createElement("span");
      chev.className = "chev";
      chev.setAttribute("aria-hidden", "true");
      chev.textContent = "›";

      btn.appendChild(ico);
      btn.appendChild(txt);
      btn.appendChild(chev);
      btn.addEventListener("click", function () {
        state.categoryId = cat.id;
        state.itemId = null;
        render();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    els.viewContent.appendChild(ul);
  }

  function renderItemList() {
    var cat = findCategory(state.categoryId);
    addBreadcrumbCurrent(cat ? (cat.name || cat.id) : state.categoryId);

    var items = itemsInCategory(state.categoryId);
    if (!items.length) {
      els.viewContent.appendChild(makeEmpty("V tejto kategórii zatiaľ nie sú žiadne položky."));
      return;
    }
    var ul = document.createElement("ul");
    ul.className = "card-list";
    items.forEach(function (item) {
      ul.appendChild(makeItemCard(item, item.body_type === "steps" ? "Postup (kroky)" : "Text"));
    });
    els.viewContent.appendChild(ul);
  }

  // Karta položky (zdieľaná pre zoznam kategórie aj výsledky hľadania).
  function makeItemCard(item, subtitle) {
    var li = document.createElement("li");
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "item-card";

    var txt = document.createElement("span");
    txt.className = "txt";
    var name = document.createElement("b");
    name.textContent = item.title || item.id;
    txt.appendChild(name);
    if (subtitle) {
      var sub = document.createElement("span");
      sub.textContent = subtitle;
      txt.appendChild(sub);
    }

    var chev = document.createElement("span");
    chev.className = "chev";
    chev.setAttribute("aria-hidden", "true");
    chev.textContent = "›";

    btn.appendChild(txt);
    btn.appendChild(chev);
    btn.addEventListener("click", function () {
      state.categoryId = item.category;
      state.itemId = item.id;
      render();
    });
    li.appendChild(btn);
    return li;
  }

  /* ---- Vyhľadávanie ---- */
  function renderSearchResults(q) {
    var needle = normalizeText(q);
    var items = (state.data.items || []).filter(function (item) {
      return normalizeText(itemHaystack(item)).indexOf(needle) !== -1;
    });

    if (!items.length) {
      els.viewContent.appendChild(makeSearchEmpty(q));
      return;
    }

    var label = document.createElement("p");
    label.className = "results-label";
    label.textContent = items.length + " " + pluralItems(items.length);
    els.viewContent.appendChild(label);

    var ul = document.createElement("ul");
    ul.className = "card-list";
    items.forEach(function (item) {
      var cat = findCategory(item.category);
      var sub = cat ? (cat.name || cat.id) : "";
      ul.appendChild(makeItemCard(item, sub));
    });
    els.viewContent.appendChild(ul);
  }

  function itemHaystack(item) {
    var parts = [item.title || ""];
    if (Array.isArray(item.steps)) parts.push(item.steps.join(" "));
    if (typeof item.text === "string") parts.push(item.text);
    return parts.join(" ");
  }

  // Diakritika-necitlivé, case-insensitive porovnanie.
  function normalizeText(s) {
    s = String(s == null ? "" : s).toLowerCase();
    if (s.normalize) {
      s = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
    }
    return s;
  }

  function makeSearchEmpty(q) {
    var wrap = document.createElement("div");

    var box = document.createElement("div");
    box.className = "empty";
    var em = document.createElement("div");
    em.className = "em";
    em.setAttribute("aria-hidden", "true");
    em.textContent = "🔍";
    var b = document.createElement("b");
    b.textContent = "Nič sa nenašlo pre „" + q + "“";
    var p = document.createElement("p");
    p.textContent = "Skús iné slovo alebo prehľadaj kategórie nižšie.";
    box.appendChild(em);
    box.appendChild(b);
    box.appendChild(p);
    wrap.appendChild(box);

    var cats = state.data.categories || [];
    if (cats.length) {
      var hintLabel = document.createElement("div");
      hintLabel.className = "hint-label";
      hintLabel.textContent = "Skús prehľadať kategórie";
      wrap.appendChild(hintLabel);

      var links = document.createElement("div");
      links.className = "hint-links";
      cats.slice(0, 4).forEach(function (cat) {
        var a = document.createElement("button");
        a.type = "button";
        a.className = "hint-link";
        a.textContent = cat.name || cat.id;
        a.addEventListener("click", function () {
          clearSearch();
          state.categoryId = cat.id;
          state.itemId = null;
          render();
        });
        links.appendChild(a);
      });
      wrap.appendChild(links);
    }
    return wrap;
  }

  /* ---- Detail ---- */
  function renderDetail() {
    var cat = findCategory(state.categoryId);
    var item = findItem(state.itemId);

    // breadcrumb: Kategória > Položka
    var catBtn = document.createElement("button");
    catBtn.type = "button";
    catBtn.className = "crumb-link";
    catBtn.textContent = cat ? (cat.name || cat.id) : state.categoryId;
    catBtn.addEventListener("click", function () {
      state.itemId = null;
      render();
    });
    appendSep(els.breadcrumbTail);
    els.breadcrumbTail.appendChild(catBtn);
    if (item) {
      appendSep(els.breadcrumbTail);
      var cur = document.createElement("span");
      cur.className = "current";
      cur.textContent = item.title || item.id;
      els.breadcrumbTail.appendChild(cur);
    }

    if (!item) {
      els.viewContent.appendChild(makeEmpty("Položka sa nenašla."));
      return;
    }

    var article = document.createElement("article");
    article.className = "detail";

    var h3 = document.createElement("h3");
    h3.className = "det";
    h3.textContent = item.title || item.id;
    article.appendChild(h3);

    // Pill kategórie
    if (cat) {
      var pill = document.createElement("span");
      pill.className = "pill";
      pill.textContent = (cat.icon ? cat.icon + " " : "") + (cat.name || cat.id);
      article.appendChild(pill);
    }

    if (item.body_type === "steps" && Array.isArray(item.steps)) {
      var ol = document.createElement("ol");
      ol.className = "steps";
      item.steps.forEach(function (step, i) {
        var li = document.createElement("li");
        li.className = "step";
        var n = document.createElement("span");
        n.className = "n";
        n.setAttribute("aria-hidden", "true");
        n.textContent = String(i + 1);
        var p = document.createElement("p");
        p.textContent = String(step);
        li.appendChild(n);
        li.appendChild(p);
        ol.appendChild(li);
      });
      article.appendChild(ol);
    } else if (item.body_type === "text" && typeof item.text === "string") {
      var body = document.createElement("div");
      body.className = "body-text";
      // Rozdeľ na odseky podľa prázdnych riadkov
      item.text.split(/\n\s*\n/).forEach(function (para) {
        var trimmed = para.trim();
        if (!trimmed) return;
        var p2 = document.createElement("p");
        p2.textContent = trimmed;
        body.appendChild(p2);
      });
      article.appendChild(body);
    } else {
      article.appendChild(makeEmpty("Táto položka nemá obsah."));
    }

    var attachments = Array.isArray(item.attachments) ? item.attachments : [];
    if (attachments.length) {
      article.appendChild(renderAttachments(attachments));
    }

    els.viewContent.appendChild(article);
  }

  // Validácia cesty prílohy: povolená LEN relatívna cesta do assets/.
  // Odmietne ':' (javascript:, data:, http:, C:), vedúce '/' ('//' protocol-relative
  // aj absolútne), spätné lomítko a '..' (traversal). Vráti cestu alebo null.
  function safeAssetPath(p) {
    if (typeof p !== "string" || !p) return null;
    if (p.indexOf(":") !== -1) return null;
    if (p.charAt(0) === "/") return null;
    if (p.indexOf("\\") !== -1) return null;
    if (p.indexOf("..") !== -1) return null;
    if (p.indexOf("assets/") !== 0) return null;
    return p;
  }

  function renderAttachments(attachments) {
    var wrap = document.createElement("div");
    wrap.className = "attachments";
    var h4 = document.createElement("h4");
    h4.textContent = "Prílohy";
    wrap.appendChild(h4);

    var ul = document.createElement("ul");
    ul.className = "attachment-list";

    attachments.forEach(function (att) {
      var li = document.createElement("li");
      li.className = "attachment";
      var type = att && att.type;
      var path = att && att.path;
      var label = (att && att.label) || "";
      var safePath = safeAssetPath(path); // null pri nebezpečnej/nevalidnej ceste

      if (type === "pdf" && safePath) {
        var a = document.createElement("a");
        a.className = "att-chip";
        a.href = safePath; // overená relatívna cesta v rámci assets/
        a.target = "_blank";
        a.rel = "noopener";
        var badge = document.createElement("span");
        badge.className = "att-badge pdf";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "PDF";
        var name = document.createElement("span");
        name.className = "att-name";
        name.textContent = label || "Otvoriť PDF";
        a.appendChild(badge);
        a.appendChild(name);
        li.appendChild(a);
      } else if (type === "image" && safePath) {
        li.appendChild(makeImageAttachment(safePath, label));
      } else if (type === "video" || type === "audio") {
        var isVideo = type === "video";
        var chip = document.createElement("div");
        chip.className = "att-chip";
        var mbadge = document.createElement("span");
        mbadge.className = "att-badge media";
        mbadge.setAttribute("aria-hidden", "true");
        mbadge.textContent = isVideo ? "🎬" : "🔊";
        var wrapTxt = document.createElement("span");
        wrapTxt.className = "att-name";
        var mname = document.createElement("span");
        mname.textContent = label || (isVideo ? "Video" : "Zvuk");
        var msub = document.createElement("span");
        msub.className = "att-sub";
        msub.textContent = isVideo ? " (video — čoskoro)" : " (zvuk — čoskoro)";
        wrapTxt.appendChild(mname);
        wrapTxt.appendChild(msub);
        chip.appendChild(mbadge);
        chip.appendChild(wrapTxt);
        li.appendChild(chip);
      } else {
        var unk = document.createElement("div");
        unk.className = "att-chip";
        var ubadge = document.createElement("span");
        ubadge.className = "att-badge unknown";
        ubadge.setAttribute("aria-hidden", "true");
        ubadge.textContent = "📎";
        var uname = document.createElement("span");
        uname.className = "att-name";
        uname.textContent = label || "(neznáma príloha)";
        unk.appendChild(ubadge);
        unk.appendChild(uname);
        li.appendChild(unk);
      }
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    return wrap;
  }

  function makeImageAttachment(path, label) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "att-thumb";
    var alt = label || "Obrázok prílohy";
    btn.setAttribute("aria-label", "Zväčšiť obrázok: " + alt);

    var img = document.createElement("img");
    img.src = path;
    img.alt = alt;
    img.loading = "lazy";
    btn.appendChild(img);

    if (label) {
      var cap = document.createElement("span");
      cap.className = "att-caption";
      cap.textContent = label;
      btn.appendChild(cap);
    }

    btn.addEventListener("click", function () {
      openLightbox(path, alt);
    });
    return btn;
  }

  /* ---- Lightbox ---- */
  function openLightbox(src, alt) {
    lightbox.lastFocus = document.activeElement;
    lightbox.img.src = src;
    lightbox.img.alt = alt || "";
    lightbox.root.classList.remove("hidden");
    lightbox.closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.root.classList.add("hidden");
    lightbox.img.src = "";
    lightbox.img.alt = "";
    if (lightbox.lastFocus && typeof lightbox.lastFocus.focus === "function") {
      lightbox.lastFocus.focus();
    }
    lightbox.lastFocus = null;
  }

  /* ---- Navrhované úlohy ---- */
  function renderSuggested() {
    clear(els.suggestedList);
    var tasks = (state.data && Array.isArray(state.data.suggested_tasks))
      ? state.data.suggested_tasks : [];
    if (!tasks.length) {
      var li0 = document.createElement("li");
      li0.className = "task";
      var p0 = document.createElement("p");
      p0.className = "t";
      p0.textContent = "Zatiaľ žiadne navrhované úlohy.";
      li0.appendChild(p0);
      els.suggestedList.appendChild(li0);
      return;
    }
    tasks.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "task";

      var top = document.createElement("div");
      top.className = "top";
      var text = document.createElement("p");
      text.className = "t";
      text.textContent = task.text || "(bez popisu)";
      top.appendChild(text);
      if (task.status) {
        var chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = task.status;
        top.appendChild(chip);
      }
      li.appendChild(top);

      if (task.source_question) {
        var src = document.createElement("p");
        src.className = "src";
        var em = document.createElement("em");
        em.textContent = "z otázky: ";
        src.appendChild(em);
        src.appendChild(document.createTextNode(task.source_question));
        li.appendChild(src);
      }
      els.suggestedList.appendChild(li);
    });
  }

  /* ---- Pomocné funkcie ---- */
  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function makeEmpty(msg) {
    var p = document.createElement("p");
    p.className = "muted";
    p.textContent = msg;
    return p;
  }

  function appendSep(parent) {
    var sep = document.createElement("span");
    sep.className = "sep";
    sep.setAttribute("aria-hidden", "true");
    sep.textContent = "›";
    parent.appendChild(sep);
  }

  function addBreadcrumbCurrent(label) {
    appendSep(els.breadcrumbTail);
    var cur = document.createElement("span");
    cur.className = "current";
    cur.textContent = label;
    els.breadcrumbTail.appendChild(cur);
  }

  function findCategory(id) {
    return (state.data.categories || []).filter(function (c) { return c.id === id; })[0] || null;
  }
  function findItem(id) {
    return (state.data.items || []).filter(function (i) { return i.id === id; })[0] || null;
  }
  function itemsInCategory(catId) {
    return (state.data.items || []).filter(function (i) { return i.category === catId; });
  }
  function countItems(catId) {
    return itemsInCategory(catId).length;
  }
  function pluralItems(n) {
    if (n === 1) return "položka";
    if (n >= 2 && n <= 4) return "položky";
    return "položiek";
  }

  function formatDate(iso) {
    // Bezpečné: ak sa nedá parsovať, vráť pôvodný reťazec
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return String(iso);
      return d.toLocaleDateString("sk-SK", { year: "numeric", month: "long", day: "numeric" });
    } catch (e) {
      return String(iso);
    }
  }
})();

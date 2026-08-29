/* Firemná príručka — vanilla JS render z content.json.
 * Bezpečnosť: obsah z content.json vkladáme cez textContent / bezpečné DOM API,
 * nikdy nie cez innerHTML so surovými dátami (ochrana proti XSS).
 */
(function () {
  "use strict";

  var state = { data: null, categoryId: null, itemId: null };

  var els = {};

  document.addEventListener("DOMContentLoaded", function () {
    els.status = document.getElementById("status");
    els.viewContent = document.getElementById("view-content");
    els.suggestedList = document.getElementById("suggested-list");
    els.breadcrumbTail = document.getElementById("breadcrumb-tail");
    els.title = document.getElementById("app-title");
    els.updated = document.getElementById("app-updated");
    els.homeBtn = document.getElementById("home-btn");

    els.homeBtn.addEventListener("click", function () {
      state.categoryId = null;
      state.itemId = null;
      render();
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

  /* ---- Router / render ---- */
  function render() {
    clear(els.viewContent);
    clear(els.breadcrumbTail);

    if (!state.data) return;

    if (state.categoryId && state.itemId) {
      renderDetail();
    } else if (state.categoryId) {
      renderItemList();
    } else {
      renderCategoryList();
    }
    // Fokus na obsah pre klávesnicovú navigáciu
    var main = document.getElementById("main");
    if (main) main.focus();
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
      var count = countItems(cat.id);
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-button";

      var title = document.createElement("span");
      title.className = "card-title";
      title.textContent = cat.name || cat.id;

      var meta = document.createElement("span");
      meta.className = "card-meta";
      meta.textContent = count + " " + pluralItems(count);

      btn.appendChild(title);
      btn.appendChild(meta);
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
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-button";

      var title = document.createElement("span");
      title.className = "card-title";
      title.textContent = item.title || item.id;

      var meta = document.createElement("span");
      meta.className = "card-meta";
      meta.textContent = item.body_type === "steps" ? "Postup (kroky)" : "Text";

      btn.appendChild(title);
      btn.appendChild(meta);
      btn.addEventListener("click", function () {
        state.itemId = item.id;
        render();
      });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    els.viewContent.appendChild(ul);
  }

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
    h3.textContent = item.title || item.id;
    article.appendChild(h3);

    if (item.body_type === "steps" && Array.isArray(item.steps)) {
      var ol = document.createElement("ol");
      item.steps.forEach(function (step) {
        var li = document.createElement("li");
        li.textContent = String(step);
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
        var p = document.createElement("p");
        p.textContent = trimmed;
        body.appendChild(p);
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

      if (type === "pdf" && path) {
        var a = document.createElement("a");
        a.href = path; // relatívna cesta v rámci assets/
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = label || "Otvoriť PDF";
        li.appendChild(a);
      } else if (type === "image" && path) {
        var img = document.createElement("img");
        img.src = path;
        img.alt = label || "Obrázok prílohy";
        img.loading = "lazy";
        li.appendChild(img);
        if (label) {
          var cap = document.createElement("div");
          cap.className = "att-label";
          cap.textContent = label;
          li.appendChild(cap);
        }
      } else if (type === "video" || type === "audio") {
        var ph = document.createElement("div");
        ph.className = "placeholder";
        ph.textContent = "(video/zvuk — čoskoro)";
        li.appendChild(ph);
        if (label) {
          var cap2 = document.createElement("div");
          cap2.className = "att-label";
          cap2.textContent = label;
          li.appendChild(cap2);
        }
      } else {
        var unk = document.createElement("div");
        unk.className = "placeholder";
        unk.textContent = "(neznáma príloha)";
        li.appendChild(unk);
      }
      ul.appendChild(li);
    });

    wrap.appendChild(ul);
    return wrap;
  }

  function renderSuggested() {
    clear(els.suggestedList);
    var tasks = (state.data && Array.isArray(state.data.suggested_tasks))
      ? state.data.suggested_tasks : [];
    if (!tasks.length) {
      var li = document.createElement("li");
      li.className = "suggested-item";
      li.textContent = "Zatiaľ žiadne navrhované úlohy.";
      els.suggestedList.appendChild(li);
      return;
    }
    tasks.forEach(function (task) {
      var li = document.createElement("li");
      li.className = "suggested-item";

      var text = document.createElement("div");
      text.className = "task-text";
      text.textContent = task.text || "(bez popisu)";
      if (task.status) {
        var badge = document.createElement("span");
        badge.className = "badge";
        badge.textContent = task.status;
        text.appendChild(badge);
      }
      li.appendChild(text);

      if (task.source_question) {
        var meta = document.createElement("div");
        meta.className = "task-meta";
        meta.textContent = "Otázka: " + task.source_question;
        li.appendChild(meta);
      }
      if (task.date) {
        var d = document.createElement("div");
        d.className = "task-meta";
        d.textContent = "Dátum: " + formatDate(task.date);
        li.appendChild(d);
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

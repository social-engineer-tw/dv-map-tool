(function () {
  const data = window.siteData || {};

  const state = {
    activePage: "home",
    activeStageId: data.stages && data.stages[0] ? data.stages[0].id : null,
    activeNeedId: data.needs && data.needs[0] ? data.needs[0].id : null
  };

  const elements = {
    pageButtons: document.querySelectorAll("[data-page-target]"),
    pagePanels: document.querySelectorAll("[data-page]"),
    heroEyebrow: document.querySelector(".hero-card .eyebrow"),
    heroTitle: document.querySelector(".hero-card__content h1"),
    heroLead: document.querySelector(".hero-card__lead"),
    heroNoteTitle: document.querySelector(".hero-note h2"),
    heroNoteList: document.querySelector(".hero-note ul"),
    homeEntryCards: document.querySelector("#home-entry-cards"),
    homeQuickSupport: document.querySelector("#home-quick-support"),
    homeEmergencyList: document.querySelector("#home-emergency-list"),
    homePositioning: document.querySelector("#home-positioning"),
    stageProgress: document.querySelector("#stage-progress"),
    stageList: document.querySelector("#stage-list"),
    stageDetail: document.querySelector("#stage-detail"),
    needList: document.querySelector("#need-list"),
    needDetail: document.querySelector("#need-detail"),
    primaryServices: document.querySelector("#primary-services"),
    partnerServices: document.querySelector("#partner-services"),
    extendedServices: document.querySelector("#extended-services"),
    victimService: document.querySelector("#victim-service"),
    crisisActions: document.querySelector("#crisis-actions"),
    crisisHotlines: document.querySelector("#crisis-hotlines"),
    crisisNote: document.querySelector("#crisis-note"),
    aboutBlocks: document.querySelector("#about-blocks"),
    selfLocatorForm: document.querySelector("#self-locator-form"),
    locatorResult: document.querySelector("#locator-result"),
    backToTop: document.querySelector("#back-to-top")
  };

  function setActivePage(nextPage, scrollTargetId) {
    state.activePage = nextPage;

    elements.pageButtons.forEach((button) => {
      const isActive = button.dataset.pageTarget === nextPage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });

    elements.pagePanels.forEach((panel) => {
      const isActive = panel.dataset.page === nextPage;
      panel.classList.toggle("is-active", isActive);
      panel.hidden = !isActive;
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (scrollTargetId) {
      window.setTimeout(() => {
        const target = document.getElementById(scrollTargetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 180);
    }
  }

  function getStageById(stageId) {
    return (data.stages || []).find((item) => item.id === stageId) || null;
  }

  function getNeedById(needId) {
    return (data.needs || []).find((item) => item.id === needId) || null;
  }

  function normalizePhoneTarget(value) {
    return String(value || "").split(",")[0].replace(/[^\d]/g, "");
  }

  function getResourceById(resourceId) {
    const groups = data.resourceDirectory || {};
    return Object.values(groups)
      .flat()
      .find((item) => item.id === resourceId) || null;
  }

  function renderResourceMiniCard(resourceId, mode) {
    const item = getResourceById(resourceId);
    if (!item) {
      return "";
    }

    const tags = (item.tags || []).slice(0, 3).map((tag) => `<span class="tag">${tag}</span>`).join("");
    const phone = item.phoneLabel
      ? `<a class="phone-pill ${item.visualType === "phone-priority" ? "phone-pill--alert" : ""}" href="tel:${item.tel}">${item.phoneLabel}</a>`
      : "";
    const titleTag = mode === "compact" ? "h4" : "h3";

    return `
      <article class="support-card support-card--${item.visualType || "support"}">
        <span class="support-card__icon" aria-hidden="true">${item.icon || "資"}</span>
        <${titleTag}>${item.title}</${titleTag}>
        <p class="support-card__subtitle">${item.subtitle || item.category || ""}</p>
        <p class="support-card__summary">${item.summary}</p>
        <div class="tag-list">${tags}</div>
        <div class="support-card__actions">
          ${phone}
          ${item.website ? `<a class="secondary-button" href="${item.website}" target="_blank" rel="noreferrer">查看資訊</a>` : ""}
        </div>
      </article>
    `;
  }

  function renderHome() {
    const hero = data.home.hero || {};

    if (elements.heroEyebrow && hero.eyebrow) {
      elements.heroEyebrow.textContent = hero.eyebrow;
    }

    if (elements.heroTitle && hero.title) {
      elements.heroTitle.textContent = hero.title;
    }

    if (elements.heroLead && hero.lead) {
      elements.heroLead.textContent = hero.lead;
    }

    if (elements.heroNoteTitle && hero.noteTitle) {
      elements.heroNoteTitle.textContent = hero.noteTitle;
    }

    if (elements.heroNoteList && Array.isArray(hero.noteItems) && hero.noteItems.length) {
      elements.heroNoteList.innerHTML = hero.noteItems.map((item) => `<li>${item}</li>`).join("");
    }

    elements.homeEntryCards.innerHTML = (data.home.entryCards || [])
      .map(
        (item) => `
          <button
            class="entry-card"
            type="button"
            data-go-page="${item.page}"
            ${item.targetType ? `data-target-type="${item.targetType}"` : ""}
            ${item.targetId ? `data-target-id="${item.targetId}"` : ""}
          >
            <span class="entry-card__icon" aria-hidden="true">${item.icon}</span>
            <p class="section-label">主要入口</p>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span class="entry-card__action">立即查看</span>
          </button>
        `
      )
      .join("");

    elements.homeEmergencyList.innerHTML = (data.home.emergencyReminders || [])
      .map(
        (item) => `
          <article class="reminder-card">
            <h3>先停一下</h3>
            <p>${item}</p>
          </article>
        `
      )
      .join("");

    elements.homePositioning.innerHTML = `
      <ul class="statement-list">
        ${(data.home.positioning || []).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;

    elements.homeQuickSupport.innerHTML = (data.home.quickSupport || [])
      .map((resourceId) => renderResourceMiniCard(resourceId, "compact"))
      .join("");
  }

  function createAccordionSection(title, content, isList) {
    const body = isList ? `<ul>${content.map((item) => `<li>${item}</li>`).join("")}</ul>` : `<p>${content}</p>`;
    return `
      <details class="accordion-item">
        <summary>${title}</summary>
        <div class="accordion-item__content">${body}</div>
      </details>
    `;
  }

  function renderStageProgress() {
    elements.stageProgress.innerHTML = (data.stages || [])
      .map((item, index) => {
        const isActive = item.id === state.activeStageId;
        return `
          <button class="stage-pill ${isActive ? "is-active" : ""}" type="button" data-stage-id="${item.id}">
            <span class="stage-pill__index">${index + 1}</span>
            <span class="stage-pill__title">${item.title}</span>
          </button>
        `;
      })
      .join("");

    elements.stageProgress.querySelectorAll("[data-stage-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeStageId = button.dataset.stageId;
        renderStageProgress();
        renderStageList();
        renderStageDetail();
      });
    });
  }

  function renderStageList() {
    elements.stageList.innerHTML = (data.stages || [])
      .map((item) => {
        const isActive = item.id === state.activeStageId;
        return `
          <button class="selection-card ${isActive ? "is-active" : ""}" type="button" data-stage-id="${item.id}">
            <span class="selection-card__icon" aria-hidden="true">${item.icon}</span>
            <p class="section-label">${item.tag}</p>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <span class="selection-card__action">查看下一步</span>
          </button>
        `;
      })
      .join("");

    elements.stageList.querySelectorAll("[data-stage-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeStageId = button.dataset.stageId;
        renderStageProgress();
        renderStageList();
        renderStageDetail();
      });
    });
  }

  function renderStageDetail() {
    const stage = getStageById(state.activeStageId);
    if (!stage) {
      return;
    }

    elements.stageDetail.innerHTML = `
      <article class="detail-card">
        <div class="detail-card__hero">
          <span class="detail-card__icon" aria-hidden="true">${stage.icon}</span>
          <div>
            <p class="section-label">${stage.tag}</p>
            <h2>${stage.title}</h2>
            <p class="detail-intro">${stage.summary}</p>
          </div>
        </div>

        <div class="accordion-list">
          ${createAccordionSection("這個階段大概在做什麼", stage.what, false)}
          ${createAccordionSection("你可能會遇到哪些通知或要求", stage.notices, true)}
          ${createAccordionSection("你現在常見的困惑", stage.confusion, true)}
          ${createAccordionSection("你現在可以先做什麼", stage.canDo, true)}
          ${createAccordionSection("這個階段常見可用資源", stage.resources, true)}
          ${createAccordionSection("社工提醒", stage.socialWorkTip, false)}
          ${createAccordionSection("可能的下一步", stage.nextStep, false)}
        </div>

        <div class="resource-strip">
          <div class="resource-strip__header">
            <p class="section-label">這個階段常見會用到的資源</p>
          </div>
          <div class="support-grid support-grid--mini">
            ${(stage.resourceIds || []).map((resourceId) => renderResourceMiniCard(resourceId, "mini")).join("")}
          </div>
        </div>
      </article>
    `;
  }

  function renderNeedList() {
    elements.needList.innerHTML = (data.needs || [])
      .map((item) => {
        const isActive = item.id === state.activeNeedId;
        return `
          <button class="selection-card ${isActive ? "is-active" : ""}" type="button" data-need-id="${item.id}">
            <span class="selection-card__icon" aria-hidden="true">${item.icon}</span>
            <p class="section-label">需求入口</p>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
            <span class="selection-card__action">立即查看</span>
          </button>
        `;
      })
      .join("");

    elements.needList.querySelectorAll("[data-need-id]").forEach((button) => {
      button.addEventListener("click", () => {
        state.activeNeedId = button.dataset.needId;
        renderNeedList();
        renderNeedDetail();
      });
    });
  }

  function renderNeedDetail() {
    const need = getNeedById(state.activeNeedId);
    if (!need) {
      return;
    }

    elements.needDetail.innerHTML = `
      <article class="detail-card">
        <div class="detail-card__hero">
          <span class="detail-card__icon" aria-hidden="true">${need.icon}</span>
          <div>
            <p class="section-label">目前需求</p>
            <h2>${need.title}</h2>
            <p class="detail-intro">${need.summary}</p>
          </div>
        </div>

        <div class="accordion-list">
          ${createAccordionSection("這種情況常見會發生什麼", need.whatHappens, false)}
          ${createAccordionSection("你現在可以先做什麼", need.firstSteps, true)}
          ${createAccordionSection("哪些臺南資源可能幫得上忙", need.resources, true)}
          <details class="accordion-item">
            <summary>哪些求助電話可以先打</summary>
            <div class="accordion-item__content">
              <div class="phone-list">
                ${need.phones
                  .map((phone) => `<a class="phone-pill" href="tel:${normalizePhoneTarget(phone)}">${phone}</a>`)
                  .join("")}
              </div>
            </div>
          </details>
          ${createAccordionSection("提醒", need.reminder, false)}
        </div>

        <div class="detail-actions">
          <button class="secondary-button" type="button" data-page-target="services">查看臺南窗口</button>
          <button class="secondary-button" type="button" data-page-target="stages">查看目前階段</button>
          <button class="secondary-button secondary-button--alert" type="button" data-page-target="crisis">前往情緒快失控頁</button>
        </div>

        <div class="resource-strip">
          <div class="resource-strip__header">
            <p class="section-label">你還可以找的其他資源</p>
          </div>
          <div class="support-grid support-grid--mini">
            ${(need.resourceIds || []).map((resourceId) => renderResourceMiniCard(resourceId, "mini")).join("")}
          </div>
        </div>
      </article>
    `;

    bindDynamicPageButtons();
  }

  function renderServiceCard(unit) {
    const phoneHtml =
      unit.phones && unit.phones.length
        ? unit.phones
            .map(
              (phone) => `
                <a class="phone-pill" href="tel:${phone.tel}">
                  ${phone.label}
                </a>
              `
            )
            .join("")
        : '<p class="muted-note">聯絡資訊待補，可先由正式窗口協助確認。</p>';

    const addressHtml = unit.address
      ? `<p><strong>地址：</strong>${unit.address}</p>`
      : `<p><strong>地址：</strong>待補，建議先由正式窗口或合作窗口確認。</p>`;

    const websiteHtml = unit.website
      ? `<p><strong>網站：</strong><a href="${unit.website}" target="_blank" rel="noreferrer">${unit.website}</a></p>`
      : "";

    const scopeHtml = unit.serviceScope ? `<p><strong>服務內容：</strong>${unit.serviceScope}</p>` : "";

    return `
      <article class="service-card">
        <span class="service-card__icon" aria-hidden="true">${unit.icon || "窗"}</span>
        <h3>${unit.title}</h3>
        <div class="service-meta">
          <section>
            <p class="section-label">角色定位</p>
            <p>${unit.role}</p>
          </section>
          <section>
            <p class="section-label">適合什麼情況</p>
            <p>${unit.description}</p>
          </section>
          <section>
            <p class="section-label">聯絡方式</p>
            <div class="phone-list">${phoneHtml}</div>
            ${addressHtml}
            ${scopeHtml}
            ${websiteHtml}
          </section>
        </div>
        <p class="muted-note">${unit.note}</p>
      </article>
    `;
  }

  function renderServices() {
    elements.primaryServices.innerHTML = (data.services.primary || []).map(renderServiceCard).join("");
    elements.partnerServices.innerHTML = (data.services.partner || []).map(renderServiceCard).join("");
    elements.extendedServices.innerHTML = (data.services.extended || [])
      .map((resourceId) => renderResourceMiniCard(resourceId, "full"))
      .join("");

    const victim = data.services.victimRedirect;
    elements.victimService.innerHTML = `
      <p class="section-label">保護服務入口</p>
      <h3>${victim.title}</h3>
      <p>${victim.description}</p>
      <div class="phone-list">
        <a class="phone-pill phone-pill--alert" href="tel:${victim.tel}">${victim.phone}</a>
      </div>
      <p><strong>網站：</strong><a href="${victim.website}" target="_blank" rel="noreferrer">${victim.website}</a></p>
      <p class="muted-note">這個區塊不是本網站主要服務對象的主入口，但如果你需要保護服務，請直接改由此入口尋求協助。</p>
    `;
  }

  function renderCrisis() {
    elements.crisisActions.innerHTML = (data.crisis.actions || [])
      .map(
        (item) => `
          <article class="reminder-card reminder-card--alert">
            <h3>現在先做</h3>
            <p>${item}</p>
          </article>
        `
      )
      .join("");

    const groups = {};
    (data.crisis.hotlines || []).forEach((item) => {
      groups[item.category] = groups[item.category] || [];
      groups[item.category].push(item);
    });

    elements.crisisHotlines.innerHTML = Object.entries(groups)
      .map(
        ([groupName, items]) => `
          <section class="hotline-group">
            <div class="hotline-group__header">
              <p class="section-label">${groupName}</p>
            </div>
            <div class="hotline-grid">
              ${items
                .map(
                  (item) => `
                    <article class="hotline-card ${item.badge === "優先" ? "hotline-card--priority" : ""}">
                      <p class="hotline-badge">${item.badge}</p>
                      <h3>${item.name}</h3>
                      <p class="hotline-subtitle">${item.subtitle}</p>
                      <a class="primary-button primary-button--block" href="tel:${item.tel}">立即撥打</a>
                    </article>
                  `
                )
                .join("")}
            </div>
          </section>
        `
      )
      .join("");

    elements.crisisNote.innerHTML = `
      <ul class="statement-list">
        ${(data.crisis.note || []).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    `;
  }

  function renderAbout() {
    elements.aboutBlocks.innerHTML = (data.about || [])
      .map(
        (item) => `
          <article class="about-card">
            <h3>${item.title}</h3>
            <p>${item.body}</p>
          </article>
        `
      )
      .join("");
  }

  function evaluateLocator(formValues) {
    const stageMap = {
      "after-incident": "stage-1",
      "court-notice": "stage-2",
      assessment: "stage-3",
      "ongoing-treatment": "stage-4",
      "follow-up": "stage-5"
    };

    const concernMap = {
      emotion: "我現在情緒快失控了",
      legal: "我現在在哪個階段",
      family: "我需要什麼幫助",
      substance: "我需要什麼幫助",
      work: "我需要什麼幫助",
      change: "我需要什麼幫助"
    };

    const windowMap = {
      emotion: "先用立即可用電話資源，必要時再聯絡臺南相對人服務窗口",
      legal: "先聯絡臺南市政府衛生局或合作單位，確認通知內容",
      family: "先聯絡臺南相對人服務窗口，討論衝突與配合安排",
      substance: "先聯絡臺南市政府衛生局，必要時請求心理或酒藥轉介",
      work: "先聯絡正式窗口或合作單位，討論生活與配合壓力",
      change: "先做一個明確入口選擇，再聯絡臺南相對人服務窗口"
    };

    const stageId = stageMap[formValues.noticeStatus] || "stage-1";
    const stage = getStageById(stageId);
    const priorities = [];

    if (formValues.riskLevel === "high") {
      priorities.push("先降低立即衝突風險與人身危險");
    }
    if (formValues.primaryNeed === "understand-process" || formValues.mainConcern === "legal") {
      priorities.push("先看懂流程與通知內容");
    }
    if (formValues.primaryNeed === "stabilize-emotion" || formValues.mainConcern === "emotion") {
      priorities.push("先穩定情緒與停下高風險行為");
    }
    if (formValues.primaryNeed === "find-window") {
      priorities.push("先找到臺南可直接聯絡的窗口");
    }
    if (formValues.primaryNeed === "life-support" || formValues.mainConcern === "work") {
      priorities.push("先整理生活與經濟壓力");
    }
    if (formValues.mainConcern === "substance") {
      priorities.push("把酒精、藥物或情緒困擾納入處理");
    }

    const suggestedPage =
      formValues.riskLevel === "high"
        ? "我現在情緒快失控了"
        : concernMap[formValues.mainConcern] || "我現在在哪個階段";

    return {
      stage,
      priorities: priorities.length ? priorities : ["先整理目前流程與主要壓力來源"],
      suggestedPage,
      suggestedWindow: windowMap[formValues.mainConcern] || "先聯絡臺南相對人服務窗口"
    };
  }

  function renderLocatorResult(result) {
    elements.locatorResult.innerHTML = `
      <p class="section-label">導覽結果</p>
      <h3>你目前可以先從這三件事開始</h3>
      <div class="result-card-grid">
        <article class="result-card">
          <p class="section-label">可能階段</p>
          <h4>${result.stage ? result.stage.title : "需要再確認的階段"}</h4>
          <p>${result.stage ? result.stage.summary : "先從流程頁開始看。"}</p>
        </article>
        <article class="result-card">
          <p class="section-label">優先需求</p>
          <h4>${result.priorities[0]}</h4>
          <div class="tag-list">
            ${result.priorities.map((item) => `<span class="tag">${item}</span>`).join("")}
          </div>
        </article>
        <article class="result-card">
          <p class="section-label">建議先做</p>
          <h4>${result.suggestedPage}</h4>
          <p>${result.suggestedWindow}</p>
        </article>
      </div>
    `;
  }

  function bindPageButtons() {
    elements.pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = button.dataset.pageTarget;
        const scrollTarget = button.dataset.scrollTarget || "";
        if (nextPage) {
          setActivePage(nextPage, scrollTarget);
        }
      });
    });
  }

  function bindDynamicPageButtons() {
    document.querySelectorAll(".detail-actions [data-page-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = button.dataset.pageTarget;
        if (nextPage) {
          setActivePage(nextPage);
        }
      });
    });
  }

  function bindHomeCards() {
    elements.homeEntryCards.querySelectorAll("[data-go-page]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextPage = button.dataset.goPage;
        const targetType = button.dataset.targetType;
        const targetId = button.dataset.targetId;

        if (targetType === "stage" && targetId) {
          state.activeStageId = targetId;
          renderStageList();
          renderStageDetail();
        }

        if (targetType === "need" && targetId) {
          state.activeNeedId = targetId;
          renderNeedList();
          renderNeedDetail();
        }

        setActivePage(nextPage);
      });
    });
  }

  function bindLocator() {
    elements.selfLocatorForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(elements.selfLocatorForm);
      const values = Object.fromEntries(formData.entries());
      const result = evaluateLocator(values);
      renderLocatorResult(result);
    });
  }

  function bindBackToTop() {
    const toggleVisibility = () => {
      if (!elements.backToTop) {
        return;
      }
      elements.backToTop.classList.toggle("is-visible", window.scrollY > 320);
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    toggleVisibility();

    if (elements.backToTop) {
      elements.backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  function init() {
    renderHome();
    renderStageProgress();
    renderStageList();
    renderStageDetail();
    renderNeedList();
    renderNeedDetail();
    renderServices();
    renderCrisis();
    renderAbout();
    bindPageButtons();
    bindHomeCards();
    bindLocator();
    bindBackToTop();
  }

  init();
})();

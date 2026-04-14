(function () {
  const root = document.getElementById("admin-app");

  if (!root) {
    return;
  }

  const page = root.dataset.adminPage || "dashboard";
  const supabaseHelper = window.AppSupabase;

  if (!supabaseHelper) {
    root.innerHTML = createStandaloneMessage(
      "找不到 Supabase 客戶端",
      "請確認 shared/supabase-client.js 已正確載入。"
    );
    return;
  }

  if (!supabaseHelper.hasConfig()) {
    root.innerHTML = createStandaloneMessage(
      "尚未設定 Supabase 連線資訊",
      "請先在 config/supabase.js 填入 SUPABASE_URL 與 SUPABASE_ANON_KEY，後臺才可登入與讀寫內容。"
    );
    return;
  }

  const supabase = supabaseHelper.createClient({
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  const PAGE_CONFIG = {
    "home-content": {
      title: "首頁內容管理",
      description: "編輯首頁首屏、緊急提醒與快速支持區塊。這一頁先做成單筆內容管理。",
      mode: "singleton",
      table: "site_sections",
      keyField: "section_key",
      fixedKey: "home",
      fields: [
        field("hero_eyebrow", "首屏眉標"),
        field("hero_title", "首屏主標"),
        field("hero_lead", "首屏副標", { type: "textarea" }),
        field("hero_note_title", "首屏提醒標題"),
        field("hero_note_items", "首屏提醒內容", {
          type: "textarea",
          hint: "每行一筆。"
        }),
        field("emergency_reminders", "緊急提醒", {
          type: "textarea",
          hint: "每行一筆。"
        }),
        field("positioning", "網站定位聲明", {
          type: "textarea",
          hint: "每行一筆。"
        }),
        field("quick_support", "首頁快速支持資源 key", {
          type: "textarea",
          hint: "每行一筆，例如 tainan-health-perpetrator。"
        }),
        field("is_enabled", "啟用這個區塊", { type: "checkbox" }),
        field("is_published", "前台顯示", { type: "checkbox" })
      ],
      deserialize(record) {
        const hero = record?.content?.hero || {};
        return {
          hero_eyebrow: hero.eyebrow || "",
          hero_title: hero.title || record?.title || "",
          hero_lead: hero.lead || record?.summary || "",
          hero_note_title: hero.noteTitle || "",
          hero_note_items: toMultiline(hero.noteItems),
          emergency_reminders: toMultiline(record?.content?.emergencyReminders),
          positioning: toMultiline(record?.content?.positioning),
          quick_support: toMultiline(record?.content?.quickSupport),
          is_enabled: record?.is_enabled ?? true,
          is_published: record?.is_published ?? true
        };
      },
      serialize(values, existing) {
        return {
          id: existing?.id,
          section_key: "home",
          page_key: "home",
          title: values.hero_title,
          summary: values.hero_lead,
          sort_order: 0,
          is_enabled: values.is_enabled,
          is_published: values.is_published,
          content: {
            hero: {
              eyebrow: values.hero_eyebrow,
              title: values.hero_title,
              lead: values.hero_lead,
              noteTitle: values.hero_note_title,
              noteItems: fromMultiline(values.hero_note_items)
            },
            emergencyReminders: fromMultiline(values.emergency_reminders),
            positioning: fromMultiline(values.positioning),
            quickSupport: fromMultiline(values.quick_support)
          }
        };
      }
    },
    "flow-stages": {
      title: "流程階段管理",
      description: "編輯五階段流程的摘要與細節，可排序、停用與發布。",
      mode: "collection",
      table: "flow_stages",
      keyField: "stage_key",
      orderField: "stage_order",
      fields: [
        field("stage_key", "階段 key"),
        field("stage_order", "排序", { type: "number" }),
        field("tag", "階段標籤"),
        field("icon", "圖示 / 數字"),
        field("title", "標題"),
        field("summary", "摘要", { type: "textarea" }),
        field("what_text", "這個階段在做什麼", { type: "textarea" }),
        field("notices", "可能收到的通知或要求", { type: "textarea", hint: "每行一筆。" }),
        field("confusion", "常見困惑", { type: "textarea", hint: "每行一筆。" }),
        field("can_do", "現在可以先做什麼", { type: "textarea", hint: "每行一筆。" }),
        field("resources", "常見可用資源", { type: "textarea", hint: "每行一筆。" }),
        field("resource_card_keys", "資源卡 key", { type: "textarea", hint: "每行一筆。" }),
        field("social_work_tip", "社工提醒", { type: "textarea" }),
        field("next_step", "可能的下一步", { type: "textarea" }),
        field("is_enabled", "啟用這筆內容", { type: "checkbox" }),
        field("is_published", "前台顯示", { type: "checkbox" })
      ],
      deserialize(record) {
        return {
          stage_key: record?.stage_key || "",
          stage_order: record?.stage_order ?? 0,
          tag: record?.tag || "",
          icon: record?.icon || "",
          title: record?.title || "",
          summary: record?.summary || "",
          what_text: record?.what_text || "",
          notices: toMultiline(record?.notices),
          confusion: toMultiline(record?.confusion),
          can_do: toMultiline(record?.can_do),
          resources: toMultiline(record?.resources),
          resource_card_keys: toMultiline(record?.resource_card_keys),
          social_work_tip: record?.social_work_tip || "",
          next_step: record?.next_step || "",
          is_enabled: record?.is_enabled ?? true,
          is_published: record?.is_published ?? true
        };
      },
      serialize(values, existing) {
        return {
          id: existing?.id,
          stage_key: values.stage_key,
          stage_order: toNumber(values.stage_order),
          tag: values.tag,
          icon: values.icon,
          title: values.title,
          summary: values.summary,
          what_text: values.what_text,
          notices: fromMultiline(values.notices),
          confusion: fromMultiline(values.confusion),
          can_do: fromMultiline(values.can_do),
          resources: fromMultiline(values.resources),
          resource_card_keys: fromMultiline(values.resource_card_keys),
          social_work_tip: values.social_work_tip,
          next_step: values.next_step,
          is_enabled: values.is_enabled,
          is_published: values.is_published
        };
      }
    },
    "need-pages": {
      title: "需求頁管理",
      description: "編輯六大需求頁內容、延伸支持與提醒文字，可排序與上下架。",
      mode: "collection",
      table: "need_pages",
      keyField: "need_key",
      orderField: "need_order",
      fields: [
        field("need_key", "需求 key"),
        field("need_order", "排序", { type: "number" }),
        field("icon", "圖示"),
        field("title", "標題"),
        field("summary", "摘要", { type: "textarea" }),
        field("what_happens", "常見會發生什麼", { type: "textarea" }),
        field("first_steps", "你現在可以先做什麼", { type: "textarea", hint: "每行一筆。" }),
        field("resources", "哪些資源可能幫得上忙", { type: "textarea", hint: "每行一筆。" }),
        field("resource_card_keys", "延伸資源卡 key", { type: "textarea", hint: "每行一筆。" }),
        field("phones", "可先打的電話", { type: "textarea", hint: "每行一筆。" }),
        field("reminder", "溫和提醒", { type: "textarea" }),
        field("is_enabled", "啟用這筆內容", { type: "checkbox" }),
        field("is_published", "前台顯示", { type: "checkbox" })
      ],
      deserialize(record) {
        return {
          need_key: record?.need_key || "",
          need_order: record?.need_order ?? 0,
          icon: record?.icon || "",
          title: record?.title || "",
          summary: record?.summary || "",
          what_happens: record?.what_happens || "",
          first_steps: toMultiline(record?.first_steps),
          resources: toMultiline(record?.resources),
          resource_card_keys: toMultiline(record?.resource_card_keys),
          phones: toMultiline(record?.phones),
          reminder: record?.reminder || "",
          is_enabled: record?.is_enabled ?? true,
          is_published: record?.is_published ?? true
        };
      },
      serialize(values, existing) {
        return {
          id: existing?.id,
          need_key: values.need_key,
          need_order: toNumber(values.need_order),
          icon: values.icon,
          title: values.title,
          summary: values.summary,
          what_happens: values.what_happens,
          first_steps: fromMultiline(values.first_steps),
          resources: fromMultiline(values.resources),
          resource_card_keys: fromMultiline(values.resource_card_keys),
          phones: fromMultiline(values.phones),
          reminder: values.reminder,
          is_enabled: values.is_enabled,
          is_published: values.is_published
        };
      }
    },
    "resource-cards": {
      title: "資源卡管理",
      description: "管理正式窗口、合作單位與延伸支持資源卡，可排序與切換顯示。",
      mode: "collection",
      table: "resource_cards",
      keyField: "card_key",
      orderField: "sort_order",
      fields: [
        field("card_key", "資源 key"),
        field("sort_order", "排序", { type: "number" }),
        field("directory_group", "資源群組", {
          type: "select",
          options: [
            option("crisis", "危機與情緒支持"),
            option("addiction", "酒癮與成癮支持"),
            option("legal", "法律與程序支持"),
            option("stability", "就業與生活穩定"),
            option("family", "家庭與親職支持")
          ]
        }),
        field("visual_type", "視覺層級", {
          type: "select",
          options: [
            option("official", "正式窗口"),
            option("support", "延伸支持"),
            option("phone-priority", "優先電話"),
            option("phone-support", "支持電話")
          ]
        }),
        field("kind", "內容型態", {
          type: "select",
          options: [option("service", "服務卡"), option("hotline", "電話卡")]
        }),
        field("category_key", "分類 key"),
        field("icon", "圖示"),
        field("title", "標題"),
        field("subtitle", "副標"),
        field("summary", "摘要", { type: "textarea" }),
        field("tags", "重點標籤", { type: "textarea", hint: "每行一筆。" }),
        field("phone_label", "電話顯示文字"),
        field("tel", "撥號號碼"),
        field("address", "地址"),
        field("website", "網站"),
        field("role_label", "角色定位"),
        field("description", "內容說明", { type: "textarea" }),
        field("service_scope", "適合什麼情況", { type: "textarea" }),
        field("note", "備註 / 待補資訊", { type: "textarea" }),
        field("is_enabled", "啟用這筆內容", { type: "checkbox" }),
        field("is_published", "前台顯示", { type: "checkbox" })
      ],
      deserialize(record) {
        return {
          card_key: record?.card_key || "",
          sort_order: record?.sort_order ?? 0,
          directory_group: record?.directory_group || "stability",
          visual_type: record?.visual_type || "support",
          kind: record?.kind || "service",
          category_key: record?.category_key || "",
          icon: record?.icon || "",
          title: record?.title || "",
          subtitle: record?.subtitle || "",
          summary: record?.summary || "",
          tags: toMultiline(record?.tags),
          phone_label: record?.phone_label || "",
          tel: record?.tel || "",
          address: record?.address || "",
          website: record?.website || "",
          role_label: record?.role_label || "",
          description: record?.description || "",
          service_scope: record?.service_scope || "",
          note: record?.note || "",
          is_enabled: record?.is_enabled ?? true,
          is_published: record?.is_published ?? true
        };
      },
      serialize(values, existing) {
        return {
          id: existing?.id,
          card_key: values.card_key,
          sort_order: toNumber(values.sort_order),
          directory_group: values.directory_group,
          visual_type: values.visual_type,
          kind: values.kind,
          category_key: values.category_key,
          icon: values.icon,
          title: values.title,
          subtitle: values.subtitle,
          summary: values.summary,
          tags: fromMultiline(values.tags),
          phone_label: values.phone_label,
          tel: values.tel,
          address: values.address,
          website: values.website,
          role_label: values.role_label,
          description: values.description,
          service_scope: values.service_scope,
          note: values.note,
          is_enabled: values.is_enabled,
          is_published: values.is_published
        };
      }
    },
    hotlines: {
      title: "危機電話管理",
      description: "管理危機頁與需求頁用到的電話資源，可排序、停用與上下架。",
      mode: "collection",
      table: "hotlines",
      keyField: "hotline_key",
      orderField: "sort_order",
      fields: [
        field("hotline_key", "電話 key"),
        field("sort_order", "排序", { type: "number" }),
        field("category", "分類"),
        field("badge", "標籤"),
        field("title", "標題"),
        field("subtitle", "副標"),
        field("summary", "摘要", { type: "textarea" }),
        field("tel", "撥號號碼"),
        field("is_enabled", "啟用這筆內容", { type: "checkbox" }),
        field("is_published", "前台顯示", { type: "checkbox" })
      ],
      deserialize(record) {
        return {
          hotline_key: record?.hotline_key || "",
          sort_order: record?.sort_order ?? 0,
          category: record?.category || "",
          badge: record?.badge || "",
          title: record?.title || "",
          subtitle: record?.subtitle || "",
          summary: record?.summary || "",
          tel: record?.tel || "",
          is_enabled: record?.is_enabled ?? true,
          is_published: record?.is_published ?? true
        };
      },
      serialize(values, existing) {
        return {
          id: existing?.id,
          hotline_key: values.hotline_key,
          sort_order: toNumber(values.sort_order),
          category: values.category,
          badge: values.badge,
          title: values.title,
          subtitle: values.subtitle,
          summary: values.summary,
          tel: values.tel,
          is_enabled: values.is_enabled,
          is_published: values.is_published
        };
      }
    }
  };

  init().catch((error) => {
    root.innerHTML = createStandaloneMessage(
      "後臺載入失敗",
      error?.message || "請稍後再試，或檢查 Supabase 設定是否正確。"
    );
  });

  async function init() {
    if (page === "login") {
      const sessionInfo = await getSessionInfo();

      if (sessionInfo.session) {
        window.location.replace(adminPath("dashboard"));
        return;
      }

      renderLoginPage();
      return;
    }

    const sessionInfo = await requireSession();
    renderShell(sessionInfo);
  }

  async function getSessionInfo() {
    const {
      data: { session }
    } = await supabase.auth.getSession();
    const role = session?.user?.app_metadata?.role || "";
    return { session, role };
  }

  async function requireSession() {
    const sessionInfo = await getSessionInfo();

    if (!sessionInfo.session) {
      window.location.replace(adminPath("login"));
      throw new Error("尚未登入");
    }

    if (!["admin", "editor"].includes(sessionInfo.role)) {
      throw new Error("這個帳號尚未設定 admin 或 editor 角色，請先在 Supabase Auth 的 app_metadata 加入 role。");
    }

    return sessionInfo;
  }

  function renderLoginPage() {
    root.innerHTML = `
      <main class="admin-login">
        <section class="admin-login__card">
          <div class="admin-eyebrow">內容後臺 1.0</div>
          <h1 class="admin-title">登入後臺</h1>
          <p class="admin-subtitle">
            這裡提供內部工作人員用來維護首頁、流程、需求頁、資源卡與危機電話內容。
          </p>
          <form id="login-form" class="admin-form" novalidate>
            <div class="admin-field">
              <label for="email">Email</label>
              <input id="email" name="email" type="email" autocomplete="email" required />
            </div>
            <div class="admin-field">
              <label for="password">密碼</label>
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
              />
            </div>
            <div id="login-message" class="admin-message" hidden></div>
            <button class="admin-button" type="submit">登入後臺</button>
          </form>
          <p class="admin-footer-note">
            若還沒有帳號，請先在 Supabase Auth 建立 email/password 使用者，並於 app_metadata 設定 role。
          </p>
        </section>
      </main>
    `;

    const form = document.getElementById("login-form");
    const message = document.getElementById("login-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setMessage(message, "", false, true);
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "登入中...";

      const formData = new FormData(form);
      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      submitButton.disabled = false;
      submitButton.textContent = "登入後臺";

      if (error) {
        setMessage(message, error.message || "登入失敗，請再試一次。", true);
        return;
      }

      window.location.replace(adminPath("dashboard"));
    });
  }

  async function renderShell(sessionInfo) {
    root.innerHTML = `
      <div class="admin-shell">
        <aside class="admin-shell__sidebar">
          <div class="admin-brand">
            <div class="admin-eyebrow">內容後臺 1.0</div>
            <h1>臺南家暴相對人服務導航</h1>
            <p>用最小可用的方式維護前台公開內容。</p>
            <div class="admin-role-chip">${sessionInfo.role}</div>
          </div>
          <nav class="admin-nav">
            ${navLinks(page)}
          </nav>
          <div class="admin-footer-note">
            <div class="admin-user-meta">${sessionInfo.session.user.email}</div>
            <button id="logout-button" class="admin-button admin-button--secondary" type="button">
              登出
            </button>
          </div>
        </aside>
        <main class="admin-shell__main">
          <div id="admin-page-view"></div>
        </main>
      </div>
    `;

    document.getElementById("logout-button")?.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.replace(adminPath("login"));
    });

    const pageView = document.getElementById("admin-page-view");

    if (page === "dashboard") {
      pageView.innerHTML = await renderDashboardPage();
      return;
    }

    const config = PAGE_CONFIG[page];

    if (!config) {
      pageView.innerHTML = createPanel("找不到管理頁", "這個管理頁尚未建立或路徑設定有誤。");
      return;
    }

    if (config.mode === "singleton") {
      await renderSingletonPage(pageView, config);
      return;
    }

    await renderCollectionPage(pageView, config);
  }

  async function renderDashboardPage() {
    const tableCounts = await Promise.all(
      ["site_sections", "flow_stages", "need_pages", "resource_cards", "hotlines"].map(
        async (table) => {
          const { count } = await supabase
            .from(table)
            .select("*", { count: "exact", head: true });
          return { table, count: count || 0 };
        }
      )
    );

    const stats = new Map(tableCounts.map((item) => [item.table, item.count]));

    return `
      <section class="admin-page-header">
        <div>
          <h2>後臺總覽</h2>
          <p>這裡先提供最小可用的內容管理入口。前台會優先讀取 Supabase 公開資料，若資料不存在則退回本地假資料。</p>
        </div>
        <span class="admin-pill">MVP</span>
      </section>
      <section class="admin-stat-grid">
        ${statCard("首頁內容", stats.get("site_sections"), "site_sections")}
        ${statCard("流程階段", stats.get("flow_stages"), "flow_stages")}
        ${statCard("需求頁", stats.get("need_pages"), "need_pages")}
        ${statCard("資源卡", stats.get("resource_cards"), "resource_cards")}
        ${statCard("危機電話", stats.get("hotlines"), "hotlines")}
      </section>
      <section class="admin-panel" style="margin-top: 24px;">
        <div class="admin-form__header">
          <div>
            <h3 style="margin: 0 0 8px;">這個版本先做到什麼</h3>
            <p style="margin: 0; color: var(--admin-text-soft);">
              有登入、角色控管、編輯、排序、停用與發布。沒有版本差異比較、圖片上傳、批次審核與刪除保護流程。
            </p>
          </div>
        </div>
        <div class="admin-actions">
          <a class="admin-button" href="${adminPath("home-content")}">管理首頁內容</a>
          <a class="admin-button admin-button--secondary" href="${adminPath("resource-cards")}">管理資源卡</a>
        </div>
      </section>
    `;
  }

  async function renderSingletonPage(container, config) {
    const record = await fetchSingletonRecord(config);
    const values = config.deserialize(record);

    container.innerHTML = `
      <section class="admin-page-header">
        <div>
          <h2>${config.title}</h2>
          <p>${config.description}</p>
        </div>
        ${statusChip(values)}
      </section>
      <section class="admin-form-card">
        <form id="singleton-form" class="admin-form" novalidate>
          ${config.fields.map((item) => fieldMarkup(item, values)).join("")}
          <div id="singleton-message" class="admin-message" hidden></div>
          <div class="admin-actions">
            <button class="admin-button" type="submit">儲存內容</button>
          </div>
        </form>
      </section>
    `;

    const form = document.getElementById("singleton-form");
    const message = document.getElementById("singleton-message");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.disabled = true;
      submitButton.textContent = "儲存中...";

      const rawValues = getFormValues(form, config.fields);
      const payload = config.serialize(rawValues, record);
      const { error } = await supabase
        .from(config.table)
        .upsert(payload, { onConflict: config.keyField })
        .select()
        .single();

      submitButton.disabled = false;
      submitButton.textContent = "儲存內容";

      if (error) {
        setMessage(message, error.message || "儲存失敗。", true);
        return;
      }

      setMessage(message, "已儲存，前台重新整理後就能讀到最新內容。");
    });
  }

  async function renderCollectionPage(container, config) {
    let records = await fetchRecords(config);
    let activeKey = records[0]?.[config.keyField] || null;

    render();

    function render() {
      const activeRecord =
        records.find((item) => item[config.keyField] === activeKey) || createEmptyRecord(config);
      const values = config.deserialize(activeRecord);

      container.innerHTML = `
        <section class="admin-page-header">
          <div>
            <h2>${config.title}</h2>
            <p>${config.description}</p>
          </div>
          <div class="admin-actions">
            <button id="add-record" class="admin-button admin-button--secondary" type="button">
              新增項目
            </button>
          </div>
        </section>
        <section class="admin-grid admin-grid--content">
          <div class="admin-list__panel">
            <div class="admin-list__header">
              <div>
                <h3 style="margin: 0 0 6px;">項目清單</h3>
                <p style="margin: 0; color: var(--admin-text-soft);">左側選擇要編輯的內容，右側修改後儲存。</p>
              </div>
            </div>
            <div class="admin-list">
              ${records.length ? records.map((item) => listItemMarkup(item, config, activeKey)).join("") : `
                <div class="admin-empty">目前還沒有資料，可以先新增第一筆。</div>
              `}
            </div>
          </div>
          <div class="admin-form-card">
            <div class="admin-form__header">
              <div>
                <h3 style="margin: 0 0 6px;">${values.title || values[config.keyField] || "新增內容"}</h3>
                <p style="margin: 0; color: var(--admin-text-soft);">支援欄位編輯、停用、發布與排序。</p>
              </div>
              ${statusChip(values)}
            </div>
            <form id="collection-form" class="admin-form" novalidate>
              ${config.fields.map((item) => fieldMarkup(item, values)).join("")}
              <div id="collection-message" class="admin-message" hidden></div>
              <div class="admin-actions">
                <button class="admin-button" type="submit">儲存內容</button>
              </div>
            </form>
          </div>
        </section>
      `;

      bindListEvents(activeRecord);
    }

    function bindListEvents(activeRecord) {
      container.querySelectorAll("[data-select-record]").forEach((button) => {
        button.addEventListener("click", () => {
          activeKey = button.dataset.recordKey;
          render();
        });
      });

      container.querySelectorAll("[data-move]").forEach((button) => {
        button.addEventListener("click", async (event) => {
          event.stopPropagation();
          const direction = button.dataset.move;
          const key = button.dataset.recordKey;
          const currentRecord = records.find((item) => item[config.keyField] === key);

          if (!currentRecord) {
            return;
          }

          records = await reorderRecords(config, records, currentRecord, direction);
          activeKey = key;
          render();
        });
      });

      document.getElementById("add-record")?.addEventListener("click", () => {
        const emptyRecord = createEmptyRecord(config, records.length + 1);
        activeKey = emptyRecord[config.keyField];
        records = [...records, emptyRecord];
        render();
      });

      const form = document.getElementById("collection-form");
      const message = document.getElementById("collection-message");

      form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector("button[type='submit']");
        submitButton.disabled = true;
        submitButton.textContent = "儲存中...";

        const rawValues = getFormValues(form, config.fields);
        const payload = config.serialize(rawValues, activeRecord);
        const { data, error } = await supabase
          .from(config.table)
          .upsert(payload, { onConflict: config.keyField })
          .select()
          .single();

        submitButton.disabled = false;
        submitButton.textContent = "儲存內容";

        if (error) {
          setMessage(message, error.message || "儲存失敗。", true);
          return;
        }

        const index = records.findIndex((item) => item[config.keyField] === data[config.keyField]);

        if (index >= 0) {
          records[index] = data;
        } else {
          records.push(data);
        }

        records = sortRecords(config, records);
        activeKey = data[config.keyField];
        setMessage(message, "已儲存，前台重新整理後就能看到更新。");
      });
    }
  }

  async function fetchSingletonRecord(config) {
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .eq(config.keyField, config.fixedKey)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data || null;
  }

  async function fetchRecords(config) {
    const { data, error } = await supabase
      .from(config.table)
      .select("*")
      .order(config.orderField || "created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }

  async function reorderRecords(config, records, currentRecord, direction) {
    const sorted = sortRecords(config, [...records]);
    const currentIndex = sorted.findIndex(
      (item) => item[config.keyField] === currentRecord[config.keyField]
    );
    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || swapIndex < 0 || swapIndex >= sorted.length) {
      return sorted;
    }

    const current = sorted[currentIndex];
    const target = sorted[swapIndex];
    const orderField = config.orderField;
    const currentOrder = current[orderField];

    current[orderField] = target[orderField];
    target[orderField] = currentOrder;

    const [{ error: currentError }, { error: targetError }] = await Promise.all([
      supabase.from(config.table).update({ [orderField]: current[orderField] }).eq("id", current.id),
      supabase.from(config.table).update({ [orderField]: target[orderField] }).eq("id", target.id)
    ]);

    if (currentError || targetError) {
      throw currentError || targetError;
    }

    return sortRecords(config, sorted);
  }

  function createEmptyRecord(config, order = 0) {
    const seed = {};

    for (const item of config.fields) {
      if (item.type === "checkbox") {
        seed[item.name] = item.name === "is_enabled" || item.name === "is_published";
      } else if (item.type === "number") {
        seed[item.name] = item.name === config.orderField ? order : 0;
      } else {
        seed[item.name] = "";
      }
    }

    if (!seed[config.keyField]) {
      seed[config.keyField] = `new-${Date.now()}`;
    }

    return config.serialize(seed, null);
  }

  function sortRecords(config, records) {
    if (!config.orderField) {
      return [...records];
    }

    return [...records].sort((a, b) => {
      const first = Number(a[config.orderField] || 0);
      const second = Number(b[config.orderField] || 0);
      return first - second;
    });
  }

  function field(name, label, options = {}) {
    return {
      name,
      label,
      type: options.type || "text",
      hint: options.hint || "",
      options: options.options || []
    };
  }

  function option(value, label) {
    return { value, label };
  }

  function fieldMarkup(item, values) {
    if (item.type === "checkbox") {
      return `
        <div class="admin-checkbox-row">
          <label class="admin-checkbox">
            <input name="${item.name}" type="checkbox" ${values[item.name] ? "checked" : ""} />
            <span>${item.label}</span>
          </label>
        </div>
      `;
    }

    const hint = item.hint ? `<div class="admin-field__hint">${item.hint}</div>` : "";

    if (item.type === "textarea") {
      return `
        <div class="admin-field">
          <label for="${item.name}">${item.label}</label>
          <textarea id="${item.name}" name="${item.name}">${escapeHtml(values[item.name] ?? "")}</textarea>
          ${hint}
        </div>
      `;
    }

    if (item.type === "select") {
      return `
        <div class="admin-field">
          <label for="${item.name}">${item.label}</label>
          <select id="${item.name}" name="${item.name}">
            ${item.options
              .map(
                (entry) => `
                  <option value="${escapeHtml(entry.value)}" ${
                    values[item.name] === entry.value ? "selected" : ""
                  }>${escapeHtml(entry.label)}</option>
                `
              )
              .join("")}
          </select>
          ${hint}
        </div>
      `;
    }

    return `
      <div class="admin-field">
        <label for="${item.name}">${item.label}</label>
        <input id="${item.name}" name="${item.name}" type="${item.type}" value="${escapeHtml(values[item.name] ?? "")}" />
        ${hint}
      </div>
    `;
  }

  function getFormValues(form, fields) {
    const values = {};

    fields.forEach((item) => {
      const element = form.elements[item.name];

      if (!element) {
        return;
      }

      if (item.type === "checkbox") {
        values[item.name] = Boolean(element.checked);
      } else {
        values[item.name] = typeof element.value === "string" ? element.value.trim() : element.value;
      }
    });

    return values;
  }

  function listItemMarkup(item, config, activeKey) {
    const key = item[config.keyField];
    const order = item[config.orderField] ?? 0;
    const title = item.title || key;

    return `
      <div class="admin-list-item ${key === activeKey ? "is-active" : ""}">
        <div class="admin-list-item__top">
          <button class="admin-list-item__title" type="button" data-select-record="true" data-record-key="${escapeHtml(key)}">${escapeHtml(title)}</button>
          ${item.is_published === false || item.is_enabled === false
            ? '<span class="admin-status-chip is-draft">未顯示</span>'
            : '<span class="admin-status-chip">顯示中</span>'}
        </div>
        <div class="admin-list-item__meta">排序 ${order} ・ ${escapeHtml(key)}</div>
        <div class="admin-inline-actions">
          <button class="admin-button admin-button--secondary admin-button--small" type="button" data-move="up" data-record-key="${escapeHtml(key)}">上移</button>
          <button class="admin-button admin-button--secondary admin-button--small" type="button" data-move="down" data-record-key="${escapeHtml(key)}">下移</button>
        </div>
      </div>
    `;
  }

  function setMessage(element, text, isError = false, hidden = false) {
    element.hidden = hidden;

    if (hidden) {
      element.textContent = "";
      element.classList.remove("is-error");
      return;
    }

    element.textContent = text;
    element.classList.toggle("is-error", Boolean(isError));
  }

  function navLinks(currentPage) {
    return [
      ["dashboard", "總覽"],
      ["home-content", "首頁內容"],
      ["flow-stages", "流程階段"],
      ["need-pages", "需求頁"],
      ["resource-cards", "資源卡"],
      ["hotlines", "危機電話"]
    ]
      .map(
        ([slug, label]) => `
          <a class="admin-nav__link ${currentPage === slug ? "is-active" : ""}" href="${adminPath(slug)}">
            <span>${label}</span>
          </a>
        `
      )
      .join("");
  }

  function adminPath(slug) {
    const pathname = window.location.pathname;
    const adminIndex = pathname.indexOf("/admin");

    if (adminIndex >= 0) {
      return `${pathname.slice(0, adminIndex)}/admin/${slug}/`;
    }

    return `./admin/${slug}/`;
  }

  function createStandaloneMessage(title, body) {
    return `
      <main class="admin-login">
        <section class="admin-login__card admin-warning">
          <h1 class="admin-title">${escapeHtml(title)}</h1>
          <p class="admin-subtitle">${escapeHtml(body)}</p>
        </section>
      </main>
    `;
  }

  function createPanel(title, body) {
    return `
      <section class="admin-panel">
        <h2 style="margin: 0 0 10px;">${escapeHtml(title)}</h2>
        <p style="margin: 0; color: var(--admin-text-soft);">${escapeHtml(body)}</p>
      </section>
    `;
  }

  function statCard(label, count, tableName) {
    return `
      <article class="admin-stat-card">
        <h3>${label}</h3>
        <strong>${count ?? 0}</strong>
        <span>${tableName}</span>
      </article>
    `;
  }

  function statusChip(values) {
    const isPublished = values.is_published !== false;
    const isEnabled = values.is_enabled !== false;

    if (isPublished && isEnabled) {
      return '<span class="admin-status-chip">前台顯示中</span>';
    }

    return '<span class="admin-status-chip is-draft">草稿 / 停用中</span>';
  }

  function toMultiline(value) {
    if (!Array.isArray(value)) {
      return "";
    }

    return value.join("\n");
  }

  function fromMultiline(value) {
    return String(value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function toNumber(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();

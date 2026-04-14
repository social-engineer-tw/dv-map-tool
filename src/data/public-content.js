(function () {
  function cloneData(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeList(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    return [];
  }

  function bySortOrder(a, b, orderField) {
    return (a[orderField] || 0) - (b[orderField] || 0);
  }

  function findSection(sections, sectionKey) {
    return sections.find((item) => item.section_key === sectionKey) || null;
  }

  function mapResourceCards(resourceCards) {
    const directory = {
      crisis: [],
      addiction: [],
      legal: [],
      stability: [],
      family: []
    };

    resourceCards.forEach((item) => {
      const group = item.directory_group || "stability";
      if (!directory[group]) {
        directory[group] = [];
      }

      directory[group].push({
        id: item.card_key,
        kind: item.kind || "service",
        visualType: item.visual_type || "support",
        category: item.category_key || "",
        icon: item.icon || "資",
        title: item.title || "",
        subtitle: item.subtitle || "",
        summary: item.summary || "",
        tags: normalizeList(item.tags),
        phoneLabel: item.phone_label || "",
        tel: item.tel || "",
        address: item.address || "",
        website: item.website || "",
        role: item.role_label || "",
        description: item.description || "",
        serviceScope: item.service_scope || "",
        note: item.note || ""
      });
    });

    return directory;
  }

  function mapServiceUnit(item) {
    return {
      id: item.card_key,
      icon: item.icon || "",
      title: item.title || "",
      role: item.role_label || "",
      description: item.description || item.summary || "",
      phones:
        item.phone_label && item.tel
          ? [{ label: item.phone_label, tel: item.tel }]
          : [],
      address: item.address || "",
      website: item.website || "",
      serviceScope: item.service_scope || "",
      note: item.note || ""
    };
  }

  function mergeServices(targetServices, resourceCards) {
    const byKey = new Map(resourceCards.map((item) => [item.card_key, item]));
    const primaryKeys = ["tainan-health-perpetrator", "tainan-health"];
    const partnerKeys = ["jedidiah", "interpersonal-care"];

    const primary = primaryKeys
      .map((key) => byKey.get(key))
      .filter(Boolean)
      .map(mapServiceUnit);

    const partner = partnerKeys
      .map((key) => byKey.get(key))
      .filter(Boolean)
      .map(mapServiceUnit);

    const extended = resourceCards
      .filter((item) => !primaryKeys.includes(item.card_key) && !partnerKeys.includes(item.card_key))
      .sort((a, b) => bySortOrder(a, b, "sort_order"))
      .map((item) => item.card_key);

    return {
      ...targetServices,
      primary: primary.length ? primary : targetServices.primary,
      partner: partner.length ? partner : targetServices.partner,
      extended: extended.length ? extended : targetServices.extended
    };
  }

  function mapFlowStages(flowStages) {
    return flowStages.sort((a, b) => bySortOrder(a, b, "stage_order")).map((item) => ({
      id: item.stage_key,
      icon: item.icon || "",
      tag: item.tag || "",
      title: item.title || "",
      summary: item.summary || "",
      what: item.what_text || "",
      notices: normalizeList(item.notices),
      confusion: normalizeList(item.confusion),
      canDo: normalizeList(item.can_do),
      resources: normalizeList(item.resources),
      resourceIds: normalizeList(item.resource_card_keys),
      socialWorkTip: item.social_work_tip || "",
      nextStep: item.next_step || ""
    }));
  }

  function mapNeedPages(needPages) {
    return needPages.sort((a, b) => bySortOrder(a, b, "need_order")).map((item) => ({
      id: item.need_key,
      icon: item.icon || "",
      title: item.title || "",
      summary: item.summary || "",
      whatHappens: item.what_happens || "",
      firstSteps: normalizeList(item.first_steps),
      resources: normalizeList(item.resources),
      resourceIds: normalizeList(item.resource_card_keys),
      phones: normalizeList(item.phones),
      reminder: item.reminder || ""
    }));
  }

  function mapHotlines(hotlines) {
    return hotlines.sort((a, b) => bySortOrder(a, b, "sort_order")).map((item) => ({
      category: item.category || "",
      name: item.title || "",
      subtitle: item.subtitle || "",
      description: item.summary || "",
      tel: item.tel || "",
      badge: item.badge || ""
    }));
  }

  function mergeHomeSection(targetHome, sectionRow) {
    if (!sectionRow || !sectionRow.content) {
      return targetHome;
    }

    const content = sectionRow.content;
    return {
      ...targetHome,
      hero: {
        ...(targetHome.hero || {}),
        ...(content.hero || {})
      },
      entryCards: normalizeList(content.entryCards).length ? content.entryCards : targetHome.entryCards,
      emergencyReminders:
        normalizeList(content.emergencyReminders).length ? content.emergencyReminders : targetHome.emergencyReminders,
      positioning: normalizeList(content.positioning).length ? content.positioning : targetHome.positioning,
      quickSupport: normalizeList(content.quickSupport).length ? content.quickSupport : targetHome.quickSupport
    };
  }

  window.loadPublicSiteData = async function (fallbackData) {
    const fallback = cloneData(fallbackData);
    const supabaseApi = window.AppSupabase;

    if (!supabaseApi || !supabaseApi.hasConfig()) {
      return fallback;
    }

    const client = supabaseApi.createClient({
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });

    if (!client) {
      return fallback;
    }

    try {
      const [sectionsResult, flowResult, needsResult, cardsResult, hotlinesResult] = await Promise.all([
        client.from("site_sections").select("*").eq("is_enabled", true).eq("is_published", true).order("sort_order"),
        client.from("flow_stages").select("*").eq("is_enabled", true).eq("is_published", true).order("stage_order"),
        client.from("need_pages").select("*").eq("is_enabled", true).eq("is_published", true).order("need_order"),
        client.from("resource_cards").select("*").eq("is_enabled", true).eq("is_published", true).order("sort_order"),
        client.from("hotlines").select("*").eq("is_enabled", true).eq("is_published", true).order("sort_order")
      ]);

      if (sectionsResult.error || flowResult.error || needsResult.error || cardsResult.error || hotlinesResult.error) {
        return fallback;
      }

      const sections = sectionsResult.data || [];
      const flowStages = flowResult.data || [];
      const needPages = needsResult.data || [];
      const resourceCards = cardsResult.data || [];
      const hotlines = hotlinesResult.data || [];

      const nextData = cloneData(fallback);
      nextData.resourceDirectory = mapResourceCards(resourceCards);
      nextData.stages = flowStages.length ? mapFlowStages(flowStages) : nextData.stages;
      nextData.needs = needPages.length ? mapNeedPages(needPages) : nextData.needs;
      nextData.crisis.hotlines = hotlines.length ? mapHotlines(hotlines) : nextData.crisis.hotlines;
      nextData.services = mergeServices(nextData.services, resourceCards);

      const homeSection = findSection(sections, "home");
      nextData.home = mergeHomeSection(nextData.home, homeSection);

      return nextData;
    } catch (error) {
      return fallback;
    }
  };
})();

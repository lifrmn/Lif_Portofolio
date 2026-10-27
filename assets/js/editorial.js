(() => {
  "use strict";

  const scriptUrl = document.currentScript.src;
  const siteRoot = new URL("../../", scriptUrl);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navigation = document.querySelector(".site-nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const emailAddress = "alif.iip456@gmail.com";

  function closeMenu(returnFocus = false) {
    if (!navigation || !menuToggle) return;
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
    menuToggle.querySelector("i").className = "fas fa-bars";
    if (returnFocus) menuToggle.focus();
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuToggle.querySelector("i").className = isOpen ? "fas fa-times" : "fas fa-bars";
  });

  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navigation?.classList.contains("is-open")) closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".site-header")) closeMenu();
  });
  window.matchMedia("(min-width: 720px)").addEventListener("change", () => closeMenu());

  const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.remove("is-pending");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 }) : null;

  function revealElements(scope = document) {
    scope.querySelectorAll(".reveal").forEach((element) => {
      if (reducedMotion.matches || !revealObserver) return;
      element.classList.add("is-pending");
      revealObserver.observe(element);
    });
  }

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      document.querySelectorAll(".is-pending").forEach((element) => element.classList.remove("is-pending"));
    }
  });
  revealElements();

  const hero = document.querySelector(".hero");
  hero?.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches || event.pointerType !== "mouse" || window.innerWidth < 960) return;
    const bounds = hero.getBoundingClientRect();
    hero.style.setProperty("--portrait-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 12}px`);
    hero.style.setProperty("--portrait-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 6}px`);
  });
  hero?.addEventListener("pointerleave", () => {
    hero.style.setProperty("--portrait-x", "0px");
    hero.style.setProperty("--portrait-y", "0px");
  });

  const localTime = document.getElementById("local-time");
  function updateTime() {
    if (!localTime) return;
    localTime.textContent = `${new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit" }).format(new Date())} WITA`;
  }
  updateTime();
  if (localTime) window.setInterval(updateTime, 60000);
  document.querySelectorAll("[data-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function makeIcon(className) {
    const icon = createElement("i", className);
    icon.setAttribute("aria-hidden", "true");
    return icon;
  }

  function externalLink(href, className, label) {
    const link = createElement("a", className);
    const destination = new URL(href, siteRoot);
    if (!["http:", "https:"].includes(destination.protocol)) throw new Error("Unsupported project link");
    link.href = destination.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (label) link.setAttribute("aria-label", label);
    return link;
  }

  async function loadData(path) {
    const response = await fetch(new URL(path, siteRoot), { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load ${path}`);
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Expected an array");
    return data;
  }

  function showDataError(container, message, retry) {
    const notice = createElement("p", "data-message", message);
    const button = createElement("button", "retry-button", "Try again");
    button.type = "button";
    button.addEventListener("click", retry, { once: true });
    notice.append(button);
    container.replaceChildren(notice);
    container.setAttribute("aria-busy", "false");
  }

  const categoryLabels = { basicweb: "Web development", mern: "Full-stack development", android: "Mobile development" };

  function projectElement(project, index) {
    const article = createElement("article", "project-item reveal");
    const heading = createElement("div", "project-heading");
    const titleGroup = createElement("div");
    const title = createElement(projectsGrid.dataset.heading === "h2" ? "h2" : "h3", "project-title", project.name);
    const category = categoryLabels[project.category] || "Development";
    titleGroup.append(title, createElement("span", "project-kind", category));
    heading.append(createElement("span", "project-index", String(index + 1).padStart(2, "0")), titleGroup);

    const visual = externalLink(project.links.view, "project-visual", `Visit ${project.name} (opens in a new tab)`);
    const image = createElement("img");
    const imageFile = project.image.includes(".") ? project.image : `${project.image}.png`;
    image.src = new URL(`assets/images/projects/${imageFile}`, siteRoot).href;
    image.alt = `${project.name} website preview`;
    image.loading = "lazy";
    image.decoding = "async";
    image.width = 1440;
    image.height = 1000;
    image.addEventListener("error", () => {
      image.hidden = true;
      visual.prepend(createElement("span", "preview-fallback", project.name));
    }, { once: true });
    const arrow = createElement("span", "project-open");
    arrow.append(makeIcon("fas fa-arrow-up"));
    visual.append(image, arrow);

    const bottom = createElement("div", "project-bottom");
    const tags = createElement("div", "project-tags");
    tags.append(createElement("span", "", category), createElement("span", "", "Personal project"));
    bottom.append(tags);
    if (project.links.code) {
      const code = externalLink(project.links.code, "project-code", `Source code for ${project.name} (opens in a new tab)`);
      code.title = `Source code for ${project.name}`;
      code.append(makeIcon("fas fa-code"));
      bottom.append(code);
    }
    article.append(heading, visual, createElement("p", "project-desc", project.desc), bottom);
    return article;
  }

  const projectsGrid = document.getElementById("projects-grid");
  const projectSearch = document.getElementById("project-search");
  const projectCount = document.getElementById("project-count");
  const projectFilters = document.getElementById("project-filters");
  let projects = [];
  let activeCategory = "all";

  function renderProjects() {
    const query = (projectSearch?.value || "").trim().toLowerCase();
    const filtered = projects.filter((project) => {
      const matchesCategory = activeCategory === "all" || project.category === activeCategory;
      return matchesCategory && `${project.name} ${project.desc}`.toLowerCase().includes(query);
    });
    const limit = Number(projectsGrid.dataset.limit) || filtered.length;
    const fragment = document.createDocumentFragment();
    filtered.slice(0, limit).forEach((project) => fragment.append(projectElement(project, projects.indexOf(project))));
    if (!filtered.length) fragment.append(createElement("p", "empty-state", "No projects found. Try another search or category."));
    projectsGrid.replaceChildren(fragment);
    projectsGrid.setAttribute("aria-busy", "false");
    if (projectCount) projectCount.textContent = `${filtered.length} ${filtered.length === 1 ? "project" : "projects"}`;
    revealElements(projectsGrid);
  }

  function renderFilters() {
    if (!projectFilters) return;
    projectFilters.replaceChildren();
    const categories = ["all", ...new Set(projects.map((project) => project.category))];
    categories.forEach((category) => {
      const button = createElement("button", "filter-button", category === "all" ? "All work" : categoryLabels[category] || category);
      button.type = "button";
      button.setAttribute("aria-pressed", String(category === activeCategory));
      button.addEventListener("click", () => {
        activeCategory = category;
        projectFilters.querySelectorAll("button").forEach((filter) => filter.setAttribute("aria-pressed", String(filter === button)));
        renderProjects();
      });
      projectFilters.append(button);
    });
  }

  async function loadProjects() {
    projectsGrid.setAttribute("aria-busy", "true");
    projectsGrid.replaceChildren(createElement("p", "data-message", "Loading projects..."));
    try {
      projects = await loadData("projects/projects.json");
      renderFilters();
      renderProjects();
    } catch {
      showDataError(projectsGrid, "Projects could not be loaded.", loadProjects);
    }
  }

  if (projectsGrid) loadProjects();
  projectSearch?.addEventListener("input", renderProjects);

  const skillIcons = { HTML5: "fab fa-html5", CSS3: "fab fa-css3-alt", JavaScript: "fab fa-js", Python: "fab fa-python", Java: "fab fa-java", React: "fab fa-react", MySQL: "fas fa-database", MongoDB: "fas fa-leaf", "Microsoft Excel": "fas fa-file-excel", "Microsoft Word": "fas fa-file-word", "Microsoft PowerPoint": "fas fa-file-powerpoint", Git: "fab fa-git-alt", GitHub: "fab fa-github", "VS Code": "fas fa-code", Figma: "fab fa-figma", Canva: "fas fa-pen-nib", Teamwork: "fas fa-users", Multitasking: "fas fa-tasks", "Effective communication": "fas fa-comments", Adaptability: "fas fa-sync-alt" };
  const skillsList = document.getElementById("skills-list");

  async function loadSkills() {
    skillsList.setAttribute("aria-busy", "true");
    skillsList.replaceChildren(createElement("p", "data-message", "Loading toolkit..."));
    try {
      const skills = await loadData("skills.json");
      const fragment = document.createDocumentFragment();
      skills.forEach((skill) => {
        const item = createElement("span", "skill-item");
        item.append(makeIcon(skillIcons[skill.name] || "fas fa-code"), createElement("span", "", skill.name));
        fragment.append(item);
      });
      skillsList.replaceChildren(fragment);
      skillsList.setAttribute("aria-busy", "false");
    } catch {
      showDataError(skillsList, "The toolkit could not be loaded.", loadSkills);
    }
  }
  if (skillsList) loadSkills();

  const toast = document.getElementById("toast");
  let toastTimeout;
  function showToast(message) {
    if (!toast) return;
    window.clearTimeout(toastTimeout);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 3500);
  }

  document.querySelectorAll(".copy-email").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(emailAddress);
        showToast("Email address copied.");
      } catch {
        showToast(`Email: ${emailAddress}`);
      }
    });
  });

  document.getElementById("contact-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const name = fields.get("name").trim();
    const email = fields.get("email").trim();
    const message = fields.get("message").trim();
    if (!name || !message) {
      document.getElementById("form-status").textContent = "Please enter your name and a message.";
      return;
    }
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`Hi Alief,\n\n${message}\n\n${name}\n${email}`);
    window.location.href = `mailto:${emailAddress}?subject=${subject}&body=${body}`;
    document.getElementById("form-status").textContent = "Your email draft is ready in your email app. Nothing has been sent yet.";
  });
})();
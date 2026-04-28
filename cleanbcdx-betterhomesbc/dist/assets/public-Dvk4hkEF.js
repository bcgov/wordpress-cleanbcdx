const betterhomesBCAccessibilityLoader = () => {
  window.requestAnimationFrame(() => {
    if ("betterhomesbc" === window.site.customBodyClass) {
      const headerLogo = document.querySelector(".custom-logo-link img");
      headerLogo.setAttribute("alt", "BC Government and Clean BC Better Homes logos");
      const rebatePage = document.querySelector("body.single-incentives");
      if (rebatePage) {
        const newTabLinks = document.querySelectorAll('a[target="_blank"]');
        if (newTabLinks) {
          newTabLinks.forEach((link) => {
            link.removeAttribute("target");
          });
        }
        const addressContainer = document.querySelectorAll(".address");
        if (addressContainer) {
          addressContainer.forEach((section) => {
            let currentHeading = "";
            [...section.children].forEach((child) => {
              if ("H4" === child.tagName) {
                currentHeading = child.textContent.replace(/customers/i, "").trim();
                if ("FortisBC" === currentHeading) {
                  currentHeading = "Fortis BC";
                }
              }
              if ("UL" === child.tagName) {
                child.querySelectorAll("li").forEach((li) => {
                  const link = li.querySelector("a");
                  if (!link) return;
                  const liClass = li.className.trim();
                  if (!liClass) return;
                  let labelType;
                  if ("site" === liClass) {
                    labelType = "website";
                  } else if ("phone" === liClass) {
                    const phoneNumber = link.textContent.trim();
                    labelType = `telephone ${phoneNumber}`;
                  } else if ("form" === liClass) {
                    labelType = "contact form";
                  } else {
                    labelType = liClass;
                  }
                  const ariaLabel = `${currentHeading} ${labelType}`;
                  link.setAttribute("aria-label", ariaLabel);
                });
              }
            });
          });
        }
      }
    }
  });
};
if ("complete" === document.readyState) {
  betterhomesBCAccessibilityLoader();
} else {
  document.addEventListener(
    "DOMContentLoaded",
    betterhomesBCAccessibilityLoader
  );
}
function cleanbcdxBhRebatesArchiveLoader() {
  window.requestAnimationFrame(() => {
    var _a, _b;
    const source_details = document.querySelector(
      "details.eligible-home-types"
    );
    const target_details = document.querySelector(
      "div.eligible-homes-insertion"
    );
    if (source_details && target_details) {
      target_details.replaceChildren(source_details.cloneNode(true));
      (_a = target_details.firstElementChild) == null ? void 0 : _a.classList.remove("template");
    }
    const source_not_eligible = document.querySelector(
      ".wp-block-group.not-eligible-content"
    );
    const target_not_eligible = document.querySelector(
      "div.not-eligible-insertion"
    );
    if (source_not_eligible && target_not_eligible) {
      target_not_eligible.replaceChildren(
        source_not_eligible.cloneNode(true)
      );
      (_b = target_not_eligible.firstElementChild) == null ? void 0 : _b.classList.remove("template");
    }
  });
}
window.cleanbcdxBhRebatesArchiveLoader = cleanbcdxBhRebatesArchiveLoader;
if ("complete" === document.readyState) {
  cleanbcdxBhRebatesArchiveLoader();
} else {
  document.addEventListener(
    "DOMContentLoaded",
    cleanbcdxBhRebatesArchiveLoader
  );
}
function cleanbcdxBhDefinitions() {
  window.requestAnimationFrame(() => {
    const links = document.querySelectorAll("a:not(#postFilterApp a)");
    const definitionLinks = Array.from(links).filter((link) => {
      return link.href.includes("definitions");
    });
    const addEventListeners = (element) => {
      element.addEventListener("click", handleClick);
      element.addEventListener("keypress", handleKeypress);
    };
    const handleClick = async (event) => {
      if ("click" === event.type || "keypress" === event.type && "Enter" === event.key) {
        event.preventDefault();
        setDialogWidth(shouldUseWideDialog(event.currentTarget));
        const url = event.currentTarget.getAttribute("href");
        const cachedData = window.sessionStorage.getItem(url);
        if (cachedData) {
          const { title, content } = JSON.parse(cachedData);
          displayContent(title, content);
        } else {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(
                `HTTP error! Status: ${response.status}`
              );
            }
            const html = await response.text();
            const parser = new window.DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const titleElement = doc.querySelector(
              ".wp-block-post-title"
            );
            const contentElement = doc.querySelector(".entry-content");
            if (!titleElement || !contentElement) {
              throw new Error(
                "Required content not found in the fetched HTML."
              );
            }
            const title = titleElement.innerText;
            const content = contentElement.innerHTML;
            const dataToCache = { title, content };
            window.sessionStorage.setItem(
              url,
              JSON.stringify(dataToCache)
            );
            displayContent(title, content);
          } catch (error) {
            console.error("Error fetching content:", error);
          }
        }
      }
    };
    const handleKeypress = (event) => {
      if ("Enter" === event.key || 13 === event.keycode) {
        handleClick(event);
      }
    };
    const displayContent = (title, content) => {
      const dialogContent = document.querySelector(
        "#dialog .dialog-content"
      );
      dialogContent.innerHTML = '<h2 tabindex="0">' + title + "</h2>" + content;
      showDialog();
      dialogContent.querySelector("h2").focus();
    };
    const showDialog = () => {
      const dialog = document.getElementById("dialog");
      setBodyScrollLock(true);
      dialog.showModal();
    };
    const setBodyScrollLock = (isLocked) => {
      const html = document.documentElement;
      const body = document.body;
      if (!html || !body) {
        return;
      }
      if (isLocked) {
        html.style.overflow = "hidden";
        body.style.margin = "0";
        body.style.height = "100%";
        body.style.overflow = "hidden";
        body.style.left = "0";
        body.style.right = "0";
        body.style.width = "100%";
        return;
      }
      html.style.overflow = "";
      body.style.margin = "";
      body.style.height = "";
      body.style.overflow = "";
      body.style.left = "";
      body.style.right = "";
      body.style.width = "";
    };
    const setDialogWidth = (isWide) => {
      const dialog = document.getElementById("dialog");
      if (!dialog) {
        return;
      }
      dialog.classList.toggle("wide", isWide);
    };
    const closeDialogOnBackdropClick = (event) => {
      const dialog = event.currentTarget;
      if (!dialog || !dialog.open) {
        return;
      }
      const rect = dialog.getBoundingClientRect();
      const isInsideDialogBounds = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
      if (!isInsideDialogBounds) {
        dialog.close();
      }
    };
    const shouldUseWideDialog = (triggerElement) => {
      if (!triggerElement) {
        return false;
      }
      if (triggerElement.classList.contains("wide")) {
        return true;
      }
      return Boolean(triggerElement.closest(".wide"));
    };
    if (definitionLinks.length > 0) {
      let dialog = document.getElementById("dialog");
      const needsDialog = !dialog;
      if (needsDialog) {
        dialog = document.createElement("dialog");
        dialog.id = "dialog";
        dialog.className = "dialog";
        dialog.setAttribute("aria-modal", true);
        dialog.setAttribute("aria-live", "polite");
        dialog.innerHTML = '<div class="dialog-content"></div><button id="close-dialog" aria-label="closes defintion dialog">Close</button>';
        document.body.appendChild(dialog);
        const closeDialogButton = document.getElementById("close-dialog");
        closeDialogButton.addEventListener("click", () => {
          dialog.close();
          setDialogWidth(false);
        });
        dialog.addEventListener("close", () => {
          setDialogWidth(false);
          setBodyScrollLock(false);
        });
        dialog.addEventListener("click", closeDialogOnBackdropClick);
      }
      definitionLinks.forEach((link) => {
        if ("true" === link.dataset.definitionInit) {
          return;
        }
        link.dataset.definitionInit = "true";
        link.classList.add("icon-definition");
        link.setAttribute(
          "aria-label",
          "opens definition dialog for this concept"
        );
        const linkText = link.textContent;
        if (linkText && linkText.trim().length > 0) {
          const words = linkText.trim().split(" ");
          const lastWord = words.pop();
          const restOfText = words.join(" ");
          const span = document.createElement("span");
          span.classList.add("last-word", "no-wrap");
          span.textContent = lastWord;
          link.innerHTML = `${restOfText} `;
          link.appendChild(span);
        }
        addEventListeners(link);
      });
    }
    const glossaryList = document.querySelector(".glossary-results ul");
    const glossaryNavContainer = document.querySelector(
      "#glossary-nav .wp-block-buttons"
    );
    const sampleButton = glossaryNavContainer == null ? void 0 : glossaryNavContainer.querySelector(".wp-block-button");
    if (!glossaryList || !glossaryNavContainer || !sampleButton) return;
    const glossaryItems = Array.from(glossaryList.querySelectorAll("li"));
    let currentLetter = "";
    const letterAnchors = /* @__PURE__ */ new Set();
    const usedTitleIds = /* @__PURE__ */ new Map();
    const toSlug = (value) => {
      const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      return slug.length > 0 ? slug : "glossary-term";
    };
    const getUniqueId = (base) => {
      const existingCount = usedTitleIds.get(base) || 0;
      const nextCount = existingCount + 1;
      usedTitleIds.set(base, nextCount);
      return 0 === existingCount ? base : `${base}-${nextCount}`;
    };
    glossaryItems.forEach((item) => {
      const titleElement = item.querySelector("h3");
      if (!titleElement) return;
      const titleText = titleElement.textContent.trim();
      const titleIdBase = toSlug(titleText);
      titleElement.id = getUniqueId(titleIdBase);
      const firstLetter = titleText.charAt(0).toUpperCase();
      if (firstLetter !== currentLetter) {
        currentLetter = firstLetter;
        letterAnchors.add(currentLetter);
        const h2 = document.createElement("h2");
        h2.textContent = currentLetter;
        h2.id = `glossary-${currentLetter.toLowerCase()}`;
        h2.classList.add("glossary-inline-letter");
        const wrapper = document.createElement("li");
        wrapper.classList.add("glossary-entry-group");
        const flexContainer = document.createElement("div");
        flexContainer.classList.add("glossary-entry-flex");
        const termWrapper = document.createElement("div");
        termWrapper.classList.add("glossary-entry");
        while (item.firstChild) {
          termWrapper.appendChild(item.firstChild);
        }
        flexContainer.appendChild(h2);
        flexContainer.appendChild(termWrapper);
        wrapper.appendChild(flexContainer);
        glossaryList.replaceChild(wrapper, item);
      }
    });
    letterAnchors.forEach((letter) => {
      const newButtonWrapper = sampleButton.cloneNode(true);
      const newButtonLink = newButtonWrapper.querySelector("a");
      if (newButtonLink) {
        newButtonLink.textContent = letter;
        newButtonLink.setAttribute(
          "href",
          `#glossary-${letter.toLowerCase()}`
        );
        newButtonWrapper.classList.remove("invisible");
      }
      glossaryNavContainer.appendChild(newButtonWrapper);
    });
    sampleButton.remove();
  });
}
if ("complete" === document.readyState) {
  cleanbcdxBhDefinitions();
} else {
  document.addEventListener("DOMContentLoaded", cleanbcdxBhDefinitions);
}
window.cleanbcdxBhDefinitions = cleanbcdxBhDefinitions;
const FORM_ID = 2;
if (document.getElementById(`gform_${FORM_ID}`)) {
  document.addEventListener(
    "submit",
    (event) => {
      const form = event.target;
      if (!form || form.id !== `gform_${FORM_ID}`) {
        return;
      }
      setTimeout(() => {
        cleanbcdxBhDefinitions();
      }, 1e3);
    },
    true
  );
}

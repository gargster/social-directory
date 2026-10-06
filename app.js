const memberList = document.querySelector("#member-list");
const directoryStatus = document.querySelector("#directory-status");
const memberCount = document.querySelector("#member-count");

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function validRepositoryURL(repoURL) {
  if (typeof repoURL !== "string") return null;

  try {
    const url = new URL(repoURL);
    if (
      url.protocol !== "https:"
      || url.username
      || url.password
    ) {
      return null;
    }
    return repoURL;
  } catch {
    return null;
  }
}

function validSiteURL(siteURL) {
  if (typeof siteURL !== "string") return null;

  try {
    const url = new URL(siteURL);
    if (url.protocol !== "https:" || url.username || url.password) {
      return null;
    }
    return siteURL;
  } catch {
    return null;
  }
}

function createLink(label, url, className) {
  const link = createElement("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function renderMember(handle, entry) {
  const card = createElement("article", "member-card");
  const heading = createElement("h3", "member-handle");
  const siteURL = validSiteURL(entry.siteURL);
  heading.append(
    siteURL
      ? createLink(handle, siteURL, "member-site-link")
      : document.createTextNode(handle)
  );
  const repositoryURL = validRepositoryURL(entry.repoURL);
  const actions = createElement("div", "member-actions");

  card.append(heading);

  if (!repositoryURL) {
    card.append(
      createElement(
        "p",
        "member-note",
        "Repository URL is unavailable for this directory entry."
      )
    );
    return card;
  }

  actions.append(
    createLink("Repository URL", repositoryURL, "member-link primary-link")
  );

  card.append(actions);
  return card;
}

async function loadDirectory() {
  try {
    const response = await fetch("./directory.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Could not load directory.json (HTTP ${response.status}).`);
    }

    const directory = await response.json();
    if (!directory || typeof directory !== "object" || Array.isArray(directory)) {
      throw new Error("Directory data must be a JSON object.");
    }

    const entries = Object.entries(directory)
      .filter(([handle, entry]) => (
        typeof handle === "string"
        && entry !== null
        && typeof entry === "object"
        && !Array.isArray(entry)
      ))
      .sort(([left], [right]) => left.localeCompare(right));

    memberList.replaceChildren(...entries.map(([handle, entry]) => renderMember(handle, entry)));
    memberCount.textContent = `${entries.length} ${entries.length === 1 ? "profile" : "profiles"}`;

    directoryStatus.textContent = entries.length === 0
      ? "No profiles are listed in the directory yet."
      : "";
  } catch (error) {
    directoryStatus.textContent = `${error.message} Try again later.`;
  }
}

loadDirectory();

// Adds relative-date badges, sorts dated lists, and builds the header summary.
// All content lives in index.html; this script only decorates it.
(function () {
  const DAY = 86400000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function parse(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function daysUntil(iso) {
    return Math.round((parse(iso) - today) / DAY);
  }

  function label(days) {
    if (days < 0) return `Overdue ${-days}d`;
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days < 14) return `in ${days}d`;
    return "";
  }

  // Keep dated lists in date order (undated items go last).
  document.querySelectorAll(".list.dated").forEach((list) => {
    const key = (li) => li.querySelector(":scope > time")?.getAttribute("datetime") || "9999-12-31";
    [...list.children]
      .sort((a, b) => key(a).localeCompare(key(b)))
      .forEach((li) => list.appendChild(li));
  });

  const counts = { overdue: 0, today: 0, week: 0 };

  document.querySelectorAll(".list > li > time[datetime]").forEach((time) => {
    const li = time.parentElement;
    const days = daysUntil(time.getAttribute("datetime"));
    if (days < 0) { li.classList.add("overdue"); counts.overdue++; }
    else if (days === 0) { li.classList.add("today"); counts.today++; }
    else if (days <= 3) { li.classList.add("soon"); }
    if (days > 0 && days <= 7) counts.week++;

    const text = label(days);
    if (text) {
      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = text;
      li.appendChild(badge);
    }
  });

  const summary = document.getElementById("summary");
  const chips = [];
  if (counts.overdue) chips.push(["overdue", `${counts.overdue} overdue`]);
  if (counts.today) chips.push(["today", `${counts.today} due today`]);
  if (counts.week) chips.push(["week", `${counts.week} in the next 7 days`]);
  if (!chips.length) chips.push(["", "Nothing due this week"]);
  chips.forEach(([cls, text]) => {
    const chip = document.createElement("span");
    chip.className = `chip ${cls}`.trim();
    chip.textContent = text;
    summary.appendChild(chip);
  });

  // Flag the board if it hasn't been touched in over a week.
  const updated = document.getElementById("last-updated");
  if (updated) {
    const age = -daysUntil(updated.getAttribute("datetime"));
    if (age > 7) {
      updated.parentElement.classList.add("stale");
      updated.parentElement.append(` (${age} days ago)`);
    }
  }
})();

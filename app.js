// ---------- Storage helpers ----------

const STORAGE_KEY = "ledger.entries.v1";
const CURRENCY_KEY = "ledger.currency.v1";

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function loadCurrency() {
  return localStorage.getItem(CURRENCY_KEY) || "Rs";
}

function saveCurrency(symbol) {
  localStorage.setItem(CURRENCY_KEY, symbol);
}

// ---------- State ----------

let entries = loadEntries();
let currency = loadCurrency();
let selectedType = "expense";

const EXPENSE_CATEGORIES = new Set([
  "Food", "Transport", "Bills", "Study", "Health", "Other",
]);

// ---------- DOM refs ----------

const monthFilter = document.getElementById("monthFilter");
const entriesBody = document.getElementById("entriesBody");
const emptyState = document.getElementById("emptyState");
const balanceFigure = document.getElementById("balanceFigure");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const breakdownBars = document.getElementById("breakdownBars");
const breakdownEmpty = document.getElementById("breakdownEmpty");
const currencySymbolEl = document.getElementById("currencySymbol");
const currencyInput = document.getElementById("currencyInput");

const entryForm = document.getElementById("entryForm");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");

const fDate = document.getElementById("f-date");
const fDesc = document.getElementById("f-desc");
const fCategory = document.getElementById("f-category");
const fAmount = document.getElementById("f-amount");

// ---------- Init ----------

function currentMonthStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

monthFilter.value = currentMonthStr();
fDate.value = new Date().toISOString().slice(0, 10);
currencySymbolEl.textContent = currency;
currencyInput.value = currency;

render();

// ---------- Form show/hide ----------

toggleFormBtn.addEventListener("click", () => {
  entryForm.hidden = !entryForm.hidden;
});

cancelFormBtn.addEventListener("click", () => {
  entryForm.reset();
  fDate.value = new Date().toISOString().slice(0, 10);
  entryForm.hidden = true;
});

document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".type-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedType = btn.dataset.type;
  });
});

// ---------- Add entry ----------

entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    date: fDate.value,
    description: fDesc.value.trim(),
    category: fCategory.value,
    amount: parseFloat(fAmount.value),
    type: selectedType,
  };

  if (!entry.description || isNaN(entry.amount) || entry.amount < 0) return;

  entries.push(entry);
  saveEntries(entries);

  entryForm.reset();
  fDate.value = new Date().toISOString().slice(0, 10);
  entryForm.hidden = true;
  selectedType = "expense";
  document.querySelectorAll(".type-btn").forEach((b) =>
    b.classList.toggle("active", b.dataset.type === "expense")
  );

  render();
});

// ---------- Delete entry ----------

entriesBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".row-delete");
  if (!btn) return;
  const id = btn.dataset.id;
  entries = entries.filter((en) => en.id !== id);
  saveEntries(entries);
  render();
});

// ---------- Month filter ----------

monthFilter.addEventListener("change", render);

// ---------- Currency ----------

currencyInput.addEventListener("change", () => {
  currency = currencyInput.value.trim() || "Rs";
  saveCurrency(currency);
  currencySymbolEl.textContent = currency;
  render();
});

// ---------- Clear month ----------

document.getElementById("clearBtn").addEventListener("click", () => {
  const month = monthFilter.value;
  if (!confirm(`Remove all entries recorded in ${month}? This can't be undone.`)) return;
  entries = entries.filter((en) => !en.date.startsWith(month));
  saveEntries(entries);
  render();
});

// ---------- Export CSV ----------

document.getElementById("exportBtn").addEventListener("click", () => {
  const month = monthFilter.value;
  const rows = entries.filter((en) => en.date.startsWith(month));
  if (rows.length === 0) {
    alert("Nothing to export for this month.");
    return;
  }
  const header = "Date,Description,Category,Type,Amount\n";
  const body = rows
    .map((en) =>
      [en.date, `"${en.description.replace(/"/g, '""')}"`, en.category, en.type, en.amount].join(",")
    )
    .join("\n");
  const blob = new Blob([header + body], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ledger-${month}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ---------- Render ----------

function formatAmount(n) {
  return `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function render() {
  const month = monthFilter.value;
  const monthEntries = entries
    .filter((en) => en.date.startsWith(month))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // Table
  entriesBody.innerHTML = "";
  emptyState.hidden = monthEntries.length > 0;

  monthEntries.forEach((en) => {
    const row = document.createElement("div");
    row.className = "ledger-row";
    row.innerHTML = `
      <span class="col-date">${en.date.slice(5)}</span>
      <span class="col-desc">${escapeHtml(en.description)}</span>
      <span class="col-cat">${escapeHtml(en.category)}</span>
      <span class="col-amount ${en.type}">${en.type === "income" ? "+" : "−"} ${formatAmount(en.amount)}</span>
      <button class="row-delete" data-id="${en.id}" title="Delete">✕</button>
    `;
    entriesBody.appendChild(row);
  });

  // Totals
  const totalIncome = monthEntries.filter((e) => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = monthEntries.filter((e) => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;

  balanceFigure.textContent = formatAmount(balance);
  balanceFigure.style.color = balance < 0 ? "var(--rust)" : "var(--ink)";
  totalIncomeEl.textContent = formatAmount(totalIncome);
  totalExpenseEl.textContent = formatAmount(totalExpense);

  // Breakdown by category (expenses only)
  const byCategory = {};
  monthEntries
    .filter((e) => e.type === "expense")
    .forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

  const sorted = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  breakdownBars.innerHTML = "";
  breakdownEmpty.hidden = sorted.length > 0;

  const maxVal = sorted.length ? sorted[0][1] : 1;

  sorted.forEach(([cat, val]) => {
    const row = document.createElement("div");
    row.className = "breakdown-row";
    const pct = Math.max(4, Math.round((val / maxVal) * 100));
    row.innerHTML = `
      <div class="breakdown-meta">
        <span>${escapeHtml(cat)}</span>
        <span class="amount">${formatAmount(val)}</span>
      </div>
      <div class="breakdown-track">
        <div class="breakdown-fill" style="width:${pct}%"></div>
      </div>
    `;
    breakdownBars.appendChild(row);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

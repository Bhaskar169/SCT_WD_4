(function () {
  const STORAGE_KEY = 'daily-log-entries';

  const form = document.getElementById('entry-form');
  const input = document.getElementById('entry-input');
  const prioritySelect = document.getElementById('entry-priority');
  const entryNumberEl = document.getElementById('entry-number');
  const listEl = document.getElementById('log-list');
  const emptyStateEl = document.getElementById('empty-state');
  const remainingCountEl = document.getElementById('remaining-count');
  const filtersEl = document.getElementById('filters');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const stampEl = document.getElementById('stamp');
  const dateEl = document.getElementById('today-date');

  let entries = loadEntries();
  let currentFilter = 'all';

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function saveEntries() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (err) {
      /* storage unavailable, continue without persistence */
    }
  }

  function setTodayDate() {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(undefined, options);
  }

  function nextEntryNumber() {
    return String(entries.length + 1).padStart(2, '0');
  }

  function updateEntryNumberPreview() {
    entryNumberEl.textContent = nextEntryNumber();
  }

  function addEntry(text, priority) {
    entries.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      priority,
      done: false
    });
    saveEntries();
    render();
  }

  function toggleEntry(id) {
    const entry = entries.find(e => e.id === id);
    if (entry) entry.done = !entry.done;
    saveEntries();
    render();
  }

  function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    saveEntries();
    render();
  }

  function clearCompleted() {
    entries = entries.filter(e => !e.done);
    saveEntries();
    render();
  }

  function filteredEntries() {
    if (currentFilter === 'active') return entries.filter(e => !e.done);
    if (currentFilter === 'completed') return entries.filter(e => e.done);
    return entries;
  }

  function render() {
    const visible = filteredEntries();
    listEl.innerHTML = '';

    visible.forEach((entry) => {
      const originalIndex = entries.indexOf(entry);
      const li = document.createElement('li');
      li.className = 'log-item' + (entry.done ? ' done' : '');
      li.dataset.id = entry.id;

      li.innerHTML = `
        <span class="item-number">${String(originalIndex + 1).padStart(2, '0')}</span>
        <button class="item-check" aria-label="Toggle complete"></button>
        <span class="item-text"></span>
        ${entry.priority === 'urgent' ? '<span class="item-flag">Urgent</span>' : ''}
        <button class="item-delete" aria-label="Delete entry">&times;</button>
      `;

      li.querySelector('.item-text').textContent = entry.text;
      li.querySelector('.item-check').addEventListener('click', () => toggleEntry(entry.id));
      li.querySelector('.item-delete').addEventListener('click', () => deleteEntry(entry.id));

      listEl.appendChild(li);
    });

    emptyStateEl.classList.toggle('visible', visible.length === 0);

    const openCount = entries.filter(e => !e.done).length;
    remainingCountEl.textContent = openCount === 1 ? '1 line open' : `${openCount} lines open`;

    stampEl.textContent = openCount === 0 ? (entries.length ? 'ALL CLEAR' : 'ALL CLEAR') : 'IN PROGRESS';
    stampEl.classList.toggle('pending', openCount > 0);

    updateEntryNumberPreview();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    addEntry(text, prioritySelect.value);
    input.value = '';
    prioritySelect.value = 'normal';
    input.focus();
  });

  filtersEl.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      render();
    });
  });

  clearCompletedBtn.addEventListener('click', clearCompleted);

  setTodayDate();
  render();
})();

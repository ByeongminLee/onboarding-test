(function () {
  const data = window.MATRIX_DATA;

  const { layers, domains, items } = data;
  const byId = new Map(items.map(i => [i.id, i]));
  const matrix = document.getElementById('matrix');
  const panel = document.getElementById('selected-panel');

  const cellKey = (layerId, domainId) => `${layerId}::${domainId}`;
  const cellMap = new Map();
  for (const it of items) {
    const k = cellKey(it.layer, it.domain);
    if (!cellMap.has(k)) cellMap.set(k, []);
    cellMap.get(k).push(it);
  }

  const frag = document.createDocumentFragment();

  const corner = document.createElement('div');
  corner.className = 'cell head-corner';
  frag.appendChild(corner);
  for (const d of domains) {
    const h = document.createElement('div');
    h.className = 'cell head-domain';
    h.textContent = d.name;
    frag.appendChild(h);
  }

  for (const layer of layers) {
    const lh = document.createElement('div');
    lh.className = 'cell head-layer';
    lh.textContent = layer.name;
    frag.appendChild(lh);
    for (const d of domains) {
      const cell = document.createElement('div');
      const list = cellMap.get(cellKey(layer.id, d.id)) || [];
      if (list.length === 0) {
        cell.className = 'cell cell-empty';
        cell.textContent = '—';
      } else {
        cell.className = 'cell';
        for (const it of list) {
          const b = document.createElement('span');
          b.className = 'badge';
          b.textContent = it.name;
          b.dataset.id = it.id;
          cell.appendChild(b);
        }
      }
      frag.appendChild(cell);
    }
  }

  matrix.appendChild(frag);

  function clearSelection() {
    document.body.classList.remove('has-selection');
    for (const b of document.querySelectorAll('.badge')) {
      b.classList.remove('is-selected', 'is-related');
    }
    panel.innerHTML = '<span class="hint">셀의 항목을 클릭하면 연관된 항목이 하이라이트됩니다.</span>';
  }

  function select(id) {
    const it = byId.get(id);
    if (!it) return;
    document.body.classList.add('has-selection');
    for (const b of document.querySelectorAll('.badge')) {
      b.classList.remove('is-selected', 'is-related');
    }
    const related = new Set(it.related);
    for (const b of document.querySelectorAll('.badge')) {
      if (b.dataset.id === id) b.classList.add('is-selected');
      else if (related.has(b.dataset.id)) b.classList.add('is-related');
    }
    const relNames = it.related.map(r => byId.get(r)?.name).filter(Boolean);
    panel.innerHTML = `
      <span class="sel-title">${it.name}</span>
      <span class="sel-related">→ ${relNames.join(' · ') || '(연관 항목 없음)'}</span>
      <button id="clear-sel" style="margin-left:12px;">해제</button>
    `;
    document.getElementById('clear-sel').addEventListener('click', clearSelection);
  }

  matrix.addEventListener('click', (e) => {
    const b = e.target.closest('.badge');
    if (!b) return;
    if (b.classList.contains('is-selected')) clearSelection();
    else select(b.dataset.id);
  });
})();

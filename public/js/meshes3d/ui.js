
// --- UI Helpers ---

export function initUI(categories, switchCategoryCallback) {
    renderTabs(categories, switchCategoryCallback);
}

function renderTabs(categories, switchCategoryCallback) {
    const tabsContainer = document.getElementById('categoryTabs');
    tabsContainer.innerHTML = '';
    Object.keys(categories).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn';
        btn.textContent = cat;
        btn.onclick = () => switchCategoryCallback(cat);
        tabsContainer.appendChild(btn);
    });
}

export function updateTabStatus(category) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        if (btn.textContent === category) btn.classList.add('active');
        else btn.classList.remove('active');
    });
}

export function renderModelList(models, loadModelCallback) {
    const listContainer = document.getElementById('modelList');
    listContainer.innerHTML = '';

    models.forEach(item => {
        const el = document.createElement('div');
        el.className = 'model-item';
        el.textContent = item.name;
        el.onclick = () => loadModelCallback(item, el);
        listContainer.appendChild(el);
    });
}

export function updateModelListActiveState(uiElement) {
    document.querySelectorAll('.model-item').forEach(el => el.classList.remove('active'));
    if (uiElement) uiElement.classList.add('active');
}

export function setLoadingVisible(visible) {
    const loadingOverlay = document.getElementById('loading');
    if (visible) loadingOverlay.classList.add('visible');
    else loadingOverlay.classList.remove('visible');
}

export function clearAnimControls() {
    const area = document.getElementById('controls-area');
    const label = area.querySelector('.anim-group-label');
    const noMsg = document.getElementById('no-anim-msg');
    area.innerHTML = '';
    area.appendChild(label);
    area.appendChild(noMsg);
    noMsg.style.display = 'none';
}

export function showNoAnimMessage(show) {
    document.getElementById('no-anim-msg').style.display = show ? 'inline' : 'none';
}

export function createAnimButton(name, onClick, enabled) {
    const area = document.getElementById('controls-area');
    const btn = document.createElement('button');
    btn.className = 'anim-btn';

    // Using CSS :disabled now, so simple bool
    if (!enabled) {
        btn.disabled = true;
    }

    btn.textContent = name;

    if (enabled && onClick) {
        btn.onclick = (e) => {
            onClick();
            // Local active class handling
            document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    }

    area.appendChild(btn);
    return btn;
}

export function activateAnimButton(btn, onClick) {
    btn.disabled = false;
    btn.onclick = (e) => {
        onClick();
        document.querySelectorAll('.anim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    };
}

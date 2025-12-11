export const OPTIONS_MODAL_HTML = `
    <div id="options-content">
        <h2>Options</h2>
        
        <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #26324a;">
            <button id="quitGameBtn" style="width:100%; padding:10px; background:#e74c3c; color:white; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">
                Quitter la partie
            </button>
        </div>

        <label>Mode de déplacement</label>
        <select id="modalMoveMode" style="width:100%; padding:8px; background:#0e1523; color:#eaeefb; border:1px solid #26324a; border-radius:4px;">
            <option value="keyboard">Clavier (Flèches)</option>
            <option value="mouse">Souris (Cliquer pour bouger)</option>
        </select>
        <button class="close-btn" id="closeOptions">Fermer</button>
    </div>
`;

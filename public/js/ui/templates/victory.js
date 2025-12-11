export function generateVictoryModalHtml(winningTeam, players) {
    const teamName = winningTeam === "blue" ? "Bleue" : "Rouge";
    const teamColor = winningTeam === "blue" ? "#4A90E2" : "#E74C3C";

    // Separate players by team
    const bluePlayers = players.filter((p) => p.faction === "blue");
    const redPlayers = players.filter((p) => p.faction === "red");

    return `
        <div style="background:#0B1020; padding:40px; border-radius:12px; max-width:700px; width:90%; border:3px solid ${teamColor}; box-shadow:0 0 30px ${teamColor};">
            <h1 style="text-align:center; color:${teamColor}; font-size:48px; margin:0 0 30px 0; text-shadow:0 0 20px ${teamColor};">
                Victoire - Équipe ${teamName} !
            </h1>
            
            <div style="display:flex; flex-direction:column; gap:20px; margin-bottom:30px; overflow-y:auto; max-height:60vh;">
                <!-- Blue Team -->
                <div style="background:#0D1527; padding:15px; border-radius:8px; border:2px solid #4A90E2;">
                    <h3 style="color:#4A90E2; margin:0 0 10px 0; font-size:18px; text-align:center;">Équipe Bleue</h3>
                    <table style="width:100%; border-collapse:collapse; color:#eaeefb; font-size:12px;">
                        <thead style="background:#0B1020; color:#888;">
                            <tr>
                                <th style="padding:5px; text-align:left;">Joueur</th>
                                <th style="padding:5px;">K</th>
                                <th style="padding:5px;">A</th>
                                <th style="padding:5px;">Dmg (P)</th>
                                <th style="padding:5px;">Dmg (B)</th>
                                <th style="padding:5px;">Dmg (M)</th>
                                <th style="padding:5px;">CS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bluePlayers
            .map(
                (p) => `
                                <tr style="border-bottom:1px solid #26324a;">
                                    <td style="padding:5px; text-align:left;">
                                        <div style="font-weight:bold;">${p.name}</div>
                                        <div style="font-size:10px; color:#888;">${p.character} (Lvl ${p.level})</div>
                                    </td>
                                    <td style="padding:5px; text-align:center;">${p.kills}</td>
                                    <td style="padding:5px; text-align:center;">${p.assists}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToPlayers}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToBase}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToMinions}</td>
                                    <td style="padding:5px; text-align:center;">${p.minionsKilled}</td>
                                </tr>
                            `
            )
            .join("")}
                        </tbody>
                    </table>
                </div>
                
                <!-- Red Team -->
                <div style="background:#0D1527; padding:15px; border-radius:8px; border:2px solid #E74C3C;">
                    <h3 style="color:#E74C3C; margin:0 0 10px 0; font-size:18px; text-align:center;">Équipe Rouge</h3>
                   <table style="width:100%; border-collapse:collapse; color:#eaeefb; font-size:12px;">
                        <thead style="background:#0B1020; color:#888;">
                            <tr>
                                <th style="padding:5px; text-align:left;">Joueur</th>
                                <th style="padding:5px;">K</th>
                                <th style="padding:5px;">A</th>
                                <th style="padding:5px;">Dmg (P)</th>
                                <th style="padding:5px;">Dmg (B)</th>
                                <th style="padding:5px;">Dmg (M)</th>
                                <th style="padding:5px;">CS</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${redPlayers
            .map(
                (p) => `
                                <tr style="border-bottom:1px solid #26324a;">
                                    <td style="padding:5px; text-align:left;">
                                        <div style="font-weight:bold;">${p.name}</div>
                                        <div style="font-size:10px; color:#888;">${p.character} (Lvl ${p.level})</div>
                                    </td>
                                    <td style="padding:5px; text-align:center;">${p.kills}</td>
                                    <td style="padding:5px; text-align:center;">${p.assists}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToPlayers}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToBase}</td>
                                    <td style="padding:5px; text-align:center;">${p.damageDealtToMinions}</td>
                                    <td style="padding:5px; text-align:center;">${p.minionsKilled}</td>
                                </tr>
                            `
            )
            .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <button id="return-lobby-btn" style="width:100%; padding:15px; background:#4CAF50; color:white; border:none; border-radius:8px; font-size:18px; font-weight:bold; cursor:pointer;">
                Retour au Lobby (<span id="countdown">5</span>s)
            </button>
        </div>
    `;
}

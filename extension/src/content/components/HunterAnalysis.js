import { systemTokens, typography } from './sharedStyles.js';
import { SKILL_COLORS, STAT_ICONS, HUNTER_TYPE_BY_SKILL, getMonsterName, getHunterRecommendation, getCombatantFraming } from '../../shared/constants.js';
import { translateRank, formatNumber, LABELS, getHunterSystemSentence } from '../../shared/terminology.js';

import { SystemHeader } from './SystemHeader.js';
import { renderManaGauge } from './ManaGauge.js';
import { showSystemInfo } from '../hud/systemWindows.js';
import { countUp } from '../hud/animations.js';
import { startRegistrationStream } from '../sse/registrationStream.js';
import { formatStage } from '../../shared/terminology.js';
import { setCachedProfile } from '../../storage/profileCache.js';

export class HunterAnalysis {
    constructor() {
        this.element = document.createElement('div');
        this.element.style.width = '100%';
        this.element.style.display = 'flex';
        this.element.style.flexDirection = 'column';
        this.shadowRoot = this.element.attachShadow({ mode: 'open' });
        this._profile = null;
        this._profile = null;
        this._viewerProfile = null;
    }

    setProfiles(profile, viewerProfile) {
        this._profile = profile;
        this._viewerProfile = viewerProfile;
        this.render();
    }

    renderLoading() {
        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                .loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: var(--sys-text-muted);
                    font-family: var(--sys-font-secondary);
                    font-size: 14px;
                    letter-spacing: 2px;
                    animation: pulse 1.5s infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            </style>
            <div class="loading">SCANNING HUNTER IDENTITY...</div>
        `;
    }

    render() {
        if (!this._profile) return;
        const profile = this._profile;
        const rankTier = translateRank(profile.hunterRank?.rating);
        
        let avatarUrl = profile.titlePhoto || profile.avatar || "https://cdn.codeforces.com/no-avatar.jpg";
        if (avatarUrl.startsWith('//')) {
            avatarUrl = 'https:' + avatarUrl;
        }
        let displayName = profile.displayName || profile.handle;

        let dominantSkill = "Strength";
        let maxSkill = 0;
        if (profile.skillAffinities) {
            for (const [skill, val] of Object.entries(profile.skillAffinities)) {
                if (val > maxSkill) {
                    maxSkill = val;
                    dominantSkill = skill;
                }
            }
        }
        const hunterClassLabel = HUNTER_TYPE_BY_SKILL[dominantSkill] || "Unclassified Hunter";
        const dominantLower = dominantSkill.toLowerCase();
        const primaryColor = SKILL_COLORS[dominantLower] || 'var(--sys-frame-primary)';
        
        let progressPercent = 100;
        const currentRating = profile.hunterRank?.rating || 0;
        if (rankTier.nextRankRating) {
            progressPercent = Math.max(0, Math.min(100, ((currentRating - rankTier.minRating) / (rankTier.nextRankRating - rankTier.minRating)) * 100));
        }
        
        // Fix peak monster name to include rating
        const highestRating = profile.highestMonsterDefeated || 0;
        const peakMonsterTier = translateRank(highestRating);
        const peakMonsterName = highestRating > 0 ? `${getMonsterName(highestRating)} (${highestRating})` : "None";
        const peakMonsterColor = highestRating > 0 ? peakMonsterTier.color : "var(--sys-text)";
        
        const peakMana = Math.max(profile.manaPower || 0, profile.peakManaPower || 0) || 1;
        const manaPercent = Math.min(100, ((profile.manaPower || 0) / peakMana) * 100);

        const isComparison = this._viewerProfile && this._viewerProfile.handle !== profile.handle;
        const viewerMana = isComparison ? (this._viewerProfile.manaPower || 0) : 0;
        const targetMana = profile.manaPower || 0;
        
        if (profile.avatarUrl && profile.avatarUrl.startsWith('//')) {
            avatarUrl = 'https:' + profile.avatarUrl;
        } else if (profile.avatarUrl) {
            avatarUrl = profile.avatarUrl;
        }
        
        // --- Shared Header ---
        const headerHtml = `
            <div class="anim-seq delay-2" style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px; justify-content: center;">
                <img class="avatar" src="${avatarUrl}" alt="${profile.handle}" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 72 72%22><rect width=%2272%22 height=%2272%22 fill=%22%230f172a%22/><path d=%22M36 20C29.373 20 24 25.373 24 32C24 38.627 29.373 44 36 44C42.627 44 48 38.627 48 32C48 25.373 42.627 20 36 20ZM36 48C24.954 48 16 56.954 16 68H56C56 56.954 47.046 48 36 48Z%22 fill=%22%23334155%22/></svg>';">
                <div style="display: flex; flex-direction: column;">
                    <div class="hunter-name" style="color: #F8FAFC; font-size: 24px; text-shadow: 0 0 10px rgba(248, 250, 252, 0.4); font-weight: bold;">${(profile.displayName || profile.handle).toUpperCase()}</div>
                    <div class="hunter-sub" style="display: flex; align-items: center; gap: 6px; color:${rankTier.color}; margin-top: 4px; font-size: 16px; font-family: var(--sys-font-secondary); letter-spacing: 1px;">[${rankTier.label.toUpperCase()}] <span class="sys-info-btn" data-info="rank" style="cursor: pointer; color: #1EDBFF; font-size: 10px; border: 1px solid #1EDBFF; padding: 0 4px; border-radius: 2px; user-select: none; text-transform: lowercase;">i</span></div>
                    <div class="hunter-sub" style="display: flex; align-items: center; gap: 6px; color:${primaryColor}; margin-top: 4px; font-size: 16px; font-family: var(--sys-font-secondary); letter-spacing: 1px;">${hunterClassLabel.toUpperCase()} <span class="sys-info-btn" data-info="type" style="cursor: pointer; color: ${primaryColor}; font-size: 10px; border: 1px solid ${primaryColor}; padding: 0 4px; border-radius: 2px; user-select: none; text-transform: lowercase;">i</span></div>
                    <div style="margin-top: 8px;">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <button id="btn-reanalyze" class="sys-info-btn" style="cursor: pointer; color: #1EDBFF; font-size: 10px; border: 1px solid #1EDBFF; padding: 4px 8px; border-radius: 2px; font-family: var(--sys-font-secondary); background: transparent; letter-spacing: 1px; text-transform: uppercase; transition: all 0.2s ease;">
                                ◆ RE-ANALYZE
                            </button>
                            <button id="btn-support" class="sys-info-btn" title="Donate Mana (Support System Architect)" style="cursor: pointer; color: #1EDBFF; border: 1px solid #1EDBFF; padding: 4px; border-radius: 2px; background: transparent; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; height: 23px; width: 23px; box-sizing: border-box;">
                                <svg viewBox="0 0 24 24" fill="none" style="width: 14px; height: 14px; filter: drop-shadow(0 0 2px var(--sys-glow));" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L4 10l8 12 8-12-8-8z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M4 10h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M12 2v20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                            </button>
                        </div>
                        <div id="reanalyze-sse" style="color: #1EDBFF; font-size: 10px; margin-top: 4px; font-family: var(--sys-font-secondary); height: 12px; letter-spacing: 1px;"></div>
                    </div>
                </div>
            </div>
        `;


        // --- Stats Row ---
        // Right-aligned values for tension and width utilization
        let statsHtml = `
            <div class="anim-seq delay-3" style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 12px; width: 100%;">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <div class="sys-label" style="font-size: 14px; display: flex; align-items: center;">HUNTER LEVEL <span class="sys-info-btn" data-info="level" style="cursor: pointer; color: #1EDBFF; font-size: 10px; border: 1px solid #1EDBFF; padding: 0 4px; border-radius: 2px; margin-left: 6px; user-select: none; text-transform: lowercase;">i</span></div>
                        <div class="sys-value" style="color: var(--sys-color-level); font-size: 18px;">Lv. <span id="stat-level">${profile.hunterLevel || 0}</span></div>
                    </div>
                    <div class="sys-label" style="font-size: 11px; margin-top: 4px; color: var(--sys-text-muted);">RANK PROGRESS</div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                        <div style="flex: 1; height: 4px; background: rgba(255,255,255,0.1); position: relative;">
                            <div id="stat-progress-bar" style="position: absolute; top: 0; left: 0; height: 100%; width: ${progressPercent}%; background: ${rankTier.color}; box-shadow: 0 0 6px ${rankTier.color}; transition: width 1s ease-out, background 0.5s, box-shadow 0.5s;"></div>
                        </div>
                        <div class="sys-label" id="stat-progress-text" style="font-size: 14px; color: ${rankTier.color}; margin: 0; font-weight: bold;">${progressPercent.toFixed(1)}%</div>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-top: 8px;">
                    <div class="sys-label" style="font-size: 14px;">MONSTERS DEFEATED</div>
                    <div class="sys-value" id="stat-monsters" style="color: var(--sys-text); font-size: 18px;">${profile.problemsDefeated || 0}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div class="sys-label" style="font-size: 14px;">DUNGEONS CLEARED</div>
                    <div class="sys-value" id="stat-dungeons" style="color: var(--sys-text); font-size: 18px;">${profile.contestsParticipated || 0}</div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                    <div class="sys-label" style="font-size: 14px;">HIGHEST NEUTRALIZED MONSTER</div>
                    <div class="sys-value" id="stat-highest-monster" style="color: ${peakMonsterColor}; font-size: 16px;">${peakMonsterName}</div>
                </div>
            </div>
        `;



        let bottomRowHtml = `
            <div class="anim-seq delay-5" style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 4px;">
                <div class="sys-label" style="font-size: 14px; display: flex; align-items: center;">PRIMARY AFFINITY <span class="sys-info-btn" data-info="affinity" style="cursor: pointer; color: #1EDBFF; font-size: 10px; border: 1px solid #1EDBFF; padding: 0 4px; border-radius: 2px; margin-left: 6px; user-select: none; text-transform: lowercase;">i</span></div>
                <div class="sys-value" style="color: ${primaryColor}; font-size: 16px;">${dominantSkill.toUpperCase()}</div>
            </div>
        `;
        let comparisonHtml = '';

        if (isComparison) {
            const recLabel = getHunterRecommendation(viewerMana, targetMana);
            let recColor = "var(--sys-frame-primary)";
            if (recLabel.includes('Retreat') || recLabel.includes('Extreme')) recColor = "var(--sys-color-danger)";
            else if (recLabel.includes('High Risk') || recLabel.includes('Dangerous')) recColor = "rgba(255, 207, 107, 1)";
            else if (recLabel.includes('Comparable')) recColor = "var(--sys-color-mana)";
            else if (recLabel.includes('Below')) recColor = "var(--sys-color-level)";

            const threatData = getCombatantFraming(viewerMana, targetMana);
            const threatColor = threatData.color;
            const threatLabel = threatData.label;

            comparisonHtml = `
                <div class="anim-seq delay-6" style="display: flex; flex-direction: column; align-items: center; margin-top: 2px; margin-bottom: 2px;">
                    <div style="text-align: center;">
                        <div class="sys-label" style="font-size: 11px;">SYSTEM VERDICT</div>
                        <div class="sys-value" style="color: ${recColor}; font-size: 19px; font-weight: bold; margin-top: 4px; text-shadow: 0 0 12px ${recColor}; letter-spacing: 1px;">${recLabel.toUpperCase()}</div>
                    </div>
                </div>
            `;
        }

        const bodyHtml = `
            ${headerHtml}
            
            ${renderManaGauge(targetMana, profile.peakManaPower || profile.manaPower || 0, 'var(--sys-color-mana)', true, '', true)}
            
            ${statsHtml}
            
            ${bottomRowHtml}

            ${isComparison ? `<div class="anim-seq delay-6" style="height: 1px; background: rgba(255,255,255,0.15); margin: 4px 0 6px 0; width: 100%;"></div>${comparisonHtml}` : ''}
        `;

        this.shadowRoot.innerHTML = `
            <style>
                ${systemTokens}
                ${typography}
                :host {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    box-sizing: border-box;
                }

                .divider {
                    height: 1px;
                    background: linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%);
                    width: 100%;
                    margin: 16px 0;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                /* Identity Layout */
                .avatar {
                    width: 72px;
                    height: 72px;
                    border-radius: 4px;
                    border: 2px solid var(--sys-frame-primary);
                    box-shadow: 0 0 15px var(--sys-glow-subtle);
                    transition: box-shadow 0.3s ease, border-color 0.3s ease;
                }
                .avatar:hover {
                    box-shadow: 0 0 25px var(--sys-glow);
                    border-color: #fff;
                }
                .hunter-name {
                    font-size: 36px;
                    line-height: 1;
                    font-weight: bold;
                    color: #F8FAFC;
                    text-shadow: 0 0 12px var(--sys-glow-subtle);
                    font-family: var(--sys-font-secondary);
                    letter-spacing: 2px;
                }
                .hunter-sub {
                    font-size: 12px;
                    font-family: var(--sys-font-secondary);
                    color: var(--sys-text-muted);
                }

                /* Removed old mana and promotion bar CSS */

                @keyframes sys-fade-in {
                    from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .anim-seq {
                    opacity: 0;
                    animation: sys-fade-in 0.4s ease-out forwards;
                }
                .delay-1 { animation-delay: 0.6s; }
                .delay-2 { animation-delay: 0.7s; }
                .delay-3 { animation-delay: 0.8s; }
                .delay-4 { animation-delay: 0.9s; }
                .delay-5 { animation-delay: 1.0s; }
                .sys-info-btn:hover {
                    background: rgba(0, 240, 255, 0.1);
                    text-shadow: 0 0 5px #1EDBFF;
                    box-shadow: 0 0 5px #1EDBFF;
                }
            </style>

            <div id="header-container" class="anim-seq delay-1"></div>
            
            <div style="flex: 1; display: flex; flex-direction: column;">
                ${bodyHtml}
            </div>
        `;
        
        const header = new SystemHeader('HUNTER ANALYSIS');
        this.shadowRoot.getElementById('header-container').appendChild(header.element);

        // Animate Bars
        setTimeout(() => {
            const fills = this.shadowRoot.querySelectorAll('.sys-instrument-bar-fill');
            fills.forEach(fill => {
                fill.style.width = fill.getAttribute('data-target-width') + '%';
            });
        }, 1200);

        // Animate Numbers
        setTimeout(() => {
            const numberEls = this.shadowRoot.querySelectorAll('.anim-num');
            numberEls.forEach(el => {
                const target = parseFloat(el.getAttribute('data-target-num'));
                if (isNaN(target) || target === 0) return;
                const duration = 600 + Math.random() * 300;
                const startTime = performance.now();
                const animate = (time) => {
                    const elapsed = time - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);
                    const current = Math.round(easeOut * target);
                    el.textContent = formatNumber(current);
                    if (progress < 1) requestAnimationFrame(animate);
                    else el.textContent = formatNumber(target);
                };
                requestAnimationFrame(animate);
            });
        }, 800);

        // Setup Info Buttons
        const infoBtns = this.shadowRoot.querySelectorAll('.sys-info-btn');
        infoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = btn.getAttribute('data-info');
                if (type === 'level') {
                    showSystemInfo("HUNTER LEVEL", "Your Hunter Level is a comprehensive measure of your overall experience and endurance. It is an evenly balanced aggregate of:<br><br>◆ <b>20% Rating</b><br>◆ <b>20% Combat Proficiency</b> (Total Solves)<br>◆ <b>20% Contest Experience</b><br>◆ <b>20% Problem Diversity</b><br>◆ <b>20% Active Days</b><br><br>Unlike Mana Power, your Hunter Level resists decay and represents your cumulative journey.");
                } else if (type === 'mana') {
                    showSystemInfo("MANA POWER", "Mana Power is your raw combat potential. Rather than just Codeforces Rating, it is a weighted aggregate of your overall capabilities:<br><br>◆ <b>35% Rating</b><br>◆ <b>25% Combat Proficiency</b> (Total Solves)<br>◆ <b>15% Contest Experience</b><br>◆ <b>15% Problem Diversity</b><br>◆ <b>10% Active Days</b><br><br>Peak Mana is the highest potential you have ever achieved.");
                } else if (type === 'rank') {
                    showSystemInfo("HUNTER RANK", "Rank represents your standing, mapped directly from your Codeforces Rating:<br><br>◆ <b>E-Rank</b>: < 1200 (Newbie)<br>◆ <b>D-Rank</b>: 1200 - 1399 (Pupil)<br>◆ <b>C-Rank</b>: 1400 - 1599 (Specialist)<br>◆ <b>B-Rank</b>: 1600 - 1899 (Expert)<br>◆ <b>A-Rank</b>: 1900 - 2099 (Candidate Master)<br>◆ <b>S-Rank</b>: 2100 - 2399 (Master)<br>◆ <b>National Level</b>: 2400+ (Grandmaster+)");
                } else if (type === 'type') {
                    showSystemInfo("HUNTER CLASS", "Your Hunter Class is derived from your Primary Affinity:<br><br>◆ <b>STRENGTH</b> → Fighter-Type<br>◆ <b>MAGIC</b> → Mage-Type<br>◆ <b>AGILITY</b> → Assassin-Type<br>◆ <b>STRATEGY</b> → Commander-Type<br>◆ <b>PERCEPTION</b> → Ranger-Type<br>◆ <b>INTELLIGENCE</b> → Scholar-Type");
                } else if (type === 'affinity') {
                    showSystemInfo("PRIMARY AFFINITY", "The System categorizes Codeforces tags into Combat Specialties:<br><br>◆ <b>STRENGTH</b>: implementation, brute force, constructive algorithms, math<br>◆ <b>MAGIC</b>: dp, graphs, trees, math<br>◆ <b>AGILITY</b>: greedy, sortings, two pointers, binary search<br>◆ <b>STRATEGY</b>: data structures, divide and conquer, geometry, strings<br>◆ <b>PERCEPTION</b>: dfs and similar, shortest paths, dsu<br>◆ <b>INTELLIGENCE</b>: number theory, combinatorics, probabilities, bitmasks");
                }
            });
        });

        // Setup Re-Analyze Button
        const reanalyzeBtn = this.shadowRoot.getElementById('btn-reanalyze');
        if (reanalyzeBtn) {
            reanalyzeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                reanalyzeBtn.disabled = true;
                reanalyzeBtn.innerText = 'ANALYZING...';
                reanalyzeBtn.style.opacity = '0.7';

                const sseDiv = this.shadowRoot.getElementById('reanalyze-sse');
                sseDiv.innerText = 'Waking up SYSTEM...';

                chrome.runtime.sendMessage({ type: 'REFRESH_HUNTER', handle: profile.handle }, (res) => {
                    if (!res.ok) {
                        if (res.reason === 'PROCESSING') {
                            sseDiv.innerText = 'GATHERING HUNTER INTEL...';
                            const stopStream = startRegistrationStream(profile.handle, (data) => {
                                if (data.stage) {
                                    sseDiv.innerText = formatStage(data.stage);
                                }
                            }, async (data) => {
                                if (data.status === 'READY') {
                                    sseDiv.innerText = '';
                                    reanalyzeBtn.innerText = '◆ RE-ANALYZE';
                                    reanalyzeBtn.disabled = false;
                                    reanalyzeBtn.style.opacity = '1';
                                    if (data.profile) {
                                        this.updateDataInPlace(data.profile);
                                    }
                                }
                            }, (err) => {
                                sseDiv.innerText = 'SYSTEM STALLED. Try again.';
                                setTimeout(() => { sseDiv.innerText = ''; reanalyzeBtn.disabled = false; reanalyzeBtn.innerText = '◆ RE-ANALYZE'; reanalyzeBtn.style.opacity = '1'; }, 3000);
                            });
                        } else if (res.reason === 'RATE_LIMITED') {
                            sseDiv.innerText = 'SYSTEM cooldown active — try again shortly';
                            setTimeout(() => { sseDiv.innerText = ''; reanalyzeBtn.disabled = false; reanalyzeBtn.innerText = '◆ RE-ANALYZE'; reanalyzeBtn.style.opacity = '1'; }, 3000);
                        } else if (res.reason === 'NOT_FOUND') {
                            sseDiv.innerText = 'Hunter not found';
                            setTimeout(() => { sseDiv.innerText = ''; reanalyzeBtn.disabled = false; reanalyzeBtn.innerText = '◆ RE-ANALYZE'; reanalyzeBtn.style.opacity = '1'; }, 3000);
                        } else {
                            sseDiv.innerText = 'SYSTEM temporarily unreachable';
                            setTimeout(() => { sseDiv.innerText = ''; reanalyzeBtn.disabled = false; reanalyzeBtn.innerText = '◆ RE-ANALYZE'; reanalyzeBtn.style.opacity = '1'; }, 3000);
                        }
                    } else {
                        // 200 OK (returned immediately if not processing, though refresh usually returns 202)
                        sseDiv.innerText = '';
                        reanalyzeBtn.innerText = '◆ RE-ANALYZE';
                        reanalyzeBtn.disabled = false;
                        reanalyzeBtn.style.opacity = '1';
                        if (res.data) {
                            this.updateDataInPlace(res.data);
                        }
                    }
                });
            });
        }

        // Setup Support Button
        const supportBtn = this.shadowRoot.getElementById('btn-support');
        if (supportBtn) {
            supportBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.open('https://rzp.io/rzp/SupportCFHunterSystemExtension', '_blank');
            });
        }
    }

    updateDataInPlace(newProfile) {
        setCachedProfile(newProfile.handle, newProfile);
        this._profile = newProfile;
        
        // Update Level
        const levelEl = this.shadowRoot.getElementById('stat-level');
        if (levelEl && newProfile.hunterLevel !== undefined) {
            countUp(levelEl, parseInt(levelEl.innerText.replace(/,/g, '')), newProfile.hunterLevel);
        }

        // Update Monsters
        const monstersEl = this.shadowRoot.getElementById('stat-monsters');
        if (monstersEl && newProfile.problemsDefeated !== undefined) {
            countUp(monstersEl, parseInt(monstersEl.innerText.replace(/,/g, '')), newProfile.problemsDefeated);
        }

        // Update Dungeons
        const dungeonsEl = this.shadowRoot.getElementById('stat-dungeons');
        if (dungeonsEl && newProfile.contestsParticipated !== undefined) {
            countUp(dungeonsEl, parseInt(dungeonsEl.innerText.replace(/,/g, '')), newProfile.contestsParticipated);
        }

        // Update Mana & Progress
        const rankTier = translateRank(newProfile.hunterRank?.rating);
        let progressPercent = 100;
        const currentRating = newProfile.hunterRank?.rating || 0;
        if (rankTier.nextRankRating) {
            progressPercent = Math.max(0, Math.min(100, ((currentRating - rankTier.minRating) / (rankTier.nextRankRating - rankTier.minRating)) * 100));
        }

        const bar = this.shadowRoot.getElementById('stat-progress-bar');
        const barText = this.shadowRoot.getElementById('stat-progress-text');
        if (bar && barText) {
            bar.style.width = `${progressPercent}%`;
            bar.style.background = rankTier.color;
            bar.style.boxShadow = `0 0 6px ${rankTier.color}`;
            barText.innerText = `${progressPercent.toFixed(1)}%`;
            barText.style.color = rankTier.color;
        }

        const peakMana = Math.max(newProfile.manaPower || 0, newProfile.peakManaPower || 0) || 1;
        const manaPercent = Math.min(100, ((newProfile.manaPower || 0) / peakMana) * 100);
        
        const manaBar = this.shadowRoot.querySelector('.mana-gauge-container > div:last-child > div');
        const manaText = this.shadowRoot.querySelector('.mana-gauge-container .sys-value');
        if (manaBar && manaText && newProfile.manaPower !== undefined) {
            manaBar.style.width = `${manaPercent}%`;
            countUp(manaText, parseInt(manaText.innerText.replace(/,/g, '')), newProfile.manaPower);
        }
    }
}

import { detectPage, PAGE_TYPES } from './pageDetector.js';
import { initHUD } from './hud/hudRoot.js';
import { HunterAnalysis } from './components/HunterAnalysis.js';
import { MonsterAnalysis } from './components/MonsterAnalysis.js';
import { GateAnalysis } from './components/GateAnalysis.js';
import { SystemNotification } from './components/SystemNotification.js';
import { scrapeProfile, scrapeLoggedInHandle } from './scrapers/profileScraper.js';
import { scrapeProblem } from './scrapers/problemScraper.js';
import { scrapeContest } from './scrapers/contestScraper.js';
import { getCachedProfile, setCachedProfile } from '../storage/profileCache.js';
import { startRegistrationStream } from './sse/registrationStream.js';
import { checkMilestones } from './hud/systemWindows.js';
import { analyzeMonster } from '../runtime/monsterAnalysis.js';
import { analyzeGate } from '../runtime/gateAnalysis.js';
import { evaluateHunterProfile, evaluateMonsterThreat } from '../runtime/systemAssessment.js';
import { evaluateRelativeHunter } from '../runtime/hunterComparison.js';
import { translateRank, formatNumber, translateTag } from '../shared/terminology.js';
import { STAT_ICONS, getRecommendedStrategy, getMonsterName, getHunterRecommendation, HUNTER_CLASSES, HUNTER_TYPE_BY_SKILL, getSelfRecommendation } from '../shared/constants.js';
import { countUp, typeText } from './hud/animations.js';
import { runBootSequence } from './hud/bootSequence.js';

export async function main() {
    console.log("Hunter System: Main module loaded.");
    const pageType = detectPage(window.location.href);
    
    // Initialize the HUD shell (Phase 4)
    const hud = initHUD(pageType);
    if (!hud) return; // Already initialized

    if (pageType === PAGE_TYPES.PROFILE) {
        await handleProfilePage(hud);
    } else if (pageType === PAGE_TYPES.PROBLEM) {
        await handleProblemPage(hud);
    } else if (pageType === PAGE_TYPES.CONTEST) {
        await handleContestPage(hud);
    } else {
        updateHUDContent(hud, `Standby Mode.<br>Awaiting relevant targets.`);
    }
}

function queryHUD(hud, selector) {
    if (hud.content.firstChild && hud.content.firstChild.shadowRoot) {
        return hud.content.firstChild.shadowRoot.querySelector(selector);
    }
    return hud.content.querySelector(selector);
}

async function handleProfilePage(hud) {
    const { handle } = scrapeProfile();
    const loggedInHandle = scrapeLoggedInHandle();

    if (!handle) {
        updateHUDContent(hud, "No Hunter Handle Detected");
        return;
    }

    updateHUDContent(hud, `Scanning Hunter: ${handle}...`);

    let profile = await getCachedProfile(handle);
    let loggedInProfile = null;

    if (loggedInHandle && loggedInHandle !== handle) {
        loggedInProfile = await getCachedProfile(loggedInHandle);
        if (!loggedInProfile) {
            // Need to fetch logged in hunter if not cached so we can compare
            // But for simplicity, if it's not cached, we'll try to get it gracefully or just skip relative comparison.
            await new Promise((resolve) => {
                chrome.runtime.sendMessage({ type: 'GET_HUNTER', handle: loggedInHandle }, (res) => {
                    if (res.ok && res.data) {
                        loggedInProfile = res.data;
                        setCachedProfile(loggedInHandle, loggedInProfile);
                    }
                    resolve();
                });
            });
        }
    }

    // Add sanity check to bypass old corrupted cache where status was saved instead of profile
    if (profile && profile.hunterLevel !== undefined && !profile._isOutdated) {
        if (profile.contestsParticipated === undefined) {
            profile.contestsParticipated = await fetchContestsParticipated(handle);
        }
        
        renderProfile(hud, profile, loggedInProfile);
        return;
    }

    updateHUDContent(hud, `Fetching data from Hunter Association...`);
    
    // Fetch from background service worker
    chrome.runtime.sendMessage({ type: 'GET_HUNTER', handle }, async (response) => {
        if (!response.ok) {
            if (response.reason === 'PROCESSING') {
                startRegistrationFlow(hud, handle, response.isColdStart);
            } else if (response.reason === 'NOT_FOUND') {
                startRegistrationFlow(hud, handle, false);
            } else if (response.reason === 'UNREACHABLE') {
                updateHUDContent(hud, `SYSTEM temporarily unreachable.<br><button id="btn-retry">Retry</button>`);
                
                const retryHandler = (e) => {
                    if (e.detail.action === 'btn-retry') {
                        hud.content.removeEventListener('system-action', retryHandler);
                        handleProfilePage(hud);
                    }
                };
                hud.content.addEventListener('system-action', retryHandler);
            } else {
                updateHUDContent(hud, `Error: ${response.reason}`);
            }
            return;
        }

        // 200 OK
        if (response.isColdStart) {
            updateHUDContent(hud, `SYSTEM was sleeping. Waking up...`);
            await new Promise(r => setTimeout(r, 1000));
        }

        checkMilestones(profile, response.data);
        
        response.data.contestsParticipated = await fetchContestsParticipated(handle);
        await setCachedProfile(handle, response.data);
        
        renderProfile(hud, response.data, loggedInProfile);
    });
}

async function fetchContestsParticipated(handle) {
    try {
        const res = await fetch(`https://codeforces.com/api/user.rating?handle=${handle}`);
        const data = await res.json();
        if (data && data.status === 'OK' && data.result) {
            return data.result.length;
        }
    } catch (e) {
        console.error("Failed to fetch contest count:", e);
    }
    return 0;
}

function startRegistrationFlow(hud, handle, isColdStart) {
    let narrativeHtml = `Unknown Hunter Detected: ${handle}`;
    if (isColdStart) {
        narrativeHtml = `SYSTEM waking up...<br>` + narrativeHtml;
    }
    
    narrativeHtml += `<br><button id="btn-analyze" style="background:transparent; border:1px solid var(--sys-frame-primary); color:var(--sys-frame-primary); padding:8px 16px; cursor:pointer; margin-top:16px;">ANALYZE</button>`;
    updateHUDContent(hud, narrativeHtml);

    const actionHandler = (e) => {
        if (e.detail.action === 'btn-analyze') {
            hud.content.removeEventListener('system-action', actionHandler);
            
            // Trigger POST request to backend via Service Worker to ensure job starts!
            chrome.runtime.sendMessage({ type: 'REFRESH_HUNTER', handle }, () => {
                // Ignore response, just kick off the job
            });

            updateHUDContent(hud, `Synchronizing with Hunter Association...<br><div id="sse-stage" style="margin-top:16px; color:var(--sys-frame-primary);"></div>`);
            const stageDiv = queryHUD(hud, '#sse-stage');
            
            startRegistrationStream(handle, (data) => {
                if (data.stage && stageDiv) {
                    stageDiv.innerText = formatStage(data.stage);
                }
            }, async (data) => {
            if (data.status === 'READY') {
                const fetchAndRender = async () => {
                    chrome.runtime.sendMessage({ type: 'GET_HUNTER', handle }, async (profileResponse) => {
                        if (profileResponse.ok) {
                            const oldProfile = await getCachedProfile(handle);
                            checkMilestones(oldProfile, profileResponse.data);
                            await setCachedProfile(handle, profileResponse.data);
                            renderProfile(hud, profileResponse.data, loggedInProfile);
                        } else {
                            updateHUDContent(hud, `Failed to fetch profile.`);
                        }
                    });
                };

                if (data.profile) {
                    const oldProfile = await getCachedProfile(handle);
                    checkMilestones(oldProfile, data.profile);
                    await setCachedProfile(handle, data.profile);
                    renderProfile(hud, data.profile, loggedInProfile);
                } else {
                    fetchAndRender();
                }
            } else {
                updateHUDContent(hud, `Registration Failed.`);
            }
        }, (err) => {
            if (stageDiv) stageDiv.innerText += `\n[Stream Error - Falling back to polling...]`;
            pollStatus(hud, handle);
        });
        } // Close if
    };
    hud.content.addEventListener('system-action', actionHandler);
}

function pollStatus(hud, handle) {
    const stageDiv = queryHUD(hud, '#sse-stage');
    const interval = setInterval(() => {
        chrome.runtime.sendMessage({ type: 'GET_STATUS', handle }, async (response) => {
            if (response.ok && response.data && response.data.status === 'READY') {
                clearInterval(interval);
                chrome.runtime.sendMessage({ type: 'GET_HUNTER', handle }, async (profileResponse) => {
                    if (profileResponse.ok) {
                        const oldProfile = await getCachedProfile(handle);
                        checkMilestones(oldProfile, profileResponse.data);
                        await setCachedProfile(handle, profileResponse.data);
                        renderProfile(hud, profileResponse.data, loggedInProfile);
                    } else {
                        updateHUDContent(hud, `Failed to retrieve Profile.`);
                    }
                });
            } else if ((!response.ok && response.reason === 'PROCESSING') || (response.ok && response.data && response.data.status === 'PROCESSING')) {
                const stage = (!response.ok) ? (response.stage || 'FETCHING_DATA') : (response.data.stage || 'FETCHING_DATA');
                if (stage && stageDiv) {
                    stageDiv.innerText = formatStage(stage) + ' (polling)';
                }
            } else {
                clearInterval(interval);
                console.error("Hunter System Polling Failed:", response);
                updateHUDContent(hud, `Polling Failed.`);
            }
        });
    }, 3000);
}

async function renderProfile(hud, profile, viewerProfile = null) {
    const analysis = new HunterAnalysis();
    hud.content.innerHTML = '';
    hud.content.appendChild(analysis.element);
    
    // Fetch and assign display name/avatar
    let avatarUrl = "https://cdn.codeforces.com/no-avatar.jpg";
    let displayName = profile.handle;
    try {
        const res = await fetch(`https://codeforces.com/api/user.info?handles=${profile.handle}`);
        const data = await res.json();
        if (data.status === 'OK' && data.result.length > 0) {
            const user = data.result[0];
            avatarUrl = user.titlePhoto || user.avatar || avatarUrl;
            if (avatarUrl.startsWith('//')) {
                avatarUrl = 'https:' + avatarUrl;
            }
            if (user.firstName && user.lastName) {
                displayName = `${user.firstName} ${user.lastName}`;
            } else if (user.firstName) {
                displayName = user.firstName;
            } else if (user.lastName) {
                displayName = user.lastName;
            }
        }
    } catch(e) {}

    profile.avatarUrl = avatarUrl;
    profile.displayName = displayName;
    
    analysis.setProfiles(profile, viewerProfile);
}

async function handleProblemPage(hud) {
    const problem = scrapeProblem();
    const handle = scrapeLoggedInHandle();
    const profile = handle ? await getCachedProfile(handle) : null;

    const analysisComponent = new MonsterAnalysis();
    hud.content.innerHTML = '';
    hud.content.appendChild(analysisComponent.element);
    
    const analysis = analyzeMonster(problem.rating || 0, profile || {});
    analysisComponent.setData(problem, profile, analysis);
}

async function handleContestPage(hud) {
    const handle = scrapeLoggedInHandle();
    const contest = scrapeContest();

    if (!contest.name) {
        updateHUDContent(hud, `<div style="text-align:center; padding: 24px; font-family: var(--sys-font-secondary); color: var(--sys-text-muted);">No Gate Detected.</div>`);
        return;
    }

    const profile = handle ? await getCachedProfile(handle) : null;
    const analysis = analyzeGate(contest, profile);

    const analysisComponent = new GateAnalysis();
    hud.content.innerHTML = '';
    hud.content.appendChild(analysisComponent.element);
    analysisComponent.setData(contest, analysis);
}

function formatStage(stage) {
    return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + "...";
}

let activeAnimations = [];

function triggerDataAnimations(contentEl) {
    // Clear old animation loops if re-rendering
    activeAnimations.forEach(cancel => cancel());
    activeAnimations = [];

    const countEls = contentEl.querySelectorAll('[data-count-up]');
    countEls.forEach(el => {
        const target = el.getAttribute('data-count-up');
        activeAnimations.push(countUp(el, 0, target));
    });

    const typeEls = contentEl.querySelectorAll('[data-type-text]');
    typeEls.forEach(el => {
        const text = el.getAttribute('data-type-text');
        activeAnimations.push(typeText(el, text, 30));
    });
    
    const infoIcons = contentEl.querySelectorAll('.info-icon');
    infoIcons.forEach(icon => {
        icon.style.cursor = 'pointer';
        icon.style.color = 'var(--sys-accent)';
        icon.onclick = () => {
            const targetId = 'info-box-' + icon.getAttribute('data-info');
            const targetEl = contentEl.querySelector('#' + targetId);
            if (targetEl) {
                targetEl.style.display = targetEl.style.display === 'none' ? 'block' : 'none';
            }
        };
    });
}

function updateHUDContent(hud, html) {
    if (html.includes('<hunter-') || html.includes('<monster-') || html.includes('<gate-')) {
        hud.content.innerHTML = html;
    } else {
        const notif = new SystemNotification();
        notif.content = html;
        hud.content.innerHTML = '';
        hud.content.appendChild(notif.element);
    }
    triggerDataAnimations(hud.content);
}

function setHUDContentWithBoot(hud, html) {
    runBootSequence(hud.container, hud.content, () => {
        updateHUDContent(hud, html);
    });
}

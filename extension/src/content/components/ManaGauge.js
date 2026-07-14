export function renderManaGauge(currentMana, peakMana, color = 'var(--sys-color-mana)', animate = false, rightLabelHtml = '') {
    const maxMana = 5000;
    const currentClamped = Math.min(maxMana, Math.max(0, currentMana));
    const peakClamped = Math.min(maxMana, Math.max(0, peakMana));
    
    const currentPercent = (currentClamped / maxMana) * 100;
    const peakPercent = (peakClamped / maxMana) * 100;

    const delayClass = animate ? 'anim-seq delay-4' : '';
    
    return `
        <div class="mana-gauge-container ${delayClass}" style="width: 100%; margin: 8px 0 12px 0; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-end; padding: 0 2px;">
                <div class="sys-label" style="font-size: 10px;">MANA POWER</div>
                <div style="display: flex; gap: 8px; align-items: baseline;">
                    <div class="sys-value" style="color: ${color}; font-size: 12px;">${Math.floor(currentMana)}</div>
                    ${rightLabelHtml}
                </div>
            </div>
            
            <div style="position: relative; width: 100%; height: 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); overflow: visible;">
                <!-- Fill -->
                <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${currentPercent}%; background: ${color}; box-shadow: 0 0 10px ${color}; transition: width 1s ease-out;"></div>
                
                <!-- Peak Marker -->
                ${peakClamped > 0 ? `
                    <div style="position: absolute; top: -4px; bottom: -4px; left: ${peakPercent}%; width: 2px; background: #fff; box-shadow: 0 0 6px #fff; z-index: 2;"></div>
                    <div style="position: absolute; top: -14px; left: calc(${peakPercent}% - 12px); width: 24px; text-align: center; color: #fff; font-size: 8px; font-family: var(--sys-font-secondary); text-shadow: 0 0 4px #fff; pointer-events: none;">PEAK</div>
                ` : ''}
                
                <!-- Ticks -->
                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; pointer-events: none;">
                    <div style="width: 1px; height: 100%; background: rgba(255,255,255,0.2);"></div>
                    <div style="width: 1px; height: 100%; background: rgba(255,255,255,0.2);"></div>
                    <div style="width: 1px; height: 100%; background: rgba(255,255,255,0.2);"></div>
                    <div style="width: 1px; height: 100%; background: rgba(255,255,255,0.2);"></div>
                    <div style="width: 1px; height: 100%; background: rgba(255,255,255,0.2);"></div>
                </div>
            </div>
            </div>
        </div>
    `;
}

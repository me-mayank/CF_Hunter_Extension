export const systemTokens = `
    :host {
        /* Color Palette from Reference */
        --sys-frame-primary: #9D00FF;
        --sys-frame-secondary: rgba(157, 0, 255, 0.35);
        --sys-frame-dark: rgba(12, 22, 38, 0.92);
        --sys-glow: #C466FF;
        --sys-glow-subtle: rgba(196, 102, 255, 0.2);
        
        /* Outer Frame Accents */
        --sys-outer-frame: #9D00FF;
        --sys-outer-frame-sec: rgba(157, 0, 255, 0.35);
        --sys-glass-border: #C466FF;
        
        /* Glass Material */
        --sys-glass-bg: rgba(10, 10, 15, 0.75);
        --sys-blur: blur(8px);
        
        /* Line Weights */
        --sys-border-primary: 2px;
        --sys-border-secondary: 1px;
        --sys-border-inner: 0.5px;
        
        /* Typography */
        --sys-font-primary: 'Orbitron', 'Exo 2', sans-serif;
        --sys-font-secondary: 'Rajdhani', 'Share Tech Mono', monospace;
        
        --sys-text: #e0f2fe;
        --sys-text-muted: #8092A7;
        --sys-text-label: #C7D4DF;
        --sys-text-alert: #FF6666;
        
        --sys-color-level: #58F27E;
        --sys-color-mana: #AE69FF;
        --sys-color-danger: #FF6666;
    }

    * {
        box-sizing: border-box;
    }
`;

export const typography = `
    .sys-title {
        font-family: var(--sys-font-primary);
        font-weight: 700;
        font-size: 18px;
        color: var(--sys-glow);
        text-shadow: 0 0 12px var(--sys-glow-subtle);
        letter-spacing: 2px;
        text-transform: uppercase;
        margin: 0;
    }
    .sys-label {
        font-family: var(--sys-font-secondary);
        font-size: 16px;
        color: #94A3B8; /* Soft grey-blue */
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
    }
    .sys-value {
        font-family: var(--sys-font-primary);
        font-weight: 600;
        font-size: 24px;
        color: #F8FAFC; /* Bright white */
        margin: 0;
    }
    .sys-section-header {
        font-family: var(--sys-font-secondary);
        font-size: 14px;
        color: var(--sys-frame-primary);
        letter-spacing: 2px;
        margin-top: 16px;
        margin-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        padding-bottom: 4px;
        text-transform: uppercase;
    }
    
    /* 3-Tier Typography Scale */
    .sys-tier-1 {
        font-family: var(--sys-font-primary);
        font-size: 38px;
        font-weight: 700;
        text-shadow: 0 0 16px var(--sys-glow);
        text-transform: uppercase;
        letter-spacing: 2px;
        line-height: 1.1;
        margin: 0;
    }
    .sys-tier-2 {
        font-family: var(--sys-font-secondary);
        font-size: 18px;
        font-weight: 500;
        color: var(--sys-text);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
    }
    .sys-tier-3 {
        font-family: var(--sys-font-secondary);
        font-size: 14px;
        font-weight: 400;
        color: var(--sys-text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
    }

    /* Layout Elements */
    .sys-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        font-family: var(--sys-font-secondary);
        font-size: 12px;
        color: var(--sys-text-label);
        text-transform: uppercase;
    }
    .sys-chip-value {
        font-family: var(--sys-font-primary);
        font-size: 14px;
        color: var(--sys-text);
        font-weight: bold;
    }
    .sys-declarative {
        font-family: var(--sys-font-secondary);
        font-size: 15px;
        color: var(--sys-text-muted);
        text-align: center;
        margin-bottom: 16px;
        font-style: italic;
    }

    /* Instrument HUD Bars */
    .sys-instrument-bar-container {
        width: 100%;
        height: 10px;
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid rgba(255, 255, 255, 0.2);
        position: relative;
        overflow: hidden;
        border-radius: 0;
    }
    .sys-instrument-bar-fill {
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        border-radius: 0;
        transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sys-instrument-bar-ticks {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background-image: repeating-linear-gradient(90deg, transparent, transparent 10%, rgba(0,0,0,0.4) 10%, rgba(0,0,0,0.4) 11%);
        pointer-events: none;
    }
`;

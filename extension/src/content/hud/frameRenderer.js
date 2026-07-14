/**
 * Generates an intricate geometric CSS frame with stepped corners
 * built entirely out of absolute-positioned glowing divs.
 */

export function createGeometricFrame() {
    const frameContainer = document.createElement('div');
    frameContainer.className = 'geometric-frame-container';
    
    // Line definitions [top, right, bottom, left, width, height, rotateDeg, origin]
    const lines = [
        // --- OUTER FRAME ---
        // Top edge
        { t: 0, l: 15, w: 30, h: 2 }, // Top-Left Horizontal
        { t: -1, l: 43, w: 9, h: 2, rot: 45, origin: 'bottom left' }, // Drop down
        { t: 5, l: 50, r: 50, h: 2 }, // Top-Center (depressed)
        { t: -1, r: 43, w: 9, h: 2, rot: -45, origin: 'bottom right' }, // Drop down right
        { t: 0, r: 15, w: 30, h: 2 }, // Top-Right Horizontal
        
        // Bottom edge
        { b: 0, l: 15, w: 30, h: 2 }, // Bottom-Left Horizontal
        { b: -1, l: 43, w: 9, h: 2, rot: -45, origin: 'top left' }, // Rise up
        { b: 5, l: 50, r: 50, h: 2 }, // Bottom-Center (raised)
        { b: -1, r: 43, w: 9, h: 2, rot: 45, origin: 'top right' }, // Rise up right
        { b: 0, r: 15, w: 30, h: 2 }, // Bottom-Right Horizontal

        // Side edges
        { t: 15, b: 15, l: 0, w: 2 }, // Left Vertical
        { t: 15, b: 15, r: 0, w: 2 }, // Right Vertical

        // Main Corner Cuts (15x15 = hypotenuse ~21.2)
        { t: 14, l: -1, w: 22.5, h: 2, rot: -45, origin: 'bottom left' }, // Top-Left Main Cut
        { t: 14, r: -1, w: 22.5, h: 2, rot: 45, origin: 'bottom right' }, // Top-Right Main Cut
        { b: 14, l: -1, w: 22.5, h: 2, rot: 45, origin: 'top left' }, // Bottom-Left Main Cut
        { b: 14, r: -1, w: 22.5, h: 2, rot: -45, origin: 'top right' }, // Bottom-Right Main Cut

        // --- INNER BORDER (Thin, faint) ---
        // Offset by 4px inwards
        { t: 4, l: 19, w: 25, h: 1, c: 'inner' },
        { t: 3, l: 42, w: 9, h: 1, rot: 45, origin: 'bottom left', c: 'inner' },
        { t: 9, l: 49, r: 49, h: 1, c: 'inner' },
        { t: 3, r: 42, w: 9, h: 1, rot: -45, origin: 'bottom right', c: 'inner' },
        { t: 4, r: 19, w: 25, h: 1, c: 'inner' },
        
        { b: 4, l: 19, w: 25, h: 1, c: 'inner' },
        { b: 3, l: 42, w: 9, h: 1, rot: -45, origin: 'top left', c: 'inner' },
        { b: 9, l: 49, r: 49, h: 1, c: 'inner' },
        { b: 3, r: 42, w: 9, h: 1, rot: 45, origin: 'top right', c: 'inner' },
        { b: 4, r: 19, w: 25, h: 1, c: 'inner' },

        { t: 19, b: 19, l: 4, w: 1, c: 'inner' },
        { t: 19, b: 19, r: 4, w: 1, c: 'inner' },

        // Inner Corners (11x11 = hypotenuse ~15.5)
        { t: 18, l: 3, w: 17, h: 1, rot: -45, origin: 'bottom left', c: 'inner' },
        { t: 18, r: 3, w: 17, h: 1, rot: 45, origin: 'bottom right', c: 'inner' },
        { b: 18, l: 3, w: 17, h: 1, rot: 45, origin: 'top left', c: 'inner' },
        { b: 18, r: 3, w: 17, h: 1, rot: -45, origin: 'top right', c: 'inner' },
        
        // --- TECH ACCENTS ---
        // Side glowing nodes
        { t: '20%', l: -2, w: 4, h: 12, c: 'accent' },
        { t: '50%', l: -2, w: 4, h: 25, c: 'accent' },
        { b: '30%', l: -2, w: 4, h: 8, c: 'accent' },
        
        { t: '30%', r: -2, w: 4, h: 18, c: 'accent' },
        { b: '40%', r: -2, w: 4, h: 12, c: 'accent' },
        { b: '15%', r: -2, w: 4, h: 6, c: 'accent' }
    ];

    lines.forEach(def => {
        const line = document.createElement('div');
        let className = 'geo-line';
        if (def.c === 'inner') className += ' geo-inner';
        if (def.c === 'accent') className += ' geo-accent';
        line.className = className;

        if (def.t !== undefined) line.style.top = typeof def.t === 'number' ? def.t + 'px' : def.t;
        if (def.b !== undefined) line.style.bottom = typeof def.b === 'number' ? def.b + 'px' : def.b;
        if (def.l !== undefined) line.style.left = typeof def.l === 'number' ? def.l + 'px' : def.l;
        if (def.r !== undefined) line.style.right = typeof def.r === 'number' ? def.r + 'px' : def.r;
        if (def.w !== undefined) line.style.width = typeof def.w === 'number' ? def.w + 'px' : def.w;
        if (def.h !== undefined) line.style.height = typeof def.h === 'number' ? def.h + 'px' : def.h;
        
        if (def.rot !== undefined) {
            line.style.transform = `rotate(${def.rot}deg)`;
        }
        if (def.origin !== undefined) {
            line.style.transformOrigin = def.origin;
        }
    });

    return frameContainer;
}

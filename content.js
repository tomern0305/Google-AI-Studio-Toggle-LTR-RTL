// Function to create the icon button
function createRtlButton() {
  const btn = document.createElement('button');
  btn.id = 'gas-rtl-btn';
  btn.className = 'gas-rtl-btn';
  
  // Create Custom Tooltip
  const tooltip = document.createElement('span');
  tooltip.className = 'gas-rtl-tooltip';
  tooltip.textContent = 'Right-to-left'; // Initial tooltip: prompts user they can switch to RTL
  btn.appendChild(tooltip);

  // SVG with two paths using standard Material Design "Format Textdirection" icons
  // ViewBox 0 0 24 24
  btn.innerHTML += `
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
      
      <!-- LTR Icon: Format Textdirection L to R (Material Design) -->
      <!-- Visible by default -->
      <g class="icon-ltr">
         <path d="M9,10v5h2V4h2v11h2V4h2V2H9C6.79,2,5,3.79,5,6s1.79,4,4,4Zm12,8l-4-4v3H5v2h12v3l4-4Z"/>
      </g>

      <!-- RTL Icon: Format Textdirection R to L (Material Design) -->
      <!-- Hidden by default -->
      <g class="icon-rtl">
         <path d="M10,10v5h2V4h2v11h2V4h2V2h-8C7.79,2,6,3.79,6,6s1.79,4,4,4Zm-2,7v-3l-4,4l4,4v-3h12v-2H8Z"/>
      </g>
    </svg>
  `;

  // Click Handler
  btn.addEventListener('click', (e) => {
    // Prevent default to avoid any form submissions or weird behavior
    e.preventDefault();
    e.stopPropagation();
    
    const isNowActive = document.body.classList.toggle('gas-rtl-active');
    
    // Update State
    if (isNowActive) {
      btn.classList.add('active');
      tooltip.textContent = 'Left-to-right'; // Now in RTL mode, action is to switch back to LTR
    } else {
      btn.classList.remove('active');
      tooltip.textContent = 'Right-to-left'; // Now in LTR mode, action is to switch to RTL
    }
  });

  return btn;
}

// Function to find the insertion point
function injectButtonIntoToolbar() {
  // If button already exists, verify it's still in the DOM
  const existingBtn = document.getElementById('gas-rtl-btn');
  if (existingBtn && document.body.contains(existingBtn)) return;

  // Strategy: Find a stable anchor in the top right toolbar.
  // The user wants it to the left of the icons.
  
  // 1. Try finding the "Share" button (usually has an aria-label or specific icon)
  // We look for buttons with aria-label containing "Share"
  let anchor = Array.from(document.querySelectorAll('button')).find(b => 
    b.getAttribute('aria-label')?.includes('Share')
  );

  // 2. If no Share button, look for "Run settings" or "Get code"
  if (!anchor) {
    const allElements = Array.from(document.querySelectorAll('button, span, div[role="button"]'));
    anchor = allElements.find(el => 
      el.textContent && (
        el.textContent.includes('Run settings') || 
        el.textContent.includes('Get code')
      )
    );
  }

  if (anchor) {
    // We found an anchor element. 
    // We need to find the flex container row that holds these buttons.
    let container = anchor.parentElement;
    let foundContainer = null;

    // Traverse up to find the horizontal toolbar container
    for (let i = 0; i < 4; i++) {
      if (!container) break;
      const style = window.getComputedStyle(container);
      if (style.display === 'flex' && style.flexDirection === 'row') {
        foundContainer = container;
        break;
      }
      container = container.parentElement;
    }

    if (foundContainer) {
      // Create and inject the button
      const btn = createRtlButton();
      
      // If we found the "Share" button explicitly, we want to insert BEFORE it (to its left).
      // If we found "Run settings", that's usually to the right, so detecting the start of the action group is tricky.
      // Best bet: Insert as the first child of this specific action group container, 
      // or if the container is the whole header, insert before the anchor's wrapper.
      
      // Often the buttons are wrapped in individual divs/slots. 
      // Let's try to insert specifically before the anchor's direct parent if the anchor is wrapped,
      // or before the anchor itself.
      
      // Check if anchor is direct child of container
      if (anchor.parentElement === foundContainer) {
        foundContainer.insertBefore(btn, anchor);
      } else {
        // Anchor is deep. Find the child of container that holds the anchor.
        let child = anchor;
        while (child && child.parentElement !== foundContainer) {
          child = child.parentElement;
        }
        if (child) {
          foundContainer.insertBefore(btn, child);
        } else {
          // Fallback: just append
          foundContainer.appendChild(btn);
        }
      }
      
      console.log('Gemini RTL: Button injected successfully.');
    }
  }
}

// Robust Observers
// 1. MutationObserver for DOM changes
const observer = new MutationObserver(() => {
  injectButtonIntoToolbar();
});

observer.observe(document.body, { childList: true, subtree: true });

// 2. Interval check (fallback for when MutationObserver misses silent React updates)
setInterval(injectButtonIntoToolbar, 2000);

// Initial run
injectButtonIntoToolbar();
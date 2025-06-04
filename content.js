// Middle Click Scroll Extension
class MiddleClickScroll {
  constructor() {
    this.isScrolling = false;
    this.isToggleMode = false; // Track if we're in toggle mode
    this.scrollSpeed = 3;
    this.startX = 0;
    this.startY = 0;
    this.scrollDirection = { x: 0, y: 0 };
    this.animationId = null;
    this.scrollIndicator = null;
    
    this.init();
  }
  
  init() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this), true);
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
    document.addEventListener('mouseup', this.handleMouseUp.bind(this), true);
    document.addEventListener('click', this.handleClick.bind(this), true); // Handle any click to exit toggle mode
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), true);
    
    // Create styles for scroll indicator
    this.createStyles();
  }
  
  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .middle-scroll-indicator {
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(0, 0, 0, 0.6);
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transform: translate(-50%, -50%);
        transition: opacity 0.2s ease;
      }
      
      .middle-scroll-indicator::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-left: 3px solid transparent;
        border-right: 3px solid transparent;
        transform: translate(-50%, -50%);
      }
      
      .middle-scroll-indicator.scroll-up::before {
        border-bottom: 4px solid white;
        margin-top: -1px;
      }
      
      .middle-scroll-indicator.scroll-down::before {
        border-top: 4px solid white;
        margin-top: 1px;
      }
      
      .middle-scroll-indicator.scroll-left::before {
        border-right: 4px solid white;
        border-top: 3px solid transparent;
        border-bottom: 3px solid transparent;
        border-left: none;
        margin-left: -1px;
      }
      
      .middle-scroll-indicator.scroll-right::before {
        border-left: 4px solid white;
        border-top: 3px solid transparent;
        border-bottom: 3px solid transparent;
        border-right: none;
        margin-left: 1px;
      }
    `;
    document.head.appendChild(style);
  }
  
  handleMouseDown(event) {
    // Check for middle mouse button (button 1)
    if (event.button === 1) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.isScrolling && this.isToggleMode) {
        // If already in toggle mode, stop scrolling
        this.stopScrolling();
      } else {
        // Start scrolling (will determine mode on mouse up)
        this.startScrolling(event);
      }
      return false;
    }
  }
  
  startScrolling(event) {
    this.isScrolling = true;
    this.clickStartTime = Date.now(); // Track when click started
    this.startX = event.clientX;
    this.startY = event.clientY;
    
    // Create scroll indicator
    this.showScrollIndicator(event.clientX, event.clientY);
    
    // Change cursor to indicate scroll mode
    document.body.style.cursor = 'all-scroll';
    
    // Prevent text selection while scrolling
    document.body.style.userSelect = 'none';
  }
  
  handleMouseMove(event) {
    if (!this.isScrolling) return;
    
    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;
    
    // Calculate scroll direction and speed based on mouse distance
    this.scrollDirection.x = deltaX * 0.1;
    this.scrollDirection.y = deltaY * 0.1;
    
    // Update indicator direction
    this.updateScrollIndicator();
    
    // Start smooth scrolling if not already started
    if (!this.animationId) {
      this.smoothScroll();
    }
  }
  
  handleMouseUp(event) {
    if (event.button === 1 && this.isScrolling && !this.isToggleMode) {
      // Only stop if we're not in toggle mode
      // If this was a quick click (less than 200ms), enter toggle mode
      const clickDuration = Date.now() - this.clickStartTime;
      if (clickDuration < 200) {
        this.isToggleMode = true;
        // Keep scrolling in toggle mode
      } else {
        // This was a long press, stop scrolling
        this.stopScrolling();
      }
    }
  }
  
  handleContextMenu(event) {
    // Prevent context menu when middle-clicking
    if (this.isScrolling) {
      event.preventDefault();
      return false;
    }
  }
  
  smoothScroll() {
    if (!this.isScrolling) {
      this.animationId = null;
      return;
    }
    
    // Apply scrolling
    window.scrollBy(this.scrollDirection.x, this.scrollDirection.y);
    
    // Continue animation
    this.animationId = requestAnimationFrame(() => this.smoothScroll());
  }
  
  stopScrolling() {
    this.isScrolling = false;
    this.isToggleMode = false;
    this.scrollDirection = { x: 0, y: 0 };
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Restore cursor and text selection
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    // Hide scroll indicator
    this.hideScrollIndicator();
  }
  
  handleClick(event) {
    // Exit toggle mode on any click (except middle click which is handled separately)
    if (this.isToggleMode && event.button !== 1) {
      event.preventDefault();
      event.stopPropagation();
      this.stopScrolling();
      return false;
    }
  }
  
  showScrollIndicator(x, y) {
    this.scrollIndicator = document.createElement('div');
    this.scrollIndicator.className = 'middle-scroll-indicator';
    this.scrollIndicator.style.left = x + 'px';
    this.scrollIndicator.style.top = y + 'px';
    document.body.appendChild(this.scrollIndicator);
  }
  
  updateScrollIndicator() {
    if (!this.scrollIndicator) return;
    
    // Remove previous direction classes
    this.scrollIndicator.classList.remove('scroll-up', 'scroll-down', 'scroll-left', 'scroll-right');
    
    // Determine primary scroll direction
    const absX = Math.abs(this.scrollDirection.x);
    const absY = Math.abs(this.scrollDirection.y);
    
    if (absY > absX) {
      // Vertical scrolling is dominant
      if (this.scrollDirection.y > 0) {
        this.scrollIndicator.classList.add('scroll-down');
      } else {
        this.scrollIndicator.classList.add('scroll-up');
      }
    } else if (absX > 0) {
      // Horizontal scrolling is dominant
      if (this.scrollDirection.x > 0) {
        this.scrollIndicator.classList.add('scroll-right');
      } else {
        this.scrollIndicator.classList.add('scroll-left');
      }
    }
  }
  
  hideScrollIndicator() {
    if (this.scrollIndicator) {
      this.scrollIndicator.remove();
      this.scrollIndicator = null;
    }
  }
}

// Initialize the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new MiddleClickScroll();
  });
} else {
  new MiddleClickScroll();
}
/**
 * SSAFYHome - Snow Effect
 * Interactive snow effect with mouse interaction
 */

class Snowflake {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height - this.canvas.height; // Start above
    this.size = Math.random() * 3 + 0.5;
    this.speed = Math.random() * 1 + 0.5;
    this.sway = Math.random() * 0.5;
    this.swayOffset = Math.random() * Math.PI * 2;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update(mouse) {
    // Gravity
    this.y += this.speed;

    // Sway motion
    this.x += Math.sin(this.y * 0.01 + this.swayOffset) * this.sway;

    // Mouse Interaction (Repel)
    if (mouse.x != null) {
      let dx = this.x - mouse.x;
      let dy = this.y - mouse.y;
      let distance = Math.sqrt(dx * dx + dy * dy);
      const interactionRadius = 150;

      if (distance < interactionRadius) {
        const forceDirectionX = dx / distance;
        const forceDirectionY = dy / distance;
        const force = (interactionRadius - distance) / interactionRadius;
        const strength = 2; // How strong the wind is

        this.x += forceDirectionX * force * strength;
        this.y += forceDirectionY * force * strength;
      }
    }

    // Reset loop
    if (this.y > this.canvas.height) {
      this.reset();
      this.y = -10; // Reset to top
    }
  }

  draw(ctx) {
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class SnowEffect {
  constructor(canvasId = 'snow-canvas', options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.error(`Canvas with id '${canvasId}' not found`);
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.snowflakes = [];
    this.mouse = { x: null, y: null };
    this.animationId = null;
    this.listeners = [];

    this.options = {
      count: options.count || 150,
      ...options
    };

    this.init();
  }

  /**
   * Initialize snow effect
   */
  init() {
    // Set up canvas size
    this.resizeCanvas();

    // Create event listeners
    const resizeHandler = () => this.resizeCanvas();
    const mousemoveHandler = (e) => this.handleMouseMove(e);

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('mousemove', mousemoveHandler);

    // Store listeners for cleanup
    this.listeners.push(
      { target: window, event: 'resize', handler: resizeHandler },
      { target: window, event: 'mousemove', handler: mousemoveHandler }
    );

    // Create snowflakes
    this.createSnowflakes();

    // Start animation
    this.start();
  }

  /**
   * Resize canvas to fill window
   */
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  /**
   * Handle mouse move event
   */
  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  /**
   * Create snowflakes
   */
  createSnowflakes() {
    this.snowflakes = [];
    for (let i = 0; i < this.options.count; i++) {
      this.snowflakes.push(new Snowflake(this.canvas));
    }
  }

  /**
   * Animation loop
   */
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.snowflakes.forEach((snowflake) => {
      snowflake.update(this.mouse);
      snowflake.draw(this.ctx);
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Start animation
   */
  start() {
    if (!this.animationId) {
      this.animate();
    }
  }

  /**
   * Stop animation
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Clean up and remove event listeners
   */
  destroy() {
    this.stop();

    // Remove all event listeners
    this.listeners.forEach(({ target, event, handler }) => {
      target.removeEventListener(event, handler);
    });

    this.listeners = [];
    this.snowflakes = [];
  }
}

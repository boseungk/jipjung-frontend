<template>
  <canvas ref="canvasRef" id="snow-canvas" aria-label="장식용 눈 효과"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let snowflakes = []
let animationId = null
let ctx = null
const mouse = { x: null, y: null }

class Snowflake {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height - this.canvas.height
    this.size = Math.random() * 3 + 0.5
    this.speed = Math.random() * 1 + 0.5
    this.sway = Math.random() * 0.5
    this.swayOffset = Math.random() * Math.PI * 2
    this.opacity = Math.random() * 0.5 + 0.1
  }

  update(mousePos) {
    this.y += this.speed
    this.x += Math.sin(this.y * 0.01 + this.swayOffset) * this.sway

    // Mouse interaction
    if (mousePos.x != null) {
      let dx = this.x - mousePos.x
      let dy = this.y - mousePos.y
      let distance = Math.sqrt(dx * dx + dy * dy)
      const interactionRadius = 150

      if (distance < interactionRadius) {
        const forceDirectionX = dx / distance
        const forceDirectionY = dy / distance
        const force = (interactionRadius - distance) / interactionRadius
        const strength = 2

        this.x += forceDirectionX * force * strength
        this.y += forceDirectionY * force * strength
      }
    }

    if (this.y > this.canvas.height) {
      this.reset()
      this.y = -10
    }
  }

  draw(context) {
    context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
    context.beginPath()
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    context.fill()
  }
}

const resizeCanvas = () => {
  if (canvasRef.value) {
    canvasRef.value.width = window.innerWidth
    canvasRef.value.height = window.innerHeight
  }
}

const handleMouseMove = (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

const createSnowflakes = () => {
  snowflakes = []
  for (let i = 0; i < 150; i++) {
    snowflakes.push(new Snowflake(canvasRef.value))
  }
}

const animate = () => {
  if (!ctx || !canvasRef.value) return
  
  ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  snowflakes.forEach((snowflake) => {
    snowflake.update(mouse)
    snowflake.draw(ctx)
  })
  
  animationId = requestAnimationFrame(animate)
}

onMounted(() => {
  if (canvasRef.value) {
    ctx = canvasRef.value.getContext('2d')
    resizeCanvas()
    createSnowflakes()
    animate()
    
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resizeCanvas)
  window.removeEventListener('mousemove', handleMouseMove)
})
</script>

<style scoped>
#snow-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}
</style>

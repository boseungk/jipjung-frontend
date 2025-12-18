<template>
  <div class="aurora-bg" aria-hidden="true">
    <div class="aurora-blob aurora-1"></div>
    <div class="aurora-blob aurora-2"></div>
    <div class="aurora-blob aurora-3"></div>
  </div>
</template>

<style scoped>
.aurora-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.aurora-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: aurora-float 20s ease-in-out infinite;
}

.aurora-1 {
  width: 500px;
  height: 500px;
  background: var(--aurora-orange);
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.aurora-2 {
  width: 400px;
  height: 400px;
  background: var(--aurora-teal);
  bottom: 20%;
  left: -100px;
  animation-delay: -7s;
}

.aurora-3 {
  width: 350px;
  height: 350px;
  background: var(--aurora-yellow);
  top: 40%;
  right: 10%;
  animation-delay: -14s;
}

@keyframes aurora-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 30px) scale(0.95);
  }
  75% {
    transform: translate(-30px, -10px) scale(1.02);
  }
}

@media (max-width: 480px) {
  .aurora-blob {
    filter: blur(60px);
    opacity: 0.4;
  }

  .aurora-1 {
    width: 300px;
    height: 300px;
  }

  .aurora-2 {
    width: 250px;
    height: 250px;
  }

  .aurora-3 {
    width: 200px;
    height: 200px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .aurora-blob {
    animation: none;
  }
}
</style>


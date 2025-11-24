import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Composable for tracking mouse position
 * Used for lighting effects and interactive elements
 */
export function useMousePosition() {
    const x = ref(0)
    const y = ref(0)
    const xPercent = ref(50)
    const yPercent = ref(50)

    const updatePosition = (event) => {
        x.value = event.clientX
        y.value = event.clientY
        xPercent.value = (event.clientX / window.innerWidth) * 100
        yPercent.value = (event.clientY / window.innerHeight) * 100

        // Update CSS variables for lighting effects
        document.body.style.setProperty('--mouse-x', `${xPercent.value}%`)
        document.body.style.setProperty('--mouse-y', `${yPercent.value}%`)
    }

    onMounted(() => {
        // Initialize center position
        document.body.style.setProperty('--mouse-x', '50%')
        document.body.style.setProperty('--mouse-y', '50%')

        window.addEventListener('mousemove', updatePosition)
    })

    onUnmounted(() => {
        window.removeEventListener('mousemove', updatePosition)
    })

    return {
        x,
        y,
        xPercent,
        yPercent,
    }
}

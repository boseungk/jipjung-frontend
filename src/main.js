import { createApp } from 'vue'
import './assets/css/input.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import VueApexCharts from 'vue3-apexcharts'

// Phosphor Icons 전역 등록
import {
  PhHouse, PhChartBar, PhBuildings, PhMagicWand,
  PhPalette, PhUser, PhDoorOpen, PhGear,
  PhCheck, PhX, PhCaretDown,
  PhPencilLine, PhPencilSimple,
  PhPiggyBank, PhFloppyDisk, PhStar, PhFire,
  PhBank, PhCalculator, PhChartLine, PhLightbulb,
  PhCheckCircle, PhXCircle, PhTrophy, PhCalendarBlank,
  PhTrendUp, PhConfetti, PhSealCheck, PhPaperPlaneRight,
  PhLockSimple, PhInfo, PhWarning, PhWarningCircle,
  PhArrowLeft, PhSpinnerGap, PhQuestion
} from '@phosphor-icons/vue'

// AppIcon Wrapper
import AppIcon from './components/common/AppIcon.vue'

const app = createApp(App)
const pinia = createPinia()

// Phosphor Icons 전역 등록
const icons = {
  PhHouse, PhChartBar, PhBuildings, PhMagicWand,
  PhPalette, PhUser, PhDoorOpen, PhGear,
  PhCheck, PhX, PhCaretDown,
  PhPencilLine, PhPencilSimple,
  PhPiggyBank, PhFloppyDisk, PhStar, PhFire,
  PhBank, PhCalculator, PhChartLine, PhLightbulb,
  PhCheckCircle, PhXCircle, PhTrophy, PhCalendarBlank,
  PhTrendUp, PhConfetti, PhSealCheck, PhPaperPlaneRight,
  PhLockSimple, PhInfo, PhWarning, PhWarningCircle,
  PhArrowLeft, PhSpinnerGap, PhQuestion
}

Object.entries(icons).forEach(([name, component]) => {
  app.component(name, component)
})

// AppIcon Wrapper 전역 등록
app.component('AppIcon', AppIcon)

app.use(pinia)
app.use(router)
app.use(VueApexCharts)
app.mount('#app')

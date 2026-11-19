import { ref } from 'vue'

/** Shared open state for the global ⌘K search, so any button can open it. */
const open = ref(false)

export function useCommandMenu() {
  return {
    open,
    show: () => {
      open.value = true
    },
    hide: () => {
      open.value = false
    },
  }
}

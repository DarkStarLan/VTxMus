<template>
  <svg
    :class="['svg-icon', customClass]"
    :style="{ width: size, height: size, fill: color }"
    aria-hidden="true"
  >
    <use :xlink:href="`#icon-${name}`"></use>
  </svg>
</template>

<script setup lang="ts">
interface Props {
  name: string
  size?: string
  color?: string
  customClass?: string
}

withDefaults(defineProps<Props>(), {
  size: '1em',
  color: 'currentColor',
  customClass: ''
})
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: middle;
  fill: currentColor;
  overflow: hidden;
}
</style>


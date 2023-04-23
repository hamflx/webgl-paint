<script setup>
import { toRefs, defineProps } from 'vue'
import { getColorPlateColors } from '../webgl/common/colors'

const props = defineProps({
  modelValue: String
})
const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)

const colorList = getColorPlateColors()

const setActiveColor = color => {
  emit('update:modelValue', color)
}
</script>

<template>
  <div class="color-plate">
    <template v-for="color of colorList">
      <div class="color-plate__item" :class="{ isActive: modelValue === color }" :style="{ backgroundColor: color }" @click="setActiveColor(color)"></div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.color-plate {
  display: flex;
  place-items: center;

  &__item {
    width: 24px;
    flex: 0 0 24px;
    height: 24px;
    cursor: pointer;

    &.isActive {
      z-index: 1;
      outline: 2px solid rgb(255, 0, 128);
    }
  }
}
</style>

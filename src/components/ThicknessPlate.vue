<script setup>
import { toRefs, defineProps } from 'vue'
import { getThicknessList } from '../webgl/common/thickness';

const props = defineProps({
  modelValue: Number
})
const emit = defineEmits(['update:modelValue'])
const { modelValue } = toRefs(props)

const thicknessList = getThicknessList()

const setActiveThickness = thickness => {
  emit('update:modelValue', thickness.width)
}
</script>

<template>
  <div class="thickness-plate">
    <template v-for="thickness of thicknessList">
      <div class="thickness-plate__item" :class="['thickness-' + thickness.width, { isActive: modelValue === thickness.width }]" @click="setActiveThickness(thickness)">
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.thickness-plate {
  display: flex;
  place-items: center;

  &__item {
    display: flex;
    align-items: center;
    width: 24px;
    flex: 0 0 24px;
    height: 24px;
    cursor: pointer;

    &:not(:first-child) {
      margin-left: 4px;
    }

    &::before {
      content: ' ';
      flex: 1;
      background-color: rgb(255, 0, 128);
    }

    &.thickness-1::before {
      height: 1px;
    }
    &.thickness-2::before {
      height: 2px;
    }
    &.thickness-3::before {
      height: 3px;
    }
    &.thickness-5::before {
      height: 5px;
    }

    &:hover {
      outline: 2px solid rgb(238, 238, 238);
      z-index: 2;
    }

    &.isActive {
      z-index: 1;
      outline: 2px solid rgb(255, 0, 128);
    }
  }
}
</style>

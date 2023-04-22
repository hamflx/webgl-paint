<script setup>
import ColorPlate from './components/ColorPlate.vue'
import { onMounted, onUnmounted, ref, watchEffect } from 'vue'
import { createPaint, createPaintTools } from './paint'
import { getColorPlateColors } from './webgl/common/colors';

const canvasContainer = ref(null)
const currentPaintMode = ref(null)
const paintTools = createPaintTools()

let paint = ref(null)

const foregroundColor = ref(getColorPlateColors()[0])
watchEffect(() => paint.value && paint.value.setForegroundColor(foregroundColor.value))
const backgroundColor = ref(getColorPlateColors().slice(-1)[0])
watchEffect(() => paint.value && paint.value.setBackgroundColor(backgroundColor.value))

const setPaintMode = mode => {
  if (paint.value) {
    paint.value.setPaintMode(mode)
  }
  currentPaintMode.value = paint.value.getPaintMode()
}

onMounted(() => {
  paint.value = createPaint(canvasContainer.value)
  currentPaintMode.value = paint.value.getPaintMode()
})

onUnmounted(() => {
  paint.value.destroy()
})
</script>

<template>
  <div class="paint">
    <div class="paint__toolbar">
      <div class="paint__toolbar__block">
        <template v-for="tool of paintTools">
          <button class="paint__toolbar__btn" :class="{ isActive: tool.mode === currentPaintMode }" @click="setPaintMode(tool.mode)">{{ tool.name }}</button>
        </template>
      </div>

      <div class="paint__toolbar__block">
        前景色：<ColorPlate v-model="foregroundColor"></ColorPlate>
      </div>

      <div class="paint__toolbar__block">
        背景色：<ColorPlate v-model="backgroundColor"></ColorPlate>
      </div>
    </div>
    <div ref="canvasContainer" class="paint__content"></div>
  </div>
</template>

<style lang="scss" scoped>
.paint {
  box-sizing: border-box;
  height: 100vh;
  display: flex;
  flex-direction: column;

  &__toolbar {
    display: flex;
    align-items: center;
    padding: 18px 24px;
    background-color: #dedede;

    &__block {
      display: flex;
      align-items: center;
      &:not(:first-child) {
        margin-left: 24px;
      }
    }

    &__btn {
      padding: 4px 12px;
      border: none;
      border-radius: 4px;
      background-color: rgb(241, 236, 238);
      cursor: pointer;

      &:hover {
        background-color: #fff;
      }

      &:not(:first-child) {
        margin-left: 4px;
      }

      &.isActive {
        border: none;
        background-color: rgb(255, 0, 128);
        color: #fff;

        &:hover {
          background-color: rgb(255, 56, 156);
        }
      }

      &.isActive:active,
      &:active {
        background-color: rgb(240, 0, 120);
        color: #fff;
      }
    }
  }

  &__content {
    flex: 1;
  }
}
</style>

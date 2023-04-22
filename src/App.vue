<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { createPaint, createPaintTools } from './paint'

const canvasContainer = ref(null)
const currentPaintMode = ref(null)
const paintTools = createPaintTools()

let paint = null

const setPaintMode = mode => {
  if (paint) {
    paint.setPaintMode(mode)
  }
  currentPaintMode.value = paint.getPaintMode()
}

onMounted(() => {
  paint = createPaint(canvasContainer.value)
})

onUnmounted(() => {
  paint.destroy()
})
</script>

<template>
  <div class="paint">
    <div class="paint__toolbar">
      <template v-for="tool of paintTools">
        <button class="paint__toolbar__btn" :class="{ isActive: tool.mode === currentPaintMode }" @click="setPaintMode(tool.mode)">{{ tool.name }}</button>
      </template>
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
    padding: 18px 24px;
    background-color: #dedede;

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

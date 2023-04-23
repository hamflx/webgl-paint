<script setup>
import ColorPlate from './components/ColorPlate.vue'
import ThicknessPlate from './components/ThicknessPlate.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import { createPaint, createPaintTools } from './paint'
import { createPaintReactiveState } from './reactive'

const canvasContainer = ref(null)
const paintTools = createPaintTools()

let paint = ref(null)
const { paintState, setPaintInstance } = createPaintReactiveState()

onMounted(() => {
  paint.value = createPaint(canvasContainer.value)
  setPaintInstance(paint.value)
})

onUnmounted(() => {
  paint.value.destroy()
})
</script>

<template>
  <div class="paint">
    <div class="paint__heading">
      <div class="paint__heading__row">
        <span class="paint__heading__title">WebGL 画图</span>
        <span class="paint__heading__meta">仓库地址：<a href="https://github.com/hamflx/webgl-paint">https://github.com/hamflx/webgl-paint</a></span>
      </div>

      <div class="paint__toolbar paint__heading__row">
        <div class="paint__toolbar__block">
          <template v-for="tool of paintTools">
            <button class="paint__toolbar__btn" :class="{ isActive: tool.mode === paintState.paintMode }" @click="paintState.paintMode = tool.mode">{{ tool.name }}</button>
          </template>
        </div>

        <div class="paint__toolbar__block">
          线宽：<ThicknessPlate v-model="paintState.thickness"/>
        </div>

        <div class="paint__toolbar__block">
          前景色：<ColorPlate v-model="paintState.foregroundColor"></ColorPlate>
        </div>

        <div class="paint__toolbar__block">
          背景色：<ColorPlate v-model="paintState.backgroundColor"></ColorPlate>
        </div>

        <div class="paint__toolbar__block">
          <button class="paint__toolbar__btn" @click="paint.undo()">撤销（Ctrl-Z）</button>
          <button class="paint__toolbar__btn" @click="paint.redo()">重做（Ctrl-Y）</button>
        </div>
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

  &__heading {
    background-color: #dedede;

    &__row {
      margin: 12px 24px;
    }

    &__title {
      font-size: 18px;
      font-weight: bold;
    }

    &__meta {
      margin-left: 12px;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;

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

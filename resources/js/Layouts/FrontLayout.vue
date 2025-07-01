<script setup lang="ts">
import ILoveQV from '@/Components/ILoveQV.vue';

const props = defineProps({
  hideFooter: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <div class="front-layout">
    <slot></slot>

    <div class="footer" v-if="!hideFooter">
      <ILoveQV />
    </div>
  </div>
</template>

<style scoped>
.footer {


  font-size: 0.9em;
  margin-top: 6rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;


}
</style>

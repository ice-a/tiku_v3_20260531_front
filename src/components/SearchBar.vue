<template>
  <div class="search-bar">
    <a-input-search
      v-model:value="searchValue"
      :placeholder="placeholder"
      :size="size"
      enter-button
      @search="handleSearch"
      @pressEnter="handleEnter"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索关键词'
  },
  value: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'middle'
  }
});

const emit = defineEmits(['search', 'update:value']);

const searchValue = ref(props.value);

watch(() => props.value, (val) => {
  searchValue.value = val;
});

const handleSearch = (value) => {
  emit('search', value);
};

const handleEnter = () => {
  emit('search', searchValue.value);
};
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 600px;
}
</style>

<template>
  <div class="tag-list">
    <a-tag
      v-for="tag in tags"
      :key="tag"
      :color="isSelected(tag) ? 'blue' : 'default'"
      class="tag-item"
      @click="handleClick(tag)"
    >
      {{ tag }}
    </a-tag>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  selectedTags: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['select']);

const isSelected = (tag) => {
  return props.selectedTags.includes(tag);
};

const handleClick = (tag) => {
  const newSelected = [...props.selectedTags];
  const index = newSelected.indexOf(tag);

  if (index > -1) {
    newSelected.splice(index, 1);
  } else {
    newSelected.push(tag);
  }

  emit('select', newSelected);
};
</script>

<style scoped>
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.3s;
}

.tag-item:hover {
  opacity: 0.8;
}
</style>

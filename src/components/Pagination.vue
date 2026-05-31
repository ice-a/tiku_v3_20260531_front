<template>
  <div class="pagination-wrapper">
    <a-pagination
      v-model:current="currentPage"
      v-model:pageSize="currentPageSize"
      :total="total"
      :show-total="showTotal"
      :show-size-changer="showSizeChanger"
      :show-quick-jumper="showQuickJumper"
      :page-size-options="pageSizeOptions"
      @change="handleChange"
      @showSizeChange="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  total: {
    type: Number,
    default: 0
  },
  current: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showQuickJumper: {
    type: Boolean,
    default: true
  },
  pageSizeOptions: {
    type: Array,
    default: () => ['10', '20', '50', '100']
  }
});

const emit = defineEmits(['change', 'update:current', 'update:pageSize']);

const currentPage = ref(props.current);
const currentPageSize = ref(props.pageSize);

watch(() => props.current, (val) => {
  currentPage.value = val;
});

watch(() => props.pageSize, (val) => {
  currentPageSize.value = val;
});

const showTotal = (total) => `共 ${total} 条`;

const handleChange = (page, pageSize) => {
  emit('update:current', page);
  emit('update:pageSize', pageSize);
  emit('change', { current: page, pageSize });
};

const handleSizeChange = (current, size) => {
  emit('update:current', 1);
  emit('update:pageSize', size);
  emit('change', { current: 1, pageSize: size });
};
</script>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>

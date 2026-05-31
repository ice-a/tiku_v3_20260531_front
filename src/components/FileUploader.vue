<template>
  <div class="file-uploader">
    <a-upload-dragger
      v-model:file-list="fileList"
      name="file"
      :action="action"
      :accept="accept"
      :before-upload="beforeUpload"
      :custom-request="handleUpload"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p class="ant-upload-text">点击或拖拽文件到此区域上传</p>
      <p class="ant-upload-hint">
        支持 {{ acceptText }}，单个文件不超过 {{ maxSizeMB }}MB
      </p>
    </a-upload-dragger>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { InboxOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const props = defineProps({
  accept: {
    type: String,
    default: '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.csv'
  },
  maxSize: {
    type: Number,
    default: 10
  },
  action: {
    type: String,
    default: '/api/upload'
  }
});

const emit = defineEmits(['upload', 'change']);

const fileList = ref([]);

const maxSizeMB = computed(() => props.maxSize);

const acceptText = computed(() => {
  const map = {
    '.jpg,.jpeg,.png,.gif': 'JPG/PNG/GIF 图片',
    '.pdf': 'PDF 文件',
    '.doc,.docx': 'Word 文档',
    '.xls,.xlsx,.csv': 'Excel/CSV 文件'
  };

  for (const [key, value] of Object.entries(map)) {
    if (props.accept.includes(key.split(',')[0])) {
      return value;
    }
  }
  return props.accept;
});

const beforeUpload = (file) => {
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > props.maxSize) {
    message.error(`文件大小不能超过 ${props.maxSize}MB`);
    return false;
  }
  return true;
};

const handleUpload = async ({ file, onSuccess, onError }) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    emit('upload', { file, formData });
    onSuccess({ status: 'success' });
  } catch (error) {
    onError(error);
    message.error('上传失败');
  }
};

const handleChange = (info) => {
  emit('change', info);
};
</script>

<style scoped>
.file-uploader {
  width: 100%;
}
</style>

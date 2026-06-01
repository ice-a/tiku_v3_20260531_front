<template>
  <div class="tools-image">
    <a-card title="图片处理">
      <template #extra>
        <a-button size="small" @click="goBack">← 返回工具</a-button>
      </template>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="convert" tab="格式转换">
          <a-upload-dragger
            name="file"
            :before-upload="beforeUploadConvert"
            :show-upload-list="false"
            accept="image/*"
          >
            <p v-if="!convertFile" style="padding: 32px 0">
              点击或拖拽图片到此区域
            </p>
            <p v-else style="padding: 16px 0">
              已选择: {{ convertFile.name }}
            </p>
          </a-upload-dragger>

          <a-form layout="inline" style="margin-top: 16px">
            <a-form-item label="目标格式">
              <a-select v-model:value="convertFormat" style="width: 160px">
                <a-select-option value="png">PNG</a-select-option>
                <a-select-option value="jpeg">JPEG</a-select-option>
                <a-select-option value="webp">WebP</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleConvert" :loading="convertLoading">
                开始转换
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="convertResultUrl" style="margin-top: 16px">
            <img :src="convertResultUrl" style="max-width: 100%; border-radius: 8px" />
            <a-button type="link" @click="downloadResult(convertResultUrl, `converted.${convertFormat}`)">
              下载图片
            </a-button>
          </div>
        </a-tab-pane>

        <a-tab-pane key="ico" tab="转 ICO">
          <a-upload-dragger
            name="file"
            :before-upload="beforeUploadIco"
            :show-upload-list="false"
            accept="image/*"
          >
            <p v-if="!icoFile" style="padding: 32px 0">
              点击或拖拽图片到此区域
            </p>
            <p v-else style="padding: 16px 0">
              已选择: {{ icoFile.name }}
            </p>
          </a-upload-dragger>

          <a-form layout="inline" style="margin-top: 16px">
            <a-form-item label="ICO 尺寸">
              <a-select v-model:value="icoSize" style="width: 160px">
                <a-select-option :value="16">16x16</a-select-option>
                <a-select-option :value="32">32x32</a-select-option>
                <a-select-option :value="48">48x48</a-select-option>
                <a-select-option :value="64">64x64</a-select-option>
                <a-select-option :value="128">128x128</a-select-option>
                <a-select-option :value="256">256x256</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleToIco" :loading="icoLoading">
                生成 ICO
              </a-button>
            </a-form-item>
          </a-form>

          <div v-if="icoResultUrl" style="margin-top: 16px">
            <p>ICO 文件已生成</p>
            <a-button type="link" @click="downloadResult(icoResultUrl, `icon-${icoSize}.ico`)">
              下载 ICO 文件
            </a-button>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { apiFetch } from '../utils/api.js';

const activeTab = ref('convert');

const convertFile = ref(null);
const convertFormat = ref('png');
const convertLoading = ref(false);
const convertResultUrl = ref('');

const icoFile = ref(null);
const icoSize = ref(256);
const icoLoading = ref(false);
const icoResultUrl = ref('');

function beforeUploadConvert(file) {
  convertFile.value = file;
  return false;
}

function beforeUploadIco(file) {
  icoFile.value = file;
  return false;
}

async function handleConvert() {
  if (!convertFile.value) return message.warning('请先选择图片');
  convertLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', convertFile.value);
    formData.append('format', convertFormat.value);
    const res = await apiFetch('/api/tools/image/convert', {
      method: 'POST',
      body: formData,
    });
    // apiFetch 返回的是 JSON，但这里需要 blob
    // 需要直接使用 fetch 来获取 blob
    const token = localStorage.getItem('token') || '';
    const fetchRes = await fetch('/api/tools/image/convert', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!fetchRes.ok) {
      const data = await fetchRes.json().catch(() => ({}));
      message.error(data.error || '转换失败');
      return;
    }
    const blob = await fetchRes.blob();
    if (convertResultUrl.value) URL.revokeObjectURL(convertResultUrl.value);
    convertResultUrl.value = URL.createObjectURL(blob);
    message.success('转换成功');
  } catch (err) {
    message.error(err.message || '转换失败');
  } finally {
    convertLoading.value = false;
  }
}

async function handleToIco() {
  if (!icoFile.value) return message.warning('请先选择图片');
  icoLoading.value = true;
  try {
    const formData = new FormData();
    formData.append('image', icoFile.value);
    formData.append('size', String(icoSize.value));
    // 需要直接使用 fetch 来获取 blob
    const token = localStorage.getItem('token') || '';
    const fetchRes = await fetch('/api/tools/image/to-ico', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!fetchRes.ok) {
      const data = await fetchRes.json().catch(() => ({}));
      message.error(data.error || '生成失败');
      return;
    }
    const blob = await fetchRes.blob();
    if (icoResultUrl.value) URL.revokeObjectURL(icoResultUrl.value);
    icoResultUrl.value = URL.createObjectURL(blob);
    message.success('ICO 生成成功');
  } catch (err) {
    message.error(err.message || '生成失败');
  } finally {
    icoLoading.value = false;
  }
}

function downloadResult(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}
</script>

<style scoped>
.tools-image {
  width: 100%;
}
</style>

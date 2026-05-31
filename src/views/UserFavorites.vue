<template>
  <div class="user-favorites">
    <a-card title="我的收藏">
      <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
        <a-tab-pane key="question" tab="题目" />
        <a-tab-pane key="navigation" tab="导航" />
        <a-tab-pane key="affiliate" tab="AFF" />
      </a-tabs>
      <a-list :loading="loading" :data-source="favorites">
        <template #renderItem="{ item }">
          <a-list-item class="favorite-item">
            <a-list-item-meta :description="item.url || item.category">
              <template #title>
                <router-link
                  v-if="activeTab === 'question'"
                  :to="`/tiku/${item.itemId || item._id}`"
                  class="favorite-title-link"
                >
                  {{ item.name || item.text }}
                </router-link>
                <a
                  v-else-if="item.url"
                  :href="item.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="favorite-title-link"
                >
                  {{ item.name || item.text }}
                </a>
                <span v-else class="favorite-title-text">{{ item.name || item.text }}</span>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a @click.stop="handleRemove(item)">取消收藏</a>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const activeTab = ref('question');
const favorites = ref([]);
const loading = ref(false);

async function fetchFavorites() {
  loading.value = true;
  try {
    const res = await fetch(`/api/users/favorites?itemType=${activeTab.value}`);
    const data = await res.json();
    if (data.success) {
      favorites.value = data.data?.favorites || [];
    }
  } catch {
    message.error('获取收藏列表失败');
  } finally {
    loading.value = false;
  }
}

function handleTabChange() {
  fetchFavorites();
}

async function handleRemove(item) {
  try {
    const res = await fetch(`/api/users/favorites/${activeTab.value}/${item.itemId || item._id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (data.success) {
      message.success('已取消收藏');
      fetchFavorites();
    } else {
      message.error(data.error || '取消收藏失败');
    }
  } catch {
    message.error('取消收藏失败');
  }
}

onMounted(() => {
  fetchFavorites();
});
</script>

<style scoped>
.user-favorites {
  max-width: 800px;
  margin: 0 auto;
}

.favorite-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.favorite-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.favorite-title-link {
  color: rgba(0, 0, 0, 0.88);
  text-decoration: none;
  transition: color 0.2s ease;
}

.favorite-title-link:hover {
  color: #1677ff;
}

.favorite-title-text {
  color: rgba(0, 0, 0, 0.88);
}
</style>

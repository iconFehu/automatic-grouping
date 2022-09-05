<script setup lang="ts" name="Home">
  import { CSSProperties, onMounted, reactive, ref, shallowReactive, toRaw, watch } from 'vue';
  import { Card, Space } from 'ant-design-vue/es';
  const ACard = Card;
  const ASpace = Space;

  type stateModel = {
    auto: boolean;
    createGroup: boolean;
    map: Record<string, number[]>;
  };
  const state = shallowReactive<stateModel>({
    auto: localStorage.getItem('state.auto') === 'true',
    createGroup: localStorage.getItem('state.createGroup') === 'true',
    map: {},
  });
  const handleChange = async () => {
    localStorage.setItem('state.auto', state.auto.toString());
    localStorage.setItem('state.createGroup', state.createGroup.toString());
    state.map = {};
    const tabs = await chrome.tabs.query({});
    tabs.forEach((tab) => {
      let url = new URL(tab.url ?? '');
      // console.log(url);
      let hostname = url.hostname;
      let domain = /[a-zA-Z0-9]+.(com|org|net)?.(\w{1,9})$/.exec(hostname)?.[0];
      domain ??= url.host;
      if (domain) {
        state.map[domain] ??= [];
        tab.id && state.map[domain].push(tab.id);
      } else {
        console.log(domain);
        console.log('url', url);
      }
    });
    // console.log('state.map', state.map);
    for (const [key, tabIds] of Object.entries(state.map)) {
      // console.log(key, tabIds);
      if (state.auto) {
        if (tabIds.length > 3) {
          console.log('key, toRaw(tabIds)', key, tabIds);
          const group = await chrome.tabs.group({ tabIds });
          console.log('group', group);
          if (state.createGroup) {
            const title = key.split('.')?.[0];
            await chrome.tabGroups.update(group, { title });
          } else {
            await chrome.tabs.ungroup(tabIds);
          }
        }
      } else {
        console.log('tabIds', tabIds);
        await chrome.tabs.ungroup(tabIds);
      }
    }
  };
  const handleMouseMove = (mouseEvent: MouseEvent) => {
    // console.log(mouseEvent.clientX);
    // console.log(mouseEvent.clientY);
    cardStyle.backgroundPositionX = `${50 - mouseEvent.clientX / 10}%`;
    cardStyle.backgroundPositionY = `${10 - mouseEvent.clientY / 30}%`;
  };
  const cardStyle = reactive<CSSProperties>({
    backgroundPositionX: 'center',
    backgroundPositionY: '10%',
  });
  onMounted(() => {
    handleChange();
  });
</script>

<template>
  <ACard class="bg" :style="cardStyle" @mousemove="handleMouseMove">
    <template #title> 配置 </template>
    <ASpace
      style="background-color: rgba(255, 255, 255, 0.5); padding: 10px; border-radius: 5px"
      direction="vertical"
    >
      <div>
        自动整理标签
        <ASwitch
          v-model:checked="state.auto"
          @change="handleChange"
          checked-children="开"
          un-checked-children="关"
        />
      </div>
      <div>
        创建组名称
        <ASwitch
          v-model:checked="state.createGroup"
          @change="handleChange"
          checked-children="开"
          un-checked-children="关"
        />
      </div>
    </ASpace>
  </ACard>
</template>

<style scoped>
  .bg {
    background: url('/img.png') no-repeat;
    background-size: 120%;
    width: 500px;
    height: 500px;
    transition: all 1s;
  }
</style>

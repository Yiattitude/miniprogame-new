<template>
  <view class="upload-field">
    <view v-if="files.length > 0" class="upload-grid">
      <view v-for="(item, index) in files" :key="item.url || index" class="upload-card">
        <image class="upload-image" :src="item.url" mode="aspectFill" @click="previewFile(index)" />
        <view class="upload-delete" @click.stop="removeFile(index)">
          <u-icon name="close" color="#ffffff" size="12" />
        </view>
      </view>
    </view>

    <view class="upload-actions">
      <u-button
        type="primary"
        plain
        text="从相册选择"
        :disabled="isMaxReached"
        @click="handleChoose('album')"
      />
      <u-button
        type="primary"
        plain
        text="拍照上传"
        :disabled="isMaxReached"
        @click="handleChoose('camera')"
      />
    </view>

    <text class="upload-status">
      已上传 {{ files.length }}/{{ maxCount }} 张，相册权限：{{ albumPermissionLabel }}，相机权限：{{ cameraPermissionLabel }}
    </text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/store'
import { showErrorToast } from '@/utils/feedback'
import { chooseEvidenceImages, getPermissionStatusLabel } from '@/utils/upload'

/** 佐证材料上传组件，统一处理权限说明、图片选择、预览与删除。 */

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  maxCount: {
    type: Number,
    default: 9
  },
  maxSize: {
    type: Number,
    default: 10240
  }
})

const emit = defineEmits(['update:modelValue'])
const userStore = useUserStore()
const files = computed(() => props.modelValue || [])
const isMaxReached = computed(() => files.value.length >= props.maxCount)
const albumPermissionLabel = computed(() => getPermissionStatusLabel(userStore.albumPermission))
const cameraPermissionLabel = computed(() => getPermissionStatusLabel(userStore.cameraPermission))

/** 用户主动点击上传后，再申请相册或相机能力。 */
const handleChoose = async (sourceType) => {
  if (isMaxReached.value) {
    showErrorToast('已达到上传数量上限')
    return
  }

  const result = await chooseEvidenceImages({
    sourceType,
    count: props.maxCount - files.value.length,
    maxSize: props.maxSize
  })

  if (result.status === 'granted') {
    userStore.setPermissionStatus(sourceType, 'granted')
  }

  if (result.status === 'denied') {
    userStore.setPermissionStatus(sourceType, 'denied')
  }

  if (result.status === 'failed') {
    userStore.setPermissionStatus(sourceType, 'failed')
  }

  if (!result.files.length) {
    return
  }

  emit('update:modelValue', [...files.value, ...result.files])
}

/** 删除某张已选择的佐证材料。 */
const removeFile = (index) => {
  emit(
    'update:modelValue',
    files.value.filter((_, fileIndex) => fileIndex !== index)
  )
}

/** 预览已上传的图片，方便用户核对提交材料。 */
const previewFile = (index) => {
  uni.previewImage({
    current: files.value[index]?.url,
    urls: files.value.map((item) => item.url)
  })
}
</script>

<style scoped>
.upload-field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.upload-card {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  background: #f3f4f6;
  aspect-ratio: 1;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-delete {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-status {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
}
</style>

<template>
  <view class="upload-field">
    <!-- 已上传的文件列表 -->
    <view v-if="files.length > 0" class="upload-grid">
      <view v-for="(item, index) in files" :key="item.url || index" class="upload-card">
        <!-- 图片预览 -->
        <image v-if="item.type === 'image'" class="upload-image" :src="item.url" mode="aspectFill" @click="previewFile(index)" />
        <!-- 文件预览 -->
        <view v-else class="upload-file">
          <uni-icons type="folder" size="40" color="#0076FF" />
          <text class="upload-file-name">{{ item.name }}</text>
          <text class="upload-file-size">{{ formatFileSize(item.size) }}</text>
        </view>
        <view class="upload-delete" @click.stop="removeFile(index)">
          <uni-icons type="closeempty" color="#ffffff" size="14" />
        </view>
      </view>
    </view>

    <!-- 上传操作按钮 -->
    <view class="upload-actions">
      <button
        class="upload-btn"
        :disabled="isMaxReached"
        @click="handleChoose('album')"
      >从相册选择</button>
      <button
        class="upload-btn"
        :disabled="isMaxReached"
        @click="handleChoose('camera')"
      >拍照上传</button>
      <button
        class="upload-btn"
        :disabled="isMaxReached"
        @click="handleChooseFile"
      >上传文件</button>
    </view>

    <text class="upload-status">
      已上传 {{ files.length }}/{{ maxCount }} 个，相册权限：{{ albumPermissionLabel }}，相机权限：{{ cameraPermissionLabel }}
    </text>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import UniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import { useUserStore } from '@/store'
import { showErrorToast } from '@/utils/feedback'
import { chooseEvidenceImages, chooseEvidenceFiles, getPermissionStatusLabel } from '@/utils/upload'

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
    default: 500 * 1024 * 1024
  }
})

const emit = defineEmits(['update:modelValue'])
const userStore = useUserStore()
const files = computed(() => props.modelValue || [])
const isMaxReached = computed(() => files.value.length >= props.maxCount)
const albumPermissionLabel = computed(() => getPermissionStatusLabel(userStore.albumPermission))
const cameraPermissionLabel = computed(() => getPermissionStatusLabel(userStore.cameraPermission))

/** 格式化文件大小显示 */
const formatFileSize = (size) => {
  if (!size) return '0 B'
  const kb = size / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(1)} MB`
  return `${(mb / 1024).toFixed(1)} GB`
}

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

/** 用户点击上传文件按钮，申请文件选择能力。 */
const handleChooseFile = async () => {
  if (isMaxReached.value) {
    showErrorToast('已达到上传数量上限')
    return
  }

  const result = await chooseEvidenceFiles({
    count: props.maxCount - files.value.length,
    maxSize: props.maxSize
  })

  if (result.status === 'failed') {
    userStore.setPermissionStatus('file', 'failed')
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

/** 预览已上传的图片或文件。 */
const previewFile = (index) => {
  const item = files.value[index]
  if (!item) return

  if (item.type === 'image') {
    uni.previewImage({
      current: item.url,
      urls: files.value.filter((f) => f.type === 'image').map((f) => f.url)
    })
  } else {
    // 文件类型，打开文件
    uni.openDocument({
      filePath: item.url,
      showMenu: true,
      fail: () => {
        showErrorToast('无法打开该文件')
      }
    })
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-image {
  width: 100%;
  height: 100%;
}

.upload-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 12px;
}

.upload-file-name {
  font-size: 12px;
  color: #333333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.upload-file-size {
  font-size: 11px;
  color: #999999;
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
  z-index: 10;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.upload-btn {
  width: 100%;
  padding: 12px;
  border: 1px solid #0076FF;
  border-radius: 8px;
  background: #ffffff;
  color: #0076FF;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-btn:hover {
  background: #f0f7ff;
}

.upload-btn:active {
  background: #e0e7ff;
  transform: translateY(1px);
}

.upload-btn:disabled {
  border-color: #d1d5db;
  color: #9ca3af;
  background: #f9fafb;
  cursor: not-allowed;
}

.upload-status {
  padding: 10px 12px;
  border-radius: 12px;
  background: #f8fafc;
  font-size: 13px;
  color: #64748b;
}
</style>

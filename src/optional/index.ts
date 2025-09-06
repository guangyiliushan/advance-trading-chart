// Optional exports for advanced utilities; consumers can opt-in
export { cacheManager, CacheManager, TF_STR_TO_SEC, TF_SEC_TO_STR, getWarmupList } from '@/core/cache'
export { DataManager } from '@/lib/data-manager'
export { generateFromData, parseSpanSec, toUnixSeconds } from '@/lib/chart-tools'
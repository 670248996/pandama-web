import useDictStore from '@/store/modules/dict'
import { getAllDict } from '@/api/system/dict'

/**
 * 获取字典数据
 */
export function useDict(...args) {
  const res = ref({});
  return (() => {
    args.forEach((dictType, index) => {
      const dicts = useDictStore().getDict(dictType);
      if (dicts) {
        res.value[dictType] = dicts;
      }
      //  else {
      //   if (!useDictStore.defaultDictList || !useDictStore.defaultDictList.includes(dictType)) {
      //       getAllDict().then(resp => {
      //       useDictStore().setDict(dictType, resp);
      //     })
      //   }
      // }
    })
    return toRefs(res.value);
  })()
}
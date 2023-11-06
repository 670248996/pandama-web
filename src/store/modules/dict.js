import { array } from "js-md5";
import { getAllDict } from "../../api/system/dict";

// 默认写死的字典列表（不从数据库获取）
export const defaultDictList = ref([
  {
    dictType: "sys_normal_disable",
    dictList: [
      { "dictCode": false, "dictName": "禁用" },
      { "dictCode": true, "dictName": "启用" }
    ]
  },
  {
    dictType: "sys_user_sex",
    dictList: [
      { "dictCode": 0, "dictName": "女" },
      { "dictCode": 1, "dictName": "男" }
    ]
  },
]);

const useDictStore = defineStore(
  'dict',
  {
    state: () => ({
      dict: new Array(),
      dictTree: new Array()
    }),
    actions: {
      // 获取字典
      getDict(_key) {
        if (_key == null && _key == "") {
          return null;
        }
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].dictType == _key) {
              return this.dict[i].dictList
            }
          }
        } catch (e) {
          return null;
        }
        // 此处未对不存在的字典做处理
      },
      // 设置字典
      setDict(_key, value) {
        if (_key !== null && _key !== "") {
          this.dict.push({
            key: _key,
            value: value
          });
        }
      },
      // 删除字典
      removeDict(_key) {
        var bln = false;
        try {
          for (let i = 0; i < this.dict.length; i++) {
            if (this.dict[i].key == _key) {
              this.dict.splice(i, 1);
              return true;
            }
          }
        } catch (e) {
          bln = false;
        }
        return bln;
      },
      // 清空字典
      cleanDict() {
        this.dict = new Array();
      },
      // 初始化字典
      initDict() {
        // 系统id为1表示该系统为子系统管理后台
        const systemId = 1
        getAllDict(systemId).then(res => {
          const dictTypes = new Array()
          for (let i = 0; i < res.length; i++) {
            if (res[i].dictParentId == 0) {
              continue
            }
            const dictType = res[i].dictType
            let dict = {}
            const dictJson = {
              "dictCode": res[i].dictCode,
              "dictName": res[i].dictName,
              "dictId": res[i].dictId,
              "dictParentId": res[i].dictParentId,
              "status": res[i].status
            }
            // 先判断有无存放过对应的dictType
            if (dictTypes.indexOf(dictType) == -1) {
              // 没有就初始化，放入第一组元素
              dictTypes.push(dictType)
              dict = {
                "dictType": dictType,
                "dictList": [dictJson]
              }
              this.dict.push(dict);
            } else {
              // 如果dictTypes中已经存在对应的dictType，就从this.dict中取出dictList进行更新
              const dictObj = this.dict.find((item) => {
                return item.dictType === dictType
              })
              dictObj.dictList.push(dictJson)
            }
          }
          this.dict = this.dict.concat(defaultDictList.value)
        })
      }
    }
  })

export default useDictStore

WidgetMetadata = {
  id: "jableTao",
  title: "jable",
  description: "jable网站聚合.标签.女优.预告.推荐(脚本结构紧跟官网)",
  author: "nibiru/makka/el/廿二日",
  site: "https://jable.tv",
  version: "2.3.6",
  requiredVersion: "0.0.2",
  detailCacheDuration: 300,
  modules: [
    {
      title: "搜索项",
      functionName: "search",
      cacheDuration: 3600,
      params: [
        { name: "keyword", title: "关键词", type: "input" },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "最高相关", value: "" },
            { title: "近期最佳", value: "post_date_and_popularity" },
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最高收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "最近更新",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        { name: "url", title: "列表地址", type: "constant", value: "https://jable.tv/latest-updates/?mode=async&function=get_block&block_id=list_videos_latest_videos_list" },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "全新上市",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        { name: "url", title: "列表地址", type: "constant", value: "https://jable.tv/new-release/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "影片主题",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择主题",
          type: "enumeration",
          value: "https://jable.tv/categories/bdsm/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "主奴调教", value: "https://jable.tv/categories/bdsm/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "直接开啪", value: "https://jable.tv/categories/sex-only/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "中文字幕", value: "https://jable.tv/categories/chinese-subtitle/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "凌辱快感", value: "https://jable.tv/categories/insult/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "制服诱惑", value: "https://jable.tv/categories/uniform/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "角色剧情", value: "https://jable.tv/categories/roleplay/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "盗摄偷拍", value: "https://jable.tv/categories/private-cam/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "无码解放", value: "https://jable.tv/categories/uncensored/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "男友视角", value: "https://jable.tv/categories/pov/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "多P群交", value: "https://jable.tv/categories/groupsex/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "丝袜美腿", value: "https://jable.tv/categories/pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "女同欢愉", value: "https://jable.tv/categories/lesbian/?mode=async&function=get_block&block_id=list_videos_common_videos_list" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" }
          ]
        },
        { name: "from", title: "页码", type: "page", value: "1" }
      ]
    },
    {
      title: "热门影片",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        { name: "url", title: "列表地址", type: "constant", value: "https://jable.tv/hot/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "今日热门", value: "video_viewed_today" },
            { title: "本周热门", value: "video_viewed_week" },
            { title: "本月热门", value: "video_viewed_month" },
            { title: "所有时间", value: "video_viewed" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "女优",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择女优",
          type: "enumeration",
          value: "https://jable.tv/s1/models/yua-mikami/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "三上悠亚", value: "https://jable.tv/s1/models/yua-mikami/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "楪可怜", value: "https://jable.tv/models/86b2f23f95cc485af79fe847c5b9de8d/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "小野夕子", value: "https://jable.tv/models/2958338aa4f78c0afb071e2b8a6b5f1b/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "大槻响", value: "https://jable.tv/models/hibiki-otsuki/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "藤森里穗", value: "https://jable.tv/models/riho-fujimori/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "JULIA", value: "https://jable.tv/models/julia/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "明里䌷", value: "https://jable.tv/models/tsumugi-akari/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "桃乃木香奈", value: "https://jable.tv/models/momonogi-kana/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "水户香奈", value: "https://jable.tv/models/kana-mito/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "篠田ゆう", value: "https://jable.tv/s1/models/shinoda-yuu/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "枫可怜", value: "https://jable.tv/models/kaede-karen/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "吉泽明步", value: "https://jable.tv/models/akiho-yoshizawa/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "羽月希", value: "https://jable.tv/models/21e145d3f4d7c8c818fc7eae19342a7a/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "美谷朱里", value: "https://jable.tv/s1/models/mitani-akari/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "山岸逢花", value: "https://jable.tv/models/yamagishi-aika/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "佐佐木明希", value: "https://jable.tv/models/sasaki-aki/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "神木麗", value: "https://jable.tv/models/ef9b1ab9a21b58d6ee4d7d97ab883288/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "七泽美亚", value: "https://jable.tv/models/nanasawa-mia/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "瀬戸環奈", value: "https://jable.tv/models/1a71be5a068c6f9e00fac285b31019f9/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "泷本梛葉", value: "https://jable.tv/models/7ffb432871f53eda0b4d80be34fff86a/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "さくらわかな", value: "https://jable.tv/models/0b96db26c8b192b0a54e24d878380765/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "彩月七绪", value: "https://jable.tv/models/e82b22cd3275fd0e569147d82fa1999d/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "鈴乃ウト", value: "https://jable.tv/models/559904d22cbf03091f790258aa4e9b8c/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "三田真铃", value: "https://jable.tv/models/7749dd641e0426f55342972d920513a7/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "七ツ森りり", value: "https://jable.tv/models/9ed214792a2144520430dd494c93f651/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "七岛舞", value: "https://jable.tv/models/6ab2e738a33eafc3db27cab0b83cf5cd/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "八挂うみ", value: "https://jable.tv/models/83397477054d35cd07e2c48685335a86/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "八木奈々", value: "https://jable.tv/models/3610067a1d725dab8ee8cd3ffe828850/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "宫下玲奈", value: "https://jable.tv/models/b435825a4941964079157dd2fc0a8e5a/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "小凑よつ葉", value: "https://jable.tv/models/ff8ce98f2419126e00a90bc1f3385824/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "小野六花", value: "https://jable.tv/models/0478c4db9858c4e6c60af7fbf828009a/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "工藤ゆら", value: "https://jable.tv/models/e7ba849893aa7ce8afcc3003a4075c20/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "本庄铃", value: "https://jable.tv/models/honjou-suzu/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "桜空もも", value: "https://jable.tv/models/sakura-momo/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "枫ふうあ", value: "https://jable.tv/models/f88e49c4c1adb0fd1bae71ac122d6b82/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "河北彩伽", value: "https://jable.tv/models/saika-kawakita2/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "矢埜爱茉", value: "https://jable.tv/models/0903b1921df6c616c29041be11c3d2e8/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "石川澪", value: "https://jable.tv/models/a855133fa44ca5e7679cac0a0ab7d1cb/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "美ノ岛めぐり", value: "https://jable.tv/models/d1ebb3d61ee367652e6b1f35b469f2b6/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "野々浦暖", value: "https://jable.tv/models/6b0ce5c4944edce04ab48d4bb608fd4c/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "青空ひかり", value: "https://jable.tv/models/4c7a2cfa27b343e3e07659650400f61d/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "香澄りこ", value: "https://jable.tv/models/6c2e861e04b9327701a80ca77a088814/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "新ありな", value: "https://jable.tv/models/e763382dc86aa703456d964ca25d0e8b/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "未歩なな", value: "https://jable.tv/models/c9535c2f157202cd0e934d62ef582e2e/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "凪ひかる", value: "https://jable.tv/models/91fca8d824e07075d09de0282f6e9076/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "三宫つばき", value: "https://jable.tv/models/f0e279c00b2a7e1aca2ef4d31d611020/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "蓝芽みずき", value: "https://jable.tv/models/679c69a5488daa35a5544749b75556c6/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "つばさ舞", value: "https://jable.tv/models/0d7709a62cc199f923107c120d30893b/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "朝日りお", value: "https://jable.tv/models/ad0935cfa1449ab126dde2b0c0929ad0/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "日下部加奈", value: "https://jable.tv/models/dfea76fd68bc52e0888a78e0fedce073/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "弓乃りむ", value: "https://jable.tv/models/06c22ca98d8ec82963046ad17e0fad4a/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "夏希まろん", value: "https://jable.tv/models/1c0f1b4475962e88b541f9f0db1584fe/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "水川スミレ", value: "https://jable.tv/models/7415fde573b12a4e87e83ef33ea354d5/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "実浜みき", value: "https://jable.tv/models/299c2d256b9c509f80302d261ea0b5a9/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "弥生みづき", value: "https://jable.tv/s1/models/mizuki-yayoi/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "天川そら", value: "https://jable.tv/models/3e69d39a117c2d25a407dfd57e204e48/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "新名あみん", value: "https://jable.tv/models/0dba31ccef2f1fca3563c56dbcf3fa7d/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "小沢菜穂", value: "https://jable.tv/models/2ec30dc8e35906a29fe5c8f5b97e6c89/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "三原ほのか", value: "https://jable.tv/models/mihara-honoka/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "凉森れむ", value: "https://jable.tv/models/7cadf3e484f607dc7d0f1c0e7a83b007/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "森日向子", value: "https://jable.tv/models/1a7543f89b125421e489d98de472ebf4/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "金松季歩", value: "https://jable.tv/models/48ace5552227a2a4f867af73efa18f2d/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "衣着",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择衣着",
          type: "enumeration",
          value: "https://jable.tv/tags/black-pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "黑丝", value: "https://jable.tv/tags/black-pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "肉丝", value: "https://jable.tv/tags/flesh-toned-pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "丝袜", value: "https://jable.tv/tags/pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "兽耳", value: "https://jable.tv/tags/kemonomimi/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "渔网", value: "https://jable.tv/tags/fishnets/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "水着", value: "https://jable.tv/tags/swimsuit/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "校服", value: "https://jable.tv/tags/school-uniform/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "旗袍", value: "https://jable.tv/tags/cheongsam/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "婚纱", value: "https://jable.tv/tags/wedding-dress/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "女仆", value: "https://jable.tv/tags/maid/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "和服", value: "https://jable.tv/tags/kimono/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "眼镜娘", value: "https://jable.tv/tags/glasses/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "过膝袜", value: "https://jable.tv/tags/knee-socks/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "运动装", value: "https://jable.tv/tags/sportswear/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "兔女郎", value: "https://jable.tv/tags/bunny-girl/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "Cosplay", value: "https://jable.tv/tags/Cosplay/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "吊带袜", value: "https://jable.tv/tags/stockings/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "剧情",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择剧情",
          type: "enumeration",
          value: "https://jable.tv/tags/affair/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "出轨", value: "https://jable.tv/tags/affair/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "丑男", value: "https://jable.tv/tags/ugly-man/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "亲属", value: "https://jable.tv/tags/kinship/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "童贞", value: "https://jable.tv/tags/virginity/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "复仇", value: "https://jable.tv/tags/avenge/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "巨汉", value: "https://jable.tv/tags/giant/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "媚药", value: "https://jable.tv/tags/love-potion/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "催眠", value: "https://jable.tv/tags/hypnosis/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "偷拍", value: "https://jable.tv/tags/private-cam/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "NTR", value: "https://jable.tv/tags/ntr/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "年龄差", value: "https://jable.tv/tags/age-difference/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "下雨天", value: "https://jable.tv/tags/rainy-day/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "时间停止", value: "https://jable.tv/tags/time-stop/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "黑人", value: "https://jable.tv/tags/black/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "诱惑", value: "https://jable.tv/tags/temptation/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "夫目前犯", value: "https://jable.tv/tags/sex-beside-husband/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "地点",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择地点",
          type: "enumeration",
          value: "https://jable.tv/tags/tram/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "电车", value: "https://jable.tv/tags/tram/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "处女", value: "https://jable.tv/tags/first-night/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "监狱", value: "https://jable.tv/tags/prison/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "温泉", value: "https://jable.tv/tags/hot-spring/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "泳池", value: "https://jable.tv/tags/swimming-pool/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "汽车", value: "https://jable.tv/tags/car/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "厕所", value: "https://jable.tv/tags/toilet/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "学校", value: "https://jable.tv/tags/school/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "魔镜号", value: "https://jable.tv/tags/magic-mirror/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "洗浴场", value: "https://jable.tv/tags/bathing-place/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "图书馆", value: "https://jable.tv/tags/library/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "健身房", value: "https://jable.tv/tags/gym-room/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "便利店", value: "https://jable.tv/tags/store/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "身材",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择身材",
          type: "enumeration",
          value: "https://jable.tv/tags/tall/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "长身", value: "https://jable.tv/tags/tall/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "软体", value: "https://jable.tv/tags/flexible-body/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "贫乳", value: "https://jable.tv/tags/small-tits/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "美腿", value: "https://jable.tv/tags/beautiful-leg/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "美尻", value: "https://jable.tv/tags/beautiful-butt/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "纹身", value: "https://jable.tv/tags/tattoo/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "短发", value: "https://jable.tv/tags/short-hair/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "白虎", value: "https://jable.tv/tags/hairless-pussy/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "熟女", value: "https://jable.tv/tags/mature-woman/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "巨乳", value: "https://jable.tv/tags/big-tits/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "少女", value: "https://jable.tv/tags/girl/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "娇小", value: "https://jable.tv/tags/dainty/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "黑肉", value: "https://jable.tv/tags/suntan/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "角色",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择角色",
          type: "enumeration",
          value: "https://jable.tv/tags/wife/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "人妻", value: "https://jable.tv/tags/wife/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "医生", value: "https://jable.tv/tags/doctor/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "护士", value: "https://jable.tv/tags/nurse/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "老师", value: "https://jable.tv/tags/teacher/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "空姐", value: "https://jable.tv/tags/flight-attendant/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "逃犯", value: "https://jable.tv/tags/fugitive/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "情侣", value: "https://jable.tv/tags/couple/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "主播", value: "https://jable.tv/tags/female-anchor/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "风俗娘", value: "https://jable.tv/tags/club-hostess-and-sex-worker/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "家政妇", value: "https://jable.tv/tags/housewife/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "搜查官", value: "https://jable.tv/tags/detective/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "未亡人", value: "https://jable.tv/tags/widow/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "家庭教师", value: "https://jable.tv/tags/private-teacher/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "球队经理", value: "https://jable.tv/tags/team-manager/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "偶像", value: "https://jable.tv/tags/idol/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "OL", value: "https://jable.tv/tags/ol/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "交合",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择交合",
          type: "enumeration",
          value: "https://jable.tv/tags/facial/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "颜射", value: "https://jable.tv/tags/facial/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "足交", value: "https://jable.tv/tags/footjob/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "痉挛", value: "https://jable.tv/tags/spasms/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "潮吹", value: "https://jable.tv/tags/squirting/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "深喉", value: "https://jable.tv/tags/deep-throat/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "接吻", value: "https://jable.tv/tags/kiss/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "口爆", value: "https://jable.tv/tags/cum-in-mouth/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "口交", value: "https://jable.tv/tags/blowjob/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "乳交", value: "https://jable.tv/tags/tit-wank/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "中出", value: "https://jable.tv/tags/creampie/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "肛交", value: "https://jable.tv/tags/anal-sex/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "玩法",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择玩法",
          type: "enumeration",
          value: "https://jable.tv/tags/outdoor/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "露出", value: "https://jable.tv/tags/outdoor/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "侵犯", value: "https://jable.tv/tags/intrusion/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "调教", value: "https://jable.tv/tags/tune/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "捆绑", value: "https://jable.tv/tags/bondage/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "痴汉", value: "https://jable.tv/tags/chikan/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "痴女", value: "https://jable.tv/tags/chizyo/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "男M", value: "https://jable.tv/tags/masochism-guy/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "泥醉", value: "https://jable.tv/tags/crapulence/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "泡姬", value: "https://jable.tv/tags/soapland/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "母乳", value: "https://jable.tv/tags/breast-milk/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "放尿", value: "https://jable.tv/tags/piss/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "按摩", value: "https://jable.tv/tags/massage/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "多P", value: "https://jable.tv/tags/groupsex/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "瞬间插入", value: "https://jable.tv/tags/quickie/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "集团侵犯", value: "https://jable.tv/tags/gang-intrusion/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "刑具", value: "https://jable.tv/tags/grip/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "凌辱", value: "https://jable.tv/tags/insult/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "一日十回", value: "https://jable.tv/tags/10-times-a-day/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "3P", value: "https://jable.tv/tags/3p/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "主题",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择主题",
          type: "enumeration",
          value: "https://jable.tv/categories/roleplay/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "角色剧情", value: "https://jable.tv/categories/roleplay/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "制服诱惑", value: "https://jable.tv/categories/uniform/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "直接开啪", value: "https://jable.tv/categories/sex-only/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "丝袜美腿", value: "https://jable.tv/categories/pantyhose/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "主奴调教", value: "https://jable.tv/categories/bdsm/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "多P群交", value: "https://jable.tv/categories/groupsex/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "男友视角", value: "https://jable.tv/categories/pov/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "凌辱快感", value: "https://jable.tv/categories/insult/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "盗摄偷拍", value: "https://jable.tv/categories/private-cam/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "无码解放", value: "https://jable.tv/categories/uncensored/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "女同欢愉", value: "https://jable.tv/categories/lesbian/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
    {
      title: "杂项",
      functionName: "loadPage",
      cacheDuration: 3600,
      params: [
        {
          name: "sort_by",
          title: "选择杂项",
          type: "enumeration",
          value: "https://jable.tv/tags/video-recording/?mode=async&function=get_block&block_id=list_videos_common_videos_list",
          enumOptions: [
            { title: "录像", value: "https://jable.tv/tags/video-recording/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "综艺", value: "https://jable.tv/tags/variety-show/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "感谢祭", value: "https://jable.tv/tags/thanksgiving/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "节日主题", value: "https://jable.tv/tags/festival/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "四小时以上", value: "https://jable.tv/tags/more-than-4-hours/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
            { title: "处女作/隐退作", value: "https://jable.tv/tags/debut-retires/?mode=async&function=get_block&block_id=list_videos_common_videos_list" },
          ],
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          enumOptions: [
            { title: "最近更新", value: "post_date" },
            { title: "最多观看", value: "video_viewed" },
            { title: "最多收藏", value: "most_favourited" },
          ],
        },
        { name: "from", title: "页码", type: "page", value: "1" },
      ],
    },
  ],
  search: {
    title: "全局搜索",
    functionName: "searchGlobal",
    params: [
      { name: "keyword", title: "关键词", type: "input", value: "" },
      { name: "from", title: "页码", type: "page", value: "1" },
    ],
  },
};

const BASE_URL = "https://jable.tv";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function getHeaders(referer = BASE_URL + "/") {
  return {
    "User-Agent": UA,
    "Referer": referer,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8",
  };
}

function normalizeUrl(href) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return BASE_URL + href;
  return BASE_URL + "/" + href;
}

function safeText(str) {
  return (str || "").replace(/\s+/g, " ").trim();
}


function parseListHtml(html) {
  if (!html || !html.trim()) return [];
  const $ = Widget.html.load(html);
  const items = [];
  const seen = new Set();

  $(".video-img-box").each((_, el) => {
    const $item = $(el);
    const $link = $item.find("div.img-box a").first();
    const href = $link.attr("href") || "";
    const link = normalizeUrl(href);

    if (!link || seen.has(link) || !link.includes("jable.tv/videos/")) return;
    seen.add(link);

    const $img = $item.find("img").first();
    const cover = $img.attr("data-src") || $img.attr("src") || "";
    const title = safeText($item.find("h6.title a, .title a").first().text()) || safeText($img.attr("alt"));
    if (!title) return;

    const durationText = safeText($item.find(".absolute-bottom-right .label").first().text()) || undefined;
    const previewUrl = $img.attr("data-preview") || undefined;

    items.push({
      id: link,
      type: "url",
      title,
      backdropPath: cover || undefined,
      posterPath: undefined,
      durationText,
      previewUrl,
      link,
      mediaType: "movie",
      playerType: "system",
    });
  });

  return items;
}


async function search(params = {}) {
  if (!params.keyword?.trim()) return [];
  return searchByKeyword(params.keyword.trim(), params);
}

async function searchGlobal(params = {}) {
  if (!params.keyword?.trim()) return [];
  return searchByKeyword(params.keyword.trim(), params);
}

async function searchByKeyword(keyword, params = {}) {
  try {
    const q = encodeURIComponent(keyword);
    let url = `${BASE_URL}/search/${q}/?mode=async&function=get_block&block_id=list_videos_videos_list_search_result&q=${q}`;
    if (params.sort) url += `&sort_by=${params.sort}`;
    if (params.from && params.from !== "1") url += `&from=${params.from}`;

    const { data } = await Widget.http.get(url, { headers: getHeaders(BASE_URL + "/") });
    const items = parseListHtml(data || "");

    return items.map(item => ({
      ...item,
      posterPath: item.backdropPath || item.posterPath,
    }));
  } catch (e) {
    return [];
  }
}

async function loadPage(params = {}) {
  try {
    const jumpId = params.genreId || params.peopleId;
    let url = jumpId
      ? jumpId + (jumpId.includes("?") ? "" : "?mode=async&function=get_block&block_id=list_videos_common_videos_list")
      : (params.url || params.sort_by);
    if (!url) return [];
    if (params.sort) url += `&sort_by=${params.sort}`;
    if (params.from && params.from !== "1") url += `&from=${params.from}`;

    const { data } = await Widget.http.get(url, { headers: getHeaders(BASE_URL + "/") });
    return parseListHtml(data || "");
  } catch (e) {
    return [];
  }
}


async function loadDetail(link) {
  try {
    const { data } = await Widget.http.get(link, { headers: getHeaders(BASE_URL + "/") });
    const html = data || "";
    const $ = Widget.html.load(html);

    let videoUrl = "";
    const hlsMatch = html.match(/var\s+hlsUrl\s*=\s*['"]([^'"]+)['"]/);
    videoUrl = hlsMatch?.[1] || "";
    if (!videoUrl) {
      for (const pattern of [
        /(?:videoUrl|sourceUrl|playlist)\s*[:=]\s*['"]([^'"]+)['"]/i,
        /['"]([^'"]+?\.m3u8[^'"]*)['"]/,
        /['"]([^'"]+?\.mp4[^'"]*)['"]/,
      ]) {
        const m = html.match(pattern);
        if (m && m[1]) { videoUrl = m[1]; break; }
      }
    }
    if (!videoUrl) throw new Error("无法获取视频地址");
    if (videoUrl.startsWith("//")) videoUrl = "https:" + videoUrl;

    const title = safeText($("section.video-info h4").first().text())
      || safeText($('meta[property="og:title"]').attr("content"))
      || "未知标题";

    const cover = $("video#player").attr("poster")
      || $('meta[property="og:image"]').attr("content")
      || "";

    const description = safeText($("h5.desc").first().text()) || undefined;

    let trailers = undefined;
    const posterUrl = cover;
    const pageCtxMatch = html.match(/videoId\s*:\s*['"](\d+)['"]/);
    const ogImgMatch = posterUrl.match(/videos_screenshots\/\d+\/(\d+)\/preview\.jpg/);
    const videoNumId = pageCtxMatch?.[1] || ogImgMatch?.[1] || "";
    if (videoNumId) {
      const prefix = Math.floor(parseInt(videoNumId, 10) / 1000) * 1000;
      const cdnBase = "https://assets-cdn.jable.tv/contents/videos_screenshots";
      const previewMp4 = `${cdnBase}/${prefix}/${videoNumId}/${videoNumId}_preview.mp4`;
      const previewCover = posterUrl || `${cdnBase}/${prefix}/${videoNumId}/preview.jpg`;
      trailers = [{ coverUrl: previewCover, url: previewMp4 }];
    }

    const genreItems = [];
    $("h5.tags a.cat").each((_, el) => {
      const $a = $(el);
      const href = normalizeUrl($a.attr("href") || "");
      const text = safeText($a.text());
      if (!text || !href) return;
      genreItems.push({ id: href, title: text });
    });

    const tagItems = [];
    $("h5.tags a:not(.cat)").each((_, el) => {
      const $a = $(el);
      const href = normalizeUrl($a.attr("href") || "");
      if (!href.includes("jable.tv")) return;
      const text = safeText($a.text());
      if (!text || text === "•") return;
      tagItems.push({ id: href, title: text });
    });

    const allGenres = [...genreItems, ...tagItems];

    const peoples = [];
    const seenPeoples = new Set();
    $("div.models a.model").each((_, el) => {
      const $a = $(el);
      const modelHref = normalizeUrl($a.attr("href") || "");
      const $span = $a.find("span").first();
      const name = safeText(
        $span.attr("data-original-title")
        || $span.attr("data-originaltitle")
        || $span.attr("title")
        || $a.attr("data-original-title")
        || $a.find("span[data-original-title]").attr("data-original-title")
      );
      if (!name || seenPeoples.has(name)) return;
      seenPeoples.add(name);
      const id = modelHref || name;
      peoples.push({
        id,
        title: name,
        avatar: "https://iili.io/KtHNnQS.png",
      });
    });

    const relatedItems = [];
    const seenRelated = new Set([link]);
    $("div.video-img-box").each((_, el) => {
      if (relatedItems.length >= 12) return false;
      const $item = $(el);
      const $a = $item.find("div.img-box a").first();
      const recHref = $a.attr("href") || "";
      const recLink = normalizeUrl(recHref);
      if (!recLink || seenRelated.has(recLink) || !recLink.includes("jable.tv/videos/")) return;
      seenRelated.add(recLink);

      const $img = $item.find("img").first();
      const recCover = $img.attr("data-src") || "";
      const recTitle = safeText($item.find("h6.title a").first().text()) || safeText($img.attr("alt")) || "相关视频";
      const recDuration = safeText($item.find(".absolute-bottom-right .label").first().text()) || undefined;

      const $subTitle = $item.find("p.sub-title");
      const subNodes = [];
      $subTitle.contents().each((_, node) => {
        if (node.type === "text") {
          const t = node.data.replace(/\s+/g, "");
          if (t) subNodes.push(t);
        }
      });
      const recViews = subNodes[0] || undefined;

      const descParts = [];
      if (recDuration) descParts.push(`时长: ${recDuration}`);
      if (recViews)    descParts.push(`观看: ${recViews}`);

      relatedItems.push({
        id: recLink,
        type: "url",
        title: recTitle,
        backdropPath: recCover || undefined,
        posterPath: recCover || undefined,
        durationText: recDuration,
        description: descParts.length ? descParts.join(" | ") : undefined,
        mediaType: "movie",
        link: recLink,
      });
    });

    return {
      id: link,
      type: "url",
      videoUrl,
      playerType: "ijk",
      title,
      description,
      trailers,
      backdropPath: cover || undefined,
      posterPath: cover || undefined,
      genreItems: allGenres.length > 0 ? allGenres : undefined,
      peoples: peoples.length > 0 ? peoples : undefined,
      relatedItems,
      mediaType: "movie",
      link,
      customHeaders: {
        "User-Agent": UA,
        "Referer": link,
        "Origin": BASE_URL,
      },
    };
  } catch (e) {
    return {
      id: link,
      type: "url",
      videoUrl: link,
      title: "加载失败",
      description: e.message || "详情请求失败",
      mediaType: "movie",
      link,
    };
  }
}

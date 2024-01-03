export enum BaseLayerType {
  'wmts' = 'wmts'
}

export enum BaseLayerTitle {
  'OSM' = 'OSM',
  '臺灣通用正射影像' = '臺灣通用正射影像',
  '台灣通用電子地圖(黑底)' = '台灣通用電子地圖(黑底)',
  '台灣通用電子地圖(灰階)' = '台灣通用電子地圖(灰階)',
  '台灣通用電子地圖' = '台灣通用電子地圖'
}

export interface LayerDef {
  type: BaseLayerType
  title: BaseLayerTitle
  url: string
  opacity: number
  maxZoom: number
  visible: boolean
}

export const BaseLayerMap = new Map<BaseLayerTitle, LayerDef>([
  [
    BaseLayerTitle.OSM,
    {
      type: BaseLayerType.wmts,
      title: BaseLayerTitle.OSM,
      url: 'https://gis.sinica.edu.tw/worldmap/file-exists.php?img=OSM-png-{z}-{x}-{y}',
      opacity: 1,
      maxZoom: 18,
      visible: true
    }
  ],
  [
    BaseLayerTitle.臺灣通用正射影像,
    {
      type: BaseLayerType.wmts,
      title: BaseLayerTitle.臺灣通用正射影像,
      url: 'https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/GoogleMapsCompatible/{z}/{y}/{x}',
      opacity: 1,
      maxZoom: 18,
      visible: true
    }
  ],
  [
    BaseLayerTitle['台灣通用電子地圖(黑底)'],
    {
      type: BaseLayerType.wmts,
      title: BaseLayerTitle['台灣通用電子地圖(黑底)'],
      url: 'https://wmts.nlsc.gov.tw/wmts/EMAP2/default/GoogleMapsCompatible/{z}/{y}/{x}',
      opacity: 1,
      maxZoom: 18,
      visible: true
    }
  ],
  [
    BaseLayerTitle['台灣通用電子地圖(灰階)'],
    {
      type: BaseLayerType.wmts,
      title: BaseLayerTitle['台灣通用電子地圖(灰階)'],
      url: 'https://wmts.nlsc.gov.tw/wmts/EMAP01/default/GoogleMapsCompatible/{z}/{y}/{x}',
      opacity: 1,
      maxZoom: 18,
      visible: true
    }
  ],
  [
    BaseLayerTitle.台灣通用電子地圖,
    {
      type: BaseLayerType.wmts,
      title: BaseLayerTitle.台灣通用電子地圖,
      url: 'https://wmts.nlsc.gov.tw/wmts/EMAP/default/GoogleMapsCompatible/{z}/{y}/{x}',
      opacity: 1,
      maxZoom: 18,
      visible: true
    }
  ]
])

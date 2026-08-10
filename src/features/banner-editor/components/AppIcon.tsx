import { memo } from 'react'
import {
  BookmarkIcon,
  BellIcon,
  BroadcastIcon,
  CalendarIcon,
  ChevronDownIcon,
  ColumnsIcon,
  DownloadIcon,
  ImageIcon,
  HistoryIcon,
  LocationIcon,
  MarkGithubIcon,
  PaintbrushIcon,
  RedoIcon,
  ScreenFullIcon,
  SearchIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
  SparkleFillIcon,
  StackIcon,
  SyncIcon,
  TypographyIcon,
  UndoIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  type Icon,
} from '@primer/octicons-react'

export type AppIconName =
  | 'spark'
  | 'bell'
  | 'broadcast'
  | 'calendar'
  | 'layout'
  | 'swatch'
  | 'text'
  | 'download'
  | 'chevronDown'
  | 'layers'
  | 'refresh'
  | 'undo'
  | 'redo'
  | 'pin'
  | 'image'
  | 'close'
  | 'save'
  | 'zoomIn'
  | 'zoomOut'
  | 'fit'
  | 'collapse'
  | 'expand'
  | 'history'
  | 'github'
  | 'search'

type AppIconProps = {
  name: AppIconName
  className?: string
}

const iconByName: Record<AppIconName, Icon> = {
  spark: SparkleFillIcon,
  bell: BellIcon,
  broadcast: BroadcastIcon,
  calendar: CalendarIcon,
  layout: ColumnsIcon,
  swatch: PaintbrushIcon,
  text: TypographyIcon,
  download: DownloadIcon,
  chevronDown: ChevronDownIcon,
  layers: StackIcon,
  refresh: SyncIcon,
  undo: UndoIcon,
  redo: RedoIcon,
  pin: LocationIcon,
  image: ImageIcon,
  close: XIcon,
  save: BookmarkIcon,
  zoomIn: ZoomInIcon,
  zoomOut: ZoomOutIcon,
  fit: ScreenFullIcon,
  collapse: SidebarCollapseIcon,
  expand: SidebarExpandIcon,
  history: HistoryIcon,
  github: MarkGithubIcon,
  search: SearchIcon,
}

export const AppIcon = memo(function AppIcon({ name, className }: AppIconProps) {
  const IconComponent = iconByName[name]

  return <IconComponent className={className} />
})

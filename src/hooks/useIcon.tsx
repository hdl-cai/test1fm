/**
 * Icon Hook - useIcon
 * 
 * Provides icon components using Lucide React as the primary icon library.
 * This is a simplified version that directly uses Lucide icons.
 * 
 * Usage:
 *   const DashboardIcon = useIcon('DashboardSquareIcon');
 *   return <DashboardIcon size={24} color="#F59E0B" />;
 * 
 *   Or use the Icon component directly:
 *   <Icon name="DashboardSquareIcon" size={24} color="#F59E0B" />
 */

import {
  Activity,
  AirVent,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BarChart,
  BarChart3,
  BatteryFull,
  BatteryLow,
  Bell,
  Bike,
  Bird,
  Bookmark,
  Box,
  Bug,
  Building,
  Building2,
  Bus,
  Calculator,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Church,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cloud,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Code,
  Compass,
  Copy,
  Cpu,
  CreditCard,
  Database as DatabaseIconLucide,
  DollarSign,
  Download,
  Drama,
  Droplet,
  Droplets,
  Egg,
  ExternalLink,
  Eye,
  EyeOff,
  Factory,
  FileHeart,
  FileText,
  Filter,
  Fish,
  Flag,
  Flame,
  Folder,
  Frown,
  Globe,
  HardDrive,
  Headphones,
  Heart,
  HelpCircle,
  History,
  Home,
  Hospital,
  Image,
  Info,
  Keyboard,
  Landmark,
  Laptop,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  Library,
  LineChart,
  Link,
  List,
  Lock,
  LogOut,
  Mail,
  Map as MapIconLucide,
  MapPin,
  Maximize,
  Meh,
  Menu,
  MessageSquare,
  Mic,
  Minimize,
  Minus,
  Monitor,
  Moon,
  MoreVertical,
  Mountain,
  Mouse,
  Navigation,
  Package,
  Pause,
  Pencil,
  PhilippinePeso,
  Phone,
  Pill,
  Plane,
  Play,
  Plus,
  Printer,
  Radio,
  ReceiptText,
  RefreshCw,
  Rocket,
  RotateCw,
  Router,
  Satellite,
  Save,
  School,
  Search,
  Server,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Signal,
  SkipBack,
  SkipForward,
  Skull,
  Smartphone,
  Smile,
  Snowflake,
  Speaker,
  Sprout,
  Square,
  Star,
  Stethoscope,
  Store,
  Sun,
  Table,
  Tablet,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Train,
  Trash2,
  TreePine,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  Umbrella,
  Unlock,
  Upload,
  User,
  UserMinus,
  UserPlus,
  Users,
  Video,
  Volume2,
  VolumeOff,
  VolumeX,
  Warehouse,
  Waves,
  Wheat,
  Wifi,
  WifiOff,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
  type LucideProps,
} from 'lucide-react';

const LucideIcons = {
  Activity,
  AirVent,
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BarChart,
  BarChart3,
  BatteryFull,
  BatteryLow,
  Bell,
  Bike,
  Bird,
  Bookmark,
  Box,
  Bug,
  Building,
  Building2,
  Bus,
  Calculator,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Church,
  CircleDollarSign,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cloud,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSun,
  Code,
  Compass,
  Copy,
  Cpu,
  CreditCard,
  Database: DatabaseIconLucide,
  DollarSign,
  Download,
  Drama,
  Droplet,
  Droplets,
  Egg,
  ExternalLink,
  Eye,
  EyeOff,
  Factory,
  FileHeart,
  FileText,
  Filter,
  Fish,
  Flag,
  Flame,
  Folder,
  Frown,
  Globe,
  HardDrive,
  Headphones,
  Heart,
  HelpCircle,
  History,
  Home,
  Hospital,
  Image,
  Info,
  Keyboard,
  Landmark,
  Laptop,
  LayoutDashboard,
  LayoutGrid,
  Leaf,
  Library,
  LineChart,
  Link,
  List,
  Lock,
  LogOut,
  Mail,
  Map: MapIconLucide,
  MapPin,
  Maximize,
  Meh,
  Menu,
  MessageSquare,
  Mic,
  Minimize,
  Minus,
  Monitor,
  Moon,
  MoreVertical,
  Mountain,
  Mouse,
  Navigation,
  Package,
  Pause,
  Pencil,
  PhilippinePeso,
  Phone,
  Pill,
  Plane,
  Play,
  Plus,
  Printer,
  Radio,
  ReceiptText,
  RefreshCw,
  Rocket,
  RotateCw,
  Router,
  Satellite,
  Save,
  School,
  Search,
  Server,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Ship,
  Signal,
  SkipBack,
  SkipForward,
  Skull,
  Smartphone,
  Smile,
  Snowflake,
  Speaker,
  Sprout,
  Square,
  Star,
  Stethoscope,
  Store,
  Sun,
  Table,
  Tablet,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  Timer,
  Train,
  Trash2,
  TreePine,
  TrendingDown,
  TrendingUp,
  Trophy,
  Truck,
  Umbrella,
  Unlock,
  Upload,
  User,
  UserMinus,
  UserPlus,
  Users,
  Video,
  Volume2,
  VolumeOff,
  VolumeX,
  Warehouse,
  Waves,
  Wheat,
  Wifi,
  WifiOff,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} as const;

// ============================================================================
// Icon Mapping - Maps our icon names to Lucide icons
// ============================================================================

interface IconMapping {
  name: string;
  lucide: keyof typeof LucideIcons;
}

const ICON_MAPPING = [
  // Navigation
  { name: 'DashboardSquareIcon', lucide: 'LayoutDashboard' },
  { name: 'FarmIcon', lucide: 'Warehouse' },
  { name: 'InventoryIcon', lucide: 'Package' },
  { name: 'SensorIcon', lucide: 'Radio' },
  { name: 'CycleIcon', lucide: 'RotateCw' },
  { name: 'MedicalFileIcon', lucide: 'FileHeart' },
  { name: 'MoneyIcon', lucide: 'Banknote' },
  { name: 'AnalyticsIcon', lucide: 'BarChart3' },
  { name: 'UserGroupIcon', lucide: 'Users' },
  { name: 'SettingsIcon', lucide: 'Settings' },
  { name: 'HelpCircleIcon', lucide: 'HelpCircle' },
  { name: 'LogoutIcon', lucide: 'LogOut' },
  { name: 'LeaderboardIcon', lucide: 'Trophy' },
  { name: 'AwardIcon', lucide: 'Award' },
  { name: 'TrophyIcon', lucide: 'Trophy' },
  { name: 'MinusIcon', lucide: 'Minus' },
  { name: 'ChevronLeftIcon', lucide: 'ChevronLeft' },
  { name: 'ChevronRightIcon', lucide: 'ChevronRight' },
  { name: 'Analytics01Icon', lucide: 'BarChart' },
  { name: 'AnalyticsUpIcon', lucide: 'TrendingUp' },
  { name: 'Notification01Icon', lucide: 'Bell' },
  { name: 'Money03Icon', lucide: 'Banknote' },
  { name: 'Settings01Icon', lucide: 'Settings' },
  { name: 'Calendar01Icon', lucide: 'Calendar' },
  { name: 'Plus01Icon', lucide: 'Plus' },
  { name: 'Refresh01Icon', lucide: 'RefreshCw' },
  { name: 'FileCode01Icon', lucide: 'FileText' },
  { name: 'InformationCircleIcon', lucide: 'Info' },
  { name: 'DocumentCodeIcon', lucide: 'Code' },
  { name: 'FirstAidIcon', lucide: 'Stethoscope' },
  { name: 'PackageIcon', lucide: 'Package' },

  // Actions
  { name: 'NotificationIcon', lucide: 'Bell' },
  { name: 'SearchIcon', lucide: 'Search' },
  { name: 'PlusSignIcon', lucide: 'Plus' },
  { name: 'CancelIcon', lucide: 'X' },
  { name: 'MoreVerticalCircle01Icon', lucide: 'MoreVertical' },
  { name: 'FilterIcon', lucide: 'Filter' },
  { name: 'CalendarIcon', lucide: 'Calendar' },
  { name: 'ArrowDown01Icon', lucide: 'ChevronDown' },
  { name: 'ArrowUp01Icon', lucide: 'ChevronUp' },
  { name: 'AddIcon', lucide: 'Plus' },
  { name: 'TimeHighIcon', lucide: 'Timer' },
  { name: 'CheckmarkIcon', lucide: 'Check' },
  { name: 'MessageIcon', lucide: 'MessageSquare' },
  { name: 'Save01Icon', lucide: 'Save' },
  { name: 'FirstAidKitIcon', lucide: 'Stethoscope' },
  { name: 'CheckmarkBadge01Icon', lucide: 'BadgeCheck' },
  { name: 'Delete02Icon', lucide: 'Trash2' },
  { name: 'Edit02Icon', lucide: 'Pencil' },
  { name: 'Settings02Icon', lucide: 'Settings' },

  // Farm/Facility
  { name: 'Home01Icon', lucide: 'Home' },
  { name: 'PlantIcon', lucide: 'Sprout' },

  // Inventory Items
  { name: 'EggIcon', lucide: 'Egg' },
  { name: 'Money01Icon', lucide: 'CircleDollarSign' },
  { name: 'TemperatureIcon', lucide: 'Thermometer' },
  { name: 'WaterDropIcon', lucide: 'Droplets' },
  { name: 'WirelessIcon', lucide: 'Wifi' },
  { name: 'WindIcon', lucide: 'Wind' },
  { name: 'AirIcon', lucide: 'AirVent' },
  { name: 'RouterIcon', lucide: 'Router' },
  { name: 'MedicineIcon', lucide: 'Pill' },
  { name: 'WheatIcon', lucide: 'Wheat' },
  { name: 'SkullIcon', lucide: 'Skull' },
  { name: 'PesoIcon', lucide: 'PhilippinePeso' },
  { name: 'AlertTriangleIcon', lucide: 'AlertTriangle' },

  // Common Actions
  { name: 'Edit01Icon', lucide: 'Pencil' },
  { name: 'Delete01Icon', lucide: 'Trash2' },
  { name: 'EyeIcon', lucide: 'Eye' },
  { name: 'Download01Icon', lucide: 'Download' },
  { name: 'Upload01Icon', lucide: 'Upload' },
  { name: 'CheckmarkCircle01Icon', lucide: 'CheckCircle' },
  { name: 'CheckCircleIcon', lucide: 'CheckCircle' },
  { name: 'AlertCircleIcon', lucide: 'AlertCircle' },
  { name: 'InfoCircleIcon', lucide: 'Info' },
  { name: 'ArrowRight01Icon', lucide: 'ArrowRight' },
  { name: 'ArrowLeft01Icon', lucide: 'ArrowLeft' },
  { name: 'Menu01Icon', lucide: 'Menu' },
  { name: 'Clock01Icon', lucide: 'Clock' },
  { name: 'Location01Icon', lucide: 'MapPin' },
  { name: 'MailIcon', lucide: 'Mail' },
  { name: 'CallIcon', lucide: 'Phone' },
  { name: 'SmartphoneIcon', lucide: 'Smartphone' },
  { name: 'DocumentIcon', lucide: 'FileText' },
  { name: 'FolderIcon', lucide: 'Folder' },
  { name: 'ImageIcon', lucide: 'Image' },
  { name: 'ChartIcon', lucide: 'LineChart' },
  { name: 'TrendingUpIcon', lucide: 'TrendingUp' },
  { name: 'TrendingDownIcon', lucide: 'TrendingDown' },
  { name: 'ActivityIcon', lucide: 'Activity' },
  { name: 'BatteryFullIcon', lucide: 'BatteryFull' },
  { name: 'BatteryLowIcon', lucide: 'BatteryLow' },
  { name: 'WifiIcon', lucide: 'Wifi' },
  { name: 'WifiOffIcon', lucide: 'WifiOff' },
  { name: 'SignalIcon', lucide: 'Signal' },
  { name: 'SunIcon', lucide: 'Sun' },
  { name: 'MoonIcon', lucide: 'Moon' },
  { name: 'ShieldCheckIcon', lucide: 'ShieldCheck' },
  { name: 'LockIcon', lucide: 'Lock' },
  { name: 'UnlockIcon', lucide: 'Unlock' },
  { name: 'UserIcon', lucide: 'User' },
  { name: 'UserPlusIcon', lucide: 'UserPlus' },
  { name: 'UserMinusIcon', lucide: 'UserMinus' },
  { name: 'UsersIcon', lucide: 'Users' },
  { name: 'StoreIcon', lucide: 'Store' },
  { name: 'TruckIcon', lucide: 'Truck' },
  { name: 'BoxIcon', lucide: 'Box' },
  { name: 'ClipboardIcon', lucide: 'ClipboardList' },
  { name: 'ClipboardCheckIcon', lucide: 'ClipboardCheck' },
  { name: 'ReceiptIcon', lucide: 'ReceiptText' },
  { name: 'CreditCardIcon', lucide: 'CreditCard' },
  { name: 'DollarSignIcon', lucide: 'DollarSign' },
  { name: 'PesoSignIcon', lucide: 'PhilippinePeso' },
  { name: 'ShieldAlertIcon', lucide: 'ShieldAlert' },
  { name: 'CalculatorIcon', lucide: 'Calculator' },
  { name: 'PrinterIcon', lucide: 'Printer' },
  { name: 'Share01Icon', lucide: 'Share2' },
  { name: 'LinkIcon', lucide: 'Link' },
  { name: 'ExternalLinkIcon', lucide: 'ExternalLink' },
  { name: 'Copy01Icon', lucide: 'Copy' },
  { name: 'RefreshIcon', lucide: 'RefreshCw' },
  { name: 'HistoryIcon', lucide: 'History' },
  { name: 'TimerIcon', lucide: 'Timer' },
  { name: 'PlayIcon', lucide: 'Play' },
  { name: 'PauseIcon', lucide: 'Pause' },
  { name: 'StopIcon', lucide: 'Square' },
  { name: 'SkipBackIcon', lucide: 'SkipBack' },
  { name: 'SkipForwardIcon', lucide: 'SkipForward' },
  { name: 'VolumeIcon', lucide: 'Volume2' },
  { name: 'VolumeOffIcon', lucide: 'VolumeX' },
  { name: 'MaximizeIcon', lucide: 'Maximize' },
  { name: 'MinimizeIcon', lucide: 'Minimize' },
  { name: 'ZoomInIcon', lucide: 'ZoomIn' },
  { name: 'ZoomOutIcon', lucide: 'ZoomOut' },
  { name: 'Search01Icon', lucide: 'Search' },
  { name: 'GridIcon', lucide: 'LayoutGrid' },
  { name: 'ListIcon', lucide: 'List' },
  { name: 'TableIcon', lucide: 'Table' },
  { name: 'MapIcon', lucide: 'Map' },
  { name: 'MapPinIcon', lucide: 'MapPin' },
  { name: 'EyeOffIcon', lucide: 'EyeOff' },
  { name: 'NavigationIcon', lucide: 'Navigation' },
  { name: 'CompassIcon', lucide: 'Compass' },
  { name: 'GlobeIcon', lucide: 'Globe' },
  { name: 'FlagIcon', lucide: 'Flag' },
  { name: 'BookmarkIcon', lucide: 'Bookmark' },
  { name: 'HeartIcon', lucide: 'Heart' },
  { name: 'StarIcon', lucide: 'Star' },
  { name: 'ThumbsUpIcon', lucide: 'ThumbsUp' },
  { name: 'ThumbsDownIcon', lucide: 'ThumbsDown' },
  { name: 'SmileIcon', lucide: 'Smile' },
  { name: 'FrownIcon', lucide: 'Frown' },
  { name: 'MehIcon', lucide: 'Meh' },
  { name: 'ZapIcon', lucide: 'Zap' },
  { name: 'FlameIcon', lucide: 'Flame' },
  { name: 'SnowflakeIcon', lucide: 'Snowflake' },
  { name: 'CloudIcon', lucide: 'Cloud' },
  { name: 'CloudRainIcon', lucide: 'CloudRain' },
  { name: 'CloudSunIcon', lucide: 'CloudSun' },
  { name: 'CloudMoonIcon', lucide: 'CloudMoon' },
  { name: 'CloudLightningIcon', lucide: 'CloudLightning' },
  { name: 'UmbrellaIcon', lucide: 'Umbrella' },
  { name: 'ThermometerIcon', lucide: 'Thermometer' },
  { name: 'DropletIcon', lucide: 'Droplet' },
  { name: 'WavesIcon', lucide: 'Waves' },
  { name: 'FishIcon', lucide: 'Fish' },
  { name: 'BirdIcon', lucide: 'Bird' },
  { name: 'BugIcon', lucide: 'Bug' },
  { name: 'SproutIcon', lucide: 'Sprout' },
  { name: 'LeafIcon', lucide: 'Leaf' },
  { name: 'TreePineIcon', lucide: 'TreePine' },
  { name: 'MountainIcon', lucide: 'Mountain' },
  { name: 'BuildingIcon', lucide: 'Building2' },
  { name: 'FactoryIcon', lucide: 'Factory' },
  { name: 'HospitalIcon', lucide: 'Hospital' },
  { name: 'SchoolIcon', lucide: 'School' },
  { name: 'ChurchIcon', lucide: 'Church' },
  { name: 'BankIcon', lucide: 'Landmark' },
  { name: 'LibraryIcon', lucide: 'Library' },
  { name: 'MuseumIcon', lucide: 'Building' },
  { name: 'TheaterIcon', lucide: 'Drama' },
  { name: 'StadiumIcon', lucide: 'Trophy' },
  { name: 'AirportIcon', lucide: 'Plane' },
  { name: 'BusIcon', lucide: 'Bus' },
  { name: 'CarIcon', lucide: 'Car' },
  { name: 'BikeIcon', lucide: 'Bike' },
  { name: 'TrainIcon', lucide: 'Train' },
  { name: 'ShipIcon', lucide: 'Ship' },
  { name: 'RocketIcon', lucide: 'Rocket' },
  { name: 'SatelliteIcon', lucide: 'Satellite' },
  { name: 'CpuIcon', lucide: 'Cpu' },
  { name: 'DatabaseIcon', lucide: 'Database' },
  { name: 'ServerIcon', lucide: 'Server' },
  { name: 'HardDriveIcon', lucide: 'HardDrive' },
  { name: 'MonitorIcon', lucide: 'Monitor' },
  { name: 'SmartphoneDeviceIcon', lucide: 'Smartphone' },
  { name: 'TabletIcon', lucide: 'Tablet' },
  { name: 'LaptopIcon', lucide: 'Laptop' },
  { name: 'DesktopIcon', lucide: 'Monitor' },
  { name: 'MouseIcon', lucide: 'Mouse' },
  { name: 'KeyboardIcon', lucide: 'Keyboard' },
  { name: 'HeadphonesIcon', lucide: 'Headphones' },
  { name: 'SpeakerIcon', lucide: 'Speaker' },
  { name: 'CameraIcon', lucide: 'Camera' },
  { name: 'VideoIcon', lucide: 'Video' },
  { name: 'MicrophoneIcon', lucide: 'Mic' },
  { name: 'PhoneIcon', lucide: 'Phone' },
  { name: 'TabletDeviceIcon', lucide: 'Tablet' },
] as const;

export type IconName = (typeof ICON_MAPPING)[number]['name'];

// Create mapping lookup for performance
const iconMap = new globalThis.Map<string, IconMapping>();
ICON_MAPPING.forEach((mapping) => {
  iconMap.set(mapping.name, mapping);
});

// ============================================================================
// Icon Component Props
// ============================================================================

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName | string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

// ============================================================================
// Main Icon Component
// ============================================================================

/**
 * Icon component that renders Lucide icons by name
 * 
 * @example
 * <Icon name="DashboardSquareIcon" size={24} color="#F59E0B" />
 */
export function Icon({
  name,
  size = 24,
  color,
  strokeWidth = 2.5,
  className,
  ...props
}: IconProps) {
  // Try to get mapping
  const mapping = iconMap.get(name);

  if (!mapping) {
    console.warn(`Icon "${name}" not found in mapping. Using default HelpCircle.`);
    const HelpCircle = LucideIcons.HelpCircle;
    return <HelpCircle size={size} color={color} strokeWidth={strokeWidth} className={className} {...props} />;
  }

  // Get Lucide icon
  const LucideIcon = LucideIcons[mapping.lucide];

  if (!LucideIcon) {
    console.warn(`Lucide icon "${mapping.lucide}" not found. Using HelpCircle.`);
    const HelpCircle = LucideIcons.HelpCircle;
    return <HelpCircle size={size} color={color} strokeWidth={strokeWidth} className={className} {...props} />;
  }

  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} className={className} {...props} />;
}



// ============================================================================
// Pre-defined Icon Components (for convenience)
// ============================================================================

// Navigation
export function DashboardIcon(props: Omit<IconProps, 'name'>) { return <Icon name="DashboardSquareIcon" {...props} />; }
export function FarmIcon(props: Omit<IconProps, 'name'>) { return <Icon name="FarmIcon" {...props} />; }
export function InventoryIcon(props: Omit<IconProps, 'name'>) { return <Icon name="InventoryIcon" {...props} />; }
export function SensorIcon(props: Omit<IconProps, 'name'>) { return <Icon name="SensorIcon" {...props} />; }
export function CycleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="CycleIcon" {...props} />; }
export function MedicalFileIcon(props: Omit<IconProps, 'name'>) { return <Icon name="MedicalFileIcon" {...props} />; }
export function MoneyIcon(props: Omit<IconProps, 'name'>) { return <Icon name="MoneyIcon" {...props} />; }
export function AnalyticsIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AnalyticsIcon" {...props} />; }
export function UserGroupIcon(props: Omit<IconProps, 'name'>) { return <Icon name="UserGroupIcon" {...props} />; }
export function SettingsIcon(props: Omit<IconProps, 'name'>) { return <Icon name="SettingsIcon" {...props} />; }
export function HelpCircleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="HelpCircleIcon" {...props} />; }
export function LogoutIcon(props: Omit<IconProps, 'name'>) { return <Icon name="LogoutIcon" {...props} />; }

// Actions
export function NotificationIcon(props: Omit<IconProps, 'name'>) { return <Icon name="NotificationIcon" {...props} />; }
export function SearchIcon(props: Omit<IconProps, 'name'>) { return <Icon name="SearchIcon" {...props} />; }
export function PlusSignIcon(props: Omit<IconProps, 'name'>) { return <Icon name="PlusSignIcon" {...props} />; }
export function CancelIcon(props: Omit<IconProps, 'name'>) { return <Icon name="CancelIcon" {...props} />; }
export function MoreVerticalCircle01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="MoreVerticalCircle01Icon" {...props} />; }
export function FilterIcon(props: Omit<IconProps, 'name'>) { return <Icon name="FilterIcon" {...props} />; }
export function CalendarIcon(props: Omit<IconProps, 'name'>) { return <Icon name="CalendarIcon" {...props} />; }
export function ArrowDown01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="ArrowDown01Icon" {...props} />; }

// Farm/Facility
export function Home01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Home01Icon" {...props} />; }
export function PlantIcon(props: Omit<IconProps, 'name'>) { return <Icon name="PlantIcon" {...props} />; }

// Inventory Items
export function EggIcon(props: Omit<IconProps, 'name'>) { return <Icon name="EggIcon" {...props} />; }
export function Money01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Money01Icon" {...props} />; }
export function TemperatureIcon(props: Omit<IconProps, 'name'>) { return <Icon name="TemperatureIcon" {...props} />; }
export function WaterDropIcon(props: Omit<IconProps, 'name'>) { return <Icon name="WaterDropIcon" {...props} />; }
export function WirelessIcon(props: Omit<IconProps, 'name'>) { return <Icon name="WirelessIcon" {...props} />; }
export function WindIcon(props: Omit<IconProps, 'name'>) { return <Icon name="WindIcon" {...props} />; }
export function AirIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AirIcon" {...props} />; }
export function RouterIcon(props: Omit<IconProps, 'name'>) { return <Icon name="RouterIcon" {...props} />; }
export function MedicineIcon(props: Omit<IconProps, 'name'>) { return <Icon name="MedicineIcon" {...props} />; }
export function WheatIcon(props: Omit<IconProps, 'name'>) { return <Icon name="WheatIcon" {...props} />; }

// Common Actions
export function Edit01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Edit01Icon" {...props} />; }
export function Delete01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Delete01Icon" {...props} />; }
export function EyeIcon(props: Omit<IconProps, 'name'>) { return <Icon name="EyeIcon" {...props} />; }
export function Download01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Download01Icon" {...props} />; }
export function Upload01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Upload01Icon" {...props} />; }
export function CheckmarkCircle01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="CheckmarkCircle01Icon" {...props} />; }
export function CheckCircleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="CheckCircleIcon" {...props} />; }
export function AlertCircleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AlertCircleIcon" {...props} />; }
export function InfoCircleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="InfoCircleIcon" {...props} />; }
export function ArrowRight01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="ArrowRight01Icon" {...props} />; }
export function ArrowLeft01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="ArrowLeft01Icon" {...props} />; }
export function TrendingUpIcon(props: Omit<IconProps, 'name'>) { return <Icon name="TrendingUpIcon" {...props} />; }
export function TrendingDownIcon(props: Omit<IconProps, 'name'>) { return <Icon name="TrendingDownIcon" {...props} />; }
export function ArrowUp01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="ArrowUp01Icon" {...props} />; }
export function AddIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AddIcon" {...props} />; }
export function Clock01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Clock01Icon" {...props} />; }
export function ActivityIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ActivityIcon" {...props} />; }
export function EyeOffIcon(props: Omit<IconProps, 'name'>) { return <Icon name="EyeOffIcon" {...props} />; }
export function SkullIcon(props: Omit<IconProps, 'name'>) { return <Icon name="SkullIcon" {...props} />; }
export function PesoIcon(props: Omit<IconProps, 'name'>) { return <Icon name="PesoIcon" {...props} />; }
export function AlertTriangleIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AlertTriangleIcon" {...props} />; }
export function LeaderboardIcon(props: Omit<IconProps, 'name'>) { return <Icon name="LeaderboardIcon" {...props} />; }
export function AwardIcon(props: Omit<IconProps, 'name'>) { return <Icon name="AwardIcon" {...props} />; }
export function TrophyIcon(props: Omit<IconProps, 'name'>) { return <Icon name="TrophyIcon" {...props} />; }
export function MinusIcon(props: Omit<IconProps, 'name'>) { return <Icon name="MinusIcon" {...props} />; }
export function ChevronLeftIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ChevronLeftIcon" {...props} />; }
export function ChevronRightIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ChevronRightIcon" {...props} />; }
export function UserIcon(props: Omit<IconProps, 'name'>) { return <Icon name="UserIcon" {...props} />; }
export function ReceiptIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ReceiptIcon" {...props} />; }
export function PrinterIcon(props: Omit<IconProps, 'name'>) { return <Icon name="PrinterIcon" {...props} />; }
export function Share01Icon(props: Omit<IconProps, 'name'>) { return <Icon name="Share01Icon" {...props} />; }
export function CreditCardIcon(props: Omit<IconProps, 'name'>) { return <Icon name="CreditCardIcon" {...props} />; }
export function ClipboardIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ClipboardIcon" {...props} />; }
export function HistoryIcon(props: Omit<IconProps, 'name'>) { return <Icon name="HistoryIcon" {...props} />; }
export function ShieldAlertIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ShieldAlertIcon" {...props} />; }
export function UsersIcon(props: Omit<IconProps, 'name'>) { return <Icon name="UsersIcon" {...props} />; }
export function PlayIcon(props: Omit<IconProps, 'name'>) { return <Icon name="PlayIcon" {...props} />; }
export function ChartIcon(props: Omit<IconProps, 'name'>) { return <Icon name="ChartIcon" {...props} />; }

// Re-export Lucide icons for direct use if needed
export {
  LayoutDashboard,
  Warehouse,
  Package,
  Radio,
  RotateCw,
  FileHeart,
  Banknote,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Plus,
  X,
  MoreVertical,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Home,
  Sprout,
  Egg,
  CircleDollarSign,
  Thermometer,
  Droplets,
  Wifi,
  Wind,
  Pill,
  Pencil,
  Trash2,
  Eye,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  Award,
  Trophy,
  Minus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

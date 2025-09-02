import { FC, SVGProps } from "react";

import AlertTriangle from "@/assets/icons/alert-triangle.svg";
import Archive from "@/assets/icons/archive.svg";
import ArrowLeft from "@/assets/icons/arrow-left.svg";
import Bolt from "@/assets/icons/bolt.svg";
import Book from "@/assets/icons/book.svg";
import Bot from "@/assets/icons/robot.svg";
import Brain from "@/assets/icons/brain.svg";
import Briefcase from "@/assets/icons/briefcase.svg";
import Calendar from "@/assets/icons/calendar.svg";
import Check from "@/assets/icons/check.svg";
import CheckSquare from "@/assets/icons/checkbox.svg";
import ChevronDown from "@/assets/icons/chevron-down.svg";
import ChevronRight from "@/assets/icons/chevron-right.svg";
import ChevronUp from "@/assets/icons/chevron-up.svg";
import Circle from "@/assets/icons/circle.svg";
import Clock from "@/assets/icons/clock.svg";
import Code from "@/assets/icons/code.svg";
import Copy from "@/assets/icons/copy.svg";
import Database from "@/assets/icons/database.svg";
import DeviceFloppy from "@/assets/icons/device-floppy.svg";
import DotsVertical from "@/assets/icons/dots-vertical.svg";
import Download from "@/assets/icons/download.svg";
import Eye from "@/assets/icons/eye.svg";
import EyeOff from "@/assets/icons/eye-off.svg";
import Expand from "@/assets/icons/arrows-maximize.svg";
import Feather from "@/assets/icons/feather.svg";
import File from "@/assets/icons/file.svg";
import FilePlus from "@/assets/icons/file-plus.svg";
import FileText from "@/assets/icons/file-text.svg";
import Files from "@/assets/icons/files.svg";
import Flag from "@/assets/icons/flag.svg";
import GraduationCap from "@/assets/icons/school.svg";
import Heart from "@/assets/icons/heart.svg";
import History from "@/assets/icons/history.svg";
import Home from "@/assets/icons/home.svg";
import Info from "@/assets/icons/info-circle.svg";
import Key from "@/assets/icons/key.svg";
import LayoutGrid from "@/assets/icons/layout-grid.svg";
import Lightbulb from "@/assets/icons/bulb.svg";
import List from "@/assets/icons/list.svg";
import ListCheck from "@/assets/icons/list-check.svg";
import Loader from "@/assets/icons/loader-2.svg";
import Lock from "@/assets/icons/lock.svg";
import Minimize from "@/assets/icons/arrows-minimize.svg";
import Movie from "@/assets/icons/movie.svg";
import Music from "@/assets/icons/music.svg";
import Notebook from "@/assets/icons/notebook.svg";
import Palette from "@/assets/icons/palette.svg";
import Pencil from "@/assets/icons/pencil.svg";
import Pin from "@/assets/icons/pin.svg";
import Plane from "@/assets/icons/plane.svg";
import Plus from "@/assets/icons/plus.svg";
import RefreshCcw from "@/assets/icons/refresh.svg";
import Rocket from "@/assets/icons/rocket.svg";
import RotateCcw from "@/assets/icons/rotate.svg";
import Search from "@/assets/icons/search.svg";
import Send from "@/assets/icons/send.svg";
import Settings from "@/assets/icons/settings.svg";
import Share from "@/assets/icons/share.svg";
import Shield from "@/assets/icons/shield.svg";
import ShieldCheck from "@/assets/icons/shield-check.svg";
import Sparkle from "@/assets/icons/sparkle.svg";
import Sparkles from "@/assets/icons/sparkles.svg";
import Star from "@/assets/icons/star.svg";
import Tag from "@/assets/icons/tag.svg";
import Trash from "@/assets/icons/trash.svg";
import Typography from "@/assets/icons/typography.svg";
import Upload from "@/assets/icons/upload.svg";
import User from "@/assets/icons/user.svg";
import X from "@/assets/icons/x.svg";

export const Icons = {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Bolt,
  Book,
  Bot,
  Brain,
  Briefcase,
  Calendar,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Code,
  Copy,
  Database,
  DeviceFloppy,
  DotsVertical,
  Download,
  Expand,
  Eye,
  EyeOff,
  Feather,
  File,
  FilePlus,
  FileText,
  Files,
  Flag,
  GraduationCap,
  Heart,
  History,
  Home,
  Info,
  Key,
  LayoutGrid,
  Lightbulb,
  List,
  ListCheck,
  Loader,
  Lock,
  Minimize,
  Movie,
  Music,
  Notebook,
  Palette,
  Pencil,
  Pin,
  Plane,
  Plus,
  RefreshCcw,
  Rocket,
  RotateCcw,
  Search,
  Send,
  Settings,
  Share,
  Shield,
  ShieldCheck,
  Sparkle,
  Sparkles,
  Star,
  Tag,
  Trash,
  Typography,
  Upload,
  User,
  X,
};

export type IconName = keyof typeof Icons;
export type IconComponent = FC<SVGProps<SVGSVGElement>>;

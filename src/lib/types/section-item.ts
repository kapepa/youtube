import { LucideIcon } from "lucide-react";
import { ROUTERS } from "../routers";

export interface SectionItemInt {
  url: ROUTERS,
  icon: LucideIcon,
  auth?: boolean,
  title: string,
}

export interface SectionPersonInt extends SectionItemInt { }
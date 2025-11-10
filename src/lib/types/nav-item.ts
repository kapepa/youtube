import { LucideIcon } from "lucide-react";
import { ROUTERS } from "../routers";

export interface NavItemInt {
  url: ROUTERS,
  icon: LucideIcon,
  auth?: boolean,
  title: string,
}
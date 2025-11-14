import { useIsMobile } from "@/hooks/use-mobile";
import { FC, ReactNode } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "./ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface ResponsiveModalProps {
  open: boolean,
  title: string,
  children: ReactNode,
  onOpenChange: (open: boolean) => void,
}

const ResponsiveModal: FC<ResponsiveModalProps> = (props) => {
  const { open, title, children, onOpenChange } = props;
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
      >
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {title}
            </DrawerTitle>
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export { ResponsiveModal }
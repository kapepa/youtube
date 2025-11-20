import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FC } from "react";

interface SubscriptionButtonProps {
  size?: ButtonProps["size"],
  onClick: ButtonProps["onClick"],
  disabled: boolean,
  className?: string,
  isSubscribed: boolean,
}

const SubscriptionButton: FC<SubscriptionButtonProps> = (props) => {
  const { size, onClick, disabled, className, isSubscribed } = props;

  return (
    <Button
      size={size}
      onClick={onClick}
      variant={isSubscribed ? "secondary" : "default"}
      disabled={disabled}
      className={cn("rounded-full", className)}
    >
      {isSubscribed ? "Unsubscribe" : "Subscribe"}
    </Button>
  )
}

export { SubscriptionButton }
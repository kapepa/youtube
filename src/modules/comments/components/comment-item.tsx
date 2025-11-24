import { FC } from "react";
import { CommentsGetManyOutput } from "../types";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns"
import { trpc } from "@/trpc/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, MoreVertical, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number],
}

const CommentItem: FC<CommentItemProps> = (props) => {
  const { comment } = props;
  const clerk = useClerk();
  const { userId } = useAuth();
  const utils = trpc.useUtils();
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");
      utils.comments.getMany.invalidate({
        videoId: comment.videoId
      })
    },
    onError: (error) => {
      toast.error("Something went wrong");
      if (error.data?.code === "UNAUTHORIZED") clerk.openSignIn();
    },
  });

  return (
    <div>
      <div
        className="flex gap-4"
      >
        <Link
          href={`${ROUTERS.USER}/${comment.userId}`}
        >
          <UserAvatar
            size="lg"
            name={comment.user.name}
            imageUrl={comment.user.imageUrl}
          />
        </Link>
        <div
          className="flex-1 min-w-0"
        >
          <Link
            href={`${ROUTERS.USER}/${comment.userId}`}
          >
            <div
              className="flex items-center gap-2 mb-0.5"
            >
              <span
                className="font-medium text-sm pb-0.5"
              >
                {comment.user.name}
              </span>
              <span
                className="text-xs text-muted-foreground"
              >
                {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
              </span>
            </div>
          </Link>
          <p
            className="text-sm"
          >
            {comment.value}
          </p>
        </div>
        <DropdownMenu
          modal={false}
        >
          <DropdownMenuTrigger
            asChild
          >
            <Button
              size="icon"
              variant="ghost"
              className="size-8"
            >
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
          >
            <DropdownMenuItem
              onClick={() => { }}
            >
              <MessageSquareIcon
                className="size-4"
              />
              Reply
            </DropdownMenuItem>
            {
              comment.user.clerkId === userId
              && (
                <DropdownMenuItem
                  onClick={() => remove.mutate({ id: comment.id })}
                >
                  <Trash2Icon
                    className="size-4"
                  />
                  Delete
                </DropdownMenuItem>
              )
            }
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export { CommentItem }
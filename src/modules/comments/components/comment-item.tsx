import { FC } from "react";
import { CommentsGetManyOutput } from "../types";
import Link from "next/link";
import { ROUTERS } from "@/lib/routers";
import { UserAvatar } from "@/components/user-avatar";
import { formatDistanceToNow } from "date-fns"

interface CommentItemProps {
  comment: CommentsGetManyOutput[number],
}

const CommentItem: FC<CommentItemProps> = (props) => {
  const { comment } = props;

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
      </div>
    </div>
  )
}

export { CommentItem }
"use client"

import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

interface PlaylistCreateModalProps {
  open: boolean,
  onOpenChange: (open: boolean) => void,
}

const formSchema = z.object({
  name: z.string().min(1),
})

const PlaylistCreateModal: FC<PlaylistCreateModalProps> = (props) => {
  const { open, onOpenChange } = props;
  const utils = trpc.useUtils();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ""
    }
  });

  const create = trpc.playlists.create.useMutation({
    onSuccess: () => {
      utils.playlists.getMany.invalidate();
      toast.success("Playlist created");
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Something went wrong")
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    create.mutate(values);
  }

  return (
    <ResponsiveModal
      open={open}
      title="Create a palylist"
      onOpenChange={onOpenChange}
    >
      <Form
        {...form}
      >
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="My favorite videos"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div
            className="flex justify-end"
          >
            <Button
              type="submit"
              disabled={create.isPending}
            >
              Create
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  )
}

export { PlaylistCreateModal }
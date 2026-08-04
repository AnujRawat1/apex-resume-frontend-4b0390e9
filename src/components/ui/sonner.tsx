import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      duration={2600}
      gap={10}
      offset={16}
      toastOptions={{
        classNames: {
          toast:
            "group toast !w-auto !min-w-[220px] !max-w-[340px] !gap-2 !rounded-2xl !px-3.5 !py-2.5 group-[.toaster]:border-border group-[.toaster]:bg-card/85 group-[.toaster]:text-foreground group-[.toaster]:shadow-lg group-[.toaster]:backdrop-blur-xl",
          title: "!text-[13px] !font-medium",
          description: "!text-[12px] group-[.toast]:text-muted-foreground",
          icon: "!size-4",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };

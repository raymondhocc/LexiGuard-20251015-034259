import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// Sidebar Context
interface SidebarContextProps {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}
const SidebarContext = React.createContext<SidebarContextProps | undefined>(
  undefined
)
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
// Sidebar Provider
export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(!isMobile)
  React.useEffect(() => {
    setIsOpen(!isMobile)
  }, [isMobile])
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}
// Sidebar
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isMobile } = useSidebar()
  if (isMobile) {
    return null
  }
  return (
    <div
      ref={ref}
      data-state={isOpen ? "open" : "closed"}
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16",
        className
      )}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"
// Sidebar Inset
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isMobile } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-300 ease-in-out",
        !isMobile && (isOpen ? "lg:ml-64" : "lg:ml-16"),
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"
// Sidebar Header
const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar()
  return (
    <div
      ref={ref}
      className={cn(
        "h-16 flex items-center border-b",
        isOpen ? "px-4" : "px-0 justify-center",
        className
      )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"
// Sidebar Content
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"
// Sidebar Footer
const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 border-t", className)} {...props} />
))
SidebarFooter.displayName = "SidebarFooter"
// Sidebar Menu
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => {
  const { isOpen } = useSidebar()
  return (
    <ul
      ref={ref}
      className={cn("space-y-1", isOpen ? "p-2" : "p-2", className)}
      {...props}
    />
  )
})
SidebarMenu.displayName = "SidebarMenu"
// Sidebar Menu Item
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("", className)} {...props} />
))
SidebarMenuItem.displayName = "SidebarMenuItem"
// Sidebar Menu Button Variants
const sidebarMenuButtonVariants = cva("w-full justify-start", {
  variants: {
    variant: {
      default:
        "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90",
      outline:
        "border border-sidebar-border bg-transparent hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      primary:
        "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
      ghost: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})
// Sidebar Menu Button
export interface SidebarMenuButtonProps
  extends Omit<ButtonProps, "variant">,
    VariantProps<typeof sidebarMenuButtonVariants> {}
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, variant, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className={cn(sidebarMenuButtonVariants({ variant }), className)}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"
// Sidebar Trigger
function SidebarTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>): JSX.Element {
  const { isMobile, isOpen, setIsOpen } = useSidebar()
  if (!isMobile) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={cn("hidden lg:flex", className)}
        {...props}
      >
        <span className="sr-only">Toggle Sidebar</span>
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
      </Button>
    )
  }
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("lg:hidden", className)}
          {...props}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" x2="21" y1="6" y2="6" />
            <line x1="3" x2="21" y1="12" y2="12" />
            <line x1="3" x2="21" y1="18" y2="18" />
          </svg>
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        {props.children}
      </SheetContent>
    </Sheet>
  )
}
export {
  Sidebar,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
}
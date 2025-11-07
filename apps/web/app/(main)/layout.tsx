import {AppSidebar} from "@/components/main/sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@scrutis/ui/components/sidebar";
import { Separator } from "@scrutis/ui/components/separator";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return( 
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <span>Dashboard</span>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
 ) 
}

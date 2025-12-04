"use client"

import dynamic from "next/dynamic"

// Lazy load heavy UI components that are only used in specific routes
export const LazyCommand = dynamic(() => import("@/components/ui/command").then((mod) => ({ default: mod.Command })))
export const LazyCommandDialog = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandDialog }))
)
export const LazyCommandInput = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandInput }))
)
export const LazyCommandList = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandList }))
)
export const LazyCommandEmpty = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandEmpty }))
)
export const LazyCommandGroup = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandGroup }))
)
export const LazyCommandItem = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandItem }))
)
export const LazyCommandSeparator = dynamic(() =>
  import("@/components/ui/command").then((mod) => ({ default: mod.CommandSeparator }))
)

// Lazy load heavy form components
export const LazySelect = dynamic(() => import("@/components/ui/select").then((mod) => ({ default: mod.Select })))
export const LazySelectContent = dynamic(() =>
  import("@/components/ui/select").then((mod) => ({ default: mod.SelectContent }))
)
export const LazySelectItem = dynamic(() =>
  import("@/components/ui/select").then((mod) => ({ default: mod.SelectItem }))
)
export const LazySelectTrigger = dynamic(() =>
  import("@/components/ui/select").then((mod) => ({ default: mod.SelectTrigger }))
)
export const LazySelectValue = dynamic(() =>
  import("@/components/ui/select").then((mod) => ({ default: mod.SelectValue }))
)

// Lazy load heavy data display components
// Note: Table components not available, removed to avoid build errors
// export const LazyTable = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.Table })))
// export const LazyTableBody = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.TableBody })))
// export const LazyTableCell = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.TableCell })))
// export const LazyTableHead = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.TableHead })))
// export const LazyTableHeader = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.TableHeader })))
// export const LazyTableRow = dynamic(() => import("@/components/ui/table").then(mod => ({ default: mod.TableRow })))

// Lazy load heavy layout components
export const LazyTabs = dynamic(() => import("@/components/ui/tabs").then((mod) => ({ default: mod.Tabs })))
export const LazyTabsContent = dynamic(() =>
  import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsContent }))
)
export const LazyTabsList = dynamic(() => import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsList })))
export const LazyTabsTrigger = dynamic(() =>
  import("@/components/ui/tabs").then((mod) => ({ default: mod.TabsTrigger }))
)

// Lazy load heavy overlay components
export const LazyDialog = dynamic(() => import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog })))
export const LazyDialogContent = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogContent }))
)
export const LazyDialogDescription = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogDescription }))
)
export const LazyDialogHeader = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogHeader }))
)
export const LazyDialogTitle = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle }))
)
export const LazyDialogTrigger = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTrigger }))
)
export const LazyDialogFooter = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogFooter }))
)
export const LazyDialogClose = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogClose }))
)

// Lazy load heavy navigation components
export const LazyDropdownMenu = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenu }))
)
export const LazyDropdownMenuContent = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuContent }))
)
export const LazyDropdownMenuItem = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuItem }))
)
export const LazyDropdownMenuLabel = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuLabel }))
)
export const LazyDropdownMenuSeparator = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuSeparator }))
)
export const LazyDropdownMenuTrigger = dynamic(() =>
  import("@/components/ui/dropdown-menu").then((mod) => ({ default: mod.DropdownMenuTrigger }))
)

// Lazy load heavy feedback components
// Note: AlertDialog components not available, removed to avoid build errors
// export const LazyAlertDialog = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialog })))
// export const LazyAlertDialogAction = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogAction })))
// export const LazyAlertDialogCancel = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogCancel })))
// export const LazyAlertDialogContent = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogContent })))
// export const LazyAlertDialogDescription = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogDescription })))
// export const LazyAlertDialogFooter = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogFooter })))
// export const LazyAlertDialogHeader = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogHeader })))
// export const LazyAlertDialogTitle = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogTitle })))
// export const LazyAlertDialogTrigger = dynamic(() => import("@/components/ui/alert-dialog").then(mod => ({ default: mod.AlertDialogTrigger })))

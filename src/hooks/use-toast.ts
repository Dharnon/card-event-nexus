
// Re-export the toast hooks from @/components/ui/toast
import { useToast as useToastOriginal } from "@/components/ui/toast";
import { toast as toastOriginal } from "@/components/ui/toast";

// Export the hooks with the correct names
export const useToast = useToastOriginal;
export const toast = toastOriginal;

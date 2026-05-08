import * as LabelPrimitive from '@radix-ui/react-label'
import { cn } from '@/lib/utils'

interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {}

export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelPrimitive.Root
      className={cn('text-sm font-medium leading-none text-gray-700', className)}
      {...props}
    />
  )
}

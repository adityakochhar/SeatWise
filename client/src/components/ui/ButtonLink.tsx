import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './Button'

interface ButtonLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}

export function ButtonLink({ variant = 'primary', size = 'md', block = false, className, ...rest }: ButtonLinkProps) {
  return <Link className={cn(buttonClasses(variant, size, block), className)} {...rest} />
}

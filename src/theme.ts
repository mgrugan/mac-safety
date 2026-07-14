import { useEffect, useState } from 'react'
import type { ThemePref } from './store'

export type Effective = 'light' | 'dark'

export function useEffectiveTheme(pref: ThemePref): Effective {
  const [systemDark, setSystemDark] = useState(() =>
    typeof matchMedia !== 'undefined'
      ? matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  )

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSystemDark(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  if (pref === 'system') return systemDark ? 'dark' : 'light'
  return pref
}

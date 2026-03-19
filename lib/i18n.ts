import { getRequestConfig } from 'next-intl/server'

export type Locale = 'ar' | 'en'
export const locales: Locale[] = ['ar', 'en']
export const defaultLocale: Locale = 'ar'

export default getRequestConfig(async ({ locale }) => {
  const safeLocale: string = locales.includes(locale as Locale) ? (locale as string) : defaultLocale
  return {
    locale: safeLocale,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    messages: require(`../../messages/${safeLocale}.json`) as Record<string, unknown>,
  }
})

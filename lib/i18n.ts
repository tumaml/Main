import { getRequestConfig } from 'next-intl/server'

export type Locale = 'ar' | 'en'
export const locales: Locale[] = ['ar', 'en']
export const defaultLocale: Locale = 'ar'

export default getRequestConfig(async ({ locale }) => {
  const safeLocale = locales.includes(locale as Locale) ? locale : defaultLocale
  return {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    messages: require(`../../messages/${safeLocale}.json`) as Record<string, unknown>,
  }
})

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Arguments = { params: Promise<{ segments: string[] }>; searchParams: Promise<Record<string, string | string[]>> }
export const generateMetadata = (args: Arguments) => generatePageMetadata({ ...args, config })
export default function CMSPage(args: Arguments) { return RootPage({ ...args, config, importMap }) }

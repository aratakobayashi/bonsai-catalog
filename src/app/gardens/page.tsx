import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MapPin, Globe, Phone, ExternalLink, Users, Calendar } from 'lucide-react'
import { REGIONS, getRegionFromPrefecture, getRegionTheme } from '@/lib/utils'
import type { Garden } from '@/types'
import { GardensPageClient } from './GardensPageClient'

async function getGardens(): Promise<Garden[]> {
  const { data, error } = await supabaseServer
    .from('gardens')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('盆栽園データの取得エラー:', error)
    return []
  }

  return data || []
}


export default async function GardensPage() {
  const gardens = await getGardens()

  return <GardensPageClient gardens={gardens} />
}
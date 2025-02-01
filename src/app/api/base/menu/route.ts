import { NextResponse } from 'next/server'

import apiClient from '@/lib/api'
import type { VerticalMenuDataType } from '@/types/menuTypes'

export async function GET() {
  try {
    const refreshResponse = await apiClient.get('/base/menu')

    if (refreshResponse.status != 200) {
      return NextResponse.json(
        {
          success: true,
          message: 'Get Menu Error '
        },
        { status: refreshResponse.status }
      )
    }

    // Data menu
    const menuData: VerticalMenuDataType[] = refreshResponse.data.data.menu

    // Kirim respons sukses ke client
    return NextResponse.json(
      {
        success: true,
        message: 'Menu data fetched successfully',
        data: menuData
      },
      { status: 200 }
    )
  } catch (error) {
    // Kirim respons error
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch menu data',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

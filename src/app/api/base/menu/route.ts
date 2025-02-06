import { NextResponse } from 'next/server'

import axios from 'axios'

import { auth } from '@/lib/auth'
import type { VerticalMenuDataType } from '@/types/menuTypes'

export async function GET() {
  try {
    const session = await auth()
    const accessToken = session?.accessToken

    if (!accessToken) {
      return NextResponse.json({ success: false, message: 'Authorization token missing' }, { status: 401 })
    }

    // Menentukan bahwa 401 & 403 tidak dianggap error
    const menuResponse = await axios.get(`${process.env.API_BASE_URL}/base/menu`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      validateStatus: status => status < 500 // Status <500 dianggap sukses (termasuk 401 & 403)
    })

    if (menuResponse.status === 401) {
      return NextResponse.json(
        { success: false, message: 'Session expired, please login again' },
        { status: menuResponse.status }
      )
    }

    if (menuResponse.status === 403) {
      return NextResponse.json(
        { success: false, message: `You don't have permission to access!` },
        { status: menuResponse.status }
      )
    }

    const menuData: VerticalMenuDataType[] = menuResponse.data.data.menu

    return NextResponse.json(
      { success: true, message: 'Menu data fetched successfully', data: menuData },
      { status: 200 }
    )
  } catch (error) {
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

import { NextResponse } from 'next/server'

import axios from 'axios'

import { auth } from '@/lib/auth'
import type { MenuDataType } from '@/types/settings/menuTypes'

export async function GET() {
  try {
    const session = await auth()

    // Ambil token JWT dari session atau mekanisme lainnya
    const accessToken = session?.accessToken

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authorization token missing'
        },
        { status: 401 }
      )
    }

    const menuResponse = await axios.get(`${process.env.API_BASE_URL}/settings/menu`, {
      headers: {
        Authorization: `Bearer ${accessToken}` // Token di header
      }
    })

    if (menuResponse.status != 200) {
      return NextResponse.json(
        {
          success: true,
          message: 'Get Menu Error '
        },
        { status: menuResponse.status }
      )
    }

    // Data menu
    const menuData: MenuDataType[] = menuResponse.data.data.menu

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

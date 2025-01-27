import { NextResponse } from 'next/server'

import type { VerticalMenuDataType } from '@/types/menuTypes'

export async function GET() {
  try {
    // Data menu
    const menuData: VerticalMenuDataType[] = [
      {
        label: 'Dashboards & Apps',
        isSection: true,
        children: [
          {
            label: 'Dashboards',
            children: [
              {
                label: 'Analytics'
              },
              {
                label: 'eCommerce'
              }
            ]
          },
          {
            label: 'Calendar'
          }
        ]
      },
      {
        label: 'Others',
        isSection: true,
        children: [
          {
            label: 'FAQ'
          },
          {
            label: 'Menu Level',
            children: [
              {
                label: 'Menu Level 2.1'
              },
              {
                label: 'Menu Level 2.2',
                children: [
                  {
                    label: 'Menu Level 3.1'
                  },
                  {
                    label: 'Menu Level 3.2'
                  }
                ]
              }
            ]
          },
          {
            label: 'Documentation'
          }
        ]
      }
    ]

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
    console.error('Error fetching menu data:', error)

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

'use client'

import { useEffect, useState } from 'react'

import MenuList from '@views/settings/menu'

const MenuListPage = () => {
  // Vars
  const [menuData, setMenuData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/settings/menu`) // Panggil API Route Next.js
      const data = await res.json()

      if (data.success) {
        setMenuData(data.data)
      }
    }

    fetchData()
  }, [])

  return <MenuList menuData={menuData} />
}

export default MenuListPage

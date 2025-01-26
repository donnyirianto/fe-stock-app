'use client'

import { useState } from 'react'

import { useSession, signOut } from 'next-auth/react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

export default function Page() {
  const { data: session, status } = useSession()
  const [open, setOpen] = useState(false)

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSignOut = async () => {
    setOpen(false) // Close dialog first
    await signOut() // Perform logout
  }

  // Cek status autentikasi saat ini
  if (status === 'loading') {
    return <p>Loading...</p> // Menunggu session selesai dimuat
  }

  if (status === 'unauthenticated') {
    return <p>You need to log in first.</p>
  }

  if (!session?.user) return null

  return (
    <div className='flex flex-col items-center justify-center min-h-screen'>
      <h1 className='text-2xl font-bold'>Home Page</h1>
      <p className='mt-4 text-lg'>Welcome, {session.user.name}!</p>
      <p className='mt-2 text-sm'>Email: {session.user.email}</p>
      <Button variant='contained' color='error' className='mt-6' onClick={handleOpen}>
        Sign Out
      </Button>

      {/* Dialog for confirmation */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby='logout-dialog-title'
        aria-describedby='logout-dialog-description'
      >
        <DialogTitle id='logout-dialog-title'>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText id='logout-dialog-description'>Are you sure you want to log out?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color='primary'>
            Cancel
          </Button>
          <Button onClick={handleSignOut} color='error' autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

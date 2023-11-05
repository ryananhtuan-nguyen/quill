'use client'

import { useState } from 'react'
import { Dialog, DialogTrigger } from './ui/dialog'
import { Button } from './ui/button'
import { Expand } from 'lucide-react'

const PdfFullScreen = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) setIsOpen(v)
      }}
    >
      <DialogTrigger asChild>
        <Button aria-label="fullscreen" variant="ghost">
          <Expand className="h-4 w-4" />
        </Button>
      </DialogTrigger>
    </Dialog>
  )
}

export default PdfFullScreen

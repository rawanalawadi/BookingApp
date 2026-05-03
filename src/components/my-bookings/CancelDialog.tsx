"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  consultantName: string
  onConfirm: () => void
}

export default function CancelDialog({ open, onOpenChange, consultantName, onConfirm }: Props) {
  const [loading, setLoading] = useState(false)

  function handleConfirm() {
    setLoading(true)
    onConfirm()
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Cancel booking?</DialogTitle>
          <DialogDescription className="text-gray-500 pt-1">
            Are you sure you want to cancel your session with{" "}
            <span className="font-semibold text-gray-700">{consultantName}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Keep Booking
          </Button>
          <Button
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

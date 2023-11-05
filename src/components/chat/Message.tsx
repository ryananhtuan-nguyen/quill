import { cn } from '@/libs/utils'
import { ExtendedMessage } from '@/types/message'
import React from 'react'

interface MessageProps {
  message: ExtendedMessage
  isNextMessageSamePerson: boolean
}

const Message = ({ message, isNextMessageSamePerson }: MessageProps) => {
  return <div className={cn('flex items-end')}></div>
}

export default Message

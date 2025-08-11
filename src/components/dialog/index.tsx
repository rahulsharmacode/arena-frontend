import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { cn } from '@/lib/utils'

type Props = { title: string, open: boolean | string, onClose: (e: string | boolean) => void, [key: string]: any }

const CustomDialog: React.FC<Props> = ({ open, onClose, title, children,...props }) => {
    return (<>

        <Dialog open={open as boolean} onOpenChange={(e) => onClose(e)}>
            <DialogContent className={cn(["sm:max-w-md",props.className])}>
                <DialogHeader>
                    {title && <DialogTitle>
                        {title}
                    </DialogTitle>}
                </DialogHeader>
                <div className="max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </DialogContent>
        </Dialog>

    </>)
}

export default CustomDialog
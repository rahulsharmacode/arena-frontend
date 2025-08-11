import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
    img?: string,
    title?:string|React.ReactElement,
    [key:string]:any
}

const EmptyData:React.FC<Props> = ({img="/images/nodata.png",title="No Conversations Yet",...props}) => {
  return (
   <div className={cn(["flex flex-col items-center select-none",props.mainClass])}>
                        <img src={img} alt="no-data" className={cn(['max-h-[300px] max-w-[300px]',props.imgClass])} />
                      <h3 className={cn(["text-lg font-medium mb-2",props.textClass])}>{title}</h3>
                    </div> 
  )
}

export default EmptyData
import React from 'react'

type Props = {message:string}

const ErrorLabel:React.FC<Props> = ({message}) => {
  return (
    <p className='text-red-500 text-[12px] font-semibold'>{message}</p>
  )
}

export default ErrorLabel

import React, { ReactNode } from 'react'
import { Header } from './header'

function layout({children}:{children:ReactNode}) {
  return (
    <div>
      <Header/>
      {children}
    </div>
  )
}

export default layout

import React, { useEffect } from 'react'
import { useNavigate } from "react-router"
import { useAuth } from '../Hooks/Auth/useAuth'

type Props = {
    children : React.ReactNode
}


export default function ProtectRoute({children} : Props) {
    const { user } = useAuth()
    const Navigate = useNavigate()

    useEffect(()=>{
        if (!user) {
            Navigate("/login")
        }
    }, [user,Navigate])


  return children;
}

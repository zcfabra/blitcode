import { NextPage, NextPageContext } from 'next'
import React from 'react'

const Room: NextPage = ({id}) => {
  return (
    <div>{id}</div>
  )
}

export async function getServerSideProps({query}:NextPageContext){
    console.log(query);

    // const res = await fetch("/api/newroom").then(res=>res.json())
    // console.log(res);

    return {props:{
        id: query.id
    }}
}

export default Room
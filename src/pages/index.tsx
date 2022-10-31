import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });

  const router = useRouter();

  return (
    <>
    <div className="w-full h-screen bg-black text-purple-500 flex flex-col items-center justify-start pt-48">
      <h1 className="font-bold text-9xl">BlitCode</h1>
      <button onClick={()=>router.push("/newroom")}className="mt-16 bg-gradient-to-r from-purple-500 to-orange-500 w-96 h-24 rounded-md text-white text-3xl font-light hover:scale-110">Start</button>

    </div>
    </>)};


export default Home;

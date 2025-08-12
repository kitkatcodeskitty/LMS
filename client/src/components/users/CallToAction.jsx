import React from 'react'
import { assets } from '../../assets/assets'

const CallToAction = () => {
  return (
<div className="flex justify-center items-center  w-full px-2 md:px-16">
      <div className="relative text-center rounded-xl w-full bg-[url('https://www.tailwindtap.com/assets/components/marketing-campaign/moutain.jpg')] bg-cover bg-no-repeat bg-center py-10 md:py-24">
        <div className="absolute bottom-0 left-0 right-0 top-0 h-full w-full bg-fixed opacity-80 bg-black rounded-xl"></div>
        <div className="z-10 relative flex h-full items-center justify-center">
          <div className="text-white max-w-sm px-5 md:px-0 flex flex-col gap-5">
            <h2 className="mb-4 text-3xl md:text-5xl font-semibold leading-tight">
              Start Your Journey and Live Your Life
            </h2>
            <button
              type="button"
              className="rounded border-2 border-neutral-50 py-2 text-sm font-medium uppercase leading-normal text-neutral-50 transition duration-150 ease-in-out hover:border-neutral-100 hover:bg-neutral-500 hover:bg-opacity-10 hover:text-neutral-100 focus:border-neutral-100 focus:text-neutral-100 focus:outline-none focus:ring-0 active:border-neutral-200 active:text-neutral-200 dark:hover:bg-neutral-100 dark:hover:bg-opacity-10"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>

  )
}

export default CallToAction
import React from 'react'
import { element } from 'three/tsl'

const HelpCard = ({title, description}) => {
  return (
    <div className="w-80 h-full border-black border-2 rounded-md hover:shadow-[8px_8px_0px_rgba(0,0,0,1)] bg-white">
      <a href="" className="block cursor-pointer">
          <article className="w-full h-full">
              <div className="px-6 py-5 text-left h-full">
              <h1 className="text-[32px] mb-4">{title}</h1>
              <p className="text-xs mb-4 line-clamp-4">
                {description}
              </p>
              <strong>Read More</strong>
              </div>
          </article>
      </a>
    </div>
  )
}

const helpData = [
  {title:"Something1", description:"lorem1"},
  {title:"Something2", description:"lorem2"},
  {title:"Something3", description:"lorem3"}
]

function Help() {
  return (
    <section className='flex gap-2 lg:flex-row flex-col'>
      {helpData.map((element) => (<HelpCard key={element.title} title={element.title} description={element.description} />))}
    </section>
  )
}

export default Help
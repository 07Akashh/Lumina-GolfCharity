'use client'

import React from 'react'
import Image from 'next/image'

interface Story {
  category?: string;
  image_url?: string;
  title?: string;
}

interface ImpactStoriesProps {
  stories?: Story[];
}

export function ImpactStories({ stories }: ImpactStoriesProps) {
  return (
    <div className="space-y-8 pt-10">
       <div className="flex justify-between items-center">
          <div>
             <h2 className="display-md text-[#0a1628] mb-1">Recent Stories</h2>
             <p className="text-[12px] font-medium text-[#94a3b8]">Verified humanitarian yields.</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c81e51] hover:underline underline-offset-8">View Archive</button>
       </div>
       
       {stories && stories.length > 0 ? (
         <div className="grid md:grid-cols-4 gap-6">
            {stories.map((story, i) => (
              <ImpactStoryCard 
                key={i}
                category={story.category?.toUpperCase() || 'IMPACT'} 
                title={story.title || 'Untitled Story'} 
                image={story.image_url || 'https://plus.unsplash.com/premium_photo-1774271492622-2caebba85850?w=900&auto=format&fit=crop&q=60'} 
              />
            ))}
         </div>
       ) : (
         <div className="py-20 text-center card-lumina border-dashed border-[#eceae7] bg-[#fafafc]/50 rounded-[2.5rem]">
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-[#94a3b8]">No humanitarian stories available for this node yet.</p>
         </div>
       )}
    </div>
  )
}

function ImpactStoryCard({ category, title, image }: { category: string; title: string; image: string }) {
   return (
      <div className="group relative h-[320px] rounded-[2rem] overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-700 shadow-xl shadow-black/5">
         <Image 
            src={image} 
            fill 
            alt={title} 
            sizes="(max-width: 768px) 100vw, 25vw" 
            className="object-cover group-hover:scale-110 transition-transform duration-1000" 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/20 to-transparent" />
         <div className="absolute inset-x-6 bottom-6 text-white space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#c81e51]">{category}</p>
            <h4 className="text-base font-black leading-tight">{title}</h4>
         </div>
      </div>
   )
}

import React from 'react';

interface Props {
  src: string;
}

export const VideoContainer = ({src}: Props) => {

  return (
    <div className="video-container">
      <iframe
        width="560"
        height="315"
        src={src}
        frameBorder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen={true}></iframe>
    </div>
  )
}


import React, { useRef, useState, useEffect } from 'react'
import {FaPlay, FaPause, FaBackward, FaForward } from 'react-icons/fa'
import tracks from '../tracks'
import Image from 'next/image'

export default function Home() {

  // Index of the track
  const [tracksIndex, setTracksIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  // current audio
  const audioRef = useRef()
  const firstPausedRef = useRef()
  const progressBarRef = useRef()

  // playlist
  const {title, artist, audio, img} = tracks[tracksIndex]

  useEffect(() => {
    // did this to pause the first track on first load
    if(firstPausedRef.current) {
      play()
    } else {
      firstPausedRef.current = true
    }
  }, [tracksIndex])
  
  useEffect(() => {
    console.log("useEffect on currentTime")
    progressBarRef.current.value = audioRef.current.currentTime
    progressBarRef.current.max = audioRef.current.duration
    // moves knobby to the percentage of the duration 
    progressBarRef.current.style.setProperty('--move-progressBar', `${audioRef.current.currentTime / audioRef.current.duration * 100}%`)
  }, [currentTime])

  // get duration on first load, onLoadedMetadata does not run 
  // on first load
  useEffect(() => {
    setDuration(audioRef.current.duration)
    setCurrentTime(audioRef.current.currentTime)
  }, [])

  const onLoadedMetadata = () => {
    console.log("onLoadedMetadata")
    setCurrentTime(audioRef.current.currentTime)
    setDuration(audioRef.current.duration)
    progressBarRef.current.value = audioRef.current.currentTime
    progressBarRef.current.max = audioRef.current.duration
  }
  
  const togglePlayPause = async() => {
    try {
      const prevState = isPlaying;
      setIsPlaying(!prevState);
      if (!prevState) {
        await play();
      } else {
        await pause();
      }
    } catch (err) {
      console.log('togglePlayPause() failed')
    }
  };

  const play = async() => {
    try{
      setIsPlaying(true)
      audioRef.current.play()
    } catch {
      console.log("play promise failed, retrying...")
    }
  }

  const pause = async() => {
    try {
      setIsPlaying(false)
      audioRef.current.pause()
    } catch {
      console.log("pause promise failed, retrying...")
    }
    
  }

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${returnedMinutes}:${returnedSeconds}`;
  }

  const next = () => {
    if (tracksIndex < tracks.length - 1) {
      setTracksIndex(tracksIndex + 1);
    } else {
      setTracksIndex(0);
    }
  }

  const prev = () => {
    if (tracksIndex -1 < 0) {
      setTracksIndex(tracks.length -1);
    } else {
      setTracksIndex(tracksIndex - 1);
    }
  }

  const onTimeUpdate = ()  => {
    console.log('onTimeUpdate')
    setCurrentTime(audioRef.current.currentTime)
  }

  const onChange = async() => {

    await new Promise((resolve) => {
      if(isPlaying) {
         resolve()
         audioRef.current.currentTime = progressBarRef.current.value
      }
    })
  }


  return (
    <div className="App">
      <audio className="audio"
        ref={audioRef}
        src={audio}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
      ></audio>
      <div className="image-container">
        <Image className="img" 
          height="250"
          width="250"
          src={img} 
          alt={`track art for ${title} by ${artist}`}
        />
      </div>
      <div className="player-container">
      <h4 className="title">{title}</h4>
      <h5 className="artist">{artist}</h5>
      <div className="button-container">
        <button className="prev" onClick={prev}><FaBackward /></button>
        <button 
        className="play" 
        onClick={togglePlayPause}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button className="next" onClick={next}><FaForward /></button>
      </div>
      <input 
      type="range"
      defaultValue="0"
      className="progress-bar"
      ref={progressBarRef}
      onChange={onChange}
      ></input>
      <div className="time-container">
        <h5>{calculateTime(currentTime)}</h5>
        <h5>{calculateTime(duration)}</h5>
      </div>
      </div>
      <h1>vanillajs-to-next</h1>
    </div>
  )
}


import React, { useRef, useState, useEffect } from 'react'
import {FaPlay, FaPause, FaBackward, FaForward, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import tracks from '../tracks'
import Image from 'next/image'

export default function Home() {

  // Index of the track
  const [tracksIndex, setTracksIndex] = useState(0)
  // play() set it to true 
  // pause() and useEffect on tracksIndex set it to false
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  //toggle mute or unMute
  const [isMuted, setIsMuted] = useState(true);

  // current audio
  const audioRef = useRef()
  const firstPausedRef = useRef()
  const progressBarRef = useRef()
  const volume = useRef();
  const loader = useRef()

  // playlist
  const {title, artist, audio, img} = tracks[tracksIndex]

  useEffect(() => {
    setIsPlaying(false)
    // did this to show pause the first track on first load
    if(firstPausedRef.current) {
      play()
    } else {
      firstPausedRef.current = true
    }
  }, [tracksIndex])
  
  useEffect(() => {
    progressBarRef.current.value = audioRef.current.currentTime
    // moves knobby to the percentage of the currentTime to duration
    progressBarRef.current.style.setProperty('--move-progressBar', `${audioRef.current.currentTime / audioRef.current.duration * 100}%`)
  }, [currentTime])
  
  // get duration on first load, onLoadedMetadata does not run 
  // on first load
  useEffect(() => {
    setDuration(audioRef.current.duration)
    setCurrentTime(audioRef.current.currentTime)
    progressBarRef.current.value = audioRef.current.currentTime
  }, [])
  
  const onLoadedMetadata = () => {
    setCurrentTime(audioRef.current.currentTime)
    setDuration(audioRef.current.duration)
    progressBarRef.current.value = audioRef.current.currentTime
    // progressBarRef.current.max = audioRef.current.duration
  }
  
  const togglePlayPause = async() => {
    try {
      const prevState = isPlaying;
      setIsPlaying(!prevState);
      if (!prevState) {
        await play();
      } else {
        pause();
      }
    } catch (err) {
      console.log(err, 'togglePlayPause() failed')
    }
  };
  
  const play = async() => {
    loader.current.style.setProperty('display', 'block')
    let playPromise = audioRef.current.play()
    if(playPromise !== undefined) {
      playPromise.then(_ => {
        setIsPlaying(true)
        progressBarRef.current.max = audioRef.current.duration
        loader.current.style.setProperty('display', 'none')
      })
      .catch(error => {
        console.log(error, 'playPromise failed, retrying..')
      })
    }
  }
  
  const pause = () => {
    audioRef.current.pause()
    setIsPlaying(false)
  }

  const next = async() => {
    if (tracksIndex < tracks.length - 1) {
      setTracksIndex(tracksIndex + 1)
    } else {
      setTracksIndex(0)
    }
  }

  const prev = () => {
    if (tracksIndex -1 < 0) {
      setTracksIndex(tracks.length -1)
    } else {
      setTracksIndex(tracksIndex - 1)
    }
  }

  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60)
    const returnedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`
    const seconds = Math.floor(secs % 60)
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`
    return `${returnedMinutes}:${returnedSeconds}`
  }

  const onTimeUpdate = ()  => {
    setCurrentTime(audioRef.current.currentTime)
  }

  const onChange = async() => {
    //
    if(progressBarRef.current.max == audioRef.current.duration) {
      audioRef.current.currentTime = progressBarRef.current.value
      await play()
    }

  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (!isMuted) {
      audioRef.current.volume = volume.current.value / 100
    } else {
      audioRef.current.volume = 0
    }
  };

  const changeVolume = () => {
    audioRef.current.volume = volume.current.value / 100
  }

  return (
    <div className="App">
      <audio className="audio"
        ref={audioRef}
        src={audio}
        preload="metadata"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={next}
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
        <div className="track-info">
      <h4 className="title">{title} -</h4>
      
      <h4 className="artist">{artist}</h4>
        </div>
      <div className="button-container">
        <div className="next-play-prev">
          <div className="loader" ref={loader}></div>
          <button className="prev" onClick={prev}><FaBackward /></button>
          <button 
          className="play" 
          onClick={togglePlayPause}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>
          <button className="next" onClick={next}><FaForward /></button>
        </div>

        <div className="volume-container">
        <button onClick={toggleMute}>
          {isMuted ? <FaVolumeUp /> : <FaVolumeMute />}
        </button>
        <input 
          type="range"
          className="volume-bar"
          min="0"
          max="100"
          defaultValue="50"
          ref={volume}
          onChange={changeVolume}
          />
      </div>
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
    </div>
  )
}

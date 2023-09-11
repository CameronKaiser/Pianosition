import { useEffect, useRef, useState  } from 'react'
import { pitchClasses, chromaticScale } from "./Globals"
import { Clef                         } from "./Clef"
import { Key                          } from "./PianoKey.tsx"
import { Note                         } from './Note.tsx'
import { NoteComponent                } from "./NoteComponent.tsx"
import { ChordSymbol                  } from './ChordSymbol.tsx'
import { RomanNumeral                 } from './RomanNumeral.tsx'
import { TonalKey                     } from './TonalKey.tsx'   

import './App.css'

    /*  ~ Pianosition ~
    This app is meant to help musicians or anyone interested explore new chord progressions and learn
    the theory behind them. It analyzes chords in both Chord Symbol and Roman Numeral fashion, helping
    theoreticians familiarize themselves with more playing-oriented notation, and helping players 
    familiarize themselves with more analytically-oriented notation. It also serves as a creation hub
    for short chord progressions, making it useful for formulating ideas. Lastly, it serves as an
    educational asset, allowing for fast and easy chord notation and analysis that can then be shared
    online or with cohorts. */

//  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

let pianoKeys = generateKeys();

function App() {

    const [         bars , setBars         ] = useState<Array<Note[]>> (new Array<Note[]>(8).fill([])); //  2D array, 1D = bars, 2D = notes
    const [    useSharps , setUseSharps    ] = useState(false);         //  Current Accidental     (user selected)
    const [     tonalKey , setTonalKey     ] = useState<TonalKey>();    //  Current key            (user selected)
    const [   currentBar , setCurrentBar   ] = useState(0);             //  Focused Bar            (user selected)
    const [      playing , setPlaying      ] = useState(false);         //  Play Status            (user selected)
    const [ playingSpeed , setPlayingSpeed ] = useState(0.5);           //  Playing Speed          (user selected)
    const [     freeMode , setFreeMode     ] = useState(false);         //  Playing Mode           (user selected)
    const [    keyAssist , setKeyAssist    ] = useState(true);          //  Key Assist visual      (user selected)
    const [    maxVolume , setMaxVolume    ] = useState(0.6);           //  Volume                 (user selected)
    const [      keyMode , setKeyMode      ] = useState("major");       //  Key Mode (major/minor) (user selected)
    const [ keySelection , setKeySelection ] = useState(true);          //  Keyboard primed for key selection
    const [     keyJumps , setKeyJumps     ] = useState<number[]>([]);  //  Array storing transient key indexes for key selection animation
    const [   activeKeys , setActiveKeys   ] = useState<number[]>([]);  //  Array storing keys that have finished their selection animation

    const playingRef = useRef(playing);

//  Reset all elements of the chord panel and pause if playing        
    const reset = () => {
        setBars(new Array<Note[]>(8).fill([]));
        setTonalKey(undefined);
        setKeySelection(true);
        setCurrentBar(0);
        setPlaying(false);
    }

//  Turn Key Selection mode on or off
    const handleKeyButton = () => {
        if(keySelection == false){
            setKeySelection(true);
        } else if(tonalKey != undefined) {
            setKeySelection(false);
        }
    }

//  Play if paused, pause if playing
    const alterPlayState = () => {
        if(!playing) {
            setPlaying(true);
        } else {
            setPlaying(false);
        }
    }

//  Whenever the chord changes, play its notes if "playing" is true
//  Additionally, store new value of "playing" as a ref value whenever it changes, so that setTimeout functions don't get stale values
    useEffect(() => {
        playingRef.current = playing;
        if(playing == true) {
            if(currentBar != 0) {
                setCurrentBar(0);
            } else{
            //  Mute all playing notes
                for(let note of bars[0]) {
                    if(note.audio.paused == false){
                        fadeOut(note.audio, 100);
                    }
                }

                setTimeout(() => {
                    play();
                }, 175);
            }
        }
     }, [playing]);

//  Initiate the play method when the user hits the play button
    useEffect(() => {
        if(playing == true) {
            play();
        }
    }, [currentBar]);

//  Iterate through all chords at the speed set by the user. Uses ref value of "playing" so as to avoid stale value
    const play = () => {
        if(playing == true) {
        //  If audio is playing, mute it and delay the chord audio
            //let delay = 0;

        //  Mute all playing notes
            for(let bar of bars){
                for(let note of bar) {
                    if(note.audio.paused == false){
                        fadeOut(note.audio, 100);
                        //delay = 150;
                    }
                }
            }
    
        //  Mute all playing keys
            for(let pianoKey of pianoKeys) {
                if(pianoKey.audio.paused == false){
                    fadeOut(pianoKey.audio, 100);
                    //delay = 150;
                }
            }

            //setTimeout(() => {
                if(playingRef.current == true) {
                    for(let note of bars[currentBar]) {
                        note.audio.currentTime = 0;
                        note.audio.volume = maxVolume
                        note.audio.play();
                    }

                //  If more chords remain and the user has not paused, move to the next bar after waiting
                    setTimeout(() => {
                        if(currentBar == 7) {
                            setPlaying(false);
                        } else if(playingRef.current == true) {
                            setCurrentBar(currentBar + 1);
                        }
                    }, 3500 - (playingSpeed * 3000))
                }
            //}, delay)
        }
    }

//  User button press switches between Major and Minor, impacting the key signature
    const switchMode = () => {
        let newMode = "";   //  Transient variable used to get around async state updates

        if(keyMode  == "major") {
            setKeyMode("minor");
            newMode  = "minor";
        } else {
            setKeyMode("major");
            newMode  = "major";
        }

        if(tonalKey != undefined) {
            let newTonalKey = new TonalKey(tonalKey.tonic, tonalKey.tonicChromaticIndex, newMode);
            setTonalKey (newTonalKey);
            setUseSharps(newTonalKey.sharps);
        }
    }

//  Sets tonalKey and animates the keyboard. Also changes the current accidental if intuitive for the key
    const selectKey = (tonic: string, tonicChromaticIndex: number, index: number) => {

        setActiveKeys([]);

        setActiveKeys([index]);

        for(let i = 1; i < Math.max(index + 1, 48 - index); i++){
            setTimeout(() => {
                let keysToJump: number[] = [];
                setActiveKeys(prevActiveKeys => {
                    let updatedActiveKeys = [...prevActiveKeys];
                    if(index - i >= 0) {
                        keysToJump.push(index - i);
                        updatedActiveKeys.push(index - i);
                    }
                    if(index + i < 48) {
                        keysToJump.push(index + i);
                        updatedActiveKeys.push(index + i);
                    }

                    return updatedActiveKeys;
                });

                setKeyJumps(keysToJump);

                if((index + 1 > 48 - index && i == index) || (48 - index > index + 1 && i == 48 - index - 1)) {
                    setKeyJumps([]);
                }

            }, 22 * i - Math.pow(i, 1.6))
        }

        let newKey = new TonalKey(tonic, tonicChromaticIndex, keyMode);

        setUseSharps(newKey.sharps);
        setTonalKey(newKey)
        setKeySelection(false)

    }

//  Add a note to the current bar
    const addNote = (pitchClass: string, octave: number, chromaticIndex: number, audio: HTMLAudioElement) => {
        let updatedNotes = [...bars[currentBar], new Note(pitchClass, octave, 0, chromaticIndex, tonalKey as TonalKey, new Audio(audio.src))];

        updatedNotes = updatedNotes.sort((noteA, noteB) => noteA.index - noteB.index);

    //  Iterate through array to assign offsets in cases of close proximity
        let noteIndex = 0;

        for(let note of updatedNotes){
            if(noteIndex + 1 < updatedNotes.length){
                let nextNote = updatedNotes[noteIndex + 1];

                if(Math.min((7 - Math.abs(nextNote.letterIndex - note.letterIndex) % 7), Math.abs(nextNote.letterIndex - note.letterIndex)) <= 1 && Math.abs(nextNote.index - note.index) < 3) {
                    if(note.offset == 0) {
                          nextNote.offset = 1;
                    } else {
                        if(noteIndex > 0 && updatedNotes[noteIndex - 1].pitchClass == note.pitchClass) {
                            nextNote.offset = 2;
                        } else {
                            nextNote.offset = 0
                        }
                    }
                } 
            }

            noteIndex++;
        }

        updatedNotes = updatedNotes.sort((noteA, noteB) => noteA.index - noteB.index)
        let updatedBars = [...bars];
        updatedBars[currentBar] = updatedNotes;

        setBars(updatedBars);
    }

//  Add a fading property to the given note, deleting it after the fade has completed
    const deleteNote = (pitchClass: string, octave: number, chromaticIndex: number) => {

        let updatedNotes = [...bars[currentBar]];
        
        let terminatedNote = updatedNotes.find(note => note.chromaticIndex == chromaticIndex && note.octave == octave);

        if(terminatedNote == undefined) {
            return;
        }

        terminatedNote.terminated = true;

        setBars(prevBars => {
            let updatedBars = [...prevBars];
            updatedBars[currentBar] = updatedNotes;
            return updatedBars;
        });

        setTimeout(() => {
            updatedNotes = [...bars[currentBar]].filter(note => note.chromaticIndex != chromaticIndex || note.octave != octave);
        
            if(updatedNotes.length != 0){
                updatedNotes[0].offset = 0;
    
                let noteIndex = 0;
                for(let note of updatedNotes){
                    if(noteIndex + 1 < updatedNotes.length){
                        let nextNote = updatedNotes[noteIndex + 1];
                        let nextNoteLetterIndex = pitchClasses.indexOf(nextNote.pitchClass);
                        let noteLetterIndex     = pitchClasses.indexOf(note    .pitchClass)
          
                        if(Math.min((7 - Math.abs(nextNoteLetterIndex - noteLetterIndex) % 7), Math.abs(nextNoteLetterIndex - noteLetterIndex)) <= 1 && Math.abs(nextNote.index - note.index) < 3) {
                            if(note.offset == 0) {
                                nextNote.offset = 1;
                            } else {
                                if(noteIndex > 0 && updatedNotes[noteIndex - 1].pitchClass == note.pitchClass) {
                                    nextNote.offset = 2;
                                } else {
                                    nextNote.offset = 0;
                                }
                            }
                        } else {
                            nextNote.offset = 0;
                        }
                    }
                    noteIndex++;
                }
            }

            setBars(prevBars => {
                let updatedBars = [...prevBars];
                updatedBars[currentBar] = updatedNotes;
                return updatedBars;
            });

        }, 200);
    }

//  Switch between Sharps and Flats
    const changeAccidental = () => {
        setUseSharps(!useSharps);
    }

//  Focus the next bar
    const incrementBar = () => {
        setPlaying(false);
        if(currentBar < 7) {
            let originalBar = currentBar;
            let nextBar = currentBar + 1
            setCurrentBar(nextBar);

            for(let note of bars[originalBar]) {
                if(note.audio.paused == false){
                    fadeOut(note.audio, 100);
                }
            }

            for(let pianoKey of pianoKeys) {
              if(pianoKey.audio.paused == false){
                  fadeOut(pianoKey.audio, 100);
              }
            }

            //setTimeout(() => {
                for(let note of bars[nextBar]) {
                  note.audio.currentTime = 0;
                  note.audio.volume = maxVolume
                  note.audio.play();
                }
            //}, 100)
        }
    }

//  Focus the previous bar
    const decrementBar = () => {
        if(currentBar > 0) {
            setPlaying(false);
            let originalBar = currentBar;
            let nextBar = currentBar - 1
            setCurrentBar(nextBar);

            for(let note of bars[originalBar]) {
                if(note.audio.paused == false){
                    fadeOut(note.audio, 100);
                }
            }

            for(let pianoKey of pianoKeys) {
                if(pianoKey.audio.paused == false){
                    fadeOut(pianoKey.audio, 100);
                }
            }

            //setTimeout(() => {
                for(let note of bars[nextBar]) {
                    note.audio.currentTime = 0;
                    note.audio.volume = maxVolume
                    note.audio.play();
                }
            //}, 100)
        }
    }

//  Fade out audio using the input parameter as timing. 
//  Javascript has a significant amount of overhead on audio manipulations, so this takes longer than expected
   const fadeOut = (audio: HTMLAudioElement, milliseconds: number) =>{
        setTimeout(() => {
            audio.pause();
            setTimeout(() => {
                audio.currentTime = 0;
            }, 50);
        }, 100);
        /* let decrementer = audio.volume / 100;
        let decreaseVolume = setInterval(function(){
            if (audio.volume -  decrementer > 0) {
                console.log(audio.volume);
                audio.volume -= decrementer;
                decrementer = decrementer * 2;
            } else {
                clearInterval(decreaseVolume);
                audio.volume = 0;
                setTimeout(() => {
                    audio.pause();
                    audio.currentTime = 0;
                }, 17)

            }
        }, milliseconds / 100); */
    }

//  Begin rendering

    return (
      <div className = "app-container">
        <div className = "panel">
          <input className = "audio-slider"  type="range" defaultValue="60" onChange={(e) => setMaxVolume   (Number(e.target.value) / 100)} style={{backgroundSize: `${(maxVolume    * 100)}% 100%`}}/>
          <input className = "timing-slider" type="range" defaultValue="50" onChange={(e) => setPlayingSpeed(Number(e.target.value) / 100)} style={{backgroundSize: `${(playingSpeed * 100)}% 100%`}}/>

          <div className = "audio-header">VOLUME</div>
          <div className = "timing-header">SPEED</div>

          <div className = "key-mode-button panel-button"   onClick={() => switchMode()}>{keyMode == "major" ? "USE MINOR" : "USE MAJOR"}</div>
          <div className = "accidental-button panel-button" onClick={ changeAccidental }>{useSharps ? "USE FLATS" : "USE SHARPS"}</div>
          <div className = "reset-button panel-button"      onClick={(reset)}>RESET</div>


          <div className = {"playing-mode-button panel-button-binary" + (freeMode     ? " panel-button-binary-pressed" : "")} onClick={() => setFreeMode (!freeMode) }>FREE MODE</div>
          <div className = {"key-assist-button panel-button-binary"   + (keyAssist    ? " panel-button-binary-pressed" : "")} onClick={() => setKeyAssist(!keyAssist)}>KEY ASSIST</div>
          <div className = {"key-button panel-button-binary"          + (keySelection ? " panel-button-binary-pressed" : "")} onClick={() => handleKeyButton()       }>SELECT KEY</div>

          <div className = {"bar-button-decrement panel-button" + (currentBar == 0 ? " deactivated-button"          : "") } onClick={decrementBar}>◄ PREV CHORD</div>
          <div className = {"bar-button-increment panel-button" + (currentBar == 7 ? " deactivated-button"          : "") } onClick={incrementBar}>NEXT CHORD ►</div>
          <div className = {"play-button panel-button-binary"   + (playing == true ? " panel-button-binary-pressed" : "") } onClick={() => alterPlayState()}>▶</div>

          <div className = "staff-container">
            <div className = "chord-reel">
              {bars.map((bar, index) => {
                return <ChordSymbol 
                          key        = { index                }
                          notes      = { bar                  }
                          bar        = { index                }
                          tonalKey   = { tonalKey as TonalKey }
                          currentBar = { currentBar           } 
                        />
              })}
            </div>
            <div className = "staff">
              <Clef type = "treble" tonalKey = {tonalKey} />
              <Clef type = "bass"   tonalKey = {tonalKey} />
              {bars.map((bar, index)=> {
                return(
                  <div className = "bar-container" onClick={() => setCurrentBar(index)} style = {{left: (75 * index) + 45 + (tonalKey ? tonalKey.keySignatureOffset : 0)}} key = {index}>
                    <div className = "bar">
                        {bar.map(note => {
                        return <NoteComponent 
                                key             = { note.reactKey        }
                                bar             = { index                }
                                pitchClass      = { note.pitchClass      }
                                octave          = { note.octave          } 
                                offset          = { note.offset          }
                                tonalKey        = { tonalKey as TonalKey }
                                chromaticIndex  = { note.chromaticIndex  }
                                letterIndex     = { note.letterIndex     }
                                currentBar      = { currentBar           }
                                terminated      = { note.terminated      }
                            />
                        })}
                      </div>
                  </div>
                )
              })}
            </div>
            <div className = "analysis-reel">
              {bars.map((bar, index) => {
                return <RomanNumeral 
                    key        = { index                }
                    notes      = { bar                  } 
                    bar        = { index                } 
                    tonalKey   = { tonalKey as TonalKey } 
                    currentBar = { currentBar           } 
                  />
              })}
            </div>  
            </div>
            <div className = "panel-bottom" />
        </div>
        <div className = "keyboard-bottom" />
        <div className = "keyboard">
            <div className = "keyboard-shadow" />
          {pianoKeys.map(pianoKey => {
            return <Key 
                      key             = { pianoKey.reactKey        } 
                      index           = { pianoKey.index           }
                      type            = { pianoKey.type            } 
                      sharpPitchClass = { pianoKey.sharpPitchClass } 
                      flatPitchClass  = { pianoKey.flatPitchClass  } 
                      octave          = { pianoKey.octave          }
                      indent          = { pianoKey.indent          }
                      audio           = { pianoKey.audio           } 
                      useSharps       = { useSharps                }
                      keySelection    = { keySelection             }
                      tonalKey        = { tonalKey                 } 
                      keyJumps        = { keyJumps                 }  
                      activeKeys      = { activeKeys               } 
                      currentBar      = { currentBar               } 
                      freeMode        = { freeMode                 }
                      keyAssist       = { keyAssist                }
                      maxVolume       = { maxVolume                }          
                      addNote         = { addNote                  }
                      deleteNote      = { deleteNote               }
                      selectKey       = { selectKey                }  
                    />
          })}
        </div>
      </div>
    )
}

export default App

//  Generates the key objects use to map out the keyboard
function generateKeys() {
    var keys = [];
    var whiteIndex = 0;
    for(var i = 0; i < 48; i++){
        var note = chromaticScale[i % 12];

        let noteAudio    = new Audio(`./audio-files/${i}.mp3`)
        noteAudio.volume = 0.6;

        var key = {
            "sharpPitchClass": note.sharpPitchClass,
            "flatPitchClass" : note.flatPitchClass,
            "octave"         : Math.floor(i / 12),
            "type"           : note.type,
            "indent"         : note.type == "white" ? whiteIndex * 40 + whiteIndex : whiteIndex * 40 - 10 + whiteIndex,
            "index"          : i,
            "audio"          : noteAudio,
            "reactKey"       : note.sharpPitchClass + Math.floor(i / 12)
          };

        keys.push(key);

        if(note.type == "white") {
            whiteIndex++;
        }
    }

    return keys;
}
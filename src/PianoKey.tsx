import { useRef   } from 'react'
import { TonalKey } from './TonalKey';
import { modes    } from './Globals'

type props = {
    index: number
    type: string
    sharpPitchClass: string
    flatPitchClass: string
    octave: number
    indent: number
    audio: HTMLAudioElement
    keySelection: boolean;
    useSharps: boolean
    tonalKey: TonalKey | undefined
    keyJumps: number[]
    activeKeys: number[]
    currentBar: number
    freeMode: boolean;
    keyAssist: boolean;
    maxVolume:     number;
    addNote:    (pitchClass: string, octave: number, chromaticIndex: number, audio: HTMLAudioElement) => void;
    deleteNote: (octave: number, chromaticIndex: number) => void;
    selectKey: (tonic: string, tonicChromaticIndex: number, index: number) => void;
}

const fadeOut = (audio: HTMLAudioElement, milliseconds: number) =>{
    let decrementer = audio.volume / 60;
    let decreaseVolume = setInterval(function(){
        if (audio.volume - decrementer > 0) {
            audio.volume -= decrementer
        } else {
            clearInterval(decreaseVolume);
            audio.volume = 0;
            audio.pause();
            audio.currentTime = 0;
        }
    }, milliseconds / 60);
}

export function Key({index, type, useSharps, sharpPitchClass, flatPitchClass, octave, indent, addNote, deleteNote, keySelection, selectKey, tonalKey, keyJumps, activeKeys, currentBar, freeMode, audio, keyAssist, maxVolume} : props) {

//  Ref array allows press state to be tracked among the 8 bars
    const pressIndex      = useRef(new Array(8).fill(false));
    if(tonalKey == undefined) {
        for(let i = 0; i < pressIndex.current.length; i++){
            pressIndex.current[i] = false;
        }
    }

//  Ref array allows accidental present at the time of key press to persist
    const accidentalIndex = useRef(new Array(8).fill(useSharps));

    if(!pressIndex.current[currentBar]) {
        accidentalIndex.current[currentBar] = useSharps;
    }

    let activeKey = activeKeys.includes(index);

    let pitchClass          = (accidentalIndex.current[currentBar] ? sharpPitchClass : flatPitchClass).replace("♯", "").replace("♭", "");
    let alterPitchClass     = (accidentalIndex.current[currentBar] ? flatPitchClass : sharpPitchClass).replace("♯", "").replace("♭", "");
    let note           =  accidentalIndex.current[currentBar] ? sharpPitchClass : flatPitchClass;
    let chromaticIndex = index % 12;

    const handleClick = (e: any, rightClick: boolean) => {
        e.preventDefault()

    //  If the key selector is enabled, set the key. Otherwise, press or lift key
    
        if(keySelection == false) {

        //  If freemode is active, simply play the audio of the note. Otherwise, add it to the chord

            if(freeMode == false) {

                let newState = !pressIndex.current[currentBar];

                if(newState == true){
                    audio.volume = maxVolume;
                    audio.play();
                    addNote(rightClick == false ? pitchClass : alterPitchClass, octave, chromaticIndex, audio);
                    pressIndex.current[currentBar] = true;
                    accidentalIndex.current[currentBar] = rightClick == false ? useSharps : !useSharps;
                } else {
                    fadeOut(audio, 300)
                    deleteNote(octave, chromaticIndex);
                    pressIndex.current[currentBar] = false;
                    accidentalIndex.current[currentBar] = useSharps;
                }

            } else {
                let newAudio = new Audio(audio.src);
                newAudio.volume = maxVolume;
                newAudio.play();
            }

        } else {
            selectKey(pitchClass, chromaticIndex, index);
        }
    }

//  Determine whether key is diatonic or not based on the current key's mode
    let diatonicKey = false;
    if(tonalKey !== undefined){
        for(let interval of modes[tonalKey.mode]){
            if(index % 12 == ((tonalKey.index + interval) % 12)){
                diatonicKey = true;
                break;
            }
        }
    }
 

    return(
        <div className={`key-container-${type}` + (keyJumps.includes(index) ? " key-jump" : "") + (freeMode ? " free-mode" : "")} style={{left: indent}}>
            <div 
                className={`key ${type}` + (pressIndex.current[currentBar] && freeMode == false    ? ` ${type}-pressed` : "")
                        +                  (diatonicKey && activeKey && !keySelection && keyAssist ? ` key-shadow-diatonic-${type}` : "")
                        + (!pressIndex.current[currentBar] && currentBar > 0 && pressIndex.current[currentBar - 1] ? ` ${type}-adjacent` : "")} 
                onClick={(e) => handleClick(e, false)}
                onContextMenu={(e) => handleClick(e, true)}
            >
                <div className={`${type}-label`  + (pressIndex.current[currentBar] && freeMode == false ? " label-pressed" : "") + (diatonicKey && activeKey && !keySelection && keyAssist ? ` label-shadow-diatonic-${type}` : "")}>
                    {note}
                </div>
            </div>
            <div className={`key-shadow-${type}` + (pressIndex.current[currentBar] && freeMode == false ? " key-depressed" : "")} />
        </div>
    )
}
import { pitchClasses       } from './Globals.tsx'
import { pitchClassSequence } from './Globals.tsx'
import { TonalKey           } from './TonalKey.tsx'

type props = {
    bar: number
    pitchClass: string
    octave: number
    offset: number
    tonalKey: TonalKey
    chromaticIndex: number
    letterIndex: number
    currentBar: number;
    terminated: boolean;
}

export function NoteComponent({bar, pitchClass, octave, offset, chromaticIndex, tonalKey, letterIndex, currentBar, terminated} : props) {

    let topOffset  = pitchClasses.indexOf(pitchClass) * 4 + 34 + (7 * 4 * octave);
    let leftOffset = 10 + (offset * 12);

    let keyAlteration = tonalKey.chromaticAlterations[pitchClass];
    let accidentalText = "";
    let chromaticAlteration = chromaticIndex - (pitchClassSequence[letterIndex] + keyAlteration)  

    switch(chromaticAlteration){
        case 1:
            if(tonalKey.sharps == true) {
                keyAlteration ==  1 ? accidentalText = "x" : accidentalText = "♯";
            } else {
                keyAlteration == -1 ? accidentalText = "♮" : accidentalText = "♯";
            }
            break;

        case 2: 
            if(tonalKey.sharps == true) {
                accidentalText = "x";
            } else {
                keyAlteration == -1 ? accidentalText = "♯" : accidentalText = "x";
            }
            break;

        case -1:
            if(tonalKey.sharps == true) {
                keyAlteration ==  1 ? accidentalText = "♮" : accidentalText = "♭";
            } else {
                keyAlteration == -1 ? accidentalText = "♭♭" : accidentalText = "♭";
            }
            break;

        case -2: 
            if(tonalKey.sharps == true) {
                keyAlteration ==  1 ? accidentalText = "♭" : accidentalText = "♭♭";
            } else {
                keyAlteration == -1 ? accidentalText = "♭♭♭" : accidentalText = "♭♭";
            }
    }

    if(offset > 0) {
        leftOffset += (10 * accidentalText.length);
    }

    let accidentalOffset = 0;
    if(accidentalText.includes("♭")){
        accidentalOffset = -5;
    } 
    
    return(
        <div className={"note" + (bar == currentBar ? " current-bar" : "") + (terminated ? " terminated-note" : "")} style={{top: 143 - topOffset, left: leftOffset}}>
            {accidentalText != "" && <div className="accidental" style={{right: 15 * accidentalText.length, top: accidentalOffset}}>{accidentalText}</div>}
        </div>
    )
}
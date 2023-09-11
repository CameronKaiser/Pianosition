import { sharpsSignatureMap } from './Globals.tsx'
import { flatsSignatureMap  } from './Globals.tsx'
import { TonalKey           } from './TonalKey.tsx'

    type props = {
        type      : string
        tonalKey : TonalKey | undefined
    }

    export function Clef({type, tonalKey} : props) {

        if(tonalKey === undefined){
            return <div className={`${type}-clef`} />
        }

        let signatureMap: {[key: string]: {top: number; left: number}} = tonalKey.sharps ? sharpsSignatureMap : flatsSignatureMap;
        let signatureAccidentals = [];

        for(let note in tonalKey.chromaticAlterations) {

            let alteration = tonalKey.chromaticAlterations[note];

            if(alteration != 0) {
                signatureAccidentals.push({
                    "letter": note,
                    "text"  : tonalKey.sharps ? "♯" : "♭",
                    "top"   : type == "treble" ? signatureMap[note].top : signatureMap[note].top - 4,
                    "left"  : signatureMap[note].left,
                });
            }
        }

        return(
            <div className={`${type}-clef`}>
                {signatureAccidentals.map(note => {
                    return <div className="signature-accidental" style={{top: note.top, left: note.left}} key={note.letter}>{note.text}</div>
                })}
            </div>
        )

    }
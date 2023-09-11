import { TonalKey      } from './TonalKey.tsx'
import { Note          } from './Note.tsx'
import { analyzeChord  } from './ChordAnalyzer.tsx'
import { AnalyzedChord } from './ChordAnalyzer.tsx'

    type props = {
        notes: Note[]
        tonalKey : TonalKey
        bar: number;
        currentBar: number;
    }

    type AugmentedSixths = {[key: string]: string}
    let augmentedSixths: AugmentedSixths = {
        "germanSixth": "Ger",
        "frenchSixth": "Fr",
        "italianSixth": "It"
    }

    export function RomanNumeral({notes, tonalKey, bar, currentBar} : props) {

        let leftOffset = 75 * bar + 33 + (tonalKey ? tonalKey.keySignatureOffset : 0);
        let lineHeight =  3;
        let fontSize   = 19;

        if(notes.length == 0) {
            if(currentBar != bar){
                return;
            }
            return (
                <div className={"analysis" + (bar == currentBar ? " current-bar" : "")} style={{left: leftOffset}}>
                    ...
                </div>
            )
        }

        let analyzedChord: AnalyzedChord = analyzeChord(notes, tonalKey);

        if(analyzedChord.nature != undefined) {
            let augmentedSixth = augmentedSixths[analyzedChord.nature];
            if(augmentedSixth != undefined) {

            //  Augmented Sixth chords call for specific notation, possibly including a foreunner

                let forerunner = "";
                if(analyzedChord.forerunner != undefined){
                    forerunner = " / " + analyzedChord.forerunner;
                }

                let lengthString = augmentedSixth + "+" + forerunner;

                fontSize   = lengthString.length >= 10 ? 15 : 19;
                lineHeight = lengthString.length >= 10 ?  4 :  3;

                return(
                    <div className="analysis" style={{left: leftOffset + 5, fontSize: fontSize, lineHeight: lineHeight}}>
                        {augmentedSixth}<sup>+6</sup>
                        {forerunner}
                    </div>
                )
            }
        }

        let extendedQuality = undefined;
        let extendedQualityString = "";
        switch(analyzedChord.thirdQuality){
            case "minor": 
                if(analyzedChord.seventhQuality == "halfDiminished") {
                    extendedQuality = <sup><span style={{fontSize: 11, marginLeft: 1}}>ø</span></sup>;
                    extendedQualityString = "ø";
                }
                break;

            case "major": 
                break;
                
            case "diminished":
                analyzedChord["function"] = analyzedChord["function"] + "°";
                extendedQualityString = "°";
                break;
                
            case "halfDiminished": 
                extendedQuality = <sup><span style={{fontSize: 11, marginLeft: 1}}>ø</span></sup>;
                extendedQualityString = "ø";
                break;
    
            case "augmented": 
                extendedQuality = <sup>+</sup>;
                extendedQualityString = "+";
        }

        let intervals = analyzedChord.intervals;
        let intervalsElement =  <div className="interval-container">
                                    <span className="upper-interval">{intervals.upper}</span>
                                    <span className="lower-interval">{intervals.lower}</span>
                                </div>

        let forerunner = "";
        if(analyzedChord.forerunner != undefined){
            forerunner = " / " + analyzedChord.forerunner;
        }

        let lengthString = analyzedChord.alteration + analyzedChord.function + extendedQualityString + intervals.upper + intervals.lower + forerunner

        fontSize   = lengthString.length >= 11 ? 15 : 19;
        lineHeight = lengthString.length >= 11 ?  4 :  3;

        return(
            <div className={"analysis" + (bar == currentBar ? " current-bar" : "")} style={{left: leftOffset, fontSize: fontSize, lineHeight: lineHeight}}>
                {analyzedChord.function}
                {extendedQuality}
                {intervalsElement}
                {forerunner}
            </div>
        )

    }
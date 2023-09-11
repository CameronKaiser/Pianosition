import { Note     } from './Note.tsx'
import { TonalKey } from './TonalKey.tsx'

export interface RomanNumeral { notes: Note[], tonalKey: TonalKey | undefined, bar: number}
export interface ChordSymbol  { notes: Note[], tonalKey: TonalKey | undefined, bar: number}
export interface StaffLine {
    pitchClass    : string;
    notes         : Note[];
    verticalOffset: number;
    previousLine  : StaffLine | undefined;
    nextLine      : StaffLine | undefined;
}
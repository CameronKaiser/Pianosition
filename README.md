   ~ Pianosition ~

This app is meant to help musicians or anyone interested explore new chord progressions and learn
the theory behind them. It analyzes chords in both Chord Symbol and Roman Numeral fashion, helping
theoreticians familiarize themselves with more playing-oriented notation, and helping players 
familiarize themselves with more analytically-oriented notation. It also serves as a creation hub
for short chord progressions, making it useful for formulating ideas. Lastly, it serves as an
educational asset, allowing for fast and easy chord notation and analysis that can then be shared
online or with cohorts. 

Technical Information:
This app was created using React and Typescript. It requires about 5mb of data on initial load due
to the audio files that have been compressed to mp3.

Tips:
Right clicking any key will add its accidental-twin to the chord. For example, in C minor you may
right click Gb to add the note F# when building an augmented sixth chord.
The seafoam-colored notes indicate the notes used in the last bar, which can be a helpful guide
for voice leading.

Warnings:
Audio in Javascript is mostly an afterthought, and as such, there is a lot of overhead in volume
adjustments. Being a speedy-demon may result in audio glitches. Additionally, fadeOut functionality
is temporarily disabled while I port over to a better audio framework, since even incremental 
audio transition with care results in massive crackling.

The analysis is not guaranteed to be correct. Complex constructs can give the algorithm a hard
time, so always double check its results before using them.
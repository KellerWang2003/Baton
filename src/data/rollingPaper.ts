// Rolling Paper (Figma ROLLING PAPER_coming out1 315:8430, coming out2
// 267:3706, complete 267:3761 and select 267:4925, NEW YORK page): the notes
// friends left Chloe on her Instagram tag, printed out of the Dynamic Island
// as one long sheet. Positions are in the 402pt Figma frame of the complete
// sheet (y from the top of the frame, status bar included). Doodles are in
// public/rolling-paper/.

export type PaperNoteColor = 'pink' | 'yellow' | 'blue' | 'olive'

export type PaperNote = {
  name: string
  text: string
  color: PaperNoteColor
  // Center of the 104pt note and its tilt
  cx: number
  cy: number
  rotate: number
}

export const rollingPaper = {
  title: ['From 18 friends,', 'with love'],
  completed: 'Completed on 12.15.2026',
}

// The sheet once it has printed (Figma complete): 362pt wide, 20pt from the
// sides, starting 80pt down. Taller than the 898pt in Figma so the last note
// stays on it.
export const paperSheet = { left: 20, top: 80, width: 362, height: 920 }

// Where the sheet comes out: just under the top of the expanded island
export const paperSlotY = 51

// In paint order (later notes sit on top)
export const paperNotes: PaperNote[] = [
  { name: 'Gayoung', color: 'pink', cx: 113.75, cy: 245.75, rotate: 9.34, text: '언니 엘에이 떠난다니까 아쉽다ㅠㅠ 곧 놀러갈게! 맛있는 데 많이 알아놔줘' },
  { name: 'Yuna', color: 'olive', cx: 299.8, cy: 242.8, rotate: -16.79, text: 'Remember: the subway is NOT the 110 at rush hour. It’s worse. 😂' },
  { name: 'Leo', color: 'yellow', cx: 229.4, cy: 361.4, rotate: 7.58, text: 'Promise you won’t start saying “the city” like it’s the only one.' },
  { name: 'Sora', color: 'blue', cx: 104.77, cy: 375.77, rotate: -6.77, text: 'LA won’t be the same without you. Call me when you miss the sun (so, every day in February).' },
  { name: 'Jiwoo', color: 'blue', cx: 305.4, cy: 477.4, rotate: -6.29, text: '수고했어 Chloe! (You did so well!) New York is lucky. 🥹' },
  { name: 'Jisoo', color: 'pink', cx: 113.04, cy: 503.04, rotate: 9.73, text: 'First snow in New York, send me a photo!! ☃️' },
  { name: 'Priya', color: 'blue', cx: 221, cy: 593, rotate: 0, text: 'Can’t wait to see what you make next. Your portfolio is going to be unreal.' },
  { name: 'Ethan', color: 'pink', cx: 300.02, cy: 704.02, rotate: -7.09, text: 'Who’s going to judge my kerning now?? Rude.' },
  { name: 'Gabe', color: 'yellow', cx: 99.7, cy: 632.7, rotate: -6.69, text: '加油!! Don’t forget about us West Coast people.' },
  { name: 'Ava', color: 'olive', cx: 165.46, cy: 752.46, rotate: 11.69, text: 'Miss you already. ❤️' },
  { name: 'Jenna', color: 'yellow', cx: 274.44, cy: 826.44, rotate: 7.62, text: 'Chloe!! I can’t believe our late nights in the studio are over. Thank you for every 2am snack run. New York is so lucky to have you. 💙' },
  { name: 'Keller', color: 'blue', cx: 100.53, cy: 864.53, rotate: -7.75, text: 'From strangers in first term to this. So proud of you, Chloe.' },
  { name: 'Hana', color: 'pink', cx: 215, cy: 932, rotate: 0, text: 'Congrats on the new job!! You earned every bit of it 🎉' },
]

// Hand-drawn hearts, stars and the loop across the sheet, cut from one
// sprite sheet (box and crop in % of the box, from the sheet's top-left)
export const paperDoodles = {
  src: '/rolling-paper/doodles.png',
  width: 362,
  height: 794,
  crop: { w: 167.96, h: 110.19, left: -33.98, top: -9.76 },
}

import type { CloudCategory } from '../ui'

// A photo from the Archive photo cloud, opened (Figma ARCHIVE_selected,
// 236:234, ARCHIVE_selected2 334:11995, ARCHIVE_selected3 334:12028): the
// daily prompt it answered, the photo in a glass circle tinted
// with its filter's color, where and when, and what she wrote. Keyed by the
// photo's cloud image (src in archiveCloud.ts); photos without a moment here
// don't open. Full-size photos are in public/archive/moments/, cropped square
// as Figma shows them; the Echo Park and Silver Lake moments still use their
// small cloud crops until the originals arrive.
export type ArchiveMoment = {
  prompt: number
  question: string
  photo: string
  category: CloudCategory
  place: string
  time: string
  note: string
  // The note's tilt in degrees (Figma's -4.41 unless the frame tilts it otherwise)
  tilt?: number
  // A short question that sits on one line instead of wrapping at 232pt
  oneLine?: boolean
}

export const archiveMoments: Record<string, ArchiveMoment> = {
  '/archive/la-cloud/3061.jpg': {
    prompt: 13,
    question: 'Where did you go today that you’ll miss?',
    photo: '/archive/moments/granite-falls.jpg',
    category: 'feeling',
    place: 'Granite Falls',
    time: '1:34 pm | July 25.2026',
    note: 'I went hiking with Jake today, it was very cold but honestly a very refreshing temp to be hiking in. The lake view was absolutely amazing and I thoroughly enjoyed my meat stick on this rock. I look like a child but that’s what I like about this photo haha',
  },
  '/archive/la-cloud/19.jpg': {
    prompt: 21,
    question: 'Write down the name of someone you see here all the time.',
    photo: '/archive/la-cloud/19.jpg',
    category: 'people',
    place: 'Echo Park',
    time: '9:12 am | Aug 30.2026',
    note: 'Jenna. She has helped me move every single year since freshman year, and today she made me pose in the empty truck before we loaded anything. Four apartments, one Jenna. Not sure who carries my boxes in New York.',
  },
  '/archive/la-cloud/5306.jpg': {
    prompt: 27,
    question: 'Write one tip about this place that took you months to learn.',
    photo: '/archive/la-cloud/5306.jpg',
    category: 'places',
    place: 'Silver Lake',
    time: '6:58 pm | Sep 14.2026',
    note: 'The roof door in my building is never locked after 6. Nobody else goes up. Get there around 7 and the palms line up right in front of the sunset. Took me two years to find out, whoever lives here next, you’re welcome.',
  },
  '/archive/la-cloud/6330.jpg': {
    prompt: 22,
    question: 'Who made today feel lucky?',
    oneLine: true,
    photo: '/archive/moments/artcenter-hillside.jpg',
    category: 'people',
    place: 'ArtCenter Hillside',
    time: '2:49 pm | Oct 18.2026',
    note: 'Day four of the contest. We filmed our interviews for the final video, first at 950, then up at hillside for a better backdrop. The sun was on our side. Talking to the camera turned out way more fun than i expected, and i feel so lucky to be on this team.',
    tilt: 4.85,
  },
  '/archive/la-cloud/5706.jpg': {
    prompt: 36,
    question: 'Where did you finally slow down?',
    photo: '/archive/moments/palm-springs.jpg',
    category: 'places',
    place: 'Palm Springs',
    time: '9:11 am | Sep 28.2026',
    note: 'My first time in Palm Springs. There were way more palm trees than in LA, and the desert heat hit the second we stepped outside. The pool made it all worth it. We spent the whole day lounging, eating really good food, and doing absolutely nothing, which was exactly what I needed. I already want to go back.',
  },
  // Seoul (Figma ARCHIVE_Seoul selected1-3, 472:1414, 472:1636, 472:2099)
  '/archive/seoul-cloud/karaoke.jpg': {
    prompt: 9,
    question: 'When did home feel new again?',
    photo: '/archive/moments/seoul-karaoke.jpg',
    category: 'people',
    place: 'Anguk',
    time: '1:20 am | June 13.2022',
    note: 'Its been a week in since Bri and Jesse came to Seoul, it’s been busy 3 days of going around and showing them the best parts of the city. We went to karaoke after getting street food in Anguk. These are the moments I feel so blessed to have studied abroad, to have friends I can guide in my home city is such a special experience.',
    tilt: 4.85,
  },
  '/archive/seoul-cloud/5387.jpg': {
    prompt: 15,
    question: 'What did a stranger get right today?',
    photo: '/archive/moments/goseong-lunch.jpg',
    category: 'places',
    place: 'Goseong',
    time: '11:32 am | Aug 17.2022',
    note: 'We went on a family trip to Gangwondo, the focus was around food. We went to a place called 콩새식당, it was recommended to us by an uber driver and it was SO GOOD. The fish main dish was nothing like anything I’ve had before and all the side dishes tasted home made. We were so happy.',
  },
  '/archive/seoul-cloud/5975.jpg': {
    prompt: 28,
    question: 'What never gets old?',
    photo: '/archive/moments/itaewon-sunset.jpg',
    category: 'feeling',
    place: 'Itaewon',
    time: '7:13 pm | May 04.2023',
    note: 'The weather in Seoul before the heat and humidity hits is the best time be out and about. Its not too hot and the sun sets at a reasonably late time so you see these beautiful sunsets. I’ll never get sick of it.',
    tilt: 4.85,
  },
}
